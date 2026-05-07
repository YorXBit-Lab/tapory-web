import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const SOCIAL_STYLES: ITemplateStyle[] = [
  { id: 'soc-linktree', layout: 'linktree', name: 'Link Bio',
    colors: { primary: '#2563eb', secondary: '#7c3aed', accent: '#eff6ff' } },
];

export const SOCIAL_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh đại diện', placeholder: '',                                 type: 'image'    },
  { key: 'title',       label: 'Tên hiển thị', placeholder: 'VD: @username',                   type: 'text'     },
  { key: 'subtitle',    label: 'Bio / Tagline', placeholder: 'VD: Photographer · Hồ Chí Minh', type: 'text'     },
  { key: 'description', label: 'Mô tả thêm',   placeholder: 'Giới thiệu bản thân…',            type: 'textarea' },
  { key: 'facebookUrl',  label: 'Facebook',  placeholder: 'https://facebook.com/…',  type: 'url' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…', type: 'url' },
  { key: 'tiktokUrl',    label: 'TikTok',    placeholder: 'https://tiktok.com/@…',   type: 'url' },
  { key: 'youtubeUrl',   label: 'YouTube',   placeholder: 'https://youtube.com/…',   type: 'url' },
];
