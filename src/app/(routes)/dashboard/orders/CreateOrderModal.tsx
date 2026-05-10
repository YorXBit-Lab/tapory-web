'use client';

import { useState } from 'react';
import {
  Button, Checkbox, Form, Input, InputNumber,
  Modal, Select, Space, Typography, notification,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { TEMPLATE_LIST } from '@/configs/constants';
import type { IOrderItem } from '@/services/OrderAPI';

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const items: IOrderItem[] = Form.useWatch('items', form) ?? [];

  const totalPrice = items.reduce((s, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unitPrice ?? 0);
    return s + qty * price;
  }, 0);

  const hasNfc = items.some(i => i?.isNfc);

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Tạo đơn thất bại');

      notification.success({
        message: 'Tạo đơn thành công',
        description: `Mã đơn: ${json.orderId}`,
      });
      form.resetFields();
      setOpen(false);
      onCreated(json.orderId ?? '');
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

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Tạo đơn hàng
      </Button>

      <Modal
        title="Tạo đơn hàng mới"
        open={open}
        onCancel={() => { setOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
        width={640}
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
              label="Tên khách hàng"
              name="customerName"
              rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
              className="col-span-2"
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: hasNfc, message: 'Cần SĐT cho đơn có NFC' },
                { pattern: /^(0|\+84|84)\d{9}$/, message: 'SĐT không hợp lệ', warningOnly: !hasNfc },
              ]}
              extra={hasNfc ? 'Dùng làm PIN xác thực NFC card' : undefined}
            >
              <Input placeholder="0912345678" />
            </Form.Item>

            <Form.Item label="Địa chỉ giao hàng" name="address">
              <Input placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
            </Form.Item>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="mb-2 flex items-center justify-between">
            <Text strong className="text-sm">Sản phẩm</Text>
          </div>

          <Form.List
            name="items"
            rules={[{
              validator: async (_, list) => {
                if (!list || list.length === 0) return Promise.reject('Cần ít nhất 1 sản phẩm');
              },
            }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className="space-y-2">
                {fields.map(({ key, name }) => (
                  <div key={key} className="rounded-lg border border-divider bg-gray-50 p-3">
                    <div className="grid grid-cols-12 gap-2">
                      {/* Tên sản phẩm */}
                      <Form.Item
                        name={[name, 'productName']}
                        rules={[{ required: true, message: 'Nhập tên' }]}
                        className="col-span-5 mb-0"
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

                      {/* Xóa */}
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <Form.Item name={[name, 'isNfc']} valuePropName="checked" className="mb-0">
                          <Checkbox>NFC</Checkbox>
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Template — chỉ hiện nếu isNfc */}
                    <Form.Item noStyle shouldUpdate>
                      {() => {
                        const isNfc = form.getFieldValue(['items', name, 'isNfc']);
                        return isNfc ? (
                          <Form.Item
                            name={[name, 'templateId']}
                            label="Template NFC"
                            rules={[{ required: true, message: 'Chọn template' }]}
                            className="mb-0 mt-2"
                          >
                            <Select size="small" placeholder="Chọn template">
                              {TEMPLATE_LIST.map(tpl => (
                                <Select.Option key={tpl.id} value={tpl.id}>
                                  {tpl.icon} {tpl.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ) : null;
                      }}
                    </Form.Item>
                  </div>
                ))}

                <Form.ErrorList errors={errors} />

                <Button
                  type="dashed"
                  onClick={() => add(initialItem)}
                  icon={<PlusOutlined />}
                  block
                  size="small"
                >
                  Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>

          {/* Tổng */}
          <div className="mt-3 flex justify-end">
            <Text type="secondary" className="text-sm">
              Tổng:{' '}
              <Text strong>{totalPrice.toLocaleString('vi-VN')}đ</Text>
            </Text>
          </div>

          <Form.Item label="Ghi chú" name="notes" className="mt-3 mb-0">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => { setOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Tạo đơn</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
