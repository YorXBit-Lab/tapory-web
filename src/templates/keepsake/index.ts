import { registerTemplate } from '@/templates/registry';
import { KEEPSAKE_STYLES, KEEPSAKE_FIELDS } from './config';
import { KeepTag }     from './layouts/Tag';
import { KeepLetter }  from './layouts/Letter';
import { KeepCapsule } from './layouts/Capsule';

registerTemplate({
  id: 'keepsake',
  styles: KEEPSAKE_STYLES,
  fields: KEEPSAKE_FIELDS,
  layouts: {
    tag:     KeepTag,
    letter:  KeepLetter,
    capsule: KeepCapsule,
  },
});
