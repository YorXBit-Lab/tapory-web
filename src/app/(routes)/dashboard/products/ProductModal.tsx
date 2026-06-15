'use client';

import { useState } from 'react';
import {
  App,
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Typography,
} from 'antd';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useComponents } from '@/hooks/component';
import { uploadProductImage, deleteProductImage, uploadArticleImage } from '@/utils/r2-upload';
import { priceFormatter, priceParser } from '@/utils/format';
import RichTextEditor from '@/components/rich-text-editor';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { PrintConfigEditor } from '@/components/dashboard/PrintConfigEditor';
import { generateVariants, loadOptions, loadVariants, cleanPrintConfig } from './utils';
import { PresetPhotoManager } from './PresetPhotoManager';
import { VariantOptionsEditor } from './product-modal/VariantOptionsEditor';
import { VariantsTable } from './product-modal/VariantsTable';
import { BaseComponentsEditor } from './product-modal/BaseComponentsEditor';
import { ServicesPicker } from './product-modal/ServicesPicker';
import { PRODUCT_TYPES } from '@/configs/constants';
import type {
  IProduct,
  IProductVariant,
  IProductOption,
  IService,
  IPrintConfig,
  IComponent,
  IBomLine,
  ProductType,
} from '@/configs/types';
import type { OptionRow, GenVariant, ProductFormFields } from './types';

const { Text } = Typography;

interface ProductModalProps {
  open: boolean;
  initial?: IProduct | null;
  services: IService[];
  onClose: () => void;
  onSave: (values: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function ProductModal({ open, initial, services, onClose, onSave }: ProductModalProps) {
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

        <Divider titlePlacement="start" orientationMargin={0} className="!mt-1 !mb-3 !text-xs !text-content3">
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

            <VariantOptionsEditor
              options={options}
              applyOptions={applyOptions}
              componentOptions={componentOptions}
            />

            <VariantsTable
              variants={variants}
              patchVariant={patchVariant}
              variantUploadingId={variantUploadingId}
              onUploadVariantImage={uploadVariantImage}
            />
          </>
        )}

        <Divider titlePlacement="start" orientationMargin={0} className="!mt-4 !mb-3 !text-xs !text-content3">
          Linh kiện nền (luôn trừ kho mỗi sản phẩm)
        </Divider>

        <BaseComponentsEditor
          components={components}
          componentOptions={componentOptions}
          baseComponents={baseComponents}
          setBaseComponents={setBaseComponents}
        />

        <Divider
          titlePlacement="start"
          orientationMargin={0}
          className="!mt-4 !mb-3 !text-xs !text-content3"
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
          className="!mt-2 !mb-3 !text-xs !text-content3"
        >
          Dịch vụ cộng thêm
        </Divider>

        <ServicesPicker
          services={services}
          selectedServiceIds={selectedServiceIds}
          setSelectedServiceIds={setSelectedServiceIds}
        />

        <Divider
          titlePlacement="start"
          orientationMargin={0}
          className="!mt-2 !mb-3 !text-xs !text-content3"
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
