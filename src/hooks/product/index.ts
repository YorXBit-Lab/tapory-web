import { useFetchList, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/base';
import { ProductAPI } from '@/services/ProductAPI';

const PRODUCT_KEY = ['products'];

export const useProducts = () => useFetchList(PRODUCT_KEY, ProductAPI);

export const useCreateProduct = () => useCreateItem(PRODUCT_KEY, ProductAPI, 'Tạo sản phẩm thành công!', 'Tạo sản phẩm thất bại!');

export const useUpdateProduct = () => useUpdateItem(PRODUCT_KEY, ProductAPI);

export const useDeleteProduct = () => useDeleteItem(PRODUCT_KEY, ProductAPI);
