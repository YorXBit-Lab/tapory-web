import { Avatar, Card, StatCard, Table, Td, Tr } from '@/components/dashboard';

const USERS = [
  {
    name: 'Nguyễn Thị Mai',
    initials: 'NT',
    email: 'mai.nt@gmail.com',
    phone: '0909 123 456',
    orders: 3,
    total: '567.000đ',
    joined: 'Jan 2026',
  },
  {
    name: 'Trần Văn Minh',
    initials: 'TV',
    email: 'minh.tv@gmail.com',
    phone: '0912 345 678',
    orders: 2,
    total: '378.000đ',
    joined: 'Feb 2026',
  },
  {
    name: 'Lê Thị Hoa',
    initials: 'LH',
    email: 'hoa.le@gmail.com',
    phone: '0898 765 432',
    orders: 1,
    total: '189.000đ',
    joined: 'Apr 2026',
  },
  {
    name: 'Phạm Quốc Bảo',
    initials: 'PB',
    email: 'bao.pq@gmail.com',
    phone: '0876 543 210',
    orders: 1,
    total: '189.000đ',
    joined: 'May 2026',
  },
  {
    name: 'Hoàng Thu Thảo',
    initials: 'HT',
    email: 'thao.ht@gmail.com',
    phone: '0933 111 222',
    orders: 2,
    total: '378.000đ',
    joined: 'Mar 2026',
  },
  {
    name: 'Vũ Mạnh Hùng',
    initials: 'VH',
    email: 'hung.vm@gmail.com',
    phone: '0855 444 333',
    orders: 1,
    total: '189.000đ',
    joined: 'May 2026',
  },
];

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng khách hàng" value="892" delta="↑ 47 tháng này" deltaType="up" />
        <StatCard label="Đã mua lại" value="134" delta="15% quay lại" deltaType="up" />
        <StatCard label="Trung bình đơn/KH" value="1.2" />
        <StatCard label="Chi tiêu TB" value="227K" />
      </div>

      <Card>
        <Table
          headers={[
            'Khách hàng',
            'Email',
            'Số điện thoại',
            'Số đơn',
            'Tổng chi tiêu',
            'Đăng ký',
            'Hành động',
          ]}
        >
          {USERS.map((u) => (
            <Tr key={u.email}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar initials={u.initials} />
                  <span className="font-medium text-gray-800">{u.name}</span>
                </div>
              </Td>
              <Td className="text-[11px] text-gray-500">{u.email}</Td>
              <Td className="text-gray-600">{u.phone}</Td>
              <Td className="text-center font-medium">{u.orders}</Td>
              <Td className="font-medium">{u.total}</Td>
              <Td className="text-[11px] text-gray-400">{u.joined}</Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-[11px] text-blue-500 hover:underline">Xem</button>
                  <button className="text-[11px] text-gray-400 hover:text-gray-600">
                    Nhắn tin
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
