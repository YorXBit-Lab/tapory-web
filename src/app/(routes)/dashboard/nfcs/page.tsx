import { Badge, Card, StatCard, Table, Td, Tr } from '@/components/dashboard';

const NFC_CHIPS = [
  {
    id: 'NFC-A4F2-7X',
    url: '/view/ORD1892',
    order: '#ORD1892',
    status: 'pending' as const,
    scans: 0,
    lastScan: '—',
  },
  {
    id: 'NFC-B3E1-2K',
    url: '/view/ORD1891',
    order: '#ORD1891',
    status: 'done' as const,
    scans: 47,
    lastScan: '05/05/2026',
  },
  {
    id: 'NFC-C9D5-4M',
    url: '/view/ORD1890',
    order: '#ORD1890',
    status: 'done' as const,
    scans: 23,
    lastScan: '04/05/2026',
  },
  {
    id: 'NFC-D7F3-9R',
    url: '/view/ORD1889',
    order: '#ORD1889',
    status: 'active' as const,
    scans: 0,
    lastScan: '—',
  },
  {
    id: 'NFC-E5G1-3T',
    url: '/view/ORD1888',
    order: '#ORD1888',
    status: 'cancel' as const,
    scans: 2,
    lastScan: '01/05/2026',
  },
  {
    id: 'NFC-F8H2-6W',
    url: '/view/ORD1887',
    order: '#ORD1887',
    status: 'new' as const,
    scans: 0,
    lastScan: '—',
  },
];

export default function NfcPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng chip đã bán" value="892" delta="↑ 47 tháng này" deltaType="up" />
        <StatCard label="Đang hoạt động" value="734" delta="82%" deltaType="up" />
        <StatCard label="Chưa kích hoạt" value="158" delta="18%" deltaType="down" />
        <StatCard label="Lượt quét hôm nay" value="241" delta="↑ 12%" deltaType="up" />
      </div>

      <Card>
        <Table
          headers={[
            'Chip ID',
            'URL được lập trình',
            'Đơn hàng',
            'Trạng thái',
            'Lượt quét',
            'Lần quét cuối',
            'Hành động',
          ]}
        >
          {NFC_CHIPS.map((c) => (
            <Tr key={c.id}>
              <Td className="font-mono text-[11px]">{c.id}</Td>
              <Td className="text-[11px] text-blue-600">tapory.com{c.url}</Td>
              <Td className="font-mono text-[11px]">{c.order}</Td>
              <Td>
                <Badge variant={c.status} />
              </Td>
              <Td className="text-center font-medium">{c.scans}</Td>
              <Td className="text-[11px] text-gray-400">{c.lastScan}</Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-[11px] text-blue-500 hover:underline">Xem</button>
                  <button className="text-[11px] text-gray-400 hover:text-gray-600">
                    Lập trình lại
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Scan activity */}
      <Card>
        <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Hoạt động quét 7 ngày</h3>
        <div className="flex h-24 items-end gap-2">
          {[
            { day: 'T2', scans: 180 },
            { day: 'T3', scans: 210 },
            { day: 'T4', scans: 165 },
            { day: 'T5', scans: 245 },
            { day: 'T6', scans: 190 },
            { day: 'T7', scans: 280 },
            { day: 'CN', scans: 241, highlight: true },
          ].map(({ day, scans, highlight }) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] font-medium text-gray-500">{scans}</span>
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${(scans / 280) * 70}px`,
                  background: highlight ? '#e8c14b' : '#1a1a2e',
                  opacity: highlight ? 1 : 0.15,
                }}
              />
              <span className="text-[9px] text-gray-400">{day}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
