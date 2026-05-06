'use client';

import { Button, Card, Segmented, Tag, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

type Template = {
  id: string;
  emoji: string;
  name: string;
  bg: string;
  orders: number;
  theme: string;
  active: boolean;
};

const TEMPLATES: Template[] = [
  { id: 'grad',  emoji: '🎓', name: 'Tốt nghiệp',        bg: '#f5f0e8', orders: 302, theme: 'Navy + Gold',    active: true },
  { id: 'wed',   emoji: '💍', name: 'Đám cưới',           bg: '#fdf0f4', orders: 218, theme: 'Hồng phấn',     active: true },
  { id: 'bday',  emoji: '🎂', name: 'Sinh nhật',          bg: '#f0f7ff', orders: 156, theme: 'Confetti động', active: true },
  { id: 'anni',  emoji: '💕', name: 'Kỷ niệm ngày yêu',  bg: '#fff5f5', orders: 104, theme: 'Đỏ + Gold',     active: true },
  { id: 'music', emoji: '🎵', name: 'Nhạc Spotify',       bg: '#f0faf5', orders: 76,  theme: 'Link bài hát',  active: true },
];

const STATS = [
  { label: 'Tổng template',            value: '5'            },
  { label: 'Đang hoạt động',           value: '5'            },
  { label: 'Tổng đơn dùng template',   value: '856'          },
  { label: 'Template phổ biến nhất',   value: '🎓 Tốt nghiệp' },
];

export default function TemplatesPage() {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => (filter === 'active' ? t.active : !t.active));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={[
            { label: 'Tất cả',    value: 'all'    },
            { label: 'Hoạt động', value: 'active' },
            { label: 'Ẩn',        value: 'hidden' },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as string)}
        />
        <Button type="primary">
          + Tạo template mới
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visible.map((t) => (
          <Card
            key={t.id}
            hoverable
            cover={
              <div
                className="flex h-20 items-center justify-center text-3xl"
                style={{ background: t.bg }}
              >
                {t.emoji}
              </div>
            }
          >
            <div className="mb-2">
              <Text strong className="text-sm block">{t.name}</Text>
              <Text type="secondary" className="text-xs">{t.theme}</Text>
            </div>
            <div className="flex items-center justify-between">
              <Tag color="green" bordered={false}>Hoạt động</Tag>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">{t.orders} đơn</Text>
                <Button type="link" size="small" style={{ padding: 0 }}>Sửa</Button>
                <Button type="text" size="small" style={{ padding: 0 }} danger>Ẩn</Button>
              </div>
            </div>
          </Card>
        ))}

        <button className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border transition-all hover:border-primary/50 hover:bg-elevated">
          <Text type="secondary" className="text-2xl font-light">+</Text>
          <Text type="secondary" className="text-xs">Thêm template mới</Text>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <Card key={label} size="small">
            <Text type="secondary" className="mb-1 block text-xs">{label}</Text>
            <Text strong className="text-lg">{value}</Text>
          </Card>
        ))}
      </div>
    </div>
  );
}
