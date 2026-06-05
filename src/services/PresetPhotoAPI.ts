import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  orderBy,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IPresetPhoto } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.PRESET_PHOTOS;

function toPresetPhoto(id: string, d: Record<string, unknown>): IPresetPhoto {
  return {
    id,
    productId: (d.productId as string) ?? '',
    url: (d.url as string) ?? '',
    key: (d.key as string) ?? '',
    name: d.name as string | undefined,
    sortOrder: d.sortOrder as number | undefined,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const PresetPhotoAPI = {
  getByProduct: async (productId: string): Promise<IPresetPhoto[]> => {
    const q = query(
      collection(db, COL),
      where('productId', '==', productId),
      orderBy('sortOrder', 'asc'),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toPresetPhoto(s.id, s.data() as Record<string, unknown>));
  },

  getAll: async (): Promise<IPresetPhoto[]> => {
    const q = query(collection(db, COL), orderBy('productId'), orderBy('sortOrder', 'asc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toPresetPhoto(s.id, s.data() as Record<string, unknown>));
  },

  createOne: async (data: Omit<IPresetPhoto, 'id' | 'createdAt'>): Promise<{ data: { id: string } }> => {
    const ref = await addDoc(collection(db, COL), {
      productId: data.productId,
      url: data.url,
      key: data.key,
      ...(data.name ? { name: data.name } : {}),
      sortOrder: data.sortOrder ?? 0,
      createdAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
