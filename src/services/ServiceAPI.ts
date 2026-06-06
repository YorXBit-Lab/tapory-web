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
import type { IService } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.SERVICES;

function toService(id: string, d: Record<string, unknown>): IService {
  return {
    id,
    name: (d.name as string) ?? '',
    price: (d.price as number) ?? 0,
    enablesNfc: d.enablesNfc as boolean | undefined,
    imageUrl: d.imageUrl as string | undefined,
    description: d.description as string | undefined,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const ServiceAPI = {
  getAll: async (): Promise<IService[]> => {
    const q = query(collection(db, COL), orderBy('createdAt', 'asc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toService(s.id, s.data() as Record<string, unknown>));
  },

  createOne: async (data: Omit<IService, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = { name: data.name, price: data.price };
    if (data.enablesNfc) payload.enablesNfc = true;
    if (data.imageUrl) payload.imageUrl = data.imageUrl;
    if (data.description) payload.description = data.description;
    const ref = await addDoc(collection(db, COL), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (id: string, data: Partial<Omit<IService, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { id: string } }> => {
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    payload.enablesNfc = data.enablesNfc ?? false;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
    if (data.description !== undefined) payload.description = data.description;
    await updateDoc(doc(db, COL, id), payload);
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
