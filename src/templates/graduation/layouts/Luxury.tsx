import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradLuxury({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-8"
      style={{ backgroundColor: c.accent }}>

      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}28 0%, transparent 65%)`, filter: 'blur(40px)' }} />

      {/* Subtle diagonal texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 5px)' }} />

      {/* ── FULL MODE: photo fills top ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '50%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.04)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `${c.secondary}10` }}>
                <span className="text-6xl" style={{ opacity: 0.08 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 64, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
          <div className="absolute left-5 top-[54px]">
            <p className="text-[6px] font-bold tracking-[0.62em] uppercase"
              style={{ color: c.secondary, opacity: 0.55 }}>Class&nbsp;&nbsp;of&nbsp;&nbsp;2026</p>
          </div>
        </div>
      )}

      {mode !== 'full' && (
        <>
          <div className="flex-shrink-0" style={{ height: 52 }} />
          <p className="relative z-10 text-[6px] font-bold tracking-[0.62em] uppercase"
            style={{ color: c.secondary, opacity: 0.45 }}>
            Class&nbsp;&nbsp;of&nbsp;&nbsp;2026
          </p>
          {/* Top gold rule */}
          <div className="relative z-10 mt-2 w-[72%]"
            style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.secondary}bb, transparent)` }} />
        </>
      )}

      {/* ── CARD MODE: multi-layer shadow portrait ── */}
      {mode === 'card' && (
        <div className="relative z-10 mt-6 flex-shrink-0">
          <div className="absolute inset-0 rounded-xl"
            style={{ boxShadow: `0 0 0 1px ${c.secondary}40, 0 0 28px ${c.secondary}28, 0 16px 40px rgba(0,0,0,0.65)` }} />
          <div className="overflow-hidden rounded-xl"
            style={{ width: 116, height: 144, border: `1.5px solid ${c.secondary}99` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                  style={{ transform: 'scale(1.04)', filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-5xl"
                  style={{ background: `${c.secondary}0a` }}>📷</div>}
            <div className="pointer-events-none absolute inset-0"
              style={{ boxShadow: 'inset 0 0 24px rgba(0,0,0,0.45)' }} />
          </div>
        </div>
      )}

      {/* ── CIRCLE MODE: gold ring ── */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-6 flex-shrink-0">
          <div className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 1px ${c.secondary}40, 0 0 28px ${c.secondary}28, 0 16px 40px rgba(0,0,0,0.65)` }} />
          <div className="overflow-hidden rounded-full"
            style={{ width: 116, height: 116, border: `1.5px solid ${c.secondary}99` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                  style={{ transform: 'scale(1.04)', filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-5xl"
                  style={{ background: `${c.secondary}0a` }}>📷</div>}
          </div>
        </div>
      )}

      {/* Name */}
      <p className="relative z-10 mt-6 px-6 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary, letterSpacing: '0.025em' }}>
        {data.title || 'Tên người nhận'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-2 text-[6.5px] font-semibold tracking-[0.42em] uppercase"
          style={{ color: c.secondary, opacity: 0.6 }}>
          {data.subtitle}
        </p>
      )}

      {/* Gold ornament divider */}
      <div className="relative z-10 mt-4 flex w-[72%] items-center gap-2">
        <div className="h-px flex-1"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}88)` }} />
        <span className="text-[7px] leading-none" style={{ color: c.secondary, opacity: 0.7 }}>✦</span>
        <div className="h-px flex-1"
          style={{ background: `linear-gradient(to left, transparent, ${c.secondary}88)` }} />
      </div>

      {/* Description */}
      <p className="relative z-10 mt-4 mx-8 text-center text-[7.5px] leading-[1.92]"
        style={{ color: c.primary, opacity: 0.45 }}>
        {data.description || '"Chúc mừng tốt nghiệp. Tương lai rực rỡ đang chờ đón bạn."'}
      </p>

      {data.date && (
        <p className="relative z-10 mt-5 text-[6px] font-bold tracking-[0.55em] uppercase"
          style={{ color: c.secondary, opacity: 0.5 }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
