import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function AnniLove({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-7"
      style={{ background: 'linear-gradient(160deg, #1e0a12 0%, #2a0d18 45%, #1a0810 100%)' }}>

      {/* Ambient rose glows */}
      <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(220,60,100,0.28) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div className="pointer-events-none absolute -left-12 top-[35%] h-52 w-52 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,40,80,0.18) 0%, transparent 65%)', filter: 'blur(32px)' }} />
      <div className="pointer-events-none absolute -right-10 bottom-[20%] h-44 w-44 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(220,60,100,0.15) 0%, transparent 65%)', filter: 'blur(28px)' }} />

      {/* Scattered hearts */}
      {[
        { top: '6%',  left: '8%',  size: 9,  op: 0.18, r: -15 },
        { top: '11%', left: '82%', size: 7,  op: 0.14, r: 12  },
        { top: '24%', left: '91%', size: 11, op: 0.10, r: -8  },
        { top: '38%', left: '4%',  size: 8,  op: 0.12, r: 20  },
        { top: '55%', left: '87%', size: 7,  op: 0.09, r: -18 },
        { top: '68%', left: '5%',  size: 6,  op: 0.10, r: 10  },
        { top: '80%', left: '78%', size: 8,  op: 0.08, r: -12 },
        { top: '88%', left: '15%', size: 5,  op: 0.09, r: 25  },
        { top: '18%', left: '48%', size: 5,  op: 0.07, r: 5   },
      ].map((h, i) => (
        <div key={i} className="pointer-events-none absolute select-none"
          style={{ top: h.top, left: h.left, fontSize: h.size, opacity: h.op, color: '#ff6b8a', transform: `rotate(${h.r}deg)` }}>
          ♥
        </div>
      ))}

      {/* ── FULL MODE ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '46%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.04)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: 'rgba(220,60,100,0.08)' }}>
                <span className="text-6xl" style={{ opacity: 0.1 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 72, background: 'linear-gradient(to top, #1a0810, transparent)' }} />
          {/* Warm tint overlay */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to bottom right, rgba(220,60,100,0.14) 0%, transparent 55%)' }} />
        </div>
      )}

      {mode !== 'full' && <div className="flex-shrink-0" style={{ height: 48 }} />}

      {/* "LOVE STORY" label */}
      <div className="relative z-10 mt-3 flex items-center gap-2">
        <span style={{ color: '#ff6b8a', fontSize: 8, opacity: 0.7 }}>♥</span>
        <p className="text-[5.5px] font-bold tracking-[0.58em] uppercase"
          style={{ color: '#ff8fab', opacity: 0.65 }}>
          Love Story
        </p>
        <span style={{ color: '#ff6b8a', fontSize: 8, opacity: 0.7 }}>♥</span>
      </div>

      {/* Rose gradient rule */}
      <div className="relative z-10 mt-1.5 w-[55%]"
        style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,107,138,0.6), transparent)' }} />

      {/* ── CIRCLE MODE: glowing rose border ── */}
      {mode === 'circle' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          {/* Outer glow pulse ring */}
          <div className="absolute -inset-3 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(220,60,100,0.55) 0%, transparent 65%)', filter: 'blur(12px)' }} />
          {/* Gradient border ring */}
          <div className="absolute -inset-[3px] rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #ff6b8a, #ff4d6d, #ff85a1, #ff4d6d, #ff6b8a)', filter: 'blur(2px)', opacity: 0.85 }} />
          <div className="relative overflow-hidden rounded-full"
            style={{ width: 118, height: 118, border: '2px solid rgba(255,107,138,0.5)', boxShadow: '0 8px 32px rgba(220,60,100,0.35)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                  style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: 'rgba(220,60,100,0.08)' }}>📷</div>}
          </div>
        </div>
      )}

      {/* ── CARD MODE: romantic polaroid ── */}
      {mode === 'card' && (
        <div className="relative z-10 mt-5 flex-shrink-0">
          {/* Glow behind card */}
          <div className="absolute -inset-4 opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(220,60,100,0.5) 0%, transparent 65%)', filter: 'blur(16px)' }} />
          <div className="relative"
            style={{ padding: '5px 5px 20px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: 4, border: '1px solid rgba(255,107,138,0.25)', boxShadow: '0 8px 28px rgba(0,0,0,0.5)', transform: 'rotate(-1deg)' }}>
            <div className="overflow-hidden rounded-[2px]" style={{ width: 116, height: 138 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: 'rgba(220,60,100,0.1)' }}>📷</div>}
            </div>
            <p className="mt-1 text-center text-[7px] tracking-[0.1em]"
              style={{ color: 'rgba(255,107,138,0.55)' }}>♥</p>
          </div>
        </div>
      )}

      {/* Name */}
      <p className="relative z-10 mt-5 px-6 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: '#fff0f3', letterSpacing: '0.02em' }}>
        {data.title || 'Tên đôi'}
      </p>

      {/* Rose divider */}
      <div className="relative z-10 mt-3 flex w-[65%] items-center gap-2.5">
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,107,138,0.55))' }} />
        <span className="text-[10px] leading-none" style={{ color: '#ff6b8a' }}>♥</span>
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(to left, transparent, rgba(255,107,138,0.55))' }} />
      </div>

      {data.date && (
        <p className="relative z-10 mt-2.5 text-[6.5px] font-bold tracking-[0.42em] uppercase"
          style={{ color: '#ff8fab', opacity: 0.7 }}>
          {fmt(data.date)}
        </p>
      )}

      {/* Glassmorphism description card */}
      <div className="relative z-10 mx-6 mt-4 rounded-2xl px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,107,138,0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
        <p className="text-center text-[7.5px] leading-[1.88] italic"
          style={{ color: 'rgba(255,240,243,0.52)' }}>
          {data.description || '"Mỗi ngày bên nhau là một trang mới trong câu chuyện tình yêu của chúng ta."'}
        </p>
      </div>

      {/* Bottom rose petals */}
      <div className="relative z-10 mt-auto flex items-center gap-2 pt-3">
        <span className="text-[11px]" style={{ opacity: 0.35 }}>🌹</span>
        <span className="text-[8px]" style={{ color: '#ff6b8a', opacity: 0.3 }}>♥</span>
        <span className="text-[11px]" style={{ opacity: 0.35 }}>🌹</span>
      </div>
    </div>
  );
}
