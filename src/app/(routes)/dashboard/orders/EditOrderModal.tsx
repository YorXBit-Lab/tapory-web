'use client';

import { useEffect, useState } from 'react';
import { App, Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { STATUS_TAG } from '@/components/dashboard';

interface FormValues {
  customerName: string;
  phone: string;
  address: string;
  price: number;
  notes?: string;
  status: IOrder['status'];
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

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        customerName: order.customerName,
        phone:        order.phone ?? '',
        address:      order.address ?? '',
        price:        order.price,
        notes:        order.notes ?? '',
        status:       order.status,
      });
    }
  }, [open, order, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await OrderAPI.update(order.id, values);
      notification.success({ message: 'Đã cập nhật đơn hàng' });
      setOpen(false);
      onUpdated();
    } catch {
      notification.error({ message: 'Cập nhật thất bại' });
    } finally {
      setLoading(false);
    }
  };

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
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
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

          <Form.Item label="Giá trị đơn (VNĐ)" name="price">
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
