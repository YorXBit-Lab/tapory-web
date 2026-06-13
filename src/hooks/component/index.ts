import { useFetchList, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/base';
import { ComponentAPI } from '@/services/ComponentAPI';

const KEY = ['components'];

export const useComponents      = () => useFetchList(KEY, ComponentAPI);
export const useCreateComponent = () => useCreateItem(KEY, ComponentAPI);
export const useUpdateComponent = () => useUpdateItem(KEY, ComponentAPI);
export const useDeleteComponent = () => useDeleteItem(KEY, ComponentAPI);
