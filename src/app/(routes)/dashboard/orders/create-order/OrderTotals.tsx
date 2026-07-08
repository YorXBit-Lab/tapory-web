'use client';

import { Typography } from 'antd';
import type { IShippingRate } from '@/configs/types';

const { Text } = Typography;

interface OrderTotalsProps {
  totalPrice: number;
  selectedShipping: IShippingRate | null;
}

/** Subtotal + shipping + grand total summary. */
export function OrderTotals({ totalPrice, selectedShipping }: OrderTotalsProps) {
  return (
    <div className="mt-3 space-y-1 border-t border-border pt-3">
      {selectedShipping && (
        <>
          <div className="flex justify-between text-sm text-content2">
            <span>Tạm tính</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-sm text-content2">
            <span>Vận chuyển ({selectedShipping.name})</span>
            <span>
              {selectedShipping.price === 0 ? 'Miễn phí' : `${selectedShipping.price.toLocaleString('vi-VN')}đ`}
            </span>
          </div>
        </>
      )}
      <div className="flex justify-between">
        <Text strong>Tổng cộng</Text>
        <Text strong className="text-base">
          {(totalPrice + (selectedShipping?.price ?? 0)).toLocaleString('vi-VN')}đ
        </Text>
      </div>
    </div>
  );
}
