'use client';

import { Card, Descriptions, Input, Segmented, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { STATUS_TAG, type StatusKey } from '@/components/dashboard';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { TEMPLATES } from '@/configs/constants';
import { CreateOrderModal } from './CreateOrderModal';

const { Text } = Typography;

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function templateLabel(id: string) {
  const t = TEMPLATES[id as keyof typeof TEMPLATES];
  return t ? `${t.icon} ${t.name}` : id;
}

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<IOrder | null>(null);

  const { data: orders = [], refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAPI.list(),
    staleTime: 30_000,
  });

  const counts = {
    all:     orders.length,
    new:     orders.filter(o => o.status === 'new').length,
    pending: orders.filter(o => o.status === 'pending').length,
    active:  orders.filter(o => o.status === 'active').length,
    done:    orders.filter(o => o.status === 'done').length,
    cancel:  orders.filter(o => o.status === 'cancel').length,
  };

  const filterOptions = [
    { label: `Tất cả (${counts.all})`,        value: 'all'     },
    { label: `Mới (${counts.new})`,            value: 'new'     },
    { label: `Chờ xử lý (${counts.pending})`,  value: 'pending' },
    { label: `Đang giao (${counts.active})`,   value: 'active'  },
    { label: `Hoàn thành (${counts.done})`,    value: 'done'    },
    { label: `Đã hủy (${counts.cancel})`,      value: 'cancel'  },
  ];

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      templateLabel(o.templateId).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => (
        <button
          className="font-mono text-xs text-primary hover:underline"
          onClick={e => { e.stopPropagation(); router.push(`/dashboard/orders/${id}`); }}
        >
          {id}
        </button>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName, 'vi'),
    },
    {
      title: 'Template',
      dataIndex: 'templateId',
      render: (id: string) => templateLabel(id),
      filters: Object.values(TEMPLATES).map(t => ({ text: `${t.icon} ${t.name}`, value: t.id })),
      onFilter: (value, record) => record.templateId === value,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      render: (v: string) => <Text type="secondary" className="text-xs">{v || '—'}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      sorter: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
      defaultSortOrder: 'descend',
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
    },
    {
      title: 'Giá trị',
      dataIndex: 'price',
      render: (v: number) => <Text strong>{formatPrice(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      filters: Object.entries(STATUS_TAG).map(([value, { label }]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
      render: (status: StatusKey) => {
        const s = STATUS_TAG[status];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      render: (_: unknown, record: IOrder) => (
        <span className="flex gap-2 text-xs">
          <Link href={`/view/${record.cardId}`} target="_blank" className="text-primary hover:opacity-70">
            Xem
          </Link>
          <span className="text-gray-300">·</span>
          <Link href={`/edit/${record.cardId}`} target="_blank" className="text-primary hover:opacity-70">
            Sửa
          </Link>
        </span>
      ),
    },
  ];

  const detailColumns = (title: string, items: { label: string; value: React.ReactNode; mono?: boolean }[]) => (
    <Descriptions title={title} bordered size="small" column={1}>
      {items.map(({ label, value, mono }) => (
        <Descriptions.Item key={label} label={label}>
          {mono ? <span className="font-mono text-xs">{value}</span> : value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={filterOptions}
          value={filter}
          onChange={(v) => setFilter(v as string)}
        />
        <div className="flex items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm mã đơn, khách hàng..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            style={{ width: 220 }}
          />
          <CreateOrderModal onCreated={(id) => { refetch(); if (id) router.push(`/dashboard/orders/${id}`); }} />
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
          onRow={(record) => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
        />
      </Card>

      {selected && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {detailColumns(`Chi tiết đơn ${selected.id}`, [
            { label: 'Mã đơn',       value: selected.id,                                                                                                        mono: true },
            { label: 'Số chip NFC',  value: selected.quantity ?? '—'                                                                                                      },
            { label: 'Đã tùy chỉnh', value: selected.customized ? '✓ Có' : '✗ Chưa'                                                                                     },
            { label: 'Template',     value: templateLabel(selected.templateId)                                                                                             },
            { label: 'Chi tiết',     value: <button className="text-xs text-primary hover:underline" onClick={() => router.push(`/dashboard/orders/${selected.id}`)}>Quản lý chip NFC →</button> },
          ])}

          {detailColumns('Thông tin giao hàng', [
            { label: 'Người nhận',   value: selected.customerName                                                                    },
            { label: 'Địa chỉ',     value: selected.address || '—'                                                                  },
            { label: 'Ngày đặt',    value: formatDate(selected.createdAt)                                                           },
            { label: 'Giá trị',     value: formatPrice(selected.price)                                                              },
            { label: 'Trạng thái',  value: <Tag color={STATUS_TAG[selected.status]?.color}>{STATUS_TAG[selected.status]?.label}</Tag> },
          ])}
        </div>
      )}
    </div>
  );
}
