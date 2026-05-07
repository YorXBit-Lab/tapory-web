import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const PROFILE_STYLES: ITemplateStyle[] = [
  { id: 'prof-clean',    layout: 'clean',    name: 'Danh thiếp',
    colors: { primary: '#1a1a1a', secondary: '#2563eb', accent: '#ffffff' } },
  { id: 'prof-dark',     layout: 'dark',     name: 'Sang trọng',
    colors: { primary: '#ffffff', secondary: '#c9a93c', accent: '#0d0d0d' } },
  { id: 'prof-creative', layout: 'creative', name: 'Hiện đại',
    colors: { primary: '#1a1a1a', secondary: '#7c3aed', accent: '#f5f3ff' } },
];

export const PROFILE_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh đại diện',  placeholder: '',                           type: 'image'    },
  { key: 'title',       label: 'Họ và tên',      placeholder: 'VD: Nguyễn Văn A',          type: 'text'     },
  { key: 'subtitle',    label: 'Chức danh',      placeholder: 'VD: Designer · Freelancer', type: 'text'     },
  { key: 'description', label: 'Giới thiệu',     placeholder: 'Một vài dòng về bản thân…', type: 'textarea' },
  { key: 'email',       label: 'Email',           placeholder: 'example@email.com',         type: 'text'     },
  { key: 'phone',       label: 'Số điện thoại',  placeholder: '0912 345 678',              type: 'text'     },
  { key: 'facebookUrl',  label: 'Facebook',  placeholder: 'https://facebook.com/…',  type: 'url' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…', type: 'url' },
  { key: 'tiktokUrl',    label: 'TikTok',    placeholder: 'https://tiktok.com/@…',   type: 'url' },
];
