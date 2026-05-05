import { Card, Table, Tr, Td, Badge, StatCard } from '@/components/dashboard';

const MEMORIES = [
  {
    url: '/view/ORD1891',
    customer: 'Trần Văn Minh',
    template: '💍',
    title: 'Ngày cưới 12/12/2025',
    views: 47,
    updated: '03/05/2026',
    customized: true,
  },
  {
    url: '/view/ORD1890',
    customer: 'Lê Thị Hoa',
    template: '🎂',
    title: 'Happy 25th Birthday!',
    views: 23,
    updated: '02/05/2026',
    customized: true,
  },
  {
    url: '/view/ORD1889',
    customer: 'Phạm Quốc Bảo',
    template: '🎵',
    title: 'Gửi em bài hát này',
    views: 8,
    updated: '04/05/2026',
    customized: true,
  },
  {
    url: '/view/ORD1892',
    customer: 'Nguyễn Thị Mai',
    template: '🎓',
    title: '—',
    views: 0,
    updated: '—',
    customized: false,
  },
  {
    url: '/view/ORD1887',
    customer: 'Vũ Mạnh Hùng',
    template: '🎓',
    title: '—',
    views: 0,
    updated: '—',
    customized: false,
  },
];

export default function MemoriesPage() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Đã tùy chỉnh" value="734" delta="82% tổng số" deltaType="up" />
        <StatCard label="Chưa tùy chỉnh" value="158" delta="18% — cần nhắc nhở" deltaType="down" />
        <StatCard
          label="Tổng lượt xem NFC"
          value="12.4K"
          delta="↑ 340 lượt tuần này"
          deltaType="up"
        />
      </div>

      <Card>
        <Table
          headers={[
            'URL',
            'Khách hàng',
            'Template',
            'Tiêu đề kỷ niệm',
            'Lượt xem',
            'Cập nhật cuối',
            'Trạng thái',
            'Hành động',
          ]}
        >
          {MEMORIES.map((m) => (
            <Tr key={m.url}>
              <Td className="font-mono text-[11px] text-blue-600">{m.url}</Td>
              <Td>{m.customer}</Td>
              <Td className="text-base">{m.template}</Td>
              <Td className="text-gray-500">{m.title}</Td>
              <Td className="font-medium">{m.views}</Td>
              <Td className="text-[11px] text-gray-400">{m.updated}</Td>
              <Td>
                <Badge variant={m.customized ? 'done' : 'pending'} />
              </Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-[11px] text-blue-500 hover:underline">Xem</button>
                  {!m.customized && (
                    <button className="text-[11px] text-amber-600 hover:underline">Nhắc nhở</button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Views breakdown */}
      <Card>
        <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Lượt xem theo template</h3>
        <div className="space-y-2.5">
          {[
            { label: '💍 Đám cưới', views: 5240, total: 12400, color: '#D4537E' },
            { label: '🎓 Tốt nghiệp', views: 3870, total: 12400, color: '#e8c14b' },
            { label: '🎂 Sinh nhật', views: 1890, total: 12400, color: '#378ADD' },
            { label: '💕 Kỷ niệm', views: 860, total: 12400, color: '#E24B4A' },
            { label: '🎵 Spotify', views: 540, total: 12400, color: '#1D9E75' },
          ].map(({ label, views, total, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-32 flex-shrink-0 text-[12px] text-gray-600">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(views / total) * 100}%`, background: color }}
                />
              </div>
              <span className="w-14 text-right text-[11px] font-semibold text-gray-700">
                {views.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
