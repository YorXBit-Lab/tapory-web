import { registerTemplate } from '@/templates/registry';
import { GRADUATION_STYLES, GRADUATION_FIELDS } from './config';
import { GradAcademic }  from './layouts/Academic';
import { GradEditorial } from './layouts/Editorial';
import { GradCinematic } from './layouts/Cinematic';
import { GradMinimal }   from './layouts/Minimal';
import { GradScrapbook } from './layouts/Scrapbook';
import { GradLuxury }    from './layouts/Luxury';
import { GradPastel }    from './layouts/Pastel';

registerTemplate({
  id: 'graduation',
  styles: GRADUATION_STYLES,
  fields: GRADUATION_FIELDS,
  layouts: {
    academic:  GradAcademic,
    editorial: GradEditorial,
    cinematic: GradCinematic,
    minimal:   GradMinimal,
    scrapbook: GradScrapbook,
    luxury:    GradLuxury,
    pastel:    GradPastel,
  },
});
