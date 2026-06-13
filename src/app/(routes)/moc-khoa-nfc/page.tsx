import type { Metadata } from 'next';
import { KeywordLandingPage } from '@/components/seo/KeywordLandingPage';
import { createPageMetadata } from '@/libs/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Móc khóa NFC mở trang kỷ niệm cá nhân',
  description:
    'Móc khóa NFC Góc Chạm giúp mở trang kỷ niệm cá nhân bằng một cái chạm: không cần app, dùng được với điện thoại có NFC và phù hợp làm quà tặng cá nhân hóa.',
  path: '/moc-khoa-nfc',
});

export default function MocKhoaNfcPage() {
  return (
    <KeywordLandingPage
      path="/moc-khoa-nfc"
      eyebrow="Móc khóa NFC"
      title="Móc khóa NFC chạm điện thoại để mở trang kỷ niệm"
      description="Mỗi móc khóa NFC có một URL riêng. Khi người nhận chạm điện thoại vào móc khóa, trang kỷ niệm cá nhân sẽ mở ngay trong trình duyệt mà không cần tải ứng dụng."
      productName="Móc khóa NFC Góc Chạm"
      intro="Một chip NFC nhỏ biến móc khóa thành cánh cửa mở ra album, lời nhắn, bài hát hoặc câu chuyện riêng."
      features={[
        {
          title: 'Không cần cài app',
          body: 'Người nhận chỉ cần dùng điện thoại có NFC và mở link trong trình duyệt, phù hợp cho trải nghiệm tặng quà đơn giản.',
        },
        {
          title: 'URL riêng cho từng móc',
          body: 'Mỗi móc khóa được gắn với một đường dẫn riêng để quản lý nội dung kỷ niệm của từng đơn hàng.',
        },
        {
          title: 'Nội dung có thể thay đổi',
          body: 'Chip giữ nguyên URL, còn nội dung trang có thể chỉnh sửa theo quyền truy cập nên món quà không bị cố định như thiệp giấy.',
        },
      ]}
      useCases={[
        'Album cặp đôi',
        'Lời chúc sinh nhật',
        'Bài hát kỷ niệm',
        'Trang tốt nghiệp',
        'Thiệp cưới số',
        'Profile cá nhân',
        'Link mạng xã hội',
        'Kỷ niệm gia đình',
      ]}
      faqs={[
        {
          question: 'Điện thoại nào dùng được móc khóa NFC?',
          answer:
            'Hầu hết điện thoại Android có NFC và nhiều dòng iPhone đời mới có thể đọc NFC. Người nhận chỉ cần chạm vùng NFC của điện thoại vào móc khóa.',
        },
        {
          question: 'Móc khóa NFC có cần pin không?',
          answer:
            'Không. Chip NFC thụ động, không cần pin và được đọc bởi điện thoại khi chạm gần.',
        },
        {
          question: 'Nếu muốn đổi nội dung trang kỷ niệm thì sao?',
          answer:
            'URL trong chip được giữ nguyên. Bạn chỉ cần cập nhật nội dung trang được liên kết với URL đó nếu còn quyền chỉnh sửa.',
        },
      ]}
      relatedLinks={[
        { href: '/moc-khoa', label: 'Móc khóa cá nhân hóa' },
        { href: '/moc-khoa-in-anh-theo-yeu-cau', label: 'Móc khóa in ảnh' },
        { href: '/templates', label: 'Mẫu trang kỷ niệm' },
      ]}
    />
  );
}
