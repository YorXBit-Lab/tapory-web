import type { IIntro } from '@/configs/types';
import { INTRO_THUMBNAIL } from '@/features/preview/introThumbnails';

interface Props {
  intro: IIntro;
  active: boolean;
  onClick: () => void;
}

export function IntroCard({ intro, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[76px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
        active ? 'border-primary scale-105 shadow-md' : 'border-border hover:border-primary/40'
      }`}
      title={intro.hint}
    >
      <div className="relative flex h-11 w-[60px] items-center justify-center overflow-hidden rounded-md">
        {INTRO_THUMBNAIL[intro.id] ?? (
          <div className="h-full w-full rounded bg-elevated flex items-center justify-center text-xl">
            {intro.icon}
          </div>
        )}
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2 line-clamp-1">{intro.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
