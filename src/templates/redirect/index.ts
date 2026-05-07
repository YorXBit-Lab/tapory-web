import { registerTemplate } from '@/templates/registry';
import { REDIRECT_STYLES, REDIRECT_FIELDS } from './config';
import { RedirectDefault } from './layouts/Default';

registerTemplate({
  id: 'redirect',
  styles: REDIRECT_STYLES,
  fields: REDIRECT_FIELDS,
  layouts: { default: RedirectDefault },
  frameIds: [],
  imageModes: [],
});
