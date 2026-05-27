'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button, Tag, Typography, Divider, Image, Dropdown } from 'antd';
import { useProducts } from '@/hooks/product';
import type { IProduct } from '@/configs/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const { Title, Text, Paragraph } = Typography;

const ArrowRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    {open ? (
      <>
        <line x1="3" y1="3" x2="15" y2="15" />
        <line x1="15" y1="3" x2="3" y2="15" />
      </>
    ) : (
      <>
        <line x1="2" y1="5" x2="16" y2="5" />
        <line x1="2" y1="9" x2="16" y2="9" />
        <line x1="2" y1="13" x2="16" y2="13" />
      </>
    )}
  </svg>
);

/* ─── data ─── */
const NAV_LINKS = [
  { href: '#products', label: 'Sản phẩm' },
  { href: '#how', label: 'Cách dùng' },
  { href: '/templates', label: 'Mẫu thiết kế' },
  { href: '#stories', label: 'Câu chuyện' },
];

const MARQUEE_ITEMS = [
  'Quà sinh nhật',
  'Kỷ niệm yêu',
  'Tốt nghiệp',
  'Đám cưới',
  'Du lịch cùng nhau',
  'Quà tặng bố mẹ',
  'Tình bạn 10 năm',
];

const HERO_STATS = [
  { num: '8+', lab: 'MẪU THIẾT KẾ' },
  { num: '∞', lab: 'LẦN CHỈNH SỬA' },
  { num: '2s', lab: 'CHẠM LÀ XEM' },
];

const CONTACT_LINKS = [
  { key: 'zalo', label: 'Zalo', href: '#', color: '#0068FF' },
  { key: 'facebook', label: 'Facebook', href: '#', color: '#1877F2' },
  { key: 'tiktok', label: 'TikTok', href: '#', color: '#010101' },
  { key: 'shopee', label: 'Shopee', href: '#', color: '#EE4D2D' },
];

const HOW_STEPS = [
  {
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Đặt móc khóa',
    desc: 'Chọn dáng tim, tag hoặc đĩa tròn. Mỗi móc có chip NFC riêng và URL được lập trình sẵn.',
  },
  {
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    ),
    title: 'Tự tay thiết kế',
    desc: 'Chọn 1 trong 8 mẫu, điền tên, ngày, lời nhắn, upload ảnh — tất cả ngay trong trình duyệt.',
  },
  {
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    ),
    title: 'Chạm là xem',
    desc: 'Đưa điện thoại sát móc khóa — trang kỷ niệm hiện ra ngay, không cần app, không cần đăng nhập.',
  },
];

const TEMPLATES = [
  {
    name: 'Sinh Nhật',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/sinhnhat.png',
  },
  {
    name: 'Âm Nhạc',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/nhac.png',
  },
  {
    name: 'Cá Nhân',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/canhan.png',
  },
  {
    name: 'Đám Cưới',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/damcuoii.png',
  },
  {
    name: 'Kỷ Niệm',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/kiniem.png',
  },
  {
    name: 'Chuyển Hướng',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/redicrect.png',
  },
  {
    name: 'Tốt Nghiệp',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/totnghiep.png',
  },
  {
    name: 'Mạng Xã Hội',
    imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/mxh.png',
  },
];

