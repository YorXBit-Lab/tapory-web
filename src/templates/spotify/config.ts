import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const SPOTIFY_STYLES: ITemplateStyle[] = [
  { id: 'spot-player', layout: 'player', name: 'Player',
    colors: { primary: '#1db954', secondary: '#ffffff', accent: '#191414' } },
  { id: 'spot-vinyl',  layout: 'vinyl',  name: 'Vinyl',
    colors: { primary: '#f0c040', secondary: '#ffffff', accent: '#0d0d0d' } },
  { id: 'spot-light',  layout: 'light',  name: 'Light',
    colors: { primary: '#1db954', secondary: '#191414', accent: '#ffffff' } },
];

export const SPOTIFY_FIELDS: FieldMeta[] = [
  { key: 'title',       label: 'Tên bài hát',  placeholder: 'VD: Có Chắc Yêu Là Đây',              type: 'text'     },
  { key: 'subtitle',    label: 'Nghệ sĩ',      placeholder: 'VD: Sơn Tùng M-TP',                   type: 'text'     },
  { key: 'spotifyUrl',  label: 'Link Spotify',  placeholder: 'https://open.spotify.com/track/…',    type: 'url'      },
  { key: 'description', label: 'Lời nhắn',      placeholder: 'Bài hát này khiến mình nhớ đến bạn…', type: 'textarea' },
];
