'use client';

import { useRef, useState } from 'react';
import {
  App, Button, Card, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Table, Tag, Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';
import { TEMPLATE_LIST } from '@/configs/constants';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IProduct } from '@/configs/types';

const { Text } = Typography;

function priceFormatter(v: number | string | undefined) {
  return `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function priceParser(v: string | undefined) {
  return Number((v ?? '').replace(/\./g, '')) as 0;
}

type ProductFormValues = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>;

/* ── Image uploader ── */
function ImageUploader({
  value,
  uploading,
  onUpload,
  onRemove,
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
        className="relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image src={value} alt="product" fill className="object-cover" sizes="80px" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <UploadOutlined style={{ fontSize: 20 }} />
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
        {value && (
          <Button size="small" danger onClick={onRemove}>
            Xóa ảnh
          </Button>
        )}
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

/* ── Product modal ── */
function ProductModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: IProduct | null;
  onClose: () => void;
  /** Phải throw nếu save lỗi để modal giữ nguyên form */
  onSave: (values: ProductFormValues) => Promise<void>;
}) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const imageUrl: string = Form.useWatch('imageUrl', form) ?? '';

  /* Xóa ảnh pending trên R2 (best-effort) */
  const discardPendingImage = async (key: string | null) => {
    if (!key || !user) return;
    const idToken = await user.getIdToken();
    deleteProductImage(key, idToken);
  };

  /* Upload ảnh mới — xóa ảnh pending cũ nếu có */
  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      // Nếu đang có ảnh pending chưa save thì xóa trước
      if (uploadedKey) {
        await discardPendingImage(uploadedKey);
        setUploadedKey(null);
      }
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      form.setFieldValue('imageUrl', url);
      setUploadedKey(key);
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setUploading(false);
    }
  };

  /* Xóa ảnh vừa upload (nút "Xóa ảnh") */
  const handleRemoveImage = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.setFieldValue('imageUrl', '');
  };

  /* Cancel — xóa ảnh pending rồi đóng */
  const handleClose = async () => {
    await discardPendingImage(uploadedKey);
    setUploadedKey(null);
    form.resetFields();
    onClose();
  };

  /* Submit */
  const handleFinish = async (values: ProductFormValues) => {
    setSaving(true);
    try {
      await onSave(values);
      // Xóa ảnh cũ trên R2 nếu đã thay ảnh khi edit
      if (initial?.imageUrl && values.imageUrl !== initial.imageUrl && user) {
        const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');
        if (base && initial.imageUrl.startsWith(base)) {
          const oldKey = initial.imageUrl.slice(base.length + 1);
          const idToken = await user.getIdToken();
          deleteProductImage(oldKey, idToken); // best-effort
        }
      }
      setUploadedKey(null);
      form.resetFields();
    } catch (err) {
      // Lỗi — giữ nguyên form để người dùng thử lại
      notification.error({
        message: 'Lỗi',
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại sau',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={500}
      afterOpenChange={(vis) => {
        if (vis && initial) {
          form.setFieldsValue({
            name: initial.name,
            price: initial.price,
            isNfc: initial.isNfc,
            templateId: initial.templateId,
            description: initial.description,
            imageUrl: initial.imageUrl ?? '',
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isNfc: false, price: 0, imageUrl: '' }}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item label="Ảnh sản phẩm" name="imageUrl">
          <ImageUploader
            value={imageUrl}
            uploading={uploading}
            onUpload={handleUpload}
            onRemove={handleRemoveImage}
          />
        </Form.Item>

        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
          <Input placeholder="Ví dụ: Móc khóa NFC Premium" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-3">
          <Form.Item label="Đơn giá (đ)" name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={priceFormatter}
              parser={priceParser}
              placeholder="189.000"
            />
          </Form.Item>

          <Form.Item label="Loại" name="isNfc">
            <Select
              options={[
                { value: false, label: 'Sản phẩm thường' },
                { value: true, label: '📡 Có chip NFC' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isNfc !== cur.isNfc}>
          {() =>
            form.getFieldValue('isNfc') ? (
              <Form.Item label="Template NFC mặc định (tuỳ chọn)" name="templateId">
                <Select placeholder="Chọn template">
                  {TEMPLATE_LIST.map((tpl) => (
                    <Select.Option key={tpl.id} value={tpl.id}>
                      {tpl.icon} {tpl.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn..." />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving || uploading}>
            {uploading ? 'Đang tải ảnh...' : initial ? 'Cập nhật' : 'Thêm sản phẩm'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function r2KeyFromUrl(url: string): string | null {
  if (!R2_BASE || !url.startsWith(R2_BASE)) return null;
  return url.slice(R2_BASE.length + 1);
}

/* ── Page ── */
export default function ProductsPage() {
  const { notification } = App.useApp();
  const { user } = useAdminAuth();
  const { data: products = [], isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: IProduct) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  /** Throw để ProductModal biết là lỗi và giữ form */
  const handleSave = async (values: ProductFormValues): Promise<void> => {
    if (editing) {
      await updateProduct({ id: editing.id, data: values });
      notification.success({ message: 'Cập nhật thành công' });
    } else {
      await createProduct(values);
      notification.success({ message: 'Thêm sản phẩm thành công' });
    }
    closeModal();
  };

  const handleDelete = async (product: IProduct) => {
    try {
      await deleteProduct(product.id);
      // Xóa ảnh R2 nếu có
      if (product.imageUrl && user) {
        const key = r2KeyFromUrl(product.imageUrl);
        if (key) {
          const idToken = await user.getIdToken();
          deleteProductImage(key, idToken); // best-effort
        }
      }
      notification.success({ message: 'Đã xóa sản phẩm' });
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  const columns: ColumnsType<IProduct> = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      width: 64,
      render: (url?: string) =>
        url ? (
          <div className="relative h-10 w-10 overflow-hidden rounded">
            <Image src={url} alt="product" fill className="object-cover" sizes="40px" unoptimized />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-lg">📦</div>
        ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong className="text-sm">{name}</Text>
          {record.description && (
            <Text type="secondary" className="mt-0.5 block text-xs">{record.description}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      width: 130,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => <Text strong>{price.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'isNfc',
      width: 110,
      filters: [
        { text: 'Có NFC', value: true },
        { text: 'Thường', value: false },
      ],
      onFilter: (value, record) => record.isNfc === value,
      render: (isNfc: boolean) => isNfc ? <Tag color="blue">📡 NFC</Tag> : <Tag>Thường</Tag>,
    },
    {
      title: 'Template',
      dataIndex: 'templateId',
      width: 140,
      render: (templateId?: string) => {
        if (!templateId) return <Text type="secondary" className="text-xs">—</Text>;
        const tpl = TEMPLATE_LIST.find((t) => t.id === templateId);
        return tpl ? (
          <Text className="text-xs">{tpl.icon} {tpl.name}</Text>
        ) : (
          <Text type="secondary" className="text-xs">{templateId}</Text>
        );
      },
    },
    {
      title: 'Hành động',
      width: 110,
      render: (_: unknown, record: IProduct) => (
        <span className="flex items-center gap-2 text-xs">
          <button className="text-primary hover:underline" onClick={() => openEdit(record)}>
            <EditOutlined /> Sửa
          </button>
          <span className="text-gray-300">·</span>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Đơn hàng đã tạo sẽ không bị ảnh hưởng."
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-red-500 hover:underline">
              <DeleteOutlined /> Xóa
            </button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Text type="secondary" className="text-sm">
          {(products as IProduct[]).length} sản phẩm — dùng để chọn nhanh khi tạo đơn hàng
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products as IProduct[]}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={{
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
        />
      </Card>

      <ProductModal
        open={modalOpen}
        initial={editing}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
