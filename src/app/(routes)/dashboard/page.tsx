'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Table, Tag, Typography, theme } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { StatCard, STATUS_TAG, type StatusKey } from '@/components/dashboard';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { CardAPI } from '@/services/CardAPI';
import { ProductAPI } from '@/services/ProductAPI';
import { TEMPLATES } from '@/configs/constants';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtVnd(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000).toFixed(0)}K`;
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function DashboardOverviewPage() {
  const { token } = theme.useToken();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: orders = [] }   = useQuery({ queryKey: ['orders'],   queryFn: () => OrderAPI.list(),   staleTime: 60_000 });
  const { data: cards = [] }    = useQuery({ queryKey: ['cards-all'], queryFn: () => CardAPI.listAll(), staleTime: 60_000 });
  const { data: products = [] } = useQuery({ queryKey: ['products'],  queryFn: () => ProductAPI.getAll(), staleTime: 60_000 });

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7);
    const todayOrders    = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today).length;
    const monthRevenue   = orders.filter(o => o.createdAt?.startsWith(thisMonth)).reduce((s, o) => s + o.price, 0);
    const totalCustomers = new Set(orders.map(o => o.phone)).size;
    const totalChips     = cards.length;
    const unwrittenChips = cards.filter(c => !c.nfcWritten).length;
    const lowStockCount  = products.filter(p => p.status === 'active' && p.stock !== undefined && p.stock <= 5).length;
    return { todayOrders, monthRevenue, totalCustomers, totalChips, unwrittenChips, lowStockCount };
  }, [orders, cards, products]);

  const dailyChart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toDateString();
      return {
        day: DAY_LABELS[d.getDay()],
        count: orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === ds).length,
        isToday: i === 6,
      };
    });
  }, [orders]);

  const maxDay = Math.max(...dailyChart.map(d => d.count), 1);

  const templateStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      for (const item of o.items) {
        if (item.templateId) counts[item.templateId] = (counts[item.templateId] ?? 0) + 1;
      }
    }
    return Object.entries(TEMPLATES)
      .map(([id, t]) => ({ id, label: `${t.icon} ${t.name}`, count: counts[id] ?? 0, color: t.colors.primary }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  const maxTpl = Math.max(...templateStats.map(t => t.count), 1);

  const availableYears = useMemo(() => {
    const yrs = new Set<number>([currentYear]);
    for (const o of orders) {
      if (o.createdAt) yrs.add(new Date(o.createdAt).getFullYear());
    }
    return Array.from(yrs).sort();
  }, [orders, currentYear]);

  const monthlyRevenue = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${month}`;
      const revenue = orders
        .filter(o => o.createdAt?.startsWith(prefix))
        .reduce((s, o) => s + o.price, 0);
      const isCurrentMonth = i === new Date().getMonth() && selectedYear === currentYear;
      return { month: MONTH_LABELS[i], revenue, isCurrentMonth };
    });
  }, [orders, selectedYear, currentYear]);

  const maxMonth = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const yearlyRevenue = useMemo(() => {
    const map: Record<number, number> = {};
    for (const o of orders) {
      if (!o.createdAt) continue;
      const yr = new Date(o.createdAt).getFullYear();
      map[yr] = (map[yr] ?? 0) + o.price;
    }
    return availableYears.map(yr => ({ year: yr, revenue: map[yr] ?? 0 }));
  }, [orders, availableYears]);

  const maxYear = Math.max(...yearlyRevenue.map(y => y.revenue), 1);

  const recentOrders = orders.slice(0, 6);

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => (
        <button className="font-mono text-xs text-primary hover:underline" onClick={() => router.push(`/dashboard/orders/${id}`)}>
          {id}
        </button>
      ),
    },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    {
      title: 'Template',
      dataIndex: 'templateId',
      render: (id: string) => { const t = TEMPLATES[id as keyof typeof TEMPLATES]; return t ? `${t.icon} ${t.name}` : id; },
    },
    {
      title: 'Giá trị',
      dataIndex: 'price',
      render: (v: number) => <Text strong>{v.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: StatusKey) => { const tag = STATUS_TAG[s]; return tag ? <Tag color={tag.color}>{tag.label}</Tag> : null; },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Đơn hàng hôm nay"  value={String(stats.todayOrders)}        />
        <StatCard label="Doanh thu tháng"    value={fmtVnd(stats.monthRevenue) + 'đ'} />
        <StatCard label="Tổng khách hàng"    value={fmt(stats.totalCustomers)}        />
        <StatCard
          label="Chip NFC"
          value={fmt(stats.totalChips)}
          delta={stats.unwrittenChips > 0 ? `${stats.unwrittenChips} chưa ghi` : 'Tất cả đã ghi'}
          deltaType={stats.unwrittenChips > 0 ? 'down' : 'up'}
        />
        <StatCard
          label="Sắp hết hàng"
          value={String(stats.lowStockCount)}
          delta={stats.lowStockCount > 0 ? 'Cần nhập hàng' : 'Đủ hàng'}
          deltaType={stats.lowStockCount > 0 ? 'down' : 'up'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Đơn hàng 7 ngày qua"
          extra={<Link href="/dashboard/orders" className="text-xs text-primary">Xem chi tiết →</Link>}>
          <div className="mt-2 flex h-28 items-end gap-2">
            {dailyChart.map(({ day, count, isToday }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                {count > 0 && <Text type="secondary" className="text-[10px]">{count}</Text>}
                <div
                  className="w-full rounded-t-sm transition-opacity hover:opacity-80"
                  style={{ height: `${Math.max((count / maxDay) * 90, count > 0 ? 6 : 2)}px`,
                    background: isToday ? token.colorPrimary : token.colorFill }}
                />
                <Text type="secondary" className="text-xs">{day}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Template phổ biến">
          <div className="space-y-2.5">
            {templateStats.map(({ id, label, count, color }) => (
              <div key={id} className="flex items-center gap-2">
                <Text type="secondary" className="w-28 flex-shrink-0 text-xs">{label}</Text>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-divider">
                  <div className="h-full rounded-full" style={{ width: `${(count / maxTpl) * 100}%`, background: color }} />
                </div>
                <Text strong className="w-6 text-right text-xs">{count}</Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Doanh thu theo tháng"
          extra={
            <div className="flex items-center gap-1">
              <Button
                size="small"
                icon={<LeftOutlined />}
                disabled={selectedYear <= availableYears[0]}
                onClick={() => setSelectedYear(y => y - 1)}
              />
              <Text strong className="w-10 text-center text-sm">{selectedYear}</Text>
              <Button
                size="small"
                icon={<RightOutlined />}
                disabled={selectedYear >= currentYear}
                onClick={() => setSelectedYear(y => y + 1)}
              />
            </div>
          }
        >
          <div className="mt-2 flex h-28 items-end gap-1.5">
            {monthlyRevenue.map(({ month, revenue, isCurrentMonth }) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1">
                {revenue > 0 && (
                  <Text type="secondary" className="text-[9px] leading-none">{fmtVnd(revenue)}</Text>
                )}
                <div
                  className="w-full rounded-t-sm transition-opacity hover:opacity-80"
                  style={{
                    height: `${Math.max((revenue / maxMonth) * 90, revenue > 0 ? 4 : 2)}px`,
                    background: isCurrentMonth ? token.colorPrimary : token.colorFill,
                  }}
                />
                <Text type="secondary" className="text-[10px]">{month}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Doanh thu theo năm">
          <div className="space-y-3">
            {yearlyRevenue.length === 0 ? (
              <Text type="secondary" className="text-xs">Chưa có dữ liệu</Text>
            ) : (
              yearlyRevenue.map(({ year, revenue }) => (
                <div key={year} className="flex items-center gap-2">
                  <Text
                    type="secondary"
                    className="w-10 flex-shrink-0 text-xs font-medium"
                    style={{ color: year === currentYear ? token.colorPrimary : undefined }}
                  >
                    {year}
                  </Text>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-divider">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(revenue / maxYear) * 100}%`,
                        background: year === currentYear ? token.colorPrimary : token.colorFill,
                      }}
                    />
                  </div>
                  <Text strong className="w-16 text-right text-xs">{fmtVnd(revenue)}đ</Text>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Đơn hàng gần nhất"
        extra={<Link href="/dashboard/orders" className="text-xs text-primary">Xem tất cả →</Link>}>
        <Table columns={columns} dataSource={recentOrders} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  );
}
