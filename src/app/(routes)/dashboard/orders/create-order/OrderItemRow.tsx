'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button, Checkbox, Form, Input, InputNumber, Select, Switch, Tag, Tooltip, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { TEMPLATE_LIST } from '@/configs/constants';
import { priceFormatter, priceParser } from '@/utils/format';
import type { IProduct, IService, IPresetPhoto, IPrintConfig } from '@/configs/types';
import type { OrderFormValues } from './types';

const { Text } = Typography;

interface OrderItemRowProps {
  name: number;
  form: FormInstance<OrderFormValues>;
  productList: IProduct[];
  services: IService[];
  presetsByProduct: Record<string, IPresetPhoto[]>;
  itemProductMap: Record<number, string>;
  itemVariantMap: Record<number, { id: string; name: string } | null>;
  itemPrintConfigMap: Record<number, IPrintConfig | undefined>;
  itemAddonsMap: Record<number, Record<string, boolean>>;
  itemPresetMap: Record<number, string>;
  setItemPresetMap: Dispatch<SetStateAction<Record<number, string>>>;
  applyProduct: (name: number, productId: string) => void;
  clearProduct: (name: number) => void;
  applyVariant: (name: number, variantId: string) => void;
  clearVariant: (name: number) => void;
  onAddonToggle: (name: number, serviceId: string, checked: boolean) => void;
  canRemove: boolean;
  onRemove: () => void;
}

