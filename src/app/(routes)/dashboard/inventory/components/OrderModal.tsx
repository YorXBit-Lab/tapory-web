'use client';

import { useState } from 'react';
import { App, Button, Divider, Form, Input, Modal, Select } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { uploadProductImage, deleteProductImage, r2KeyFromUrl } from '@/utils/r2-upload';
import type { IPurchaseOrder, IComponent } from '@/configs/types';
import type { OrderFormValues } from './types';
import { ItemsTable } from './ItemsTable';
import { OrderImageUploader } from './OrderImageUploader';
import { QuickCreateComponentModal } from './QuickCreateComponentModal';

export function OrderModal({
  open,
  initial,
  components,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IPurchaseOrder | null;
  components: IComponent[];
  onClose: () => void;
  onSave: (values: OrderFormValues, imageUrls: string[]) => Promise<void>;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<OrderFormValues>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [pendingItemName, setPendingItemName] = useState<number | null>(null);

  const handleFinish = async (values: OrderFormValues) => {
    setSaving(true);
    try {
      await onSave(values, imageUrls);
      setPendingKeys([]);
      setImageUrls([]);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (pendingKeys.length > 0 && user) {
      const idToken = await user.getIdToken();
      pendingKeys.forEach(key => deleteProductImage(key, idToken));
    }
    setPendingKeys([]);
    setImageUrls([]);
    form.resetFields();
    onClose();
  };

  const handleAddImage = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      setImageUrls(prev => [...prev, url]);
      setPendingKeys(prev => [...prev, key]);
    } catch (err) {
      notification.error({ message: 'Upload ảnh thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const url = imageUrls[index];
    const key = r2KeyFromUrl(url);
    if (key && pendingKeys.includes(key) && user) {
      const idToken = await user.getIdToken();
      deleteProductImage(key, idToken);
      setPendingKeys(prev => prev.filter(k => k !== key));
    }
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRequestCreate = (itemName: number) => {
    setPendingItemName(itemName);
    setQuickCreateOpen(true);
  };

  const handleComponentCreated = (id: string, name: string) => {
    queryClient.invalidateQueries({ queryKey: ['components'] });
    if (pendingItemName !== null) {
      form.setFieldValue(['items', pendingItemName, 'componentId'], id);
    }
    setQuickCreateOpen(false);
    setPendingItemName(null);
    notification.success({ message: `Đã tạo linh kiện "${name}"` });
  };

  return (
    <>
      <Modal
        title={initial ? 'Sửa phiếu nhập' : 'Tạo phiếu nhập hàng'}
        open={open}
        onCancel={handleClose}
        footer={null}
        destroyOnHidden
        width={640}
        afterOpenChange={(vis) => {
          if (vis) {
            setImageUrls(initial?.imageUrls ?? []);
            setPendingKeys([]);
            if (initial) {
              form.setFieldsValue({
                status: initial.status,
                supplier: initial.supplier,
                expectedDate: initial.expectedDate,
                note: initial.note,
                items: initial.items.map(i => ({
                  componentId: i.componentId,
                  quantity: i.quantity,
                  unitCost: i.unitCost,
                })),
              });
            }
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'planned', items: [{ quantity: 1, unitCost: 0 }] }}
          onFinish={handleFinish}
          className="pt-2"
        >
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'planned', label: '📋 Kế hoạch' },
                  { value: 'ordered', label: '🚚 Đã đặt hàng' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Nhà cung cấp" name="supplier">
              <Input placeholder="Tên NCC (tùy chọn)" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item label="Ngày dự kiến nhận" name="expectedDate">
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input placeholder="Ghi chú phiếu..." />
            </Form.Item>
          </div>

          <Form.Item label="Danh sách linh kiện nhập">
            <ItemsTable form={form} components={components} onRequestCreate={handleRequestCreate} />
          </Form.Item>

          <Divider titlePlacement="start" orientationMargin={0} className="!mb-3 !mt-1 !text-xs !text-content3">
            Ảnh đính kèm (hoá đơn, phiếu giao hàng...)
          </Divider>

          <Form.Item className="mb-2">
            <OrderImageUploader
              imageUrls={imageUrls}
              uploading={uploading}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleClose} disabled={saving}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {initial ? 'Cập nhật' : 'Tạo phiếu'}
            </Button>
          </div>
        </Form>
      </Modal>

      <QuickCreateComponentModal
        open={quickCreateOpen}
        onClose={() => { setQuickCreateOpen(false); setPendingItemName(null); }}
        onCreated={handleComponentCreated}
      />
    </>
  );
}
