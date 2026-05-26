export type TemplateId = 'graduation' | 'wedding' | 'birthday' | 'anniversary' | 'spotify' | 'social' | 'profile' | 'redirect';

export type CardStatus = 'blank' | 'assigned' | 'published' | 'locked' | 'expired';

export interface ICard {
  id: string;
  orderId: string;
  status: CardStatus;
  hasContent: boolean;
  templateId?: TemplateId;
  editDeadline?: string;
  publishedAt?: string;
  lockedAt?: string;
  lockedBy?: string;
  nfcWritten?: boolean;
  nfcWrittenAt?: string;
  stats: { totalViews: number; lastViewedAt?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ITemplateStyle {
  id: string;
  name: string;
  layout: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface IFrame {
  id: string;
  name: string;
  icon: string;
}

export interface IEffect {
  id: string;
  name: string;
  icon: string;
}

export interface ITemplate {
  id: TemplateId;
  name: string;
  icon: string;
  occasion: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export type PrintShape = 'rectangle' | 'square' | 'circle';

export interface IPrintPhotoSlot {
  itemIndex: number;
  slotIndex: number; // 0..quantity-1
  side?: 'a' | 'b'; // NFC items have 2 sides; non-NFC omits this (treated as 'a')
  url: string;
  uploadedAt: string;
}

export interface IPrintConfig {
  enabled: boolean;
  shape?: PrintShape;
  width?: number;    // cm - cho rectangle / square
  height?: number;   // cm - cho rectangle
  diameter?: number; // cm - cho circle
}

export interface IProduct {
  id: string;
  name: string;
  price: number;
  canBeNfc: boolean; // sản phẩm có thể thêm NFC — lựa chọn thực tế nằm ở lúc tạo đơn
  nfcExtraPrice?: number; // phụ phí khi thêm NFC; nếu không set thì dùng DEFAULT_NFC_EXTRA_PRICE
  templateId?: TemplateId; // template gợi ý mặc định khi chọn NFC
  description?: string;
  imageUrl?: string;
  printConfig?: IPrintConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMemorial {
  orderId: string;
  templateId: TemplateId;
  styleId: string;
  frameId: string;
  effectId: string;
  bgColor: string;
  bgImageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  date?: string;
  fontStyle?: string;
  titleSize?: string;
  imageMode?: string;
  imageFilter?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface IMemorialDoc extends IMemorial {
  createdAt?: string;
  updatedAt?: string;
}

export interface IEditDraft extends IMemorial {
  isDirty: boolean;
}
