'use client';

import { useState } from 'react';
import { App, Button, Form, Input, InputNumber, Modal } from 'antd';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { uploadProductImage, deleteProductImage, r2KeyFromUrl } from '@/utils/r2-upload';
import { priceFormatter, priceParser } from '@/utils/format';
import type { IService } from '@/configs/types';
import type { ServiceFormValues } from './types';

interface ServiceModalProps {
  open: boolean;
  initial?: IService | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => Promise<void>;
}

export function ServiceModal({ open, initial, onClose, onSave }: ServiceModalProps) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm<ServiceFormValues>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const imageUrl: string = Form.useWatch('imageUrl', form) ?? '';

  const discardPendingImage = async (key: string | null) => {
    if (!key || !user) return;
    const idToken = await user.getIdToken();
    deleteProductImage(key, idToken);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      if (uploadedKey) { await discardPendingImage(uploadedKey); setUploadedKey(null); }
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      form.setFieldValue('imageUrl', url);
      setUploadedKey(key);
    } catch (err) {
      notification.error({ message: 'Upload thất bại', description: err instanceof Error ? err.message : 'Thử lại sau' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.setFieldValue('imageUrl', '');
  };

  const handleClose = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: ServiceFormValues) => {
    setSaving(true);
    try {
      await onSave(values);
      if (initial?.imageUrl && values.imageUrl !== initial.imageUrl && user) {
        const key = r2KeyFromUrl(initial.imageUrl);
        if (key) { const idToken = await user.getIdToken(); deleteProductImage(key, idToken); }
      }
      setUploadedKey(null);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={400}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          form.setFieldsValue({ name: initial.name, price: initial.price, imageUrl: initial.imageUrl ?? '', description: initial.description });
        }
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ price: 0, imageUrl: '' }} onFinish={handleFinish} className="pt-2">
        <Form.Item label="Ảnh dịch vụ" name="imageUrl">
          <ImageUploader value={imageUrl} uploading={uploading} onUpload={handleUpload} onRemove={handleRemoveImage} />
        </Form.Item>

        <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
          <Input placeholder="VD: Gói quà, Express 24h..." autoFocus />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Phụ phí (đ)" name="price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={priceFormatter} parser={priceParser} placeholder="0" addonAfter="đ" />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input placeholder="Mô tả ngắn (tùy chọn)" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={() => { void handleClose(); }} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving || uploading}>
            {initial ? 'Cập nhật' : 'Thêm dịch vụ'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
