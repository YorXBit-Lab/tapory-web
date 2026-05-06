import type { ITemplateStyle } from '@/configs/types';

interface Props {
  s: ITemplateStyle;
  active: boolean;
  onClick: () => void;
}

export function StyleCard({ s, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
        active ? 'border-primary scale-105 shadow-md' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="h-10 w-full overflow-hidden rounded-lg" style={{ backgroundColor: s.colors.accent }}>
        <div className="flex gap-1 p-1.5">
          <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: s.colors.primary }} />
          <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: s.colors.secondary }} />
        </div>
        <div className="mx-1.5 mt-0.5 h-1 rounded-full opacity-40" style={{ backgroundColor: s.colors.primary }} />
        <div className="mx-1.5 mt-0.5 h-1 w-2/3 rounded-full opacity-30" style={{ backgroundColor: s.colors.secondary }} />
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2">{s.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
