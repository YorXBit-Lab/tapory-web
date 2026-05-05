import { Badge, Card, CardHeader, StatCard, Table, Td, Tr } from '@/components/dashboard';
import Link from 'next/link';

const RECENT_ORDERS = [
  {
    id: '#ORD1892',
    customer: 'Nguyễn Thị Mai',
    template: '🎓 Tốt nghiệp',
    date: '05/05/2026',
    status: 'pending' as const,
  },
  {
    id: '#ORD1891',
    customer: 'Trần Văn Minh',
    template: '💍 Đám cưới',
    date: '05/05/2026',
    status: 'done' as const,
  },
  {
    id: '#ORD1890',
    customer: 'Lê Thị Hoa',
    template: '🎂 Sinh nhật',
    date: '04/05/2026',
    status: 'done' as const,
  },
  {
    id: '#ORD1889',
    customer: 'Phạm Quốc Bảo',
    template: '🎵 Spotify',
    date: '04/05/2026',
    status: 'active' as const,
  },
];

const TEMPLATE_STATS = [
  { label: '🎓 Tốt nghiệp', pct: 72, color: '#e8c14b' },
  { label: '💍 Đám cưới', pct: 55, color: '#D4537E' },
  { label: '🎂 Sinh nhật', pct: 38, color: '#378ADD' },
  { label: '💕 Kỷ niệm', pct: 25, color: '#E24B4A' },
  { label: '🎵 Spotify', pct: 18, color: '#1D9E75' },
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

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Đơn hàng hôm nay" value="24" delta="↑ 18% so với hôm qua" deltaType="up" />
        <StatCard
          label="Doanh thu tháng"
          value="14.2M"
          delta="↑ 12% so với tháng 4"
          deltaType="up"
        />
        <StatCard label="Khách hàng mới" value="138" delta="↑ 5% tháng này" deltaType="up" />
        <StatCard
          label="Chip NFC đang hoạt động"
          value="892"
          delta="↑ 47 chip mới tháng 5"
          deltaType="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Bar chart */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Đơn hàng 7 ngày qua"
            action={
              <Link href="/dashboard/orders" className="hover:text-gray-600">
                Xem chi tiết →
              </Link>
            }
          />
          <div className="mt-2 flex h-28 items-end gap-2">
            {BAR_DATA.map(({ day, h, highlight }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-opacity hover:opacity-80"
                  style={{
                    height: `${h}px`,
                    background: highlight ? '#e8c14b' : '#1a1a2e',
                    opacity: highlight ? 1 : 0.15,
                  }}
                />
                <span className="text-[9px] text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Template breakdown */}
        <Card>
          <CardHeader title="Template phổ biến" />
          <div className="space-y-2.5">
            {TEMPLATE_STATS.map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-28 flex-shrink-0 text-[12px] text-gray-600">{label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="w-7 text-right text-[11px] font-semibold text-gray-700">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader
          title="Đơn hàng gần nhất"
          action={
            <Link href="/dashboard/orders" className="hover:text-gray-600">
              Xem tất cả →
            </Link>
          }
        />
        <Table headers={['Mã đơn', 'Khách hàng', 'Template', 'Ngày đặt', 'Giá trị', 'Trạng thái']}>
          {RECENT_ORDERS.map((o) => (
            <Tr key={o.id}>
              <Td className="font-mono text-[11px] text-blue-600">{o.id}</Td>
              <Td>{o.customer}</Td>
              <Td>{o.template}</Td>
              <Td className="text-gray-400">{o.date}</Td>
              <Td className="font-medium">189.000đ</Td>
              <Td>
                <Badge variant={o.status} />
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
