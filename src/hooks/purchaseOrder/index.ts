import { useFetchList, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/base';
import { PurchaseOrderAPI } from '@/services/PurchaseOrderAPI';

const KEY = ['purchase_orders'];

export const usePurchaseOrders = () => useFetchList(KEY, PurchaseOrderAPI);
export const useCreatePurchaseOrder = () => useCreateItem(KEY, PurchaseOrderAPI);
export const useUpdatePurchaseOrder = () => useUpdateItem(KEY, PurchaseOrderAPI);
export const useDeletePurchaseOrder = () => useDeleteItem(KEY, PurchaseOrderAPI);
