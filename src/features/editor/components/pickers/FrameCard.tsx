import type { IFrame } from '@/configs/types';
import { FRAME_THUMBNAIL } from '@/features/preview/frameThumbnails';

interface Props {
  f: IFrame;
  active: boolean;
  onClick: () => void;
}

export function FrameCard({ f, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
        active ? 'border-primary scale-105 shadow-md' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="relative flex h-10 w-12 items-center justify-center overflow-hidden rounded">
        {FRAME_THUMBNAIL[f.id] ?? <div className="h-full w-full rounded bg-elevated" />}
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2">{f.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
