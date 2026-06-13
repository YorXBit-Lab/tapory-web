'use client';

import { Button, Card, Divider, Form, Input, InputNumber, Modal, Popconfirm, Switch, Table, Tag, Typography, notification } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useShippingRates, useCreateShipping, useUpdateShipping, useDeleteShipping } from '@/hooks/shippingRate';
import type { IShippingRate } from '@/configs/types';

const { Text, Title } = Typography;

/* ─────────────────────────────────────────────
   TikTok integration
───────────────────────────────────────────── */
interface TiktokStatus {
  connected: boolean;
  shop_id?: string;
  last_sync_at?: string | null;
  token_expired?: boolean;
}

function TiktokCard() {
  const { user } = useAdminAuth();
  const [status, setStatus]       = useState<TiktokStatus | null>(null);
  const [syncing, setSyncing]     = useState(false);
  const [testing, setTesting]     = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [manualForm] = Form.useForm();

  const fetchStatus = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tiktok/status', { headers: { Authorization: `Bearer ${token}` } });
      setStatus(await res.json());
    } catch {
      setStatus({ connected: false });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const handleTest = async () => {
    if (!user) return;
    setTesting(true);
    try {
      const token = await user.getIdToken();
      const res   = await fetch('/api/tiktok/test', { headers: { Authorization: `Bearer ${token}` } });
      const json  = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      notification.success({

        message: 'Kết nối TikTok API thành công',
        description: <pre className="mt-1 max-h-40 overflow-auto text-xs">{JSON.stringify(json.data, null, 2)}</pre>,
        duration: 10,
      });
    } catch (err) {
      notification.error({ message: 'Kết nối thất bại', description: err instanceof Error ? err.message : 'Lỗi không xác định' });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const token = await user.getIdToken();
      const res   = await fetch('/api/tiktok/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const json  = await res.json();
      if (!res.ok) throw new Error(json.error);
      notification.success({
        message: `Đã sync ${json.synced} đơn từ TikTok`,
        description: `Cập nhật lúc: ${new Date(json.last_sync_at).toLocaleString('vi-VN')}`,
      });
      fetchStatus();
    } catch (err) {
      notification.error({ message: err instanceof Error ? err.message : 'Sync thất bại' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveToken = async (values: {
    access_token: string;
    refresh_token?: string;
    shop_id: string;
    expires_in_hours: number;
  }) => {
    if (!user) return;
    setSavingToken(true);
    try {
      const token = await user.getIdToken();
      const res   = await fetch('/api/tiktok/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      notification.success({ message: 'Đã lưu token TikTok' });
      setShowManual(false);
      manualForm.resetFields();
      fetchStatus();
    } catch (err) {
      notification.error({ message: err instanceof Error ? err.message : 'Lưu thất bại' });
    } finally {
      setSavingToken(false);
    }
  };

  const lastSync = status?.last_sync_at
    ? new Date(status.last_sync_at).toLocaleString('vi-VN')
    : 'Chưa sync lần nào';

  return (
    <div className="rounded-lg border border-border bg-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white text-sm font-bold">T</div>
          <div>
            <Text strong className="block">TikTok Shop</Text>
            <Text type="secondary" className="text-xs">Tự động đồng bộ đơn hàng từ TikTok Shop</Text>
          </div>
        </div>
        {status === null ? null : status.connected ? (
          <Tag color={status.token_expired ? 'orange' : 'green'} icon={status.token_expired ? undefined : <CheckCircleFilled />}>
            {status.token_expired ? 'Token hết hạn' : 'Đã kết nối'}
          </Tag>
        ) : (
          <Tag color="default">Chưa kết nối</Tag>
        )}
      </div>

      {status?.connected && (
        <div className="mb-4 rounded-md bg-background px-3 py-2 text-xs text-content2">
          {status.shop_id && <span>Shop ID: <code>{status.shop_id}</code> · </span>}
          Sync lần cuối: {lastSync}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status?.connected && !status.token_expired && (
          <>
            <Button size="small" loading={testing} onClick={handleTest}>Test kết nối</Button>
            <Button size="small" loading={syncing} onClick={handleSync}>Sync ngay</Button>
          </>
        )}
        <Button
          size="small"
          type={status?.connected && !status.token_expired ? 'default' : 'primary'}
          href="/api/tiktok/auth"
        >
          {status?.connected ? 'Kết nối lại' : 'Kết nối TikTok Shop'}
        </Button>
        <Button size="small" type="link" className="px-0" onClick={() => setShowManual(v => !v)}>
          {showManual ? 'Ẩn' : 'Nhập token thủ công'}
        </Button>
      </div>

      {showManual && (
        <Form
          form={manualForm}
          layout="vertical"
          onFinish={handleSaveToken}
          className="mt-4 border-t border-border pt-4"
          initialValues={{ expires_in_hours: 24 }}
        >
          <Form.Item name="access_token" label="Access Token" rules={[{ required: true, message: 'Nhập access token' }]}>
            <Input.TextArea rows={3} placeholder="Dán access_token từ TikTok Developer..." className="font-mono text-xs" />
          </Form.Item>
          <Form.Item name="refresh_token" label="Refresh Token (tuỳ chọn)">
            <Input placeholder="refresh_token" className="font-mono text-xs" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="shop_id" label="Shop ID" rules={[{ required: true, message: 'Nhập shop_id' }]}>
              <Input placeholder="open_id hoặc seller_id" />
            </Form.Item>
            <Form.Item name="expires_in_hours" label="Hết hạn sau (giờ)">
              <InputNumber min={1} max={8760} className="w-full" />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" size="small" loading={savingToken}>Lưu token</Button>
        </Form>
      )}

      {status?.connected && (
        <p className="mt-3 text-[11px] text-content3">
          Đơn TikTok được đánh dấu <code>source: tiktok</code> — không thể sửa từ dashboard. Sản phẩm tên có chứa "NFC" / "móc khóa" sẽ tự nhận diện có chip NFC.
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Coming-soon integration item
───────────────────────────────────────────── */
function ComingSoonItem({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-elevated text-base">
          {icon}
        </div>
        <div>
          <Text strong className="text-sm">{name}</Text>
          <Text type="secondary" className="block text-xs">{desc}</Text>
        </div>
      </div>
      <Tag icon={<ClockCircleOutlined />} color="default" className="flex-shrink-0">Sắp có</Tag>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Notification row
───────────────────────────────────────────── */
function NotifRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <>
      <div className="flex items-center justify-between py-3">
        <div>
          <Text strong className="block text-sm">{label}</Text>
          <Text type="secondary" className="text-xs">{desc}</Text>
        </div>
        <Switch checked={checked} onChange={onChange} size="small" className="ml-4 flex-shrink-0" />
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  );
}


/* ─────────────────────────────────────────────
   Shipping rates card
───────────────────────────────────────────── */
interface ShippingFormValues {
  name: string;
  price: number;
  estimatedDays?: string;
  isDefault?: boolean;
}

function ShippingRatesCard() {
  const { Text } = Typography;
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

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    newOrder: true,
    remindCustomize: true,
    weeklyReport: false,
  });

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
      <ShippingRatesCard />
      <TiktokCard />
      <Card title="Cửa hàng">
        <SettingRow
          name="Tên cửa hàng"
          desc="Góc Chạm – Móc Khóa Kỷ Niệm NFC"
          action={<EditBtn />}
        />
        <SettingRow name="Giá bán mặc định" desc="189.000đ / móc khóa" action={<EditBtn />} />
        <SettingRow name="Domain NFC" desc="tapory.com/view/{orderId}" action={<EditBtn />} />
        <SettingRow name="Email liên hệ" desc="hello@tapory.com" action={<EditBtn />} />
      </Card>

      {/* Tích hợp sàn */}
      <section>
        <Title level={5} className="mb-3">Tích hợp sàn thương mại</Title>
        <div className="space-y-3">
          <TiktokCard />
          <div className="rounded-lg border border-dashed border-border bg-elevated p-5">
            <ComingSoonItem icon="🛍️" name="Shopee" desc="Đồng bộ đơn hàng từ Shopee Mall" />
            <Divider style={{ margin: 0 }} />
            <ComingSoonItem icon="📦" name="Lazada" desc="Đồng bộ đơn hàng từ Lazada" />
          </div>
        </div>
      </section>

      <Card title="Tích hợp">
        <SettingRow
          name="Spotify API"
          desc="Hỗ trợ template nhạc – bấm mở thẳng Spotify"
          action={<ConnectedTag />}
        />
        <SettingRow
          name="Google Analytics"
          desc="Phân tích hành vi người dùng"
          action={<ConnectedTag />}
        />
        <SettingRow
          name="Facebook Pixel"
          desc="Theo dõi chuyển đổi quảng cáo"
          action={<ConnectBtn />}
        />
        <SettingRow name="Zalo OA" desc="Gửi thông báo đơn hàng qua Zalo" action={<ConnectBtn />} />
      </Card>
    </div>
  );
}

function SettingRow({
  name,
  desc,
  action,
}: {
  name: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between py-2.5">
        <div>
          <Text strong className="block text-sm">
            {name}
          </Text>
          <Text type="secondary" className="text-xs">
            {desc}
          </Text>
        </div>
        <div className="ml-4 flex-shrink-0">{action}</div>
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  );
}

function EditBtn() {
  return <Button size="small">Sửa</Button>;
}

function ConfigBtn() {
  return <Button size="small">Cấu hình</Button>;
}

function ConnectBtn() {
  return (
    <Button size="small" type="primary">
      Kết nối
    </Button>
  );
}

function ConnectedTag() {
  return <Tag color="green">Đã kết nối</Tag>;
}
