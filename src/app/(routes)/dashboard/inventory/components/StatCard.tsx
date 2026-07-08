'use client';

import { Card, Typography, theme } from 'antd';

const { Text } = Typography;

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { token } = theme.useToken();
  return (
    <Card size="small">
      <Text type="secondary" className="block text-xs">{label}</Text>
      <div className="mt-1 text-xl font-bold" style={{ color: token.colorText }}>{value}</div>
      {sub && <Text type="secondary" className="text-xs">{sub}</Text>}
    </Card>
  );
}
