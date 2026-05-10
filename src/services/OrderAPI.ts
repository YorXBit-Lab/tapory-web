import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { StatusKey } from '@/components/dashboard';

export type OrderSource = 'local' | 'tiktok' | 'shopee';

export interface IOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  isNfc: boolean;
  templateId?: string;
}

export interface IOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  price: number;
  status: StatusKey;
  source: OrderSource;
  items: IOrderItem[];
  notes?: string;
  customized: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated dùng items thay thế */
  templateId?: string;
  /** @deprecated dùng items thay thế */
  quantity?: number;
}

const COL = FIRESTORE_COLLECTIONS.ORDERS;

function toOrder(id: string, d: Record<string, unknown>): IOrder {
  const rawItems = d.items as IOrderItem[] | undefined;
  const items: IOrderItem[] = rawItems?.length
    ? rawItems
    : d.templateId
      ? [{ productName: 'Móc khóa NFC', quantity: (d.quantity as number) ?? 1, unitPrice: (d.price as number) ?? 189000, isNfc: true, templateId: d.templateId as string }]
      : [];

  return {
    id,
    customerName: (d.customerName as string) ?? '',
    phone: (d.phone as string) ?? '',
    address: (d.address as string) ?? '',
    price: (d.price as number) ?? 0,
    status: (d.status as StatusKey) ?? 'new',
    source: (d.source as OrderSource) ?? 'local',
    items,
    notes: d.notes as string | undefined,
    customized: (d.customized as boolean) ?? false,
    templateId: d.templateId as string | undefined,
    quantity: d.quantity as number | undefined,
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

  update: async (
    orderId: string,
    fields: Partial<Pick<IOrder, 'customerName' | 'address' | 'price' | 'notes' | 'status'>>,
  ): Promise<void> => {
    await updateDoc(doc(db, COL, orderId), { ...fields, updatedAt: serverTimestamp() });
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
