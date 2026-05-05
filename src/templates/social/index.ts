import { registerTemplate } from '@/templates/registry';
import { SOCIAL_STYLES, SOCIAL_FIELDS } from './config';
import { SocLinktree } from './layouts/Linktree';
import { SocProfile }  from './layouts/Profile';
import { SocDark }     from './layouts/Dark';

registerTemplate({
  id: 'social',
  styles: SOCIAL_STYLES,
  fields: SOCIAL_FIELDS,
  layouts: {
    linktree: SocLinktree,
    profile:  SocProfile,
    dark:     SocDark,
  },
});
