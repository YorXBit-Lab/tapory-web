import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const WEDDING_STYLES: ITemplateStyle[] = [
  { id: 'wed-romantic', layout: 'romantic', name: 'Romantic',
    colors: { primary: '#c45c8a', secondary: '#f8b4cc', accent: '#fdf5f8' } },
  { id: 'wed-elegant',  layout: 'elegant',  name: 'Elegant',
    colors: { primary: '#1c1c1c', secondary: '#c9a93c', accent: '#fafaf8' } },
  { id: 'wed-story',    layout: 'story',    name: 'Story',
    colors: { primary: '#ffffff', secondary: '#f8b4cc', accent: '#c45c8a' } },
];

export const WEDDING_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh cưới',            placeholder: '',                                 type: 'image'    },
  { key: 'title',       label: 'Tên cô dâu & chú rể', placeholder: 'VD: Minh & Linh',                 type: 'text'     },
  { key: 'date',        label: 'Ngày cưới',            placeholder: '',                                 type: 'date'     },
  { key: 'description', label: 'Lời chúc',             placeholder: 'Chúc hai bạn trăm năm hạnh phúc…', type: 'textarea' },
];
