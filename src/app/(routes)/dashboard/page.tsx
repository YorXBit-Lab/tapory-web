'use client';

import { Card, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { StatCard, STATUS_TAG, type StatusKey } from '@/components/dashboard';

const { Text } = Typography;

type Order = {
  id: string;
  customer: string;
  template: string;
  date: string;
  status: StatusKey;
};

const RECENT_ORDERS: Order[] = [
  { id: '#ORD1892', customer: 'Nguyễn Thị Mai', template: '🎓 Tốt nghiệp', date: '05/05/2026', status: 'pending' },
  { id: '#ORD1891', customer: 'Trần Văn Minh',  template: '💍 Đám cưới',    date: '05/05/2026', status: 'done'    },
  { id: '#ORD1890', customer: 'Lê Thị Hoa',     template: '🎂 Sinh nhật',   date: '04/05/2026', status: 'done'    },
  { id: '#ORD1889', customer: 'Phạm Quốc Bảo',  template: '🎵 Spotify',     date: '04/05/2026', status: 'active'  },
];

const TEMPLATE_STATS = [
  { label: '🎓 Tốt nghiệp', pct: 72, color: '#e8c14b' },
  { label: '💍 Đám cưới',   pct: 55, color: '#D4537E' },
  { label: '🎂 Sinh nhật',  pct: 38, color: '#378ADD' },
  { label: '💕 Kỷ niệm',   pct: 25, color: '#E24B4A' },
  { label: '🎵 Spotify',    pct: 18, color: '#1D9E75' },
];

const BAR_DATA = [
  { day: 'T2', h: 55 },
  { day: 'T3', h: 70 },
  { day: 'T4', h: 45 },
  { day: 'T5', h: 80 },
  { day: 'T6', h: 60 },
  { day: 'T7', h: 90 },
  { day: 'CN', h: 75, highlight: true },
];

const columns: ColumnsType<Order> = [
  {
    title: 'Mã đơn',
    dataIndex: 'id',
    render: (id: string) => <Text className="font-mono text-xs text-primary">{id}</Text>,
  },
  { title: 'Khách hàng', dataIndex: 'customer' },
  { title: 'Template',   dataIndex: 'template'  },
  {
    title: 'Ngày đặt',
    dataIndex: 'date',
    render: (date: string) => <Text type="secondary" className="text-xs">{date}</Text>,
  },
  {
    title: 'Giá trị',
    render: () => <Text strong>189.000đ</Text>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (status: StatusKey) => {
      const s = STATUS_TAG[status];
      return <Tag color={s.color}>{s.label}</Tag>;
    },
  },
];

export default function DashboardOverviewPage() {
  const { token } = theme.useToken();

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Đơn hàng hôm nay"        value="24"    delta="↑ 18% so với hôm qua"  deltaType="up" />
        <StatCard label="Doanh thu tháng"           value="14.2M" delta="↑ 12% so với tháng 4" deltaType="up" />
        <StatCard label="Khách hàng mới"            value="138"   delta="↑ 5% tháng này"        deltaType="up" />
        <StatCard label="Chip NFC đang hoạt động"   value="892"   delta="↑ 47 chip mới tháng 5" deltaType="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Đơn hàng 7 ngày qua"
          extra={<Link href="/dashboard/orders" className="text-xs text-primary">Xem chi tiết →</Link>}
        >
          <div className="mt-2 flex h-28 items-end gap-2">
            {BAR_DATA.map(({ day, h, highlight }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-opacity hover:opacity-80"
                  style={{
                    height: `${h}px`,
                    background: highlight ? token.colorPrimary : token.colorFill,
                  }}
                />
                <Text type="secondary" className="text-xs">{day}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Template phổ biến">
          <div className="space-y-2.5">
            {TEMPLATE_STATS.map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Text type="secondary" className="w-28 flex-shrink-0 text-xs">{label}</Text>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-divider">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <Text strong className="w-7 text-right text-xs">{pct}%</Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card
        title="Đơn hàng gần nhất"
        extra={<Link href="/dashboard/orders" className="text-xs text-primary">Xem tất cả →</Link>}
      >
        <Table
          columns={columns}
          dataSource={RECENT_ORDERS}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
}
