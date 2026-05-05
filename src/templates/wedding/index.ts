import { registerTemplate } from '@/templates/registry';
import { WEDDING_STYLES, WEDDING_FIELDS } from './config';
import { WedRomantic } from './layouts/Romantic';
import { WedElegant }  from './layouts/Elegant';
import { WedStory }    from './layouts/Story';

registerTemplate({
  id: 'wedding',
  styles: WEDDING_STYLES,
  fields: WEDDING_FIELDS,
  layouts: {
    romantic: WedRomantic,
    elegant:  WedElegant,
    story:    WedStory,
  },
});
