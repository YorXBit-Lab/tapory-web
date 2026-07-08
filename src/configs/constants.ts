import type { IEffect, IFrame, IIntro, ITemplate, TemplateId, ProductType } from './types';

/** Phụ phí NFC mặc định khi chưa cấu hình settings/global. */
export const DEFAULT_NFC_EXTRA_PRICE = 0;

/** Nhãn hiển thị cho từng loại sản phẩm vật lý. Thêm dòng hàng mới = thêm một entry. */
export const PRODUCT_TYPES: Record<ProductType, string> = {
  keychain: 'Móc khóa',
  plush: 'Gấu bông',
  'photo-frame': 'Khung ảnh',
  standee: 'Standee',
  card: 'Thẻ / Card',
  other: 'Khác',
};

export const TEMPLATES: Record<TemplateId, ITemplate> = {
  graduation: {
    id: 'graduation',
    name: 'Tốt Nghiệp',
    icon: '🎓',
    occasion: 'Ra trường',
    colors: {
      primary: '#1a2744',
      secondary: '#c9a93c',
      background: '#f8f6f0',
    },
  },
  wedding: {
    id: 'wedding',
    name: 'Đám Cưới',
    icon: '💍',
    occasion: 'Ngày cưới',
    colors: {
      primary: '#c45c8a',
      secondary: '#f8b4cc',
      background: '#fdf5f8',
    },
  },
  birthday: {
    id: 'birthday',
    name: 'Sinh Nhật',
    icon: '🎂',
    occasion: 'Birthday',
    colors: {
      primary: '#7c3aed',
      secondary: '#f59e0b',
      background: '#faf5ff',
    },
  },
  anniversary: {
    id: 'anniversary',
    name: 'Kỷ Niệm',
    icon: '💕',
    occasion: 'Anniversary',
    colors: {
      primary: '#8b1a1a',
      secondary: '#c9a93c',
      background: '#fdf5f5',
    },
  },
  spotify: {
    id: 'spotify',
    name: 'Nhạc Spotify',
    icon: '🎵',
    occasion: 'Tặng bài hát',
    colors: {
      primary: '#1db954',
      secondary: '#191414',
      background: '#f0fdf4',
    },
  },
  social: {
    id: 'social',
    name: 'Mạng Xã Hội',
    icon: '📲',
    occasion: 'Kết nối & chia sẻ',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      background: '#eff6ff',
    },
  },
  profile: {
    id: 'profile',
    name: 'Thông Tin Cá Nhân',
    icon: '🪪',
    occasion: 'Giới thiệu bản thân',
    colors: {
      primary: '#1a1a1a',
      secondary: '#2563eb',
      background: '#ffffff',
    },
  },
  keepsake: {
    id: 'keepsake',
    name: 'Kỷ Vật',
    icon: '🎁',
    occasion: 'Lưu giữ kỷ niệm gắn vào vật',
    colors: {
      primary: '#5c4631',
      secondary: '#c9a06b',
      background: '#f3ead9',
    },
  },
  album: {
    id: 'album',
    name: 'Album Ảnh',
    icon: '📸',
    occasion: 'Album kỷ niệm nhiều ảnh',
    colors: {
      primary: '#1a1a1a',
      secondary: '#c44f6a',
      background: '#0e0e12',
    },
  },
  redirect: {
    id: 'redirect',
    name: 'Chuyển Hướng',
    icon: '🔗',
    occasion: 'Redirect đến link',
    colors: {
      primary: '#0f172a',
      secondary: '#6366f1',
      background: '#f8fafc',
    },
  },
  stardust: {
    id: 'stardust',
    name: 'Phim Ký Ức',
    icon: '🌌',
    occasion: 'Memory film 3D',
    colors: {
      primary: '#c86adf',
      secondary: '#ff9ecb',
      background: '#0b0618',
    },
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

/**
 * Template tạm ẩn khỏi phần chọn mẫu cho khách (gallery + editor picker).
 * Định nghĩa vẫn giữ trong TEMPLATES để thẻ đã tạo và trang admin vẫn hoạt động.
 * Muốn bật lại: xoá id khỏi mảng này.
 */
export const HIDDEN_TEMPLATE_IDS: TemplateId[] = ['spotify'];

/** Danh sách template hiển thị cho khách — đã loại các mẫu tạm ẩn. */
export const PUBLIC_TEMPLATE_LIST = TEMPLATE_LIST.filter((t) => !HIDDEN_TEMPLATE_IDS.includes(t.id));

export const BG_PRESETS = [
  '#ffffff', '#f8f6f0', '#fdf5f8', '#f0fdf4',
  '#eff6ff', '#faf5ff', '#fff7ed', '#f0fdfe',
  '#1a1a2e', '#0f172a', '#1a2744', '#191414',
];

export const FRAMES: IFrame[] = [
  { id: 'none',       name: 'Không',      icon: '⬜' },
  { id: 'minimal',    name: 'Minimal',    icon: '▢'  },
  { id: 'floral',     name: 'Floral',     icon: '🌸' },
  { id: 'rose-gold',  name: 'Rose Gold',  icon: '🌹' },
  { id: 'lace',       name: 'Ren trắng',  icon: '🤍' },
  { id: 'botanical',  name: 'Botanical',  icon: '🌿' },
  { id: 'grad-border',name: 'Graduation', icon: '🎓' },
  { id: 'cute',       name: 'Cute',       icon: '🎀' },
  { id: 'luxury',     name: 'Luxury',     icon: '✨' },
  { id: 'geometric',  name: 'Geometric',  icon: '◈'  },
  { id: 'vintage',    name: 'Vintage',    icon: '🕰️'  },
  { id: 'popup',      name: '3D Pop-up',  icon: '🎊' },
];

export const EFFECTS: IEffect[] = [
  { id: 'none',      name: 'Không',     icon: '⬜' },
  { id: 'fireworks', name: 'Pháo hoa',  icon: '🎆' },
  { id: 'confetti',  name: 'Confetti',  icon: '🎊' },
  { id: 'snow',      name: 'Tuyết rơi', icon: '❄️'  },
  { id: 'hearts',    name: 'Tim bay',   icon: '💕' },
  { id: 'sparkles',  name: 'Lấp lánh', icon: '✨' },
  { id: 'petals',    name: 'Cánh hoa',  icon: '🌸' },
  { id: 'bubbles',   name: 'Bong bóng', icon: '🫧' },
  { id: 'rain',      name: 'Mưa vàng',  icon: '🌧️'  },
  { id: 'poop',      name: 'Mưa bùn',   icon: '💩' },
  { id: 'money',     name: 'Tiền bay',  icon: '💸' },
  { id: 'party',     name: 'Bữa tiệc',  icon: '🎉' },
];

export const INTROS: IIntro[] = [
  { id: 'none',       name: 'Không',        icon: '⬜', hint: 'Hiển thị thẳng nội dung' },
  { id: 'letter',     name: 'Phong Bì',     icon: '📮', hint: 'Chạm mở phong bì' },
  { id: 'curtain',    name: 'Màn Nhung',    icon: '🎭', hint: 'Kéo màn sân khấu' },
  { id: 'polaroid',   name: 'Polaroid',     icon: '📸', hint: 'Lật ảnh polaroid' },
  { id: 'countdown',  name: 'Điện Ảnh',    icon: '🎬', hint: 'Đếm ngược phim' },
  { id: 'typewriter', name: 'Lời Nhắn',    icon: '✍️', hint: 'Lời nhắn bí mật' },
  { id: 'rose',       name: 'Hoa Nở',      icon: '🌹', hint: 'Hoa hồng nở rộ' },
  { id: 'lock',       name: 'Trái Tim',    icon: '🔐', hint: 'Mở khóa trái tim' },
  { id: 'gate',       name: 'Cánh Cửa',   icon: '🚪', hint: 'Mở cánh cửa bí ẩn' },
  { id: 'flip',       name: 'Lật Album',   icon: '📖', hint: 'Lật trang album' },
  { id: 'scratch',    name: 'Cào May Mắn', icon: '🪙', hint: 'Cào để khám phá' },
  { id: 'dust',       name: 'Bụi Ký Ức',  icon: '✨', hint: 'Hạt bụi hội tụ ký ức' },
  { id: 'voice',      name: 'Tin Nhắn',   icon: '💌', hint: 'Tin nhắn thoại bí mật' },
  { id: 'universe',   name: 'Vũ Trụ',     icon: '🌌', hint: 'Sao hội tụ từ vũ trụ' },
  { id: 'reel',       name: 'Phim Cuộn',  icon: '🎞️', hint: 'Cuộn phim điện ảnh cổ điển' },
  { id: 'book',       name: 'Sách Kỷ Niệm', icon: '📚', hint: 'Lật sách bìa cứng luxury' },
];


export const FIRESTORE_COLLECTIONS = {
  MEMORIALS: 'memorials',
  CARDS: 'cards',
  CARD_AUTH: 'cardAuth',
  CARD_VIEWS: 'cardViews',
  ORDERS: 'orders',
  ADMINS: 'admins',
  PRODUCTS: 'products',
  COMPONENTS: 'components',
  PURCHASE_ORDERS: 'purchase_orders',
  SERVICES: 'services',
  PRESET_PHOTOS: 'preset_photos',
  SHIPPING_RATES: 'shipping_rates',
} as const;
