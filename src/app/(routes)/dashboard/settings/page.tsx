'use client';

import { Button, Card, Divider, Form, Input, InputNumber, Switch, Tag, Typography, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const { Text } = Typography;

// ── TikTok integration card ────────────────────────────────────────────────
interface TiktokStatus {
  connected: boolean;
  shop_id?: string;
  last_sync_at?: string | null;
  token_expired?: boolean;
}

function TiktokCard() {
  const { user } = useAdminAuth();
  const [status, setStatus] = useState<TiktokStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [manualForm] = Form.useForm();

  const fetchStatus = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tiktok/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setStatus(json);
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
      const res = await fetch('/api/tiktok/test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      notification.success({
        message: 'Kết nối TikTok API thành công ✓',
        description: (
          <pre className="text-xs mt-1 max-h-40 overflow-auto">
            {JSON.stringify(json.data, null, 2)}
          </pre>
        ),
        duration: 10,
      });
    } catch (err) {
      notification.error({
        message: 'Kết nối thất bại',
        description: err instanceof Error ? err.message : 'Lỗi không xác định',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tiktok/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
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
      const res = await fetch('/api/tiktok/token', {
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

  if (!status) return null;

  const lastSync = status.last_sync_at
    ? new Date(status.last_sync_at).toLocaleString('vi-VN')
    : 'Chưa sync lần nào';

  return (
    <Card title="TikTok Shop" className="md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {status.connected ? (
            <>
              <div className="flex items-center gap-2">
                <Tag color="green">Đã kết nối</Tag>
                {status.token_expired && <Tag color="orange">Token hết hạn — cần kết nối lại</Tag>}
                {status.shop_id && <Text type="secondary" className="text-xs">Shop ID: {status.shop_id}</Text>}
              </div>
              <Text type="secondary" className="mt-1 block text-xs">Sync lần cuối: {lastSync}</Text>
            </>
          ) : (
            <Text type="secondary" className="text-sm">Chưa kết nối TikTok Shop</Text>
          )}
        </div>

        <div className="flex gap-2">
          {status.connected && !status.token_expired && (
            <>
              <Button size="small" loading={testing} onClick={handleTest}>
                Test kết nối
              </Button>
              <Button size="small" loading={syncing} onClick={handleSync}>
                Sync ngay
              </Button>
            </>
          )}
          <Button
            size="small"
            type={status.connected && !status.token_expired ? 'default' : 'primary'}
            href="/api/tiktok/auth"
          >
            {status.connected ? 'Kết nối lại' : 'Kết nối TikTok Shop'}
          </Button>
        </div>
      </div>

      {status.connected && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <div className="rounded-md bg-gray-50 px-3 py-2">
            <Text type="secondary" className="text-xs">
              <strong>Lưu ý:</strong> Đơn TikTok được đánh dấu <code>source: tiktok</code> — không thể sửa từ dashboard.
              Sản phẩm tên có chứa &quot;NFC&quot; / &quot;móc khóa&quot; sẽ tự nhận diện là có chip NFC.
            </Text>
          </div>
        </>
      )}

      <Divider style={{ margin: '12px 0' }} />
      <div>
        <Button
          size="small"
          type="link"
          className="px-0"
          onClick={() => setShowManual((v) => !v)}
        >
          {showManual ? 'Ẩn' : 'Nhập token thủ công'}
        </Button>
        {showManual && (
          <Form
            form={manualForm}
            layout="vertical"
            onFinish={handleSaveToken}
            className="mt-3"
            initialValues={{ expires_in_hours: 24 }}
          >
            <Form.Item
              name="access_token"
              label="Access Token"
              rules={[{ required: true, message: 'Nhập access token' }]}
            >
              <Input.TextArea rows={3} placeholder="Dán access_token từ TikTok Developer..." />
            </Form.Item>
            <Form.Item name="refresh_token" label="Refresh Token (tuỳ chọn)">
              <Input placeholder="refresh_token (để trống nếu không có)" />
            </Form.Item>
            <Form.Item
              name="shop_id"
              label="Shop ID"
              rules={[{ required: true, message: 'Nhập shop_id' }]}
            >
              <Input placeholder="Shop ID (open_id hoặc seller_id)" />
            </Form.Item>
            <Form.Item name="expires_in_hours" label="Token hết hạn sau (giờ)">
              <InputNumber min={1} max={8760} className="w-full" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="small" loading={savingToken}>
                Lưu token
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    newOrder:        true,
    remindCustomize: true,
    weeklyReport:    false,
  });

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
      <TiktokCard />
      <Card title="Cửa hàng">
        <SettingRow name="Tên cửa hàng"       desc="Tapory – Móc Khóa Kỷ Niệm NFC"  action={<EditBtn />} />
        <SettingRow name="Giá bán mặc định"    desc="189.000đ / móc khóa"             action={<EditBtn />} />
        <SettingRow name="Domain NFC"          desc="tapory.com/view/{orderId}"       action={<EditBtn />} />
        <SettingRow name="Email liên hệ"       desc="hello@tapory.com"                action={<EditBtn />} />
      </Card>

      <Card title="Thông báo">
        <SettingRow
          name="Email đơn hàng mới"
          desc="Nhận email khi có đơn mới"
          action={
            <Switch
              checked={notifs.newOrder}
              onChange={(v) => setNotifs((p) => ({ ...p, newOrder: v }))}
              size="small"
            />
          }
        />
        <SettingRow
          name="Nhắc khách tùy chỉnh"
          desc="Tự động gửi email sau 24h nếu chưa tùy chỉnh"
          action={
            <Switch
              checked={notifs.remindCustomize}
              onChange={(v) => setNotifs((p) => ({ ...p, remindCustomize: v }))}
              size="small"
            />
          }
        />
        <SettingRow
          name="Báo cáo hàng tuần"
          desc="Tóm tắt doanh thu & đơn hàng gửi thứ Hai"
          action={
            <Switch
              checked={notifs.weeklyReport}
              onChange={(v) => setNotifs((p) => ({ ...p, weeklyReport: v }))}
              size="small"
            />
          }
        />
      </Card>

      <Card title="Vận chuyển">
        <SettingRow name="Đơn vị giao hàng"    desc="GHN, GHTK, J&T Express"        action={<ConfigBtn />} />
        <SettingRow name="Phí vận chuyển"       desc="Miễn phí toàn quốc"            action={<EditBtn />}   />
        <SettingRow name="Thời gian giao hàng"  desc="2–4 ngày làm việc"             action={<EditBtn />}   />
      </Card>

      <Card title="Tích hợp">
        <SettingRow name="Spotify API"       desc="Hỗ trợ template nhạc – bấm mở thẳng Spotify" action={<ConnectedTag />} />
        <SettingRow name="Google Analytics"  desc="Phân tích hành vi người dùng"                 action={<ConnectedTag />} />
        <SettingRow name="Facebook Pixel"    desc="Theo dõi chuyển đổi quảng cáo"               action={<ConnectBtn />}   />
        <SettingRow name="Zalo OA"           desc="Gửi thông báo đơn hàng qua Zalo"             action={<ConnectBtn />}   />
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
          <Text strong className="text-sm block">{name}</Text>
          <Text type="secondary" className="text-xs">{desc}</Text>
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
