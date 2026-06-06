import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { IOrderItem } from '@/services/OrderAPI';

function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD${y}${m}${d}${rand}`;
}

async function hashPhone(phone: string): Promise<string> {
  let n = phone.replace(/\D/g, '');
  if (n.startsWith('84')) n = '0' + n.slice(2);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(n));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Compound key: phân biệt variant với product-level stock */
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

    const body = (await req.json()) as {
      customerName?: string;
      phone?: string;
      address?: string;
      notes?: string;
      items?: IOrderItem[];
      shippingFee?: number;
      shippingRateName?: string;
    };

    const { customerName, phone, address, notes, items = [], shippingFee, shippingRateName } = body;

    if (!customerName?.trim()) return NextResponse.json({ error: 'Thiếu tên khách hàng' }, { status: 400 });
    if (items.length === 0) return NextResponse.json({ error: 'Đơn hàng phải có ít nhất 1 sản phẩm' }, { status: 400 });

    const hasNfc = items.some(i => i.isNfc);
    if (hasNfc && !phone?.trim()) {
      return NextResponse.json({ error: 'Cần số điện thoại cho đơn có móc khóa NFC' }, { status: 400 });
    }

    // Serialize items (strip undefined)
    const cleanedItems = items.map(item => {
      const base: Record<string, unknown> = {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        isNfc: item.isNfc,
      };
      if (item.productId) base.productId = item.productId;
      if (item.variantId) base.variantId = item.variantId;
      if (item.variantName) base.variantName = item.variantName;
      if (item.templateId) base.templateId = item.templateId;
      if (item.addonNames?.length) base.addonNames = item.addonNames;
      if (item.presetPhotoUrl) base.presetPhotoUrl = item.presetPhotoUrl;
      if (item.printConfig?.enabled) {
        const cfg: Record<string, unknown> = { enabled: true };
        if (item.printConfig.shape) cfg.shape = item.printConfig.shape;
        if (item.printConfig.width != null) cfg.width = item.printConfig.width;
        if (item.printConfig.height != null) cfg.height = item.printConfig.height;
        if (item.printConfig.diameter != null) cfg.diameter = item.printConfig.diameter;
        base.printConfig = cfg;
      }
      return base;
    });

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const totalPrice = subtotal + (shippingFee ?? 0);
    const orderId = generateOrderId();

    // Build chip list
    let chipCounter = 0;
    const chipList: { id: string; templateId: string }[] = [];
    for (const item of items) {
      if (item.isNfc) {
        for (let i = 0; i < item.quantity; i++) {
          chipCounter++;
          chipList.push({ id: `${orderId}C${chipCounter}`, templateId: item.templateId ?? 'birthday' });
        }
      }
    }

    const phoneHash = hasNfc && phone ? await hashPhone(phone.trim()) : null;

    // Aggregate qty per stock target (productId + optional variantId)
    const stockTargets = new Map<string, { productId: string; variantId?: string; qty: number }>();
    for (const item of items) {
      if (!item.productId) continue;
      const key = stockKey(item.productId, item.variantId);
      const existing = stockTargets.get(key);
      if (existing) existing.qty += item.quantity;
      else stockTargets.set(key, { productId: item.productId, variantId: item.variantId, qty: item.quantity });
    }

    const uniqueProductIds = [...new Set([...stockTargets.values()].map(t => t.productId))];

    await adminDb.runTransaction(async (txn) => {
      const now = new Date();

      // Phase 1: Read all referenced products
      const productSnaps = uniqueProductIds.length > 0
        ? await Promise.all(uniqueProductIds.map(id => txn.get(adminDb.collection('products').doc(id))))
        : [];
      const productSnapMap = new Map(uniqueProductIds.map((id, i) => [id, productSnaps[i]]));

      // Phase 2: Validate
      for (const [, target] of stockTargets) {
        const snap = productSnapMap.get(target.productId);
        if (!snap?.exists) throw new Error(`Sản phẩm không tồn tại`);
        const d = snap.data()!;

        if (d.status === 'archived') throw new Error(`"${d.name}" đã ngừng bán`);

        if (target.variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[target.variantId];
          if (!vd) throw new Error(`Biến thể không tồn tại trong "${d.name}"`);
          if (vd.stock !== undefined && (vd.stock as number) < target.qty) {
            throw new Error(`Không đủ hàng: "${d.name} — ${vd.name}" chỉ còn ${vd.stock}`);
          }
        } else {
          if (d.stock !== undefined && (d.stock as number) < target.qty) {
            throw new Error(`Không đủ hàng: "${d.name}" chỉ còn ${d.stock}`);
          }
        }
      }

      // Phase 3: Write order + cards
      txn.set(adminDb.collection('orders').doc(orderId), {
        customerName: customerName.trim(),
        phone: (phone ?? '').trim(),
        address: (address ?? '').trim(),
        price: totalPrice,
        ...(shippingFee !== undefined ? { shippingFee } : {}),
        ...(shippingRateName ? { shippingRateName } : {}),
        status: 'new',
        source: 'local',
        items: cleanedItems,
        notes: (notes ?? '').trim(),
        customized: false,
        createdAt: now,
        updatedAt: now,
      });

      for (const chip of chipList) {
        txn.set(adminDb.collection('cards').doc(chip.id), {
          orderId, status: 'assigned', hasContent: false,
          templateId: chip.templateId, stats: { totalViews: 0 }, createdAt: now, updatedAt: now,
        });
        if (phoneHash) {
          txn.set(adminDb.collection('cardAuth').doc(chip.id), {
            phoneHash, failCount: 0, lockedUntil: null, createdAt: now, updatedAt: now,
          });
        }
      }

      // Phase 4: Decrement stock (aggregate per product để tránh conflict)
      const productUpdateMap = new Map<string, Record<string, unknown>>();
      for (const [, target] of stockTargets) {
        const snap = productSnapMap.get(target.productId);
        if (!snap?.exists) continue;
        const d = snap.data()!;
        const updates = productUpdateMap.get(target.productId) ?? { updatedAt: now };

        if (target.variantId) {
          const vd = (d.variants as Record<string, Record<string, unknown>>)?.[target.variantId];
          if (vd?.stock !== undefined) {
            updates[`variants.${target.variantId}.stock`] = FieldValue.increment(-target.qty);
          }
        } else if (d.stock !== undefined) {
          updates.stock = FieldValue.increment(-target.qty);
        }

        productUpdateMap.set(target.productId, updates);
      }
      for (const [pid, updates] of productUpdateMap) {
        txn.update(adminDb.collection('products').doc(pid), updates);
      }
    });

    return NextResponse.json({ orderId, chipIds: chipList.map(c => c.id) });
  } catch (err) {
    console.error('[create-order]', err);
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
