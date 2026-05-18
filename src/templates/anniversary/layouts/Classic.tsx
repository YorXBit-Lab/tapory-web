import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function AnniClassic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-7"
      style={{ backgroundColor: c.accent }}>

      {/* Warm corner vignettes */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${c.primary}18 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, ${c.primary}14 0%, transparent 50%)` }} />

      {/* Scattered ♡ background hearts */}
      {[
        { top: '8%',  left: '7%',  size: 8,  opacity: 0.09, rotate: -15 },
        { top: '14%', left: '85%', size: 6,  opacity: 0.07, rotate: 12  },
        { top: '28%', left: '92%', size: 9,  opacity: 0.06, rotate: -8  },
        { top: '42%', left: '5%',  size: 7,  opacity: 0.08, rotate: 20  },
        { top: '62%', left: '88%', size: 8,  opacity: 0.06, rotate: -18 },
        { top: '74%', left: '6%',  size: 6,  opacity: 0.07, rotate: 10  },
        { top: '85%', left: '80%', size: 7,  opacity: 0.05, rotate: -12 },
        { top: '90%', left: '18%', size: 5,  opacity: 0.06, rotate: 25  },
      ].map((h, i) => (
        <div key={i} className="pointer-events-none absolute select-none"
          style={{ top: h.top, left: h.left, fontSize: h.size, opacity: h.opacity, color: c.secondary, transform: `rotate(${h.rotate}deg)` }}>
          ♥
        </div>
      ))}

      {/* Ambient warm glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}22 0%, transparent 65%)`, filter: 'blur(36px)' }} />

      {/* ── FULL MODE ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '48%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.04)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `${c.secondary}12` }}>
                <span className="text-6xl" style={{ opacity: 0.1 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 56, background: `linear-gradient(to top, ${c.accent}, transparent)` }} />
        </div>
      )}

      {mode !== 'full' && <div className="flex-shrink-0" style={{ height: 50 }} />}

      {/* Header label */}
      {mode !== 'full' && (
        <p className="relative z-10 text-[7px] font-bold tracking-[0.65em] uppercase"
          style={{ color: c.secondary, opacity: 0.55 }}>
          Anniversary
        </p>
      )}
      {mode === 'full' && (
        <p className="relative z-10 mt-3 text-[7px] font-bold tracking-[0.65em] uppercase"
          style={{ color: c.secondary, opacity: 0.55 }}>
          Anniversary
        </p>
      )}

      {/* Top gold rule */}
      <div className="relative z-10 mt-1.5 w-[60%]"
        style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.secondary}aa, transparent)` }} />

      {/* ── CARD MODE: double-frame portrait ── */}
      {mode === 'card' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="absolute -inset-[6px] rounded-[6px]"
            style={{ background: `radial-gradient(ellipse, ${c.secondary}30 0%, transparent 70%)`, filter: 'blur(10px)' }} />
          <div className="relative rounded-[4px] p-[2px]"
            style={{ background: `linear-gradient(135deg, ${c.secondary}ff, ${c.secondary}88, ${c.secondary}ff)` }}>
            <div className="rounded-[3px] p-[4px]" style={{ backgroundColor: c.accent }}>
              <div className="overflow-hidden rounded-[2px]" style={{ width: 120, height: 148 }}>
                {data.imageUrl
                  ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                      style={{ transform: 'scale(1.04)', filter: imgFilter }} />
                  : <div className="flex h-full w-full items-center justify-center text-4xl"
                      style={{ background: `${c.secondary}0f` }}>📷</div>}
              </div>
            </div>
          </div>
          {[{ top: -3, left: -3 }, { top: -3, right: -3 }, { bottom: -3, left: -3 }, { bottom: -3, right: -3 }].map((pos, i) => (
            <div key={i} className="absolute text-[9px] leading-none"
              style={{ ...pos, color: c.secondary, opacity: 0.9 }}>✦</div>
          ))}
        </div>
      )}

      {/* ── CIRCLE MODE ── */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          <div className="absolute -inset-[5px] rounded-full"
            style={{ background: `linear-gradient(135deg, ${c.secondary}ff, ${c.secondary}55, ${c.secondary}ff)`, filter: 'blur(4px)', opacity: 0.7 }} />
          <div className="relative overflow-hidden rounded-full"
            style={{ width: 116, height: 116, border: `2px solid ${c.secondary}cc`, boxShadow: `0 6px 24px rgba(0,0,0,0.12)` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                  style={{ transform: 'scale(1.04)', filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `${c.secondary}0f` }}>📷</div>}
          </div>
        </div>
      )}

      {/* Name */}
      <p className="relative z-10 mt-5 px-6 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary, letterSpacing: '0.02em' }}>
        {data.title || 'Tên đôi'}
      </p>

      {/* Heart divider */}
      <div className="relative z-10 mt-3 flex w-[68%] items-center gap-2">
        <div className="h-px flex-1"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}99)` }} />
        <span className="text-[11px] leading-none" style={{ color: c.secondary }}>♥</span>
        <div className="h-px flex-1"
          style={{ background: `linear-gradient(to left, transparent, ${c.secondary}99)` }} />
      </div>

      {data.date && (
        <p className="relative z-10 mt-2.5 text-[8px] font-bold tracking-[0.45em] uppercase"
          style={{ color: c.secondary, opacity: 0.75 }}>
          {fmt(data.date)}
        </p>
      )}

      <p className="relative z-10 mt-3.5 px-8 text-center text-[9.5px] leading-[1.88] italic"
        style={{ color: c.primary, opacity: 0.48 }}>
        {data.description || '"Cảm ơn bạn đã ở bên tôi trong những năm tháng tuyệt vời nhất của cuộc đời."'}
      </p>

      <div className="relative z-10 mt-auto pt-4 flex items-center gap-1.5">
        <span className="text-[9px]" style={{ color: c.secondary, opacity: 0.4 }}>♥</span>
        <span className="text-[9px]" style={{ color: c.secondary, opacity: 0.25 }}>♥</span>
        <span className="text-[9px]" style={{ color: c.secondary, opacity: 0.4 }}>♥</span>
      </div>
    </div>
  );
}
