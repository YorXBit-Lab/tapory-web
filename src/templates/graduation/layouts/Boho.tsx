import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradBoho({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6"
      style={{ backgroundColor: c.accent }}>

      {/* Organic blob shapes */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-40 opacity-[0.18]"
        style={{ background: c.secondary, borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }} />
      <div className="pointer-events-none absolute -left-12 top-[33%] h-40 w-36 opacity-[0.14]"
        style={{ background: c.secondary, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
      <div className="pointer-events-none absolute -right-8 bottom-[18%] h-32 w-28 opacity-[0.12]"
        style={{ background: c.secondary, borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%' }} />

      {/* Botanical leaf decorations */}
      <span className="pointer-events-none absolute right-3 top-[26%] text-[26px]" style={{ opacity: 0.28, transform: 'rotate(18deg)' }}>🌿</span>
      <span className="pointer-events-none absolute right-2 top-[41%] text-[20px]" style={{ opacity: 0.22, transform: 'rotate(-8deg)' }}>🍃</span>
      <span className="pointer-events-none absolute left-4 bottom-[28%] text-[18px]" style={{ opacity: 0.24, transform: 'rotate(10deg)' }}>🌿</span>
      <span className="pointer-events-none absolute left-2 top-[18%] text-[14px]"  style={{ opacity: 0.2,  transform: 'rotate(-6deg)' }}>🍃</span>

      {/* Header */}
      <div className="flex-shrink-0" style={{ height: 40 }} />
      <div className="relative z-10 flex items-center gap-2">
        <span className="text-[15px]">🎓</span>
        <p className="text-center font-bold leading-tight"
          style={{ fontFamily: font, fontSize: 18, color: c.primary }}>
          Happy Graduation
        </p>
      </div>
      <div className="relative z-10 mt-1 h-px w-20 opacity-30"
        style={{ backgroundColor: c.secondary }} />

      {/* FULL MODE */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 mt-3" style={{ height: '40%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `${c.secondary}15` }}>
                <span className="text-5xl" style={{ opacity: 0.1 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 52, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
        </div>
      )}

      {/* CIRCLE MODE */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-4 flex-shrink-0">
          <div className="absolute -inset-2 rounded-full opacity-40"
            style={{ background: `${c.secondary}55`, filter: 'blur(8px)' }} />
          <div className="relative overflow-hidden rounded-full"
            style={{ width: 108, height: 108, border: `3px solid ${c.secondary}90`, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `${c.secondary}18` }}>📷</div>}
          </div>
        </div>
      )}

      {/* CARD MODE */}
      {mode === 'card' && (
        <div className="relative z-10 mt-4 flex-shrink-0">
          <div className="overflow-hidden"
            style={{ width: 108, height: 126, borderRadius: 8, border: `3px solid ${c.secondary}88`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `${c.secondary}18` }}>📷</div>}
          </div>
        </div>
      )}

      {/* Name ribbon banner */}
      <div className="relative z-10 mt-4 flex items-center" style={{ minWidth: '74%', maxWidth: '86%' }}>
        <div className="h-0 w-0 flex-shrink-0"
          style={{ borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderRight: `9px solid ${c.secondary}` }} />
        <div className="flex flex-1 items-center justify-center px-3 py-[7px]"
          style={{ backgroundColor: c.secondary, boxShadow: `0 3px 10px ${c.secondary}45` }}>
          <p className="text-center text-[13px] font-bold tracking-wide text-white">
            {data.title || 'Tên người nhận'}
          </p>
        </div>
        <div className="h-0 w-0 flex-shrink-0"
          style={{ borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderLeft: `9px solid ${c.secondary}` }} />
      </div>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 px-6 text-center text-[9px] tracking-[0.18em] uppercase"
          style={{ color: c.primary, opacity: 0.5 }}>
          {data.subtitle}
        </p>
      )}

      <p className="relative z-10 mt-3.5 px-6 text-center text-[9.5px] leading-[1.82]"
        style={{ color: c.primary, opacity: 0.6 }}>
        {data.description || 'May all the hard work, prayers, and struggles open the doors to a shining future.'}
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
