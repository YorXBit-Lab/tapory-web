import { registerTemplate } from '@/templates/registry';
import { ANNIVERSARY_STYLES, ANNIVERSARY_FIELDS } from './config';
import { AnniClassic }   from './layouts/Classic';
import { AnniEditorial } from './layouts/AnniEditorial';
import { AnniFilm }      from './layouts/Film';

registerTemplate({
  id: 'anniversary',
  styles: ANNIVERSARY_STYLES,
  fields: ANNIVERSARY_FIELDS,
  layouts: {
    classic:   AnniClassic,
    editorial: AnniEditorial,
    film:      AnniFilm,
  },
});
