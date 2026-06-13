import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  deleteField,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IProduct, IProductVariant, IProductOption, IOptionValue, IPrintConfig, IBomLine, ProductStatus, ProductType } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.PRODUCTS;

/** Số lượng còn bán được của một variant/sản phẩm: tồn thực có − đang giữ chỗ. */
export function availableStock(item: { stock?: number; reserved?: number }): number {
  return Math.max(0, (item.stock ?? 0) - (item.reserved ?? 0));
}

function clean<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => {
      if (v === undefined || v === '') return false;
      if (k === 'nfcExtraPrice' && v === 0) return false;
      return true;
    }),
  ) as Partial<T>;
}

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

function serializeVariants(variants: Record<string, IProductVariant> | undefined): Record<string, unknown> | undefined {
  if (!variants || Object.keys(variants).length === 0) return undefined;
  const out: Record<string, unknown> = {};
  for (const [id, v] of Object.entries(variants)) {
    const entry: Record<string, unknown> = { name: v.name, price: v.price };
    if (v.sku) entry.sku = v.sku;
    if (v.optionValues?.length) entry.optionValues = v.optionValues;
    if (v.stock !== undefined) entry.stock = v.stock;
    if (v.reserved !== undefined && v.reserved !== 0) entry.reserved = v.reserved;
    if (v.imageUrl) entry.imageUrl = v.imageUrl;
    if (v.isNfc) entry.isNfc = true;
    if (v.printConfig?.enabled && v.printConfig.shape) {
      const pc: Record<string, unknown> = { enabled: true, shape: v.printConfig.shape };
      if (v.printConfig.width != null) pc.width = v.printConfig.width;
      if (v.printConfig.height != null) pc.height = v.printConfig.height;
      if (v.printConfig.diameter != null) pc.diameter = v.printConfig.diameter;
      entry.printConfig = pc;
    }
    out[id] = entry;
  }
  return out;
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

function serializeBom(bom: IBomLine[] | undefined): Record<string, unknown>[] | undefined {
  if (!bom?.length) return undefined;
  const out = bom
    .filter((b) => b.componentId)
    .map((b) => {
      const line: Record<string, unknown> = { componentId: b.componentId, qty: b.qty ?? 1 };
      if (b.name) line.name = b.name;
      return line;
    });
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

function serializeOptions(options: IProductOption[] | undefined): Record<string, unknown>[] | undefined {
  if (!options?.length) return undefined;
  return options.map(o => {
    const entry: Record<string, unknown> = {
      id: o.id,
      name: o.name,
      createsVariant: o.createsVariant,
      values: o.values.map(v => {
        const val: Record<string, unknown> = { id: v.id, name: v.name };
        if (v.priceDelta != null) val.priceDelta = v.priceDelta;
        if (v.imageUrl) val.imageUrl = v.imageUrl;
        if (v.componentId) {
          val.componentId = v.componentId;
          val.componentQty = v.componentQty ?? 1;
        }
        return val;
      }),
    };
    if (o.required) entry.required = true;
    if (o.sortOrder != null) entry.sortOrder = o.sortOrder;
    return entry;
  });
}

function toProduct(id: string, d: Record<string, unknown>): IProduct {
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

export const ProductAPI = {
  getAll: async (): Promise<IProduct[]> => {
    const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toProduct(s.id, s.data() as Record<string, unknown>));
  },

  getOne: async (id: string): Promise<IProduct | null> => {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return toProduct(snap.id, snap.data() as Record<string, unknown>);
  },

  createOne: async (data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: { id: string } }> => {
    const { variants, options, baseComponents, serviceIds, detailArticle, ...rest } = data;
    const serializedVariants = serializeVariants(variants);
    const serializedOptions = serializeOptions(options);
    const serializedBom = serializeBom(baseComponents);
    const ref = await addDoc(collection(db, COL), {
      ...clean(rest),
      ...(serializedOptions ? { options: serializedOptions } : {}),
      ...(serializedBom ? { baseComponents: serializedBom } : {}),
      ...(serializedVariants ? { variants: serializedVariants } : {}),
      ...(serviceIds && serviceIds.length > 0 ? { serviceIds } : {}),
      ...(detailArticle ? { detailArticle } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    const { variants, options, baseComponents, serviceIds, detailArticle, ...rest } = data;
    const payload: Record<string, unknown> = { ...clean(rest), updatedAt: serverTimestamp() };

    if ('stock' in rest && rest.stock === undefined) payload.stock = deleteField();
    if ('printConfig' in rest && rest.printConfig === undefined) payload.printConfig = deleteField();

    if ('options' in data) {
      const serialized = serializeOptions(options);
      payload.options = serialized ?? deleteField();
    }

    if ('baseComponents' in data) {
      const serialized = serializeBom(baseComponents);
      payload.baseComponents = serialized ?? deleteField();
    }

    if ('variants' in data) {
      const serialized = serializeVariants(variants);
      payload.variants = serialized ?? deleteField();
    }

    if ('serviceIds' in data) {
      payload.serviceIds = serviceIds && serviceIds.length > 0 ? serviceIds : deleteField();
    }

    if ('detailArticle' in data) {
      payload.detailArticle = detailArticle ?? deleteField();
    }

    await updateDoc(doc(db, COL, id), payload);
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
