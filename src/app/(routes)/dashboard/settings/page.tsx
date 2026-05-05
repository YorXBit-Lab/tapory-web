'use client';

import { Toggle } from '@/components/dashboard';
import { useState } from 'react';

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    newOrder: true,
    remindCustomize: true,
    weeklyReport: false,
  });

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
      {/* Store info */}
      <SettingsCard title="Cửa hàng">
        <SettingRow name="Tên cửa hàng" desc="Tapory – Móc Khóa Kỷ Niệm NFC" action={<EditBtn />} />
        <SettingRow name="Giá bán mặc định" desc="189.000đ / móc khóa" action={<EditBtn />} />
        <SettingRow name="Domain NFC" desc="tapory.com/view/{orderId}" action={<EditBtn />} />
        <SettingRow name="Email liên hệ" desc="hello@tapory.com" action={<EditBtn />} />
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title="Thông báo">
        <SettingRow
          name="Email đơn hàng mới"
          desc="Nhận email khi có đơn mới"
          action={
            <Toggle
              checked={notifs.newOrder}
              onChange={(v) => setNotifs((p) => ({ ...p, newOrder: v }))}
            />
          }
        />
        <SettingRow
          name="Nhắc khách tùy chỉnh"
          desc="Tự động gửi email sau 24h nếu chưa tùy chỉnh"
          action={
            <Toggle
              checked={notifs.remindCustomize}
              onChange={(v) => setNotifs((p) => ({ ...p, remindCustomize: v }))}
            />
          }
        />
        <SettingRow
          name="Báo cáo hàng tuần"
          desc="Tóm tắt doanh thu & đơn hàng gửi thứ Hai"
          action={
            <Toggle
              checked={notifs.weeklyReport}
              onChange={(v) => setNotifs((p) => ({ ...p, weeklyReport: v }))}
            />
          }
        />
      </SettingsCard>

      {/* Shipping */}
      <SettingsCard title="Vận chuyển">
        <SettingRow name="Đơn vị giao hàng" desc="GHN, GHTK, J&T Express" action={<ConfigBtn />} />
        <SettingRow name="Phí vận chuyển" desc="Miễn phí toàn quốc" action={<EditBtn />} />
        <SettingRow name="Thời gian giao hàng" desc="2–4 ngày làm việc" action={<EditBtn />} />
      </SettingsCard>

      {/* Integrations */}
      <SettingsCard title="Tích hợp">
        <SettingRow
          name="Spotify API"
          desc="Hỗ trợ template nhạc – bấm mở thẳng Spotify"
          action={<ConnectedBadge />}
        />
        <SettingRow
          name="Google Analytics"
          desc="Phân tích hành vi người dùng"
          action={<ConnectedBadge />}
        />
        <SettingRow
          name="Facebook Pixel"
          desc="Theo dõi chuyển đổi quảng cáo"
          action={<ConnectBtn />}
        />
        <SettingRow name="Zalo OA" desc="Gửi thông báo đơn hàng qua Zalo" action={<ConnectBtn />} />
      </SettingsCard>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-4">
      <h3 className="mb-3 border-b border-black/[0.06] pb-2 text-[13px] font-semibold text-gray-800">
        {title}
      </h3>
      <div className="divide-y divide-black/[0.05]">{children}</div>
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
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[13px] text-gray-700">{name}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{desc}</p>
      </div>
      <div className="ml-4 flex-shrink-0">{action}</div>
    </div>
  );
}

function EditBtn() {
  return (
    <button className="rounded-lg border border-black/[0.08] px-2.5 py-1 text-[11px] text-gray-500 transition-colors hover:bg-gray-50">
      Sửa
    </button>
  );
}

function ConfigBtn() {
  return (
    <button className="rounded-lg border border-black/[0.08] px-2.5 py-1 text-[11px] text-gray-500 transition-colors hover:bg-gray-50">
      Cấu hình
    </button>
  );
}

function ConnectBtn() {
  return (
    <button className="rounded-lg bg-[#1a1a2e] px-2.5 py-1 text-[11px] text-white transition-colors hover:bg-[#2a2a4e]">
      Kết nối
    </button>
  );
}

function ConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Đã kết nối
    </span>
  );
}