type StoryType = 'featured' | 'plain' | 'blush' | 'dark';
const STORIES: {
  type: StoryType;
  label: string;
  title: string;
  body: string;
  quote?: string;
  author?: string;
}[] = [
  {
    type: 'featured',
    label: 'Cặp đôi',
    title: 'Cho người ở rất xa.',
    body: 'Mua một cặp Góc Chạm — một móc cho mình, một móc cho người ấy, cả hai cùng chỉ về một trang. Mỗi lần chạm là một lần nhớ.',
    quote: '"Em ở Hà Nội, anh ở Sài Gòn. Đêm nào cũng chạm vào nó như chào nhau ngủ ngon."',
    author: '',
  },
  {
    type: 'plain',
    label: 'Bạn thân',
    title: '10 năm tình bạn.',
    body: 'Tag tên ba người, ngày gặp đầu tiên, ảnh chụp năm cấp 3. Một món quà nhỏ nhưng lưu trữ cả thanh xuân.',
  },
  {
    type: 'blush',
    label: 'Sinh nhật',
    title: 'Một tuổi mới rực rỡ.',
    body: 'Thay vì thiệp giấy — một chiếc móc khóa với album mini và lời chúc viết tay. Quà sẽ giữ được nhiều năm.',
  },
  {
    type: 'dark',
    label: 'Gia đình',
    title: 'Tặng bố mẹ ngày kỷ niệm cưới.',
    body: 'Ảnh cưới ngày xưa, ảnh con cháu hôm nay. Chạm là cả gia đình hiện ra.',
  },
  {
    type: 'plain',
    label: 'Tốt nghiệp',
    title: 'Khép lại một chặng đường.',
    body: 'Tên trường, năm ra trường, ảnh cả lớp. Kỷ vật kết hợp hiện vật và kỷ niệm số.',
  },
];

const NFC_BULLETS = [
  {
    n: '01',
    title: 'Chip NTAG213, mã hóa URL riêng',
    body: 'Mỗi móc khóa có một mã duy nhất, không thể nhân bản.',
  },
  {
    n: '02',
    title: 'Hoạt động trên iPhone & Android',
    body: 'iPhone 7 trở lên (iOS 14+), Android có NFC.',
  },
  {
    n: '03',
    title: 'Bạn vẫn chỉnh sửa được sau khi mua',
    body: 'URL cố định, nội dung thay đổi tùy bạn.',
  },
];

const PRICING = [
  {
    name: 'Solo',
    price: '35',
    unit: '.000đ',
    popular: false,
    desc: '1 móc khóa, dành cho riêng bạn.',
    items: [
      '1 móc khóa NFC (chọn dáng)',
      'Truy cập 8 mẫu thiết kế',
      'Chỉnh sửa trọn đời',
      'Ship toàn quốc',
    ],
    cta: 'Đặt 1 móc',
  },
  {
    name: 'Đôi',
    price: '65',
    unit: '.000đ',
    popular: true,
    desc: '2 móc cùng một trang — cho hai người.',
    items: [
      '2 móc khóa NFC cùng URL',
      'Mẫu "Cặp đôi" độc quyền',
      'Hộp quà giấy mỹ thuật',
      'Thiệp viết tay miễn phí',
      'Chỉnh sửa trọn đời',
    ],
    cta: 'Đặt cho hai người',
  },
  {
    name: 'Bộ kỷ niệm',
    price: '95',
    unit: '.000đ',
    popular: false,
    desc: '3 móc — gia đình, nhóm bạn.',
    items: [
      '3 móc khóa NFC cùng URL',
      'Mọi mẫu + mẫu "Album"',
      'Hộp quà giấy mỹ thuật',
      'Khắc tên 3 móc',
      'Chỉnh sửa trọn đời',
    ],
    cta: 'Đặt cho cả nhóm',
  },
];

const FOOTER_COLS = [
  {
    h: 'Sản phẩm',
    links: [
      { label: 'Móc hình chữ nhật', href: '#products' },
      { label: 'Móc hình vuông', href: '#products' },
      { label: 'Móc hình tròn', href: '#products' },
      { label: 'Bộ cặp đôi', href: '#products' },
    ],
  },
  {
    h: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn sử dụng', href: '#how' },
      { label: 'Chính sách không bảo hành', href: '#no-warranty' },
    ],
  },
  {
    h: 'Kết nối',
    links: [
      // { label: 'Instagram', href: '#' },
      // { label: 'TikTok', href: '#' },
      // { label: 'Facebook', href: '#' },
      { label: 'yorxbit@gmail.com', href: 'mailto:yorxbit@gmail.com' },
    ],
  },
];

