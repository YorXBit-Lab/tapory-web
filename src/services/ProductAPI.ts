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
import type { IProduct, IProductVariant, IPrintConfig, ProductStatus } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.PRODUCTS;

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
      stock: r.stock as number | undefined,
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
    if (v.stock !== undefined) entry.stock = v.stock;
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

function toProduct(id: string, d: Record<string, unknown>): IProduct {
  return {
    id,
    name: (d.name as string) ?? '',
    price: (d.price as number) ?? 0,
    status: (d.status as ProductStatus | undefined) ?? 'active',
    stock: d.stock as number | undefined,
    canBeNfc: (d.canBeNfc as boolean) ?? (d.isNfc as boolean) ?? false,
    nfcExtraPrice: d.nfcExtraPrice as number | undefined,
    templateId: d.templateId as IProduct['templateId'] | undefined,
    description: d.description as string | undefined,
    imageUrl: d.imageUrl as string | undefined,
    printConfig: toPrintConfig(d.printConfig),
    variants: toVariants(d.variants),
    serviceIds: Array.isArray(d.serviceIds) ? (d.serviceIds as string[]) : undefined,
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
    const { variants, serviceIds, ...rest } = data;
    const serializedVariants = serializeVariants(variants);
    const ref = await addDoc(collection(db, COL), {
      ...clean(rest),
      ...(serializedVariants ? { variants: serializedVariants } : {}),
      ...(serviceIds && serviceIds.length > 0 ? { serviceIds } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    const { variants, serviceIds, ...rest } = data;
    const payload: Record<string, unknown> = { ...clean(rest), updatedAt: serverTimestamp() };

    if ('stock' in rest && rest.stock === undefined) payload.stock = deleteField();

    if ('variants' in data) {
      const serialized = serializeVariants(variants);
      payload.variants = serialized ?? deleteField();
    }

    if ('serviceIds' in data) {
      payload.serviceIds = serviceIds && serviceIds.length > 0 ? serviceIds : deleteField();
    }

    await updateDoc(doc(db, COL, id), payload);
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
