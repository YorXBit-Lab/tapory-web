'use client';
import { useEditorContext } from '@/features/editor/context';
import { setStyle } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { StyleCard } from './StyleCard';

export function StylePicker() {
  const { draft, dispatch } = useEditorContext();
  const styles = getTemplateStyles(draft.templateId);

  if (styles.length <= 1) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Phong cách</p>
      {/* ≤ 6 styles → horizontal scroll; > 6 styles → grid on mobile, scroll on sm+.
          py/px give the active card's scale + ring + shadow room so overflow-x-auto
          (which forces overflow-y:auto) doesn't clip them. */}
      <div className={
        styles.length > 6
          ? 'grid grid-cols-3 gap-2 px-0.5 py-2 sm:flex sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:px-1 sm:py-2'
          : 'flex gap-2 overflow-x-auto px-1 py-2'
      }>
        {styles.map(s => (
          <StyleCard
            key={s.id}
            s={s}
            active={draft.styleId === s.id || (!draft.styleId && s === styles[0])}
            onClick={() => dispatch(setStyle(s.id))}
          />
        ))}
      </div>
    </div>
  );
}
