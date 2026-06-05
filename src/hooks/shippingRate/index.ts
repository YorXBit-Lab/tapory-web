import { useFetchList, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/base';
import { ShippingRateAPI } from '@/services/ShippingRateAPI';

const KEY = ['shipping_rates'];

export const useShippingRates  = () => useFetchList(KEY, ShippingRateAPI);
export const useCreateShipping = () => useCreateItem(KEY, ShippingRateAPI);
export const useUpdateShipping = () => useUpdateItem(KEY, ShippingRateAPI);
export const useDeleteShipping = () => useDeleteItem(KEY, ShippingRateAPI);
