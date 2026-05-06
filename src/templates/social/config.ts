import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const SOCIAL_STYLES: ITemplateStyle[] = [
  { id: 'soc-linktree', layout: 'linktree', name: 'Link Bio',
    colors: { primary: '#2563eb', secondary: '#7c3aed', accent: '#eff6ff' } },
  { id: 'soc-profile',  layout: 'profile',  name: 'Profile',
    colors: { primary: '#111827', secondary: '#6366f1', accent: '#f9fafb' } },
  { id: 'soc-dark',     layout: 'dark',     name: 'Dark',
    colors: { primary: '#a855f7', secondary: '#3b82f6', accent: '#0f0f1a' } },
];

export const SOCIAL_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh đại diện', placeholder: '',                                 type: 'image'    },
  { key: 'title',       label: 'Tên hiển thị', placeholder: 'VD: @username',                   type: 'text'     },
  { key: 'subtitle',    label: 'Bio / Tagline', placeholder: 'VD: Photographer · Hồ Chí Minh', type: 'text'     },
  { key: 'description', label: 'Mô tả thêm',   placeholder: 'Giới thiệu bản thân…',            type: 'textarea' },
];
