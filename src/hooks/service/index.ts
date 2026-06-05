import { useFetchList, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/base';
import { ServiceAPI } from '@/services/ServiceAPI';

const KEY = ['services'];

export const useServices      = () => useFetchList(KEY, ServiceAPI);
export const useCreateService = () => useCreateItem(KEY, ServiceAPI);
export const useUpdateService = () => useUpdateItem(KEY, ServiceAPI);
export const useDeleteService = () => useDeleteItem(KEY, ServiceAPI);
