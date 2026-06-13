import type { ProductStatus, ProductType } from '@/configs/types';

export interface OptValueRow {
  id: string;
  name: string;
  priceDelta?: number;
  componentId?: string;
  componentQty?: number;
}

export interface OptionRow {
  id: string;
  name: string;
  createsVariant: boolean;
  values: OptValueRow[];
}

export interface GenVariant {
  id: string;
  key: string;
  optionValues: string[];
  valueNames: string[];
  name: string;
  price: number;
  stock?: number;
  sku?: string;
  isNfc?: boolean;
  imageUrl?: string;
  printConfig?: import('@/configs/types').IPrintConfig;
}

export type ProductFormFields = {
  name: string;
  type: ProductType;
  status: ProductStatus;
  description?: string;
  imageUrl?: string;
  price: number;
  stock?: number;
  canBeNfc: boolean;
  nfcExtraPrice?: number;
};

export interface ServiceFormValues {
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}
