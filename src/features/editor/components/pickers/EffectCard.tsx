import type { IEffect } from '@/configs/types';
import { EFFECT_THUMBNAIL } from '@/features/preview/effectThumbnails';

interface Props {
  e: IEffect;
  active: boolean;
  onClick: () => void;
}

export function EffectCard({ e, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
        active
          ? 'border-primary bg-primary/[0.04] scale-[1.04] shadow-md shadow-primary/20 ring-2 ring-primary/15'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="relative flex h-10 w-12 items-center justify-center overflow-hidden rounded">
        {EFFECT_THUMBNAIL[e.id] ?? <div className="h-full w-full rounded bg-elevated" />}
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2">{e.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
