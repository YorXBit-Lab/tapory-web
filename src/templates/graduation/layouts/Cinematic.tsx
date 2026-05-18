import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function GradCinematic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#080808' }}>

      {/* ── FULL MODE: photo as full-bleed background ── */}
      {mode === 'full' && data.imageUrl && (
        <div className="absolute inset-0">
          <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
            style={{ transform: 'scale(1.06)', transformOrigin: 'top center', opacity: 0.78, filter: imgFilter }} />
        </div>
      )}
      {mode === 'full' && !data.imageUrl && (
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(170deg, #1a1428, #0d0d1a 40%, #080808)' }} />
      )}

      {/* ── CARD MODE: dark bg + portrait photo ── */}
      {mode === 'card' && (
        <>
          <div className="flex-shrink-0" style={{ height: 52 }} />
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-lg"
              style={{ width: 120, height: 150, border: `1px solid rgba(255,255,255,0.12)`, boxShadow: `0 8px 40px rgba(0,0,0,0.8), 0 0 30px ${c.secondary}18` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ filter: imgFilter, transform: 'scale(1.04)' }} />
                : <div className="flex h-full w-full items-center justify-center"
                    style={{ background: '#1a1428' }}>
                    <span className="text-5xl" style={{ opacity: 0.12 }}>📷</span>
                  </div>}
            </div>
          </div>
        </>
      )}

      {/* ── CIRCLE MODE ── */}
      {mode === 'circle' && (
        <>
          <div className="flex-shrink-0" style={{ height: 52 }} />
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-full"
              style={{ width: 118, height: 118, border: `1.5px solid rgba(255,255,255,0.14)`, boxShadow: `0 8px 40px rgba(0,0,0,0.8), 0 0 30px ${c.secondary}18` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                    style={{ filter: imgFilter, transform: 'scale(1.04)' }} />
                : <div className="flex h-full w-full items-center justify-center"
                    style={{ background: '#1a1428' }}>
                    <span className="text-5xl" style={{ opacity: 0.12 }}>📷</span>
                  </div>}
            </div>
          </div>
        </>
      )}

      {/* Shared overlays (full mode only) */}
      {mode === 'full' && (
        <>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 38%, transparent 28%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.92) 100%)' }} />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, rgba(0,0,0,0.5) 58%, rgba(8,8,8,0.96) 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }} />
        </>
      )}

      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22px]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.4))' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22px]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4))' }} />

      {/* Content — pinned to bottom third */}
      <div className={`${mode === 'full' ? 'absolute inset-x-0 bottom-6' : 'relative z-10 mt-auto mb-6'} flex flex-col px-6`}>
        <div className="mb-3 flex items-center gap-2.5">
          <div className="h-px w-6" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}80)` }} />
          <p className="text-[8px] font-bold tracking-[0.5em] uppercase"
            style={{ color: c.secondary, opacity: 0.78 }}>
            ✦ Graduation 2026 ✦
          </p>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${c.secondary}40, transparent)` }} />
        </div>

        <p className="font-bold leading-[1.08]"
          style={{
            fontFamily: font,
            fontSize: titleSize,
            color: '#f0ebe0',
            letterSpacing: '0.01em',
            textShadow: `0 2px 18px rgba(0,0,0,0.8), 0 0 40px ${c.secondary}28`,
          }}>
          {data.title || 'Tên người nhận'}
        </p>

        {data.subtitle && (
          <p className="mt-1.5 text-[9.5px] tracking-[0.22em] uppercase"
            style={{ color: c.secondary, opacity: 0.62 }}>
            {data.subtitle}
          </p>
        )}

        <div className="my-3 h-px w-14 rounded-full"
          style={{ backgroundColor: c.secondary, opacity: 0.55 }} />

        <p className="text-[10px] leading-[1.88] italic"
          style={{ color: c.secondary, opacity: 0.68 }}>
          {data.description || '"Cuối cùng cũng đến ngày này. Chúc mừng bạn đã hoàn thành hành trình."'}
        </p>

        {data.date && (
          <p className="mt-3.5 text-[9px] font-semibold tracking-[0.35em] uppercase"
            style={{ color: '#555' }}>
            {fmt(data.date)}
          </p>
        )}
      </div>
    </div>
  );
}
