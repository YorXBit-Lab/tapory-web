import type { IOrderItem } from '@/services/OrderAPI';

export interface OrderFormValues {
  customerName: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: IOrderItem[];
}
