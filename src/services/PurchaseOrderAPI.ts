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
import type { IPurchaseOrder, IPurchaseOrderItem, PurchaseOrderStatus } from '@/configs/types';

const COL = FIRESTORE_COLLECTIONS.PURCHASE_ORDERS;

function toItem(raw: unknown): IPurchaseOrderItem {
  const r = raw as Record<string, unknown>;
  return {
    componentId: (r.componentId as string) ?? '',
    componentName: (r.componentName as string) ?? '',
    quantity: (r.quantity as number) ?? 0,
    unitCost: (r.unitCost as number) ?? 0,
  };
}

function toPurchaseOrder(id: string, d: Record<string, unknown>): IPurchaseOrder {
  return {
    id,
    status: (d.status as PurchaseOrderStatus) ?? 'planned',
    items: Array.isArray(d.items) ? d.items.map(toItem) : [],
    totalCost: (d.totalCost as number) ?? 0,
    supplier: d.supplier as string | undefined,
    note: d.note as string | undefined,
    expectedDate: d.expectedDate as string | undefined,
    imageUrls: Array.isArray(d.imageUrls) ? (d.imageUrls as string[]) : undefined,
    receivedAt: (d.receivedAt as Timestamp)?.toDate?.()?.toISOString(),
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const PurchaseOrderAPI = {
  getAll: async (): Promise<IPurchaseOrder[]> => {
    const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toPurchaseOrder(s.id, s.data() as Record<string, unknown>));
  },

  getOne: async (id: string): Promise<IPurchaseOrder | null> => {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return toPurchaseOrder(snap.id, snap.data() as Record<string, unknown>);
  },

  createOne: async (
    data: Omit<IPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'receivedAt'>,
  ): Promise<{ data: { id: string } }> => {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },

  updateOne: async (
    id: string,
    data: Partial<Omit<IPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'receivedAt'>>,
  ): Promise<{ data: { id: string } }> => {
    await updateDoc(doc(db, COL, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { data: { id } };
  },

  deleteOne: async (id: string): Promise<{ data: { id: string } }> => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
