'use client';
import { useEditorContext } from '@/features/editor/context';
import { setEffect } from '@/redux/editSlice';
import { EFFECTS } from '@/configs/constants';
import { EffectCard } from './EffectCard';

export function EffectPicker() {
  const { draft, dispatch } = useEditorContext();

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Hiệu ứng</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EFFECTS.map(e => (
          <EffectCard
            key={e.id}
            e={e}
            active={draft.effectId === e.id || (!draft.effectId && e.id === 'none')}
            onClick={() => dispatch(setEffect(e.id))}
          />
        ))}
      </div>
    </div>
  );
}
