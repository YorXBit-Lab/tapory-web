import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradGoldDark({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Gold ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-52 w-52 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}28, transparent 65%)`, filter: 'blur(30px)' }} />

      {/* FULL MODE */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '46%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: '#2a2a2a' }}>
                <span className="text-6xl" style={{ opacity: 0.08 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 72, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
        </div>
      )}

      {/* CARD MODE */}
      {mode === 'card' && (
        <>
          <div className="flex-shrink-0" style={{ height: 44 }} />
          <div className="relative z-10 self-center flex-shrink-0">
            <div className="overflow-hidden"
              style={{ width: 130, height: 156, borderRadius: 6, border: `2px solid ${c.secondary}88`, boxShadow: `0 0 0 1px ${c.secondary}28, 0 8px 36px rgba(0,0,0,0.6)` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-5xl"
                    style={{ background: '#2a2a2a' }}>📷</div>}
            </div>
          </div>
        </>
      )}

      {/* CIRCLE MODE */}
      {mode === 'circle' && (
        <>
          <div className="flex-shrink-0" style={{ height: 44 }} />
          <div className="relative z-10 self-center flex-shrink-0">
            <div className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2px ${c.secondary}88, 0 0 24px ${c.secondary}30` }} />
            <div className="overflow-hidden rounded-full" style={{ width: 120, height: 120 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: '#2a2a2a' }}>📷</div>}
            </div>
          </div>
        </>
      )}

      {/* Gold ribbon band with name */}
      <div className="relative z-10 w-full flex-shrink-0 flex items-center px-5 py-2.5"
        style={{ background: `linear-gradient(90deg, transparent, ${c.secondary}44, ${c.secondary}88, ${c.secondary}44, transparent)` }}>
        <div className="h-px flex-1 opacity-50" style={{ backgroundColor: c.secondary }} />
        <p className="mx-3 text-[11.5px] font-bold tracking-[0.2em] uppercase"
          style={{ color: c.secondary }}>
          {data.title || 'Tên người nhận'}
        </p>
        <div className="h-px flex-1 opacity-50" style={{ backgroundColor: c.secondary }} />
      </div>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 self-center text-center text-[9px] font-semibold tracking-[0.28em] uppercase"
          style={{ color: c.secondary, opacity: 0.6 }}>
          {data.subtitle}
        </p>
      )}

      {/* Happy GRADUATION title */}
      <div className="relative z-10 mt-3 flex flex-col items-center flex-shrink-0">
        <p className="font-bold italic" style={{ fontSize: 14, color: c.secondary, fontFamily: font, opacity: 0.9 }}>
          Happy
        </p>
        <p className="font-black uppercase tracking-[0.05em]" style={{ fontSize: 24, color: '#ffffff' }}>
          GRADUATION
        </p>
      </div>

      {/* Gold ornament divider */}
      <div className="relative z-10 mt-2.5 flex items-center gap-2 px-8 flex-shrink-0">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}70)` }} />
        <span style={{ color: c.secondary, fontSize: 10 }}>✦</span>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}70)` }} />
      </div>

      {/* Description */}
      <p className="relative z-10 mt-3 px-7 text-center text-[9.5px] leading-[1.88] italic"
        style={{ color: c.primary, opacity: 0.55 }}>
        {data.description || '"This is a huge milestone, and we\'re so incredibly proud of everything you\'ve accomplished!"'}
      </p>

      {/* Bottom gold decorations + date */}
      <div className="relative z-10 mt-auto flex items-center justify-center gap-3 pb-5 pt-3 flex-shrink-0">
        <span className="text-[18px]">🎈</span>
        {data.date
          ? <p className="text-[8px] font-bold tracking-[0.34em] uppercase"
              style={{ color: c.secondary, opacity: 0.55 }}>
              {fmt(data.date)}
            </p>
          : <span style={{ color: c.secondary, fontSize: 11, opacity: 0.5 }}>✦</span>}
        <span className="text-[18px]">🎈</span>
      </div>
    </div>
  );
}
