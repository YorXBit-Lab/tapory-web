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
import type { IComponent } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.COMPONENTS;

/** Số lượng linh kiện còn dùng được: tồn thực có − đang giữ chỗ. */
export function componentAvailable(c: { stock?: number; reserved?: number }): number {
  return Math.max(0, (c.stock ?? 0) - (c.reserved ?? 0));
}

function toComponent(id: string, d: Record<string, unknown>): IComponent {
  return {
    id,
    name: (d.name as string) ?? '',
    description: d.description as string | undefined,
    stock: (d.stock as number) ?? 0,
    reserved: d.reserved as number | undefined,
    unit: d.unit as string | undefined,
    lowStockThreshold: d.lowStockThreshold as number | undefined,
    imageUrl: d.imageUrl as string | undefined,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const ComponentAPI = {
  getAll: async (): Promise<IComponent[]> => {
    const q = query(collection(db, COL), orderBy('createdAt', 'asc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((s) => toComponent(s.id, s.data() as Record<string, unknown>));
  },

  getOne: async (id: string): Promise<IComponent | null> => {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return toComponent(snap.id, snap.data() as Record<string, unknown>);
  },

  createOne: async (data: Omit<IComponent, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = { name: data.name, stock: data.stock ?? 0 };
    if (data.description) payload.description = data.description;
    if (data.unit) payload.unit = data.unit;
    if (data.lowStockThreshold != null) payload.lowStockThreshold = data.lowStockThreshold;
    if (data.imageUrl) payload.imageUrl = data.imageUrl;
    const ref = await addDoc(collection(db, COL), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IComponent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description || deleteField();
    if (data.stock !== undefined) payload.stock = data.stock;
    if (data.unit !== undefined) payload.unit = data.unit || deleteField();
    if (data.lowStockThreshold !== undefined) {
      payload.lowStockThreshold = data.lowStockThreshold ?? deleteField();
    }
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl || deleteField();
    await updateDoc(doc(db, COL, id), payload);
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
