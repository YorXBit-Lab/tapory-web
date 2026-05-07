import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradPastel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-6"
      style={{ background: 'linear-gradient(155deg, #fce4ec 0%, #ede7f6 38%, #e3f2fd 72%, #f3e5f5 100%)' }}>

      {/* Soft orbs */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full opacity-55"
        style={{ background: 'radial-gradient(circle, #f8bbd0, transparent 65%)', filter: 'blur(26px)' }} />
      <div className="pointer-events-none absolute -right-8 top-[30%] h-44 w-44 rounded-full opacity-42"
        style={{ background: 'radial-gradient(circle, #d1c4e9, transparent 65%)', filter: 'blur(22px)' }} />
      <div className="pointer-events-none absolute -left-4 bottom-16 h-36 w-36 rounded-full opacity-38"
        style={{ background: 'radial-gradient(circle, #bbdefb, transparent 65%)', filter: 'blur(18px)' }} />

      {/* ── FULL MODE: photo fills top ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '48%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.04)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.4)' }}>
                <span className="text-6xl" style={{ opacity: 0.1 }}>📷</span>
              </div>}
          {/* Rainbow gradient overlay at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 64, background: 'linear-gradient(to top, #fce4ec, transparent)' }} />
        </div>
      )}

      {mode !== 'full' && <div className="flex-shrink-0" style={{ height: 54 }} />}

      {/* ── CIRCLE MODE: rainbow conic glow ── */}
      {mode === 'circle' && (
        <div className="relative z-10 flex-shrink-0">
          <div className="absolute -inset-[5px] rounded-[20px] opacity-70"
            style={{
              background: 'conic-gradient(from 0deg, #f9a8d4, #c4b5fd, #93c5fd, #6ee7b7, #fde68a, #f9a8d4)',
              filter: 'blur(7px)',
            }} />
          <div className="relative overflow-hidden rounded-[16px]"
            style={{ width: 108, height: 126, border: '3px solid rgba(255,255,255,0.92)', boxShadow: '0 8px 28px rgba(0,0,0,0.1)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                  style={{ transform: 'scale(1.04)', filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: 'rgba(255,255,255,0.6)' }}>📷</div>}
          </div>
        </div>
      )}

      {/* ── CARD MODE: white mat portrait ── */}
      {mode === 'card' && (
        <div className="relative z-10 flex-shrink-0">
          <div className="relative bg-white"
            style={{ padding: '6px 6px 20px 6px', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'rotate(-1.5deg)' }}>
            <div className="overflow-hidden rounded-[3px]" style={{ width: 112, height: 132 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ transform: 'scale(1.04)', filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: 'linear-gradient(135deg, #fce4ec, #ede7f6)' }}>📷</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── FULL MODE: no flower divider needed ── */}
      {mode !== 'full' && (
        <div className="relative z-10 mt-4 flex items-center gap-2">
          <div className="h-px w-10 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.2 }} />
          <span className="text-[13px]">🌸</span>
          <div className="h-px w-10 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.2 }} />
        </div>
      )}
      {mode === 'full' && (
        <div className="relative z-10 mt-2 flex items-center gap-2">
          <div className="h-px w-10 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.2 }} />
          <span className="text-[13px]">🌸</span>
          <div className="h-px w-10 rounded-full" style={{ backgroundColor: c.primary, opacity: 0.2 }} />
        </div>
      )}

      {/* Name */}
      <p className="relative z-10 mt-2.5 px-5 text-center font-bold leading-snug"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1 px-6 text-center text-[7.5px] tracking-[0.18em]"
          style={{ color: c.primary, opacity: 0.48 }}>
          {data.subtitle}
        </p>
      )}

      {/* Glassmorphism message card */}
      <div className="relative z-10 mx-5 mt-4 rounded-[18px] px-4 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.52)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.82)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        }}>
        <div className="mb-2.5 h-[1.5px] w-full rounded-full"
          style={{ background: 'linear-gradient(to right, #f9a8d4, #c4b5fd, #93c5fd)' }} />
        <p className="text-center text-[7.5px] leading-[1.82]"
          style={{ color: c.primary, opacity: 0.68 }}>
          {data.description || 'Chúc mừng tốt nghiệp! Wishing you a future as bright and beautiful as you are. ✨'}
        </p>
      </div>

      {data.date && (
        <p className="relative z-10 mt-3.5 text-[7px] font-semibold tracking-[0.24em] uppercase"
          style={{ color: c.primary, opacity: 0.4 }}>
          {fmt(data.date)}
        </p>
      )}
    </div>
  );
}