/** A single product line inside the create-order Form.List. */
export function OrderItemRow({
  name,
  form,
  productList,
  services,
  presetsByProduct,
  itemProductMap,
  itemVariantMap,
  itemPrintConfigMap,
  itemAddonsMap,
  itemPresetMap,
  setItemPresetMap,
  applyProduct,
  clearProduct,
  applyVariant,
  clearVariant,
  onAddonToggle,
  canRemove,
  onRemove,
}: OrderItemRowProps) {
  const fromCatalog = !!itemProductMap[name];
  const catalogProduct = fromCatalog ? productList.find((p) => p.id === itemProductMap[name]) : null;

  const selectedVariant = itemVariantMap[name];
  const catalogVariants =
    fromCatalog && catalogProduct?.variants ? Object.entries(catalogProduct.variants) : null;

  return (
    <div className="rounded-lg border border-divider bg-elevated p-3">
      {/* Dropdown chọn từ catalog */}
      {productList.length > 0 && (
        <div className="mb-2">
          <Select
            placeholder="⚡ Chọn nhanh từ danh sách sản phẩm..."
            allowClear
            showSearch
            size="small"
            style={{ width: '100%' }}
            value={itemProductMap[name] ?? null}
            onChange={(productId) => (productId ? applyProduct(name, productId) : clearProduct(name))}
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {productList.map((p) => {
              const outOfStock = p.stock === 0;
              return (
                <Select.Option
                  key={p.id}
                  value={p.id}
                  disabled={outOfStock}
                  label={`${p.name} ${p.price.toLocaleString('vi-VN')}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <span style={{ fontSize: 18, lineHeight: 1 }}>📦</span>
                    )}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {p.canBeNfc ? '📡 ' : ''}
                      {p.name}
                      <span style={{ color: '#888', marginLeft: 6, fontSize: 12 }}>
                        {p.price.toLocaleString('vi-VN')}đ
                      </span>
                      {p.stock !== undefined && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: outOfStock ? '#f5222d' : p.stock <= 5 ? '#fa8c16' : '#52c41a' }}>
                          {outOfStock ? '· Hết hàng' : `· Còn ${p.stock}`}
                        </span>
                      )}
                    </span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </div>
      )}

      {/* Variant selector — hiện khi sản phẩm có biến thể */}
      {catalogVariants && catalogVariants.length > 0 && (
        <div className="mb-2">
          <Select
            placeholder="Chọn biến thể..."
            allowClear
            size="small"
            style={{ width: '100%' }}
            value={selectedVariant?.id ?? null}
            onChange={(variantId) => (variantId ? applyVariant(name, variantId) : clearVariant(name))}
          >
            {catalogVariants.map(([id, v]) => {
              const outOfStock = v.stock === 0;
              return (
                <Select.Option key={id} value={id} disabled={outOfStock}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {v.imageUrl ? (
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : catalogProduct?.imageUrl ? (
                      <img
                        src={catalogProduct.imageUrl}
                        alt={v.name}
                        style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover', flexShrink: 0, opacity: 0.4 }}
                      />
                    ) : null}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {v.isNfc ? '📡 ' : ''}
                      {v.name}
                      <span style={{ color: '#888', marginLeft: 6, fontSize: 12 }}>{v.price.toLocaleString('vi-VN')}đ</span>
                      {v.stock !== undefined && (
                        <span style={{ marginLeft: 4, fontSize: 11, color: outOfStock ? '#f5222d' : v.stock <= 5 ? '#fa8c16' : '#52c41a' }}>
                          {outOfStock ? '· Hết' : `· Còn ${v.stock}`}
                        </span>
                      )}
                    </span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </div>
      )}

      {/* Dịch vụ cộng thêm — hiện cho mọi sản phẩm khi catalog có dịch vụ */}
      {fromCatalog && services.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {services.map((service) => {
            const isSelected = !!itemAddonsMap[name]?.[service.id];
            return (
              <Tooltip key={service.id} title={`+${service.price.toLocaleString('vi-VN')}đ`}>
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-1.5 py-1">
                  {service.imageUrl && (
                    <img src={service.imageUrl} alt={service.name} className="h-6 w-6 rounded-full object-cover" />
                  )}
                  <Switch
                    size="small"
                    checked={isSelected}
                    onChange={(checked) => onAddonToggle(name, service.id, checked)}
                    checkedChildren={service.name}
                    unCheckedChildren={service.name}
                  />
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* Chọn ảnh mẫu — hiện khi sản phẩm có print + presets */}
      {fromCatalog && itemPrintConfigMap[name]?.enabled && itemProductMap[name] && (presetsByProduct[itemProductMap[name]]?.length ?? 0) > 0 && (
        <div className="mb-2">
          <Text type="secondary" className="mb-1.5 block text-[11px]">Ảnh in — chọn mẫu hoặc để khách tự upload:</Text>
          <div className="flex flex-wrap gap-1.5">
            {/* Option: khách tự upload */}
            <button
              type="button"
              onClick={() => setItemPresetMap((prev) => { const n = { ...prev }; delete n[name]; return n; })}
              className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-[10px] transition-colors ${
                !itemPresetMap[name]
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-content3 hover:border-primary/50'
              }`}
            >
              Tự<br />upload
            </button>

            {/* Preset thumbnails */}
            {presetsByProduct[itemProductMap[name]].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setItemPresetMap((prev) => ({ ...prev, [name]: preset.url }))}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors ${
                  itemPresetMap[name] === preset.url ? 'border-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                <img src={preset.url} alt="preset" className="h-full w-full object-cover" />
                {itemPresetMap[name] === preset.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                    <span className="text-white text-lg font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-2">
        {/* Thumbnail nếu có ảnh */}
        {catalogProduct?.imageUrl && (
          <div className="col-span-1 flex items-center">
            <img
              src={catalogProduct.imageUrl}
              alt={catalogProduct.name}
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Tên sản phẩm */}
        <Form.Item
          name={[name, 'productName']}
          rules={[{ required: true, message: 'Nhập tên' }]}
          className={`mb-0 ${catalogProduct?.imageUrl ? 'col-span-4' : 'col-span-5'}`}
        >
          <Input placeholder="Tên sản phẩm" size="small" />
        </Form.Item>

        {/* Số lượng */}
        <Form.Item name={[name, 'quantity']} className="col-span-2 mb-0">
          <InputNumber min={1} max={100} size="small" style={{ width: '100%' }} placeholder="SL" />
        </Form.Item>

        {/* Đơn giá */}
        <Form.Item name={[name, 'unitPrice']} className="col-span-3 mb-0">
          <InputNumber
            min={0}
            size="small"
            style={{ width: '100%' }}
            placeholder="Đơn giá"
            formatter={priceFormatter}
            parser={priceParser}
          />
        </Form.Item>

        {/* NFC tag + Xóa */}
        <div className="col-span-2 flex items-center justify-end gap-1">
          <Form.Item name={[name, 'isNfc']} valuePropName="checked" className="mb-0 hidden">
            <Checkbox />
          </Form.Item>

          {fromCatalog && selectedVariant && form.getFieldValue(['items', name, 'isNfc']) ? (
            /* Variant có NFC baked-in */
            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>📡 NFC</Tag>
          ) : !fromCatalog ? (
            /* Manual mode — chỉ đánh dấu, không tính giá */
            <Checkbox
              checked={!!form.getFieldValue(['items', name, 'isNfc'])}
              onChange={(e) => form.setFieldValue(['items', name, 'isNfc'], e.target.checked)}
            >
              <span className="text-xs">NFC</span>
            </Checkbox>
          ) : null}

          {canRemove && (
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
          )}
        </div>
      </div>

      {/* Template — chỉ hiện nếu isNfc */}
      <Form.Item noStyle shouldUpdate>
        {() => {
          const isNfc = form.getFieldValue(['items', name, 'isNfc']);
          if (!isNfc) return null;
          return (
            <Form.Item name={[name, 'templateId']} label="Template NFC (tuỳ chọn)" className="mb-0 mt-2">
              <Select size="small" placeholder="Chọn template" disabled={fromCatalog && !!catalogProduct?.templateId}>
                {TEMPLATE_LIST.map((tpl) => (
                  <Select.Option key={tpl.id} value={tpl.id}>
                    {tpl.icon} {tpl.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          );
        }}
      </Form.Item>
    </div>
  );
}
