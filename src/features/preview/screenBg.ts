import type { CSSProperties } from 'react';
import type { IEditDraft, ITemplateStyle } from '@/configs/types';

export function getScreenBackground(
  draft: IEditDraft,
  activeStyle: ITemplateStyle | undefined,
): CSSProperties {
  if (draft.bgImageUrl) {
    return {
      backgroundImage: `url(${draft.bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { backgroundColor: draft.bgColor || activeStyle?.colors.accent || '#fff' };
}
