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
      {/* px/py: chừa chỗ cho scale + ring + shadow của card active khỏi bị overflow cắt */}
      <div className="flex gap-2 overflow-x-auto px-1 py-2">
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
