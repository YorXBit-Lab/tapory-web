import { registerTemplate } from '@/templates/registry';
import { STARDUST_STYLES, STARDUST_FIELDS } from './config';
import { StardustFilm } from './layouts/Film';

registerTemplate({
  id: 'stardust',
  styles: STARDUST_STYLES,
  fields: STARDUST_FIELDS,
  layouts: { film: StardustFilm },
  frameIds: [],
  imageModes: [],
});
