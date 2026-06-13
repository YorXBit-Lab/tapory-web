'use client';

import { Button, DatePicker, Input, notification, Popconfirm, Select, Segmented, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import { STATUS_TAG, type StatusKey } from '@/components/dashboard';
import { OrderAPI, type IOrder, type OrderSource } from '@/services/OrderAPI';
import { CreateOrderModal } from './CreateOrderModal';

const { Text } = Typography;
const { RangePicker } = DatePicker;

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function exportCsv(rows: IOrder[]) {
  const headers = ['Mã đơn', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Sản phẩm', 'Giá trị', 'Trạng thái', 'Nguồn', 'Ngày đặt', 'Ghi chú'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(o => [
      escape(o.id),
      escape(o.customerName),
      escape(o.phone),
      escape(o.address),
      escape(o.items.map(i => `${i.productName} x${i.quantity}`).join(' | ')),
      escape(o.price),
      escape(o.status),
      escape(o.source ?? 'local'),
      escape(o.createdAt ? formatDate(o.createdAt) : ''),
      escape(o.notes),
    ].join(',')),
  ];
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const SOURCE_TAG: Record<OrderSource, { label: string; color: string }> = {
  local:  { label: 'Local',  color: 'blue'   },
  web:    { label: 'Website', color: 'green' },
  tiktok: { label: 'TikTok', color: 'purple' },
  shopee: { label: 'Shopee', color: 'orange' },
};

export default function OrdersPage() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [pageSize, setPageSize]   = useState(10);

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
    { label: `Tất cả (${counts.all})`,       value: 'all'     },
    { label: `Mới (${counts.new})`,           value: 'new'     },
    { label: `Chờ xử lý (${counts.pending})`, value: 'pending' },
    { label: `Đang giao (${counts.active})`,  value: 'active'  },
    { label: `Hoàn thành (${counts.done})`,   value: 'done'    },
    { label: `Đã hủy (${counts.cancel})`,     value: 'cancel'  },
  ];

  const visible = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.phone ?? '').includes(q) ||
      (o.items ?? []).some(i => i.productName.toLowerCase().includes(q));
    const matchDate = !dateRange || (() => {
      if (!o.createdAt) return false;
      const d = dayjs(o.createdAt);
      return !d.isBefore(dateRange[0].startOf('day')) && !d.isAfter(dateRange[1].endOf('day'));
    })();
    return matchStatus && matchSearch && matchDate;
  });

  const handleStatusChange = async (orderId: string, newStatus: StatusKey) => {
    try {
      const { auth } = await import('@/libs/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Chưa đăng nhập');
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Lỗi cập nhật');

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      notification.error({
        message: 'Cập nhật trạng thái thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const { auth } = await import('@/libs/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Chưa đăng nhập');
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/admin/delete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Xóa đơn hàng thất bại');

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
      notification.success({ message: `Đã xóa đơn ${orderId} và hoàn kho` });
    } catch (err) {
      notification.error({
        message: 'Xóa đơn hàng thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => <span className="font-mono text-xs text-primary">{id}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName, 'vi'),
    },
    {
      title: 'Sản phẩm',
      render: (_: unknown, r: IOrder) => {
        const names = r.items.map(i => i.productName).filter(Boolean);
        if (!names.length) return <Text type="secondary" className="text-xs">—</Text>;
        return (
          <Text className="text-xs">
            {names.slice(0, 2).join(', ')}{names.length > 2 ? ` +${names.length - 2}` : ''}
          </Text>
        );
      },
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
      sorter: (a, b) => a.price - b.price,
      render: (v: number) => <Text strong>{formatPrice(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: StatusKey, record: IOrder) => (
        <Select
          value={s}
          size="small"
          bordered={false}
          popupMatchSelectWidth={false}
          style={{ marginLeft: -7 }}
          onClick={e => e.stopPropagation()}
          onChange={v => handleStatusChange(record.id, v)}
          labelRender={({ value }) => {
            const t = STATUS_TAG[value as StatusKey];
            return t ? <Tag color={t.color} style={{ margin: 0 }}>{t.label}</Tag> : String(value);
          }}
          options={Object.entries(STATUS_TAG).map(([value, { label }]) => ({ value, label }))}
        />
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      width: 80,
      filters: [
        { text: 'Local',  value: 'local'  },
        { text: 'TikTok', value: 'tiktok' },
        { text: 'Shopee', value: 'shopee' },
      ],
      onFilter: (value, record) => record.source === value,
      render: (s: OrderSource) => {
        const src = SOURCE_TAG[s] ?? SOURCE_TAG.local;
        return <Tag color={src.color}>{src.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: unknown, record: IOrder) => (
        <Popconfirm
          title="Xóa đơn hàng?"
          description={`Đơn ${record.id} sẽ bị xóa vĩnh viễn.`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            size="small"
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={e => e.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Row 1: status filter */}
      <Segmented options={filterOptions} value={filter} onChange={v => setFilter(v as string)} />

      {/* Row 2: search + date + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm mã đơn, khách hàng, SĐT..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 240 }}
          />
          <RangePicker
            size="small"
            allowClear
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={v => setDateRange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
            format="DD/MM/YYYY"
            style={{ width: 220 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Hiển thị</span>
          <input
            type="number"
            min={1}
            max={500}
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value) || 10)}
            className="w-14 rounded border border-gray-200 px-2 py-0.5 text-center text-xs"
          />
          <span className="text-xs text-gray-400">dòng</span>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => exportCsv(visible)}>
            Xuất CSV
          </Button>
          <CreateOrderModal onCreated={(id) => { refetch(); if (id) router.push(`/dashboard/orders/${id}`); }} />
        </div>
      </div>

      {/* Kết quả filter */}
      {(dateRange || search || filter !== 'all') && (
        <Text type="secondary" className="text-xs">
          Đang hiển thị <Text strong>{visible.length}</Text> / {orders.length} đơn hàng
        </Text>
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={visible}
        rowKey="id"
        size="small"
        pagination={{
          pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} đơn`,
          size: 'small',
        }}
        onRow={record => ({
          onClick: () => router.push(`/dashboard/orders/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}
