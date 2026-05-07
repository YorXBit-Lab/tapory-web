import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function AnniEditorial({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── FULL MODE: photo top 55% ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '55%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt=""
                style={{ transform: 'scale(1.06)', transformOrigin: 'center', filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(168deg, ${c.primary}f0 0%, ${c.primary}60 60%, ${c.primary}28 100%)` }}>
                <span className="text-8xl" style={{ opacity: 0.06 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 48, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(to bottom right, ${c.secondary}18 0%, transparent 55%)` }} />
          <div className="absolute left-4 top-[54px] flex items-center gap-1.5">
            <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
            <p className="text-[5.5px] font-black tracking-[0.55em] uppercase"
              style={{ color: c.secondary, opacity: 0.88 }}>Anniversary</p>
          </div>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[52px] font-bold leading-none select-none"
            style={{ color: c.secondary, opacity: 0.08 }}>♥</div>
        </div>
      )}

      {/* ── CARD MODE: portrait on left side header ── */}
      {mode === 'card' && (
        <>
          <div className="flex-shrink-0" style={{ height: 48 }} />
          <div className="flex items-center gap-3 px-5">
            <div className="relative flex-shrink-0 overflow-hidden rounded-lg"
              style={{ width: 88, height: 108, border: `1.5px solid ${c.secondary}88`, boxShadow: `0 4px 16px rgba(0,0,0,0.1)` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ transform: 'scale(1.04)', filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-3xl"
                    style={{ background: `${c.secondary}10` }}>📷</div>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-[1.5px] w-8" style={{ backgroundColor: c.secondary }} />
              <p className="text-[5.5px] font-black tracking-[0.55em] uppercase"
                style={{ color: c.secondary, opacity: 0.88 }}>Anniversary</p>
              <p className="mt-1 font-bold leading-tight"
                style={{ fontFamily: font, fontSize: titleSize, color: c.primary, letterSpacing: '-0.01em' }}>
                {data.title || 'Tên đôi'}
              </p>
              {data.date && (
                <p className="mt-1 text-[6px] font-bold tracking-[0.3em] uppercase"
                  style={{ color: c.secondary, opacity: 0.75 }}>
                  — {fmt(data.date)} —
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── CIRCLE MODE ── */}
      {mode === 'circle' && (
        <>
          <div className="flex-shrink-0" style={{ height: 48 }} />
          <div className="flex flex-col items-center">
            <p className="text-[5.5px] font-black tracking-[0.55em] uppercase mb-3"
              style={{ color: c.secondary, opacity: 0.88 }}>Anniversary</p>
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-[4px] rounded-full opacity-60"
                style={{ background: `${c.secondary}44`, filter: 'blur(8px)' }} />
              <div className="relative overflow-hidden rounded-full"
                style={{ width: 120, height: 120, border: `2px solid ${c.secondary}99`, boxShadow: `0 6px 20px rgba(0,0,0,0.12)` }}>
                {data.imageUrl
                  ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                      style={{ filter: imgFilter }} />
                  : <div className="flex h-full w-full items-center justify-center text-4xl"
                      style={{ background: `${c.secondary}10` }}>📷</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SEPARATOR ── */}
      <div className="flex-shrink-0 mt-2"
        style={{ height: 1.5, background: `linear-gradient(to right, transparent 0%, ${c.secondary}cc 30%, ${c.secondary} 50%, ${c.secondary}cc 70%, transparent 100%)` }} />

      {/* ── CONTENT ZONE ── */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-6">

        {mode === 'full' && (
          <p className="text-[25px] font-black leading-[1.05]"
            style={{ fontFamily: font, fontSize: titleSize, color: c.primary, letterSpacing: '-0.02em' }}>
            {data.title || 'Tên đôi'}
          </p>
        )}

        {/* Accent rule with ♡ */}
        {mode === 'full' && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-[2px] w-7 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="text-[8px] leading-none" style={{ color: c.secondary }}>♥</span>
            <div className="h-px flex-1" style={{ backgroundColor: c.primary, opacity: 0.08 }} />
          </div>
        )}

        {mode !== 'full' && (
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-7 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="text-[8px] leading-none" style={{ color: c.secondary }}>♥</span>
            <div className="h-px flex-1" style={{ backgroundColor: c.primary, opacity: 0.08 }} />
          </div>
        )}

        <p className="mt-2.5 text-[8px] leading-[1.9] italic"
          style={{ color: c.primary, opacity: 0.48 }}>
          {data.description || 'Cảm ơn bạn đã ở bên tôi trong những năm tháng tuyệt vời nhất của cuộc đời.'}
        </p>

        <div className="mt-auto pt-3">
          {mode === 'full' && data.date && (
            <p className="text-[7px] font-bold tracking-[0.35em] uppercase"
              style={{ color: c.secondary, opacity: 0.8 }}>
              — {fmt(data.date)} —
            </p>
          )}
          {mode !== 'full' && data.date && (
            <p className="text-[7px] font-bold tracking-[0.35em] uppercase"
              style={{ color: c.secondary, opacity: 0.8 }}>
              — {fmt(data.date)} —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
