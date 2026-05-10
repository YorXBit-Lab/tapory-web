'use client';

import { Button, Card, Divider, Form, Input, InputNumber, Switch, Tag, Typography, notification } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

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

  useEffect(() => { fetchStatus(); }, [user]);

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

  const handleSaveToken = async (values: { access_token: string; refresh_token?: string; shop_id: string; expires_in_hours: number }) => {
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
    <div className="rounded-lg border border-gray-100 bg-white p-5">
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
        <div className="mb-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
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
          className="mt-4 border-t border-gray-100 pt-4"
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
        <p className="mt-3 text-[11px] text-gray-400">
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
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-base">
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
   Page
───────────────────────────────────────────── */
export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    newOrder:        true,
    remindCustomize: true,
    weeklyReport:    false,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Tích hợp sàn */}
      <section>
        <Title level={5} className="mb-3">Tích hợp sàn thương mại</Title>
        <div className="space-y-3">
          <TiktokCard />
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5">
            <ComingSoonItem icon="🛍️" name="Shopee" desc="Đồng bộ đơn hàng từ Shopee Mall" />
            <Divider style={{ margin: 0 }} />
            <ComingSoonItem icon="📦" name="Lazada" desc="Đồng bộ đơn hàng từ Lazada" />
          </div>
        </div>
      </section>

      {/* Thông báo */}
      <section>
        <Title level={5} className="mb-3">Thông báo</Title>
        <Card size="small" bodyStyle={{ padding: '0 16px' }}>
          <NotifRow
            label="Đơn hàng mới"
            desc="Nhận thông báo khi có đơn mới"
            checked={notifs.newOrder}
            onChange={v => setNotifs(p => ({ ...p, newOrder: v }))}
          />
          <NotifRow
            label="Nhắc khách tùy chỉnh"
            desc="Gửi nhắc sau 24h nếu khách chưa tùy chỉnh chip NFC"
            checked={notifs.remindCustomize}
            onChange={v => setNotifs(p => ({ ...p, remindCustomize: v }))}
          />
          <NotifRow
            label="Báo cáo hàng tuần"
            desc="Tóm tắt doanh thu & đơn hàng gửi thứ Hai"
            checked={notifs.weeklyReport}
            onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))}
          />
          <div className="py-2">
            <Text type="secondary" className="text-xs">
              * Thông báo chưa được gửi đi thực tế — tính năng đang trong quá trình phát triển.
            </Text>
          </div>
        </Card>
      </section>

    </div>
  );
}
