import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { StatusKey } from '@/components/dashboard';
import type { IOrderItem } from '@/services/OrderAPI';

type UpdateFields = Partial<{
  customerName: string;
  phone: string;
  address: string;
  price: number;
  notes: string;
  status: StatusKey;
  items: IOrderItem[];
}>;

interface StockTarget {
  productId: string;
  variantId?: string;
  qty: number;
}

function stockKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

/** Map compound-key → stock held by this order (empty when cancelled) */
function heldStock(items: IOrderItem[], status: StatusKey): Map<string, StockTarget> {
  if (status === 'cancel') return new Map();
  const map = new Map<string, StockTarget>();
  for (const item of items) {
    if (!item.productId) continue;
    const key = stockKey(item.productId, item.variantId);
    const existing = map.get(key);
    if (existing) existing.qty += item.quantity;
    else map.set(key, { productId: item.productId, variantId: item.variantId, qty: item.quantity });
  }
  return map;
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

    const { orderId, fields } = (await req.json()) as { orderId: string; fields: UpdateFields };
    if (!orderId) return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 });

    await adminDb.runTransaction(async (txn) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderSnap = await txn.get(orderRef);
      if (!orderSnap.exists) throw new Error('Đơn hàng không tồn tại');

      const order = orderSnap.data()!;
      const prevStatus = order.status as StatusKey;
      const prevItems = (order.items ?? []) as IOrderItem[];

      const newStatus: StatusKey = fields.status ?? prevStatus;
      const newItems: IOrderItem[] = fields.items ?? prevItems;

      const prevHeld = heldStock(prevItems, prevStatus);
      const newHeld = heldStock(newItems, newStatus);

      // delta > 0 = restore stock, delta < 0 = deduct more
      const allKeys = new Set([...prevHeld.keys(), ...newHeld.keys()]);
      const deltaMap = new Map<string, { productId: string; variantId?: string; delta: number }>();
      for (const key of allKeys) {
        const prev = prevHeld.get(key);
        const next = newHeld.get(key);
        const d = (prev?.qty ?? 0) - (next?.qty ?? 0);
        if (d !== 0) {
          deltaMap.set(key, {
            productId: (prev ?? next)!.productId,
            variantId: prev?.variantId ?? next?.variantId,
            delta: d,
          });
        }
      }

      // Phase 1: Read all affected products
      const uniqueProductIds = [...new Set([...deltaMap.values()].map(t => t.productId))];
      const productSnaps = uniqueProductIds.length > 0
        ? await Promise.all(uniqueProductIds.map(id => txn.get(adminDb.collection('products').doc(id))))
        : [];
      const productSnapMap = new Map(uniqueProductIds.map((id, i) => [id, productSnaps[i]]));

      // Phase 2: Validate deductions
      for (const [, { productId, variantId, delta }] of deltaMap) {
        if (delta >= 0) continue;
        const snap = productSnapMap.get(productId);
        if (!snap?.exists) continue;
        const d = snap.data()!;
        if (variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[variantId];
          if (vd?.stock !== undefined && (vd.stock as number) + delta < 0) {
            throw new Error(`Không đủ hàng: "${d.name} — ${vd.name}" chỉ còn ${vd.stock}`);
          }
        } else {
          if (d.stock !== undefined && (d.stock as number) + delta < 0) {
            throw new Error(`Không đủ hàng: "${d.name}" chỉ còn ${d.stock}`);
          }
        }
      }

      // Phase 3: Aggregate updates per product document (avoid transaction conflicts)
      const productUpdateMap = new Map<string, Record<string, unknown>>();
      for (const [, { productId, variantId, delta }] of deltaMap) {
        const snap = productSnapMap.get(productId);
        if (!snap?.exists) continue;
        const d = snap.data()!;
        const updates = productUpdateMap.get(productId) ?? { updatedAt: new Date() };
        if (variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[variantId];
          if (vd?.stock !== undefined) {
            updates[`variants.${variantId}.stock`] = FieldValue.increment(delta);
          }
        } else if (d.stock !== undefined) {
          updates.stock = FieldValue.increment(delta);
        }
        productUpdateMap.set(productId, updates);
      }
      for (const [pid, updates] of productUpdateMap) {
        txn.update(adminDb.collection('products').doc(pid), updates);
      }

      // Phase 4: Update order document
      const payload: Record<string, unknown> = { updatedAt: new Date() };
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) payload[k] = v;
      }
      txn.update(orderRef, payload);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[update-order]', err);
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
