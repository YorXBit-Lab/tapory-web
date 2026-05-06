'use client';

import { Button, Card, Input, Select, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { StatCard, STATUS_TAG } from '@/components/dashboard';

const { Text } = Typography;

type Memory = {
  url: string;
  customer: string;
  template: string;
  title: string;
  views: number;
  updated: string;
  customized: boolean;
};

const MEMORIES: Memory[] = [
  { url: '/view/ORD1891', customer: 'Trần Văn Minh',  template: '💍', title: 'Ngày cưới 12/12/2025',  views: 47, updated: '03/05/2026', customized: true  },
  { url: '/view/ORD1890', customer: 'Lê Thị Hoa',     template: '🎂', title: 'Happy 25th Birthday!',   views: 23, updated: '02/05/2026', customized: true  },
  { url: '/view/ORD1889', customer: 'Phạm Quốc Bảo',  template: '🎵', title: 'Gửi em bài hát này',     views: 8,  updated: '04/05/2026', customized: true  },
  { url: '/view/ORD1892', customer: 'Nguyễn Thị Mai', template: '🎓', title: '—',                       views: 0,  updated: '—',          customized: false },
  { url: '/view/ORD1887', customer: 'Vũ Mạnh Hùng',   template: '🎓', title: '—',                       views: 0,  updated: '—',          customized: false },
];

const VIEW_STATS = [
  { label: '💍 Đám cưới',   views: 5240, total: 12400, color: '#D4537E' },
  { label: '🎓 Tốt nghiệp', views: 3870, total: 12400, color: '#e8c14b' },
  { label: '🎂 Sinh nhật',  views: 1890, total: 12400, color: '#378ADD' },
  { label: '💕 Kỷ niệm',   views: 860,  total: 12400, color: '#E24B4A' },
  { label: '🎵 Spotify',    views: 540,  total: 12400, color: '#1D9E75' },
];

const columns: ColumnsType<Memory> = [
  {
    title: 'URL',
    dataIndex: 'url',
    render: (v: string) => (
      <Text className="font-mono text-xs text-primary">{v}</Text>
    ),
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    sorter: (a, b) => a.customer.localeCompare(b.customer, 'vi'),
  },
  {
    title: 'Template',
    dataIndex: 'template',
    filters: [
      { text: '💍 Đám cưới',   value: '💍' },
      { text: '🎂 Sinh nhật',  value: '🎂' },
      { text: '🎵 Spotify',    value: '🎵' },
      { text: '🎓 Tốt nghiệp', value: '🎓' },
    ],
    onFilter: (value, record) => record.template === value,
    render: (v: string) => <span className="text-base">{v}</span>,
  },
  {
    title: 'Tiêu đề kỷ niệm',
    dataIndex: 'title',
    render: (v: string) => <Text type="secondary">{v}</Text>,
  },
  {
    title: 'Lượt xem',
    dataIndex: 'views',
    sorter: (a, b) => a.views - b.views,
    defaultSortOrder: 'descend',
    render: (v: number) => <Text strong>{v}</Text>,
  },
  {
    title: 'Cập nhật cuối',
    dataIndex: 'updated',
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'customized',
    filters: [
      { text: 'Đã tùy chỉnh',   value: 'true'  },
      { text: 'Chưa tùy chỉnh', value: 'false' },
    ],
    onFilter: (value, record) => String(record.customized) === value,
    render: (customized: boolean) => {
      const s = STATUS_TAG[customized ? 'done' : 'pending'];
      return <Tag color={s.color}>{s.label}</Tag>;
    },
  },
  {
    title: 'Hành động',
    render: (_: unknown, record) => (
      <div className="flex gap-2">
        <Button type="link" size="small" style={{ padding: 0 }}>Xem</Button>
        {!record.customized && (
          <Button
            type="link"
            size="small"
            style={{ padding: 0, color: 'var(--color-warning)' }}
          >
            Nhắc nhở
          </Button>
        )}
      </div>
    ),
  },
];

export default function MemoriesPage() {
  const [search, setSearch]           = useState('');
  const [customizedFilter, setCustomizedFilter] = useState<string | null>(null);

  const visible = MEMORIES.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.customer.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.url.toLowerCase().includes(q);
    const matchCustomized =
      customizedFilter === null || String(m.customized) === customizedFilter;
    return matchSearch && matchCustomized;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Đã tùy chỉnh"       value="734"   delta="82% tổng số"          deltaType="up"   />
        <StatCard label="Chưa tùy chỉnh"      value="158"   delta="18% — cần nhắc nhở"  deltaType="down" />
        <StatCard label="Tổng lượt xem NFC"   value="12.4K" delta="↑ 340 lượt tuần này" deltaType="up"   />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm khách hàng, tiêu đề, URL..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            style={{ width: 260 }}
          />
          <Select
            placeholder="Trạng thái tùy chỉnh"
            allowClear
            onChange={(v) => setCustomizedFilter(v ?? null)}
            size="small"
            style={{ width: 180 }}
            options={[
              { label: 'Đã tùy chỉnh',   value: 'true'  },
              { label: 'Chưa tùy chỉnh', value: 'false' },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="url"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card title="Lượt xem theo template">
        <div className="space-y-2.5">
          {VIEW_STATS.map(({ label, views, total, color }) => (
            <div key={label} className="flex items-center gap-3">
              <Text type="secondary" className="w-32 flex-shrink-0 text-xs">{label}</Text>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-divider">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(views / total) * 100}%`, background: color }}
                />
              </div>
              <Text strong className="w-14 text-right text-xs">{views.toLocaleString()}</Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
