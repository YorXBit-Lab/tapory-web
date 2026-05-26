import { doc, getDoc, getDocs, deleteDoc, collection, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IMemorial } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.MEMORIALS;

export const MemorialAPI = {
  list: async (): Promise<Array<{ orderId: string; templateId: string; title?: string; updatedAt?: string; createdAt?: string }>> => {
    const snaps = await getDocs(collection(db, COL));
    return snaps.docs
      .map(s => {
        const d = s.data();
        return {
          orderId: s.id,
          templateId: (d.templateId as string) ?? 'birthday',
          title: d.title as string | undefined,
          updatedAt: d.updatedAt?.toDate?.()?.toISOString(),
          createdAt: d.createdAt?.toDate?.()?.toISOString(),
        };
      })
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  },

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
    // Drop server-managed timestamps and strip undefined — Firestore rejects both
    const { createdAt: _c, updatedAt: _u, ...rest } = data as Record<string, unknown>;
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...clean, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...clean, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    return { data: { orderId: data.orderId } };
  },

  deleteOne: async (orderId: string) => {
    await deleteDoc(doc(db, COL, orderId));
  },

  // kept for backward compat
  createOne: async (data: IMemorial) => MemorialAPI.upsert(data),
  updateOne: async (orderId: string, data: Partial<IMemorial>) =>
    MemorialAPI.upsert({ ...data, orderId } as IMemorial),
};
