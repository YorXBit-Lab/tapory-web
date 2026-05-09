'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Input, Select, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
  const [search, setSearch] = useState('');
  const [contentFilter, setContentFilter] = useState<string | null>(null);

  const { data: memorials = [] } = useQuery({ queryKey: ['memorials'], queryFn: () => MemorialAPI.list(), staleTime: 60_000 });
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

  const notCustomized = useMemo(() => cards.filter(c => !c.hasContent).length, [cards]);

  const templateOrderStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of memorials) counts[m.templateId] = (counts[m.templateId] ?? 0) + 1;
    return Object.entries(TEMPLATES)
      .map(([id, t]) => ({ id, label: `${t.icon} ${t.name}`, count: counts[id] ?? 0, color: t.colors.primary }))
      .sort((a, b) => b.count - a.count);
  }, [memorials]);

  const maxCount = Math.max(...templateOrderStats.map(t => t.count), 1);

  const visible = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch   = !q || r.customerName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchContent  = contentFilter === null || String(r.hasContent) === contentFilter;
    return matchSearch && matchContent;
  });

  const columns: ColumnsType<MemoryRow> = [
    {
      title: 'URL',
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
      render: (id: string) => { const t = TEMPLATES[id as keyof typeof TEMPLATES]; return t ? `${t.icon} ${t.name}` : id; },
      filters: Object.values(TEMPLATES).map(t => ({ text: `${t.icon} ${t.name}`, value: t.id })),
      onFilter: (value, record) => record.templateId === value,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'hasContent',
      filters: [{ text: 'Đã tùy chỉnh', value: 'true' }, { text: 'Chưa', value: 'false' }],
      onFilter: (value, record) => String(record.hasContent) === value,
      render: (v: boolean) => <Tag color={v ? 'green' : 'gold'}>{v ? 'Đã tùy chỉnh' : 'Chưa'}</Tag>,
    },
    {
      title: 'Hành động',
      render: (_: unknown, record: MemoryRow) => (
        <div className="flex gap-2">
          <Link href={`/view/${record.id}`} target="_blank">
            <Button type="link" size="small" style={{ padding: 0 }}>Xem</Button>
          </Link>
          <Link href={`/edit/${record.id}`} target="_blank">
            <Button type="link" size="small" style={{ padding: 0 }}>Sửa</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
        <StatCard label="Đã tùy chỉnh"   value={String(rows.filter(r => r.hasContent).length)} />
        <StatCard label="Chưa tùy chỉnh" value={String(notCustomized)} delta="cần nhắc nhở" deltaType="down" />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm khách hàng, tiêu đề, URL..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 260 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            onChange={v => setContentFilter(v ?? null)}
            size="small"
            style={{ width: 160 }}
            options={[{ label: 'Đã tùy chỉnh', value: 'true' }, { label: 'Chưa tùy chỉnh', value: 'false' }]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'],
            showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}`, size: 'small' }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card title="Kỷ niệm theo template">
        <div className="space-y-2.5">
          {templateOrderStats.map(({ id, label, count, color }) => (
            <div key={id} className="flex items-center gap-3">
              <Text type="secondary" className="w-36 flex-shrink-0 text-xs">{label}</Text>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-divider">
                <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
              </div>
              <Text strong className="w-6 text-right text-xs">{count}</Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
