import {
  collection,
  doc,
  deleteField,
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
import type { IPrintConfig, IPrintPhotoSlot, IItemCustomization, IVariantSnapshot } from '@/configs/types';

export type OrderSource = 'local' | 'web' | 'tiktok' | 'shopee';

export interface IOrderItem {
  productId?: string;
  variantId?: string;
  variantName?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  isNfc: boolean;
  templateId?: string;
  printConfig?: IPrintConfig;
  addonNames?: string[];
  presetPhotoUrl?: string;   // URL ảnh mẫu đã chọn sẵn (không cần link upload)
  /**
   * Snapshot biến thể tại thời điểm đặt — đơn cũ đọc giá/tên/option từ đây,
   * không phụ thuộc Variant hiện tại. Xem IVariantSnapshot.
   */
  variantSnapshot?: IVariantSnapshot;
  /** Nội dung cá nhân hóa (JSON, không nhân tồn kho). Xem IItemCustomization. */
  customization?: IItemCustomization;
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
  shippingFee?: number;
  shippingRateName?: string;
  printPhotos?: IPrintPhotoSlot[];
  printedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COL = FIRESTORE_COLLECTIONS.ORDERS;

function toOrder(id: string, d: Record<string, unknown>): IOrder {
  const items = Array.isArray(d.items) ? (d.items as IOrderItem[]) : [];

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
    shippingFee: d.shippingFee as number | undefined,
    shippingRateName: d.shippingRateName as string | undefined,
    printPhotos: Array.isArray(d.printPhotos) ? (d.printPhotos as IPrintPhotoSlot[]) : [],
    printedAt: (d.printedAt as Timestamp)?.toDate?.()?.toISOString() ?? (d.printedAt as string | undefined),
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
    fields: Partial<Pick<IOrder, 'customerName' | 'phone' | 'address' | 'price' | 'notes' | 'status' | 'items' | 'printedAt'>>,
  ): Promise<void> => {
    const payload: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };
    // null means "delete the field" — use Firestore's deleteField sentinel
    if ('printedAt' in fields && fields.printedAt == null) {
      payload.printedAt = deleteField();
    }
    await updateDoc(doc(db, COL, orderId), payload);
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
