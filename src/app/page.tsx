'use client';

import Link from 'next/link';
import { Button, Tag, Typography, Divider } from 'antd';

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

/* ─── data ─── */
const NAV_LINKS = [
  { href: '#products', label: 'Sản phẩm' },
  { href: '#how', label: 'Cách dùng' },
  { href: '#templates', label: 'Mẫu thiết kế' },
  { href: '#stories', label: 'Câu chuyện' },
  { href: '#pricing', label: 'Bảng giá' },
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

const PRODUCTS = [
  {
    name: 'Trái tim',
    tag: 'Bestseller',
    price: '35.000đ',
    desc: 'Dáng kinh điển cho những lời thì thầm yêu thương.',
    feats: ['3.5cm', 'Hồng pastel', 'Resin'],
    from: '#fce4e8',
    to: '#c4456a',
  },
  {
    name: 'Thẻ tag',
    tag: 'Mới',
    price: '40.000đ',
    desc: 'Khắc ngày kỷ niệm hoặc dòng chữ ngắn ở mặt sau.',
    feats: ['3×4cm', 'Vàng kem', 'Khắc 2 mặt'],
    from: '#fdf2e9',
    to: '#d6a47a',
  },
  {
    name: 'Đĩa tròn',
    tag: 'Đôi',
    price: '45.000đ',
    desc: 'Bộ đôi cho hai người — hai móc cùng dẫn về một trang.',
    feats: ['⌀ 3.2cm', 'Tím rượu', 'Cặp đôi'],
    from: '#e0d5e8',
    to: '#6b3a48',
  },
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
    name: 'Romance',
    date: '— 30.04.2024 —',
    title: 'Mãi mãi\nlà chúng ta',
    from: '#f4c2c8',
    to: '#c4456a',
  },
  {
    name: 'Vintage',
    date: 'est. 2019',
    title: 'Five years\nand counting',
    from: '#fae5d3',
    to: '#d6a47a',
  },
  {
    name: 'Travel',
    date: 'our travels',
    title: 'Đà Lạt\nHội An\nSapa',
    from: '#d4e3d8',
    to: '#6b8a76',
  },
  {
    name: 'Birthday',
    date: 'birthday no.25',
    title: 'Chúc em\ntuổi mới\nrực rỡ',
    from: '#f5e6cf',
    to: '#c4456a',
  },
  {
    name: 'Letter',
    date: 'a private letter',
    title: '"Anh sẽ\nkhông bao giờ\nquên—"',
    from: '#2a1a1f',
    to: '#6b3a48',
  },
  {
    name: 'Album',
    date: 'a small album',
    title: 'Một vài\nkhoảnh khắc.',
    from: '#efd9da',
    to: '#b48b9a',
  },
  {
    name: 'Friends',
    date: 'friendship',
    title: 'Tình bạn\n10 năm.',
    from: '#fdf2e9',
    to: '#ec9aaa',
  },
  {
    name: 'Family',
    date: '— 12.06.1968 —',
    title: 'Cảm ơn ba\nvà mẹ.',
    from: '#1a2a2a',
    to: '#6b8a8e',
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
    body: 'Mua một cặp Tapory — một móc cho mình, một móc cho người ấy, cả hai cùng chỉ về một trang. Mỗi lần chạm là một lần nhớ.',
    quote: '"Em ở Hà Nội, anh ở Sài Gòn. Đêm nào cũng chạm vào nó như chào nhau ngủ ngon."',
    author: 'Hằng & Quân — Khách hàng tháng 03',
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
  { h: 'Sản phẩm', links: ['Móc trái tim', 'Móc thẻ tag', 'Móc đĩa tròn', 'Bộ cặp đôi'] },
  {
    h: 'Hỗ trợ',
    links: ['Hướng dẫn sử dụng', 'Câu hỏi thường gặp', 'Bảo hành đổi trả', 'Liên hệ'],
  },
  { h: 'Kết nối', links: ['Instagram', 'TikTok', 'Facebook', 'hello@tapory.vn'] },
];

/* ─── Heart SVG keychain ─── */
const HeartKey = ({ size = 160 }: { size?: number }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <radialGradient id="hg" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#fce4e8" />
        <stop offset="60%" stopColor="#f4a7c3" />
        <stop offset="100%" stopColor="#e07a9e" />
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
      stroke="#c4456a"
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
  <div className="mb-16 text-center">
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
        <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between px-6">
          <Link href="/" className="text-primary flex items-center gap-2 text-2xl font-bold">
            <span className="bg-primary inline-block h-2 w-2 rounded-full" />
            Tapory
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

          <div className="flex items-center gap-2.5">
            <button className="border-border text-content2 hover:border-primary hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-transparent transition-colors">
              <MoonIcon />
            </button>
            {/* AntD Button — picks up theme colorPrimary automatically */}
            <Button type="primary" href="#pricing" shape="round">
              Mua ngay
            </Button>
          </div>
        </div>
      </nav>

      {/* ────────── HERO ────────── */}
      <section
        className="relative overflow-hidden py-20 pb-28"
        style={{
          background: [
            'radial-gradient(900px 500px at 75% 15%, color-mix(in oklab,var(--color-secondary) 30%,transparent), transparent 60%)',
            'radial-gradient(700px 400px at 8% 88%, color-mix(in oklab,var(--color-secondary) 18%,transparent), transparent 60%)',
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
            style: { top: '16%', right: '4%', transform: 'rotate(8deg)' },
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
            className="text-primary/35 pointer-events-none absolute hidden font-sans font-semibold italic select-none md:block"
            style={{ ...o.style, fontSize: o.size }}
          >
            {o.text}
          </span>
        ))}

        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
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
                Mỗi móc khóa Tapory mang một chip NFC riêng. Chạm điện thoại — trang kỷ niệm bạn tự
                tay thiết kế hiện ra ngay lập tức. Không cần app, không cần đăng ký.
              </Paragraph>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  href="#pricing"
                  icon={<ArrowRight />}
                  iconPosition="end"
                >
                  Đặt móc khóa
                </Button>
                <Button size="large" shape="round" href="#templates">
                  Xem mẫu thiết kế
                </Button>
              </div>

              {/* stats */}
              <Divider className="!border-border !mt-10 !mb-6 max-w-[480px]" />
              <div className="flex max-w-[480px] gap-10">
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

            {/* right – phone + NFC + heart */}
            <div className="relative hidden aspect-square items-center justify-center md:flex">
              {/* phone mockup */}
              <div
                className="relative z-10"
                style={{ transform: 'rotate(-8deg) translateY(-20px)' }}
              >
                <div
                  className="h-[440px] w-[220px] rounded-[36px]"
                  style={{
                    background: 'linear-gradient(160deg,#2a1020,#140810)',
                    boxShadow:
                      '0 28px 56px -18px rgba(224,122,158,.28),inset 0 0 0 2px #3a2030,inset 0 0 0 7px #140810',
                  }}
                >
                  <div
                    className="absolute inset-[14px] overflow-hidden rounded-[26px]"
                    style={{ background: 'linear-gradient(170deg,#fdf3f4,#f6dde6)' }}
                  >
                    <div
                      className="mx-auto h-4 w-20 rounded-b-xl"
                      style={{ background: '#140810' }}
                    />
                    <div
                      className="mx-3 mt-4 flex flex-col gap-2.5 rounded-2xl bg-white p-3.5"
                      style={{ boxShadow: '0 4px 16px rgba(224,122,158,.1)' }}
                    >
                      <div className="text-primary text-base font-bold">Mai &amp; Long</div>
                      <div
                        className="h-[96px] rounded-xl"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%,#f4c2c8,#e07a9e 70%)',
                        }}
                      />
                      <div className="bg-elevated h-2 rounded-full" />
                      <div className="bg-elevated h-2 w-[70%] rounded-full" />
                      <div className="text-content3 mt-0.5 flex items-center gap-2 text-[11px]">
                        <div className="bg-primary/60 h-5 w-5 flex-shrink-0 rounded-full" />
                        30.04.2024 · Đà Lạt
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NFC pulse waves */}
              <div
                className="pointer-events-none absolute top-[38%] right-[24%] h-56 w-56"
                aria-hidden
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="border-primary absolute inset-0 rounded-full border-2"
                    style={{
                      animation: 'wavePulse 2.4s ease-out infinite',
                      animationDelay: `${i * 0.8}s`,
                      opacity: 0,
                    }}
                  />
                ))}
              </div>

              {/* keychain */}
              <div
                className="absolute right-[6%] bottom-[10%] z-20"
                style={{
                  transform: 'rotate(14deg)',
                  filter: 'drop-shadow(0 16px 32px rgba(224,122,158,.3))',
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
      <section id="products" className="bg-elevated py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <SectionHead
            eyebrow="Bộ sưu tập"
            title={
              <>
                Ba dáng móc khóa, một <span className="text-primary">tâm hồn</span> kỷ niệm.
              </>
            }
            sub="Móc khóa kim loại phủ resin, chip NFC ẩn bên trong. Chống nước, chống xước. Mỗi mẫu được lập trình sẵn link riêng để bạn tùy biến."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="bg-background border-border relative rounded-2xl border px-7 py-12 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* AntD Tag for badge */}
                <Tag
                  color="pink"
                  className="!absolute !top-4 !right-4 !text-[10px] !font-bold !tracking-widest !uppercase"
                >
                  {p.tag}
                </Tag>
                {/* shape preview circle */}
                <div
                  className="mx-auto mb-7 h-36 w-36 rounded-full shadow-lg"
                  style={{ background: `radial-gradient(circle at 35% 30%,${p.from},${p.to})` }}
                />
                <Title level={4} className="!text-content1 !mb-1">
                  {p.name}
                </Title>
                <Text className="!text-primary mb-3 block text-sm font-semibold tracking-wide">
                  {p.price}
                </Text>
                <Paragraph className="!text-content3 !mb-5 !text-sm">{p.desc}</Paragraph>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {p.feats.map((f) => (
                    <Tag key={f} bordered className="!text-content3 !text-[11px]">
                      {f}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section id="how" className="bg-background py-24">
        <div className="mx-auto max-w-[1240px] px-6">
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
              <div key={i} className="px-8 text-center">
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
      <section id="templates" className="bg-elevated py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <SectionHead
            eyebrow="8 mẫu thiết kế"
            title={
              <>
                Mỗi mẫu là một <span className="text-primary">tâm trạng</span>.
              </>
            }
            sub="Từ ngọt ngào đến tối giản, từ điện ảnh đến nhật ký — chọn mẫu hợp với câu chuyện của bạn."
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl shadow-md transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02]"
                style={{ background: `linear-gradient(160deg,${t.from},${t.to})` }}
              >
                <div className="absolute inset-0 z-10 p-4">
                  <div className="text-[14px] leading-none font-semibold text-white/90">
                    {t.date}
                  </div>
                  <div
                    className="mt-2.5 text-[18px] leading-[1.15] font-bold whitespace-pre-line text-white"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,.2)' }}
                  >
                    {t.title}
                  </div>
                  <div className="mt-3 flex aspect-square items-center justify-center rounded-xl border border-white/30 bg-white/20 text-[11px] font-medium text-white/70">
                    photo
                  </div>
                </div>
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/50 to-transparent" />
                <div
                  className="absolute right-3.5 bottom-3.5 left-3.5 z-30 text-[13px] font-bold text-white"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,.4)' }}
                >
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── STORIES ────────── */}
      <section id="stories" className="bg-background py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <SectionHead
            eyebrow="Cảm hứng"
            title={
              <>
                Tapory được tặng vào những <span className="text-primary">khoảnh khắc</span> nào?
              </>
            }
          />
          <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_1fr]">
            {STORIES.map((s, i) => {
              const isFeat = s.type === 'featured';
              const wrapCls: Record<StoryType, string> = {
                featured: 'text-white',
                plain: 'bg-elevated border border-border text-content1',
                blush: 'bg-secondary/15 text-content1',
                dark: 'bg-content1 text-background',
              };
              return (
                <div
                  key={i}
                  className={`flex flex-col rounded-2xl p-8 ${wrapCls[s.type]} ${isFeat ? 'min-h-[560px] md:row-span-2' : 'min-h-[320px]'}`}
                  style={isFeat ? { background: 'linear-gradient(165deg,#e07a9e,#c4456a)' } : {}}
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
      <section className="bg-elevated overflow-hidden py-28">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid items-center gap-20 md:grid-cols-2">
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
                NFC là chuẩn không dây tầm gần đã có sẵn trong gần như mọi điện thoại từ 2017.
                Tapory dùng nó để mở thẳng trang web kỷ niệm.
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
                  background: 'linear-gradient(160deg,#2a1020,#120608)',
                  boxShadow:
                    '0 20px 40px -20px rgba(0,0,0,.4),inset 0 0 0 2px #3a2030,inset 0 0 0 6px #120608',
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

      {/* ────────── PRICING ────────── */}
      <section id="pricing" className="bg-background py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <SectionHead
            eyebrow="Bảng giá"
            title={
              <>
                Gọn gàng, <span className="text-primary">không phụ phí</span>.
              </>
            }
            sub="Đã bao gồm chip NFC, vỏ resin, móc kim loại, ship toàn quốc và quyền chỉnh sửa nội dung trọn đời."
          />
          <div className="grid items-start gap-6 md:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-9 transition-shadow ${
                  p.popular
                    ? 'bg-content1 border-content1 text-background scale-[1.03] shadow-2xl'
                    : 'bg-background border-border hover:shadow-md'
                }`}
              >
                {p.popular && (
                  <span className="bg-primary absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest whitespace-nowrap text-white uppercase">
                    Phổ biến nhất
                  </span>
                )}
                <Title
                  level={3}
                  className={`!mb-1 ${p.popular ? '!text-background' : '!text-content1'}`}
                >
                  {p.name}
                </Title>
                <Text
                  className={`mb-4 block min-h-[44px] text-sm ${p.popular ? '!text-background/70' : '!text-content3'}`}
                >
                  {p.desc}
                </Text>
                <div className="mb-6 flex items-baseline gap-1">
                  <span
                    className={`text-5xl leading-none font-bold ${p.popular ? 'text-primary' : 'text-content1'}`}
                  >
                    {p.price}
                  </span>
                  <span className={`text-base ${p.popular ? 'opacity-60' : 'text-content3'}`}>
                    {p.unit}
                  </span>
                </div>
                <Divider className={p.popular ? '!border-white/15' : '!border-border'} />
                <ul className="m-0 mb-7 flex flex-1 list-none flex-col gap-3 p-0">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5 flex-shrink-0 font-bold">✓</span>
                      <span className={p.popular ? 'opacity-85' : 'text-content2'}>{item}</span>
                    </li>
                  ))}
                </ul>
                {/* AntD Button */}
                <Button
                  type={p.popular ? 'primary' : 'default'}
                  size="large"
                  shape="round"
                  block
                  href="#"
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FINAL CTA ────────── */}
      <section className="bg-content1 relative overflow-hidden py-32 text-center">
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
            Tapory đang mở đặt hàng lứa đầu — giao trong 5 ngày làm việc.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            shape="round"
            href="#pricing"
            className="!h-14 !px-10 !text-base"
          >
            Đặt móc khóa của bạn →
          </Button>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="bg-elevated border-border border-t pt-16 pb-8">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-12 grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-2xl font-bold">
                <span className="bg-primary h-2 w-2 rounded-full" />
                Tapory
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
                    <li key={l}>
                      <a
                        href="#"
                        className="text-content2 hover:text-primary text-sm transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Divider className="border-border mt-0" />
          <div className="flex items-center justify-between">
            <Text className="text-content3">© 2026 Tapory — Móc khóa kỷ niệm NFC.</Text>
            <Text className="text-content3">Crafted in Vietnam ♥</Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
