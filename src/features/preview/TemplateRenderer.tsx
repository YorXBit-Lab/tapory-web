'use client';
import { memo } from 'react';
import { getLayout } from '@/templates/registry';
import '@/templates/init';
import type { IEditDraft, ITemplateStyle } from '@/configs/types';

interface Props {
  data: IEditDraft;
  style: ITemplateStyle;
}

export const TemplateRenderer = memo(
  function TemplateRenderer({ data, style }: Props) {
    const Layout = getLayout(data.templateId, style.layout);
    if (!Layout) return null;
    return <Layout data={data} c={style.colors} />;
  },
  (prev, next) => {
    if (prev.style.id !== next.style.id) return false;
    const keys: Array<keyof IEditDraft> = [
      'templateId', 'imageUrl', 'title', 'subtitle', 'description', 'date', 'spotifyUrl',
      'fontStyle', 'titleSize', 'imageMode', 'imageFilter',
    ];
    return keys.every(k => prev.data[k] === next.data[k]);
  },
);
