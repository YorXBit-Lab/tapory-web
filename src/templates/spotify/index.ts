import { registerTemplate } from '@/templates/registry';
import { SPOTIFY_STYLES, SPOTIFY_FIELDS } from './config';
import { SpotPlayer } from './layouts/Player';
import { SpotVinyl }  from './layouts/Vinyl';
import { SpotLight }  from './layouts/Light';

registerTemplate({
  id: 'spotify',
  styles: SPOTIFY_STYLES,
  fields: SPOTIFY_FIELDS,
  layouts: {
    player: SpotPlayer,
    vinyl:  SpotVinyl,
    light:  SpotLight,
  },
});
