'use client';

import { FilterTabs } from '@/components/dashboard';
import { useState } from 'react';

const TEMPLATES = [
  {
    id: 'grad',
    emoji: '🎓',
    name: 'Tốt nghiệp',
    bg: '#f5f0e8',
    orders: 302,
    theme: 'Navy + Gold',
    active: true,
  },
  {
    id: 'wed',
    emoji: '💍',
    name: 'Đám cưới',
    bg: '#fdf0f4',
    orders: 218,
    theme: 'Hồng phấn',
    active: true,
  },
  {
    id: 'bday',
    emoji: '🎂',
    name: 'Sinh nhật',
    bg: '#f0f7ff',
    orders: 156,
    theme: 'Confetti động',
    active: true,
  },
  {
    id: 'anni',
    emoji: '💕',
    name: 'Kỷ niệm ngày yêu',
    bg: '#fff5f5',
    orders: 104,
    theme: 'Đỏ + Gold',
    active: true,
  },
  {
    id: 'music',
    emoji: '🎵',
    name: 'Nhạc Spotify',
    bg: '#f0faf5',
    orders: 76,
    theme: 'Link bài hát',
    active: true,
  },
];

const FILTER_TABS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hoạt động', value: 'active' },
  { label: 'Ẩn', value: 'hidden' },
];

export default function TemplatesPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />
        <button className="rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[12px] text-white transition-colors hover:bg-[#2a2a4e]">
          + Tạo template mới
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="cursor-pointer overflow-hidden rounded-xl border border-black/[0.07] bg-white transition-colors hover:border-black/20"
          >
            {/* Thumbnail */}
            <div
              className="flex h-20 items-center justify-center text-3xl"
              style={{ background: t.bg }}
            >
              {t.emoji}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-[13px] font-semibold text-gray-800">{t.name}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{t.theme}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-black/[0.05] px-3 pt-2 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-green-700">Hoạt động</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{t.orders} đơn</span>
                <span className="text-[11px] text-gray-400">·</span>
                <button className="text-[11px] text-blue-500 hover:text-blue-700">Sửa</button>
                <button className="text-[11px] text-gray-400 hover:text-gray-600">Ẩn</button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new */}
        <button className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 text-gray-400 transition-all hover:border-black/40 hover:bg-gray-50/50 hover:text-gray-600">
          <span className="text-2xl font-light">+</span>
          <span className="text-[12px]">Thêm template mới</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Tổng template', value: '5' },
          { label: 'Đang hoạt động', value: '5' },
          { label: 'Tổng đơn dùng template', value: '856' },
          { label: 'Template phổ biến nhất', value: '🎓 Tốt nghiệp' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-4">
            <p className="mb-1 text-[11px] text-gray-400">{label}</p>
            <p className="text-[18px] font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
