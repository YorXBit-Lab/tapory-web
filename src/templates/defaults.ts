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
 * Giá trị khởi tạo CHUNG CHUNG cho mỗi template — dùng cho cả bản xem thử (demo)
 * lẫn card thật khi chưa có dữ liệu. Field chữ điền nhãn gợi ý để người dùng biết
 * cần thay; field ảnh/ngày/link để trống (trạng thái "chưa thêm").
 */
export const TEMPLATE_DEFAULTS: Record<TemplateId, ContentFields> = {
  graduation: {
    title:       'Tên người nhận',
    subtitle:    'Tên trường – Ngành học',
    description: 'Lời chúc mừng tốt nghiệp dành cho bạn ấy…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  anniversary: {
    title:       'Tên hai bạn',
    subtitle:    '',
    description: 'Lời chúc kỷ niệm dành cho hai bạn…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  wedding: {
    title:       'Tên cô dâu & chú rể',
    subtitle:    '',
    description: 'Lời chúc mừng hạnh phúc dành cho đôi uyên ương…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  birthday: {
    title:       'Tên người nhận',
    subtitle:    '',
    description: 'Lời chúc sinh nhật dành cho bạn…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  spotify: {
    title:       'Tên bài hát',
    subtitle:    'Tên nghệ sĩ',
    description: 'Lời nhắn của bạn…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  social: {
    title:       'Tên hiển thị',
    subtitle:    'Bio / Giới thiệu ngắn',
    description: 'Giới thiệu thêm về bạn…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  profile: {
    title:       'Họ và tên',
    subtitle:    'Chức danh / Nghề nghiệp',
    description: 'Vài dòng giới thiệu về bản thân…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  keepsake: {
    title:       'Tên kỷ vật',
    subtitle:    'Dịp · Người tặng',
    description: 'Kể lại kỷ niệm gắn với món quà này…',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  album: {
    title:       'Album kỷ niệm',
    subtitle:    '',
    description: 'Đôi dòng kể về những khoảnh khắc này…',
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
