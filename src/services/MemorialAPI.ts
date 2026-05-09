import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IMemorial } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.MEMORIALS;

export const MemorialAPI = {
  getOne: async (orderId: string) => {
    const snap = await getDoc(doc(db, COL, orderId));
    if (!snap.exists()) return { data: null };
    const d = snap.data();
    return {
      data: {
        ...d,
        orderId: snap.id,
        createdAt: d.createdAt?.toDate?.()?.toISOString(),
        updatedAt: d.updatedAt?.toDate?.()?.toISOString(),
      },
    };
  },

  upsert: async (data: IMemorial) => {
    const ref = doc(db, COL, data.orderId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    return { data: { orderId: data.orderId } };
  },

  // kept for backward compat
  createOne: async (data: IMemorial) => MemorialAPI.upsert(data),
  updateOne: async (orderId: string, data: Partial<IMemorial>) =>
    MemorialAPI.upsert({ ...data, orderId } as IMemorial),
};
