'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Typography } from 'antd';
import type { IService } from '@/configs/types';

const { Text } = Typography;

interface ServicesPickerProps {
  services: IService[];
  selectedServiceIds: string[];
  setSelectedServiceIds: Dispatch<SetStateAction<string[]>>;
}

/** Multi-select chips of optional add-on services attached to the product. */
export function ServicesPicker({
  services,
  selectedServiceIds,
  setSelectedServiceIds,
}: ServicesPickerProps) {
  if (services.length === 0) {
    return (
      <Text type="secondary" className="text-xs">
        Chưa có dịch vụ nào. Tạo dịch vụ từ trang sản phẩm trước.
      </Text>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {services.map((service) => {
        const selected = selectedServiceIds.includes(service.id);
        return (
          <button
            key={service.id}
            type="button"
            onClick={() =>
              setSelectedServiceIds((prev) =>
                selected ? prev.filter((id) => id !== service.id) : [...prev, service.id],
              )
            }
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-content2 hover:border-primary/50'
            }`}
          >
            <span>{service.name}</span>
            <span className={selected ? 'text-primary' : 'text-content3'}>
              +{service.price.toLocaleString('vi-VN')}đ
            </span>
          </button>
        );
      })}
    </div>
  );
}
