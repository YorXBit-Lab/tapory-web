'use client';

import { useState } from 'react';
import { App, Button, Form, Input, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { OrderAPI } from '@/services/OrderAPI';
import { useProducts } from '@/hooks/product';
import { useServices } from '@/hooks/service';
import { useAllPresetPhotos } from '@/hooks/presetPhoto';
import { useShippingRates } from '@/hooks/shippingRate';
import type { IOrderItem } from '@/services/OrderAPI';
import type { IProduct, IService, IPresetPhoto, IShippingRate, IPrintConfig } from '@/configs/types';
import { OrderItemRow } from './create-order/OrderItemRow';
import { ShippingRatePicker } from './create-order/ShippingRatePicker';
import { OrderTotals } from './create-order/OrderTotals';
import { PrintUploadLinkModal } from './create-order/PrintUploadLinkModal';
import type { OrderFormValues } from './create-order/types';

const { Text } = Typography;

interface Props {
  onCreated: (orderId: string) => void;
}

export function CreateOrderModal({ onCreated }: Props) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<OrderFormValues>();
  const items: IOrderItem[] = Form.useWatch('items', form) ?? [];

  const { data: products = [] } = useProducts();
  const productList = (products as IProduct[]).filter(p => p.status === 'active' || p.status === undefined);

  const { data: rawServices = [] } = useServices();
  const services = rawServices as IService[];

  const { data: rawShipping = [] } = useShippingRates();
  const shippingRates = rawShipping as IShippingRate[];
  const [selectedShipping, setSelectedShipping] = useState<IShippingRate | null>(null);

  const { data: rawPresets = [] } = useAllPresetPhotos(open);
  const allPresets = rawPresets as IPresetPhoto[];
  const presetsByProduct = allPresets.reduce<Record<string, IPresetPhoto[]>>((acc, p) => {
    if (!acc[p.productId]) acc[p.productId] = [];
    acc[p.productId].push(p);
    return acc;
  }, {});

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

  const [itemProductMap, setItemProductMap] = useState<Record<number, string>>({});
  const [itemVariantMap, setItemVariantMap] = useState<Record<number, { id: string; name: string } | null>>({});
  const [itemPrintConfigMap, setItemPrintConfigMap] = useState<Record<number, IPrintConfig | undefined>>({});
  const [itemAddonsMap, setItemAddonsMap] = useState<Record<number, Record<string, boolean>>>({});
  // presetPhotoUrl đã chọn per item (undefined = khách tự upload)
  const [itemPresetMap, setItemPresetMap] = useState<Record<number, string>>({});
  // Link upload ảnh in sau khi tạo đơn thành công
  const [printUploadLink, setPrintUploadLink] = useState<string | null>(null);

  const totalPrice = items.reduce((s, item) => {
    return s + Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0);
  }, 0);

  const hasNfc = items.some(i => i?.isNfc);

  const handleSubmit = async (values: OrderFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();

      const itemsWithPrint = values.items.map((item, idx) => {
        const selectedAddonNames = services
          .filter(s => itemAddonsMap[idx]?.[s.id])
          .map(s => s.name);
        const product = itemProductMap[idx] ? productList.find(p => p.id === itemProductMap[idx]) : null;
        const variantInfo = itemVariantMap[idx];
        const variant = variantInfo && product?.variants?.[variantInfo.id];
        return {
          ...item,
          ...(itemPrintConfigMap[idx]?.enabled ? { printConfig: itemPrintConfigMap[idx] } : {}),
          ...(itemProductMap[idx] ? { productId: itemProductMap[idx] } : {}),
          ...(variantInfo ? { variantId: variantInfo.id, variantName: variantInfo.name } : {}),
          ...(selectedAddonNames.length > 0 ? { addonNames: selectedAddonNames } : {}),
          ...(itemPresetMap[idx] ? { presetPhotoUrl: itemPresetMap[idx] } : {}),
          ...(variant
            ? {
                variantSnapshot: {
                  variantId: variantInfo!.id,
                  name: variant.name,
                  unitPrice: item.unitPrice,
                  ...(variant.sku ? { sku: variant.sku } : {}),
                  ...(variant.optionValues?.length ? { optionValues: variant.optionValues } : {}),
                  ...(variant.isNfc ? { isNfc: true } : {}),
                  ...(variant.printConfig?.enabled ? { printConfig: variant.printConfig } : {}),
                },
              }
            : {}),
        };
      });

      const res = await fetch('/api/admin/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          ...values,
          items: itemsWithPrint,
          ...(selectedShipping ? { shippingFee: selectedShipping.price, shippingRateName: selectedShipping.name } : {}),
        }),
      });

      const json = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Tạo đơn thất bại');

      const hasPrintItems = itemsWithPrint.some(i => i.printConfig?.enabled);
      const allPrintHavePreset = itemsWithPrint
        .filter(i => i.printConfig?.enabled)
        .every(i => i.presetPhotoUrl);
      form.resetFields();
      setItemProductMap({});
      setItemVariantMap({});
      setItemPrintConfigMap({});
      setOpen(false);
      onCreated(json.orderId ?? '');

      if (hasPrintItems && !allPrintHavePreset && json.orderId) {
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

  /* Tính lại giá = base + tất cả services đang bật */
  const recalcPrice = (fieldName: number, basePrice: number, addonsMap: Record<string, boolean>) => {
    const serviceTotal = services
      .filter(s => addonsMap[s.id])
      .reduce((sum, s) => sum + s.price, 0);
    form.setFieldValue(['items', fieldName, 'unitPrice'], basePrice + serviceTotal);
  };

  /* Toggle một dịch vụ cho item */
  const handleAddonToggle = (fieldName: number, serviceId: string, checked: boolean) => {
    const newMap = { ...(itemAddonsMap[fieldName] ?? {}), [serviceId]: checked };
    setItemAddonsMap(prev => ({ ...prev, [fieldName]: newMap }));

    const product = productList.find(p => p.id === itemProductMap[fieldName]);
    const variantId = itemVariantMap[fieldName]?.id;
    const basePrice = variantId && product?.variants?.[variantId]
      ? product.variants[variantId].price
      : (product?.price ?? 0);

    recalcPrice(fieldName, basePrice, newMap);

    const selectedVariantId = itemVariantMap[fieldName]?.id;
    const selectedVariant = selectedVariantId ? product?.variants?.[selectedVariantId] : null;
    const isNfc = selectedVariant?.isNfc ?? form.getFieldValue(['items', fieldName, 'isNfc']) ?? false;
    form.setFieldValue(['items', fieldName, 'isNfc'], isNfc);
    form.setFieldValue(['items', fieldName, 'templateId'], isNfc ? (product?.templateId ?? null) : null);
  };

  /* Chọn sản phẩm từ catalog */
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
    setItemAddonsMap(prev => ({ ...prev, [fieldName]: {} }));
    setItemPresetMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
  };

  /* Chọn biến thể → cập nhật giá, isNfc, printConfig */
  const applyVariant = (fieldName: number, variantId: string) => {
    const productId = itemProductMap[fieldName];
    const product = productId ? productList.find(p => p.id === productId) : null;
    if (!product?.variants) return;
    const variant = product.variants[variantId];
    if (!variant) return;
    const currentAddons = itemAddonsMap[fieldName] ?? {};
    const addonTotal = services.filter(s => currentAddons[s.id]).reduce((sum, s) => sum + s.price, 0);
    form.setFieldValue(['items', fieldName, 'unitPrice'], variant.price + addonTotal);
    form.setFieldValue(['items', fieldName, 'isNfc'], variant.isNfc ?? false);
    form.setFieldValue(['items', fieldName, 'templateId'], variant.isNfc ? (product.templateId ?? null) : null);
    setItemVariantMap(prev => ({ ...prev, [fieldName]: { id: variantId, name: variant.name } }));
    setItemPrintConfigMap(prev => ({ ...prev, [fieldName]: variant.printConfig }));
  };

  /* Xóa chọn biến thể → về base price + addons */
  const clearVariant = (fieldName: number) => {
    const productId = itemProductMap[fieldName];
    const product = productId ? productList.find(p => p.id === productId) : null;
    setItemVariantMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    if (product) {
      const currentAddons = itemAddonsMap[fieldName] ?? {};
      recalcPrice(fieldName, product.price, currentAddons);
      form.setFieldValue(['items', fieldName, 'isNfc'], false);
      form.setFieldValue(['items', fieldName, 'templateId'], null);
      setItemPrintConfigMap(prev => ({ ...prev, [fieldName]: product.printConfig }));
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
    setItemAddonsMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    setItemPresetMap(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    setItemProductMap({});
    setItemVariantMap({});
    setItemPrintConfigMap({});
    setItemAddonsMap({});
    setItemPresetMap({});
    setSelectedShipping(null);
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Tạo đơn hàng
      </Button>

      {/* Modal link upload ảnh in */}
      <PrintUploadLinkModal link={printUploadLink} onClose={() => setPrintUploadLink(null)} />

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
                {fields.map(({ key, name }) => (
                  <OrderItemRow
                    key={key}
                    name={name}
                    form={form}
                    productList={productList}
                    services={services}
                    presetsByProduct={presetsByProduct}
                    itemProductMap={itemProductMap}
                    itemVariantMap={itemVariantMap}
                    itemPrintConfigMap={itemPrintConfigMap}
                    itemAddonsMap={itemAddonsMap}
                    itemPresetMap={itemPresetMap}
                    setItemPresetMap={setItemPresetMap}
                    applyProduct={applyProduct}
                    clearProduct={clearProduct}
                    applyVariant={applyVariant}
                    clearVariant={clearVariant}
                    onAddonToggle={handleAddonToggle}
                    canRemove={fields.length > 1}
                    onRemove={() => {
                      remove(name);
                      setItemProductMap((prev) => { const n = { ...prev }; delete n[name]; return n; });
                      setItemVariantMap((prev) => { const n = { ...prev }; delete n[name]; return n; });
                      setItemAddonsMap((prev) => { const n = { ...prev }; delete n[name]; return n; });
                    }}
                  />
                ))}

                <Form.ErrorList errors={errors} />

                <Button type="dashed" onClick={() => add(initialItem)} icon={<PlusOutlined />} block size="small">
                  Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>

          {/* Phí vận chuyển */}
          <ShippingRatePicker
            shippingRates={shippingRates}
            selectedShipping={selectedShipping}
            setSelectedShipping={setSelectedShipping}
          />

          {/* Tổng */}
          <OrderTotals totalPrice={totalPrice} selectedShipping={selectedShipping} />

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
