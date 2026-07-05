/**
 * Logic tạo đơn dùng chung (admin nhập tay & khách đặt trên web).
 * Một nguồn sự thật cho: snapshot item, sinh chip NFC, trừ kho (BOM + tồn thành phẩm) trong transaction.
 */
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { stockKey, resolveProductBom } from '@/utils/bom';
import { hashPhone } from '@/utils/phone';
import type { IOrderItem } from '@/services/OrderAPI';

export type OrderSourceServer = 'local' | 'web' | 'tiktok' | 'shopee';

export interface CreateOrderInput {
  customerName: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: IOrderItem[];
  shippingFee?: number;
  shippingRateName?: string;
  source?: OrderSourceServer;
}

function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD${y}${m}${d}${rand}`;
}

function cleanItem(item: IOrderItem): Record<string, unknown> {
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
  if (item.variantSnapshot) {
    const vs = item.variantSnapshot;
    const snap: Record<string, unknown> = { name: vs.name, unitPrice: vs.unitPrice };
    if (vs.variantId) snap.variantId = vs.variantId;
    if (vs.sku) snap.sku = vs.sku;
    if (vs.optionValues?.length) snap.optionValues = vs.optionValues;
    if (vs.isNfc) snap.isNfc = true;
    if (vs.printConfig?.enabled) {
      const cfg: Record<string, unknown> = { enabled: true };
      if (vs.printConfig.shape) cfg.shape = vs.printConfig.shape;
      if (vs.printConfig.width != null) cfg.width = vs.printConfig.width;
      if (vs.printConfig.height != null) cfg.height = vs.printConfig.height;
      if (vs.printConfig.diameter != null) cfg.diameter = vs.printConfig.diameter;
      snap.printConfig = cfg;
    }
    base.variantSnapshot = snap;
  }
  if (item.customization) {
    const c = item.customization;
    const out: Record<string, unknown> = {};
    if (c.message) out.message = c.message;
    if (c.uploadedPhotoUrls?.length) out.uploadedPhotoUrls = c.uploadedPhotoUrls;
    if (c.presetPhotoUrl) out.presetPhotoUrl = c.presetPhotoUrl;
    if (c.templateId) out.templateId = c.templateId;
    if (c.extra && Object.keys(c.extra).length) out.extra = c.extra;
    if (Object.keys(out).length) base.customization = out;
  }
  return base;
}

/**
 * Tạo đơn + sinh chip + trừ kho trong một transaction. Ném Error (message tiếng Việt) khi lỗi.
 */
export async function createOrderRecord(
  adminDb: Firestore,
  input: CreateOrderInput,
): Promise<{ orderId: string; chipIds: string[] }> {
  const { customerName, phone, address, notes, items, shippingFee, shippingRateName, source = 'local' } = input;

  if (!customerName?.trim()) throw new Error('Thiếu tên khách hàng');
  if (!items.length) throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm');

  const hasNfc = items.some((i) => i.isNfc);
  if (hasNfc && !phone?.trim()) throw new Error('Cần số điện thoại cho đơn có móc khóa NFC');

  const cleanedItems = items.map(cleanItem);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalPrice = subtotal + (shippingFee ?? 0);
  const orderId = generateOrderId();

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

  const stockTargets = new Map<string, { productId: string; variantId?: string; qty: number }>();
  for (const item of items) {
    if (!item.productId) continue;
    const key = stockKey(item.productId, item.variantId);
    const existing = stockTargets.get(key);
    if (existing) existing.qty += item.quantity;
    else stockTargets.set(key, { productId: item.productId, variantId: item.variantId, qty: item.quantity });
  }
  const uniqueProductIds = [...new Set([...stockTargets.values()].map((t) => t.productId))];

  await adminDb.runTransaction(async (txn) => {
    const now = new Date();

    const productSnaps = uniqueProductIds.length > 0
      ? await Promise.all(uniqueProductIds.map((id) => txn.get(adminDb.collection('products').doc(id))))
      : [];
    const productSnapMap = new Map(uniqueProductIds.map((id, i) => [id, productSnaps[i]]));

    // BOM → linh kiện; target có BOM trừ linh kiện, còn lại trừ tồn thành phẩm.
    const componentTargets = new Map<string, number>();
    const bomTargetKeys = new Set<string>();
    for (const [key, target] of stockTargets) {
      const snap = productSnapMap.get(target.productId);
      if (!snap?.exists) continue;
      const bom = resolveProductBom(snap.data()!, target.variantId);
      if (bom.length === 0) continue;
      bomTargetKeys.add(key);
      for (const line of bom) {
        componentTargets.set(line.componentId, (componentTargets.get(line.componentId) ?? 0) + line.qty * target.qty);
      }
    }
    const componentIds = [...componentTargets.keys()];
    const componentSnaps = componentIds.length > 0
      ? await Promise.all(componentIds.map((id) => txn.get(adminDb.collection('components').doc(id))))
      : [];
    const componentSnapMap = new Map(componentIds.map((id, i) => [id, componentSnaps[i]]));

    // Validate tồn thành phẩm (target không BOM)
    for (const [key, target] of stockTargets) {
      const snap = productSnapMap.get(target.productId);
      if (!snap?.exists) throw new Error('Sản phẩm không tồn tại');
      const d = snap.data()!;
      if (d.status === 'archived') throw new Error(`"${d.name}" đã ngừng bán`);
      if (bomTargetKeys.has(key)) continue;
      if (target.variantId) {
        const vd = (d.variants as Record<string, Record<string, unknown>>)?.[target.variantId];
        if (!vd) throw new Error(`Biến thể không tồn tại trong "${d.name}"`);
        if (vd.stock !== undefined && (vd.stock as number) < target.qty) {
          throw new Error(`Không đủ hàng: "${d.name} — ${vd.name}" chỉ còn ${vd.stock}`);
        }
      } else if (d.stock !== undefined && (d.stock as number) < target.qty) {
        throw new Error(`Không đủ hàng: "${d.name}" chỉ còn ${d.stock}`);
      }
    }
    // Validate tồn linh kiện
    for (const [componentId, qty] of componentTargets) {
      const snap = componentSnapMap.get(componentId);
      if (!snap?.exists) throw new Error('Linh kiện không tồn tại trong kho');
      const cd = snap.data()!;
      const available = ((cd.stock as number) ?? 0) - ((cd.reserved as number) ?? 0);
      if (available < qty) throw new Error(`Không đủ linh kiện "${cd.name}": cần ${qty}, còn ${available}`);
    }

    // Write order + cards
    txn.set(adminDb.collection('orders').doc(orderId), {
      customerName: customerName.trim(),
      phone: (phone ?? '').trim(),
      address: (address ?? '').trim(),
      price: totalPrice,
      ...(shippingFee !== undefined ? { shippingFee } : {}),
      ...(shippingRateName ? { shippingRateName } : {}),
      status: 'new',
      source,
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

    // Trừ tồn thành phẩm (non-BOM)
    const productUpdateMap = new Map<string, Record<string, unknown>>();
    for (const [key, target] of stockTargets) {
      if (bomTargetKeys.has(key)) continue;
      const snap = productSnapMap.get(target.productId);
      if (!snap?.exists) continue;
      const d = snap.data()!;
      const updates = productUpdateMap.get(target.productId) ?? { updatedAt: now };
      if (target.variantId) {
        const vd = (d.variants as Record<string, Record<string, unknown>>)?.[target.variantId];
        if (vd?.stock !== undefined) updates[`variants.${target.variantId}.stock`] = FieldValue.increment(-target.qty);
      } else if (d.stock !== undefined) {
        updates.stock = FieldValue.increment(-target.qty);
      }
      productUpdateMap.set(target.productId, updates);
    }
    for (const [pid, updates] of productUpdateMap) {
      txn.update(adminDb.collection('products').doc(pid), updates);
    }

    // Trừ tồn linh kiện (BOM)
    for (const [componentId, qty] of componentTargets) {
      txn.update(adminDb.collection('components').doc(componentId), {
        stock: FieldValue.increment(-qty),
        updatedAt: now,
      });
    }
  });

  return { orderId, chipIds: chipList.map((c) => c.id) };
}
