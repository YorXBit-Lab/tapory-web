'use client';

import { Button, Card, Divider, Switch, Tag, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    newOrder:        true,
    remindCustomize: true,
    weeklyReport:    false,
  });

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
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
