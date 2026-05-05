import { MemorialAPI } from '@/services/MemorialAPI';
import { useFetchOne, useCreateItem, useUpdateItem } from '@/hooks/base';

const MEMORIAL_KEY = ['memorials'];

export const useMemorial = (orderId?: string) =>
  useFetchOne([...MEMORIAL_KEY, orderId], MemorialAPI, { enabled: !!orderId }, orderId);

export const useCreateMemorial = () =>
  useCreateItem(MEMORIAL_KEY, MemorialAPI, 'Đã lưu kỷ niệm!', 'Lưu thất bại!');

export const useUpdateMemorial = () => useUpdateItem(MEMORIAL_KEY, MemorialAPI);
