'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  InputNumber,
  Modal,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  notification,
} from 'antd';
import { ArrowLeftOutlined, CopyOutlined, PlusOutlined, WifiOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { OrderAPI, type OrderSource, type IOrderItem } from '@/services/OrderAPI';
import { EditOrderModal } from '../EditOrderModal';
import { CardAPI } from '@/services/CardAPI';
import { STATUS_TAG } from '@/components/dashboard';
import { TEMPLATES } from '@/configs/constants';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import type { ICard } from '@/configs/types';

const { Text } = Typography;

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/* ── Web NFC types (not in TS stdlib) ── */
interface NDEFRecord {
  recordType: string;
  data: string;
}
interface NDEFWriter {
  write(msg: { records: NDEFRecord[] }): Promise<void>;
}
declare const NDEFReader: new () => NDEFWriter;

type NfcStatus = 'idle' | 'waiting' | 'error';

function NfcWriteButton({ card, onWritten }: { card: ICard; onWritten: () => void }) {
  const [status, setStatus] = useState<NfcStatus>('idle');
  const [errMsg, setErrMsg] = useState('');

  const nfcUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/view/${card.id}`;

  const handleWrite = async () => {
    if (typeof NDEFReader === 'undefined') {
      notification.error({
        message: 'Trình duyệt không hỗ trợ',
        description: 'Dùng Chrome + bật chrome://flags/#enable-experimental-web-platform-features',
      });
      return;
    }
    setStatus('waiting');
    setErrMsg('');
    try {
      await new NDEFReader().write({ records: [{ recordType: 'url', data: nfcUrl }] });
      await CardAPI.markNfcWritten(card.id);
      notification.success({ message: `Đã ghi NFC: ${card.id}` });
      onWritten();
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  };

  if (status === 'waiting') {
    return (
      <div className="flex items-center gap-2 text-xs text-blue-500">
        <Spin size="small" />
        <span>Đặt chip vào thiết bị…</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <Tooltip title={errMsg}>
        <button onClick={handleWrite} className="text-xs text-red-500 hover:underline">
          ✗ Lỗi — thử lại
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={nfcUrl}>
      <Button
        size="small"
        icon={<WifiOutlined />}
        onClick={handleWrite}
        type={card.nfcWritten ? 'default' : 'primary'}
      >
        {card.nfcWritten ? 'Ghi lại' : 'Ghi NFC'}
      </Button>
    </Tooltip>
  );
}

/* ── Add chip modal ── */
function AddChipModal({ orderId, onAdded }: { orderId: string; onAdded: () => void }) {
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/add-chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, count }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Thất bại');
      notification.success({ message: `Đã thêm ${count} chip mới` });
      setOpen(false);
      onAdded();
    } catch (e) {
      notification.error({ message: e instanceof Error ? e.message : 'Lỗi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Thêm chip
      </Button>
      <Modal
        title="Thêm chip NFC"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
        confirmLoading={loading}
        width={320}
      >
        <div className="py-3">
          <Text className="mb-3 block text-sm">Số lượng chip muốn thêm:</Text>
          <InputNumber
            min={1}
            max={10}
            value={count}
            onChange={(v) => setCount(v ?? 1)}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </>
  );
}

/* ── Main page ── */
export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderAPI.getOne(orderId),
  });

  const { data: chips = [], isLoading: chipsLoading } = useQuery({
    queryKey: ['cards', orderId],
    queryFn: () => CardAPI.listByOrder(orderId),
  });

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['cards', orderId] });
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };

  function chipStatus(card: ICard) {
    if (card.hasContent) return <Tag color="green">Đã có nội dung</Tag>;
    return <Tag color="default">Chưa có nội dung</Tag>;
  }

  function nfcStatusTag(card: ICard) {
    if (card.nfcWritten) {
      const at = card.nfcWrittenAt ? new Date(card.nfcWrittenAt).toLocaleDateString('vi-VN') : '';
      return <Tag color="green">✓ Đã ghi{at ? ` ${at}` : ''}</Tag>;
    }
    return <Tag color="red">✗ Chưa ghi</Tag>;
  }

  const columns: ColumnsType<ICard> = [
    {
      title: '#',
      render: (_: unknown, __: ICard, i: number) => <Text type="secondary">{i + 1}</Text>,
      width: 40,
    },
    {
      title: 'Mã chip',
      dataIndex: 'id',
      render: (id: string) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: 'Nội dung',
      render: (_: unknown, record: ICard) => chipStatus(record),
    },
    {
      title: 'Đã ghi NFC',
      render: (_: unknown, record: ICard) => nfcStatusTag(record),
      filters: [
        { text: '✓ Đã ghi', value: 'true' },
        { text: '✗ Chưa ghi', value: 'false' },
      ],
      onFilter: (value, record) => String(!!record.nfcWritten) === value,
    },
    {
      title: 'Link sẽ ghi vào chip',
      render: (_: unknown, record: ICard) => {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/view/${record.id}`;
        return (
          <Text
            copyable={{ text: url, tooltips: ['Copy', 'Đã copy!'] }}
            className="text-content3 font-mono text-xs"
          >
            /view/{record.id}
          </Text>
        );
      },
    },
    {
      title: 'Xem / Sửa',
      render: (_: unknown, record: ICard) => (
        <span className="flex gap-3 text-xs">
          {record.hasContent ? (
            <Link
              href={`/view/${record.id}`}
              target="_blank"
              className="text-primary hover:opacity-70"
            >
              Xem
            </Link>
          ) : (
            <span className="cursor-not-allowed text-gray-300">Xem</span>
          )}
          <Link
            href={`/edit/${record.id}${record.templateId ? `?template=${record.templateId}` : ''}`}
            target="_blank"
            className="text-primary hover:opacity-70"
          >
            Sửa
          </Link>
        </span>
      ),
    },
    {
      title: 'Ghi NFC',
      render: (_: unknown, record: ICard) => (
        <NfcWriteButton card={record} onWritten={refetchAll} />
      ),
    },
  ];

  if (orderLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Text type="secondary">Không tìm thấy đơn hàng</Text>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  const statusTag = STATUS_TAG[order.status];
  const isLocal = ((order.source as OrderSource | undefined) ?? 'local') === 'local';
  const hasNfcItems = order.items.some((i) => i.isNfc);
  const hasPrintItems = order.items.some((i) => i.printConfig?.enabled);
  const printUploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${orderId}`;

  const SOURCE_LABEL: Record<OrderSource, { label: string; color: string }> = {
    local: { label: 'Local', color: 'blue' },
    tiktok: { label: 'TikTok', color: 'purple' },
    shopee: { label: 'Shopee', color: 'orange' },
  };
  const srcInfo = SOURCE_LABEL[order.source as OrderSource] ?? SOURCE_LABEL.local;

  // Build item → chip IDs mapping using sequential NFC counter
  const itemChipMap = (() => {
    const map = new Map<number, string[]>();
    let counter = 0;
    order.items.forEach((item, idx) => {
      if (!item.isNfc) return;
      const chipIds: string[] = [];
      for (let q = 0; q < (item.quantity ?? 1); q++) {
        counter++;
        chipIds.push(`${orderId}C${counter}`);
      }
      map.set(idx, chipIds);
    });
    return map;
  })();

  const itemColumns: ColumnsType<IOrderItem> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      render: (name: string, r: IOrderItem) => (
        <span className="flex items-center gap-1.5">
          {name}
          {r.isNfc && (
            <Tag color="purple" className="m-0 text-[11px]">
              NFC
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      width: 50,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      width: 120,
      render: (v: number) => v.toLocaleString('vi-VN') + 'đ',
    },
    {
      title: 'Thành tiền',
      width: 120,
      render: (_: unknown, r: IOrderItem) =>
        (r.unitPrice * r.quantity).toLocaleString('vi-VN') + 'đ',
    },
    {
      title: 'Loại / Template',
      render: (_: unknown, r: IOrderItem, idx: number) => {
        if (!r.isNfc) return <Tag>Thường</Tag>;
        const tpl = TEMPLATES[r.templateId as keyof typeof TEMPLATES];
        const chipIds = itemChipMap.get(idx) ?? [];
        return (
          <div className="flex flex-wrap items-center gap-1">
            <Tag color="purple">{tpl ? `${tpl.icon} NFC` : 'NFC'}</Tag>
            {chipIds.map((chipId) => (
              <Link
                key={chipId}
                href={`/edit/${chipId}${r.templateId ? `?template=${r.templateId}` : ''}`}
                target="_blank"
                className="text-primary font-mono text-[11px] hover:opacity-70"
              >
                {chipId}
              </Link>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/dashboard/orders')}>
          Đơn hàng
        </Button>
        <h2 className="text-base font-semibold">Đơn hàng {order.id}</h2>
        <Tag color={statusTag?.color}>{statusTag?.label}</Tag>
        <Tag color={srcInfo.color}>{srcInfo.label}</Tag>
        {isLocal && (
          <EditOrderModal
            order={order}
            asButton
            onUpdated={() => queryClient.invalidateQueries({ queryKey: ['order', orderId] })}
          />
        )}
      </div>

      {/* Order info */}
      <Card size="small">
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Khách hàng">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{order.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">{formatDate(order.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{order.address || '—'}</Descriptions.Item>
          <Descriptions.Item label="Tổng giá trị" span={2}>
            <Text strong>{order.price.toLocaleString('vi-VN')}đ</Text>
          </Descriptions.Item>
          {isLocal && hasNfcItems && (
            <Descriptions.Item label="Chip NFC" span={3}>
              {chips.length} chip
            </Descriptions.Item>
          )}
          {hasPrintItems && (
            <Descriptions.Item label="Link upload ảnh in" span={3}>
              <div className="flex items-center gap-2">
                <Text copyable={false} className="font-mono text-xs text-blue-600">
                  {printUploadUrl}
                </Text>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(printUploadUrl);
                    notification.success({ message: 'Đã copy link', duration: 2 });
                  }}
                >
                  Copy
                </Button>
              </div>
            </Descriptions.Item>
          )}
          {order.notes && (
            <Descriptions.Item label="Ghi chú" span={3}>
              {order.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Danh sách sản phẩm */}
      {order.items.length > 0 && (
        <Card size="small" title="Sản phẩm đặt">
          <Table
            columns={itemColumns}
            dataSource={order.items}
            rowKey={(item) => `${item.productName}|${item.unitPrice}|${item.quantity}`}
            size="small"
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text type="secondary" className="text-xs">
                    Tổng cộng
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{order.price.toLocaleString('vi-VN')}đ</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {/* Chips table — chỉ hiện nếu đơn có sản phẩm NFC */}
      {isLocal && hasNfcItems && (
        <Card
          size="small"
          title={
            <span className="flex items-center gap-2">
              <WifiOutlined />
              <span>Chip NFC</span>
              <Badge count={chips.length} style={{ backgroundColor: '#6366f1' }} />
            </span>
          }
          extra={<AddChipModal orderId={orderId} onAdded={refetchAll} />}
        >
          <Table
            columns={columns}
            dataSource={chips}
            rowKey="id"
            size="small"
            loading={chipsLoading}
            pagination={false}
            locale={{ emptyText: 'Chưa có chip nào' }}
          />
        </Card>
      )}
    </div>
  );
}
