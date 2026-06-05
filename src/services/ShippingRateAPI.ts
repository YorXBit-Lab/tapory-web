import {
  collection,
  doc,
  addDoc,
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
import type { IShippingRate } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.SHIPPING_RATES;

function toShippingRate(id: string, d: Record<string, unknown>): IShippingRate {
  return {
    id,
    name: (d.name as string) ?? '',
    price: (d.price as number) ?? 0,
    estimatedDays: d.estimatedDays as string | undefined,
    isDefault: d.isDefault as boolean | undefined,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const ShippingRateAPI = {
  getAll: async (): Promise<IShippingRate[]> => {
    const q = query(collection(db, COL), orderBy('price', 'asc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toShippingRate(s.id, s.data() as Record<string, unknown>));
  },

  createOne: async (data: Omit<IShippingRate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      price: data.price,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (data.estimatedDays) payload.estimatedDays = data.estimatedDays;
    if (data.isDefault) payload.isDefault = true;
    const ref = await addDoc(collection(db, COL), payload);
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IShippingRate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    payload.estimatedDays = data.estimatedDays ?? '';
    payload.isDefault = data.isDefault ?? false;
    await updateDoc(doc(db, COL, id), payload);
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