/* ─── Heart SVG keychain ─── */
const HeartKey = ({ size = 160 }: { size?: number }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <radialGradient id="hg" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#F6F0E8" />
        <stop offset="60%" stopColor="#D8C3AE" />
        <stop offset="100%" stopColor="#8B6B52" />
      </radialGradient>
      <radialGradient id="rg" cx="40%" cy="40%">
        <stop offset="0%" stopColor="#f5e6c5" />
        <stop offset="100%" stopColor="#9b7240" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="32" r="20" fill="none" stroke="url(#rg)" strokeWidth="4" />
    <path d="M100 52 Q95 70 100 90" stroke="#b48b5a" strokeWidth="2" fill="none" />
    <path
      d="M100 180 C60 140,30 110,50 80 C60 65,85 65,100 90 C115 65,140 65,150 80 C170 110,140 140,100 180 Z"
      fill="url(#hg)"
      stroke="#5E4634"
      strokeWidth="1.5"
    />
    <g transform="translate(100,130)">
      <path d="M-10 0 Q0-8 10 0" stroke="white" strokeWidth="2" fill="none" opacity=".9" />
      <path d="M-16 5 Q0-12 16 5" stroke="white" strokeWidth="2" fill="none" opacity=".7" />
      <path d="M-22 10 Q0-16 22 10" stroke="white" strokeWidth="2" fill="none" opacity=".5" />
    </g>
  </svg>
);

/* ─── Reusable eyebrow ─── */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-primary mb-3 block !text-xs font-semibold tracking-[0.22em] uppercase">
    {children}
  </Text>
);

