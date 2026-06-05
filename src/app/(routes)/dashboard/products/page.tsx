'use client';

import { useRef, useState } from 'react';
import {
  App, Badge, Button, Card, Divider, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Switch, Table, Tag, Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/service';
import { usePresetPhotos, useCreatePresetPhoto, useDeletePresetPhoto } from '@/hooks/presetPhoto';
import { TEMPLATE_LIST } from '@/configs/constants';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IProduct, IProductVariant, IService, IPresetPhoto, IPrintConfig, PrintShape, ProductStatus } from '@/configs/types';

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

type ProductFormInternal = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt' | 'variants' | 'serviceIds'> & {
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

/* ── Preset photo manager ── */
function PresetPhotoManager({ productId }: { productId: string }) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const { data: presets = [], isLoading } = usePresetPhotos(productId);
  const { mutateAsync: createPreset } = useCreatePresetPhoto(productId);
  const { mutateAsync: deletePreset } = useDeletePresetPhoto(productId);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      await createPreset({ productId, url, key, sortOrder: presets.length });
    } catch (err) {
      notification.error({ message: 'Upload thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (preset: IPresetPhoto) => {
    try {
      if (user) {
        const idToken = await user.getIdToken();
        deleteProductImage(preset.key, idToken);
      }
      await deletePreset(preset.id);
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  if (isLoading) return <Text type="secondary" className="text-xs">Đang tải...</Text>;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(presets as IPresetPhoto[]).map(preset => (
          <div key={preset.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            <Image src={preset.url} alt="preset" fill className="object-cover" sizes="80px" unoptimized />
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleDelete(preset)}
            >
              <DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />
            </button>
          </div>
        ))}

        {(presets as IPresetPhoto[]).length < 20 && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
          >
            {uploading
              ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
              : <><PlusOutlined style={{ fontSize: 18 }} /><span className="mt-1 text-[10px]">Thêm ảnh</span></>
            }
          </button>
        )}
      </div>

      {(presets as IPresetPhoto[]).length === 0 && !uploading && (
        <Text type="secondary" className="mt-1 block text-xs">Chưa có ảnh mẫu nào.</Text>
      )}

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
  );
}

/* ── Service modal (quản lý dịch vụ toàn hệ thống) ── */
interface ServiceFormValues {
  name: string;
  price: number;
  enablesNfc?: boolean;
  description?: string;
}

function ServiceModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IService | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => Promise<void>;
}) {
  const [form] = Form.useForm<ServiceFormValues>();
  const [saving, setSaving] = useState(false);

  const handleFinish = async (values: ServiceFormValues) => {
    setSaving(true);
    try { await onSave(values); form.resetFields(); }
    finally { setSaving(false); }
  };

  return (
    <Modal
      title={initial ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      footer={null}
      destroyOnHidden
      width={400}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          form.setFieldsValue({
            name: initial.name,
            price: initial.price,
            enablesNfc: initial.enablesNfc ?? false,
            description: initial.description,
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ enablesNfc: false, price: 0 }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
          <Input placeholder="VD: NFC, Gói quà, Express 24h..." autoFocus />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Phụ phí (đ)" name="price" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
              placeholder="0"
              addonAfter="đ"
            />
          </Form.Item>

          <Form.Item label="Kích hoạt NFC" name="enablesNfc" valuePropName="checked">
            <Switch checkedChildren="📡 Có" unCheckedChildren="Không" />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input placeholder="Mô tả ngắn (tùy chọn)" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={() => { form.resetFields(); onClose(); }} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {initial ? 'Cập nhật' : 'Thêm dịch vụ'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ── Product modal ── */
function ProductModal({
  open,
  initial,
  services,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IProduct | null;
  services: IService[];
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
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
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

      await onSave({
        ...rest,
        variants,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
      });

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

          setSelectedServiceIds(initial.serviceIds ?? []);

          form.setFieldsValue({
            name: initial.name,
            price: initial.price,
            status: initial.status,
            stock: initial.stock,
            canBeNfc: initial.canBeNfc,
            nfcExtraPrice: initial.nfcExtraPrice,
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

        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'draft',    label: '⬜ Draft — chưa bán' },
              { value: 'active',   label: '🟢 Active — đang bán' },
              { value: 'archived', label: '🔴 Archived — ngừng bán' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn..." />
        </Form.Item>

        {/* @ts-expect-error — Antd Orientation type mismatch in this version */}
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


            {/* @ts-expect-error — Antd Orientation type mismatch in this version */}
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
                        <Text type="secondary" className="text-[10px]">Kho · NFC · Xóa</Text>
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

        <Divider orientation="left" orientationMargin={0} className="!mb-3 !mt-2 !text-xs !text-gray-400">
          Ảnh mẫu in sẵn
        </Divider>

        {initial ? (
          <PresetPhotoManager productId={initial.id} />
        ) : (
          <Text type="secondary" className="text-xs">Lưu sản phẩm trước, sau đó quay lại để thêm ảnh mẫu.</Text>
        )}

        <Divider orientation="left" orientationMargin={0} className="!mb-3 !mt-2 !text-xs !text-gray-400">
          Dịch vụ cộng thêm
        </Divider>

        {services.length === 0 ? (
          <Text type="secondary" className="text-xs">
            Chưa có dịch vụ nào. Tạo dịch vụ từ trang sản phẩm trước.
          </Text>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map(service => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    setSelectedServiceIds(prev =>
                      selected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                    selected
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {service.enablesNfc && <span>📡</span>}
                  <span>{service.name}</span>
                  <span className={selected ? 'text-blue-500' : 'text-gray-400'}>
                    +{service.price.toLocaleString('vi-VN')}đ
                  </span>
                </button>
              );
            })}
          </div>
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

  const { data: services = [] } = useServices();
  const { mutateAsync: createService } = useCreateService();
  const { mutateAsync: updateService } = useUpdateService();
  const { mutateAsync: deleteService } = useDeleteService();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [serviceListOpen, setServiceListOpen] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);

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

  const handleServiceSave = async (values: { name: string; price: number; enablesNfc?: boolean; description?: string }) => {
    if (editingService) {
      await updateService({ id: editingService.id, data: values });
      notification.success({ message: 'Đã cập nhật dịch vụ' });
    } else {
      await createService(values);
      notification.success({ message: 'Đã thêm dịch vụ' });
    }
    setServiceFormOpen(false);
    setEditingService(null);
  };

  const handleServiceDelete = async (id: string) => {
    await deleteService(id);
    notification.success({ message: 'Đã xóa dịch vụ' });
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
          <Button onClick={() => setServiceListOpen(true)}>
            Dịch vụ
            {(services as IService[]).length > 0 && (
              <span className="ml-1 text-[10px] text-gray-400">({(services as IService[]).length})</span>
            )}
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
        services={services as IService[]}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* Danh sách dịch vụ */}
      <Modal
        title="Dịch vụ cộng thêm"
        open={serviceListOpen}
        onCancel={() => setServiceListOpen(false)}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <div className="space-y-3 pt-2">
          {(services as IService[]).length === 0 ? (
            <Text type="secondary" className="block text-sm">Chưa có dịch vụ nào.</Text>
          ) : (
            <Table
              dataSource={services as IService[]}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Dịch vụ',
                  render: (_: unknown, s: IService) => (
                    <div>
                      <Text strong className="text-sm">{s.enablesNfc ? '📡 ' : ''}{s.name}</Text>
                      {s.description && <Text type="secondary" className="block text-xs">{s.description}</Text>}
                    </div>
                  ),
                },
                {
                  title: 'Phụ phí',
                  dataIndex: 'price',
                  width: 120,
                  render: (p: number) => <Text strong>+{p.toLocaleString('vi-VN')}đ</Text>,
                },
                {
                  title: '',
                  width: 80,
                  render: (_: unknown, s: IService) => (
                    <span className="flex gap-2 text-xs">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => { setEditingService(s); setServiceFormOpen(true); }}
                      >
                        <EditOutlined /> Sửa
                      </button>
                      <Popconfirm
                        title="Xóa dịch vụ này?"
                        onConfirm={() => handleServiceDelete(s.id)}
                        okText="Xóa" cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <button className="text-red-500 hover:underline">
                          <DeleteOutlined />
                        </button>
                      </Popconfirm>
                    </span>
                  ),
                },
              ]}
            />
          )}
          <Button
            type="dashed" block icon={<PlusOutlined />}
            onClick={() => { setEditingService(null); setServiceFormOpen(true); }}
          >
            Thêm dịch vụ mới
          </Button>
        </div>
      </Modal>

      <ServiceModal
        open={serviceFormOpen}
        initial={editingService}
        onClose={() => { setServiceFormOpen(false); setEditingService(null); }}
        onSave={handleServiceSave}
      />

    </div>
  );
}
