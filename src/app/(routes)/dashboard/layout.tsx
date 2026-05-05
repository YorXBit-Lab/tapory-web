'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  {
    section: 'Tổng quan',
    items: [{ href: '/dashboard', label: 'Tổng quan', icon: GridIcon }],
  },
  {
    section: 'Kinh doanh',
    items: [
      { href: '/dashboard/orders', label: 'Đơn hàng', icon: OrderIcon, badge: 12 },
      { href: '/dashboard/users', label: 'Khách hàng', icon: UserIcon },
    ],
  },
  {
    section: 'Nội dung',
    items: [
      { href: '/dashboard/templates', label: 'Templates', icon: TemplateIcon },
      { href: '/dashboard/memories', label: 'Kỷ niệm khách hàng', icon: MemoryIcon },
      { href: '/dashboard/nfcs', label: 'Chip NFC', icon: NfcIcon },
    ],
  },
  {
    section: 'Hệ thống',
    items: [{ href: '/dashboard/settings', label: 'Cài đặt', icon: SettingIcon }],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f5f0] font-sans">
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r border-black/[0.07] bg-white transition-all duration-200"
        style={{ width: sidebarOpen ? 220 : 60 }}
      >
        {/* Logo */}
        <div className="flex h-[52px] flex-shrink-0 items-center gap-2 border-b border-black/[0.07] px-4">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#1a1a2e]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#e8c14b]" />
          </div>
          {sidebarOpen && (
            <span className="text-[15px] font-semibold tracking-tight text-[#1a1a2e]">Tapory</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <CollapseIcon open={sidebarOpen} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((group) => (
            <div key={group.section} className="mb-3">
              {sidebarOpen && (
                <p className="mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  {group.section}
                </p>
              )}
              {group.items.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all ${
                    isActive(href)
                      ? 'bg-[#1a1a2e] text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${isActive(href) ? 'opacity-100' : 'opacity-60'}`}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="rounded-full bg-[#e8c14b] px-1.5 py-0.5 text-[10px] leading-none font-semibold text-[#1a1a2e]">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin footer */}
        <div className="flex-shrink-0 border-t border-black/[0.07] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] font-semibold text-[#e8c14b]">
              TA
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-gray-800">Tapory Admin</p>
                <p className="text-[10px] text-gray-400">Quản trị viên</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[52px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-5">
          <h1 className="flex-1 text-[14px] font-semibold text-gray-800">
            {getPageTitle(pathname)}
          </h1>
          <div className="flex w-56 items-center gap-2 rounded-lg border border-black/[0.07] bg-gray-50 px-3 py-1.5 text-[12px] text-gray-400">
            <SearchIcon className="h-3 w-3 flex-shrink-0" />
            Tìm kiếm...
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-black/[0.08] px-3 py-1.5 text-[12px] text-gray-500 transition-colors hover:bg-gray-50">
              Xuất CSV
            </button>
            <button className="rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[12px] text-white transition-colors hover:bg-[#2a2a4e]">
              + Thêm mới
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Tổng quan',
    '/dashboard/orders': 'Đơn hàng',
    '/dashboard/users': 'Khách hàng',
    '/dashboard/templates': 'Quản lý Templates',
    '/dashboard/memories': 'Kỷ niệm khách hàng',
    '/dashboard/nfc': 'Chip NFC',
    '/dashboard/settings': 'Cài đặt',
  };
  return map[pathname] ?? 'Dashboard';
}

/* ── Icons ── */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}
function OrderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h12a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1zm1 3v6h10V5H3zm1 1h8v1H4V6zm0 2h5v1H4V8z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 13c0-3.314 2.686-5 6-5s6 1.686 6 5H2z" />
    </svg>
  );
}
function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="4" rx="1" />
      <rect x="1" y="7" width="6" height="8" rx="1" />
      <rect x="9" y="7" width="6" height="8" rx="1" />
    </svg>
  );
}
function MemoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a5 5 0 100 10A5 5 0 008 1zM8 4a2 2 0 110 4A2 2 0 018 4z" />
      <rect x="3" y="12" width="10" height="2" rx="1" />
    </svg>
  );
}
function NfcIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
function SettingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 5a3 3 0 100 6A3 3 0 008 5zm0 1a2 2 0 110 4A2 2 0 018 6z" />
      <path d="M6.5 0h3l.4 1.6a5.5 5.5 0 011.3.75l1.55-.65 2.12 2.12-.65 1.55c.3.4.56.83.75 1.3L16 7v3l-1.58.38c-.19.47-.45.9-.75 1.3l.65 1.55-2.12 2.12-1.55-.65c-.4.3-.83.56-1.3.75L9 16H6l-.38-1.58a5.5 5.5 0 01-1.3-.75l-1.55.65L.65 12.2l.65-1.55A5.5 5.5 0 011.05 9.4L0 9V6l1.58-.38c.19-.47.45-.9.75-1.3L1.68 2.77 3.8.65l1.55.65A5.5 5.5 0 016.65 1L6.5 0z" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.415l-3.868-3.833zM6.5 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
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
