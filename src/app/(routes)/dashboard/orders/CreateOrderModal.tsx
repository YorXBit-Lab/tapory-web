'use client';

import { useState } from 'react';
import {
  App, Button, Checkbox, Form, Input, InputNumber,
  Modal, Select, Switch, Tag, Tooltip, Typography,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { DEFAULT_NFC_EXTRA_PRICE, TEMPLATE_LIST } from '@/configs/constants';
import { SettingsAPI } from '@/services/SettingsAPI';
import { OrderAPI } from '@/services/OrderAPI';
import { useProducts } from '@/hooks/product';
import type { IOrderItem } from '@/services/OrderAPI';
import type { IProduct, IPrintConfig } from '@/configs/types';

const { Text } = Typography;

interface FormValues {
  customerName: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: IOrderItem[];
}

interface Props {
  onCreated: (orderId: string) => void;
}

function priceFormatter(v: number | string | undefined) {
  return `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function priceParser(v: string | undefined) {
  return Number((v ?? '').replace(/\./g, '')) as 0;
}

export function CreateOrderModal({ onCreated }: Props) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const items: IOrderItem[] = Form.useWatch('items', form) ?? [];

  const { data: products = [] } = useProducts();
  // Chỉ hiện sản phẩm đang bán trong dropdown tạo đơn
  const productList = (products as IProduct[]).filter(p => p.status === 'active' || p.status === undefined);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => SettingsAPI.get(),
    staleTime: 60_000,
    enabled: open,
  });
  const globalNfcPrice = settings?.nfcExtraPrice ?? DEFAULT_NFC_EXTRA_PRICE;

  // Derive khách cũ từ orders history — lookup khi nhập SĐT
  const { data: pastOrders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAPI.list(),
    staleTime: 60_000,
    enabled: open,
  });
  const customerByPhone = new Map(
    pastOrders
      .filter(o => o.phone)
      .map(o => [o.phone, { name: o.customerName, address: o.address ?? '' }]),
  );

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    if (!phone) return;
    const existing = customerByPhone.get(phone);
    if (!existing) return;
    const currentName = form.getFieldValue('customerName');
    if (!currentName) form.setFieldValue('customerName', existing.name);
    const currentAddr = form.getFieldValue('address');
    if (!currentAddr) form.setFieldValue('address', existing.address);
  };

  // Track item index → product ID (để biết item nào đã chọn từ catalog)
  const [itemProductMap, setItemProductMap] = useState<Record<number, string>>({});
  // Track item index → selected variant { id, name }
  const [itemVariantMap, setItemVariantMap] = useState<Record<number, { id: string; name: string } | null>>({});
  // Track item index → printConfig (từ catalog)
  const [itemPrintConfigMap, setItemPrintConfigMap] = useState<Record<number, IPrintConfig | undefined>>({});
  // Link upload ảnh in sau khi tạo đơn thành công
  const [printUploadLink, setPrintUploadLink] = useState<string | null>(null);

  const totalPrice = items.reduce((s, item) => {
    return s + Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0);
  }, 0);

  const hasNfc = items.some(i => i?.isNfc);

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();

      // Merge printConfig, productId và variantId từ catalog vào items
      const itemsWithPrint = values.items.map((item, idx) => ({
        ...item,
        ...(itemPrintConfigMap[idx]?.enabled ? { printConfig: itemPrintConfigMap[idx] } : {}),
        ...(itemProductMap[idx] ? { productId: itemProductMap[idx] } : {}),
        ...(itemVariantMap[idx] ? { variantId: itemVariantMap[idx]!.id, variantName: itemVariantMap[idx]!.name } : {}),
      }));

      const res = await fetch('/api/admin/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ ...values, items: itemsWithPrint }),
      });

      const json = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Tạo đơn thất bại');

      const hasPrintItems = itemsWithPrint.some(i => i.printConfig?.enabled);
      form.resetFields();
      setItemProductMap({});
      setItemVariantMap({});
      setItemPrintConfigMap({});
      setOpen(false);
      onCreated(json.orderId ?? '');

      if (hasPrintItems && json.orderId) {
        setPrintUploadLink(`${window.location.origin}/upload/${json.orderId}`);
      } else {
        notification.success({ message: 'Tạo đơn thành công', description: `Mã đơn: ${json.orderId}` });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err instanceof Error ? err.message : 'Không thể tạo đơn hàng',
      });
    } finally {
      setLoading(false);
    }
  };

  const initialItem: IOrderItem = { productName: '', quantity: 1, unitPrice: 0, isNfc: false };

  /* Chọn sản phẩm từ catalog → set từng field riêng (không set cả array) */
  const applyProduct = (fieldName: number, productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (!product) return;
    form.setFieldValue(['items', fieldName, 'productName'], product.name);
    form.setFieldValue(['items', fieldName, 'unitPrice'], product.price);
    form.setFieldValue(['items', fieldName, 'isNfc'], false);
    form.setFieldValue(['items', fieldName, 'templateId'], null);
    setItemProductMap(prev => ({ ...prev, [fieldName]: productId }));
    setItemVariantMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    setItemPrintConfigMap(prev => ({ ...prev, [fieldName]: product.printConfig }));
  };

  /* Chọn biến thể → cập nhật giá, isNfc, printConfig */
  const applyVariant = (fieldName: number, variantId: string) => {
    const productId = itemProductMap[fieldName];
    const product = productId ? productList.find(p => p.id === productId) : null;
    if (!product?.variants) return;
    const variant = product.variants[variantId];
    if (!variant) return;
    form.setFieldValue(['items', fieldName, 'unitPrice'], variant.price);
    form.setFieldValue(['items', fieldName, 'isNfc'], variant.isNfc ?? false);
    form.setFieldValue(['items', fieldName, 'templateId'], variant.isNfc ? (product.templateId ?? null) : null);
    setItemVariantMap(prev => ({ ...prev, [fieldName]: { id: variantId, name: variant.name } }));
    setItemPrintConfigMap(prev => ({ ...prev, [fieldName]: variant.printConfig }));
  };

  /* Xóa chọn biến thể → về base price của sản phẩm */
  const clearVariant = (fieldName: number) => {
    const productId = itemProductMap[fieldName];
    const product = productId ? productList.find(p => p.id === productId) : null;
    setItemVariantMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    if (product) {
      form.setFieldValue(['items', fieldName, 'unitPrice'], product.price);
      form.setFieldValue(['items', fieldName, 'isNfc'], false);
      form.setFieldValue(['items', fieldName, 'templateId'], null);
      setItemPrintConfigMap(prev => ({ ...prev, [fieldName]: product.printConfig }));
    }
  };

  /* Khi staff bật/tắt NFC → điều chỉnh giá và template */
  const handleNfcToggle = (fieldName: number, checked: boolean) => {
    form.setFieldValue(['items', fieldName, 'isNfc'], checked);
    const productId = itemProductMap[fieldName];
    const product = productId ? productList.find(p => p.id === productId) : null;
    const nfcExtra = product?.nfcExtraPrice || globalNfcPrice;
    const basePrice = product?.price ?? (form.getFieldValue(['items', fieldName, 'unitPrice']) as number) ?? 0;

    if (checked) {
      form.setFieldValue(['items', fieldName, 'unitPrice'], basePrice + nfcExtra);
      if (product?.templateId) {
        form.setFieldValue(['items', fieldName, 'templateId'], product.templateId);
      }
    } else {
      form.setFieldValue(['items', fieldName, 'unitPrice'], basePrice - nfcExtra);
      form.setFieldValue(['items', fieldName, 'templateId'], null);
    }
  };

  /* Xóa chọn catalog → về manual mode */
  const clearProduct = (fieldName: number) => {
    form.setFieldValue(['items', fieldName, 'productName'], '');
    form.setFieldValue(['items', fieldName, 'unitPrice'], 0);
    form.setFieldValue(['items', fieldName, 'isNfc'], false);
    form.setFieldValue(['items', fieldName, 'templateId'], null);
    setItemProductMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    setItemVariantMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    setItemPrintConfigMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
  };

  const handleClose = () => { setOpen(false); form.resetFields(); setItemProductMap({}); setItemVariantMap({}); setItemPrintConfigMap({}); };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Tạo đơn hàng
      </Button>

      {/* Modal link upload ảnh in */}
      <Modal
        title="Đơn hàng đã được tạo"
        open={!!printUploadLink}
        onCancel={() => setPrintUploadLink(null)}
        footer={<Button type="primary" onClick={() => setPrintUploadLink(null)}>Đóng</Button>}
        width={480}
      >
        <div className="space-y-3 py-2">
          <Text>Đơn có sản phẩm cần in ảnh. Gửi link sau cho khách hàng để họ upload ảnh:</Text>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-3">
            <Text className="flex-1 break-all font-mono text-xs text-blue-700">{printUploadLink}</Text>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                if (printUploadLink) {
                  navigator.clipboard.writeText(printUploadLink);
                  notification.success({ message: 'Đã copy link', duration: 2 });
                }
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Tạo đơn hàng mới"
        open={open}
        onCancel={handleClose}
        footer={null}
        destroyOnHidden
        width={680}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ items: [initialItem] }}
          onFinish={handleSubmit}
          className="pt-2"
        >
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: hasNfc, message: 'Cần SĐT cho đơn có NFC' },
                { pattern: /^(0|\+84|84)\d{9}$/, message: 'SĐT không hợp lệ', warningOnly: !hasNfc },
              ]}
              extra={hasNfc ? 'Dùng làm PIN xác thực NFC card' : undefined}
            >
              <Input placeholder="0912345678" onBlur={handlePhoneBlur} />
            </Form.Item>

            <Form.Item
              label="Tên khách hàng"
              name="customerName"
              rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item label="Địa chỉ giao hàng" name="address" className="col-span-2">
              <Input placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
            </Form.Item>
          </div>

          {/* Danh sách sản phẩm */}
          <Text strong className="mb-2 block text-sm">Sản phẩm</Text>

          <Form.List
            name="items"
            rules={[{ validator: async (_, list) => { if (!list?.length) return Promise.reject('Cần ít nhất 1 sản phẩm'); } }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className="space-y-2">
                {fields.map(({ key, name }) => {
                  const fromCatalog = !!itemProductMap[name];
                  const catalogProduct = fromCatalog ? productList.find(p => p.id === itemProductMap[name]) : null;

                  const selectedVariant = itemVariantMap[name];
                  const catalogVariants = fromCatalog && catalogProduct?.variants
                    ? Object.entries(catalogProduct.variants)
                    : null;

                  return (
                    <div key={key} className="rounded-lg border border-divider bg-gray-50 p-3">

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
                            onChange={(productId) => productId ? applyProduct(name, productId) : clearProduct(name)}
                            filterOption={(input, option) =>
                              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {productList.map(p => {
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
                                      {p.canBeNfc ? '📡 ' : ''}{p.name}
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
                            onChange={(variantId) => variantId ? applyVariant(name, variantId) : clearVariant(name)}
                          >
                            {catalogVariants.map(([id, v]) => {
                              const outOfStock = v.stock === 0;
                              return (
                                <Select.Option key={id} value={id} disabled={outOfStock}>
                                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {v.isNfc ? '📡 ' : ''}{v.name}
                                    <span style={{ color: '#888', fontSize: 12 }}>{v.price.toLocaleString('vi-VN')}đ</span>
                                    {v.stock !== undefined && (
                                      <span style={{ fontSize: 11, color: outOfStock ? '#f5222d' : v.stock <= 5 ? '#fa8c16' : '#52c41a' }}>
                                        {outOfStock ? '· Hết' : `· Còn ${v.stock}`}
                                      </span>
                                    )}
                                  </span>
                                </Select.Option>
                              );
                            })}
                          </Select>
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

                        {/* NFC toggle + Xóa */}
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          {/* Hidden field để giữ giá trị isNfc trong form */}
                          <Form.Item name={[name, 'isNfc']} valuePropName="checked" className="mb-0 hidden">
                            <Checkbox />
                          </Form.Item>

                          {fromCatalog && selectedVariant ? (
                            /* Biến thể đã chọn — NFC cố định theo variant */
                            form.getFieldValue(['items', name, 'isNfc'])
                              ? <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>📡 NFC</Tag>
                              : null
                          ) : fromCatalog ? (
                            catalogProduct?.canBeNfc ? (
                              /* Sản phẩm có thể NFC → cho chọn */
                              <Form.Item noStyle shouldUpdate>
                                {() => {
                                  const extra = catalogProduct.nfcExtraPrice || globalNfcPrice;
                                  const isOn = !!form.getFieldValue(['items', name, 'isNfc']);
                                  return (
                                    <Tooltip title={isOn ? `Đã cộng +${extra.toLocaleString('vi-VN')}đ` : `+${extra.toLocaleString('vi-VN')}đ khi bật`}>
                                      <Switch
                                        size="small"
                                        checked={isOn}
                                        onChange={(checked) => handleNfcToggle(name, checked)}
                                        checkedChildren="📡 NFC"
                                        unCheckedChildren="NFC"
                                      />
                                    </Tooltip>
                                  );
                                }}
                              </Form.Item>
                            ) : null
                          ) : (
                            /* Manual mode → checkbox như cũ */
                            <Checkbox
                              checked={!!form.getFieldValue(['items', name, 'isNfc'])}
                              onChange={(e) => handleNfcToggle(name, e.target.checked)}
                            >
                              <span className="text-xs">NFC</span>
                            </Checkbox>
                          )}

                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                remove(name);
                                setItemProductMap(prev => { const n = { ...prev }; delete n[name]; return n; });
                                setItemVariantMap(prev => { const n = { ...prev }; delete n[name]; return n; });
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Template — chỉ hiện nếu isNfc */}
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const isNfc = form.getFieldValue(['items', name, 'isNfc']);
                          if (!isNfc) return null;
                          return (
                            <Form.Item
                              name={[name, 'templateId']}
                              label="Template NFC (tuỳ chọn)"
                              className="mb-0 mt-2"
                            >
                              <Select
                                size="small"
                                placeholder="Chọn template"
                                disabled={fromCatalog && !!catalogProduct?.templateId}
                              >
                                {TEMPLATE_LIST.map(tpl => (
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
                })}

                <Form.ErrorList errors={errors} />

                <Button type="dashed" onClick={() => add(initialItem)} icon={<PlusOutlined />} block size="small">
                  Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>

          {/* Tổng */}
          <div className="mt-3 flex justify-end">
            <Text type="secondary" className="text-sm">
              Tổng: <Text strong>{totalPrice.toLocaleString('vi-VN')}đ</Text>
            </Text>
          </div>

          <Form.Item label="Ghi chú" name="notes" className="mt-3 mb-0">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Tạo đơn</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
