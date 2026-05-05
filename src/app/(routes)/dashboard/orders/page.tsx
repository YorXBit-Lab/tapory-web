'use client';

import { Badge, Card, FilterTabs, Table, Td, Tr } from '@/components/dashboard';
import { useState } from 'react';

type OrderStatus = 'pending' | 'active' | 'done' | 'cancel' | 'new';

const ALL_ORDERS = [
  {
    id: '#ORD1892',
    customer: 'Nguyễn Thị Mai',
    template: '🎓 Tốt nghiệp',
    address: 'Q.1, TP.HCM',
    date: '05/05/2026',
    status: 'pending' as OrderStatus,
    nfcId: 'NFC-A4F2-7X',
    customized: false,
  },
  {
    id: '#ORD1891',
    customer: 'Trần Văn Minh',
    template: '💍 Đám cưới',
    address: 'Q.Bình Thạnh',
    date: '05/05/2026',
    status: 'done' as OrderStatus,
    nfcId: 'NFC-B3E1-2K',
    customized: true,
  },
  {
    id: '#ORD1890',
    customer: 'Lê Thị Hoa',
    template: '🎂 Sinh nhật',
    address: 'Q.7, TP.HCM',
    date: '04/05/2026',
    status: 'done' as OrderStatus,
    nfcId: 'NFC-C9D5-4M',
    customized: true,
  },
  {
    id: '#ORD1889',
    customer: 'Phạm Quốc Bảo',
    template: '🎵 Spotify',
    address: 'Thủ Đức',
    date: '04/05/2026',
    status: 'active' as OrderStatus,
    nfcId: 'NFC-D7F3-9R',
    customized: true,
  },
  {
    id: '#ORD1888',
    customer: 'Hoàng Thu Thảo',
    template: '💕 Kỷ niệm',
    address: 'Q.3, TP.HCM',
    date: '03/05/2026',
    status: 'cancel' as OrderStatus,
    nfcId: 'NFC-E5G1-3T',
    customized: false,
  },
  {
    id: '#ORD1887',
    customer: 'Vũ Mạnh Hùng',
    template: '🎓 Tốt nghiệp',
    address: 'Q.Gò Vấp',
    date: '03/05/2026',
    status: 'new' as OrderStatus,
    nfcId: 'NFC-F8H2-6W',
    customized: false,
  },
];

const FILTER_TABS = [
  { label: 'Tất cả', value: 'all', count: 142 },
  { label: 'Mới', value: 'new', count: 6 },
  { label: 'Chờ xử lý', value: 'pending', count: 12 },
  { label: 'Đang giao', value: 'active', count: 28 },
  { label: 'Hoàn thành', value: 'done', count: 96 },
  { label: 'Đã hủy', value: 'cancel', count: 6 },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(ALL_ORDERS[0]);

  const visible = filter === 'all' ? ALL_ORDERS : ALL_ORDERS.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <FilterTabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />

      <Card>
        <Table
          headers={[
            'Mã đơn',
            'Khách hàng',
            'Template',
            'Địa chỉ',
            'Ngày đặt',
            'Giá trị',
            'Trạng thái',
            'Hành động',
          ]}
        >
          {visible.map((o) => (
            <Tr key={o.id}>
              <Td>
                <button
                  onClick={() => setSelected(o)}
                  className="font-mono text-[11px] text-blue-600 hover:underline"
                >
                  {o.id}
                </button>
              </Td>
              <Td>{o.customer}</Td>
              <Td>{o.template}</Td>
              <Td className="text-gray-400">{o.address}</Td>
              <Td className="text-gray-400">{o.date}</Td>
              <Td className="font-medium">189.000đ</Td>
              <Td>
                <Badge variant={o.status} />
              </Td>
              <Td>
                <span className="cursor-pointer text-[11px] text-gray-400 hover:text-gray-700">
                  Xem · Sửa
                </span>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Order detail panel */}
      {selected && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailGroup title={`Chi tiết đơn ${selected.id}`}>
            <DetailRow k="Mã đơn" v={selected.id} />
            <DetailRow k="Chip NFC ID" v={selected.nfcId} mono />
            <DetailRow k="URL kỷ niệm" v={`tapory.com/view/${selected.id.replace('#', '')}`} blue />
            <DetailRow k="Đã tùy chỉnh" v={selected.customized ? '✓ Có' : '✗ Chưa'} />
            <DetailRow k="Template" v={selected.template} />
          </DetailGroup>

          <DetailGroup title="Thông tin giao hàng">
            <DetailRow k="Người nhận" v={selected.customer} />
            <DetailRow k="Địa chỉ" v={selected.address} />
            <DetailRow k="Ngày đặt" v={selected.date} />
            <DetailRow k="Đơn vị ship" v="GHN Express" />
            <DetailRow k="Trạng thái" v={<Badge variant={selected.status} />} />
          </DetailGroup>
        </div>
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="mb-3 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({
  k,
  v,
  mono,
  blue,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  blue?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-gray-500">{k}</span>
      <span
        className={`text-[12px] font-medium ${
          blue ? 'text-blue-600' : 'text-gray-800'
        } ${mono ? 'font-mono text-[11px]' : ''}`}
      >
        {v}
      </span>
    </div>
  );
}
