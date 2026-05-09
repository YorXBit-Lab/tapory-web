'use client';

import { useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { TEMPLATE_LIST } from '@/configs/constants';

interface FormValues {
  customerName: string;
  phone: string;
  templateId: string;
  address: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Props {
  onCreated: (orderId: string) => void;
}

export function CreateOrderModal({ onCreated }: Props) {
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
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
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ templateId: 'birthday', price: 189000, quantity: 1 }}
          onFinish={handleSubmit}
          className="pt-2"
        >
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Nhập số điện thoại' },
              { pattern: /^(0|\+84|84)\d{9}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
            extra="Đây là mã PIN để khách chỉnh sửa NFC card"
          >
            <Input placeholder="0912345678" />
          </Form.Item>

          <Form.Item label="Loại template" name="templateId">
            <Select>
              {TEMPLATE_LIST.map(tpl => (
                <Select.Option key={tpl.id} value={tpl.id}>
                  {tpl.icon} {tpl.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Số lượng móc khóa NFC" name="quantity">
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Địa chỉ giao hàng" name="address">
            <Input placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
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

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={() => { setOpen(false); form.resetFields(); }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo đơn
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