/* ─── Reusable section heading ─── */
const SectionHead = ({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) => (
  <div className="mb-10 text-center md:mb-16">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="text-content1 mb-4 text-[clamp(30px,4vw,50px)] leading-[1.1] font-bold">
      {title}
    </h2>
    {sub && (
      <Paragraph className="text-content3 mx-auto !mb-0 max-w-xl !text-base">{sub}</Paragraph>
    )}
  </div>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  return (
    <div className="bg-background text-content1 min-h-screen font-sans">
      {/* keyframes */}
      <style>{`
        @keyframes wavePulse {
          0%   { transform: scale(.3); opacity: 0; }
          20%  { opacity: .65; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes phoneTap {
          0%,100% { transform: translateY(-50%) rotate(-6deg) translateX(0); }
          50%     { transform: translateY(-50%) rotate(-6deg) translateX(44px); }
        }
        @keyframes scrollX {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ────────── NAV ────────── */}
      <nav className="border-border bg-background/85 sticky top-0 z-[1020] border-b backdrop-blur-lg">
        <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <NextImage
              src="/images/logo/logo_goccham_stransparent.png"
              alt="Góc Chạm"
              width={200}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-content2 hover:text-primary text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop: theme toggle + CTA */}
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>
            <Dropdown
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                items: CONTACT_LINKS.map(({ key, label, href, color }) => ({
                  key,
                  label: (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 py-0.5"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      {label}
                    </a>
                  ),
                })),
              }}
            >
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<ArrowRight />}
                iconPlacement="end"
              >
                Liên hệ
              </Button>
            </Dropdown>
            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="border-border text-content2 hover:text-content1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border bg-transparent transition-colors md:hidden"
              aria-label="Menu"
            >
              <HamburgerIcon open={mobileNavOpen} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="border-border bg-background border-t md:hidden">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-0.5 px-4 py-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-content2 hover:text-primary hover:bg-elevated rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-border mt-2 flex items-center gap-2 border-t pt-3">
                <ThemeToggle />
                <Button
                  type="primary"
                  href="#pricing"
                  shape="round"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ────────── HERO ────────── */}
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
        {[
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
        ].map((o, i) => (
          <span
            key={i}
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
              <Paragraph className="text-content2 mb-8 max-w-[480px] !text-lg !leading-relaxed">
                Mỗi móc khóa Góc Chạm mang một chip NFC riêng. Chạm điện thoại — trang kỷ niệm bạn
                tự tay thiết kế hiện ra ngay lập tức. Không cần app, không cần đăng ký.
              </Paragraph>

              <div className="flex flex-wrap gap-3">
                <Dropdown
                  trigger={['click']}
                  placement="bottomLeft"
                  menu={{
                    items: CONTACT_LINKS.map(({ key, label, href, color }) => ({
                      key,
                      label: (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 py-0.5"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ background: color }}
                          />
                          {label}
                        </a>
                      ),
                    })),
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    icon={<ArrowRight />}
                    iconPlacement="end"
                  >
                    Liên hệ
                  </Button>
                </Dropdown>
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
                    <Text className="!text-content3 mt-1 block !text-xs tracking-[0.12em]">
                      {s.lab}
                    </Text>
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
                <HeartKey size={170} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── MARQUEE ────────── */}
      <div className="border-border bg-elevated overflow-hidden border-y py-4">
        <div
          className="text-content1 flex items-center gap-14 text-xl font-bold whitespace-nowrap"
          style={{ animation: 'scrollX 36s linear infinite' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-14">
              <span>{item}</span>
              <span className="text-primary text-sm">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ────────── PRODUCTS ────────── */}
      <section id="products" className="bg-elevated py-14 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <SectionHead
            eyebrow="Bộ sưu tập"
            title={
              <>
                Móc khóa kỷ niệm, một <span className="text-primary">tâm hồn</span> riêng biệt.
              </>
            }
            sub="Móc khóa kim loại phủ resin, chip NFC ẩn bên trong. Chống nước, chống xước. Mỗi mẫu được lập trình sẵn link riêng để bạn tùy biến."
          />
          {productsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background border-border animate-pulse rounded-2xl border px-5 py-8 text-center md:px-7 md:py-12"
                >
                  <div className="bg-elevated mx-auto mb-7 h-36 w-36 rounded-full" />
                  <div className="bg-elevated mx-auto mb-2 h-5 w-32 rounded-lg" />
                  <div className="bg-elevated mx-auto mb-5 h-4 w-20 rounded-lg" />
                  <div className="bg-elevated mx-auto h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border-border rounded-2xl border py-16 text-center">
              <Text className="!text-content3">Chưa có sản phẩm nào.</Text>
            </div>
          ) : (
            <Image.PreviewGroup>
              <div className="grid gap-6 md:grid-cols-3">
                {(products as IProduct[]).map((p) => (
                  <div
                    key={p.id}
                    className="bg-background border-border relative rounded-2xl border px-5 py-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl md:px-7 md:py-12"
                  >
                    {p.isNfc && (
                      <Tag
                        color="#8B6B52"
                        className="!absolute !top-4 !right-4 !text-[10px] !font-bold !tracking-widest !uppercase"
                      >
                        NFC
                      </Tag>
                    )}
                    <div className="mx-auto mb-7 h-36 w-36">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          width={144}
                          height={144}
                          style={{ objectFit: 'cover' }}
                          wrapperStyle={{
                            borderRadius: '50%',
                            overflow: 'hidden',
                            boxShadow:
                              '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <div
                          className="h-36 w-36 rounded-full shadow-lg"
                          style={{
                            background: 'radial-gradient(circle at 35% 30%,#F6F0E8,#8B6B52)',
                          }}
                        />
                      )}
                    </div>
                    <Title level={4} className="!text-content1 !mb-1">
                      {p.name}
                    </Title>
                    <Text className="!text-primary mb-3 block text-sm font-semibold tracking-wide">
                      {p.price.toLocaleString('vi-VN')}đ
                    </Text>
                    {p.description && (
                      <Paragraph className="!text-content3 !mb-0 !text-sm">
                        {p.description}
                      </Paragraph>
                    )}
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          )}
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section id="how" className="bg-background py-14 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <SectionHead
            eyebrow="Cách hoạt động"
            title={
              <>
                Ba bước, <span className="text-primary">một phút</span>, một kỷ niệm.
              </>
            }
          />
          <div className="relative grid md:grid-cols-3">
            {/* dashed connector */}
            <div
              className="pointer-events-none absolute top-[58px] right-[16%] left-[16%] hidden h-px md:block"
              style={{
                background:
                  'repeating-linear-gradient(to right,var(--color-primary) 0 4px,transparent 4px 10px)',
                opacity: 0.35,
              }}
            />
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="px-4 text-center md:px-8">
                <div className="border-primary text-primary bg-background relative z-10 mx-auto mb-8 flex h-[116px] w-[116px] items-center justify-center rounded-full border">
                  {s.icon}
                </div>
                <Title level={4} className="!text-content1 !mb-2">
                  {s.title}
                </Title>
                <Paragraph className="!text-content3 mx-auto !mb-0 max-w-[260px] !text-sm">
                  {s.desc}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── TEMPLATES ────────── */}
      <section id="templates" className="bg-elevated py-14 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <SectionHead
            eyebrow="8 mẫu thiết kế"
            title={
              <>
                Mỗi mẫu là một <span className="text-primary">tâm trạng</span>.
              </>
            }
            sub="Từ ngọt ngào đến tối giản, từ điện ảnh đến nhật ký — chọn mẫu hợp với câu chuyện của bạn."
          />
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {TEMPLATES.map((t) => (
                <div
                  key={t.name}
                  className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-md transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02]"
                >
                  <Image
                    src={t.imageUrl}
                    alt={t.name}
                    wrapperStyle={{ position: 'absolute', inset: 0 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    className="pointer-events-none absolute right-3 bottom-3 left-3 text-[13px] font-bold text-white"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,.8)' }}
                  >
                    {t.name}
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </section>

      {/* ────────── STORIES ────────── */}
      <section id="stories" className="bg-background py-14 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <SectionHead
            eyebrow="Cảm hứng"
            title={
              <>
                Góc Chạm được tặng vào những <span className="text-primary">khoảnh khắc</span> nào?
              </>
            }
          />
          <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_1fr]">
            {STORIES.map((s, i) => {
              const isFeat = s.type === 'featured';
              const wrapCls: Record<StoryType, string> = {
                featured: 'text-white',
                plain: 'bg-elevated border border-border text-content1',
                blush: 'bg-primary/10 border border-primary/20 text-content1',
                dark: 'bg-content1 text-background',
              };
              return (
                <div
                  key={i}
                  className={`flex flex-col rounded-2xl p-6 sm:p-8 ${wrapCls[s.type]} ${isFeat ? 'min-h-[320px] sm:min-h-[520px] md:row-span-2' : 'min-h-[240px] sm:min-h-[280px]'}`}
                  style={isFeat ? { background: 'linear-gradient(165deg,#8B6B52,#5E4634)' } : {}}
                >
                  <Text
                    className={`mb-4 block !text-[11px] font-bold tracking-[0.18em] uppercase ${isFeat ? '!text-white/75' : '!text-content3'}`}
                  >
                    {s.label}
                  </Text>
                  <h3
                    className={`mb-3 leading-[1.15] font-bold ${isFeat ? 'text-[36px] text-white' : 'text-[24px]'}`}
                  >
                    {s.title}
                  </h3>
                  <Paragraph
                    className={`!mb-0 !leading-relaxed ${isFeat ? '!text-base !text-white/90' : '!text-content2 !text-sm'}`}
                  >
                    {s.body}
                  </Paragraph>
                  {s.quote && (
                    <>
                      <Divider className="!mt-auto !mb-5 !border-white/20" />
                      <div className="text-[16px] leading-[1.45] font-semibold text-white/95 italic">
                        {s.quote}
                      </div>
                      <div className="mt-4 flex items-center gap-2.5">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full border border-white/40 bg-white/25" />
                        <Text className="!text-sm !text-white/70">{s.author}</Text>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── NFC DEMO ────────── */}
      <section className="bg-elevated overflow-hidden py-16 md:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <div>
              <Eyebrow>Công nghệ NFC</Eyebrow>
              <h2 className="text-content1 mb-6 text-[clamp(30px,4vw,46px)] leading-[1.1] font-bold">
                Không app.
                <br />
                Không tải.
                <br />
                <span className="text-primary">Chỉ một cái chạm.</span>
              </h2>
              <Paragraph className="!text-content2 !mb-6 max-w-[460px] !text-base">
                NFC là chuẩn không dây tầm gần đã có sẵn trong gần như mọi điện thoại từ 2017. Góc
                Chạm dùng nó để mở thẳng trang web kỷ niệm.
              </Paragraph>
              <div className="divide-border border-border divide-y border-y">
                {NFC_BULLETS.map((b) => (
                  <div key={b.n} className="flex items-start gap-4 py-4">
                    <span className="text-primary mt-0.5 min-w-[28px] text-sm font-bold">
                      {b.n}
                    </span>
                    <div>
                      <Text strong className="!text-content1 mb-0.5 block">
                        {b.title}
                      </Text>
                      <Text className="!text-content3 !text-sm">{b.body}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* demo stage */}
            <div
              className="border-border relative aspect-square overflow-hidden rounded-2xl border"
              style={{
                background:
                  'radial-gradient(circle at center,color-mix(in oklab,var(--color-secondary) 22%,transparent),transparent 60%),var(--color-elevated)',
              }}
            >
              {/* phone */}
              <div
                className="absolute top-1/2 left-[14%] h-[332px] w-[166px] rounded-[26px]"
                style={{
                  background: 'linear-gradient(160deg,#261A0E,#1A1208)',
                  boxShadow:
                    '0 20px 40px -20px rgba(0,0,0,.4),inset 0 0 0 2px #3D2810,inset 0 0 0 6px #1A1208',
                  animation: 'phoneTap 4s ease-in-out infinite',
                }}
              />
              {/* waves */}
              <div className="absolute top-1/2 left-[38%] h-[186px] w-[186px] -translate-y-1/2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-primary absolute inset-0 rounded-full border-2"
                    style={{
                      animation: 'wavePulse 2.2s ease-out infinite',
                      animationDelay: `${i * 0.55}s`,
                      opacity: 0,
                    }}
                  />
                ))}
              </div>
              {/* keychain */}
              <div className="absolute top-1/2 right-[16%] z-10 -translate-y-1/2">
                <HeartKey size={108} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FINAL CTA ────────── */}
      <section className="bg-content1 relative overflow-hidden py-20 text-center md:py-32">
        <div
          className="absolute -top-1/2 right-[-10%] h-[540px] w-[540px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,var(--color-primary),transparent 60%)' }}
        />
        <div
          className="absolute -bottom-1/2 left-[-10%] h-[440px] w-[440px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,var(--color-secondary),transparent 60%)' }}
        />
        <div className="relative z-10 mx-auto max-w-[900px] px-6">
          <h2 className="text-background mb-6 text-[clamp(38px,5.5vw,74px)] leading-[1.05] font-bold">
            Một <span className="text-primary">cái chạm</span>
            <br />
            đáng để giữ cả đời.
          </h2>
          <Paragraph className="text-background/55 mx-auto mb-10 max-w-[500px] text-lg">
            Góc Chạm đang mở đặt hàng lứa đầu — giao trong 5 ngày làm việc.
          </Paragraph>
          <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            menu={{
              items: CONTACT_LINKS.map(({ key, label, href, color }) => ({
                key,
                label: (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-0.5"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    {label}
                  </a>
                ),
              })),
            }}
          >
            <Button
              type="primary"
              size="large"
              shape="round"
              icon={<ArrowRight />}
              iconPosition="end"
            >
              Liên hệ
            </Button>
          </Dropdown>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="bg-elevated border-border border-t pt-16 pb-8">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="mb-12 grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-2xl font-bold">
                <span className="bg-primary h-2 w-2 rounded-full" />
                Góc Chạm
              </div>
              <Paragraph className="!text-content3 !mb-0 max-w-[300px] !text-sm">
                Móc khóa NFC kỷ niệm — thủ công tại Việt Nam, cho những khoảnh khắc đáng giữ.
              </Paragraph>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.h}>
                <Text className="text-content3 mb-4 block text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {col.h}
                </Text>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-content2 hover:text-primary text-sm transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Divider className="border-border mt-0" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Text className="text-content3">© 2026 Góc Chạm — Móc khóa kỷ niệm NFC.</Text>
            <Text className="text-content3">Crafted in Vietnam ♥</Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
