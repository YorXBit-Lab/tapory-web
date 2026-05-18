import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradWatercolor({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6"
      style={{ backgroundColor: c.accent }}>

      {/* Watercolor wash */}
      <div className="pointer-events-none absolute left-[5%] top-[5%] h-56 w-56 rounded-full opacity-45"
        style={{ background: `radial-gradient(ellipse, ${c.secondary}80, transparent 65%)`, filter: 'blur(32px)' }} />
      <div className="pointer-events-none absolute right-[-12%] top-[28%] h-44 w-44 rounded-full opacity-30"
        style={{ background: `radial-gradient(ellipse, ${c.secondary}60, transparent 65%)`, filter: 'blur(26px)' }} />
      <div className="pointer-events-none absolute bottom-[12%] left-[-8%] h-36 w-36 rounded-full opacity-25"
        style={{ background: `radial-gradient(ellipse, ${c.secondary}55, transparent 65%)`, filter: 'blur(22px)' }} />

      {/* Confetti */}
      <div className="pointer-events-none absolute" style={{ top: '5%', left: '7%', width: 5, height: 11, backgroundColor: '#e8705a', opacity: 0.65, borderRadius: 2, transform: 'rotate(22deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '3%', right: '11%', width: 7, height: 7, backgroundColor: '#ffd93d', opacity: 0.7, borderRadius: 2, transform: 'rotate(-10deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '11%', left: '21%', width: 4, height: 9, backgroundColor: '#6bcb77', opacity: 0.6, borderRadius: 2, transform: 'rotate(45deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '7%', right: '27%', width: 6, height: 6, backgroundColor: '#4d96ff', opacity: 0.65, borderRadius: 2, transform: 'rotate(15deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '15%', right: '7%', width: 5, height: 10, backgroundColor: '#f72585', opacity: 0.55, borderRadius: 2, transform: 'rotate(-25deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '17%', left: '5%', width: 4, height: 8, backgroundColor: '#ffd93d', opacity: 0.6, borderRadius: 2, transform: 'rotate(30deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '9%', left: '42%', width: 6, height: 6, backgroundColor: '#c77dff', opacity: 0.55, borderRadius: 2, transform: 'rotate(-18deg)' }} />
      <div className="pointer-events-none absolute" style={{ top: '13%', right: '42%', width: 4, height: 9, backgroundColor: '#ff9f1c', opacity: 0.6, borderRadius: 2, transform: 'rotate(38deg)' }} />

      {/* Title */}
      <div className="flex-shrink-0" style={{ height: 36 }} />
      <p className="relative z-10 px-5 text-center font-bold italic leading-tight"
        style={{ fontFamily: font, fontSize: 20, color: c.primary, textShadow: `0 2px 10px ${c.secondary}55` }}>
        Happy Graduation
      </p>
      <div className="relative z-10 mt-1 h-[2px] w-14 rounded-full opacity-40"
        style={{ backgroundColor: c.secondary }} />

      {/* FULL MODE */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 mt-3" style={{ height: '42%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `${c.secondary}18` }}>
                <span className="text-5xl" style={{ opacity: 0.12 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 52, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
        </div>
      )}

      {/* CIRCLE MODE */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="absolute -inset-3 rounded-full opacity-45"
            style={{ background: `${c.secondary}50`, filter: 'blur(10px)' }} />
          <div className="relative overflow-hidden rounded-full"
            style={{ width: 114, height: 114, border: `4px solid rgba(255,255,255,0.95)`, boxShadow: `0 6px 24px ${c.secondary}44` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `${c.secondary}22` }}>📷</div>}
          </div>
        </div>
      )}

      {/* CARD MODE */}
      {mode === 'card' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="overflow-hidden"
            style={{ width: 110, height: 130, borderRadius: 8, border: `4px solid rgba(255,255,255,0.95)`, boxShadow: `0 8px 28px ${c.secondary}44` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `${c.secondary}22` }}>📷</div>}
          </div>
        </div>
      )}

      {/* Flower deco bottom */}
      <span className="pointer-events-none absolute bottom-2 left-3 text-[28px]" style={{ opacity: 0.32, transform: 'rotate(-10deg)' }}>💐</span>
      <span className="pointer-events-none absolute bottom-0 right-2 text-[26px]" style={{ opacity: 0.28, transform: 'rotate(10deg) scaleX(-1)' }}>🌼</span>

      {/* Name */}
      <p className="relative z-10 mt-5 px-5 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1 px-6 text-center text-[9px] tracking-[0.18em] uppercase"
          style={{ color: c.primary, opacity: 0.45 }}>
          {data.subtitle}
        </p>
      )}

      <p className="relative z-10 mt-3 px-7 text-center text-[9.5px] leading-[1.78]"
        style={{ color: c.primary, opacity: 0.6 }}>
        {data.description || 'As you stand at the threshold of your future, let this moment be a reminder of your strength, resilience, and determination.'}
      </p>

      {data.date && (
        <p className="relative z-10 mt-3 text-[9px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: c.secondary, opacity: 0.55 }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
