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
      {/* ≤ 6 styles → horizontal scroll; > 6 styles → grid on mobile, scroll on sm+ */}
      <div className={
        styles.length > 6
          ? 'grid grid-cols-3 gap-2 sm:flex sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:pb-1'
          : 'flex gap-2 overflow-x-auto pb-1'
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
