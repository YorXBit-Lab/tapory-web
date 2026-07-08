'use client';

import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Switch, Table, Tag, Typography, notification } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useShippingRates, useCreateShipping, useUpdateShipping, useDeleteShipping } from '@/hooks/shippingRate';
import type { IShippingRate } from '@/configs/types';

const { Text } = Typography;

interface ShippingFormValues {
  name: string;
  price: number;
  estimatedDays?: string;
  isDefault?: boolean;
}

export function ShippingRatesCard() {
  const { data: rawRates = [] } = useShippingRates();
  const rates = rawRates as IShippingRate[];
  const { mutateAsync: createRate } = useCreateShipping();
  const { mutateAsync: updateRate } = useUpdateShipping();
  const { mutateAsync: deleteRate } = useDeleteShipping();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShippingRate | null>(null);
  const [form] = Form.useForm<ShippingFormValues>();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: ShippingFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await updateRate({ id: editing.id, data: values });
        notification.success({ message: 'Đã cập nhật mức phí' });
      } else {
        await createRate(values);
        notification.success({ message: 'Đã thêm mức phí' });
      }
      setFormOpen(false);
      setEditing(null);
      form.resetFields();
    } catch {
      notification.error({ message: 'Lưu thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (rate: IShippingRate) => {
    setEditing(rate);
    setFormOpen(true);
    setTimeout(() => form.setFieldsValue({
      name: rate.name,
      price: rate.price,
      estimatedDays: rate.estimatedDays,
      isDefault: rate.isDefault ?? false,
    }), 0);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFormOpen(true);
  };

  return (
    <Card title="Phí vận chuyển" className="col-span-2">
      {rates.length > 0 && (
        <Table
          dataSource={rates}
          rowKey="id"
          size="small"
          pagination={false}
          className="mb-3"
          columns={[
            {
              title: 'Khu vực',
              render: (_: unknown, r: IShippingRate) => (
                <div>
                  <Text strong className="text-sm">{r.name}</Text>
                  {r.isDefault && <Tag color="blue" className="ml-2 text-xs">Mặc định</Tag>}
                  {r.estimatedDays && <Text type="secondary" className="ml-1 text-xs">· {r.estimatedDays}</Text>}
                </div>
              ),
            },
            {
              title: 'Phí',
              dataIndex: 'price',
              width: 120,
              render: (p: number) => (
                <Text strong>{p === 0 ? 'Miễn phí' : `${p.toLocaleString('vi-VN')}đ`}</Text>
              ),
            },
            {
              title: '',
              width: 70,
              render: (_: unknown, r: IShippingRate) => (
                <span className="flex gap-2 text-xs">
                  <button className="text-primary hover:underline" onClick={() => openEdit(r)}>
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="Xóa mức phí này?"
                    onConfirm={() => deleteRate(r.id)}
                    okText="Xóa" cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <button className="text-red-500 hover:underline"><DeleteOutlined /></button>
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      )}
      <Button type="dashed" block icon={<PlusOutlined />} onClick={openCreate}>
        Thêm mức phí
      </Button>

      <Modal
        title={editing ? 'Sửa mức phí' : 'Thêm mức phí vận chuyển'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditing(null); form.resetFields(); }}
        footer={null}
        destroyOnHidden
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ price: 0, isDefault: false }}
          onFinish={handleSave}
          className="pt-2"
        >
          <Form.Item label="Tên khu vực" name="name" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Nội thành HCM, Tỉnh thành khác..." autoFocus />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item label="Phí vận chuyển (đ)" name="price" rules={[{ required: true }]}>
              <InputNumber
                min={0}
                step={5000}
                style={{ width: '100%' }}
                formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
                placeholder="0 = miễn phí"
              />
            </Form.Item>

            <Form.Item label="Thời gian giao" name="estimatedDays">
              <Input placeholder="VD: 1-2 ngày" />
            </Form.Item>
          </div>

          <Form.Item name="isDefault" valuePropName="checked" label="Mặc định khi tạo đơn">
            <Switch />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={() => { setFormOpen(false); setEditing(null); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
