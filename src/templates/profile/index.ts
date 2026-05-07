import { registerTemplate } from '@/templates/registry';
import { PROFILE_STYLES, PROFILE_FIELDS } from './config';
import { ProfileClean }    from './layouts/Clean';
import { ProfileDark }     from './layouts/Dark';
import { ProfileCreative } from './layouts/Creative';

registerTemplate({
  id: 'profile',
  styles: PROFILE_STYLES,
  fields: PROFILE_FIELDS,
  layouts: {
    clean:    ProfileClean,
    dark:     ProfileDark,
    creative: ProfileCreative,
  },
});
