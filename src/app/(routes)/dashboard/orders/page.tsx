'use client';

import { Card, Descriptions, Input, Segmented, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { STATUS_TAG, type StatusKey } from '@/components/dashboard';

const { Text } = Typography;

type Order = {
  id: string;
  customer: string;
  template: string;
  address: string;
  date: string;
  status: StatusKey;
  nfcId: string;
  customized: boolean;
};

const ALL_ORDERS: Order[] = [
  { id: '#ORD1892', customer: 'Nguyễn Thị Mai',  template: '🎓 Tốt nghiệp', address: 'Q.1, TP.HCM',  date: '05/05/2026', status: 'pending', nfcId: 'NFC-A4F2-7X', customized: false },
  { id: '#ORD1891', customer: 'Trần Văn Minh',   template: '💍 Đám cưới',   address: 'Q.Bình Thạnh', date: '05/05/2026', status: 'done',    nfcId: 'NFC-B3E1-2K', customized: true  },
  { id: '#ORD1890', customer: 'Lê Thị Hoa',      template: '🎂 Sinh nhật',  address: 'Q.7, TP.HCM',  date: '04/05/2026', status: 'done',    nfcId: 'NFC-C9D5-4M', customized: true  },
  { id: '#ORD1889', customer: 'Phạm Quốc Bảo',   template: '🎵 Spotify',    address: 'Thủ Đức',       date: '04/05/2026', status: 'active',  nfcId: 'NFC-D7F3-9R', customized: true  },
  { id: '#ORD1888', customer: 'Hoàng Thu Thảo',  template: '💕 Kỷ niệm',   address: 'Q.3, TP.HCM',  date: '03/05/2026', status: 'cancel',  nfcId: 'NFC-E5G1-3T', customized: false },
  { id: '#ORD1887', customer: 'Vũ Mạnh Hùng',    template: '🎓 Tốt nghiệp', address: 'Q.Gò Vấp',     date: '03/05/2026', status: 'new',     nfcId: 'NFC-F8H2-6W', customized: false },
];

const FILTER_OPTIONS = [
  { label: 'Tất cả (142)',    value: 'all'     },
  { label: 'Mới (6)',         value: 'new'     },
  { label: 'Chờ xử lý (12)', value: 'pending' },
  { label: 'Đang giao (28)', value: 'active'  },
  { label: 'Hoàn thành (96)', value: 'done'   },
  { label: 'Đã hủy (6)',      value: 'cancel'  },
];

const parseDate = (d: string) => {
  const [dd, mm, yyyy] = d.split('/');
  return new Date(`${yyyy}-${mm}-${dd}`).getTime();
};

const columns: ColumnsType<Order> = [
  {
    title: 'Mã đơn',
    dataIndex: 'id',
    render: (id: string) => (
      <button className="font-mono text-xs text-primary">{id}</button>
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
      { text: '🎓 Tốt nghiệp', value: '🎓 Tốt nghiệp' },
      { text: '💍 Đám cưới',   value: '💍 Đám cưới'   },
      { text: '🎂 Sinh nhật',  value: '🎂 Sinh nhật'  },
      { text: '💕 Kỷ niệm',   value: '💕 Kỷ niệm'   },
      { text: '🎵 Spotify',    value: '🎵 Spotify'    },
    ],
    onFilter: (value, record) => record.template === value,
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  {
    title: 'Ngày đặt',
    dataIndex: 'date',
    sorter: (a, b) => parseDate(a.date) - parseDate(b.date),
    defaultSortOrder: 'descend',
    render: (v: string) => <Text type="secondary" className="text-xs">{v}</Text>,
  },
  {
    title: 'Giá trị',
    render: () => <Text strong>189.000đ</Text>,
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
    title: 'Hành động',
    render: () => (
      <Text type="secondary" className="cursor-pointer text-xs hover:text-content1">
        Xem · Sửa
      </Text>
    ),
  },
];

export default function OrdersPage() {
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(ALL_ORDERS[0]);

  const visible = ALL_ORDERS.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customer.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.template.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const detailColumns = (title: string, items: { label: string; value: React.ReactNode; mono?: boolean }[]) => (
    <Descriptions title={title} bordered size="small" column={1}>
      {items.map(({ label, value, mono }) => (
        <Descriptions.Item key={label} label={label}>
          {mono ? <span className="font-mono text-xs">{value}</span> : value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(v) => setFilter(v as string)}
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm mã đơn, khách hàng..."
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          style={{ width: 220 }}
        />
      </div>

      <Card>
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
          onRow={(record) => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
        />
      </Card>

      {selected && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {detailColumns(`Chi tiết đơn ${selected.id}`, [
            { label: 'Mã đơn',       value: selected.id,                                                                                      mono: true },
            { label: 'Chip NFC ID',  value: selected.nfcId,                                                                                   mono: true },
            { label: 'URL kỷ niệm',  value: <Text className="text-xs text-primary">tapory.com/view/{selected.id.replace('#', '')}</Text> },
            { label: 'Đã tùy chỉnh', value: selected.customized ? '✓ Có' : '✗ Chưa'                                                                      },
            { label: 'Template',     value: selected.template                                                                                              },
          ])}

          {detailColumns('Thông tin giao hàng', [
            { label: 'Người nhận',   value: selected.customer                                                                       },
            { label: 'Địa chỉ',     value: selected.address                                                                        },
            { label: 'Ngày đặt',    value: selected.date                                                                           },
            { label: 'Đơn vị ship', value: 'GHN Express'                                                                          },
            { label: 'Trạng thái',  value: <Tag color={STATUS_TAG[selected.status].color}>{STATUS_TAG[selected.status].label}</Tag> },
          ])}
        </div>
      )}
    </div>
  );
}
