import { registerTemplate } from '@/templates/registry';
import { SPOTIFY_STYLES, SPOTIFY_FIELDS } from './config';
import { SpotEmbed } from './layouts/Embed';

registerTemplate({
  id: 'spotify',
  styles: SPOTIFY_STYLES,
  fields: SPOTIFY_FIELDS,
  layouts: {
    embed: SpotEmbed,
  },
});
