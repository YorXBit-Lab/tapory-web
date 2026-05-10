'use client';

import { useEffect } from 'react';
import { Avatar, Button, Input, Layout, Menu, Typography, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { OrderAPI } from '@/services/OrderAPI';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

/* ── Nav config ── */
const NAV_ITEMS = [
  {
    type: 'group' as const,
    label: 'Tổng quan',
    children: [{ key: '/dashboard', icon: <GridIcon />, label: 'Tổng quan' }],
  },
  {
    type: 'group' as const,
    label: 'Kinh doanh',
    children: [
      { key: '/dashboard/orders', icon: <OrderIcon />, label: 'Đơn hàng' },
      { key: '/dashboard/users', icon: <UserIcon />, label: 'Khách hàng' },
    ],
  },
  {
    type: 'group' as const,
    label: 'Nội dung',
    children: [
      { key: '/dashboard/templates', icon: <TemplateIcon />, label: 'Templates' },
      { key: '/dashboard/memories', icon: <MemoryIcon />, label: 'Kỷ niệm khách hàng' },
      { key: '/dashboard/nfcs', icon: <NfcIcon />, label: 'Chip NFC' },
    ],
  },
  {
    type: 'group' as const,
    label: 'Hệ thống',
    children: [{ key: '/dashboard/settings', icon: <SettingIcon />, label: 'Cài đặt' }],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/orders': 'Đơn hàng',
  '/dashboard/users': 'Khách hàng',
  '/dashboard/templates': 'Quản lý Templates',
  '/dashboard/memories': 'Kỷ niệm khách hàng',
  '/dashboard/nfcs': 'Chip NFC',
  '/dashboard/settings': 'Cài đặt',
};

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, adminData, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAPI.list(),
    staleTime: 60_000,
    enabled: isAdmin,
  });
  const newOrderCount = orders.filter(o => o.status === 'new').length;

  const isLoginPage = pathname === '/dashboard/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAdmin) {
      router.replace('/dashboard/login');
    }
  }, [isAdmin, isLoading, router, isLoginPage]);

  // Login page renders its own layout — skip the sidebar shell entirely
  if (isLoginPage) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-indigo-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const activeKey =
    Object.keys(PAGE_TITLES)
      .filter((k) => (k === '/dashboard' ? pathname === k : pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length)[0] ?? '/dashboard';
  const dynamicBadge: Record<string, number> = newOrderCount > 0
    ? { '/dashboard/orders': newOrderCount }
    : {};

  const menuItems = NAV_ITEMS.map((group) => ({
    type: 'group' as const,
    label: group.label,
    children: group.children.map(({ key, icon, label }) => ({
      key,
      icon: null,
      label: (
        <span className="flex w-full items-center justify-between">
          <span className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </span>
          {dynamicBadge[key] && (
            <span
              className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold"
              style={{ backgroundColor: token.colorPrimary, color: token.colorBgContainer }}
            >
              {dynamicBadge[key]}
            </span>
          )}
        </span>
      ),
    })),
  }));
  return (
    <Layout className="h-screen overflow-hidden font-sans">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={60}
        trigger={null}
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        {/* Logo */}
        <div
          className="flex h-[52px] flex-shrink-0 items-center gap-2.5 px-4"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: token.colorPrimary }}
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: token.colorBgContainer }}
            />
          </div>
          {!collapsed && (
            <Text strong className="text-sm tracking-tight">
              Tapory
            </Text>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-content3 hover:text-content1 ml-auto rounded p-0.5 transition-colors"
          >
            <CollapseIcon open={!collapsed} />
          </button>
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          inlineIndent={16}
          style={{ borderInlineEnd: 'none', marginTop: 4 }}
        />

        {/* Admin footer */}
        <div
          className="absolute right-0 bottom-0 left-0 flex items-center gap-2 p-3"
          style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Avatar
            size={28}
            style={{
              backgroundColor: token.colorPrimary,
              color: token.colorBgContainer,
              fontSize: 10,
              flexShrink: 0,
            }}
          >
            {adminData?.displayName?.slice(0, 2).toUpperCase() ?? 'AD'}
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <Text strong className="block truncate text-xs">
                {adminData?.displayName ?? 'Admin'}
              </Text>
              <Text type="secondary" className="block text-xs">
                {adminData?.role === 'super_admin' ? 'Super Admin' : 'Nhân viên'}
              </Text>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout().then(() => router.replace('/dashboard/login'))}
              title="Đăng xuất"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </Sider>

      {/* ── Main ── */}
      <Layout>
        <Header
          className="flex items-center gap-3"
          style={{
            height: 52,
            lineHeight: '52px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 20px',
          }}
        >
          <h1 className="flex-1 text-sm font-semibold" style={{ color: token.colorText }}>
            {PAGE_TITLES[activeKey] ?? 'Dashboard'}
          </h1>

          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
            className="w-56"
            size="small"
          />

          <div className="flex gap-2">
            <Button size="small">Xuất CSV</Button>
            <Button size="small" type="primary">
              + Thêm mới
            </Button>
          </div>
        </Header>

        <Content className="overflow-y-auto p-5">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AdminAuthProvider>
  );
}

/* ── Icons ── */
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h12a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1zm1 3v6h10V5H3zm1 1h8v1H4V6zm0 2h5v1H4V8z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 13c0-3.314 2.686-5 6-5s6 1.686 6 5H2z" />
    </svg>
  );
}
function TemplateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="4" rx="1" />
      <rect x="1" y="7" width="6" height="8" rx="1" />
      <rect x="9" y="7" width="6" height="8" rx="1" />
    </svg>
  );
}
function MemoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a5 5 0 100 10A5 5 0 008 1zM8 4a2 2 0 110 4A2 2 0 018 4z" />
      <rect x="3" y="12" width="10" height="2" rx="1" />
    </svg>
  );
}
function NfcIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SettingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 5a3 3 0 100 6A3 3 0 008 5zm0 1a2 2 0 110 4A2 2 0 018 6z" />
      <path d="M6.5 0h3l.4 1.6a5.5 5.5 0 011.3.75l1.55-.65 2.12 2.12-.65 1.55c.3.4.56.83.75 1.3L16 7v3l-1.58.38c-.19.47-.45.9-.75 1.3l.65 1.55-2.12 2.12-1.55-.65c-.4.3-.83.56-1.3.75L9 16H6l-.38-1.58a5.5 5.5 0 01-1.3-.75l-1.55.65L.65 12.2l.65-1.55A5.5 5.5 0 011.05 9.4L0 9V6l1.58-.38c.19-.47.45-.9.75-1.3L1.68 2.77 3.8.65l1.55.65A5.5 5.5 0 016.65 1L6.5 0z" />
    </svg>
  );
}
function CollapseIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d={open ? 'M9 7L5 3.5v7L9 7z' : 'M5 7l4-3.5v7L5 7z'} />
    </svg>
  );
}
