'use client';

import { useRef, useState } from 'react';
import {
  App, Badge, Button, Card, Divider, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Switch, Table, Tag, Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, InboxOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';
import { DEFAULT_NFC_EXTRA_PRICE, TEMPLATE_LIST } from '@/configs/constants';
import { SettingsAPI } from '@/services/SettingsAPI';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IProduct, IProductVariant, IPrintConfig, PrintShape, ProductStatus } from '@/configs/types';

const { Text } = Typography;

function priceFormatter(v: number | string | undefined) {
  return `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function priceParser(v: string | undefined) {
  return Number((v ?? '').replace(/\./g, '')) as 0;
}

function newVariantId() {
  return `v${Math.random().toString(36).slice(2, 7)}`;
}

interface VariantRow {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  isNfc?: boolean;
  printConfig?: IPrintConfig;
}

type ProductFormInternal = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt' | 'variants'> & {
  variantRows?: VariantRow[];
};

const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { color: string; label: string }> = {
  draft:    { color: 'default', label: 'Draft' },
  active:   { color: 'success', label: 'Active' },
  archived: { color: 'error',   label: 'Archived' },
};

function StockCell({ stock }: { stock?: number }) {
  if (stock === undefined) return <Text type="secondary" className="text-xs">∞</Text>;
  if (stock === 0) return <Tag color="error" className="text-xs">Hết hàng</Tag>;
  if (stock <= 5) return <Tag color="warning" className="text-xs">Còn {stock}</Tag>;
  return <Text className="text-xs font-medium">{stock}</Text>;
}

/* ── Restock modal ── */
interface RestockItem {
  key: string;
  label: string;
  subLabel?: string;
  stock: number;
  productId: string;
  variantId?: string;
}

function RestockModal({ products, onClose }: { products: IProduct[]; onClose: () => void }) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [deltas, setDeltas] = useState<Record<string, number>>({});

  const tracked: RestockItem[] = [];
  for (const p of products) {
    if (p.status === 'archived') continue;
    if (p.variants && Object.keys(p.variants).length > 0) {
      for (const [variantId, v] of Object.entries(p.variants)) {
        if (v.stock !== undefined) {
          tracked.push({
            key: `${p.id}::${variantId}`,
            label: p.name,
            subLabel: v.name,
            stock: v.stock,
            productId: p.id,
            variantId,
          });
        }
      }
    } else if (p.stock !== undefined) {
      tracked.push({ key: p.id, label: p.name, stock: p.stock, productId: p.id });
    }
  }

  const handleSave = async () => {
    const updates = Object.entries(deltas)
      .filter(([, delta]) => delta > 0)
      .map(([key, delta]) => {
        const item = tracked.find(t => t.key === key)!;
        return { productId: item.productId, variantId: item.variantId, delta };
      });

    if (updates.length === 0) {
      notification.warning({ message: 'Chưa nhập số lượng cho sản phẩm nào' });
      return;
    }

    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json() as { error?: string; updated?: number };
      if (!res.ok) throw new Error(json.error ?? 'Lỗi nhập hàng');

      notification.success({ message: `Đã cập nhật ${json.updated} mục` });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeltas({});
      onClose();
    } catch (err) {
      notification.error({
        message: 'Nhập hàng thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 pt-1">
      {tracked.length === 0 ? (
        <Text type="secondary" className="block text-sm">
          Chưa có sản phẩm nào đang theo dõi kho. Hãy cài đặt tồn kho trong phần sửa sản phẩm.
        </Text>
      ) : (
        <Table
          dataSource={tracked}
          rowKey="key"
          size="small"
          pagination={false}
          columns={[
            {
              title: 'Sản phẩm',
              render: (_: unknown, r: RestockItem) => (
                <div>
                  <Text strong className="text-sm">{r.label}</Text>
                  {r.subLabel && <Text type="secondary" className="block text-xs">{r.subLabel}</Text>}
                  <StockCell stock={r.stock} />
                </div>
              ),
            },
            {
              title: 'Nhập thêm',
              width: 130,
              render: (_: unknown, r: RestockItem) => (
                <InputNumber
                  min={0}
                  placeholder="0"
                  size="small"
                  style={{ width: '100%' }}
                  value={deltas[r.key] ?? undefined}
                  onChange={(v) =>
                    setDeltas(prev => {
                      const next = { ...prev };
                      if (!v) delete next[r.key];
                      else next[r.key] = v;
                      return next;
                    })
                  }
                />
              ),
            },
          ]}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onClose} disabled={saving}>Hủy</Button>
        <Button
          type="primary"
          loading={saving}
          disabled={tracked.length === 0}
          onClick={handleSave}
        >
          Xác nhận nhập hàng
        </Button>
      </div>
    </div>
  );
}

/* ── Image uploader ── */
function ImageUploader({
  value,
  uploading,
  onUpload,
  onRemove,
}: {
  value?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-start gap-3">
      <div
        className="relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image src={value} alt="product" fill className="object-cover" sizes="80px" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <UploadOutlined style={{ fontSize: 20 }} />
            <span className="text-[10px]">Tải ảnh</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button size="small" icon={<UploadOutlined />} loading={uploading} onClick={() => inputRef.current?.click()}>
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
        {value && (
          <Button size="small" danger onClick={onRemove}>
            Xóa ảnh
          </Button>
        )}
        <Text type="secondary" className="text-[10px]">JPEG · PNG · WebP · tối đa 5 MB</Text>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ── Product modal ── */
function ProductModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IProduct | null;
  onClose: () => void;
  onSave: (values: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm<ProductFormInternal>();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useVariants, setUseVariants] = useState(
    () => !!initial?.variants && Object.keys(initial.variants).length > 0
  );
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => SettingsAPI.get(), staleTime: 60_000 });
  const globalNfcPrice = settings?.nfcExtraPrice ?? DEFAULT_NFC_EXTRA_PRICE;
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const imageUrl: string = Form.useWatch('imageUrl', form) ?? '';

  const discardPendingImage = async (key: string | null) => {
    if (!key || !user) return;
    const idToken = await user.getIdToken();
    deleteProductImage(key, idToken);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      if (uploadedKey) {
        await discardPendingImage(uploadedKey);
        setUploadedKey(null);
      }
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      form.setFieldValue('imageUrl', url);
      setUploadedKey(key);
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.setFieldValue('imageUrl', '');
  };

  const handleClose = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: ProductFormInternal) => {
    setSaving(true);
    try {
      const { variantRows, ...rest } = values;
      let variants: IProduct['variants'];
      if (useVariants && variantRows && variantRows.length > 0) {
        variants = {};
        for (const row of variantRows) {
          if (!row.name?.trim()) continue;
          const v: IProductVariant = { name: row.name.trim(), price: row.price };
          if (row.stock != null) v.stock = row.stock;
          if (row.isNfc) v.isNfc = true;
          if (row.printConfig?.enabled && row.printConfig.shape) v.printConfig = row.printConfig;
          variants[row._id] = v;
        }
        if (Object.keys(variants).length === 0) variants = undefined;
      }

      await onSave({ ...rest, variants });

      if (initial?.imageUrl && values.imageUrl !== initial.imageUrl && user) {
        const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');
        if (base && initial.imageUrl.startsWith(base)) {
          const oldKey = initial.imageUrl.slice(base.length + 1);
          const idToken = await user.getIdToken();
          deleteProductImage(oldKey, idToken);
        }
      }
      setUploadedKey(null);
      form.resetFields();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại sau',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={560}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          const variantRows: VariantRow[] = initial.variants
            ? Object.entries(initial.variants).map(([id, v]) => ({
                _id: id,
                name: v.name,
                price: v.price,
                stock: v.stock,
                isNfc: v.isNfc,
                printConfig: v.printConfig ?? { enabled: false },
              }))
            : [];
          setUseVariants(variantRows.length > 0);
          form.setFieldsValue({
            name: initial.name,
            price: initial.price,
            status: initial.status,
            stock: initial.stock,
            canBeNfc: initial.canBeNfc,
            nfcExtraPrice: initial.nfcExtraPrice,
            templateId: initial.templateId,
            description: initial.description,
            imageUrl: initial.imageUrl ?? '',
            printConfig: initial.printConfig ?? { enabled: false },
            variantRows,
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'draft', canBeNfc: false, price: 0, imageUrl: '', printConfig: { enabled: false }, variantRows: [] }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Ảnh sản phẩm" name="imageUrl">
          <ImageUploader
            value={imageUrl}
            uploading={uploading}
            onUpload={handleUpload}
            onRemove={handleRemoveImage}
          />
        </Form.Item>

        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
          <Input placeholder="Ví dụ: Móc khóa NFC Premium" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'draft',    label: '⬜ Draft — chưa bán' },
                { value: 'active',   label: '🟢 Active — đang bán' },
                { value: 'archived', label: '🔴 Archived — ngừng bán' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Template NFC gợi ý" name="templateId" extra="Tự động chọn khi staff bật NFC lúc tạo đơn">
            <Select placeholder="Chọn template" allowClear>
              {TEMPLATE_LIST.map((tpl) => (
                <Select.Option key={tpl.id} value={tpl.id}>
                  {tpl.icon} {tpl.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn..." />
        </Form.Item>

        {/* Variant toggle */}
        <Divider orientation="left" orientationMargin={0} className="!mb-3 !mt-1 !text-xs !text-gray-400">
          Giá & Kho
        </Divider>

        <div className="mb-3 flex items-center gap-2">
          <Switch
            size="small"
            checked={useVariants}
            onChange={(checked) => {
              setUseVariants(checked);
              if (checked) {
                form.setFieldValue('variantRows', [{ _id: newVariantId(), name: '', price: 0, printConfig: { enabled: false } }]);
              } else {
                form.setFieldValue('variantRows', []);
              }
            }}
          />
          <Text className="text-sm">Sử dụng biến thể</Text>
          <Text type="secondary" className="text-xs">(VD: "NFC + In vuông", "Chỉ in", "Thường")</Text>
        </div>

        {/* ── No-variant mode ── */}
        {!useVariants && (
          <>
            <div className="grid grid-cols-2 gap-x-3">
              <Form.Item label="Đơn giá (đ)" name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={priceFormatter}
                  parser={priceParser}
                  placeholder="189.000"
                />
              </Form.Item>

              <Form.Item label="Tồn kho" name="stock" extra="Để trống = không giới hạn">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="∞" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-x-3">
              <Form.Item label="Tùy chọn NFC" name="canBeNfc" extra="Cho phép chọn thêm NFC khi tạo đơn hàng">
                <Select
                  options={[
                    { value: false, label: 'Không có NFC' },
                    { value: true, label: '📡 Có thể thêm NFC' },
                  ]}
                />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.canBeNfc !== cur.canBeNfc}>
                {() =>
                  form.getFieldValue('canBeNfc') ? (
                    <Form.Item
                      label="Phụ phí NFC"
                      name="nfcExtraPrice"
                      extra={`Mặc định: ${globalNfcPrice.toLocaleString('vi-VN')}đ`}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder={DEFAULT_NFC_EXTRA_PRICE.toLocaleString('vi-VN')}
                        formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
                        addonAfter="đ"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </div>

            <Divider orientation="left" orientationMargin={0} className="!mb-3 !mt-1 !text-xs !text-gray-400">
              In ảnh
            </Divider>

            <Form.Item name={['printConfig', 'enabled']} valuePropName="checked" label="Có in ảnh">
              <Switch />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.printConfig?.enabled !== cur.printConfig?.enabled}>
              {() =>
                form.getFieldValue(['printConfig', 'enabled']) ? (
                  <>
                    <Form.Item label="Hình dạng" name={['printConfig', 'shape']} rules={[{ required: true, message: 'Chọn hình dạng' }]}>
                      <Select
                        placeholder="Chọn hình dạng"
                        onChange={() => {
                          form.setFieldValue(['printConfig', 'width'], undefined);
                          form.setFieldValue(['printConfig', 'height'], undefined);
                          form.setFieldValue(['printConfig', 'diameter'], undefined);
                        }}
                        options={[
                          { value: 'rectangle' as PrintShape, label: '▭  Chữ nhật' },
                          { value: 'square' as PrintShape, label: '▢  Hình vuông' },
                          { value: 'circle' as PrintShape, label: '○  Hình tròn' },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, cur) =>
                      prev.printConfig?.shape !== cur.printConfig?.shape ||
                      prev.printConfig?.width !== cur.printConfig?.width ||
                      prev.printConfig?.height !== cur.printConfig?.height
                    }>
                      {() => {
                        const shape: PrintShape | undefined = form.getFieldValue(['printConfig', 'shape']);
                        if (shape === 'rectangle') {
                          const w: number | undefined = form.getFieldValue(['printConfig', 'width']);
                          const h: number | undefined = form.getFieldValue(['printConfig', 'height']);
                          const isPortrait = !w || !h || h >= w;
                          const MAX = 48;
                          const ratio = (w && h) ? w / h : 0.6;
                          const previewW = isPortrait ? Math.round(MAX * ratio) : MAX;
                          const previewH = isPortrait ? MAX : Math.round(MAX / ratio);

                          const swap = () => {
                            const curW = form.getFieldValue(['printConfig', 'width']);
                            const curH = form.getFieldValue(['printConfig', 'height']);
                            form.setFieldValue(['printConfig', 'width'], curH);
                            form.setFieldValue(['printConfig', 'height'], curW);
                          };

                          return (
                            <>
                              <div className="grid grid-cols-2 gap-x-3">
                                <Form.Item label="Chiều rộng — ngang (cm)" name={['printConfig', 'width']} rules={[{ required: true, message: 'Nhập chiều rộng' }]}>
                                  <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="3.4" addonAfter="cm" />
                                </Form.Item>
                                <Form.Item label="Chiều cao — dọc (cm)" name={['printConfig', 'height']} rules={[{ required: true, message: 'Nhập chiều cao' }]}>
                                  <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="5.0" addonAfter="cm" />
                                </Form.Item>
                              </div>
                              <div className="mb-3 flex items-center gap-3">
                                <div
                                  className="flex-shrink-0 rounded border-2 border-blue-400 bg-blue-50"
                                  style={{ width: previewW, height: previewH }}
                                />
                                <div className="flex flex-col gap-1">
                                  <span className={`text-xs font-medium ${isPortrait ? 'text-green-600' : 'text-orange-500'}`}>
                                    {isPortrait ? '↕  Dọc (portrait)' : '↔  Ngang (landscape)'}
                                  </span>
                                  {w && h && <span className="text-xs text-gray-400">{w} × {h} cm</span>}
                                </div>
                                <Button size="small" onClick={swap} title="Đổi dọc/ngang">⇄ Đổi chiều</Button>
                              </div>
                            </>
                          );
                        }
                        if (shape === 'square') {
                          return (
                            <Form.Item label="Cạnh (cm)" name={['printConfig', 'width']} rules={[{ required: true, message: 'Nhập độ dài cạnh' }]}>
                              <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="5.0" addonAfter="cm" />
                            </Form.Item>
                          );
                        }
                        if (shape === 'circle') {
                          return (
                            <Form.Item label="Đường kính (cm)" name={['printConfig', 'diameter']} rules={[{ required: true, message: 'Nhập đường kính' }]}>
                              <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="5.0" addonAfter="cm" />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
          </>
        )}

        {/* ── Variant mode ── */}
        {useVariants && (
          <Form.List name="variantRows">
            {(fields, { add, remove }) => (
              <div className="space-y-2">
                {fields.map(({ key, name }) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const formAny = form as unknown as { getFieldValue: (p: (string | number)[]) => unknown };
                  const enabled = !!formAny.getFieldValue(['variantRows', name, 'printConfig', 'enabled']);
                  const shape = formAny.getFieldValue(['variantRows', name, 'printConfig', 'shape']) as PrintShape | undefined;

                  return (
                    <div key={key} className="rounded-lg border border-divider bg-gray-50 p-3">
                      {/* Hidden _id field */}
                      <Form.Item name={[name, '_id']} className="hidden mb-0">
                        <Input />
                      </Form.Item>

                      {/* Main row */}
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <Form.Item
                          name={[name, 'name']}
                          className="col-span-5 mb-0"
                          rules={[{ required: true, message: 'Nhập tên' }]}
                        >
                          <Input placeholder="Tên biến thể" size="small" />
                        </Form.Item>

                        <Form.Item name={[name, 'price']} className="col-span-3 mb-0" rules={[{ required: true }]}>
                          <InputNumber
                            min={0}
                            size="small"
                            style={{ width: '100%' }}
                            placeholder="Giá"
                            formatter={priceFormatter}
                            parser={priceParser}
                          />
                        </Form.Item>

                        <Form.Item name={[name, 'stock']} className="col-span-2 mb-0">
                          <InputNumber min={0} size="small" style={{ width: '100%' }} placeholder="∞" />
                        </Form.Item>

                        <div className="col-span-1 flex items-center justify-center pt-1">
                          <Form.Item name={[name, 'isNfc']} valuePropName="checked" className="mb-0">
                            <Switch size="small" checkedChildren="📡" unCheckedChildren="—" />
                          </Form.Item>
                        </div>

                        <div className="col-span-1 flex items-center justify-end pt-1">
                          {fields.length > 1 && (
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          )}
                        </div>
                      </div>

                      <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                        <Text type="secondary" className="text-[10px]">Tên biến thể</Text>
                        <Text type="secondary" className="text-[10px]">Giá (đ)</Text>
                        <Text type="secondary" className="text-[10px]">Kho / NFC / Del</Text>
                      </div>

                      {/* Print config per variant */}
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="flex items-center gap-2">
                          <Form.Item name={[name, 'printConfig', 'enabled']} valuePropName="checked" className="mb-0">
                            <Switch size="small" />
                          </Form.Item>
                          <Text type="secondary" className="text-xs">In ảnh</Text>
                        </div>

                        <Form.Item noStyle shouldUpdate>
                          {() =>
                            enabled ? (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                <Form.Item
                                  name={[name, 'printConfig', 'shape']}
                                  className="mb-0"
                                  rules={[{ required: true, message: 'Chọn hình' }]}
                                >
                                  <Select
                                    size="small"
                                    placeholder="Hình dạng"
                                    onChange={() => {
                                      form.setFieldValue(['variantRows', name, 'printConfig', 'width'], undefined);
                                      form.setFieldValue(['variantRows', name, 'printConfig', 'height'], undefined);
                                      form.setFieldValue(['variantRows', name, 'printConfig', 'diameter'], undefined);
                                    }}
                                    options={[
                                      { value: 'rectangle' as PrintShape, label: '▭ Chữ nhật' },
                                      { value: 'square' as PrintShape, label: '▢ Vuông' },
                                      { value: 'circle' as PrintShape, label: '○ Tròn' },
                                    ]}
                                  />
                                </Form.Item>

                                {shape === 'rectangle' && (
                                  <>
                                    <Form.Item name={[name, 'printConfig', 'width']} className="mb-0" rules={[{ required: true, message: 'Rộng' }]}>
                                      <InputNumber size="small" min={0.1} step={0.1} placeholder="Rộng cm" style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item name={[name, 'printConfig', 'height']} className="mb-0" rules={[{ required: true, message: 'Cao' }]}>
                                      <InputNumber size="small" min={0.1} step={0.1} placeholder="Cao cm" style={{ width: '100%' }} />
                                    </Form.Item>
                                  </>
                                )}
                                {shape === 'square' && (
                                  <Form.Item name={[name, 'printConfig', 'width']} className="mb-0 col-span-2" rules={[{ required: true, message: 'Cạnh' }]}>
                                    <InputNumber size="small" min={0.1} step={0.1} placeholder="Cạnh cm" style={{ width: '100%' }} />
                                  </Form.Item>
                                )}
                                {shape === 'circle' && (
                                  <Form.Item name={[name, 'printConfig', 'diameter']} className="mb-0 col-span-2" rules={[{ required: true, message: 'Đường kính' }]}>
                                    <InputNumber size="small" min={0.1} step={0.1} placeholder="Đường kính cm" style={{ width: '100%' }} />
                                  </Form.Item>
                                )}
                              </div>
                            ) : null
                          }
                        </Form.Item>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="dashed"
                  block
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => add({ _id: newVariantId(), name: '', price: 0, printConfig: { enabled: false } })}
                >
                  Thêm biến thể
                </Button>
              </div>
            )}
          </Form.List>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving || uploading}>
            {uploading ? 'Đang tải ảnh...' : initial ? 'Cập nhật' : 'Thêm sản phẩm'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function r2KeyFromUrl(url: string): string | null {
  if (!R2_BASE || !url.startsWith(R2_BASE)) return null;
  return url.slice(R2_BASE.length + 1);
}

function variantPriceRange(variants: Record<string, IProductVariant>): string {
  const prices = Object.values(variants).map(v => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min.toLocaleString('vi-VN')}đ`;
  return `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}đ`;
}

