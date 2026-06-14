'use client';
import { memo } from 'react';
import { getLayout } from '@/templates/registry';
import { getFontFamily } from '@/shared/utils/styleHelpers';
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
  // Apply the chosen font to ALL template text via a display:contents wrapper.
  // display:contents generates no box, so the layout root's min-h-full / absolute
  // positioning is untouched, but fontFamily still inherits to every child that
  // doesn't set its own font (decorative accents that hardcode a font keep theirs).
  return (
    <div style={{ display: 'contents', fontFamily: getFontFamily(data.fontStyle) }}>
      <Layout data={data} c={style.colors} autoPlay={autoPlay} />
    </div>
  );
});
