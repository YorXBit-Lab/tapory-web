import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const KEEPSAKE_STYLES: ITemplateStyle[] = [
  { id: 'keep-tag',     layout: 'tag',     name: 'Nhãn Quà',
    colors: { primary: '#5c4631', secondary: '#c9a06b', accent: '#f3ead9' } },
  { id: 'keep-letter',  layout: 'letter',  name: 'Lá Thư',
    colors: { primary: '#3a342c', secondary: '#9c7b4d', accent: '#faf6ee' } },
  { id: 'keep-capsule', layout: 'capsule', name: 'Kỷ Vật',
    colors: { primary: '#e8d9c0', secondary: '#c9a06b', accent: '#161311' } },
];

export const KEEPSAKE_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh kỷ vật',       placeholder: '',                              type: 'image'    },
  { key: 'title',       label: 'Tên kỷ vật',        placeholder: 'VD: Quà 1 năm bên nhau',       type: 'text'     },
  { key: 'subtitle',    label: 'Dịp · Người tặng',  placeholder: 'VD: Kỷ niệm 1 năm · Từ Anh',   type: 'text'     },
  { key: 'date',        label: 'Ngày lưu giữ',      placeholder: '',                              type: 'date'     },
  { key: 'description', label: 'Câu chuyện / Lời nhắn', placeholder: 'Kể lại kỷ niệm gắn với món quà này…', type: 'textarea' },
];
