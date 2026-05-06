'use client';

import { Button, Card, Input, Select, Table, Tag, Typography, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { StatCard, STATUS_TAG, type StatusKey } from '@/components/dashboard';

const { Text } = Typography;

type NfcChip = {
  id: string;
  url: string;
  order: string;
  status: StatusKey;
  scans: number;
  lastScan: string;
};

const NFC_CHIPS: NfcChip[] = [
  { id: 'NFC-A4F2-7X', url: '/view/ORD1892', order: '#ORD1892', status: 'pending', scans: 0,  lastScan: '—'         },
  { id: 'NFC-B3E1-2K', url: '/view/ORD1891', order: '#ORD1891', status: 'done',    scans: 47, lastScan: '05/05/2026' },
  { id: 'NFC-C9D5-4M', url: '/view/ORD1890', order: '#ORD1890', status: 'done',    scans: 23, lastScan: '04/05/2026' },
  { id: 'NFC-D7F3-9R', url: '/view/ORD1889', order: '#ORD1889', status: 'active',  scans: 0,  lastScan: '—'         },
  { id: 'NFC-E5G1-3T', url: '/view/ORD1888', order: '#ORD1888', status: 'cancel',  scans: 2,  lastScan: '01/05/2026' },
  { id: 'NFC-F8H2-6W', url: '/view/ORD1887', order: '#ORD1887', status: 'new',     scans: 0,  lastScan: '—'         },
];

const SCAN_DATA = [
  { day: 'T2', scans: 180 },
  { day: 'T3', scans: 210 },
  { day: 'T4', scans: 165 },
  { day: 'T5', scans: 245 },
  { day: 'T6', scans: 190 },
  { day: 'T7', scans: 280 },
  { day: 'CN', scans: 241, highlight: true },
];

const MAX_SCANS = 280;

const columns: ColumnsType<NfcChip> = [
  {
    title: 'Chip ID',
    dataIndex: 'id',
    render: (v: string) => <Text className="font-mono text-xs">{v}</Text>,
  },
  {
    title: 'URL được lập trình',
    dataIndex: 'url',
    render: (v: string) => (
      <Text className="text-xs text-primary">tapory.com{v}</Text>
    ),
  },
  {
    title: 'Đơn hàng',
    dataIndex: 'order',
    render: (v: string) => <Text className="font-mono text-xs">{v}</Text>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    filters: Object.entries(STATUS_TAG).map(([value, { label }]) => ({ text: label, value })),
    onFilter: (value, record) => record.status === value,
    render: (status: StatusKey) => {
      const s = STATUS_TAG[status];
      return <Tag color={s.color}>{s.label}</Tag>;
    },
  },
  {
    title: 'Lượt quét',
    dataIndex: 'scans',
    align: 'center',
    sorter: (a, b) => a.scans - b.scans,
    defaultSortOrder: 'descend',
    render: (v: number) => <Text strong>{v}</Text>,
  },
  {
    title: 'Lần quét cuối',
    dataIndex: 'lastScan',
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  {
    title: 'Hành động',
    render: () => (
      <div className="flex gap-2">
        <Button type="link" size="small" style={{ padding: 0 }}>Xem</Button>
        <Button type="text" size="small" style={{ padding: 0 }}>Lập trình lại</Button>
      </div>
    ),
  },
];

export default function NfcPage() {
  const { token } = theme.useToken();
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey | null>(null);

  const visible = NFC_CHIPS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      c.order.toLowerCase().includes(q) ||
      c.url.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng chip đã bán"   value="892"  delta="↑ 47 tháng này" deltaType="up"   />
        <StatCard label="Đang hoạt động"      value="734"  delta="82%"            deltaType="up"   />
        <StatCard label="Chưa kích hoạt"      value="158"  delta="18%"            deltaType="down" />
        <StatCard label="Lượt quét hôm nay"   value="241"  delta="↑ 12%"         deltaType="up"   />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm chip ID, mã đơn..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            style={{ width: 220 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            onChange={(v) => setStatusFilter(v ?? null)}
            size="small"
            style={{ width: 150 }}
            options={Object.entries(STATUS_TAG).map(([value, { label }]) => ({ label, value }))}
          />
        </div>
        <Table
          columns={columns}
          dataSource={visible}
          rowKey="id"
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

      <Card title="Hoạt động quét 7 ngày">
        <div className="flex h-24 items-end gap-2">
          {SCAN_DATA.map(({ day, scans, highlight }) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <Text type="secondary" className="text-xs">{scans}</Text>
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${(scans / MAX_SCANS) * 70}px`,
                  background: highlight ? token.colorPrimary : token.colorFill,
                }}
              />
              <Text type="secondary" className="text-xs">{day}</Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
