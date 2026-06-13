'use client';

import { useState } from 'react';
import {
  App,
  Badge,
  Button,
  Card,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/service';
import { PRODUCT_TYPES } from '@/configs/constants';
import { deleteProductImage, r2KeyFromUrl } from '@/utils/r2-upload';
import type { IProduct, IProductVariant, IService, IPrintConfig, ProductStatus } from '@/configs/types';
import { ProductModal } from './ProductModal';
import { ServiceModal } from './ServiceModal';
import type { ServiceFormValues } from './types';

const { Text } = Typography;

const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  active: { color: 'success', label: 'Active' },
  archived: { color: 'error', label: 'Archived' },
};

function StockCell({ stock }: { stock?: number }) {
  if (stock === undefined) return <Text type="secondary" className="text-xs">∞</Text>;
  if (stock === 0) return <Tag color="error" className="text-xs">Hết hàng</Tag>;
  if (stock <= 5) return <Tag color="warning" className="text-xs">Còn {stock}</Tag>;
  return <Text className="text-xs font-medium">{stock}</Text>;
}

function variantPriceRange(variants: Record<string, IProductVariant>): string {
  const prices = Object.values(variants).map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min.toLocaleString('vi-VN')}đ`;
  return `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}đ`;
}

function variantStockSummary(variants: Record<string, IProductVariant>): React.ReactNode {
  const tracked = Object.values(variants).filter((v) => v.stock !== undefined);
  if (tracked.length === 0) return <Text type="secondary" className="text-xs">∞</Text>;
  const total = tracked.reduce((s, v) => s + (v.stock ?? 0), 0);
  if (total === 0) return <Tag color="error" className="text-xs">Hết hàng</Tag>;
  if (tracked.some((v) => (v.stock ?? Infinity) <= 5)) return <Tag color="warning" className="text-xs">{total}</Tag>;
  return <Text className="text-xs font-medium">{total}</Text>;
}

export default function ProductsPage() {
  const { notification } = App.useApp();
  const { user } = useAdminAuth();
  const { data: products = [], isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const { data: services = [] } = useServices();
  const { mutateAsync: createService } = useCreateService();
  const { mutateAsync: updateService } = useUpdateService();
  const { mutateAsync: deleteService } = useDeleteService();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [serviceListOpen, setServiceListOpen] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: IProduct) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (values: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (editing) {
      await updateProduct({ id: editing.id, data: values });
      notification.success({ message: 'Cập nhật thành công' });
    } else {
      await createProduct(values);
      notification.success({ message: 'Thêm sản phẩm thành công' });
    }
    closeModal();
  };

  const handleServiceSave = async (values: ServiceFormValues) => {
    if (editingService) {
      await updateService({ id: editingService.id, data: values });
      notification.success({ message: 'Đã cập nhật dịch vụ' });
    } else {
      await createService(values);
      notification.success({ message: 'Đã thêm dịch vụ' });
    }
    setServiceFormOpen(false);
    setEditingService(null);
  };

  const handleServiceDelete = async (service: IService) => {
    await deleteService(service.id);
    if (service.imageUrl && user) {
      const key = r2KeyFromUrl(service.imageUrl);
      if (key) { const idToken = await user.getIdToken(); deleteProductImage(key, idToken); }
    }
    notification.success({ message: 'Đã xóa dịch vụ' });
  };

  const handleDelete = async (product: IProduct) => {
    try {
      await deleteProduct(product.id);
      if (product.imageUrl && user) {
        const key = r2KeyFromUrl(product.imageUrl);
        if (key) { const idToken = await user.getIdToken(); deleteProductImage(key, idToken); }
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
          <div className="flex items-center gap-1.5">
            <Text strong className="text-sm">{name}</Text>
            <Tag className="!m-0 text-[10px]">{PRODUCT_TYPES[record.type ?? 'keychain']}</Tag>
          </div>
          {record.variants && (
            <Text type="secondary" className="block text-xs">{Object.keys(record.variants).length} biến thể</Text>
          )}
          {!record.variants && record.description && (
            <Text type="secondary" className="mt-0.5 block text-xs">{record.description}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Active', value: 'active' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ProductStatus) => {
        const cfg = PRODUCT_STATUS_CONFIG[status] ?? PRODUCT_STATUS_CONFIG.active;
        return <Badge status={cfg.color as 'default' | 'success' | 'error'} text={cfg.label} />;
      },
    },
    {
      title: 'Tồn kho',
      width: 100,
      sorter: (a, b) => {
        const aStock = a.variants
          ? Object.values(a.variants).filter((v) => v.stock !== undefined).reduce((s, v) => s + (v.stock ?? 0), 0)
          : (a.stock ?? Infinity);
        const bStock = b.variants
          ? Object.values(b.variants).filter((v) => v.stock !== undefined).reduce((s, v) => s + (v.stock ?? 0), 0)
          : (b.stock ?? Infinity);
        return aStock - bStock;
      },
      render: (_: unknown, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) return variantStockSummary(record.variants);
        return <StockCell stock={record.stock} />;
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      width: 160,
      sorter: (a, b) => a.price - b.price,
      render: (price: number, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) {
          return <Text strong className="text-xs">{variantPriceRange(record.variants)}</Text>;
        }
        return <Text strong>{price.toLocaleString('vi-VN')}đ</Text>;
      },
    },
    {
      title: 'In ảnh',
      dataIndex: 'printConfig',
      width: 140,
      render: (cfg: IPrintConfig | undefined, record: IProduct) => {
        if (record.variants) {
          const printCount = Object.values(record.variants).filter((v) => v.printConfig?.enabled).length;
          if (printCount === 0) return <Text type="secondary" className="text-xs">—</Text>;
          return <Tag color="green" className="text-xs">{printCount} biến thể</Tag>;
        }
        if (!cfg?.enabled) return <Text type="secondary" className="text-xs">—</Text>;
        const shapeLabel: Record<string, string> = { rectangle: 'Chữ nhật', square: 'Vuông', circle: 'Tròn' };
        let sizeStr = '';
        if (cfg.shape === 'circle') sizeStr = cfg.diameter ? `⌀${cfg.diameter}cm` : '';
        else if (cfg.shape === 'square') sizeStr = cfg.width ? `${cfg.width}×${cfg.width}cm` : '';
        else if (cfg.shape === 'rectangle') sizeStr = cfg.width && cfg.height ? `${cfg.width}×${cfg.height}cm` : '';
        return (
          <div className="flex flex-col gap-0.5">
            <Tag color="green" className="w-fit text-xs">{shapeLabel[cfg.shape ?? ''] ?? cfg.shape}</Tag>
            {sizeStr && <Text type="secondary" className="text-xs">{sizeStr}</Text>}
          </div>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'canBeNfc',
      width: 120,
      filters: [
        { text: 'Có thể NFC', value: true },
        { text: 'Thường', value: false },
      ],
      onFilter: (value, record) => {
        if (record.variants) return false;
        return record.canBeNfc === value;
      },
      render: (canBeNfc: boolean, record: IProduct) => {
        if (record.variants && Object.keys(record.variants).length > 0) {
          const nfcCount = Object.values(record.variants).filter((v) => v.isNfc).length;
          return (
            <div className="flex flex-col gap-0.5">
              <Tag color="purple" className="w-fit text-xs">Biến thể</Tag>
              {nfcCount > 0 && <Tag color="blue" className="w-fit text-xs">📡 {nfcCount} NFC</Tag>}
            </div>
          );
        }
        return canBeNfc ? <Tag color="blue">📡 NFC</Tag> : <Tag>Thường</Tag>;
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

  const productList = products as IProduct[];
  const outOfStockCount = productList.filter((p) => {
    if (p.variants && Object.keys(p.variants).length > 0) {
      const tracked = Object.values(p.variants).filter((v) => v.stock !== undefined);
      return tracked.length > 0 && tracked.every((v) => v.stock === 0);
    }
    return p.stock === 0;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Text type="secondary" className="text-sm">{productList.length} sản phẩm</Text>
          {outOfStockCount > 0 && (
            <Tag color="error" className="text-xs">{outOfStockCount} hết hàng</Tag>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setServiceListOpen(true)}>
            Dịch vụ
            {(services as IService[]).length > 0 && (
              <span className="ml-1 text-[10px] text-gray-400">({(services as IService[]).length})</span>
            )}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={productList}
          rowKey="id"
          loading={isLoading}
          size="small"
          rowClassName={(record) => {
            if (record.variants && Object.keys(record.variants).length > 0) {
              const tracked = Object.values(record.variants).filter((v) => v.stock !== undefined);
              return tracked.length > 0 && tracked.every((v) => v.stock === 0) ? 'opacity-60' : '';
            }
            return record.stock === 0 ? 'opacity-60' : '';
          }}
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
        services={services as IService[]}
        onClose={closeModal}
        onSave={handleSave}
      />

      <Modal
        title="Dịch vụ cộng thêm"
        open={serviceListOpen}
        onCancel={() => setServiceListOpen(false)}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <div className="space-y-3 pt-2">
          {(services as IService[]).length === 0 ? (
            <Text type="secondary" className="block text-sm">Chưa có dịch vụ nào.</Text>
          ) : (
            <Table
              dataSource={services as IService[]}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Dịch vụ',
                  render: (_: unknown, s: IService) => (
                    <div className="flex items-center gap-2">
                      {s.imageUrl && (
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-gray-100">
                          <Image src={s.imageUrl} alt={s.name} fill className="object-cover" sizes="36px" unoptimized />
                        </div>
                      )}
                      <div>
                        <Text strong className="text-sm">{s.name}</Text>
                        {s.description && <Text type="secondary" className="block text-xs">{s.description}</Text>}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Phụ phí',
                  dataIndex: 'price',
                  width: 120,
                  render: (p: number) => <Text strong>+{p.toLocaleString('vi-VN')}đ</Text>,
                },
                {
                  title: '',
                  width: 80,
                  render: (_: unknown, s: IService) => (
                    <span className="flex gap-2 text-xs">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => { setEditingService(s); setServiceFormOpen(true); }}
                      >
                        <EditOutlined /> Sửa
                      </button>
                      <Popconfirm
                        title="Xóa dịch vụ này?"
                        onConfirm={() => handleServiceDelete(s)}
                        okText="Xóa"
                        cancelText="Hủy"
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
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => { setEditingService(null); setServiceFormOpen(true); }}
          >
            Thêm dịch vụ mới
          </Button>
        </div>
      </Modal>

      <ServiceModal
        open={serviceFormOpen}
        initial={editingService}
        onClose={() => { setServiceFormOpen(false); setEditingService(null); }}
        onSave={handleServiceSave}
      />
    </div>
  );
}
