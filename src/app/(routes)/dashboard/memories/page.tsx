'use client';

import { useMemo, useState } from 'react';
import { Input, Popconfirm, Segmented, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StatCard } from '@/components/dashboard';
import { OrderAPI } from '@/services/OrderAPI';
import { CardAPI } from '@/services/CardAPI';
import { MemorialAPI } from '@/services/MemorialAPI';
import { TEMPLATES } from '@/configs/constants';

const { Text } = Typography;

interface MemoryRow {
  id: string;
  customerName: string;
  templateId: string;
  title: string;
  views: number;
  updatedAt?: string;
  hasContent: boolean;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function MemoriesPage() {
  const [search, setSearch]       = useState('');
  const [contentFilter, setContentFilter] = useState('all');
  const [pageSize, setPageSize]   = useState(10);

  const queryClient = useQueryClient();

  const { data: memorials = [] } = useQuery({ queryKey: ['memorials'], queryFn: () => MemorialAPI.list(), staleTime: 60_000 });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => MemorialAPI.deleteOne(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorials'] });
      toast.success('Đã xóa kỷ niệm');
    },
    onError: () => toast.error('Xóa thất bại, vui lòng thử lại'),
  });
  const { data: orders = [] }    = useQuery({ queryKey: ['orders'],    queryFn: () => OrderAPI.list(),   staleTime: 60_000 });
  const { data: cards = [] }     = useQuery({ queryKey: ['cards-all'], queryFn: () => CardAPI.listAll(), staleTime: 60_000 });

  const orderMap = useMemo(() => new Map(orders.map(o => [o.id, o])), [orders]);
  const cardMap  = useMemo(() => new Map(cards.map(c => [c.id, c])),  [cards]);

  const rows = useMemo<MemoryRow[]>(() => memorials.map(m => {
    const card  = cardMap.get(m.orderId);
    const order = orderMap.get(card?.orderId ?? m.orderId) ?? orderMap.get(m.orderId);
    return {
      id:           m.orderId,
      customerName: order?.customerName ?? '—',
      templateId:   m.templateId,
      title:        m.title ?? '—',
      views:        card?.stats?.totalViews ?? 0,
      updatedAt:    m.updatedAt,
      hasContent:   !!(m.title),
    };
  }), [memorials, orderMap, cardMap]);

  const stats = useMemo(() => ({
    total:      rows.length,
    customized: rows.filter(r => r.hasContent).length,
    blank:      rows.filter(r => !r.hasContent).length,
    totalViews: rows.reduce((s, r) => s + r.views, 0),
  }), [rows]);

  const templateStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of memorials) counts[m.templateId] = (counts[m.templateId] ?? 0) + 1;
    return Object.entries(TEMPLATES)
      .map(([id, t]) => ({ id, label: `${t.icon} ${t.name}`, count: counts[id] ?? 0, color: t.colors.primary }))
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [memorials]);

  const maxCount = Math.max(...templateStats.map(t => t.count), 1);

  const filterOptions = [
    { label: `Tất cả (${stats.total})`,               value: 'all'        },
    { label: `Đã tùy chỉnh (${stats.customized})`,    value: 'customized' },
    { label: `Chưa tùy chỉnh (${stats.blank})`,       value: 'blank'      },
  ];

  const visible = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = !q || r.customerName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchContent =
      contentFilter === 'all'        ? true :
      contentFilter === 'customized' ? r.hasContent :
      contentFilter === 'blank'      ? !r.hasContent : true;
    return matchSearch && matchContent;
  });

  const columns: ColumnsType<MemoryRow> = [
    {
      title: 'Link',
      dataIndex: 'id',
      render: (id: string) => (
        <Link href={`/view/${id}`} target="_blank" className="font-mono text-xs text-primary hover:opacity-70">
          /view/{id}
        </Link>
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
      render: (id: string) => {
        const t = TEMPLATES[id as keyof typeof TEMPLATES];
        return t ? `${t.icon} ${t.name}` : id;
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      sorter: (a, b) => a.views - b.views,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      defaultSortOrder: 'descend',
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'hasContent',
      render: (v: boolean) => <Tag color={v ? 'green' : 'gold'}>{v ? 'Đã tùy chỉnh' : 'Chưa'}</Tag>,
    },
    {
      title: 'Hành động',
      render: (_: unknown, r: MemoryRow) => (
        <span className="flex gap-2 text-xs">
          <Link href={`/view/${r.id}`} target="_blank" className="text-primary hover:opacity-70">Xem</Link>
          <Link href={`/edit/${r.id}`} target="_blank" className="text-primary hover:opacity-70">Sửa</Link>
          <Popconfirm
            title="Xóa kỷ niệm này?"
            description="Hành động không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => deleteMutation.mutate(r.id)}
          >
            <button className="text-red-400 hover:text-red-600">Xóa</button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng kỷ niệm"     value={String(stats.total)}      />
        <StatCard label="Đã tùy chỉnh"     value={String(stats.customized)} deltaType="up"   />
        <StatCard label="Chưa tùy chỉnh"   value={String(stats.blank)}      deltaType="down" />
        <StatCard label="Tổng lượt xem"    value={String(stats.totalViews)} />
      </div>

      <div className="space-y-3">
        <Segmented options={filterOptions} value={contentFilter} onChange={v => setContentFilter(v as string)} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Input
            prefix={<SearchOutlined className="text-content3" />}
            placeholder="Tìm khách hàng, tiêu đề, link..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 280 }}
          />
          <div className="flex items-center gap-2">
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
          rowKey="id"
          size="small"
          pagination={{
            pageSize,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (t, r) => `${r[0]}–${r[1]} / ${t} kỷ niệm`,
            size: 'small',
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {templateStats.length > 0 && (
        <div className="rounded-lg border border-border bg-elevated p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Template phổ biến</p>
          <div className="space-y-2.5">
            {templateStats.map(({ id, label, count, color }) => (
              <div key={id} className="flex items-center gap-3">
                <Text type="secondary" className="w-36 flex-shrink-0 text-xs">{label}</Text>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
                </div>
                <Text strong className="w-6 text-right text-xs">{count}</Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
