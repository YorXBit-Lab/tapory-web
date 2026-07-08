import type { IProduct, IPrintConfig } from '@/configs/types';
import type { OptionRow, OptValueRow, GenVariant } from './types';

export function rid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 7)}`;
}

export function generateVariants(options: OptionRow[], basePrice: number, prev: GenVariant[]): GenVariant[] {
  const variantOpts = options.filter((o) => o.createsVariant && o.values.some((v) => v.name.trim()));
  if (variantOpts.length === 0) return [];

  let combos: { optId: string; val: OptValueRow }[][] = [[]];
  for (const opt of variantOpts) {
    const vals = opt.values.filter((v) => v.name.trim());
    const next: { optId: string; val: OptValueRow }[][] = [];
    for (const combo of combos) for (const val of vals) next.push([...combo, { optId: opt.id, val }]);
    combos = next;
  }

  const prevByKey = new Map(prev.map((v) => [v.key, v]));
  return combos.map((combo) => {
    const optionValues = combo.map((c) => `${c.optId}:${c.val.id}`);
    const valueNames = combo.map((c) => c.val.name.trim());
    const key = optionValues.join('|');
    const existing = prevByKey.get(key);
    const name = valueNames.join(' · ');
    if (existing) return { ...existing, optionValues, valueNames, name };
    const price = basePrice + combo.reduce((s, c) => s + (c.val.priceDelta ?? 0), 0);
    return { id: rid('v'), key, optionValues, valueNames, name, price };
  });
}

export function loadOptions(p: IProduct): OptionRow[] {
  return (p.options ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    createsVariant: o.createsVariant,
    values: o.values.map((v) => ({
      id: v.id,
      name: v.name,
      priceDelta: v.priceDelta,
      componentId: v.componentId,
      componentQty: v.componentQty,
    })),
  }));
}

export function loadVariants(p: IProduct): GenVariant[] {
  if (!p.variants) return [];
  const valName = new Map<string, string>();
  for (const o of p.options ?? []) for (const v of o.values) valName.set(`${o.id}:${v.id}`, v.name);
  return Object.entries(p.variants).map(([id, v]) => {
    const optionValues = v.optionValues ?? [];
    return {
      id,
      key: optionValues.length ? optionValues.join('|') : id,
      optionValues,
      valueNames: optionValues.map((ov) => valName.get(ov) ?? ov),
      name: v.name,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
      isNfc: v.isNfc,
      imageUrl: v.imageUrl,
      printConfig: v.printConfig ?? { enabled: false },
    };
  });
}

export function cleanPrintConfig(pc?: IPrintConfig): IPrintConfig | undefined {
  if (!pc?.enabled || !pc.shape) return undefined;
  const out: IPrintConfig = { enabled: true, shape: pc.shape };
  if (pc.width != null) out.width = pc.width;
  if (pc.height != null) out.height = pc.height;
  if (pc.diameter != null) out.diameter = pc.diameter;
  return out;
}