function variantStockSummary(variants: Record<string, IProductVariant>): React.ReactNode {
  const tracked = Object.values(variants).filter(v => v.stock !== undefined);
  if (tracked.length === 0) return <Text type="secondary" className="text-xs">∞</Text>;
  const total = tracked.reduce((s, v) => s + (v.stock ?? 0), 0);
  if (total === 0) return <Tag color="error" className="text-xs">Hết hàng</Tag>;
  if (tracked.some(v => (v.stock ?? Infinity) <= 5)) return <Tag color="warning" className="text-xs">{total}</Tag>;
  return <Text className="text-xs font-medium">{total}</Text>;
}

/* ── Page ── */
export default function ProductsPage() {
  const { notification } = App.useApp();
  const { user } = useAdminAuth();
  const { data: products = [], isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: IProduct) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (values: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (editing) {
      await updateProduct({ id: editing.id, data: values });
      notification.success({ message: 'Cập nhật thành công' });
    } else {
      await createProduct(values);
      notification.success({ message: 'Thêm sản phẩm thành công' });
    }
    closeModal();
  };

  const handleDelete = async (product: IProduct) => {
    try {
      await deleteProduct(product.id);
      if (product.imageUrl && user) {
        const key = r2KeyFromUrl(product.imageUrl);
        if (key) {
          const idToken = await user.getIdToken();
          deleteProductImage(key, idToken);
        }
      }
      notification.success({ message: 'Đã xóa sản phẩm' });
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  const columns: ColumnsType<IProduct> = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      width: 64,
      render: (url?: string) =>
        url ? (
          <div className="relative h-10 w-10 overflow-hidden rounded">
            <Image src={url} alt="product" fill className="object-cover" sizes="40px" unoptimized />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-lg">📦</div>
        ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong className="text-sm">{name}</Text>
          {record.variants && (
            <Text type="secondary" className="block text-xs">
              {Object.keys(record.variants).length} biến thể
            </Text>
          )}
          {!record.variants && record.description && (
            <Text type="secondary" className="mt-0.5 block text-xs">{record.description}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Active', value: 'active' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ProductStatus) => {
        const cfg = PRODUCT_STATUS_CONFIG[status] ?? PRODUCT_STATUS_CONFIG.active;
        return <Badge status={cfg.color as 'default' | 'success' | 'error'} text={cfg.label} />;
      },
    },
    {
      title: 'Tồn kho',
      width: 100,
      sorter: (a, b) => {
        const aStock = a.variants
          ? Object.values(a.variants).filter(v => v.stock !== undefined).reduce((s, v) => s + (v.stock ?? 0), 0)
          : (a.stock ?? Infinity);
        const bStock = b.variants
          ? Object.values(b.variants).filter(v => v.stock !== undefined).reduce((s, v) => s + (v.stock ?? 0), 0)
          : (b.stock ?? Infinity);
        return aStock - bStock;
      },
      render: (_: unknown, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) {
          return variantStockSummary(record.variants);
        }
        return <StockCell stock={record.stock} />;
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      width: 160,
      sorter: (a, b) => a.price - b.price,
      render: (price: number, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) {
          return <Text strong className="text-xs">{variantPriceRange(record.variants)}</Text>;
        }
        return <Text strong>{price.toLocaleString('vi-VN')}đ</Text>;
      },
    },
    {
      title: 'In ảnh',
      dataIndex: 'printConfig',
      width: 140,
      render: (cfg: IProduct['printConfig'], record: IProduct) => {
        if (record.variants) {
          const printCount = Object.values(record.variants).filter(v => v.printConfig?.enabled).length;
          if (printCount === 0) return <Text type="secondary" className="text-xs">—</Text>;
          return <Tag color="green" className="text-xs">{printCount} biến thể</Tag>;
        }
        if (!cfg?.enabled) return <Text type="secondary" className="text-xs">—</Text>;
        const shapeLabel: Record<string, string> = { rectangle: 'Chữ nhật', square: 'Vuông', circle: 'Tròn' };
        let sizeStr = '';
        if (cfg.shape === 'circle') sizeStr = cfg.diameter ? `⌀${cfg.diameter}cm` : '';
        else if (cfg.shape === 'square') sizeStr = cfg.width ? `${cfg.width}×${cfg.width}cm` : '';
        else if (cfg.shape === 'rectangle') sizeStr = (cfg.width && cfg.height) ? `${cfg.width}×${cfg.height}cm` : '';
        return (
          <div className="flex flex-col gap-0.5">
            <Tag color="green" className="w-fit text-xs">{shapeLabel[cfg.shape ?? ''] ?? cfg.shape}</Tag>
            {sizeStr && <Text type="secondary" className="text-xs">{sizeStr}</Text>}
          </div>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'canBeNfc',
      width: 120,
      filters: [
        { text: 'Có thể NFC', value: true },
        { text: 'Thường', value: false },
      ],
      onFilter: (value, record) => {
        if (record.variants) return false;
        return record.canBeNfc === value;
      },
      render: (canBeNfc: boolean, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) {
          const nfcCount = Object.values(record.variants).filter(v => v.isNfc).length;
          return (
            <div className="flex flex-col gap-0.5">
              <Tag color="purple" className="w-fit text-xs">Biến thể</Tag>
              {nfcCount > 0 && <Tag color="blue" className="w-fit text-xs">📡 {nfcCount} NFC</Tag>}
            </div>
          );
        }
        return canBeNfc ? <Tag color="blue">📡 NFC</Tag> : <Tag>Thường</Tag>;
      },
    },
    {
      title: 'Hành động',
      width: 110,
      render: (_: unknown, record: IProduct) => (
        <span className="flex items-center gap-2 text-xs">
          <button className="text-primary hover:underline" onClick={() => openEdit(record)}>
            <EditOutlined /> Sửa
          </button>
          <span className="text-gray-300">·</span>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Đơn hàng đã tạo sẽ không bị ảnh hưởng."
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-red-500 hover:underline">
              <DeleteOutlined /> Xóa
            </button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const productList = products as IProduct[];
  const outOfStockCount = productList.filter(p => {
    if (p.variants && Object.keys(p.variants).length > 0) {
      const tracked = Object.values(p.variants).filter(v => v.stock !== undefined);
      return tracked.length > 0 && tracked.every(v => v.stock === 0);
    }
    return p.stock === 0;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Text type="secondary" className="text-sm">
            {productList.length} sản phẩm
          </Text>
          {outOfStockCount > 0 && (
            <Tag color="error" className="text-xs">{outOfStockCount} hết hàng</Tag>
          )}
        </div>
        <div className="flex gap-2">
          <Button icon={<InboxOutlined />} onClick={() => setRestockOpen(true)}>
            Nhập hàng
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={productList}
          rowKey="id"
          loading={isLoading}
          size="small"
          rowClassName={(record) => {
            if (record.variants && Object.keys(record.variants).length > 0) {
              const tracked = Object.values(record.variants).filter(v => v.stock !== undefined);
              return tracked.length > 0 && tracked.every(v => v.stock === 0) ? 'opacity-60' : '';
            }
            return record.stock === 0 ? 'opacity-60' : '';
          }}
          pagination={{
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
        />
      </Card>

      <ProductModal
        open={modalOpen}
        initial={editing}
        onClose={closeModal}
        onSave={handleSave}
      />

      <Modal
        title="Nhập hàng"
        open={restockOpen}
        onCancel={() => setRestockOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <RestockModal products={productList} onClose={() => setRestockOpen(false)} />
      </Modal>
    </div>
  );
}
