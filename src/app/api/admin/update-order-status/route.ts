import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { StatusKey } from '@/components/dashboard';
import type { IOrderItem } from '@/services/OrderAPI';

function stockKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDb = getAdminDb();

    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId, newStatus } = (await req.json()) as { orderId?: string; newStatus?: StatusKey };
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Thiếu orderId hoặc newStatus' }, { status: 400 });
    }

    await adminDb.runTransaction(async (txn) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderSnap = await txn.get(orderRef);
      if (!orderSnap.exists) throw new Error('Đơn hàng không tồn tại');

      const order = orderSnap.data()!;
      const prevStatus = order.status as StatusKey;

      if (prevStatus === newStatus) return;

      const items = (order.items ?? []) as IOrderItem[];

      // Build compound-key stock targets
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

      txn.update(orderRef, { status: newStatus, updatedAt: new Date() });

      const shouldRestoreStock = newStatus === 'cancel' && prevStatus !== 'cancel';
      const shouldDeductStock  = prevStatus === 'cancel' && newStatus !== 'cancel';

      if (!shouldRestoreStock && !shouldDeductStock) return;
      const multiplier = shouldRestoreStock ? 1 : -1;

      // Validate when deducting
      if (shouldDeductStock) {
        for (const [, { productId, variantId, qty }] of stockTargets) {
          const snap = productSnapMap.get(productId);
          if (!snap?.exists) continue;
          const d = snap.data()!;
          if (variantId) {
            const vd = (d.variants as Record<string, Record<string, unknown>>)?.[variantId];
            if (vd?.stock !== undefined && (vd.stock as number) - qty < 0) {
              throw new Error(`Không đủ hàng: "${d.name} — ${vd.name}" chỉ còn ${vd.stock}`);
            }
          } else {
            if (d.stock !== undefined && (d.stock as number) - qty < 0) {
              throw new Error(`Không đủ hàng: "${d.name}" chỉ còn ${d.stock}`);
            }
          }
        }
      }

      // Aggregate updates per product document
      const productUpdateMap = new Map<string, Record<string, unknown>>();
      for (const [, { productId, variantId, qty }] of stockTargets) {
        const snap = productSnapMap.get(productId);
        if (!snap?.exists) continue;
        const d = snap.data()!;
        const updates = productUpdateMap.get(productId) ?? { updatedAt: new Date() };
        if (variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[variantId];
          if (vd?.stock !== undefined) {
            updates[`variants.${variantId}.stock`] = FieldValue.increment(multiplier * qty);
          }
        } else if (d.stock !== undefined) {
          updates.stock = FieldValue.increment(multiplier * qty);
        }
        productUpdateMap.set(productId, updates);
      }
      for (const [pid, updates] of productUpdateMap) {
        txn.update(adminDb.collection('products').doc(pid), updates);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[update-order-status]', err);
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
