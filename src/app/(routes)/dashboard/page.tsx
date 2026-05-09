'use client';

import { useMemo } from 'react';
import { Card, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { StatCard, STATUS_TAG, type StatusKey } from '@/components/dashboard';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { CardAPI } from '@/services/CardAPI';
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

export default function DashboardOverviewPage() {
  const { token } = theme.useToken();
  const router = useRouter();

  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => OrderAPI.list(), staleTime: 60_000 });
  const { data: cards = [] }  = useQuery({ queryKey: ['cards-all'], queryFn: () => CardAPI.listAll(), staleTime: 60_000 });

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7);
    const todayOrders   = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today).length;
    const monthRevenue  = orders.filter(o => o.createdAt?.startsWith(thisMonth)).reduce((s, o) => s + o.price, 0);
    const totalCustomers = new Set(orders.map(o => o.phone)).size;
    return { todayOrders, monthRevenue, totalCustomers, totalChips: cards.length };
  }, [orders, cards]);

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
    for (const o of orders) counts[o.templateId] = (counts[o.templateId] ?? 0) + 1;
    return Object.entries(TEMPLATES)
      .map(([id, t]) => ({ id, label: `${t.icon} ${t.name}`, count: counts[id] ?? 0, color: t.colors.primary }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  const maxTpl = Math.max(...templateStats.map(t => t.count), 1);

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
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Đơn hàng hôm nay"        value={String(stats.todayOrders)}          />
        <StatCard label="Doanh thu tháng"           value={fmtVnd(stats.monthRevenue) + 'đ'}   />
        <StatCard label="Tổng khách hàng"           value={fmt(stats.totalCustomers)}           />
        <StatCard label="Chip NFC"                  value={fmt(stats.totalChips)}               />
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

      <Card title="Đơn hàng gần nhất"
        extra={<Link href="/dashboard/orders" className="text-xs text-primary">Xem tất cả →</Link>}>
        <Table columns={columns} dataSource={recentOrders} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  );
}
