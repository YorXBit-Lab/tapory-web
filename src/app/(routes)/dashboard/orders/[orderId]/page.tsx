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
  notification,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, WifiOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { OrderAPI } from '@/services/OrderAPI';
import { CardAPI } from '@/services/CardAPI';
import { STATUS_TAG } from '@/components/dashboard';
import { TEMPLATES } from '@/configs/constants';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import type { ICard } from '@/configs/types';

const { Text } = Typography;

/* ── Web NFC types (not in TS stdlib) ── */
interface NDEFRecord { recordType: string; data: string }
interface NDEFWriter { write(msg: { records: NDEFRecord[] }): Promise<void> }
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
        <button onClick={handleWrite} className="text-xs text-red-500 hover:underline">✗ Lỗi — thử lại</button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={nfcUrl}>
      <Button size="small" icon={<WifiOutlined />} onClick={handleWrite} type={card.nfcWritten ? 'default' : 'primary'}>
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
            onChange={v => setCount(v ?? 1)}
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
            className="font-mono text-xs text-content3"
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
          <Link href={`/view/${record.id}`} target="_blank" className="text-primary hover:opacity-70">Xem</Link>
          <Link href={`/edit/${record.id}`} target="_blank" className="text-primary hover:opacity-70">Sửa</Link>
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
  const template = TEMPLATES[order.templateId as keyof typeof TEMPLATES];

  return (
    <div className="space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/dashboard/orders')} />
        <h2 className="text-base font-semibold">Đơn hàng {order.id}</h2>
        <Tag color={statusTag?.color}>{statusTag?.label}</Tag>
      </div>

      {/* Order info */}
      <Card size="small">
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Khách hàng">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{order.phone}</Descriptions.Item>
          <Descriptions.Item label="Template">{template ? `${template.icon} ${template.name}` : order.templateId}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{order.address || '—'}</Descriptions.Item>
          <Descriptions.Item label="Giá trị">{order.price.toLocaleString('vi-VN')}đ</Descriptions.Item>
          <Descriptions.Item label="Số chip">{order.quantity ?? chips.length}</Descriptions.Item>
          {order.notes && <Descriptions.Item label="Ghi chú" span={3}>{order.notes}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* Chips table */}
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
    </div>
  );
}
