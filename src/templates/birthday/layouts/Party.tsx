import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function BdayParty({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden"
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

      {/* ── Full mode ── */}
      {mode === 'full' && (
        <>
          <div className="relative w-full flex-shrink-0" style={{ height: 220 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-5xl"
                  style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}aa)` }}>🎂</div>}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.28) 100%)' }} />
            <div className="absolute top-5 left-0 right-0 flex justify-center">
              <p className="text-[8px] font-black tracking-[0.3em] uppercase"
                style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>🎉 Happy Birthday! 🎉</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center px-5 pt-4 pb-6 text-center">
            <p className="font-black" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && (
              <p className="mt-0.5 text-[8.5px] font-semibold" style={{ color: c.secondary }}>{fmt(data.date)}</p>
            )}
            <div className="my-3 flex items-center gap-2">
              <span className="text-[12px]">🎉</span>
              <div className="h-px w-10 rounded opacity-20" style={{ backgroundColor: c.primary }} />
              <span className="text-[12px]">🎊</span>
            </div>
            <p className="text-[8.5px] leading-[1.75] opacity-55" style={{ color: c.primary }}>
              {data.description || 'Happy Birthday! Chúc bạn luôn hạnh phúc và đạt được mọi ước mơ.'}
            </p>
          </div>
        </>
      )}

      {/* ── Circle mode (default) ── */}
      {mode === 'circle' && (
        <>
          <div className="flex flex-col items-center pt-[52px]">
            <span className="relative z-10 text-[34px]">🎂</span>
            <p className="relative z-10 mt-1 text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ color: c.primary }}>Happy Birthday!</p>
            <div className="relative z-10 mt-4 flex-shrink-0 overflow-hidden rounded-full shadow-2xl"
              style={{ width: 110, height: 110, border: `4px solid ${c.secondary}` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: '#f3f4f6' }}>📷</div>}
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center px-5 mt-4 pb-6 text-center">
            <p className="font-black" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && (
              <p className="mt-0.5 text-[8.5px] font-semibold" style={{ color: c.secondary }}>{fmt(data.date)}</p>
            )}
            <div className="my-3 flex items-center gap-2">
              <span className="text-[12px]">🎉</span>
              <div className="h-px w-10 rounded opacity-20" style={{ backgroundColor: c.primary }} />
              <span className="text-[12px]">🎊</span>
            </div>
            <p className="text-[8.5px] leading-[1.75] opacity-55" style={{ color: c.primary }}>
              {data.description || 'Happy Birthday! Chúc bạn luôn hạnh phúc và đạt được mọi ước mơ.'}
            </p>
          </div>
        </>
      )}

      {/* ── Card mode ── */}
      {mode === 'card' && (
        <>
          <div className="flex flex-col items-center pt-[42px]">
            <span className="relative z-10 text-[28px]">🎂</span>
            <p className="relative z-10 mt-1 text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ color: c.primary }}>Happy Birthday!</p>
            <div className="relative z-10 mt-4 flex-shrink-0"
              style={{ padding: 3, border: `2.5px solid ${c.secondary}` }}>
              <div style={{ width: 140, height: 100, overflow: 'hidden' }}>
                {data.imageUrl
                  ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
                  : <div className="flex h-full w-full items-center justify-center text-3xl"
                      style={{ background: '#f3f4f6' }}>📷</div>}
              </div>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center px-5 mt-4 pb-6 text-center">
            <p className="font-black" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && (
              <p className="mt-0.5 text-[8.5px] font-semibold" style={{ color: c.secondary }}>{fmt(data.date)}</p>
            )}
            <div className="my-3 flex items-center gap-2">
              <span className="text-[12px]">🎉</span>
              <div className="h-px w-10 rounded opacity-20" style={{ backgroundColor: c.primary }} />
              <span className="text-[12px]">🎊</span>
            </div>
            <p className="text-[8.5px] leading-[1.75] opacity-55" style={{ color: c.primary }}>
              {data.description || 'Happy Birthday! Chúc bạn luôn hạnh phúc và đạt được mọi ước mơ.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
