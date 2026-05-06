import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TEMPLATE_LIST } from '@/configs/constants';
import type { ITemplate } from '@/configs/types';

export const metadata = {
  title: 'Chọn mẫu – Tapory',
};

function TemplateCard({ tpl }: { tpl: ITemplate }) {
  return (
    <Link
      href={`/edit/demo?template=${tpl.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Preview area */}
      <div
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{ backgroundColor: tpl.colors.background }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
          style={{ backgroundColor: tpl.colors.primary }}
        />
        <div
          className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-15"
          style={{ backgroundColor: tpl.colors.secondary }}
        />
        <div
          className="absolute right-6 bottom-6 h-14 w-14 rounded-full opacity-10"
          style={{ backgroundColor: tpl.colors.secondary }}
        />

        {/* Icon */}
        <span className="relative z-10 text-7xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {tpl.icon}
        </span>

        {/* Occasion badge */}
        <span
          className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
          style={{ backgroundColor: tpl.colors.primary }}
        >
          {tpl.occasion}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-base font-semibold text-content1">{tpl.name}</p>
          <p className="mt-0.5 text-sm text-content3">Mẫu thiết kế kỷ niệm</p>
        </div>

        {/* Color palette */}
        <div className="flex items-center gap-1.5">
          {[tpl.colors.primary, tpl.colors.secondary, tpl.colors.background].map((c) => (
            <span
              key={c}
              className="h-4 w-4 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="ml-1 text-xs text-content4">Bảng màu</span>
        </div>

        {/* CTA */}
        <div
          className="mt-auto flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity duration-200 group-hover:opacity-90"
          style={{ backgroundColor: tpl.colors.primary }}
        >
          Dùng mẫu này →
        </div>
      </div>
    </Link>
  );
}

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 text-center">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

          {/* Animated blobs */}
          <div className="animate-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="animate-blob animation-delay-2 pointer-events-none absolute -right-20 top-4 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
          <div className="animate-blob animation-delay-4 pointer-events-none absolute -bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="animate-blob animation-delay-6 pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-secondary/15 blur-2xl" />

          {/* Content */}
          <div className="relative z-10">
            <span className="mb-4 inline-block rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm">
              5 mẫu thiết kế có sẵn
            </span>
            <h1 className="mb-3 text-4xl font-bold text-content1">Chọn mẫu thiết kế</h1>
            <p className="mx-auto max-w-md text-content3">
              Mỗi mẫu được thiết kế cho một dịp đặc biệt. Chọn mẫu phù hợp, tùy chỉnh nội dung và chia sẻ kỷ niệm
              của bạn.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="relative px-4 py-14">
          {/* Dot pattern background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'radial-gradient(circle, #e07a9e28 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Soft gradient fades at top & bottom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_LIST.map((tpl) => (
                <TemplateCard key={tpl.id} tpl={tpl} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
