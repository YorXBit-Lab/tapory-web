'use client';

import { useMemo, useState } from 'react';
import { Input, notification, Segmented, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import { Button } from 'antd';
import { SearchOutlined, WifiOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

/* ── NFC write button ── */
interface NDEFRecord { recordType: string; data: string }
interface NDEFWriter  { write(msg: { records: NDEFRecord[] }): Promise<void> }
declare const NDEFReader: new () => NDEFWriter;

type NfcStatus = 'idle' | 'waiting' | 'error';

function NfcBtn({ cardId, onWritten }: { cardId: string; onWritten?: () => void }) {
  const [status, setStatus] = useState<NfcStatus>('idle');

  const handleWrite = async () => {
    if (typeof NDEFReader === 'undefined') {
      notification.error({
        message: 'Trình duyệt không hỗ trợ NFC',
        description: 'Dùng Chrome + bật chrome://flags/#enable-experimental-web-platform-features',
      });
      return;
    }
    setStatus('waiting');
    try {
      const url = `${window.location.origin}/view/${cardId}`;
      await new NDEFReader().write({ records: [{ recordType: 'url', data: url }] });
      await CardAPI.markNfcWritten(cardId);
      notification.success({ message: `Đã ghi NFC: ${cardId}` });
      onWritten?.();
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      notification.error({ message: 'Ghi NFC thất bại', description: e instanceof Error ? e.message : 'Lỗi không xác định' });
    }
  };

  if (status === 'waiting') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-500">
        <Spin size="small" />
        <span>Đặt chip vào…</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <button onClick={handleWrite} className="text-xs text-red-500 hover:underline">
        ✗ Thử lại
      </button>
    );
  }
  return (
    <Tooltip title={`/view/${cardId}`}>
      <Button size="small" icon={<WifiOutlined />} onClick={handleWrite} />
    </Tooltip>
  );
}

export default function NfcPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch]   = useState('');
  const [contentFilter, setContentFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);

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
    written:   rows.filter(r => r.nfcWritten).length,
    unwritten: rows.filter(r => !r.nfcWritten).length,
    published: rows.filter(r => r.hasContent).length,
  }), [rows]);

  const filterOptions = [
    { label: `Tất cả (${rows.length})`,           value: 'all'       },
    { label: `Có nội dung (${stats.published})`,  value: 'content'   },
    { label: `Trống (${rows.length - stats.published})`, value: 'blank' },
    { label: `Chưa ghi NFC (${stats.unwritten})`, value: 'unwritten' },
  ];

  const visible = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
    const matchContent =
      contentFilter === 'all'       ? true :
      contentFilter === 'content'   ? r.hasContent :
      contentFilter === 'blank'     ? !r.hasContent :
      contentFilter === 'unwritten' ? !r.nfcWritten : true;
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
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có nội dung' : 'Trống'}</Tag>,
    },
    {
      title: 'Đã ghi NFC',
      dataIndex: 'nfcWritten',
      render: (v?: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '✓ Đã ghi' : '✗ Chưa ghi'}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (v?: string) => <Text type="secondary" className="text-xs">{formatDate(v)}</Text>,
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
      render: (_: unknown, r: ChipRow) => (
        <NfcBtn
          cardId={r.id}
          onWritten={() => queryClient.invalidateQueries({ queryKey: ['cards-all'] })}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng chip"      value={String(stats.total)}     />
        <StatCard label="Đã ghi NFC"     value={String(stats.written)}   deltaType="up"   />
        <StatCard label="Chưa ghi NFC"   value={String(stats.unwritten)} deltaType="down" />
        <StatCard label="Có nội dung"    value={String(stats.published)} />
      </div>

      <div className="space-y-3">
        <Segmented
          options={filterOptions}
          value={contentFilter}
          onChange={v => setContentFilter(v as string)}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm chip ID, mã đơn, khách hàng..."
            allowClear
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ width: 280 }}
          />
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
            showTotal: (t, r) => `${r[0]}–${r[1]} / ${t} chip`,
            size: 'small',
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}
