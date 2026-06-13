/**
 * Tiện ích BOM (định mức linh kiện) dùng chung cho các route xử lý kho.
 * Thuần hàm — không import firebase, nhận thẳng dữ liệu document Firestore.
 */

/** Compound key: phân biệt variant với product-level stock. */
export function stockKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

type RawProduct = Record<string, unknown>;

/**
 * Giải BOM của một sản phẩm/biến thể từ document product:
 * baseComponents (luôn trừ) + linh kiện gắn vào các option-value của biến thể.
 * Trả về danh sách {componentId, qty} cho MỘT đơn vị sản phẩm.
 */
export function resolveProductBom(
  d: RawProduct,
  variantId: string | undefined,
): { componentId: string; qty: number }[] {
  const lines: { componentId: string; qty: number }[] = [];
  const base = d.baseComponents as { componentId?: string; qty?: number }[] | undefined;
  if (Array.isArray(base)) {
    for (const b of base) if (b?.componentId) lines.push({ componentId: b.componentId, qty: b.qty ?? 1 });
  }
  if (variantId) {
    const vd = (d.variants as Record<string, Record<string, unknown>>)?.[variantId];
    const ovs = vd?.optionValues as string[] | undefined;
    const options = d.options as
      | { id: string; values: { id: string; componentId?: string; componentQty?: number }[] }[]
      | undefined;
    if (Array.isArray(ovs) && Array.isArray(options)) {
      for (const ov of ovs) {
        const [optId, valId] = ov.split(':');
        const val = options.find((o) => o.id === optId)?.values?.find((v) => v.id === valId);
        if (val?.componentId) lines.push({ componentId: val.componentId, qty: val.componentQty ?? 1 });
      }
    }
  }
  return lines;
}
