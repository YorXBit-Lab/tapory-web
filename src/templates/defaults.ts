import type { TemplateId } from '@/configs/types';

type ContentFields = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  spotifyUrl: string;
  date: string;
  // Stardust extras
  mainGreeting?: string;
  bigWish?: string;
  finalMessage?: string;
  photoUrls?: string[];
};

/**
 * Nội dung mẫu cho mỗi template — dùng cho cả bản xem thử (demo) lẫn card thật
 * khi chưa có dữ liệu. Field chữ điền NỘI DUNG MẪU thật (tên, lời chúc…) để bản
 * xem thử sống động, người dùng thấy ngay card hoàn thiện sẽ trông thế nào;
 * field ảnh/ngày/link để trống (trạng thái "chưa thêm").
 */
export const TEMPLATE_DEFAULTS: Record<TemplateId, ContentFields> = {
  graduation: {
    title:       'Minh Anh',
    subtitle:    'ĐH Kinh tế Quốc dân · Marketing',
    description: 'Chúc mừng tân cử nhân! Bốn năm nỗ lực hôm nay đã nở hoa. Chúc cậu vững bước trên chặng đường mới, thành công và luôn rực rỡ như chính cậu.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  anniversary: {
    title:       'Minh & An',
    subtitle:    '',
    description: 'Cảm ơn vì đã cùng nhau đi qua từng ấy năm — qua những ngày nắng đẹp lẫn những hôm mưa dầm. Mong mình cứ nắm tay nhau như thế, thật lâu thật lâu nữa.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  wedding: {
    title:       'Tuấn & Ngọc',
    subtitle:    '',
    description: 'Chúc hai bạn trăm năm hạnh phúc, mãi yêu nhau như ngày đầu. Chặng đường phía trước xin được cùng nhau viết tiếp bằng thật nhiều yêu thương.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  birthday: {
    title:       'Bảo An',
    subtitle:    '',
    description: 'Chúc cậu tuổi mới thật rực rỡ — cười nhiều hơn, lo ít đi, và mọi điều dịu dàng nhất đều tìm đến cậu. Happy birthday!',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  spotify: {
    title:       'Nơi Này Có Anh',
    subtitle:    'Sơn Tùng M-TP',
    description: 'Mỗi lần bài này vang lên là lại nhớ đến cậu. Nghe cùng mình nhé?',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  social: {
    title:       'Minh Thư',
    subtitle:    '☕ Cà phê · 📷 Chụp ảnh · ✈️ Xê dịch',
    description: 'Chào cậu, mình là Thư! Kết nối với mình qua các kênh bên dưới nha.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  profile: {
    title:       'Nguyễn Minh Khang',
    subtitle:    'Product Designer · Freelancer',
    description: 'Thiết kế trải nghiệm số cho thương hiệu của bạn. Hơn 5 năm làm sản phẩm — tối giản, chỉn chu, đúng hẹn.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  keepsake: {
    title:       'Chiếc vòng tay bạc',
    subtitle:    'Sinh nhật 20 · Mẹ tặng',
    description: 'Món quà mẹ đặt vào tay mình năm 20 tuổi, kèm lời dặn: "Đi đâu cũng nhớ đường về nhà." Mình vẫn đeo nó mỗi ngày.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  album: {
    title:       'Kỷ niệm của chúng mình',
    subtitle:    '',
    description: 'Mỗi tấm ảnh là một ngày mình muốn giữ mãi — cảm ơn vì đã ở đó, trong từng khoảnh khắc.',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  redirect: {
    title:       '',
    subtitle:    '',
    description: '',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  stardust: {
    title:        'Bảo An',
    subtitle:     '',
    description:  'Hôm nay là một ngày thật đặc biệt.\nChúc bạn luôn xinh đẹp, vui vẻ\nvà gặp thật nhiều may mắn.',
    date:         '',
    imageUrl:     '',
    spotifyUrl:   '',
    mainGreeting: 'Chúc Mừng',
    bigWish:      'Happy Birthday',
    finalMessage: 'Cảm ơn vì đã xuất hiện\ntrong cuộc đời tôi',
    photoUrls:    [],
  },
};
