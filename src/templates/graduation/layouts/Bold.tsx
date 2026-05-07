import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradBold({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6"
      style={{ background: `linear-gradient(160deg, ${c.accent} 0%, ${c.secondary}dd 100%)` }}>

      {/* Floating 3D decorations */}
      <span className="pointer-events-none absolute left-4 top-6 text-[20px]"  style={{ opacity: 0.55, transform: 'rotate(-14deg)' }}>🎓</span>
      <span className="pointer-events-none absolute right-5 top-5 text-[16px]" style={{ opacity: 0.5,  transform: 'rotate(11deg)'  }}>🎓</span>
      <span className="pointer-events-none absolute left-7 top-[38%] text-[13px]" style={{ opacity: 0.4, transform: 'rotate(-7deg)' }}>🎓</span>
      <span className="pointer-events-none absolute right-6 top-[43%] text-[17px]" style={{ opacity: 0.45, transform: 'rotate(19deg)' }}>🎓</span>
      <span className="pointer-events-none absolute left-3 bottom-[20%] text-[13px]" style={{ opacity: 0.35 }}>💎</span>
      <span className="pointer-events-none absolute right-4 bottom-[17%] text-[14px]" style={{ opacity: 0.4, transform: 'rotate(10deg)' }}>💎</span>

      {/* Title */}
      <div className="flex-shrink-0" style={{ height: 36 }} />
      <p className="relative z-10 text-center font-bold italic"
        style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', fontFamily: font, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        Happy
      </p>
      <p className="relative z-10 -mt-0.5 px-3 text-center font-black uppercase"
        style={{ fontSize: 28, color: '#ffffff', letterSpacing: '0.04em', textShadow: '0 3px 16px rgba(0,0,0,0.25)' }}>
        GRADUATION
      </p>

      {/* FULL MODE */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 mt-3" style={{ height: '42%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <span className="text-5xl" style={{ opacity: 0.2 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 52, background: `linear-gradient(to top, ${c.secondary}cc, transparent)` }} />
        </div>
      )}

      {/* CARD MODE */}
      {mode === 'card' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="overflow-hidden"
            style={{ width: 150, height: 160, borderRadius: 6, border: '5px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 36px rgba(0,0,0,0.3)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-5xl"
                  style={{ background: 'rgba(255,255,255,0.18)' }}>📷</div>}
          </div>
        </div>
      )}

      {/* CIRCLE MODE */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="overflow-hidden rounded-full"
            style={{ width: 122, height: 122, border: '5px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.28)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: 'rgba(255,255,255,0.18)' }}>📷</div>}
          </div>
        </div>
      )}

      {/* Name */}
      <p className="relative z-10 mt-5 px-5 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.28)' }}>
        {data.title || 'Tên người nhận'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1 px-6 text-center text-[7px] tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.7)' }}>
          {data.subtitle}
        </p>
      )}

      <p className="relative z-10 mt-3 px-7 text-center text-[7.5px] leading-[1.78]"
        style={{ color: 'rgba(255,255,255,0.72)' }}>
        {data.description || 'Happy Graduation. Your dedication and hard work have brought you to this proud moment — may your future be filled with success.'}
      </p>

      {data.date && (
        <p className="relative z-10 mt-3 text-[7px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
