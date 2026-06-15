'use client';

import { useState } from 'react';
import { App, Button, Form, Input, Modal, Typography } from 'antd';
import { useCreateComponent } from '@/hooks/component';

const { Text } = Typography;

interface QuickComponentForm {
  name: string;
  unit?: string;
}

export function QuickCreateComponentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}) {
  const { notification } = App.useApp();
  const { mutateAsync: createComponent } = useCreateComponent();
  const [form] = Form.useForm<QuickComponentForm>();
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: QuickComponentForm) => {
    setSaving(true);
    try {
      const result = (await createComponent({
        name: values.name.trim(),
        stock: 0,
        ...(values.unit ? { unit: values.unit.trim() } : {}),
      })) as { data: { id: string } };
      form.resetFields();
      onCreated(result.data.id, values.name.trim());
    } catch (err) {
      notification.error({ message: 'Tạo linh kiện thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Tạo linh kiện mới" open={open} onCancel={handleClose} footer={null} destroyOnHidden width={400}>
      <Form form={form} layout="vertical" initialValues={{ unit: 'cái' }} onFinish={handleFinish} className="pt-2">
        <Form.Item label="Tên linh kiện" name="name" rules={[{ required: true, message: 'Nhập tên linh kiện' }]}>
          <Input placeholder="VD: Chip NFC, Charm, Phôi tròn..." autoFocus />
        </Form.Item>
        <Form.Item label="Đơn vị" name="unit">
          <Input placeholder="cái" />
        </Form.Item>
        <Text type="secondary" className="mb-3 block text-xs">
          Tồn kho ban đầu = 0. Số lượng nhập trong phiếu sẽ được cộng khi bấm “Đã nhận”.
        </Text>
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>Tạo linh kiện</Button>
        </div>
      </Form>
    </Modal>
  );
}
