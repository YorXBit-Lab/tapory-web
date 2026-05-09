import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TEMPLATE_LIST } from '@/configs/constants';
import { TemplateCard } from './TemplateCard';

export const metadata = {
  title: 'Chọn mẫu – Tapory',
};

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="animate-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="animate-blob animation-delay-2 pointer-events-none absolute -right-20 top-4 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
          <div className="animate-blob animation-delay-4 pointer-events-none absolute -bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="animate-blob animation-delay-6 pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-secondary/15 blur-2xl" />

          <div className="relative z-10">
            <span className="mb-4 inline-block rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm">
              {TEMPLATE_LIST.length} mẫu thiết kế có sẵn
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
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'radial-gradient(circle, #e07a9e28 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
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
