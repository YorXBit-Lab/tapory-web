import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TEMPLATE_LIST } from '@/configs/constants';
import { TemplateCard } from './TemplateCard';

export const metadata = {
  title: 'Chọn mẫu – Góc Chạm',
};

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 text-center">
          <div className="from-primary/10 via-background to-secondary/10 absolute inset-0 bg-gradient-to-br" />
          <div className="animate-blob bg-primary/25 pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
          <div className="animate-blob animation-delay-2 bg-secondary/30 pointer-events-none absolute top-4 -right-20 h-80 w-80 rounded-full blur-3xl" />
          <div className="animate-blob animation-delay-4 bg-primary/20 pointer-events-none absolute -bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="animate-blob animation-delay-6 bg-secondary/15 pointer-events-none absolute top-1/2 left-1/3 h-48 w-48 -translate-y-1/2 rounded-full blur-2xl" />

          <div className="relative z-10">
            <span className="bg-primary/15 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              {TEMPLATE_LIST.length} mẫu thiết kế có sẵn
            </span>
            <h1 className="text-content1 mb-3 text-4xl font-bold">Chọn mẫu thiết kế</h1>
            <p className="text-content3 mx-auto max-w-md">
              Mỗi mẫu được thiết kế cho một dịp đặc biệt. Chọn mẫu phù hợp, tùy chỉnh nội dung và
              chia sẻ kỷ niệm của bạn.
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
          <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent" />
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />

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
