import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TEMPLATE_LIST } from '@/configs/constants';

export const metadata = {
  title: 'Chọn mẫu – Tapory',
};

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-tapory-navy mb-2">Chọn mẫu thiết kế</h1>
        <p className="text-gray-500 mb-10">Chọn mẫu phù hợp với dịp kỷ niệm của bạn</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_LIST.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/edit/demo?template=${tpl.id}`}
              className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className="h-40 flex items-center justify-center text-6xl"
                style={{ backgroundColor: tpl.colors.background }}
              >
                {tpl.icon}
              </div>
              <div className="p-4">
                <p className="font-semibold text-tapory-navy">{tpl.name}</p>
                <p className="text-sm text-gray-500">{tpl.occasion}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
