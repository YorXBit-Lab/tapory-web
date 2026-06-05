'use client';

import { useRef, useState, useMemo } from 'react';
import {
  App, Button, Card, Divider, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Table, Tag, Typography, theme,
} from 'antd';
import {
  CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ProductAPI } from '@/services/ProductAPI';
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
} from '@/hooks/purchaseOrder';
import { useCreateProduct } from '@/hooks/product';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IPurchaseOrder, IProduct, PurchaseOrderStatus } from '@/configs/types';

const { Text } = Typography;
const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function fmtVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_CONFIG: Record<PurchaseOrderStatus, { color: string; label: string }> = {
  planned:  { color: 'default',   label: 'Kế hoạch' },
  ordered:  { color: 'processing', label: 'Đã đặt' },
  received: { color: 'success',   label: 'Đã nhận' },
};

interface FormItem {
  productId: string;
  variantId?: string;
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

/* ── Quick create product ── */
interface QuickProductForm {
  name: string;
  price: number;
  status: 'draft' | 'active';
}

function QuickCreateProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const { mutateAsync: createProduct } = useCreateProduct();
  const [form] = Form.useForm<QuickProductForm>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      if (pendingKey) {
        const idToken = await user.getIdToken();
        deleteProductImage(pendingKey, idToken);
      }
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      setImageUrl(url);
      setPendingKey(key);
    } catch (err) {
      notification.error({ message: 'Upload ảnh thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = async () => {
    if (pendingKey && user) {
      const idToken = await user.getIdToken();
      deleteProductImage(pendingKey, idToken);
    }
    setPendingKey(null);
    setImageUrl('');
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: QuickProductForm) => {
    setSaving(true);
    try {
      const result = await createProduct({
        name: values.name.trim(),
        price: values.price,
        status: values.status,
        canBeNfc: false,
        ...(imageUrl ? { imageUrl } : {}),
      }) as { data: { id: string } };
      setPendingKey(null);
      setImageUrl('');
      form.resetFields();
      onCreated(result.data.id, values.name.trim());
    } catch (err) {
      notification.error({ message: 'Tạo sản phẩm thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Tạo sản phẩm mới"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'active', price: 0 }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Ảnh sản phẩm">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400"
              onClick={() => inputRef.current?.click()}
            >
              {imageUrl ? (
                <Image src={imageUrl} alt="product" fill className="object-cover" sizes="64px" unoptimized />
              ) : (
                <div className="flex flex-col items-center gap-0.5 text-gray-400">
                  <UploadOutlined style={{ fontSize: 18 }} />
                  <span className="text-[9px]">Tải ảnh</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                </div>
              )}
            </div>
            <Text type="secondary" className="text-xs">Tùy chọn · JPEG / PNG / WebP</Text>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
          </div>
        </Form.Item>

        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
          <Input placeholder="VD: Móc khóa NFC Premium" autoFocus />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Đơn giá (đ)" name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select
              options={[
                { value: 'active', label: '🟢 Active' },
                { value: 'draft', label: '⬜ Draft' },
              ]}
            />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving || uploading}>
            Tạo sản phẩm
          </Button>
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
        <div key={url + i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
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
        className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
        ) : (
          <>
            <PlusOutlined style={{ fontSize: 18 }} />
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
  products,
  onRequestCreate,
}: {
  form: ReturnType<typeof Form.useForm<OrderFormValues>>[0];
  products: IProduct[];
  onRequestCreate: (itemName: number) => void;
}) {
  const itemValues: FormItem[] = Form.useWatch('items', form) ?? [];

  return (
    <Form.List name="items" rules={[{
      validator: async (_, items) => {
        if (!items || items.length === 0) throw new Error('Cần ít nhất 1 sản phẩm');
      },
    }]}>
      {(fields, { add, remove }, { errors }) => (
        <div className="space-y-2">
          {fields.map(({ key, name }) => {
            const selectedProductId = itemValues[name]?.productId;
            const product = products.find(p => p.id === selectedProductId);
            const hasVariants = product?.variants && Object.keys(product.variants).length > 0;
            const variantOptions = hasVariants
              ? Object.entries(product!.variants!).map(([id, v]) => ({
                  value: id,
                  label: v.name,
                  price: v.price,
                }))
              : [];

            return (
              <div key={key} className="grid grid-cols-12 items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                <Form.Item
                  name={[name, 'productId']}
                  className="col-span-4 mb-0"
                  rules={[{ required: true, message: 'Chọn SP' }]}
                >
                  <Select
                    showSearch
                    size="small"
                    placeholder="Chọn sản phẩm"
                    optionFilterProp="label"
                    options={products
                      .filter(p => p.status !== 'archived')
                      .map(p => ({ value: p.id, label: p.name }))}
                    onChange={() => {
                      form.setFieldValue(['items', name, 'variantId'], undefined);
                    }}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '4px 0' }} />
                        <div
                          style={{ padding: '6px 12px', cursor: 'pointer', color: '#1677ff', fontSize: 12 }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => onRequestCreate(name)}
                        >
                          <PlusOutlined /> Tạo SP mới
                        </div>
                      </>
                    )}
                  />
                </Form.Item>

                <Form.Item name={[name, 'variantId']} className="col-span-3 mb-0">
                  <Select
                    size="small"
                    placeholder={hasVariants ? 'Biến thể' : '—'}
                    disabled={!hasVariants}
                    allowClear
                    options={variantOptions}
                    onChange={(variantId) => {
                      const opt = variantOptions.find(o => o.value === variantId);
                      if (opt) form.setFieldValue(['items', name, 'unitCost'], opt.price);
                    }}
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
                  className="col-span-2 mb-0"
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

                <div className="col-span-1 flex justify-center pt-1">
                  {fields.length > 1 && (
                    <Button
                      type="text" danger size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  )}
                </div>

                {itemValues[name]?.quantity > 0 && itemValues[name]?.unitCost > 0 && (
                  <Text type="secondary" className="col-span-12 text-right text-xs">
                    = {fmtVnd(itemValues[name].quantity * itemValues[name].unitCost)}
                  </Text>
                )}
              </div>
            );
          })}

          <Form.ErrorList errors={errors} />

          <Button
            type="dashed" block size="small"
            icon={<PlusOutlined />}
            onClick={() => add({ quantity: 1, unitCost: 0 })}
          >
            Thêm sản phẩm
          </Button>

          {itemValues.length > 0 && (
            <div className="flex justify-end border-t border-gray-200 pt-2">
              <Text strong>
                Tổng:{' '}
                {fmtVnd(
                  itemValues.reduce((s, i) => s + (i?.quantity ?? 0) * (i?.unitCost ?? 0), 0),
                )}
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
  products,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IPurchaseOrder | null;
  products: IProduct[];
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
    if (R2_BASE && url.startsWith(R2_BASE)) {
      const key = url.slice(R2_BASE.length + 1);
      if (pendingKeys.includes(key) && user) {
        const idToken = await user.getIdToken();
        deleteProductImage(key, idToken);
        setPendingKeys(prev => prev.filter(k => k !== key));
      }
    }
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRequestCreate = (itemName: number) => {
    setPendingItemName(itemName);
    setQuickCreateOpen(true);
  };

  const handleProductCreated = (id: string, name: string) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    if (pendingItemName !== null) {
      form.setFieldValue(['items', pendingItemName, 'productId'], id);
      form.setFieldValue(['items', pendingItemName, 'variantId'], undefined);
    }
    setQuickCreateOpen(false);
    setPendingItemName(null);
    notification.success({ message: `Đã tạo sản phẩm "${name}"` });
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
                  productId: i.productId,
                  variantId: i.variantId,
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

          <Form.Item label="Danh sách sản phẩm nhập">
            <ItemsTable form={form} products={products} onRequestCreate={handleRequestCreate} />
          </Form.Item>

          <Divider orientation="left" orientationMargin={0} className="!mb-3 !mt-1 !text-xs !text-gray-400">
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

      <QuickCreateProductModal
        open={quickCreateOpen}
        onClose={() => { setQuickCreateOpen(false); setPendingItemName(null); }}
        onCreated={handleProductCreated}
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
          <tr className="border-b text-left text-gray-500">
            <th className="pb-1 font-medium">Sản phẩm</th>
            <th className="pb-1 font-medium">Biến thể</th>
            <th className="pb-1 text-right font-medium">SL</th>
            <th className="pb-1 text-right font-medium">Đơn giá nhập</th>
            <th className="pb-1 text-right font-medium">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-1">{item.productName}</td>
              <td className="py-1 text-gray-500">{item.variantName ?? '—'}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{fmtVnd(item.unitCost)}</td>
              <td className="py-1 text-right font-medium">{fmtVnd(item.quantity * item.unitCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {imageUrls && imageUrls.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <Text type="secondary" className="mb-2 block text-xs">Ảnh đính kèm</Text>
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-blue-400">
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

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductAPI.getAll(),
    staleTime: 60_000,
  });

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
      const product = (products as IProduct[]).find(p => p.id === item.productId);
      const variant = item.variantId && product?.variants?.[item.variantId];
      return {
        productId: item.productId,
        productName: product?.name ?? item.productId,
        variantId: item.variantId,
        variantName: variant ? variant.name : undefined,
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
      title: 'Sản phẩm',
      render: (_: unknown, record: IPurchaseOrder) => (
        <div>
          <Text className="text-sm">{record.items.length} mặt hàng</Text>
          <Text type="secondary" className="block text-xs">
            {record.items.map(i => i.productName + (i.variantName ? ` (${i.variantName})` : '')).join(', ')}
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
                <span className="text-gray-300">·</span>
                <Popconfirm
                  title="Xác nhận đã nhận hàng?"
                  description="Tồn kho sẽ được cộng theo số lượng trong phiếu."
                  onConfirm={() => handleConfirm(record.id)}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <button
                    className="text-green-600 hover:underline disabled:opacity-50"
                    disabled={confirming === record.id}
                  >
                    <CheckOutlined /> Đã nhận
                  </button>
                </Popconfirm>
                <span className="text-gray-300">·</span>
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
        products={products as IProduct[]}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
