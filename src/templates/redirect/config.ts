import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const REDIRECT_STYLES: ITemplateStyle[] = [
  { id: 'redir-default', layout: 'default', name: 'Redirect',
    colors: { primary: '#0f172a', secondary: '#6366f1', accent: '#f1f5f9' } },
];

export const REDIRECT_FIELDS: FieldMeta[] = [
  { key: 'website', label: 'URL đích', placeholder: 'https://example.com', type: 'url' },
];
