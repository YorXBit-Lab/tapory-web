'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Table, Tag, Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useComponents, useCreateComponent, useUpdateComponent, useDeleteComponent,
} from '@/hooks/component';
import { componentAvailable } from '@/services/ComponentAPI';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IComponent } from '@/configs/types';

const { Text } = Typography;

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');
function r2KeyFromUrl(url: string): string | null {
  if (!R2_BASE || !url.startsWith(R2_BASE)) return null;
  return url.slice(R2_BASE.length + 1);
}

interface ComponentForm {
  name: string;
  description?: string;
  stock: number;
  unit?: string;
  lowStockThreshold?: number;
  imageUrl?: string;
}

function StockTag({ c }: { c: IComponent }) {
  const avail = componentAvailable(c);
  const low = c.lowStockThreshold ?? 5;
  if (avail === 0) return <Tag color="error">Hết hàng</Tag>;
  if (avail <= low) return <Tag color="warning">Còn {avail}{c.unit ? ` ${c.unit}` : ''}</Tag>;
  return <Text className="font-medium">{avail}{c.unit ? ` ${c.unit}` : ''}</Text>;
}

/* ── Image uploader (ảnh thumbnail linh kiện, tùy chọn) ── */
function ImageUploader({
  value, uploading, onUpload, onRemove,
}: {
  value?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-start gap-3">
      <div
        className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image src={value} alt="linh kiện" fill className="object-cover" sizes="64px" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <UploadOutlined style={{ fontSize: 18 }} />
            <span className="text-[10px]">Tải ảnh</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button size="small" icon={<UploadOutlined />} loading={uploading} onClick={() => inputRef.current?.click()}>
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
        {value && <Button size="small" danger onClick={onRemove}>Xóa ảnh</Button>}
        <Text type="secondary" className="text-[10px]">JPEG · PNG · WebP · tối đa 5 MB</Text>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function ComponentModal({
  open, initial, onClose, onSave,
}: {
  open: boolean;
  initial?: IComponent | null;
  onClose: () => void;
  onSave: (values: ComponentForm) => Promise<void>;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm<ComponentForm>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageUrl: string = Form.useWatch('imageUrl', form) ?? '';

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const { url } = await uploadProductImage(file, idToken);
      form.setFieldValue('imageUrl', url);
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => form.setFieldValue('imageUrl', '');

  const handleFinish = async (values: ComponentForm) => {
    setSaving(true);
    try {
      // Ảnh cũ bị thay/xóa → best-effort dọn khỏi R2
      if (initial?.imageUrl && values.imageUrl !== initial.imageUrl && user) {
        const key = r2KeyFromUrl(initial.imageUrl);
        if (key) {
          const idToken = await user.getIdToken();
          deleteProductImage(key, idToken);
        }
      }
      await onSave(values);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? 'Sửa linh kiện' : 'Thêm linh kiện'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={420}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          form.setFieldsValue({
            name: initial.name,
            description: initial.description,
            stock: initial.stock,
            unit: initial.unit,
            lowStockThreshold: initial.lowStockThreshold,
            imageUrl: initial.imageUrl ?? '',
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ stock: 0, unit: 'cái', imageUrl: '' }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Ảnh (tùy chọn)" name="imageUrl">
          <ImageUploader value={imageUrl} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
        </Form.Item>

        <Form.Item label="Tên linh kiện" name="name" rules={[{ required: true, message: 'Nhập tên linh kiện' }]}>
          <Input placeholder="VD: Phôi tròn, Phôi vuông, Chip NFC, Charm..." autoFocus />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Kích thước, màu, nhà cung cấp... (tùy chọn)" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Tồn kho" name="stock" rules={[{ required: true, message: 'Nhập tồn kho' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item label="Đơn vị" name="unit">
            <Input placeholder="cái" />
          </Form.Item>
        </div>

        <Form.Item label="Ngưỡng cảnh báo sắp hết" name="lowStockThreshold" extra="Để trống = mặc định 5">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="5" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={onClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {initial ? 'Cập nhật' : 'Thêm linh kiện'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default function ComponentsPage() {
  const { notification } = App.useApp();
  const { data: components = [], isLoading } = useComponents();
  const { mutateAsync: createComponent } = useCreateComponent();
  const { mutateAsync: updateComponent } = useUpdateComponent();
  const { mutateAsync: deleteComponent } = useDeleteComponent();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IComponent | null>(null);

  const list = components as IComponent[];
  const lowCount = list.filter((c) => componentAvailable(c) <= (c.lowStockThreshold ?? 5)).length;

  const handleSave = async (values: ComponentForm) => {
    if (editing) {
      await updateComponent({ id: editing.id, data: values });
      notification.success({ message: 'Đã cập nhật linh kiện' });
    } else {
      await createComponent(values);
      notification.success({ message: 'Đã thêm linh kiện' });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (c: IComponent) => {
    try {
      await deleteComponent(c.id);
      notification.success({ message: 'Đã xóa linh kiện' });
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  const adjustStock = async (c: IComponent, delta: number) => {
    await updateComponent({ id: c.id, data: { stock: Math.max(0, c.stock + delta) } });
  };

  const columns: ColumnsType<IComponent> = [
    {
      title: 'Linh kiện',
      dataIndex: 'name',
      render: (name: string, c) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt={name} fill className="object-cover" sizes="36px" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-300">—</span>
            )}
          </div>
          <div className="min-w-0">
            <Text strong className="text-sm">{name}</Text>
            {c.description && (
              <Text type="secondary" className="block text-xs">{c.description}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      width: 140,
      sorter: (a, b) => componentAvailable(a) - componentAvailable(b),
      render: (_: unknown, c) => <StockTag c={c} />,
    },
    {
      title: 'Điều chỉnh nhanh',
      width: 160,
      render: (_: unknown, c) => (
        <span className="flex items-center gap-1.5">
          <Button size="small" onClick={() => adjustStock(c, -1)} disabled={c.stock <= 0}>−1</Button>
          <Button size="small" onClick={() => adjustStock(c, 1)}>+1</Button>
          <Button size="small" onClick={() => adjustStock(c, 10)}>+10</Button>
        </span>
      ),
    },
    {
      title: 'Hành động',
      width: 120,
      render: (_: unknown, c) => (
        <span className="flex items-center gap-2 text-xs">
          <button className="text-primary hover:underline" onClick={() => { setEditing(c); setModalOpen(true); }}>
            <EditOutlined /> Sửa
          </button>
          <span className="text-gray-300">·</span>
          <Popconfirm
            title="Xóa linh kiện này?"
            description="Sản phẩm đang dùng linh kiện này sẽ không trừ kho được."
            onConfirm={() => handleDelete(c)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-red-500 hover:underline"><DeleteOutlined /> Xóa</button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Text type="secondary" className="text-sm">{list.length} linh kiện</Text>
          {lowCount > 0 && <Tag color="warning" className="text-xs">{lowCount} sắp/đã hết</Tag>}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Thêm linh kiện
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}`, size: 'small' }}
        />
      </Card>

      <ComponentModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
