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
