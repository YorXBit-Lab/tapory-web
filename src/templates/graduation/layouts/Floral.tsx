import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradFloral({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6"
      style={{ background: 'linear-gradient(160deg, #ede0f8 0%, #d8caf5 50%, #cdc0f0 100%)' }}>

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(187,143,220,0.45), transparent 65%)', filter: 'blur(24px)' }} />
      <div className="pointer-events-none absolute -right-8 top-[40%] h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(160,124,201,0.3), transparent 65%)', filter: 'blur(20px)' }} />

      {/* Bottom flower decor */}
      <span className="pointer-events-none absolute -bottom-2 -left-3 text-[58px]" style={{ opacity: 0.5 }}>🌸</span>
      <span className="pointer-events-none absolute bottom-8 left-8 text-[24px]" style={{ opacity: 0.32, transform: 'rotate(-15deg)' }}>🌺</span>
      <span className="pointer-events-none absolute -bottom-2 -right-3 text-[58px]" style={{ opacity: 0.5, transform: 'scaleX(-1)' }}>🌸</span>
      <span className="pointer-events-none absolute bottom-10 right-8 text-[20px]" style={{ opacity: 0.28, transform: 'rotate(12deg)' }}>🌷</span>

      {/* Header */}
      <div className="flex-shrink-0" style={{ height: 42 }} />
      <p className="relative z-10 text-[8px] font-semibold tracking-[0.28em] uppercase"
        style={{ color: c.secondary }}>
        Big applause for
      </p>
      <p className="relative z-10 mt-1 px-5 text-center font-extrabold leading-tight"
        style={{ fontFamily: font, fontSize: 22, color: c.primary }}>
        Happy Graduation
      </p>

      {/* FULL MODE */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 mt-3" style={{ height: '40%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.3)' }}>
                <span className="text-5xl" style={{ opacity: 0.15 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 48, background: 'linear-gradient(to top, #d4c4f0, transparent)' }} />
        </div>
      )}

      {/* CIRCLE MODE */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="absolute -inset-[6px] rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #d4a9f0, #a07cc9, #f0d0ff, #a07cc9, #d4a9f0)', filter: 'blur(5px)', opacity: 0.65 }} />
          <div className="relative overflow-hidden rounded-full"
            style={{ width: 108, height: 108, border: '3px solid rgba(255,255,255,0.92)', boxShadow: '0 6px 24px rgba(100,60,160,0.22)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: 'rgba(255,255,255,0.5)' }}>📷</div>}
          </div>
        </div>
      )}

      {/* CARD MODE */}
      {mode === 'card' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="bg-white"
            style={{ padding: '5px 5px 18px 5px', borderRadius: 4, boxShadow: '0 8px 24px rgba(100,60,160,0.2)', transform: 'rotate(-1.2deg)' }}>
            <div className="overflow-hidden rounded-sm" style={{ width: 110, height: 128 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: '#f0e8fa' }}>📷</div>}
            </div>
          </div>
        </div>
      )}

      {/* Name ribbon banner */}
      <div className="relative z-10 mt-4 flex items-center" style={{ minWidth: '72%', maxWidth: '82%' }}>
        <div className="h-0 w-0 flex-shrink-0"
          style={{ borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderRight: `10px solid ${c.secondary}` }} />
        <div className="flex flex-1 items-center justify-center px-3 py-1.5"
          style={{ backgroundColor: c.secondary, boxShadow: `0 3px 12px ${c.secondary}44` }}>
          <p className="text-center text-[11px] font-bold tracking-wide text-white">
            {data.title || 'Tên người nhận'}
          </p>
        </div>
        <div className="h-0 w-0 flex-shrink-0"
          style={{ borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: `10px solid ${c.secondary}` }} />
      </div>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 px-6 text-center text-[7px] tracking-[0.18em] uppercase"
          style={{ color: c.primary, opacity: 0.52 }}>
          {data.subtitle}
        </p>
      )}

      <p className="relative z-10 mt-3 px-6 text-center text-[7.5px] leading-[1.78]"
        style={{ color: c.primary, opacity: 0.65 }}>
        {data.description || "You've reached the finish line, and your perseverance is inspiring. May this success be the first of many!"}
      </p>

      {data.date && (
        <p className="relative z-10 mt-3 text-[7px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: c.secondary, opacity: 0.6 }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
