import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { StatusKey } from '@/components/dashboard';

export interface IOrder {
  id: string;
  customerName: string;
  phone: string;
  templateId: string;
  address: string;
  price: number;
  quantity: number;
  status: StatusKey;
  notes?: string;
  cardId?: string;
  customized: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const COL = FIRESTORE_COLLECTIONS.ORDERS;

function toOrder(id: string, d: Record<string, unknown>): IOrder {
  return {
    id,
    customerName: (d.customerName as string) ?? '',
    phone: (d.phone as string) ?? '',
    templateId: (d.templateId as string) ?? 'birthday',
    address: (d.address as string) ?? '',
    price: (d.price as number) ?? 189000,
    quantity: (d.quantity as number) ?? 1,
    status: (d.status as StatusKey) ?? 'new',
    notes: d.notes as string | undefined,
    cardId: d.cardId as string | undefined,
    customized: (d.customized as boolean) ?? false,
    createdAt: (d.createdAt as Timestamp)?.toDate?.()?.toISOString(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate?.()?.toISOString(),
  };
}

export const OrderAPI = {
  getOne: async (orderId: string): Promise<IOrder | null> => {
    const snap = await getDoc(doc(db, COL, orderId));
    if (!snap.exists()) return null;
    return toOrder(snap.id, snap.data() as Record<string, unknown>);
  },

  list: async (limitCount = 200): Promise<IOrder[]> => {
    const q = query(
      collection(db, COL),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(s => toOrder(s.id, s.data() as Record<string, unknown>));
  },
};
