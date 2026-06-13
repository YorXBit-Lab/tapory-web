import type { Metadata } from 'next';
import { KeywordLandingPage } from '@/components/seo/KeywordLandingPage';
import { createPageMetadata } from '@/libs/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Móc khóa cá nhân hóa làm quà tặng kỷ niệm',
  description:
    'Móc khóa Góc Chạm dành cho quà sinh nhật, kỷ niệm, tốt nghiệp và đám cưới: in ảnh theo yêu cầu, có tùy chọn chip NFC mở trang kỷ niệm cá nhân.',
  path: '/moc-khoa',
});

export default function MocKhoaPage() {
  return (
    <KeywordLandingPage
      path="/moc-khoa"
      eyebrow="Móc khóa cá nhân hóa"
      title="Móc khóa kỷ niệm cho những khoảnh khắc đáng giữ"
      description="Góc Chạm kết hợp móc khóa acrylic in ảnh, thiết kế cá nhân hóa và tùy chọn chip NFC để biến một món quà nhỏ thành trang kỷ niệm có thể chạm để mở."
      productName="Móc khóa cá nhân hóa Góc Chạm"
      intro="Một chiếc móc khóa có thể mang ảnh, lời nhắn, ngày kỷ niệm và trang nội dung riêng cho người nhận."
      features={[
        {
          title: 'Cá nhân hóa theo câu chuyện',
          body: 'Chọn mẫu thiết kế, thêm tên, ngày, ảnh và lời nhắn để món quà không bị giống sản phẩm đại trà.',
        },
        {
          title: 'Có thể kết hợp NFC',
          body: 'Nếu chọn phiên bản NFC, người nhận chỉ cần chạm điện thoại vào móc khóa để mở trang kỷ niệm cá nhân.',
        },
        {
          title: 'Phù hợp nhiều dịp tặng',
          body: 'Một mẫu móc khóa có thể dùng cho cặp đôi, bạn thân, gia đình, tốt nghiệp hoặc album kỷ niệm nhỏ.',
        },
      ]}
      useCases={[
        'Quà sinh nhật',
        'Quà kỷ niệm yêu',
        'Quà tốt nghiệp',
        'Quà cưới nhỏ',
        'Quà cho bạn thân',
        'Quà cho bố mẹ',
        'Kỷ vật nhóm',
        'Móc khóa couple',
      ]}
      faqs={[
        {
          question: 'Móc khóa Góc Chạm có những loại nào?',
          answer:
            'Góc Chạm tập trung vào móc khóa acrylic in ảnh theo yêu cầu và các phiên bản có thể gắn NFC để mở trang kỷ niệm cá nhân.',
        },
        {
          question: 'Có thể đặt móc khóa theo ảnh riêng không?',
          answer:
            'Có. Bạn có thể dùng ảnh cá nhân, ảnh cặp đôi, ảnh gia đình hoặc ảnh tốt nghiệp để làm nội dung in và nội dung trang kỷ niệm.',
        },
        {
          question: 'Móc khóa có phù hợp làm quà số lượng nhỏ không?',
          answer:
            'Có. Sản phẩm phù hợp cả đơn một chiếc, cặp đôi hoặc bộ nhiều chiếc cho nhóm bạn và gia đình.',
        },
      ]}
      relatedLinks={[
        { href: '/moc-khoa-in-anh-theo-yeu-cau', label: 'Móc khóa in ảnh' },
        { href: '/moc-khoa-nfc', label: 'Móc khóa NFC' },
        { href: '/templates', label: 'Mẫu thiết kế' },
      ]}
    />
  );
}
