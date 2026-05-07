import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const SPOTIFY_STYLES: ITemplateStyle[] = [
  { id: 'spot-vinyl',    layout: 'vinyl',   name: 'Vinyl',
    colors: { primary: '#1db954', secondary: '#e8f8ee', accent: '#111111' } },
  { id: 'spot-default',  layout: 'embed',   name: 'Spotify',
    colors: { primary: '#1db954', secondary: '#ffffff', accent: '#191414' } },
  { id: 'spot-player',   layout: 'player',  name: 'Player',
    colors: { primary: '#1db954', secondary: '#ffffff', accent: '#0d1117' } },
  { id: 'spot-premium',  layout: 'premium', name: 'Premium',
    colors: { primary: '#1db954', secondary: '#e8ffe8', accent: '#121212' } },
  { id: 'spot-light',    layout: 'light',   name: 'Light',
    colors: { primary: '#1db954', secondary: '#1a1a2e', accent: '#f8fff8' } },
  { id: 'spot-neon',     layout: 'neon',    name: 'Neon',
    colors: { primary: '#bd00ff', secondary: '#00f5ff', accent: '#06040e' } },
  { id: 'spot-cassette', layout: 'cassette', name: 'Cassette',
    colors: { primary: '#c0392b', secondary: '#2c1810', accent: '#f5e8d3' } },
  { id: 'spot-aurora',   layout: 'aurora',   name: 'Aurora',
    colors: { primary: '#00d4aa', secondary: '#c8e6ff', accent: '#04091a' } },
  { id: 'spot-wave',     layout: 'wave',     name: 'Wave',
    colors: { primary: '#ff6b6b', secondary: '#ffd93d', accent: '#0e0a24' } },
  { id: 'spot-lofi',     layout: 'lofi',     name: 'Lo-Fi',
    colors: { primary: '#8b5e3c', secondary: '#3d2b1f', accent: '#f5ece1' } },
];

export const SPOTIFY_FIELDS: FieldMeta[] = [
  { key: 'imageUrl',    label: 'Ảnh bìa',      placeholder: '',                                    type: 'image'    },
  { key: 'title',       label: 'Tên bài hát',   placeholder: 'VD: Có Chắc Yêu Là Đây',             type: 'text'     },
  { key: 'subtitle',    label: 'Nghệ sĩ',       placeholder: 'VD: Sơn Tùng M-TP',                  type: 'text'     },
  { key: 'spotifyUrl',  label: 'Link Spotify',  placeholder: 'https://open.spotify.com/track/…',   type: 'url'      },
  { key: 'description', label: 'Lời nhắn',      placeholder: 'Bài hát này khiến mình nhớ đến bạn…',type: 'textarea' },
];
