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
      <div className="flex gap-2 overflow-x-auto pb-1">
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
