import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function BdayParty({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden pb-6 pt-6"
      style={{ background: `linear-gradient(150deg, ${c.accent} 0%, ${c.accent}dd 100%)` }}>
      {[
        { pos: 'top-6 left-5',   size: 'h-2 w-2',         color: c.secondary },
        { pos: 'top-10 right-7', size: 'h-1.5 w-1.5',     color: c.primary   },
        { pos: 'top-20 left-10', size: 'h-1 w-3 rounded', color: c.secondary },
        { pos: 'top-16 right-3', size: 'h-2 w-2',         color: c.primary   },
        { pos: 'top-32 left-3',  size: 'h-1.5 w-1.5',     color: c.secondary },
      ].map((d, i) => (
        <div key={i} className={`pointer-events-none absolute ${d.pos} ${d.size} rounded-full opacity-35`}
          style={{ backgroundColor: d.color }} />
      ))}

      <span className="relative z-10 text-[34px]">🎂</span>
      <p className="relative z-10 mt-1 text-[11px] font-black tracking-[0.15em] uppercase"
        style={{ color: c.primary }}>Happy Birthday!</p>

      <div className="relative z-10 mt-4 flex-shrink-0 overflow-hidden rounded-full shadow-2xl"
        style={{ width: 110, height: 110, border: `4px solid ${c.secondary}` }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-4xl"
              style={{ background: '#f3f4f6' }}>📷</div>}
      </div>

      <p className="relative z-10 mt-4 text-[19px] font-black" style={{ color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>
      {data.date && (
        <p className="relative z-10 mt-0.5 text-[8.5px] font-semibold"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}

      <div className="relative z-10 my-3 flex items-center gap-2">
        <span className="text-[12px]">🎉</span>
        <div className="h-px w-10 rounded opacity-20" style={{ backgroundColor: c.primary }} />
        <span className="text-[12px]">🎊</span>
      </div>

      <p className="relative z-10 mx-5 text-center text-[8.5px] leading-[1.75] opacity-55"
        style={{ color: c.primary }}>
        {data.description || 'Happy Birthday! Chúc bạn luôn hạnh phúc và đạt được mọi ước mơ.'}
      </p>
    </div>
  );
}
