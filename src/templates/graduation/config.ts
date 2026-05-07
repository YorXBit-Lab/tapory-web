import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const GRADUATION_STYLES: ITemplateStyle[] = [
  { id: 'grad-academic',  layout: 'academic',  name: 'Academic',
    colors: { primary: '#1a2744', secondary: '#c9a93c', accent: '#f8f6f0' } },
  { id: 'grad-editorial', layout: 'editorial', name: 'Editorial',
    colors: { primary: '#1a1a1a', secondary: '#c9a93c', accent: '#f2ede4' } },
  { id: 'grad-cinematic', layout: 'cinematic', name: 'Cinematic',
    colors: { primary: '#0a0a0a', secondary: '#e8c5b0', accent: '#ffffff' } },
  { id: 'grad-minimal',   layout: 'minimal',   name: 'Minimal',
    colors: { primary: '#111827', secondary: '#6366f1', accent: '#ffffff' } },
  { id: 'grad-scrapbook', layout: 'scrapbook', name: 'Scrapbook',
    colors: { primary: '#2d2d2d', secondary: '#e8705a', accent: '#fef9f0' } },
  { id: 'grad-luxury',    layout: 'luxury',    name: 'Luxury',
    colors: { primary: '#f5f0e8', secondary: '#c9a93c', accent: '#0f0f0f' } },
  { id: 'grad-pastel',    layout: 'pastel',    name: 'Pastel',
    colors: { primary: '#6b4c8a', secondary: '#f4a5b8', accent: '#fdf0f8' } },
  { id: 'grad-floral',    layout: 'floral',    name: 'Floral',
    colors: { primary: '#4a3570', secondary: '#9b7ec8', accent: '#ede0f8' } },
  { id: 'grad-watercolor', layout: 'watercolor', name: 'Watercolor',
    colors: { primary: '#1a5f8a', secondary: '#4fa8d5', accent: '#e8f4fc' } },
  { id: 'grad-bold',      layout: 'bold',      name: 'Bold',
    colors: { primary: '#ffffff', secondary: '#e8f8ff', accent: '#00a8e8' } },
  { id: 'grad-boho',      layout: 'boho',      name: 'Boho',
    colors: { primary: '#3d2b1f', secondary: '#8b5e3c', accent: '#f5efe8' } },
  { id: 'grad-golddark',  layout: 'golddark',  name: 'Gold Dark',
    colors: { primary: '#f5e6c8', secondary: '#c9a93c', accent: '#1a1a1a' } },
];

export const GRADUATION_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh người nhận',       placeholder: '',                              type: 'image'    },
  { key: 'title',       label: 'Tên người nhận',        placeholder: 'VD: Anh Khoa',                 type: 'text'     },
  { key: 'subtitle',    label: 'Trường / Chuyên ngành', placeholder: 'VD: ĐH Bách Khoa – CNTT',      type: 'text'     },
  { key: 'description', label: 'Lời chúc',              placeholder: 'Cuối cùng cũng tốt nghiệp rồi…', type: 'textarea' },
  { key: 'date',        label: 'Ngày tốt nghiệp',       placeholder: '',                              type: 'date'     },
];
