'use client';

import { useMemo, useState } from 'react';
import { Input, Select, Table, Typography, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard';
import { OrderAPI } from '@/services/OrderAPI';

const { Text } = Typography;

interface Customer {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  firstOrder?: string;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleString('vi-VN', { month: 'short' })} ${d.getFullYear()}`;
}

export default function UsersPage() {
  const { token } = theme.useToken();
  const [search, setSearch]       = useState('');
  const [minOrders, setMinOrders] = useState<number | null>(null);
  const [pageSize, setPageSize]   = useState(10);

  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => OrderAPI.list(), staleTime: 60_000 });

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = o.phone;
      if (!map.has(key)) map.set(key, { phone: key, name: o.customerName, orderCount: 0, totalSpent: 0 });
      const c = map.get(key)!;
      c.orderCount++;
      c.totalSpent += o.price;
      if (o.createdAt && (!c.firstOrder || o.createdAt < c.firstOrder)) c.firstOrder = o.createdAt;
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const stats = useMemo(() => {
    const total     = customers.length;
    const repeat    = customers.filter(c => c.orderCount > 1).length;
    const avgOrders = total > 0 ? (orders.length / total).toFixed(1) : '0';
    const avgSpend  = total > 0 ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / total) : 0;
    return { total, repeat, avgOrders, avgSpend };
  }, [customers, orders.length]);

  const visible = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
    const matchOrder  = !minOrders || c.orderCount >= minOrders;
    return matchSearch && matchOrder;
  });

  const columns: ColumnsType<Customer> = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
          >
            {initials(name)}
          </div>
          <Text strong>{name}</Text>
        </div>
      ),
    },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    {
      title: 'Số đơn',
      dataIndex: 'orderCount',
      align: 'center',
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (v: number) => (
        <span
          className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: v > 1 ? token.colorPrimaryBg : token.colorFillSecondary,
            color: v > 1 ? token.colorPrimary : token.colorTextSecondary,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      defaultSortOrder: 'descend',
      render: (v: number) => <Text strong>{v.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Khách từ',
      dataIndex: 'firstOrder',
      sorter: (a, b) => (a.firstOrder ?? '').localeCompare(b.firstOrder ?? ''),
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng khách hàng" value={String(stats.total)}                                                    />
        <StatCard label="Mua lại"          value={String(stats.repeat)}  delta={`${stats.total > 0 ? Math.round(stats.repeat / stats.total * 100) : 0}% quay lại`} deltaType="up" />
        <StatCard label="TB đơn / khách"  value={stats.avgOrders}                                                         />
        <StatCard label="Chi tiêu TB"      value={`${(stats.avgSpend / 1000).toFixed(0)}K`}                               />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Input
            prefix={<SearchOutlined className="text-content3" />}
            placeholder="Tìm tên, số điện thoại..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 260 }}
          />
          <div className="flex items-center gap-2">
            <Select
              placeholder="Số đơn tối thiểu"
              allowClear
              onChange={v => setMinOrders(v ?? null)}
              size="small"
              style={{ width: 160 }}
              options={[
                { label: '≥ 1 đơn', value: 1 },
                { label: '≥ 2 đơn (mua lại)', value: 2 },
                { label: '≥ 3 đơn', value: 3 },
              ]}
            />
            <span className="text-xs text-content3">Hiển thị</span>
            <input
              type="number"
              min={1}
              max={500}
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value) || 10)}
              className="w-14 rounded border border-border px-2 py-0.5 text-center text-xs"
            />
            <span className="text-xs text-content3">dòng</span>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={visible}
          rowKey="phone"
          size="small"
          pagination={{
            pageSize,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (t, r) => `${r[0]}–${r[1]} / ${t} khách`,
            size: 'small',
          }}
        />
      </div>
    </div>
  );
}
