'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Typography } from 'antd';
import type { IShippingRate } from '@/configs/types';

const { Text } = Typography;

interface ShippingRatePickerProps {
  shippingRates: IShippingRate[];
  selectedShipping: IShippingRate | null;
  setSelectedShipping: Dispatch<SetStateAction<IShippingRate | null>>;
}

/** Chip selector for shipping rate (null = chưa tính phí). */
export function ShippingRatePicker({
  shippingRates,
  selectedShipping,
  setSelectedShipping,
}: ShippingRatePickerProps) {
  if (shippingRates.length === 0) return null;

  return (
    <div className="mt-3">
      <Text className="mb-1.5 block text-sm font-medium">Phí vận chuyển</Text>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedShipping(null)}
          className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
            !selectedShipping
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-content2 hover:border-primary/50'
          }`}
        >
          Chưa tính phí
        </button>
        {shippingRates.map((rate) => (
          <button
            key={rate.id}
            type="button"
            onClick={() => setSelectedShipping(rate)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              selectedShipping?.id === rate.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-content2 hover:border-primary/50'
            }`}
          >
            <span className="font-medium">{rate.name}</span>
            <span className="ml-1.5 text-content3">
              {rate.price === 0 ? 'Miễn phí' : `+${rate.price.toLocaleString('vi-VN')}đ`}
            </span>
            {rate.estimatedDays && <span className="ml-1 text-content3">· {rate.estimatedDays}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
