import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { stockKey, resolveProductBom } from '@/utils/bom';
import type { StatusKey } from '@/components/dashboard';
import type { IOrderItem } from '@/services/OrderAPI';

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDb = getAdminDb();

    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 });

    // Phase 1: Hoàn kho (nếu đơn chưa hủy) + xóa document đơn — trong transaction
    await adminDb.runTransaction(async (txn) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderSnap = await txn.get(orderRef);
      if (!orderSnap.exists) throw new Error('Đơn hàng không tồn tại');

      const order = orderSnap.data()!;
      const status = order.status as StatusKey;
      const items = (order.items ?? []) as IOrderItem[];

      // Đơn đã hủy thì kho đã được hoàn trước đó → chỉ xóa.
      if (status === 'cancel') {
        txn.delete(orderRef);
        return;
      }

      // Gộp số lượng theo từng target (product / variant)
      const stockTargets = new Map<string, { productId: string; variantId?: string; qty: number }>();
      for (const item of items) {
        if (!item.productId) continue;
        const key = stockKey(item.productId, item.variantId);
        const existing = stockTargets.get(key);
        if (existing) existing.qty += item.quantity;
        else stockTargets.set(key, { productId: item.productId, variantId: item.variantId, qty: item.quantity });
      }

      const uniqueProductIds = [...new Set([...stockTargets.values()].map(t => t.productId))];
      const productSnaps = uniqueProductIds.length > 0
        ? await Promise.all(uniqueProductIds.map(id => txn.get(adminDb.collection('products').doc(id))))
        : [];
      const productSnapMap = new Map(uniqueProductIds.map((id, i) => [id, productSnaps[i]]));

      // Gom BOM → linh kiện; target có BOM hoàn linh kiện, còn lại hoàn tồn thành phẩm.
      const componentTargets = new Map<string, number>();
      const bomKeys = new Set<string>();
      for (const [key, target] of stockTargets) {
        const snap = productSnapMap.get(target.productId);
        if (!snap?.exists) continue;
        const bom = resolveProductBom(snap.data()!, target.variantId);
        if (bom.length === 0) continue;
        bomKeys.add(key);
        for (const line of bom) {
          componentTargets.set(line.componentId, (componentTargets.get(line.componentId) ?? 0) + line.qty * target.qty);
        }
      }

      // --- Writes ---
      txn.delete(orderRef);

      const productUpdateMap = new Map<string, Record<string, unknown>>();
      for (const [key, target] of stockTargets) {
        if (bomKeys.has(key)) continue;
        const snap = productSnapMap.get(target.productId);
        if (!snap?.exists) continue;
        const d = snap.data()!;
        const updates = productUpdateMap.get(target.productId) ?? { updatedAt: new Date() };
        if (target.variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[target.variantId];
          if (vd?.stock !== undefined) {
            updates[`variants.${target.variantId}.stock`] = FieldValue.increment(target.qty);
          }
        } else if (d.stock !== undefined) {
          updates.stock = FieldValue.increment(target.qty);
        }
        productUpdateMap.set(target.productId, updates);
      }
      for (const [pid, updates] of productUpdateMap) {
        txn.update(adminDb.collection('products').doc(pid), updates);
      }

      for (const [componentId, qty] of componentTargets) {
        txn.update(adminDb.collection('components').doc(componentId), {
          stock: FieldValue.increment(qty),
          updatedAt: new Date(),
        });
      }
    });

    // Phase 2: Dọn dữ liệu liên quan (cards, cardAuth, cardViews, memorial) — best-effort
    const cardSnaps = await adminDb.collection('cards').where('orderId', '==', orderId).get();
    await Promise.all(
      cardSnaps.docs.map(async (cardDoc) => {
        const cardId = cardDoc.id;
        await adminDb.collection('cardAuth').doc(cardId).delete().catch(() => null);
        const viewSnaps = await adminDb.collection('cardViews').where('cardId', '==', cardId).get();
        await Promise.all(viewSnaps.docs.map(v => v.ref.delete()));
        await cardDoc.ref.delete();
      }),
    );
    await adminDb.collection('memorials').doc(orderId).delete().catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[delete-order]', err);
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
