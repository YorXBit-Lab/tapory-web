import type { Timestamp } from 'firebase/firestore';
import type {
  IProduct,
  IProductVariant,
  IProductOption,
  IOptionValue,
  IPrintConfig,
  IBomLine,
  ProductStatus,
  ProductType,
} from '@/configs/types';

/**
 * Pure Firestore-document → IProduct mappers. No SDK runtime dependency (the
 * Timestamp import is type-only), so this module is safe to use both on the
 * client (firebase/firestore) and on the server (firebase-admin) — both expose
 * a `.toDate()` on their timestamp objects.
 */

function toPrintConfig(raw: unknown): IPrintConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    enabled: (r.enabled as boolean) ?? false,
    shape: r.shape as IPrintConfig['shape'] | undefined,
    width: r.width as number | undefined,
    height: r.height as number | undefined,
    diameter: r.diameter as number | undefined,
  };
}

function toVariants(raw: unknown): Record<string, IProductVariant> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const result: Record<string, IProductVariant> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const r = v as Record<string, unknown>;
    result[id] = {
      name: (r.name as string) ?? '',
      price: (r.price as number) ?? 0,
      sku: r.sku as string | undefined,
      optionValues: Array.isArray(r.optionValues) ? (r.optionValues as string[]) : undefined,
      stock: r.stock as number | undefined,
      reserved: r.reserved as number | undefined,
      imageUrl: r.imageUrl as string | undefined,
      isNfc: r.isNfc as boolean | undefined,
      printConfig: toPrintConfig(r.printConfig),
    };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function toBom(raw: unknown): IBomLine[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object' && !!(b as Record<string, unknown>).componentId)
    .map((b) => ({
      componentId: b.componentId as string,
      name: b.name as string | undefined,
      qty: (b.qty as number) ?? 1,
    }));
  return out.length > 0 ? out : undefined;
}

function toOptions(raw: unknown): IProductOption[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const result: IProductOption[] = [];
  for (const o of raw) {
    if (!o || typeof o !== 'object') continue;
    const r = o as Record<string, unknown>;
    const values: IOptionValue[] = Array.isArray(r.values)
      ? (r.values as Record<string, unknown>[]).map(val => ({
          id: (val.id as string) ?? '',
          name: (val.name as string) ?? '',
          priceDelta: val.priceDelta as number | undefined,
          imageUrl: val.imageUrl as string | undefined,
          componentId: val.componentId as string | undefined,
          componentQty: val.componentQty as number | undefined,
        }))
      : [];
    result.push({
      id: (r.id as string) ?? '',
      name: (r.name as string) ?? '',
      createsVariant: (r.createsVariant as boolean) ?? false,
      required: r.required as boolean | undefined,
      values,
      sortOrder: r.sortOrder as number | undefined,
    });
  }
  return result.length > 0 ? result : undefined;
}

export function mapProductDoc(id: string, d: Record<string, unknown>): IProduct {
  return {
    id,
    name: (d.name as string) ?? '',
    type: (d.type as ProductType | undefined) ?? 'keychain',
    price: (d.price as number) ?? 0,
    status: (d.status as ProductStatus | undefined) ?? 'active',
    stock: d.stock as number | undefined,
    reserved: d.reserved as number | undefined,
    canBeNfc: (d.canBeNfc as boolean) ?? false,
    nfcExtraPrice: d.nfcExtraPrice as number | undefined,
    templateId: d.templateId as IProduct['templateId'] | undefined,
    description: d.description as string | undefined,
    imageUrl: d.imageUrl as string | undefined,
    printConfig: toPrintConfig(d.printConfig),
    options: toOptions(d.options),
    baseComponents: toBom(d.baseComponents),
    variants: toVariants(d.variants),
    serviceIds: Array.isArray(d.serviceIds) ? (d.serviceIds as string[]) : undefined,
    detailArticle: d.detailArticle as string | undefined,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}
