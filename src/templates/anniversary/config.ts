import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const ANNIVERSARY_STYLES: ITemplateStyle[] = [
  { id: 'anni-classic',   layout: 'classic',   name: 'Classic',
    colors: { primary: '#8b1a1a', secondary: '#c9a93c', accent: '#fdf5f5' } },
  { id: 'anni-editorial', layout: 'editorial', name: 'Editorial',
    colors: { primary: '#1a1a1a', secondary: '#e8c5b0', accent: '#fdf9f6' } },
  { id: 'anni-film',      layout: 'film',      name: 'Film',
    colors: { primary: '#ffffff', secondary: '#c9a93c', accent: '#1a1a1a' } },
  { id: 'anni-love',      layout: 'love',      name: 'Love',
    colors: { primary: '#fff0f3', secondary: '#ff8fab', accent: '#1e0a12' } },
];

export const ANNIVERSARY_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh kỷ niệm', placeholder: '',                     type: 'image'    },
  { key: 'title',       label: 'Tên đôi',      placeholder: 'VD: Minh & Linh',     type: 'text'     },
  { key: 'date',        label: 'Ngày kỷ niệm', placeholder: '',                     type: 'date'     },
  { key: 'description', label: 'Lời chúc',     placeholder: 'Chúc mừng kỷ niệm…', type: 'textarea' },
];
