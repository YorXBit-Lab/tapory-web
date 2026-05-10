'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, notification } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { OrderAPI, type IOrder } from '@/services/OrderAPI';
import { STATUS_TAG } from '@/components/dashboard';

interface FormValues {
  customerName: string;
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

export function EditOrderModal({ order, onUpdated, asButton = false }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        customerName: order.customerName,
        address: order.address,
        price: order.price,
        notes: order.notes ?? '',
        status: order.status,
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

  return (
    <>
      {asButton ? (
        <Button icon={<EditOutlined />} size="small" onClick={() => setOpen(true)}>Sửa</Button>
      ) : (
        <button
          className="text-primary hover:underline text-xs"
          onClick={e => { e.stopPropagation(); setOpen(true); }}
        >
          Sửa
        </button>
      )}

      <Modal
        title={`Sửa đơn hàng ${order.id}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        width={440}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Địa chỉ giao hàng" name="address">
            <Input />
          </Form.Item>

          <Form.Item label="Giá trị đơn (VNĐ)" name="price">
            <InputNumber
              min={0}
              step={10000}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={v => Number((v ?? '').replace(/\./g, '')) as 0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              {Object.entries(STATUS_TAG).map(([value, { label }]) => (
                <Select.Option key={value} value={value}>{label}</Select.Option>
              ))}
            </Select>
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
