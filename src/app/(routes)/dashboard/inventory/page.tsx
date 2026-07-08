'use client';

import { useState, useMemo } from 'react';
import { App, Button, Card, Popconfirm, Table, Tag, Typography } from 'antd';
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
} from '@/hooks/purchaseOrder';
import { useComponents } from '@/hooks/component';
import { fmtVnd, fmtDate } from '@/utils/format';
import type { IPurchaseOrder, IComponent, PurchaseOrderStatus } from '@/configs/types';
import { StatCard } from './components/StatCard';
import { ItemsDetail } from './components/ItemsDetail';
import { OrderModal } from './components/OrderModal';
import type { FormItem, OrderFormValues } from './components/types';

const { Text } = Typography;

const STATUS_CONFIG: Record<PurchaseOrderStatus, { color: string; label: string }> = {
  planned:  { color: 'default',   label: 'Kế hoạch' },
  ordered:  { color: 'processing', label: 'Đã đặt' },
  received: { color: 'success',   label: 'Đã nhận' },
};

/* ── Page ── */
export default function InventoryPage() {
  const { notification } = App.useApp();
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: rawOrders = [], isLoading } = usePurchaseOrders();
  const orders = rawOrders as IPurchaseOrder[];
  const { mutateAsync: createOrder } = useCreatePurchaseOrder();
  const { mutateAsync: updateOrder } = useUpdatePurchaseOrder();
  const { mutateAsync: deleteOrder } = useDeletePurchaseOrder();

  const { data: rawComponents = [] } = useComponents();
  const components = rawComponents as IComponent[];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IPurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<PurchaseOrderStatus | 'all'>('all');
  const [confirming, setConfirming] = useState<string | null>(null);

  const stats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const planned = orders.filter(o => o.status === 'planned').length;
    const ordered = orders.filter(o => o.status === 'ordered').length;
    const receivedThisMonth = orders.filter(
      o => o.status === 'received' && o.receivedAt?.startsWith(thisMonth),
    ).length;
    const totalCostOrdered = orders
      .filter(o => o.status !== 'received')
      .reduce((s, o) => s + o.totalCost, 0);
    return { planned, ordered, receivedThisMonth, totalCostOrdered };
  }, [orders]);

  const filtered = useMemo(
    () => (filterStatus === 'all' ? orders : orders.filter((o: IPurchaseOrder) => o.status === filterStatus)),
    [orders, filterStatus],
  );

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (o: IPurchaseOrder) => { setEditing(o); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const enrichItems = (items: FormItem[]) =>
    items.map(item => {
      const component = components.find(c => c.id === item.componentId);
      return {
        componentId: item.componentId,
        componentName: component?.name ?? item.componentId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      };
    });

  const handleSave = async (values: OrderFormValues, imageUrls: string[]) => {
    const items = enrichItems(values.items);
    const totalCost = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    const payload = {
      status: values.status,
      items,
      totalCost,
      supplier: values.supplier ?? '',
      note: values.note ?? '',
      expectedDate: values.expectedDate ?? '',
      ...(imageUrls.length > 0 ? { imageUrls } : {}),
    };

    try {
      if (editing) {
        await updateOrder({ id: editing.id, data: payload });
        notification.success({ message: 'Đã cập nhật phiếu' });
      } else {
        await createOrder(payload);
        notification.success({ message: 'Đã tạo phiếu nhập' });
      }
      closeModal();
    } catch {
      notification.error({ message: 'Lỗi lưu phiếu' });
      throw new Error('save failed');
    }
  };

  const handleConfirm = async (orderId: string) => {
    if (!user) return;
    setConfirming(orderId);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/purchase-orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Lỗi');

      notification.success({ message: 'Xác nhận đã nhận hàng thành công', description: 'Tồn kho đã được cập nhật' });
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      notification.error({
        message: 'Xác nhận thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setConfirming(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      notification.success({ message: 'Đã xóa phiếu' });
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  const columns: ColumnsType<IPurchaseOrder> = [
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 110,
      render: (v: string) => <Text className="text-xs">{fmtDate(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (s: PurchaseOrderStatus) => {
        const cfg = STATUS_CONFIG[s];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Linh kiện',
      render: (_: unknown, record: IPurchaseOrder) => (
        <div>
          <Text className="text-sm">{record.items.length} loại</Text>
          <Text type="secondary" className="block text-xs">
            {record.items.map(i => i.componentName).join(', ')}
          </Text>
        </div>
      ),
    },
    {
      title: 'NCC',
      dataIndex: 'supplier',
      width: 130,
      render: (v?: string) => <Text className="text-xs">{v || '—'}</Text>,
    },
    {
      title: 'Dự kiến nhận',
      dataIndex: 'expectedDate',
      width: 120,
      render: (v?: string) => <Text className="text-xs">{v ? fmtDate(v) : '—'}</Text>,
    },
    {
      title: 'Tổng chi phí',
      dataIndex: 'totalCost',
      width: 130,
      sorter: (a, b) => a.totalCost - b.totalCost,
      render: (v: number) => <Text strong className="text-sm">{fmtVnd(v)}</Text>,
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'receivedAt',
      width: 110,
      render: (v?: string) => <Text className="text-xs">{v ? fmtDate(v) : '—'}</Text>,
    },
    {
      title: 'Hành động',
      width: 160,
      render: (_: unknown, record: IPurchaseOrder) => {
        const isReceived = record.status === 'received';
        return (
          <span className="flex flex-wrap items-center gap-2 text-xs">
            {!isReceived && (
              <>
                <button className="text-primary hover:underline" onClick={() => openEdit(record)}>
                  <EditOutlined /> Sửa
                </button>
                <span className="text-content4">·</span>
                <Popconfirm
                  title="Xác nhận đã nhận hàng?"
                  description="Tồn kho sẽ được cộng theo số lượng trong phiếu."
                  onConfirm={() => handleConfirm(record.id)}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <button
                    className="text-success hover:underline disabled:opacity-50"
                    disabled={confirming === record.id}
                  >
                    <CheckOutlined /> Đã nhận
                  </button>
                </Popconfirm>
                <span className="text-content4">·</span>
              </>
            )}
            {!isReceived && (
              <Popconfirm
                title="Xóa phiếu này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <button className="text-red-500 hover:underline">
                  <DeleteOutlined /> Xóa
                </button>
              </Popconfirm>
            )}
            {isReceived && <Text type="secondary" className="text-xs">—</Text>}
          </span>
        );
      },
    },
  ];

  const filterButtons: { key: PurchaseOrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'planned', label: 'Kế hoạch' },
    { key: 'ordered', label: 'Đã đặt' },
    { key: 'received', label: 'Đã nhận' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Đang kế hoạch" value={String(stats.planned)} />
        <StatCard label="Đã đặt hàng" value={String(stats.ordered)} />
        <StatCard label="Đã nhận tháng này" value={String(stats.receivedThisMonth)} />
        <StatCard
          label="Chi phí chờ nhập"
          value={stats.totalCostOrdered > 0 ? fmtVnd(stats.totalCostOrdered) : '0đ'}
          sub="Tổng phiếu chưa nhận"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {filterButtons.map(({ key, label }) => (
            <Button
              key={key}
              size="small"
              type={filterStatus === key ? 'primary' : 'default'}
              onClick={() => setFilterStatus(key)}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1 text-[10px]">
                  ({orders.filter((o: IPurchaseOrder) => o.status === (key as PurchaseOrderStatus)).length})
                </span>
              )}
            </Button>
          ))}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo phiếu nhập
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          size="small"
          expandable={{
            expandedRowRender: (record) => <ItemsDetail items={record.items} imageUrls={record.imageUrls} />,
            rowExpandable: (record) => record.items.length > 0,
          }}
          pagination={{
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
        />
      </Card>

      <OrderModal
        open={modalOpen}
        initial={editing}
        components={components}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
