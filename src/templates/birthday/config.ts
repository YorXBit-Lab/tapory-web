import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const BIRTHDAY_STYLES: ITemplateStyle[] = [
  { id: 'bday-party',   layout: 'party',   name: 'Party',
    colors: { primary: '#7c3aed', secondary: '#f59e0b', accent: '#faf5ff' } },
  { id: 'bday-retro',   layout: 'retro',   name: 'Retro',
    colors: { primary: '#d62828', secondary: '#f7b731', accent: '#fff9f0' } },
  { id: 'bday-minimal', layout: 'minimal', name: 'Minimal',
    colors: { primary: '#111827', secondary: '#6366f1', accent: '#f9fafb' } },
  { id: 'bday-elegant', layout: 'elegant', name: 'Elegant',
    colors: { primary: '#ffffff', secondary: '#c9a93c', accent: '#0d0d0d' } },
  { id: 'bday-pastel',  layout: 'pastel',  name: 'Pastel',
    colors: { primary: '#be185d', secondary: '#f9a8d4', accent: '#fdf2f8' } },
];

export const BIRTHDAY_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh',            placeholder: '',                           type: 'image'    },
  { key: 'title',       label: 'Tên người nhận', placeholder: 'VD: Bảo An',                type: 'text'     },
  { key: 'date',        label: 'Ngày sinh nhật', placeholder: '',                           type: 'date'     },
  { key: 'description', label: 'Lời chúc',       placeholder: 'Happy Birthday! Chúc bạn…', type: 'textarea' },
];
