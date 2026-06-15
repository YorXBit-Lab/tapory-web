import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const ALBUM_STYLES: ITemplateStyle[] = [
  { id: 'album-sphere', layout: 'sphere', name: 'Cầu ảnh',
    colors: { primary: '#f5f5f7', secondary: '#7c5cff', accent: '#08070f' } },
  { id: 'album-heart',  layout: 'heart',  name: 'Trái tim',
    colors: { primary: '#fff0f4', secondary: '#ff5d8f', accent: '#1a0710' } },
  { id: 'album-orbit',  layout: 'orbit',  name: 'Vòng xoay',
    colors: { primary: '#f5f5f7', secondary: '#22d3ee', accent: '#070a10' } },
];

export const ALBUM_FIELDS: FieldMeta[] = [
  { key: 'galleryUrls', label: 'Ảnh kỷ niệm (10–30 ảnh)', placeholder: '', type: 'gallery'  },
  { key: 'title',       label: 'Tiêu đề album',           placeholder: 'VD: Kỷ niệm của chúng mình', type: 'text'     },
  { key: 'date',        label: 'Ngày / mốc thời gian',    placeholder: '',                            type: 'date'     },
  { key: 'description', label: 'Lời nhắn',                placeholder: 'Đôi dòng kể về những khoảnh khắc này…', type: 'textarea' },
];
