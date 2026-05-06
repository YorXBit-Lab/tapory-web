import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function AnniEditorial({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── PHOTO ZONE ── top 55% */}
      <div className="relative w-full flex-shrink-0" style={{ height: '55%' }}>
        {data.imageUrl
          ? <img
              src={data.imageUrl}
              className="h-full w-full object-cover object-center"
              alt=""
              style={{ transform: 'scale(1.06)', transformOrigin: 'center' }}
            />
          : <div className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(168deg, ${c.primary}f0 0%, ${c.primary}60 60%, ${c.primary}28 100%)` }}>
              <span className="text-8xl" style={{ opacity: 0.06 }}>📷</span>
            </div>}

        {/* Top burn */}
        <div className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 100%)' }} />

        {/* Bottom fade — blends into separator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: 48, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 100%)' }} />

        {/* Champagne wash — gives warmth */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(to bottom right, ${c.secondary}18 0%, transparent 55%)` }} />

        {/* "ANNIVERSARY" label — top-left below DI */}
        <div className="absolute left-4 top-[54px] flex items-center gap-1.5">
          <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
          <p className="text-[5.5px] font-black tracking-[0.55em] uppercase"
            style={{ color: c.secondary, opacity: 0.88 }}>
            Anniversary
          </p>
        </div>

        {/* ♡ watermark — center-right */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[52px] font-bold leading-none select-none"
          style={{ color: c.secondary, opacity: 0.08 }}>
          ♥
        </div>
      </div>

      {/* ── SEPARATOR — champagne gradient ── */}
      <div className="flex-shrink-0"
        style={{ height: 1.5, background: `linear-gradient(to right, transparent 0%, ${c.secondary}cc 30%, ${c.secondary} 50%, ${c.secondary}cc 70%, transparent 100%)` }} />

      {/* ── CONTENT ZONE ── */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-6">

        {/* Title */}
        <p className="text-[25px] font-black leading-[1.05]"
          style={{ color: c.primary, letterSpacing: '-0.02em' }}>
          {data.title || 'Tên đôi'}
        </p>

        {/* Accent rule with ♡ */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-[2px] w-7 rounded-full" style={{ backgroundColor: c.secondary }} />
          <span className="text-[8px] leading-none" style={{ color: c.secondary }}>♥</span>
          <div className="h-px flex-1" style={{ backgroundColor: c.primary, opacity: 0.08 }} />
        </div>

        {/* Description */}
        <p className="mt-2.5 text-[8px] leading-[1.9] italic"
          style={{ color: c.primary, opacity: 0.48 }}>
          {data.description || 'Cảm ơn bạn đã ở bên tôi trong những năm tháng tuyệt vời nhất của cuộc đời.'}
        </p>

        {/* Date — pushed to bottom */}
        <div className="mt-auto pt-3">
          {data.date && (
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
