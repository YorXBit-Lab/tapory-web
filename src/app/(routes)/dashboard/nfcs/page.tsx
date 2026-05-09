'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Input, Table, Tag, Tooltip, Typography } from 'antd';
import { SearchOutlined, WifiOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard';
import { CardAPI } from '@/services/CardAPI';
import { OrderAPI } from '@/services/OrderAPI';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface ChipRow {
  id: string;
  orderId: string;
  customerName: string;
  hasContent: boolean;
  nfcWritten?: boolean;
  createdAt?: string;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/* ── NFC write button (inline, reused from order detail) ── */
interface NDEFRecord { recordType: string; data: string }
interface NDEFWriter  { write(msg: { records: NDEFRecord[] }): Promise<void> }
declare const NDEFReader: new () => NDEFWriter;

function NfcBtn({ cardId }: { cardId: string }) {
  const handleWrite = async () => {
    if (typeof NDEFReader === 'undefined') {
      alert('Trình duyệt không hỗ trợ NFC. Dùng Chrome + bật experimental Web Platform features.');
      return;
    }
    try {
      const url = `${window.location.origin}/c/${cardId}`;
      await new NDEFReader().write({ records: [{ recordType: 'url', data: url }] });
      alert(`✓ Đã ghi NFC: ${cardId}`);
    } catch (e) {
      alert(`Lỗi: ${e instanceof Error ? e.message : e}`);
    }
  };
  return (
    <Tooltip title={`Ghi /c/${cardId}`}>
      <Button size="small" icon={<WifiOutlined />} onClick={handleWrite} />
    </Tooltip>
  );
}

export default function NfcPage() {
  const router = useRouter();
  const [search, setSearch]       = useState('');
  const [contentFilter, setContentFilter] = useState<string | null>(null);

  const { data: cards = [] }  = useQuery({ queryKey: ['cards-all'], queryFn: () => CardAPI.listAll(), staleTime: 60_000 });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'],    queryFn: () => OrderAPI.list(),   staleTime: 60_000 });

  const orderMap = useMemo(() => new Map(orders.map(o => [o.id, o])), [orders]);

  const rows = useMemo<ChipRow[]>(() => cards.map(c => ({
    id:           c.id,
    orderId:      c.orderId ?? '—',
    customerName: orderMap.get(c.orderId ?? '')?.customerName ?? '—',
    hasContent:   c.hasContent,
    nfcWritten:   c.nfcWritten,
    createdAt:    c.createdAt,
  })), [cards, orderMap]);

  const stats = useMemo(() => ({
    total:     rows.length,
    published: rows.filter(r => r.hasContent).length,
    blank:     rows.filter(r => !r.hasContent).length,
    written:   rows.filter(r => r.nfcWritten).length,
  }), [rows]);

  const visible = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = !q || r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
    const matchContent = contentFilter === null || String(r.hasContent) === contentFilter;
    return matchSearch && matchContent;
  });

  const columns: ColumnsType<ChipRow> = [
    {
      title: 'Chip ID',
      dataIndex: 'id',
      render: (id: string) => <Text className="font-mono text-xs">{id}</Text>,
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orderId',
      render: (id: string) => (
        <button className="font-mono text-xs text-primary hover:underline"
          onClick={() => router.push(`/dashboard/orders/${id}`)}>
          {id}
        </button>
      ),
    },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    {
      title: 'Nội dung',
      dataIndex: 'hasContent',
      filters: [{ text: 'Có nội dung', value: 'true' }, { text: 'Trống', value: 'false' }],
      onFilter: (v, r) => String(r.hasContent) === v,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có nội dung' : 'Trống'}</Tag>,
    },
    {
      title: 'Đã ghi NFC',
      dataIndex: 'nfcWritten',
      filters: [{ text: '✓ Đã ghi', value: 'true' }, { text: '✗ Chưa ghi', value: 'false' }],
      onFilter: (v, r) => String(!!r.nfcWritten) === v,
      render: (v?: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '✓ Đã ghi' : '✗ Chưa ghi'}</Tag>,
    },
    {
      title: 'Link',
      render: (_: unknown, r: ChipRow) => (
        <span className="flex gap-2 text-xs">
          <Link href={`/view/${r.id}`} target="_blank" className="text-primary hover:opacity-70">Xem</Link>
          <Link href={`/edit/${r.id}`} target="_blank" className="text-primary hover:opacity-70">Sửa</Link>
        </span>
      ),
    },
    {
      title: 'Ghi NFC',
      render: (_: unknown, r: ChipRow) => <NfcBtn cardId={r.id} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng chip"       value={String(stats.total)}     />
        <StatCard label="Đã ghi NFC"      value={String(stats.written)}   deltaType="up"   />
        <StatCard label="Chưa ghi NFC"    value={String(stats.total - stats.written)} deltaType="down" />
        <StatCard label="Có nội dung"     value={String(stats.published)} />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm chip ID, mã đơn, khách hàng..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 260 }}
          />
          <Button.Group size="small">
            <Button onClick={() => setContentFilter(null)}     type={contentFilter === null    ? 'primary' : 'default'}>Tất cả</Button>
            <Button onClick={() => setContentFilter('true')}   type={contentFilter === 'true'  ? 'primary' : 'default'}>Có nội dung</Button>
            <Button onClick={() => setContentFilter('false')}  type={contentFilter === 'false' ? 'primary' : 'default'}>Trống</Button>
          </Button.Group>
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

    </div>
  );
}
