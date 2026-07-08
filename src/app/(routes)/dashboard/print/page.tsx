'use client';

import { useMemo, useState } from 'react';
import {
  App, Button, Card, Segmented, Table, Tag, Tooltip, Typography,
} from 'antd';
import {
  CheckCircleOutlined, ExportOutlined, FilePdfOutlined, LinkOutlined, RollbackOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { StatCard } from '@/components/dashboard';
import type { IPrintConfig } from '@/configs/types';

const { Text } = Typography;

/* ── helpers ── */
function getPrintStats(order: IOrder) {
  const total = order.items.reduce((s, i) => {
    if (!i.printConfig?.enabled) return s;
    return s + i.quantity * 2; // luôn 2 mặt: A + B
  }, 0);
  const uploaded = new Set(
    (order.printPhotos ?? []).map(p => `${p.itemIndex}-${p.slotIndex}-${p.side ?? 'a'}`),
  ).size;
  return { total, uploaded };
}

function shapeTag(cfg: IPrintConfig) {
  if (cfg.shape === 'circle') return { label: `Tròn ⌀${cfg.diameter}cm`, color: 'blue' };
  if (cfg.shape === 'square') return { label: `Vuông ${cfg.width}cm`, color: 'purple' };
  return { label: `${cfg.width}×${cfg.height}cm`, color: 'default' };
}

type PrintFilter = 'all' | 'waiting' | 'ready';

/* ── page ── */
export default function PrintPage() {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<PrintFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAPI.list(),
    staleTime: 30_000,
  });

  // Only orders that have at least one print item
  const printOrders = useMemo(
    () => orders.filter(o => o.items.some(i => i.printConfig?.enabled)),
    [orders],
  );

  const { waiting, ready, readyUnprinted } = useMemo(() => {
    const waiting: IOrder[] = [];
    const ready: IOrder[] = [];
    const readyUnprinted: IOrder[] = [];
    for (const o of printOrders) {
      const { total, uploaded } = getPrintStats(o);
      if (uploaded >= total) {
        ready.push(o);
        if (!o.printedAt) readyUnprinted.push(o);
      } else {
        waiting.push(o);
      }
    }
    return { waiting, ready, readyUnprinted };
  }, [printOrders]);

  const visible = filter === 'waiting' ? waiting : filter === 'ready' ? ready : printOrders;

  const totalPhotoSlots = useMemo(
    () => printOrders.reduce((s, o) => s + getPrintStats(o).total, 0),
    [printOrders],
  );
  const totalUploaded = useMemo(
    () => printOrders.reduce((s, o) => s + getPrintStats(o).uploaded, 0),
    [printOrders],
  );

  /* ── PDF export ── */
  const handleExportPdf = async () => {
    if (!user || !selectedIds.length) return;
    setExporting(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/export-print-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderIds: selectedIds }),
      });

      if (!res.ok) {
        let msg = 'Xuất PDF thất bại';
        try { msg = ((await res.json()) as { error?: string }).error ?? msg; } catch { /* empty body */ }
        throw new Error(msg);
      }

      const filename = `in-anh-${new Date().toISOString().slice(0, 10)}.pdf`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Mark all exported orders as printed
      const printedAt = new Date().toISOString();
      await Promise.all(selectedIds.map(id => OrderAPI.update(id, { printedAt })));
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      notification.success({
        message: `Đã xuất PDF cho ${selectedIds.length} đơn hàng`,
        description: filename,
        duration: 5,
      });
      setSelectedIds([]);
    } catch (err) {
      notification.error({
        message: 'Xuất PDF thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setExporting(false);
    }
  };

  /* ── Toggle printed status ── */
  const handleTogglePrinted = async (order: IOrder) => {
    setTogglingId(order.id);
    try {
      const printedAt = order.printedAt ? (null as unknown as string) : new Date().toISOString();
      await OrderAPI.update(order.id, { printedAt });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch {
      notification.error({ message: 'Cập nhật thất bại', duration: 2 });
    } finally {
      setTogglingId(null);
    }
  };

  /* ── table columns ── */
  const columns: ColumnsType<IOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => (
        <Link href={`/dashboard/orders/${id}`} className="font-mono text-xs text-primary hover:underline">
          {id}
        </Link>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      render: (v: string) => <Text className="text-sm">{v}</Text>,
    },
    {
      title: 'Sản phẩm cần in',
      render: (_: unknown, record: IOrder) => (
        <div className="flex flex-col gap-1">
          {record.items
            .filter(i => i.printConfig?.enabled)
            .map((item, idx) => {
              const { label, color } = shapeTag(item.printConfig!);
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  <Tag color={color} className="text-[11px]">{label}</Tag>
                  <Text className="text-xs">{item.productName}</Text>
                  {item.quantity > 1 && (
                    <Text type="secondary" className="text-xs">×{item.quantity}</Text>
                  )}
                </div>
              );
            })}
        </div>
      ),
    },
    {
      title: 'Ảnh',
      width: 100,
      render: (_: unknown, record: IOrder) => {
        const { total, uploaded } = getPrintStats(record);
        const done = uploaded >= total;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${done ? 'text-success' : 'text-warning'}`}>
              {uploaded}/{total}
            </span>
            {done
              ? <Tag color="green" className="text-xs">Đủ ảnh</Tag>
              : <Tag color="orange" className="text-xs">Chờ ảnh</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      width: 150,
      render: (_: unknown, record: IOrder) => {
        const { total, uploaded } = getPrintStats(record);
        if (uploaded < total) return <Tag color="orange">Chờ ảnh khách</Tag>;
        const loading = togglingId === record.id;
        if (record.printedAt) {
          const date = new Date(record.printedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          return (
            <Button
              size="small"
              icon={<RollbackOutlined />}
              loading={loading}
              onClick={() => handleTogglePrinted(record)}
              className="text-content2 border-border"
            >
              Đã in {date}
            </Button>
          );
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={loading}
            onClick={() => handleTogglePrinted(record)}
          >
            Sẵn sàng in
          </Button>
        );
      },
    },
    {
      title: '',
      width: 80,
      render: (_: unknown, record: IOrder) => {
        const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${record.id}`;
        return (
          <Tooltip title="Copy link upload cho khách">
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(uploadUrl);
                notification.success({ message: 'Đã copy link', duration: 2 });
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  const filterOptions = [
    { label: `Tất cả (${printOrders.length})`, value: 'all' },
    { label: `Chờ ảnh (${waiting.length})`, value: 'waiting' },
    { label: `Sẵn sàng in (${ready.length})`, value: 'ready' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Đơn cần in"
          value={String(printOrders.length)}
        />
        <StatCard
          label="Chờ ảnh khách"
          value={String(waiting.length)}
          delta={waiting.length > 0 ? 'Chưa đủ ảnh' : 'Không có'}
          deltaType={waiting.length > 0 ? 'down' : 'up'}
        />
        <StatCard
          label="Sẵn sàng in"
          value={String(ready.length)}
          delta={ready.length > 0 ? 'Có thể xuất PDF' : 'Chưa có'}
          deltaType={ready.length > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Tiến độ ảnh"
          value={`${totalUploaded}/${totalPhotoSlots}`}
          delta={totalPhotoSlots > 0 ? `${Math.round((totalUploaded / totalPhotoSlots) * 100)}%` : '—'}
          deltaType={totalUploaded >= totalPhotoSlots && totalPhotoSlots > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Table */}
      <Card
        title="Danh sách đơn cần in ảnh"
        extra={
          selectedIds.length > 0 && (
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              loading={exporting}
              onClick={handleExportPdf}
            >
              Xuất PDF ({selectedIds.length} đơn)
            </Button>
          )
        }
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Segmented
            options={filterOptions}
            value={filter}
            onChange={v => { setFilter(v as PrintFilter); setSelectedIds([]); }}
          />
          {readyUnprinted.length > 0 && (
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={() => setSelectedIds(readyUnprinted.map(o => o.id))}
            >
              Chọn đủ ảnh & chưa in ({readyUnprinted.length})
            </Button>
          )}
        </div>

        <Table
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: (keys) => setSelectedIds(keys as string[]),
            getCheckboxProps: (record) => ({
              disabled: getPrintStats(record).uploaded === 0,
            }),
          }}
          columns={columns}
          dataSource={visible}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20, showTotal: (t, r) => `${r[0]}–${r[1]} / ${t}`, size: 'small' }}
          locale={{ emptyText: 'Không có đơn hàng cần in ảnh' }}
          expandable={{
            expandedRowRender: (record) => <PhotoGrid order={record} />,
            rowExpandable: (record) => (record.printPhotos?.length ?? 0) > 0,
          }}
        />

        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-4 py-2.5">
            <Text className="text-sm">
              Đã chọn <Text strong>{selectedIds.length}</Text> đơn hàng để xuất PDF
            </Text>
            <div className="flex gap-2">
              <Button size="small" onClick={() => setSelectedIds([])}>Bỏ chọn</Button>
              <Button
                type="primary"
                size="small"
                icon={<FilePdfOutlined />}
                loading={exporting}
                onClick={handleExportPdf}
              >
                Xuất PDF
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── Expanded row: photo grid ── */
function PhotoGrid({ order }: { order: IOrder }) {
  const slots = (order.printPhotos ?? []).sort(
    (a, b) => a.itemIndex - b.itemIndex || a.slotIndex - b.slotIndex || (a.side ?? 'a').localeCompare(b.side ?? 'a'),
  );

  if (!slots.length) return <Text type="secondary" className="text-xs">Chưa có ảnh nào được upload.</Text>;

  return (
    <div className="flex flex-wrap gap-3 py-2">
      {slots.map((slot, i) => {
        const item = order.items[slot.itemIndex];
        const cfg = item?.printConfig;
        const shapeStyle: React.CSSProperties =
          cfg?.shape === 'circle' ? { borderRadius: '50%' } : { borderRadius: 6 };

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.url}
              alt={`ảnh ${slot.slotIndex + 1}`}
              style={{ width: 80, height: 80, objectFit: 'cover', ...shapeStyle }}
            />
            <Text type="secondary" className="text-[10px]">
              {item?.productName ?? `Sản phẩm ${slot.itemIndex + 1}`}
              {(item?.quantity ?? 1) > 1 ? ` (${slot.slotIndex + 1})` : ''}
              {slot.side ? ` • Mặt ${slot.side.toUpperCase()}` : ''}
            </Text>
            <a
              href={slot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline"
            >
              Xem gốc <ExportOutlined />
            </a>
          </div>
        );
      })}
    </div>
  );
}
