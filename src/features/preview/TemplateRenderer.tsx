'use client';
import { memo } from 'react';
import { getLayout } from '@/templates/registry';
import '@/templates/init';
import type { IEditDraft, ITemplateStyle } from '@/configs/types';

interface Props {
  data: IEditDraft;
  style: ITemplateStyle;
  autoPlay?: boolean;
}

export const TemplateRenderer = memo(function TemplateRenderer({ data, style, autoPlay }: Props) {
  const Layout = getLayout(data.templateId, style.layout);
  if (!Layout) return null;
  return <Layout data={data} c={style.colors} autoPlay={autoPlay} />;
});
