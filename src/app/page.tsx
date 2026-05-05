import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-white py-24 px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Móc Khóa Kỷ Niệm NFC</h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Chạm điện thoại vào móc khóa – trang kỷ niệm của bạn hiện ra ngay lập tức.
          </p>
          <Link
            href="/templates"
            className="inline-block bg-background text-primary font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Xem mẫu thiết kế
          </Link>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-12">Cách hoạt động</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Mua móc khóa', desc: 'Mỗi móc khóa có chip NFC được lập trình sẵn URL cá nhân.' },
              { step: '02', title: 'Tùy chỉnh nội dung', desc: 'Chọn mẫu, điền thông tin, upload ảnh và lưu lại.' },
              { step: '03', title: 'Chạm để xem', desc: 'Ai cũng có thể chạm điện thoại vào móc khóa để xem trang kỷ niệm.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {step}
                </span>
                <h3 className="font-semibold text-content1">{title}</h3>
                <p className="text-content3 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
