import type { ITemplate, TemplateId } from './types';

export const TEMPLATES: Record<TemplateId, ITemplate> = {
  graduation: {
    id: 'graduation',
    name: 'Tốt Nghiệp',
    icon: '🎓',
    occasion: 'Ra trường',
    colors: {
      primary: '#1a2744',
      secondary: '#c9a93c',
      background: '#f8f6f0',
    },
  },
  wedding: {
    id: 'wedding',
    name: 'Đám Cưới',
    icon: '💍',
    occasion: 'Ngày cưới',
    colors: {
      primary: '#c45c8a',
      secondary: '#f8b4cc',
      background: '#fdf5f8',
    },
  },
  birthday: {
    id: 'birthday',
    name: 'Sinh Nhật',
    icon: '🎂',
    occasion: 'Birthday',
    colors: {
      primary: '#7c3aed',
      secondary: '#f59e0b',
      background: '#faf5ff',
    },
  },
  anniversary: {
    id: 'anniversary',
    name: 'Kỷ Niệm',
    icon: '💕',
    occasion: 'Anniversary',
    colors: {
      primary: '#8b1a1a',
      secondary: '#c9a93c',
      background: '#fdf5f5',
    },
  },
  spotify: {
    id: 'spotify',
    name: 'Nhạc Spotify',
    icon: '🎵',
    occasion: 'Tặng bài hát',
    colors: {
      primary: '#1db954',
      secondary: '#191414',
      background: '#f0fdf4',
    },
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

export const FIRESTORE_COLLECTIONS = {
  MEMORIALS: 'memorials',
} as const;
