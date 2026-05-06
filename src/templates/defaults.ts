import type { TemplateId } from '@/configs/types';

type ContentFields = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  spotifyUrl: string;
  date: string;
};

export const TEMPLATE_DEFAULTS: Record<TemplateId, ContentFields> = {
  graduation: {
    title:       'Anh Khoa',
    subtitle:    'ĐH Bách Khoa – Công nghệ Thông tin',
    description: 'Cuối cùng cũng tốt nghiệp rồi! Bốn năm đại học đầy ắp kỷ niệm và những đêm thức trắng. Chúc bạn tiếp tục toả sáng trên con đường phía trước! 🎓',
    date:        '2026-06-20',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  anniversary: {
    title:       'Minh & Linh',
    subtitle:    '',
    description: 'Ba năm bên nhau, mỗi ngày đều là một kỷ niệm đáng trân trọng. Cảm ơn em đã luôn ở bên anh dù mưa hay nắng. ❤️',
    date:        '2023-02-14',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  wedding: {
    title:       'Tuấn & Ngọc',
    subtitle:    '',
    description: 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi bên nhau và gia đình luôn ấm êm ngập tràn yêu thương! 💍',
    date:        '2026-12-12',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  birthday: {
    title:       'Bảo An',
    subtitle:    '',
    description: 'Happy Birthday! Chúc bạn tuổi mới thật nhiều niềm vui, sức khoẻ dồi dào và mọi ước mơ đều thành hiện thực! 🎂',
    date:        '2026-05-20',
    imageUrl:    '',
    spotifyUrl:  '',
  },
  spotify: {
    title:       'Có Chắc Yêu Là Đây',
    subtitle:    'Sơn Tùng M-TP',
    description: 'Mỗi lần nghe lại bài này mình lại nhớ đến những kỷ niệm đẹp của chúng mình. Tặng bạn nhé 🎵',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  'https://open.spotify.com/track/4HtSolBbVA8BfJFHE4DKFO',
  },
  social: {
    title:       '@tapory.vn',
    subtitle:    'Móc khoá kỷ niệm NFC · TP.HCM',
    description: 'Lưu giữ kỷ niệm đẹp theo cách đặc biệt nhất. Chỉ cần chạm NFC là mở ngay trang kỷ niệm riêng của bạn ✨',
    date:        '',
    imageUrl:    '',
    spotifyUrl:  '',
  },
};
