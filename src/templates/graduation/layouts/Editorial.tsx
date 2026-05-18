import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradEditorial({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── FULL MODE: photo 56% top ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: '56%' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ filter: imgFilter, transform: 'scale(1.06)', transformOrigin: 'top center' }} />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(168deg, ${c.primary}f0 0%, ${c.primary}70 55%, ${c.primary}30 100%)` }}>
                <span className="text-8xl" style={{ opacity: 0.06 }}>📷</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: 90, background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 48, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(to bottom right, ${c.secondary}18 0%, transparent 55%)` }} />
          <div className="absolute left-4 top-[54px] flex items-center gap-1.5">
            <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
            <p className="text-[7px] font-black tracking-[0.55em] uppercase text-white" style={{ opacity: 0.82 }}>
              Graduation
            </p>
          </div>
        </div>
      )}

      {/* ── CARD MODE: editorial header + portrait ── */}
      {mode === 'card' && (
        <>
          <div className="flex-shrink-0" style={{ height: 52 }} />
          <div className="flex items-center gap-1.5 px-5">
            <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
            <p className="text-[7px] font-black tracking-[0.55em] uppercase" style={{ color: c.primary, opacity: 0.55 }}>
              Graduation
            </p>
          </div>
          <div className="mx-5 mt-3 flex-shrink-0 overflow-hidden rounded-lg"
            style={{ border: `1.5px solid ${c.secondary}55`, boxShadow: `0 4px 18px rgba(0,0,0,0.12)` }}>
            <div style={{ height: 164 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center"
                    style={{ background: `${c.primary}0f` }}>
                    <span className="text-6xl" style={{ opacity: 0.1 }}>📷</span>
                  </div>}
            </div>
          </div>
        </>
      )}

      {/* ── CIRCLE MODE ── */}
      {mode === 'circle' && (
        <>
          <div className="flex-shrink-0" style={{ height: 52 }} />
          <div className="flex items-center gap-1.5 px-5">
            <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
            <p className="text-[7px] font-black tracking-[0.55em] uppercase" style={{ color: c.primary, opacity: 0.55 }}>
              Graduation
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="overflow-hidden rounded-full"
              style={{ width: 110, height: 110, border: `1.5px solid ${c.secondary}66`, boxShadow: `0 4px 18px rgba(0,0,0,0.12)` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ filter: imgFilter, transform: 'scale(1.04)' }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl"
                    style={{ background: `${c.primary}0f` }}>📷</div>}
            </div>
          </div>
        </>
      )}

      {/* ── SEPARATOR ── */}
      <div className="flex-shrink-0"
        style={{ height: 1.5, background: `linear-gradient(to right, transparent 0%, ${c.secondary}cc 35%, ${c.secondary} 50%, ${c.secondary}cc 65%, transparent 100%)` }} />

      {/* ── CONTENT ZONE ── */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-6">
        <p className="font-black leading-[1.05]"
          style={{ fontFamily: font, fontSize: titleSize, color: c.primary, letterSpacing: '-0.025em' }}>
          {data.title || 'Tên người nhận'}
        </p>

        {data.subtitle && (
          <p className="mt-1.5 text-[9px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: c.primary, opacity: 0.38 }}>
            {data.subtitle}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="h-[2px] w-8 rounded-full" style={{ backgroundColor: c.secondary }} />
          <div className="h-px flex-1" style={{ backgroundColor: c.primary, opacity: 0.1 }} />
        </div>

        <p className="mt-2.5 text-[10px] leading-[1.88]"
          style={{ color: c.primary, opacity: 0.5 }}>
          {data.description || 'Chúc mừng tốt nghiệp. Hành trình mới đang chờ bạn phía trước.'}
        </p>

        <div className="mt-auto pt-3">
          {data.date && (
            <p className="text-[9px] font-bold tracking-[0.32em] uppercase"
              style={{ color: c.secondary }}>
              — {fmt(data.date)} —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
