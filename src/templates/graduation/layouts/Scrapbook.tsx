import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradScrapbook({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6 pt-[52px]"
      style={{ backgroundColor: c.accent }}>

      {/* Dot-grid texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${c.primary}22 1px, transparent 1px)`,
          backgroundSize: '15px 15px',
        }} />

      {/* Warm paper vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.06) 100%)' }} />

      {/* Scattered decorations */}
      <span className="pointer-events-none absolute right-6 top-[60px] text-[18px] opacity-40"
        style={{ transform: 'rotate(18deg)' }}>⭐</span>
      <span className="pointer-events-none absolute left-5 top-[95px] text-[12px] opacity-30"
        style={{ transform: 'rotate(-8deg)' }}>✨</span>
      <span className="pointer-events-none absolute right-8 bottom-20 text-[14px] opacity-25"
        style={{ transform: 'rotate(6deg)' }}>🌟</span>
      <span className="pointer-events-none absolute left-7 bottom-28 text-[10px] opacity-30"
        style={{ transform: 'rotate(-12deg)' }}>✦</span>

      {/* ── FULL MODE ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 -mt-[52px]" style={{ height: '50%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.04)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `${c.primary}12` }}>
                <span className="text-6xl" style={{ opacity: 0.1 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 56, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
        </div>
      )}

      {/* ── CARD MODE: polaroid ── */}
      {mode === 'card' && (
        <div className="relative z-10 flex-shrink-0" style={{ transform: 'rotate(-2.8deg)' }}>
          <div className="absolute -top-3 left-1/2 h-[18px] w-[64px]"
            style={{
              transform: 'translateX(-50%) rotate(1.2deg)',
              background: `${c.secondary}70`,
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }} />
          <div className="relative bg-white"
            style={{ padding: '7px 7px 22px 7px', borderRadius: 3, boxShadow: '0 8px 28px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)' }}>
            <div className="overflow-hidden" style={{ width: 122, height: 134, borderRadius: 1 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ transform: 'scale(1.04)', filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: '#f0f0f0' }}>📷</div>}
            </div>
            <div className="mt-1 flex items-center justify-center">
              <div className="h-px w-8 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.12 }} />
            </div>
          </div>
        </div>
      )}

      {/* ── CIRCLE MODE ── */}
      {mode === 'circle' && (
        <div className="relative z-10 flex-shrink-0">
          <div className="absolute -inset-2 rounded-full opacity-60"
            style={{ background: `${c.secondary}40`, filter: 'blur(8px)' }} />
          <div className="relative overflow-hidden rounded-full bg-white p-[5px]"
            style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
            <div className="overflow-hidden rounded-full" style={{ width: 114, height: 114 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ transform: 'scale(1.04)', filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: '#f0f0f0' }}>📷</div>}
            </div>
          </div>
        </div>
      )}

      {/* Badge pill */}
      <div className="relative z-10 mt-4 overflow-hidden rounded-full px-4 py-1.5"
        style={{ backgroundColor: c.secondary, boxShadow: `0 2px 12px ${c.secondary}55, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
        <p className="text-[7px] font-black tracking-[0.28em] uppercase text-white">
          🎓 Tốt Nghiệp!
        </p>
      </div>

      {/* Name */}
      <div className="relative z-10 mt-3 px-6 text-center">
        <p className="font-bold leading-snug"
          style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.subtitle && (
          <p className="mt-0.5 text-[7.5px] tracking-[0.16em]"
            style={{ color: c.primary, opacity: 0.48 }}>
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Message card */}
      <div className="relative z-10 mx-6 mt-3.5 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.68)', border: '1.5px dashed rgba(0,0,0,0.13)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <p className="text-center text-[7.5px] leading-[1.78]"
          style={{ color: c.primary, opacity: 0.62 }}>
          {data.description || 'Congratulations! Wishing you all the best in your next adventure. 🎉'}
        </p>
      </div>

      {data.date && (
        <p className="relative z-10 mt-3 text-center text-[7px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: c.primary, opacity: 0.38 }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
