import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IProduct } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.PRODUCTS;

function clean<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>;
}

function toProduct(id: string, d: Record<string, unknown>): IProduct {
  return {
    id,
    name: (d.name as string) ?? '',
    price: (d.price as number) ?? 0,
    isNfc: (d.isNfc as boolean) ?? false,
    templateId: d.templateId as IProduct['templateId'] | undefined,
    description: d.description as string | undefined,
    imageUrl: d.imageUrl as string | undefined,
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
    const ref = await addDoc(collection(db, COL), {
      ...clean(data),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    await updateDoc(doc(db, COL, id), { ...clean(data), updatedAt: serverTimestamp() });
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
