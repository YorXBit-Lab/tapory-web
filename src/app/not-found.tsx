import Link from 'next/link';
import { noIndexRobots } from '@/libs/seo';

export const metadata = {
  title: 'Không tìm thấy – Góc Chạm',
  robots: noIndexRobots,
};

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4 text-center">
      <div className="relative flex flex-col items-center gap-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-8 -right-20 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

        {/* Icon */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-elevated shadow-sm">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-content3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M11 8v4M11 15h.01" />
          </svg>
        </div>

        {/* Text */}
        <div className="relative z-10 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
          <h1 className="text-2xl font-bold text-content1">Không tìm thấy trang</h1>
          <p className="max-w-xs text-sm text-content3">
            Link này không tồn tại hoặc đã hết hạn. Kiểm tra lại địa chỉ hoặc quay về trang chủ.
          </p>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex gap-3">
          <Link
            href="/"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Về trang chủ
          </Link>
          <Link
            href="/templates"
            className="rounded-xl border border-border bg-elevated px-5 py-2.5 text-sm font-semibold text-content2 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Xem mẫu
          </Link>
        </div>
      </div>
    </div>
  );
}
