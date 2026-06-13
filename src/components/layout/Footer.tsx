'use client';

import { Divider, Typography } from 'antd';
import { ORDER_URL } from '@/libs/seo';

const { Text, Paragraph } = Typography;

const FOOTER_COLS = [
  {
    h: 'Sản phẩm',
    links: [
      { label: 'Móc khóa cá nhân hóa', href: '/product/moc-khoa-ca-nhan-hoa' },
      { label: 'Móc khóa in ảnh', href: '/product/moc-khoa-in-anh' },
      { label: 'Móc khóa NFC', href: '/product/moc-khoa-nfc' },
      { label: 'Xem tất cả mẫu', href: '/templates' },
    ],
  },
  {
    h: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn sử dụng', href: '/#how' },
      { label: 'Chính sách không bảo hành', href: '/#no-warranty' },
    ],
  },
  {
    h: 'Kết nối',
    links: [
      { label: 'goccham.sg@gmail.com', href: 'mailto:goccham.sg@gmail.com' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-elevated border-border mt-auto border-t pt-16 pb-8">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
          <div>
            <div className="text-primary mb-2 flex items-center gap-2 text-2xl font-bold">
              <span className="bg-primary h-2 w-2 rounded-full" />
              Góc Chạm
            </div>
            <Paragraph className="!text-content3 !mb-0 max-w-[300px] !text-sm">
              Móc khóa NFC kỷ niệm cho những khoảnh khắc đáng giữ.
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

        <div className="border-border bg-surface mb-6 rounded-lg border px-4 py-3">
          <p className="text-content3 text-xs leading-relaxed">
            <span className="text-content2 font-semibold">Lưu ý:</span> Website này chỉ dùng để{' '}
            <span className="font-medium">trưng bày sản phẩm</span>, không thực hiện giao dịch
            thanh toán trực tuyến. Để đặt hàng, vui lòng truy cập{' '}
            <a href={ORDER_URL} className="text-primary underline underline-offset-2">
              gian hàng chính thức trên TikTok Shop
            </a>
            . Nếu có thắc mắc, vui lòng{' '}
            <a href={ORDER_URL} className="text-primary underline underline-offset-2">
              liên hệ với chúng tôi
            </a>
            .
          </p>
        </div>

        <Divider className="border-border mt-0" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-content3">© 2026 Góc Chạm — Móc khóa kỷ niệm NFC.</Text>
          <Text className="text-content3">Crafted in Vietnam ♥</Text>
        </div>
      </div>
    </footer>
  );
}
