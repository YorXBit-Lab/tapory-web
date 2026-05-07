import { registerTemplate } from '@/templates/registry';
import { SPOTIFY_STYLES, SPOTIFY_FIELDS } from './config';
import { SpotEmbed }        from './layouts/Embed';
import { SpotPlayer }       from './layouts/Player';
import { SpotPlayerPremium } from './layouts/PlayerPremium';
import { SpotVinyl }        from './layouts/Vinyl';
import { SpotLight }        from './layouts/Light';
import { SpotNeon }         from './layouts/Neon';
import { SpotCassette }     from './layouts/Cassette';
import { SpotAurora }       from './layouts/Aurora';
import { SpotWave }         from './layouts/Wave';
import { SpotLofi }         from './layouts/Lofi';

registerTemplate({
  id: 'spotify',
  styles: SPOTIFY_STYLES,
  fields: SPOTIFY_FIELDS,
  layouts: {
    embed:    SpotEmbed,
    player:   SpotPlayer,
    premium:  SpotPlayerPremium,
    vinyl:    SpotVinyl,
    light:    SpotLight,
    neon:     SpotNeon,
    cassette: SpotCassette,
    aurora:   SpotAurora,
    wave:     SpotWave,
    lofi:     SpotLofi,
  },
});
