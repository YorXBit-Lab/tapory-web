import { registerTemplate } from '@/templates/registry';
import { BIRTHDAY_STYLES, BIRTHDAY_FIELDS } from './config';
import { BdayParty }   from './layouts/Party';
import { BdayRetro }   from './layouts/Retro';
import { BdayMinimal } from './layouts/BdayMinimal';

registerTemplate({
  id: 'birthday',
  styles: BIRTHDAY_STYLES,
  fields: BIRTHDAY_FIELDS,
  layouts: {
    party:   BdayParty,
    retro:   BdayRetro,
    minimal: BdayMinimal,
  },
});
