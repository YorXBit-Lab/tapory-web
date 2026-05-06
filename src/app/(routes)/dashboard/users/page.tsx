'use client';

import { Avatar, Button, Card, Input, Select, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { StatCard } from '@/components/dashboard';

const { Text } = Typography;

type User = {
  name: string;
  initials: string;
  email: string;
  phone: string;
  orders: number;
  total: string;
  joined: string;
};

const USERS: User[] = [
  { name: 'Nguyễn Thị Mai',  initials: 'NT', email: 'mai.nt@gmail.com',  phone: '0909 123 456', orders: 3, total: '567.000đ', joined: 'Jan 2026' },
  { name: 'Trần Văn Minh',   initials: 'TV', email: 'minh.tv@gmail.com', phone: '0912 345 678', orders: 2, total: '378.000đ', joined: 'Feb 2026' },
  { name: 'Lê Thị Hoa',      initials: 'LH', email: 'hoa.le@gmail.com',  phone: '0898 765 432', orders: 1, total: '189.000đ', joined: 'Apr 2026' },
  { name: 'Phạm Quốc Bảo',   initials: 'PB', email: 'bao.pq@gmail.com',  phone: '0876 543 210', orders: 1, total: '189.000đ', joined: 'May 2026' },
  { name: 'Hoàng Thu Thảo',  initials: 'HT', email: 'thao.ht@gmail.com', phone: '0933 111 222', orders: 2, total: '378.000đ', joined: 'Mar 2026' },
  { name: 'Vũ Mạnh Hùng',    initials: 'VH', email: 'hung.vm@gmail.com', phone: '0855 444 333', orders: 1, total: '189.000đ', joined: 'May 2026' },
];

const MONTH_ORDER: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4,  May: 5,  Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

const parseTotal = (v: string) => parseInt(v.replace(/\./g, '').replace('đ', ''));
const parseJoined = (v: string) => {
  const [mon, yr] = v.split(' ');
  return parseInt(yr) * 12 + (MONTH_ORDER[mon] ?? 0);
};

const columns: ColumnsType<User> = [
  {
    title: 'Khách hàng',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
    render: (name: string, record) => (
      <div className="flex items-center gap-2">
        <Avatar
          size={24}
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: 10, flexShrink: 0 }}
        >
          {record.initials}
        </Avatar>
        <Text strong>{name}</Text>
      </div>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  { title: 'Số điện thoại', dataIndex: 'phone' },
  {
    title: 'Số đơn',
    dataIndex: 'orders',
    align: 'center',
    sorter: (a, b) => a.orders - b.orders,
    render: (v: number) => <Text strong>{v}</Text>,
  },
  {
    title: 'Tổng chi tiêu',
    dataIndex: 'total',
    sorter: (a, b) => parseTotal(a.total) - parseTotal(b.total),
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: 'Đăng ký',
    dataIndex: 'joined',
    sorter: (a, b) => parseJoined(a.joined) - parseJoined(b.joined),
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  {
    title: 'Hành động',
    render: () => (
      <div className="flex gap-2">
        <Button type="link" size="small" style={{ padding: 0 }}>Xem</Button>
        <Button type="text" size="small" style={{ padding: 0 }}>Nhắn tin</Button>
      </div>
    ),
  },
];

export default function UsersPage() {
  const [search, setSearch]       = useState('');
  const [orderFilter, setOrderFilter] = useState<number | null>(null);

  const visible = USERS.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchOrder = orderFilter === null || u.orders >= orderFilter;
    return matchSearch && matchOrder;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng khách hàng"   value="892"  delta="↑ 47 tháng này" deltaType="up" />
        <StatCard label="Đã mua lại"         value="134"  delta="15% quay lại"   deltaType="up" />
        <StatCard label="Trung bình đơn/KH"  value="1.2" />
        <StatCard label="Chi tiêu TB"        value="227K" />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm tên, email, số điện thoại..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            style={{ width: 240 }}
          />
          <Select
            placeholder="Số đơn tối thiểu"
            allowClear
            onChange={(v) => setOrderFilter(v ?? null)}
            size="small"
            style={{ width: 170 }}
            options={[
              { label: '≥ 1 đơn', value: 1 },
              { label: '≥ 2 đơn', value: 2 },
              { label: '≥ 3 đơn', value: 3 },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="email"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
        />
      </Card>
    </div>
  );
}
