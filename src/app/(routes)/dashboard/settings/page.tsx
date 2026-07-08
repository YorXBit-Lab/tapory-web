'use client';

import { Button, Card, Divider, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TiktokCard } from './TiktokCard';
import { ShippingRatesCard } from './ShippingRatesCard';

const { Text, Title } = Typography;

/* ── Coming-soon integration item ── */
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

function SettingRow({ name, desc, action }: { name: string; desc: string; action: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-between py-2.5">
        <div>
          <Text strong className="block text-sm">{name}</Text>
          <Text type="secondary" className="text-xs">{desc}</Text>
        </div>
        <div className="ml-4 flex-shrink-0">{action}</div>
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  );
}

function ConnectBtn() {
  return <Button size="small" type="primary">Kết nối</Button>;
}

function ConnectedTag() {
  return <Tag color="green">Đã kết nối</Tag>;
}

/* ── Page ── */
export default function SettingsPage() {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
      <ShippingRatesCard />

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
