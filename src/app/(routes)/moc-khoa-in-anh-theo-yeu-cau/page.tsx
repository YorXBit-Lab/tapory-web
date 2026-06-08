import type { Metadata } from 'next';
import { KeywordLandingPage } from '@/components/seo/KeywordLandingPage';
import { createPageMetadata } from '@/libs/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Móc khóa in ảnh theo yêu cầu cá nhân hóa',
  description:
    'Đặt móc khóa in ảnh theo yêu cầu tại Góc Chạm: dùng ảnh riêng, thêm tên, ngày kỷ niệm, lời nhắn và tùy chọn NFC mở trang kỷ niệm cá nhân.',
  path: '/moc-khoa-in-anh-theo-yeu-cau',
});

export default function MocKhoaInAnhPage() {
  return (
    <KeywordLandingPage
      path="/moc-khoa-in-anh-theo-yeu-cau"
      eyebrow="In ảnh theo yêu cầu"
      title="Móc khóa in ảnh theo yêu cầu, thiết kế riêng cho từng kỷ niệm"
      description="Bạn gửi ảnh, chọn phong cách và nội dung cần thể hiện. Góc Chạm biến ảnh thành móc khóa cá nhân hóa có thể tặng ngay hoặc kết hợp với NFC để mở album kỷ niệm."
      productName="Móc khóa in ảnh theo yêu cầu Góc Chạm"
      intro="Ảnh không chỉ nằm trong điện thoại; nó có thể trở thành một món quà nhỏ luôn đi cùng người nhận."
      features={[
        {
          title: 'Dùng ảnh thật của bạn',
          body: 'Ảnh cặp đôi, ảnh thú cưng, ảnh gia đình, ảnh lớp hoặc ảnh tốt nghiệp đều có thể dùng làm nội dung chính.',
        },
        {
          title: 'Thêm thông điệp cá nhân',
          body: 'Tên, ngày, câu chúc và phong cách thiết kế giúp móc khóa có cảm giác được làm riêng cho người nhận.',
        },
        {
          title: 'Có bản kỷ niệm số',
          body: 'Khi dùng thêm NFC, móc khóa không chỉ có ảnh in mà còn mở được trang album, lời nhắn hoặc bài hát riêng.',
        },
      ]}
      useCases={[
        'Ảnh người yêu',
        'Ảnh bạn thân',
        'Ảnh gia đình',
        'Ảnh thú cưng',
        'Ảnh lớp',
        'Ảnh tốt nghiệp',
        'Ảnh cưới',
        'Ảnh du lịch',
      ]}
      faqs={[
        {
          question: 'Ảnh cần chất lượng như thế nào để in móc khóa?',
          answer:
            'Nên dùng ảnh rõ mặt, đủ sáng và không bị vỡ. Nếu ảnh quá tối hoặc quá nhỏ, bạn nên chọn ảnh khác để thành phẩm sắc nét hơn.',
        },
        {
          question: 'Có thể thêm chữ lên móc khóa không?',
          answer:
            'Có. Bạn có thể thêm tên, ngày kỷ niệm, câu ngắn hoặc lời chúc tùy theo bố cục của mẫu đã chọn.',
        },
        {
          question: 'Móc khóa in ảnh có thể gắn NFC không?',
          answer:
            'Có. Bạn có thể chọn phiên bản NFC để móc khóa mở trang kỷ niệm cá nhân khi chạm điện thoại.',
        },
      ]}
      relatedLinks={[
        { href: '/moc-khoa', label: 'Móc khóa cá nhân hóa' },
        { href: '/moc-khoa-nfc', label: 'Móc khóa NFC' },
        { href: '/templates', label: 'Chọn mẫu thiết kế' },
      ]}
    />
  );
}
