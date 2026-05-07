'use client';
import { useEditorContext } from '@/features/editor/context';
import { setFrame } from '@/redux/editSlice';
import { getTemplateFrames } from '@/templates/registry';
import { FrameCard } from './FrameCard';

export function FramePicker() {
  const { draft, tpl, dispatch } = useEditorContext();
  const frames = getTemplateFrames(tpl.id);

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Khung viền</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {frames.map(f => (
          <FrameCard
            key={f.id}
            f={f}
            active={draft.frameId === f.id || (!draft.frameId && f.id === 'none')}
            onClick={() => dispatch(setFrame(f.id))}
          />
        ))}
      </div>
    </div>
  );
}
