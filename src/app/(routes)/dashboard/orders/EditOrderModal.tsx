'use client';

import { useEffect, useState } from 'react';
import { App, AutoComplete, Button, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { OrderAPI, type IOrder, type IOrderItem } from '@/services/OrderAPI';
import { STATUS_TAG } from '@/components/dashboard';
import { useProducts } from '@/hooks/product';
import type { IProduct } from '@/configs/types';

interface FormValues {
  customerName: string;
  phone: string;
  address: string;
  price: number;
  notes?: string;
  status: IOrder['status'];
  items: IOrderItem[];
}

interface Props {
  order: IOrder;
  onUpdated: () => void;
  asButton?: boolean;
}

function priceFormatter(v: number | string | undefined) {
  return `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function priceParser(v: string | undefined) {
  return Number((v ?? '').replace(/\./g, '')) as 0;
}

export function EditOrderModal({ order, onUpdated, asButton = false }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const { notification } = App.useApp();
  const { data: products = [] } = useProducts();
  const watchedItems: IOrderItem[] = Form.useWatch('items', form) ?? [];

  // auto-recalc price khi items thay đổi
  useEffect(() => {
    if (!watchedItems.length) return;
    const total = watchedItems.reduce(
      (sum, item) => sum + (item?.unitPrice ?? 0) * (item?.quantity ?? 0),
      0,
    );
    form.setFieldValue('price', total);
  }, [watchedItems, form]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        customerName: order.customerName,
        phone:        order.phone ?? '',
        address:      order.address ?? '',
        price:        order.price,
        notes:        order.notes ?? '',
        status:       order.status,
        items:        order.items,
      });
    }
  }, [open, order, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await OrderAPI.update(order.id, {
        customerName: values.customerName,
        phone:        values.phone,
        address:      values.address,
        price:        values.price,
        notes:        values.notes,
        status:       values.status,
        items:        values.items,
      });
      notification.success({ message: 'Đã cập nhật đơn hàng' });
      setOpen(false);
      onUpdated();
    } catch {
      notification.error({ message: 'Cập nhật thất bại' });
    } finally {
      setLoading(false);
    }
  };

  const productOptions = (products as IProduct[]).map(p => ({ value: p.name, label: p.name }));

  const trigger = asButton ? (
    <Button icon={<EditOutlined />} size="small" onClick={() => setOpen(true)}>Sửa</Button>
  ) : (
    <button
      className="text-xs text-primary hover:underline"
      onClick={e => { e.stopPropagation(); setOpen(true); }}
    >
      Sửa
    </button>
  );

  return (
    <>
      {trigger}
      <Modal
        title={`Sửa đơn hàng ${order.id}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">

          {/* ── Thông tin khách hàng ── */}
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item
              label="Tên khách hàng"
              name="customerName"
              className="col-span-2"
              rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ pattern: /^(0|\+84|84)\d{9}$/, message: 'SĐT không hợp lệ', warningOnly: true }]}
            >
              <Input placeholder="0912345678" />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status">
              <Select>
                {Object.entries(STATUS_TAG).map(([value, { label }]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Địa chỉ giao hàng" name="address">
            <Input placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
          </Form.Item>

          {/* ── Sản phẩm ── */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Sản phẩm
          </p>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="mb-4 space-y-2">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-center gap-2">
                    {/* Tên */}
                    <Form.Item
                      {...restField}
                      name={[name, 'productName']}
                      className="mb-0 min-w-0 flex-1"
                      rules={[{ required: true, message: '' }]}
                    >
                      <AutoComplete
                        options={productOptions}
                        filterOption={(input, opt) =>
                          (opt?.value ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        placeholder="Tên sản phẩm"
                        onSelect={(val) => {
                          const p = (products as IProduct[]).find(p => p.name === val);
                          if (p) {
                            form.setFieldValue(['items', name, 'unitPrice'], p.price);
                            form.setFieldValue(['items', name, 'isNfc'], p.isNfc);
                          }
                        }}
                      />
                    </Form.Item>

                    {/* Số lượng */}
                    <Form.Item {...restField} name={[name, 'quantity']} className="mb-0 w-16">
                      <InputNumber min={1} placeholder="SL" style={{ width: '100%' }} />
                    </Form.Item>

                    {/* Đơn giá */}
                    <Form.Item {...restField} name={[name, 'unitPrice']} className="mb-0 w-32">
                      <InputNumber
                        min={0}
                        step={1000}
                        formatter={priceFormatter}
                        parser={priceParser}
                        placeholder="Đơn giá"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    {/* NFC toggle */}
                    <Form.Item
                      {...restField}
                      name={[name, 'isNfc']}
                      valuePropName="checked"
                      className="mb-0 shrink-0"
                    >
                      <Switch size="small" checkedChildren="NFC" unCheckedChildren="—" />
                    </Form.Item>

                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      className="shrink-0"
                    />
                  </div>
                ))}

                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add({ productName: '', quantity: 1, unitPrice: 0, isNfc: false })}
                >
                  Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>

          {/* ── Tổng giá trị ── */}
          <Form.Item label="Tổng giá trị (VNĐ)" name="price">
            <InputNumber
              min={0}
              step={10000}
              formatter={priceFormatter}
              parser={priceParser}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
