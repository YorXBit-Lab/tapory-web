'use client';

import { useMemo, useState } from 'react';
import { Avatar, Card, Input, Select, Table, Typography } from 'antd';
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
  const [search, setSearch] = useState('');
  const [minOrders, setMinOrders] = useState<number | null>(null);

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
    return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
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
          <Avatar size={24} style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: 10, flexShrink: 0 }}>
            {initials(name)}
          </Avatar>
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
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      defaultSortOrder: 'descend',
      render: (v: number) => <Text strong>{v.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Đăng ký',
      dataIndex: 'firstOrder',
      sorter: (a, b) => (a.firstOrder ?? '').localeCompare(b.firstOrder ?? ''),
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng khách hàng"  value={String(stats.total)}                              />
        <StatCard label="Đã mua lại"        value={String(stats.repeat)}  delta={`${stats.repeat > 0 ? Math.round(stats.repeat / stats.total * 100) : 0}% quay lại`} deltaType="up" />
        <StatCard label="TB đơn / khách"    value={stats.avgOrders}                                  />
        <StatCard label="Chi tiêu TB"       value={`${(stats.avgSpend / 1000).toFixed(0)}K`}         />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm tên, số điện thoại..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 240 }}
          />
          <Select
            placeholder="Số đơn tối thiểu"
            allowClear
            onChange={v => setMinOrders(v ?? null)}
            size="small"
            style={{ width: 170 }}
            options={[{ label: '≥ 1 đơn', value: 1 }, { label: '≥ 2 đơn', value: 2 }, { label: '≥ 3 đơn', value: 3 }]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="phone"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'],
            showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}`, size: 'small' }}
        />
      </Card>
    </div>
  );
}
