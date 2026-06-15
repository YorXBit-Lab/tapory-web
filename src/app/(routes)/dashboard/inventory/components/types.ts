import type { PurchaseOrderStatus } from '@/configs/types';

export interface FormItem {
  componentId: string;
  quantity: number;
  unitCost: number;
}

export interface OrderFormValues {
  status: PurchaseOrderStatus;
  supplier?: string;
  expectedDate?: string;
  note?: string;
  items: FormItem[];
}
