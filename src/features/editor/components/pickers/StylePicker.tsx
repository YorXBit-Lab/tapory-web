'use client';
import { useEditorContext } from '@/features/editor/context';
import { setStyle } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { StyleCard } from './StyleCard';
import { HScrollRow } from './HScrollRow';

export function StylePicker() {
  const { draft, dispatch } = useEditorContext();
  const styles = getTemplateStyles(draft.templateId);

  if (styles.length <= 1) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Phong cách</p>
      {/* Một hàng ngang cuộn được cho mọi số lượng mẫu — HScrollRow lo phần cuộn:
          lăn chuột dọc → ngang, giữ-kéo để lướt. py/px give the active card's
          scale + ring + shadow room so overflow-x-auto doesn't clip them. */}
      <HScrollRow className="flex gap-2 px-1 py-2">
        {styles.map(s => (
          <StyleCard
            key={s.id}
            s={s}
            active={draft.styleId === s.id || (!draft.styleId && s === styles[0])}
            onClick={() => dispatch(setStyle(s.id))}
          />
        ))}
      </HScrollRow>
    </div>
  );
}
