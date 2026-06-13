'use client';

import { useRef, useState } from 'react';
import {
  App,
  Badge,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/service';
import { usePresetPhotos, useCreatePresetPhoto, useDeletePresetPhoto } from '@/hooks/presetPhoto';
import { useComponents } from '@/hooks/component';
import { PRODUCT_TYPES } from '@/configs/constants';
import { uploadProductImage, deleteProductImage, uploadArticleImage } from '@/utils/r2-upload';
import RichTextEditor from '@/components/rich-text-editor';
import type {
  IProduct,
  IProductVariant,
  IProductOption,
  IService,
  IPresetPhoto,
  IPrintConfig,
  IComponent,
  IBomLine,
  PrintShape,
  ProductStatus,
  ProductType,
} from '@/configs/types';

const { Text } = Typography;

function priceFormatter(v: number | string | undefined) {
  return `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function priceParser(v: string | undefined) {
  return Number((v ?? '').replace(/\./g, '')) as 0;
}

function rid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Options → variant model (state-driven) ──
   Option có createsVariant=true sinh ra biến thể (tổ hợp chéo các value).
   Option createsVariant=false là cá nhân hóa (customization) — không nhân tồn kho,
   chỉ lưu định nghĩa để khách chọn lúc đặt hàng. */
interface OptValueRow {
  id: string;
  name: string;
  priceDelta?: number;    // chỉ dùng khi option.createsVariant
  componentId?: string;   // linh kiện tiêu hao khi chọn value này (BOM)
  componentQty?: number;
}
interface OptionRow {
  id: string;
  name: string;
  createsVariant: boolean;
  values: OptValueRow[];
}
/** Một biến thể được sinh ra, định danh bằng tổ hợp option (key). */
interface GenVariant {
  id: string;           // key trong Record<string, IProductVariant> đã lưu
  key: string;          // "shape:circle|nfc:yes" — định danh tổ hợp
  optionValues: string[];
  valueNames: string[]; // tên các value để hiển thị chip
  name: string;
  price: number;
  stock?: number;
  sku?: string;
  isNfc?: boolean;
  imageUrl?: string;
  printConfig?: IPrintConfig;
}

/** Sinh danh sách biến thể từ các option tạo-variant, giữ lại chỉnh sửa cũ theo key. */
function generateVariants(options: OptionRow[], basePrice: number, prev: GenVariant[]): GenVariant[] {
  const variantOpts = options.filter((o) => o.createsVariant && o.values.some((v) => v.name.trim()));
  if (variantOpts.length === 0) return [];

  let combos: { optId: string; val: OptValueRow }[][] = [[]];
  for (const opt of variantOpts) {
    const vals = opt.values.filter((v) => v.name.trim());
    const next: { optId: string; val: OptValueRow }[][] = [];
    for (const combo of combos) for (const val of vals) next.push([...combo, { optId: opt.id, val }]);
    combos = next;
  }

  const prevByKey = new Map(prev.map((v) => [v.key, v]));
  return combos.map((combo) => {
    const optionValues = combo.map((c) => `${c.optId}:${c.val.id}`);
    const valueNames = combo.map((c) => c.val.name.trim());
    const key = optionValues.join('|');
    const existing = prevByKey.get(key);
    const name = valueNames.join(' · ');
    if (existing) return { ...existing, optionValues, valueNames, name };
    const price = basePrice + combo.reduce((s, c) => s + (c.val.priceDelta ?? 0), 0);
    return { id: rid('v'), key, optionValues, valueNames, name, price };
  });
}

/** Nạp option của sản phẩm sẵn có vào state form. */
function loadOptions(p: IProduct): OptionRow[] {
  return (p.options ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    createsVariant: o.createsVariant,
    values: o.values.map((v) => ({
      id: v.id,
      name: v.name,
      priceDelta: v.priceDelta,
      componentId: v.componentId,
      componentQty: v.componentQty,
    })),
  }));
}

/** Nạp variant của sản phẩm sẵn có vào state form (suy tên value từ option nếu có). */
function loadVariants(p: IProduct): GenVariant[] {
  if (!p.variants) return [];
  const valName = new Map<string, string>();
  for (const o of p.options ?? []) for (const v of o.values) valName.set(`${o.id}:${v.id}`, v.name);
  return Object.entries(p.variants).map(([id, v]) => {
    const optionValues = v.optionValues ?? [];
    return {
      id,
      key: optionValues.length ? optionValues.join('|') : id,
      optionValues,
      valueNames: optionValues.map((ov) => valName.get(ov) ?? ov),
      name: v.name,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
      isNfc: v.isNfc,
      imageUrl: v.imageUrl,
      printConfig: v.printConfig ?? { enabled: false },
    };
  });
}

const SHAPE_OPTIONS = [
  { value: 'rectangle' as PrintShape, label: '▭ Chữ nhật' },
  { value: 'square' as PrintShape, label: '▢ Vuông' },
  { value: 'circle' as PrintShape, label: '○ Tròn' },
];

/* ── Controlled print-config editor (dùng cho cả simple-mode lẫn từng variant) ── */
function PrintConfigEditor({
  value,
  onChange,
  compact = false,
}: {
  value: IPrintConfig;
  onChange: (next: IPrintConfig) => void;
  compact?: boolean;
}) {
  const set = (patch: Partial<IPrintConfig>) => onChange({ ...value, ...patch });
  const numSize = compact ? 'small' : 'middle';

  return (
    <div>
      <div className="flex items-center gap-2">
        <Switch
          size="small"
          checked={value.enabled}
          onChange={(enabled) => set({ enabled })}
        />
        <Text type="secondary" className="text-xs">In ảnh</Text>
      </div>

      {value.enabled && (
        <div className={compact ? 'mt-2 grid grid-cols-3 gap-2' : 'mt-3 space-y-3'}>
          <Select
            size={numSize}
            placeholder="Hình dạng"
            value={value.shape}
            className={compact ? undefined : 'w-full'}
            style={compact ? { width: '100%' } : { width: '100%' }}
            onChange={(shape: PrintShape) =>
              set({ shape, width: undefined, height: undefined, diameter: undefined })
            }
            options={SHAPE_OPTIONS}
          />

          {value.shape === 'rectangle' && (
            <>
              <InputNumber
                size={numSize}
                min={0.1}
                step={0.1}
                placeholder="Rộng cm"
                style={{ width: '100%' }}
                addonAfter={compact ? undefined : 'cm'}
                value={value.width}
                onChange={(width) => set({ width: width ?? undefined })}
              />
              <InputNumber
                size={numSize}
                min={0.1}
                step={0.1}
                placeholder="Cao cm"
                style={{ width: '100%' }}
                addonAfter={compact ? undefined : 'cm'}
                value={value.height}
                onChange={(height) => set({ height: height ?? undefined })}
              />
            </>
          )}
          {value.shape === 'square' && (
            <InputNumber
              size={numSize}
              min={0.1}
              step={0.1}
              placeholder="Cạnh cm"
              className={compact ? 'col-span-2' : ''}
              style={{ width: '100%' }}
              addonAfter={compact ? undefined : 'cm'}
              value={value.width}
              onChange={(width) => set({ width: width ?? undefined })}
            />
          )}
          {value.shape === 'circle' && (
            <InputNumber
              size={numSize}
              min={0.1}
              step={0.1}
              placeholder="Đường kính cm"
              className={compact ? 'col-span-2' : ''}
              style={{ width: '100%' }}
              addonAfter={compact ? undefined : 'cm'}
              value={value.diameter}
              onChange={(diameter) => set({ diameter: diameter ?? undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** Chuẩn hóa printConfig trước khi lưu (bỏ nếu không bật / thiếu hình dạng). */
function cleanPrintConfig(pc?: IPrintConfig): IPrintConfig | undefined {
  if (!pc?.enabled || !pc.shape) return undefined;
  const out: IPrintConfig = { enabled: true, shape: pc.shape };
  if (pc.width != null) out.width = pc.width;
  if (pc.height != null) out.height = pc.height;
  if (pc.diameter != null) out.diameter = pc.diameter;
  return out;
}

type ProductFormFields = {
  name: string;
  type: ProductType;
  status: ProductStatus;
  description?: string;
  imageUrl?: string;
  price: number;       // simple: đơn giá; variant: giá gốc để tính giá mặc định
  stock?: number;      // simple-mode
  canBeNfc: boolean;   // simple-mode
  nfcExtraPrice?: number;
};

const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  active: { color: 'success', label: 'Active' },
  archived: { color: 'error', label: 'Archived' },
};

function StockCell({ stock }: { stock?: number }) {
  if (stock === undefined)
    return (
      <Text type="secondary" className="text-xs">
        ∞
      </Text>
    );
  if (stock === 0)
    return (
      <Tag color="error" className="text-xs">
        Hết hàng
      </Tag>
    );
  if (stock <= 5)
    return (
      <Tag color="warning" className="text-xs">
        Còn {stock}
      </Tag>
    );
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
        <Button
          size="small"
          icon={<UploadOutlined />}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
        {value && (
          <Button size="small" danger onClick={onRemove}>
            Xóa ảnh
          </Button>
        )}
        <Text type="secondary" className="text-[10px]">
          JPEG · PNG · WebP · tối đa 5 MB
        </Text>
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
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
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

  if (isLoading)
    return (
      <Text type="secondary" className="text-xs">
        Đang tải...
      </Text>
    );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(presets as IPresetPhoto[]).map((preset) => (
          <div
            key={preset.id}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200"
          >
            <Image
              src={preset.url}
              alt="preset"
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
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
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            ) : (
              <>
                <PlusOutlined style={{ fontSize: 18 }} />
                <span className="mt-1 text-[10px]">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      {(presets as IPresetPhoto[]).length === 0 && !uploading && (
        <Text type="secondary" className="mt-1 block text-xs">
          Chưa có ảnh mẫu nào.
        </Text>
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
  imageUrl?: string;
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
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm<ServiceFormValues>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleFinish = async (values: ServiceFormValues) => {
    setSaving(true);
    try {
      await onSave(values);
      if (initial?.imageUrl && values.imageUrl !== initial.imageUrl && user) {
        const key = r2KeyFromUrl(initial.imageUrl);
        if (key) {
          const idToken = await user.getIdToken();
          deleteProductImage(key, idToken);
        }
      }
      setUploadedKey(null);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={400}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          form.setFieldsValue({
            name: initial.name,
            price: initial.price,
            imageUrl: initial.imageUrl ?? '',
            description: initial.description,
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ price: 0, imageUrl: '' }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Ảnh dịch vụ" name="imageUrl">
          <ImageUploader
            value={imageUrl}
            uploading={uploading}
            onUpload={handleUpload}
            onRemove={handleRemoveImage}
          />
        </Form.Item>

        <Form.Item
          label="Tên dịch vụ"
          name="name"
          rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}
        >
          <Input placeholder="VD: Gói quà, Express 24h..." autoFocus />
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
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input placeholder="Mô tả ngắn (tùy chọn)" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            onClick={() => {
              void handleClose();
            }}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={saving || uploading}>
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
  const [form] = Form.useForm<ProductFormFields>();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'simple' | 'variants'>('simple');
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [variants, setVariants] = useState<GenVariant[]>([]);
  const [baseComponents, setBaseComponents] = useState<IBomLine[]>([]);
  const [simplePrint, setSimplePrint] = useState<IPrintConfig>({ enabled: false });
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [detailArticle, setDetailArticle] = useState<string>('');

  const { data: rawComponents = [] } = useComponents();
  const components = rawComponents as IComponent[];
  const componentOptions = components.map((c) => ({ value: c.id, label: c.name }));
  const imageUrl: string = Form.useWatch('imageUrl', form) ?? '';
  const basePrice: number = Form.useWatch('price', form) ?? 0;

  // Mọi thay đổi option → tự sinh lại variant, giữ chỉnh sửa cũ theo key tổ hợp.
  const applyOptions = (next: OptionRow[]) => {
    setOptions(next);
    setVariants((prev) => generateVariants(next, basePrice, prev));
  };
  const patchVariant = (id: string, patch: Partial<GenVariant>) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const [variantUploadingId, setVariantUploadingId] = useState<string | null>(null);
  const uploadVariantImage = async (variantId: string, file: File) => {
    if (!user) return;
    setVariantUploadingId(variantId);
    try {
      const idToken = await user.getIdToken();
      const { url } = await uploadProductImage(file, idToken);
      patchVariant(variantId, { imageUrl: url });
    } catch (err) {
      notification.error({
        message: 'Upload ảnh biến thể thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setVariantUploadingId(null);
    }
  };

  const handleArticleImageUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('Chưa đăng nhập');
    const idToken = await user.getIdToken();
    return uploadArticleImage(file, idToken);
  };

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

  const handleFinish = async (values: ProductFormFields) => {
    setSaving(true);
    try {
      const useVariants = mode === 'variants';
      const { price, stock, canBeNfc, nfcExtraPrice, ...common } = values;

      let variantMap: IProduct['variants'];
      let optionDefs: IProductOption[] | undefined;

      if (useVariants) {
        const genned = generateVariants(options, price, variants);
        variantMap = {};
        for (const v of genned) {
          const entry: IProductVariant = {
            name: v.name.trim() || v.valueNames.join(' · '),
            price: v.price,
          };
          if (v.optionValues.length) entry.optionValues = v.optionValues;
          if (v.sku?.trim()) entry.sku = v.sku.trim();
          if (v.stock != null) entry.stock = v.stock;
          if (v.isNfc) entry.isNfc = true;
          if (v.imageUrl) entry.imageUrl = v.imageUrl;
          const pc = cleanPrintConfig(v.printConfig);
          if (pc) entry.printConfig = pc;
          variantMap[v.id] = entry;
        }
        if (Object.keys(variantMap).length === 0) variantMap = undefined;

        const cleaned = options
          .map((o) => ({ ...o, values: o.values.filter((vv) => vv.name.trim()) }))
          .filter((o) => o.name.trim() && o.values.length > 0);
        optionDefs = cleaned.length
          ? cleaned.map((o) => ({
              id: o.id,
              name: o.name.trim(),
              createsVariant: o.createsVariant,
              values: o.values.map((vv) => ({
                id: vv.id,
                name: vv.name.trim(),
                ...(o.createsVariant && vv.priceDelta ? { priceDelta: vv.priceDelta } : {}),
                ...(o.createsVariant && vv.componentId
                  ? { componentId: vv.componentId, componentQty: vv.componentQty ?? 1 }
                  : {}),
              })),
            }))
          : undefined;
      }

      const cleanedBase = baseComponents.filter((b) => b.componentId && b.qty > 0);

      await onSave({
        ...common,
        price,
        canBeNfc: useVariants ? false : canBeNfc,
        stock: useVariants ? undefined : stock,
        nfcExtraPrice: useVariants ? undefined : nfcExtraPrice,
        printConfig: useVariants ? undefined : cleanPrintConfig(simplePrint),
        options: optionDefs,
        baseComponents: cleanedBase.length > 0 ? cleanedBase : undefined,
        variants: variantMap,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
        detailArticle: detailArticle.trim() || undefined,
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
      setDetailArticle('');
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
      width={760}
      afterOpenChange={(vis) => {
        if (!vis) return;
        if (initial) {
          const hasVariants = !!initial.variants && Object.keys(initial.variants).length > 0;
          setMode(hasVariants ? 'variants' : 'simple');
          setOptions(loadOptions(initial));
          setVariants(loadVariants(initial));
          setBaseComponents(initial.baseComponents ?? []);
          setSimplePrint(initial.printConfig ?? { enabled: false });
          setSelectedServiceIds(initial.serviceIds ?? []);
          setDetailArticle(initial.detailArticle ?? '');
          form.setFieldsValue({
            name: initial.name,
            type: initial.type ?? 'keychain',
            price: initial.price,
            status: initial.status,
            stock: initial.stock,
            canBeNfc: initial.canBeNfc,
            nfcExtraPrice: initial.nfcExtraPrice,
            description: initial.description,
            imageUrl: initial.imageUrl ?? '',
          });
        } else {
          setMode('simple');
          setOptions([]);
          setVariants([]);
          setBaseComponents([]);
          setSimplePrint({ enabled: false });
          setSelectedServiceIds([]);
          setDetailArticle('');
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'draft',
          type: 'keychain',
          canBeNfc: false,
          price: 0,
          imageUrl: '',
        }}
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

        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
        >
          <Input placeholder="Ví dụ: Móc khóa NFC Premium" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Loại sản phẩm" name="type" rules={[{ required: true }]}>
            <Select
              options={(Object.keys(PRODUCT_TYPES) as ProductType[]).map((t) => ({
                value: t,
                label: PRODUCT_TYPES[t],
              }))}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'draft', label: '⬜ Draft — chưa bán' },
                { value: 'active', label: '🟢 Active — đang bán' },
                { value: 'archived', label: '🔴 Archived — ngừng bán' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn..." />
        </Form.Item>

        <Divider titlePlacement="start" orientationMargin={0} className="!mt-1 !mb-3 !text-xs !text-gray-400">
          Giá & Kho
        </Divider>

        <div className="mb-3 flex items-center gap-2">
          <Switch
            size="small"
            checked={mode === 'variants'}
            onChange={(checked) => setMode(checked ? 'variants' : 'simple')}
          />
          <Text className="text-sm">Có biến thể (theo tùy chọn)</Text>
          <Text type="secondary" className="text-xs">VD: Hình dạng × NFC × Charm</Text>
        </div>

        {/* ── Simple mode ── */}
        {mode === 'simple' && (
          <>
            <div className="grid grid-cols-2 gap-x-3">
              <Form.Item label="Đơn giá (đ)" name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={priceFormatter} parser={priceParser} placeholder="189.000" />
              </Form.Item>

              <Form.Item label="Tồn kho" name="stock" extra="Để trống = không giới hạn">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="∞" />
              </Form.Item>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <Form.Item name="canBeNfc" valuePropName="checked" className="!mb-0">
                <Switch size="small" />
              </Form.Item>
              <Text className="text-sm">Có thể gắn NFC</Text>
              <Form.Item noStyle shouldUpdate={(p, c) => p.canBeNfc !== c.canBeNfc}>
                {() =>
                  form.getFieldValue('canBeNfc') ? (
                    <Form.Item name="nfcExtraPrice" className="!mb-0">
                      <InputNumber size="small" min={0} formatter={priceFormatter} parser={priceParser} addonBefore="+ NFC" addonAfter="đ" placeholder="0" />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </div>

            <div className="rounded-lg border border-divider p-3">
              <PrintConfigEditor value={simplePrint} onChange={setSimplePrint} />
            </div>
          </>
        )}

        {/* ── Variant mode: Options → tự sinh biến thể ── */}
        {mode === 'variants' && (
          <>
            <Form.Item
              label="Giá gốc (đ)"
              name="price"
              rules={[{ required: true, message: 'Nhập giá gốc' }]}
              extra="Giá mặc định của biến thể mới = giá gốc + chênh lệch của tùy chọn"
            >
              <InputNumber min={0} style={{ width: '100%' }} formatter={priceFormatter} parser={priceParser} placeholder="189.000" />
            </Form.Item>

            <Text type="secondary" className="mb-1 block text-xs font-medium">Tùy chọn</Text>
            <div className="space-y-2">
              {options.map((o) => (
                <div key={o.id} className="rounded-lg border border-divider p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      size="small"
                      placeholder="Tên tùy chọn (VD: Hình dạng)"
                      value={o.name}
                      className="flex-1"
                      onChange={(e) =>
                        applyOptions(options.map((x) => (x.id === o.id ? { ...x, name: e.target.value } : x)))
                      }
                    />
                    <Switch
                      size="small"
                      checked={o.createsVariant}
                      checkedChildren="Biến thể"
                      unCheckedChildren="Cá nhân hóa"
                      onChange={(c) =>
                        applyOptions(options.map((x) => (x.id === o.id ? { ...x, createsVariant: c } : x)))
                      }
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => applyOptions(options.filter((x) => x.id !== o.id))}
                    />
                  </div>

                  <div className="mt-2 space-y-1">
                    {o.values.map((val) => {
                      const setVal = (patch: Partial<OptValueRow>) =>
                        applyOptions(
                          options.map((x) =>
                            x.id === o.id
                              ? { ...x, values: x.values.map((y) => (y.id === val.id ? { ...y, ...patch } : y)) }
                              : x,
                          ),
                        );
                      return (
                        <div key={val.id} className="flex flex-wrap items-center gap-2">
                          <Input
                            size="small"
                            placeholder="Giá trị (VD: Tròn)"
                            value={val.name}
                            style={{ width: 140 }}
                            onChange={(e) => setVal({ name: e.target.value })}
                          />
                          {o.createsVariant && (
                            <>
                              <InputNumber
                                size="small"
                                placeholder="+ giá"
                                style={{ width: 100 }}
                                formatter={priceFormatter}
                                parser={priceParser}
                                value={val.priceDelta}
                                onChange={(n) => setVal({ priceDelta: n ?? undefined })}
                              />
                              <Select
                                size="small"
                                placeholder="Trừ linh kiện"
                                style={{ width: 150 }}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                value={val.componentId ?? undefined}
                                options={componentOptions}
                                onChange={(cid?: string) =>
                                  setVal({ componentId: cid, componentQty: cid ? (val.componentQty ?? 1) : undefined })
                                }
                              />
                              {val.componentId && (
                                <InputNumber
                                  size="small"
                                  min={1}
                                  style={{ width: 56 }}
                                  value={val.componentQty ?? 1}
                                  onChange={(n) => setVal({ componentQty: n ?? 1 })}
                                />
                              )}
                            </>
                          )}
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              applyOptions(
                                options.map((x) =>
                                  x.id === o.id ? { ...x, values: x.values.filter((y) => y.id !== val.id) } : x,
                                ),
                              )
                            }
                          />
                        </div>
                      );
                    })}
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        applyOptions(
                          options.map((x) =>
                            x.id === o.id ? { ...x, values: [...x.values, { id: rid('o'), name: '' }] } : x,
                          ),
                        )
                      }
                    >
                      Thêm giá trị
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() =>
                  applyOptions([
                    ...options,
                    { id: rid('opt'), name: '', createsVariant: true, values: [{ id: rid('o'), name: '' }] },
                  ])
                }
              >
                Thêm tùy chọn
              </Button>
            </div>

            {variants.length > 0 && (
              <>
                <Divider titlePlacement="start" orientationMargin={0} className="!mt-4 !mb-2 !text-xs !text-gray-400">
                  Biến thể ({variants.length}) — tự sinh từ tùy chọn tạo-biến-thể
                </Divider>

                <div className="mb-1 grid grid-cols-12 gap-2 px-1">
                  <Text type="secondary" className="col-span-4 text-[10px]">Giá (đ)</Text>
                  <Text type="secondary" className="col-span-3 text-[10px]">Kho</Text>
                  <Text type="secondary" className="col-span-3 text-[10px]">SKU</Text>
                  <Text type="secondary" className="col-span-2 text-center text-[10px]">NFC</Text>
                </div>

                <div className="space-y-2">
                  {variants.map((v) => (
                    <div key={v.id} className="rounded-lg border border-divider bg-gray-50 p-3">
                      <div className="mb-2 flex flex-wrap gap-1">
                        {v.valueNames.map((n, i) => (
                          <Tag key={i} className="text-[10px]">{n || '—'}</Tag>
                        ))}
                      </div>

                      <div className="mb-2">
                        <ImageUploader
                          value={v.imageUrl}
                          uploading={variantUploadingId === v.id}
                          onUpload={(file) => uploadVariantImage(v.id, file)}
                          onRemove={() => patchVariant(v.id, { imageUrl: undefined })}
                        />
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <InputNumber
                          className="col-span-4"
                          size="small"
                          min={0}
                          style={{ width: '100%' }}
                          formatter={priceFormatter}
                          parser={priceParser}
                          value={v.price}
                          onChange={(n) => patchVariant(v.id, { price: n ?? 0 })}
                        />
                        <InputNumber
                          className="col-span-3"
                          size="small"
                          min={0}
                          style={{ width: '100%' }}
                          placeholder="∞"
                          value={v.stock}
                          onChange={(n) => patchVariant(v.id, { stock: n ?? undefined })}
                        />
                        <Input
                          className="col-span-3"
                          size="small"
                          placeholder="SKU"
                          value={v.sku}
                          onChange={(e) => patchVariant(v.id, { sku: e.target.value })}
                        />
                        <div className="col-span-2 flex items-center justify-center">
                          <Switch
                            size="small"
                            checkedChildren="📡"
                            unCheckedChildren="—"
                            checked={!!v.isNfc}
                            onChange={(c) => patchVariant(v.id, { isNfc: c })}
                          />
                        </div>
                      </div>

                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <PrintConfigEditor
                          compact
                          value={v.printConfig ?? { enabled: false }}
                          onChange={(pc) => patchVariant(v.id, { printConfig: pc })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <Divider titlePlacement="start" orientationMargin={0} className="!mt-4 !mb-3 !text-xs !text-gray-400">
          Linh kiện nền (luôn trừ kho mỗi sản phẩm)
        </Divider>

        {components.length === 0 ? (
          <Text type="secondary" className="text-xs">
            Chưa có linh kiện nào. Tạo ở trang <b>Kho linh kiện</b> trước để gắn định mức trừ kho.
          </Text>
        ) : (
          <div className="space-y-1.5">
            {baseComponents.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  size="small"
                  placeholder="Chọn linh kiện"
                  className="flex-1"
                  showSearch
                  optionFilterProp="label"
                  value={line.componentId || undefined}
                  options={componentOptions}
                  onChange={(cid: string) =>
                    setBaseComponents((prev) => prev.map((b, i) => (i === idx ? { ...b, componentId: cid } : b)))
                  }
                />
                <InputNumber
                  size="small"
                  min={1}
                  style={{ width: 64 }}
                  value={line.qty}
                  onChange={(n) =>
                    setBaseComponents((prev) => prev.map((b, i) => (i === idx ? { ...b, qty: n ?? 1 } : b)))
                  }
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => setBaseComponents((prev) => prev.filter((_, i) => i !== idx))}
                />
              </div>
            ))}
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setBaseComponents((prev) => [...prev, { componentId: '', qty: 1 }])}
            >
              Thêm linh kiện nền
            </Button>
          </div>
        )}

        <Divider
          titlePlacement="start"
          orientationMargin={0}
          className="!mt-4 !mb-3 !text-xs !text-gray-400"
        >
          Ảnh mẫu in sẵn
        </Divider>

        {initial ? (
          <PresetPhotoManager productId={initial.id} />
        ) : (
          <Text type="secondary" className="text-xs">
            Lưu sản phẩm trước, sau đó quay lại để thêm ảnh mẫu.
          </Text>
        )}

        <Divider
          titlePlacement="start"
          orientationMargin={0}
          className="!mt-2 !mb-3 !text-xs !text-gray-400"
        >
          Dịch vụ cộng thêm
        </Divider>

        {services.length === 0 ? (
          <Text type="secondary" className="text-xs">
            Chưa có dịch vụ nào. Tạo dịch vụ từ trang sản phẩm trước.
          </Text>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    setSelectedServiceIds((prev) =>
                      selected ? prev.filter((id) => id !== service.id) : [...prev, service.id],
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                    selected
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span>{service.name}</span>
                  <span className={selected ? 'text-blue-500' : 'text-gray-400'}>
                    +{service.price.toLocaleString('vi-VN')}đ
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Divider
          titlePlacement="start"
          orientationMargin={0}
          className="!mt-2 !mb-3 !text-xs !text-gray-400"
        >
          Bài viết chi tiết
        </Divider>

        <RichTextEditor
          content={detailArticle}
          onChange={setDetailArticle}
          uploadFn={handleArticleImageUpload}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleClose} disabled={saving}>
            Hủy
          </Button>
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
  const prices = Object.values(variants).map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min.toLocaleString('vi-VN')}đ`;
  return `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}đ`;
}

function variantStockSummary(variants: Record<string, IProductVariant>): React.ReactNode {
  const tracked = Object.values(variants).filter((v) => v.stock !== undefined);
  if (tracked.length === 0)
    return (
      <Text type="secondary" className="text-xs">
        ∞
      </Text>
    );
  const total = tracked.reduce((s, v) => s + (v.stock ?? 0), 0);
  if (total === 0)
    return (
      <Tag color="error" className="text-xs">
        Hết hàng
      </Tag>
    );
  if (tracked.some((v) => (v.stock ?? Infinity) <= 5))
    return (
      <Tag color="warning" className="text-xs">
        {total}
      </Tag>
    );
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

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: IProduct) => {
    setEditing(p);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (
    values: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> => {
    if (editing) {
      await updateProduct({ id: editing.id, data: values });
      notification.success({ message: 'Cập nhật thành công' });
    } else {
      await createProduct(values);
      notification.success({ message: 'Thêm sản phẩm thành công' });
    }
    closeModal();
  };

  const handleServiceSave = async (values: {
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
  }) => {
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

  const handleServiceDelete = async (service: IService) => {
    await deleteService(service.id);
    if (service.imageUrl && user) {
      const key = r2KeyFromUrl(service.imageUrl);
      if (key) {
        const idToken = await user.getIdToken();
        deleteProductImage(key, idToken);
      }
    }
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
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-lg">
            📦
          </div>
        ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (name: string, record) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Text strong className="text-sm">
              {name}
            </Text>
            <Tag className="!m-0 text-[10px]">{PRODUCT_TYPES[record.type ?? 'keychain']}</Tag>
          </div>
          {record.variants && (
            <Text type="secondary" className="block text-xs">
              {Object.keys(record.variants).length} biến thể
            </Text>
          )}
          {!record.variants && record.description && (
            <Text type="secondary" className="mt-0.5 block text-xs">
              {record.description}
            </Text>
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
          ? Object.values(a.variants)
              .filter((v) => v.stock !== undefined)
              .reduce((s, v) => s + (v.stock ?? 0), 0)
          : (a.stock ?? Infinity);
        const bStock = b.variants
          ? Object.values(b.variants)
              .filter((v) => v.stock !== undefined)
              .reduce((s, v) => s + (v.stock ?? 0), 0)
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
          return (
            <Text strong className="text-xs">
              {variantPriceRange(record.variants)}
            </Text>
          );
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
          const printCount = Object.values(record.variants).filter(
            (v) => v.printConfig?.enabled,
          ).length;
          if (printCount === 0)
            return (
              <Text type="secondary" className="text-xs">
                —
              </Text>
            );
          return (
            <Tag color="green" className="text-xs">
              {printCount} biến thể
            </Tag>
          );
        }
        if (!cfg?.enabled)
          return (
            <Text type="secondary" className="text-xs">
              —
            </Text>
          );
        const shapeLabel: Record<string, string> = {
          rectangle: 'Chữ nhật',
          square: 'Vuông',
          circle: 'Tròn',
        };
        let sizeStr = '';
        if (cfg.shape === 'circle') sizeStr = cfg.diameter ? `⌀${cfg.diameter}cm` : '';
        else if (cfg.shape === 'square') sizeStr = cfg.width ? `${cfg.width}×${cfg.width}cm` : '';
        else if (cfg.shape === 'rectangle')
          sizeStr = cfg.width && cfg.height ? `${cfg.width}×${cfg.height}cm` : '';
        return (
          <div className="flex flex-col gap-0.5">
            <Tag color="green" className="w-fit text-xs">
              {shapeLabel[cfg.shape ?? ''] ?? cfg.shape}
            </Tag>
            {sizeStr && (
              <Text type="secondary" className="text-xs">
                {sizeStr}
              </Text>
            )}
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
          const nfcCount = Object.values(record.variants).filter((v) => v.isNfc).length;
          return (
            <div className="flex flex-col gap-0.5">
              <Tag color="purple" className="w-fit text-xs">
                Biến thể
              </Tag>
              {nfcCount > 0 && (
                <Tag color="blue" className="w-fit text-xs">
                  📡 {nfcCount} NFC
                </Tag>
              )}
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
  const outOfStockCount = productList.filter((p) => {
    if (p.variants && Object.keys(p.variants).length > 0) {
      const tracked = Object.values(p.variants).filter((v) => v.stock !== undefined);
      return tracked.length > 0 && tracked.every((v) => v.stock === 0);
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
            <Tag color="error" className="text-xs">
              {outOfStockCount} hết hàng
            </Tag>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setServiceListOpen(true)}>
            Dịch vụ
            {(services as IService[]).length > 0 && (
              <span className="ml-1 text-[10px] text-gray-400">
                ({(services as IService[]).length})
              </span>
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
              const tracked = Object.values(record.variants).filter((v) => v.stock !== undefined);
              return tracked.length > 0 && tracked.every((v) => v.stock === 0) ? 'opacity-60' : '';
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
            <Text type="secondary" className="block text-sm">
              Chưa có dịch vụ nào.
            </Text>
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
                    <div className="flex items-center gap-2">
                      {s.imageUrl && (
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-gray-100">
                          <Image src={s.imageUrl} alt={s.name} fill className="object-cover" sizes="36px" unoptimized />
                        </div>
                      )}
                      <div>
                        <Text strong className="text-sm">
                          {s.name}
                        </Text>
                        {s.description && (
                          <Text type="secondary" className="block text-xs">
                            {s.description}
                          </Text>
                        )}
                      </div>
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
                        onClick={() => {
                          setEditingService(s);
                          setServiceFormOpen(true);
                        }}
                      >
                        <EditOutlined /> Sửa
                      </button>
                      <Popconfirm
                        title="Xóa dịch vụ này?"
                        onConfirm={() => handleServiceDelete(s)}
                        okText="Xóa"
                        cancelText="Hủy"
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
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              setServiceFormOpen(true);
            }}
          >
            Thêm dịch vụ mới
          </Button>
        </div>
      </Modal>

      <ServiceModal
        open={serviceFormOpen}
        initial={editingService}
        onClose={() => {
          setServiceFormOpen(false);
          setEditingService(null);
        }}
        onSave={handleServiceSave}
      />
    </div>
  );
}
