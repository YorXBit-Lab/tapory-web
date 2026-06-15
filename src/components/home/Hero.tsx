import NextImage from 'next/image';
import { Button, Divider } from 'antd';
import { HeartKeychain } from '@/components/icons';
import { ContactDropdown } from './ContactDropdown';
import { Eyebrow } from './SectionHead';

const HERO_STATS = [
  { num: '8+', lab: 'MẪU THIẾT KẾ' },
  { num: '∞', lab: 'LẦN CHỈNH SỬA' },
  { num: '2s', lab: 'CHẠM LÀ XEM' },
];

const HERO_ORNAMENTS = [
  {
    style: { top: '8%', left: '3%', transform: 'rotate(-12deg)' },
    text: 'love is in the chip ✦',
    size: '18px',
  },
  {
    style: { top: '6%', right: '4%', transform: 'rotate(8deg)' },
    text: 'tap to remember',
    size: '15px',
  },
  {
    style: { bottom: '8%', left: '6%', transform: 'rotate(-4deg)' },
    text: '— since 2026 —',
    size: '13px',
  },
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden py-12 pb-16 md:py-20 md:pb-28"
      style={{
        background: [
          'radial-gradient(900px 500px at 75% 15%, color-mix(in oklab,var(--color-primary) 18%,transparent), transparent 60%)',
          'radial-gradient(700px 400px at 8% 88%, color-mix(in oklab,var(--color-secondary) 35%,transparent), transparent 60%)',
          'var(--color-background)',
        ].join(','),
      }}
    >
      {/* floating ornaments */}
      {HERO_ORNAMENTS.map((o, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="text-primary/50 pointer-events-none absolute hidden font-sans font-semibold italic select-none md:block"
          style={{ ...o.style, fontSize: o.size }}
        >
          {o.text}
        </span>
      ))}

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* left */}
          <div>
            <Eyebrow>Móc khóa NFC kỷ niệm</Eyebrow>
            <h1 className="text-content1 mb-6 text-[clamp(42px,5.5vw,80px)] leading-[1.05] font-bold">
              Một <span className="text-primary">cái chạm</span>
              <br />
              để giữ lại
              <br />
              kỷ niệm.
            </h1>
            <p className="text-content2 mb-8 max-w-[480px] text-lg leading-relaxed">
              Mỗi móc khóa Góc Chạm mang một chip NFC riêng. Chạm điện thoại — trang kỷ niệm bạn tự
              tay thiết kế hiện ra ngay lập tức. Không cần app, không cần đăng ký.
            </p>

            <div className="flex flex-wrap gap-3">
              <ContactDropdown />
              <Button size="large" shape="round" href="/templates">
                Xem mẫu thiết kế
              </Button>
            </div>

            {/* stats */}
            <Divider className="!border-border !mt-10 !mb-6 max-w-[480px]" />
            <div className="flex max-w-[480px] gap-6 sm:gap-10">
              {HERO_STATS.map((s) => (
                <div key={s.lab}>
                  <div className="text-primary text-[28px] leading-none font-bold">{s.num}</div>
                  <span className="text-content3 mt-1 block text-xs tracking-[0.12em]">{s.lab}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right – product photo */}
          <div className="relative hidden aspect-square items-center justify-center md:flex">
            <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
              <NextImage
                src="https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/anh_general.jpg"
                alt="Góc Chạm móc khóa NFC kỷ niệm"
                width={600}
                height={600}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {/* keychain overlay */}
            <div
              className="absolute right-[-2%] bottom-[-2%] z-20"
              style={{
                transform: 'rotate(14deg)',
                filter: 'drop-shadow(0 16px 32px rgba(139,107,82,.36))',
              }}
            >
              <HeartKeychain size={170} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
