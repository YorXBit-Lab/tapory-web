'use client';

import { Card, Typography } from 'antd';

const { Text } = Typography;

type DeltaType = 'up' | 'down' | 'neutral';

export const STATUS_TAG = {
  pending: { color: 'gold',   label: 'Chờ xử lý' },
  done:    { color: 'green',  label: 'Hoàn thành' },
  active:  { color: 'blue',   label: 'Đang giao'  },
  cancel:  { color: 'red',    label: 'Đã hủy'     },
  new:     { color: 'purple', label: 'Mới'         },
} as const;

export type StatusKey = keyof typeof STATUS_TAG;

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
}: {
  label: string;
  value: string;
  delta?: string;
  deltaType?: DeltaType;
}) {
  const textType =
    deltaType === 'up' ? 'success' : deltaType === 'down' ? 'danger' : 'secondary';

  return (
    <Card size="small">
      <Text type="secondary" className="mb-1.5 block text-xs">
        {label}
      </Text>
      <Text strong className="block text-xl leading-none">
        {value}
      </Text>
      {delta && (
        <Text type={textType} className="mt-1.5 block text-xs">
          {delta}
        </Text>
      )}
    </Card>
  );
}
