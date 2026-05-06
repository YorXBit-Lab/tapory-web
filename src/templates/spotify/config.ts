import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const SPOTIFY_STYLES: ITemplateStyle[] = [
  { id: 'spot-default', layout: 'embed', name: 'Spotify',
    colors: { primary: '#1db954', secondary: '#ffffff', accent: '#191414' } },
];

export const SPOTIFY_FIELDS: FieldMeta[] = [
  { key: 'spotifyUrl',  label: 'Link Spotify', placeholder: 'https://open.spotify.com/track/…',    type: 'url'      },
  { key: 'description', label: 'Lời nhắn',     placeholder: 'Bài hát này khiến mình nhớ đến bạn…', type: 'textarea' },
];
