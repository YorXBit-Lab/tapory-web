'use client';

import Image from 'next/image';
import { Typography } from 'antd';
import { fmtVnd } from '@/utils/format';
import type { IPurchaseOrder } from '@/configs/types';

const { Text } = Typography;

export function ItemsDetail({ items, imageUrls }: { items: IPurchaseOrder['items']; imageUrls?: string[] }) {
  return (
    <div className="px-8 py-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left text-content2">
            <th className="pb-1 font-medium">Linh kiện</th>
            <th className="pb-1 text-right font-medium">SL</th>
            <th className="pb-1 text-right font-medium">Đơn giá nhập</th>
            <th className="pb-1 text-right font-medium">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-1">{item.componentName}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{fmtVnd(item.unitCost)}</td>
              <td className="py-1 text-right font-medium">{fmtVnd(item.quantity * item.unitCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {imageUrls && imageUrls.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <Text type="secondary" className="mb-2 block text-xs">Ảnh đính kèm</Text>
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border transition-colors hover:border-primary">
                  <Image src={url} alt={`Ảnh ${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
