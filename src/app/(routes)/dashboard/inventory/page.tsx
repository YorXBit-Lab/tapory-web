'use client';

import { useRef, useState, useMemo } from 'react';
import {
  App, Button, Card, Divider, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Table, Tag, Typography, theme,
} from 'antd';
import {
  CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
} from '@/hooks/purchaseOrder';
import { useComponents, useCreateComponent } from '@/hooks/component';
import { uploadProductImage, deleteProductImage, r2KeyFromUrl } from '@/utils/r2-upload';
import { fmtVnd, fmtDate } from '@/utils/format';
import type { IPurchaseOrder, IComponent, PurchaseOrderStatus } from '@/configs/types';

const { Text } = Typography;

const STATUS_CONFIG: Record<PurchaseOrderStatus, { color: string; label: string }> = {
  planned:  { color: 'default',   label: 'Kế hoạch' },
  ordered:  { color: 'processing', label: 'Đã đặt' },
  received: { color: 'success',   label: 'Đã nhận' },
};

interface FormItem {
  componentId: string;
  quantity: number;
  unitCost: number;
}

interface OrderFormValues {
  status: PurchaseOrderStatus;
  supplier?: string;
  expectedDate?: string;
  note?: string;
  items: FormItem[];
}

/* ── Quick create component ── */
interface QuickComponentForm {
  name: string;
  unit?: string;
}

function QuickCreateComponentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}) {
  const { notification } = App.useApp();
  const { mutateAsync: createComponent } = useCreateComponent();
  const [form] = Form.useForm<QuickComponentForm>();
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: QuickComponentForm) => {
    setSaving(true);
    try {
      const result = (await createComponent({
        name: values.name.trim(),
        stock: 0,
        ...(values.unit ? { unit: values.unit.trim() } : {}),
      })) as { data: { id: string } };
      form.resetFields();
      onCreated(result.data.id, values.name.trim());
    } catch (err) {
      notification.error({ message: 'Tạo linh kiện thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Tạo linh kiện mới" open={open} onCancel={handleClose} footer={null} destroyOnHidden width={400}>
      <Form form={form} layout="vertical" initialValues={{ unit: 'cái' }} onFinish={handleFinish} className="pt-2">
        <Form.Item label="Tên linh kiện" name="name" rules={[{ required: true, message: 'Nhập tên linh kiện' }]}>
          <Input placeholder="VD: Chip NFC, Charm, Phôi tròn..." autoFocus />
        </Form.Item>
        <Form.Item label="Đơn vị" name="unit">
          <Input placeholder="cái" />
        </Form.Item>
        <Text type="secondary" className="mb-3 block text-xs">
          Tồn kho ban đầu = 0. Số lượng nhập trong phiếu sẽ được cộng khi bấm “Đã nhận”.
        </Text>
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>Tạo linh kiện</Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ── Order image uploader ── */
function OrderImageUploader({
  imageUrls,
  uploading,
  onAdd,
  onRemove,
}: {
  imageUrls: string[];
  uploading: boolean;
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap gap-2">
      {imageUrls.map((url, i) => (
        <div key={url + i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
          <Image src={url} alt={`Ảnh ${i + 1}`} fill className="object-cover" sizes="80px" unoptimized />
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(i)}
          >
            <DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-elevated text-content3 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : (
          <>
            <PlusOutlined className="text-lg" />
            <span className="mt-1 text-[10px]">Thêm ảnh</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ── Items table in order modal ── */
function ItemsTable({
  form,
  components,
  onRequestCreate,
}: {
  form: ReturnType<typeof Form.useForm<OrderFormValues>>[0];
  components: IComponent[];
  onRequestCreate: (itemName: number) => void;
}) {
  const itemValues: FormItem[] = Form.useWatch('items', form) ?? [];

  return (
    <Form.List name="items" rules={[{
      validator: async (_, items) => {
        if (!items || items.length === 0) throw new Error('Cần ít nhất 1 linh kiện');
      },
    }]}>
      {(fields, { add, remove }, { errors }) => (
        <div className="space-y-2">
          {fields.map(({ key, name }) => (
            <div key={key} className="grid grid-cols-12 items-start gap-2 rounded-lg border border-border bg-elevated p-2">
              <Form.Item
                name={[name, 'componentId']}
                className="col-span-5 mb-0"
                rules={[{ required: true, message: 'Chọn linh kiện' }]}
              >
                <Select
                  showSearch
                  size="small"
                  placeholder="Chọn linh kiện"
                  optionFilterProp="label"
                  options={components.map(c => ({ value: c.id, label: `${c.name} (tồn ${c.stock})` }))}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div
                        style={{ padding: '6px 12px', cursor: 'pointer', color: '#1677ff', fontSize: 12 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onRequestCreate(name)}
                      >
                        <PlusOutlined /> Tạo linh kiện mới
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              <Form.Item
                name={[name, 'quantity']}
                className="col-span-2 mb-0"
                rules={[{ required: true, message: 'SL' }]}
              >
                <InputNumber min={1} size="small" style={{ width: '100%' }} placeholder="SL" />
              </Form.Item>

              <Form.Item
                name={[name, 'unitCost']}
                className="col-span-3 mb-0"
                rules={[{ required: true, message: 'Giá' }]}
              >
                <InputNumber
                  min={0}
                  size="small"
                  style={{ width: '100%' }}
                  placeholder="Giá nhập"
                  formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
                />
              </Form.Item>

              <div className="col-span-2 flex justify-center pt-1">
                {fields.length > 1 && (
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                )}
              </div>

              {itemValues[name]?.quantity > 0 && itemValues[name]?.unitCost > 0 && (
                <Text type="secondary" className="col-span-12 text-right text-xs">
                  = {fmtVnd(itemValues[name].quantity * itemValues[name].unitCost)}
                </Text>
              )}
            </div>
          ))}

          <Form.ErrorList errors={errors} />

          <Button type="dashed" block size="small" icon={<PlusOutlined />} onClick={() => add({ quantity: 1, unitCost: 0 })}>
            Thêm linh kiện
          </Button>

          {itemValues.length > 0 && (
            <div className="flex justify-end border-t border-border pt-2">
              <Text strong>
                Tổng:{' '}
                {fmtVnd(itemValues.reduce((s, i) => s + (i?.quantity ?? 0) * (i?.unitCost ?? 0), 0))}
              </Text>
            </div>
          )}
        </div>
      )}
    </Form.List>
  );
}

/* ── Create/Edit Modal ── */
function OrderModal({
  open,
  initial,
  components,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IPurchaseOrder | null;
  components: IComponent[];
  onClose: () => void;
  onSave: (values: OrderFormValues, imageUrls: string[]) => Promise<void>;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<OrderFormValues>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [pendingItemName, setPendingItemName] = useState<number | null>(null);

  const handleFinish = async (values: OrderFormValues) => {
    setSaving(true);
    try {
      await onSave(values, imageUrls);
      setPendingKeys([]);
      setImageUrls([]);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (pendingKeys.length > 0 && user) {
      const idToken = await user.getIdToken();
      pendingKeys.forEach(key => deleteProductImage(key, idToken));
    }
    setPendingKeys([]);
    setImageUrls([]);
    form.resetFields();
    onClose();
  };

  const handleAddImage = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      setImageUrls(prev => [...prev, url]);
      setPendingKeys(prev => [...prev, key]);
    } catch (err) {
      notification.error({ message: 'Upload ảnh thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const url = imageUrls[index];
    const key = r2KeyFromUrl(url);
    if (key && pendingKeys.includes(key) && user) {
      const idToken = await user.getIdToken();
      deleteProductImage(key, idToken);
      setPendingKeys(prev => prev.filter(k => k !== key));
    }
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRequestCreate = (itemName: number) => {
    setPendingItemName(itemName);
    setQuickCreateOpen(true);
  };

  const handleComponentCreated = (id: string, name: string) => {
    queryClient.invalidateQueries({ queryKey: ['components'] });
    if (pendingItemName !== null) {
      form.setFieldValue(['items', pendingItemName, 'componentId'], id);
    }
    setQuickCreateOpen(false);
    setPendingItemName(null);
    notification.success({ message: `Đã tạo linh kiện "${name}"` });
  };

  return (
    <>
      <Modal
        title={initial ? 'Sửa phiếu nhập' : 'Tạo phiếu nhập hàng'}
        open={open}
        onCancel={handleClose}
        footer={null}
        destroyOnHidden
        width={640}
        afterOpenChange={(vis) => {
          if (vis) {
            setImageUrls(initial?.imageUrls ?? []);
            setPendingKeys([]);
            if (initial) {
              form.setFieldsValue({
                status: initial.status,
                supplier: initial.supplier,
                expectedDate: initial.expectedDate,
                note: initial.note,
                items: initial.items.map(i => ({
                  componentId: i.componentId,
                  quantity: i.quantity,
                  unitCost: i.unitCost,
                })),
              });
            }
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'planned', items: [{ quantity: 1, unitCost: 0 }] }}
          onFinish={handleFinish}
          className="pt-2"
        >
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'planned', label: '📋 Kế hoạch' },
                  { value: 'ordered', label: '🚚 Đã đặt hàng' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Nhà cung cấp" name="supplier">
              <Input placeholder="Tên NCC (tùy chọn)" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item label="Ngày dự kiến nhận" name="expectedDate">
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input placeholder="Ghi chú phiếu..." />
            </Form.Item>
          </div>

          <Form.Item label="Danh sách linh kiện nhập">
            <ItemsTable form={form} components={components} onRequestCreate={handleRequestCreate} />
          </Form.Item>

          <Divider titlePlacement="start" orientationMargin={0} className="!mb-3 !mt-1 !text-xs !text-content3">
            Ảnh đính kèm (hoá đơn, phiếu giao hàng...)
          </Divider>

          <Form.Item className="mb-2">
            <OrderImageUploader
              imageUrls={imageUrls}
              uploading={uploading}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleClose} disabled={saving}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {initial ? 'Cập nhật' : 'Tạo phiếu'}
            </Button>
          </div>
        </Form>
      </Modal>

      <QuickCreateComponentModal
        open={quickCreateOpen}
        onClose={() => { setQuickCreateOpen(false); setPendingItemName(null); }}
        onCreated={handleComponentCreated}
      />
    </>
  );
}

/* ── Expanded items detail ── */
function ItemsDetail({ items, imageUrls }: { items: IPurchaseOrder['items']; imageUrls?: string[] }) {
  return (
    <div className="px-8 py-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left text-content2">
            <th className="pb-1 font-medium">Linh kiện</th>
            <th className="pb-1 text-right font-medium">SL</th>
            <th className="pb-1 text-right font-medium">Đơn giá nhập</th>
            <th className="pb-1 text-right font-medium">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-1">{item.componentName}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{fmtVnd(item.unitCost)}</td>
              <td className="py-1 text-right font-medium">{fmtVnd(item.quantity * item.unitCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {imageUrls && imageUrls.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <Text type="secondary" className="mb-2 block text-xs">Ảnh đính kèm</Text>
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border transition-colors hover:border-primary">
                  <Image src={url} alt={`Ảnh ${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { token } = theme.useToken();
  return (
    <Card size="small">
      <Text type="secondary" className="block text-xs">{label}</Text>
      <div className="mt-1 text-xl font-bold" style={{ color: token.colorText }}>{value}</div>
      {sub && <Text type="secondary" className="text-xs">{sub}</Text>}
    </Card>
  );
}

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
