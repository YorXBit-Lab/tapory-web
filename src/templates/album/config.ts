import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const ALBUM_STYLES: ITemplateStyle[] = [
  { id: 'album-sphere', layout: 'sphere', name: 'Cầu ảnh',
    colors: { primary: '#f5f5f7', secondary: '#7c5cff', accent: '#08070f' } },
  { id: 'album-heart',  layout: 'heart',  name: 'Trái tim',
    colors: { primary: '#fff0f4', secondary: '#ff5d8f', accent: '#1a0710' } },
  { id: 'album-orbit',  layout: 'orbit',  name: 'Vòng xoay',
    colors: { primary: '#f5f5f7', secondary: '#22d3ee', accent: '#070a10' } },
  { id: 'album-mosaic', layout: 'mosaic', name: 'Lưới ảnh',
    colors: { primary: '#f4f4f7', secondary: '#a78bfa', accent: '#0b0a12' } },
  { id: 'album-carousel', layout: 'carousel', name: 'Băng chuyền',
    colors: { primary: '#eef6f7', secondary: '#2dd4bf', accent: '#07100f' } },
  { id: 'album-reel',   layout: 'reel',   name: 'Cuộn phim',
    colors: { primary: '#f2f0ec', secondary: '#f4c542', accent: '#08080a' } },
  { id: 'album-swipe',  layout: 'swipe',  name: 'Vuốt xem',
    colors: { primary: '#f4f5f7', secondary: '#60a5fa', accent: '#080b12' } },
  { id: 'album-photobooth', layout: 'photobooth', name: 'Photobooth',
    colors: { primary: '#f6f3ee', secondary: '#ff5d8f', accent: '#12080d' } },
  { id: 'album-rain',    layout: 'rain',    name: 'Mưa ảnh',
    colors: { primary: '#eef4fa', secondary: '#7dd3fc', accent: '#070b12' } },
  { id: 'album-tunnel',  layout: 'tunnel',  name: 'Xuyên không',
    colors: { primary: '#eef0ff', secondary: '#818cf8', accent: '#08081a' } },
  { id: 'album-drift',   layout: 'drift',   name: 'Đèn trời',
    colors: { primary: '#fdf6ea', secondary: '#fbbf24', accent: '#100a04' } },
  { id: 'album-cascade', layout: 'cascade', name: 'Thác ảnh',
    colors: { primary: '#eefaf4', secondary: '#34d399', accent: '#06100c' } },
  { id: 'album-helix',   layout: 'helix',   name: 'Vòng xoắn',
    colors: { primary: '#fdf0f6', secondary: '#f472b6', accent: '#12070e' } },
  { id: 'album-wave',    layout: 'wave',    name: 'Sóng ảnh',
    colors: { primary: '#ecf6fd', secondary: '#38bdf8', accent: '#060d14' } },
];

export const ALBUM_FIELDS: FieldMeta[] = [
  { key: 'galleryUrls', label: 'Ảnh kỷ niệm (10–30 ảnh)', placeholder: '', type: 'gallery'  },
  { key: 'title',       label: 'Tiêu đề album',           placeholder: 'VD: Kỷ niệm của chúng mình', type: 'text'     },
  { key: 'date',        label: 'Ngày / mốc thời gian',    placeholder: '',                            type: 'date'     },
  { key: 'description', label: 'Lời nhắn',                placeholder: 'Đôi dòng kể về những khoảnh khắc này…', type: 'textarea' },
];
