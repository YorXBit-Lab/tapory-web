import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradEditorial({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── PHOTO ZONE ── top 56% */}
      <div className="relative w-full flex-shrink-0" style={{ height: '56%' }}>
        {data.imageUrl
          ? <img
              src={data.imageUrl}
              className="h-full w-full object-cover object-top"
              alt=""
              style={{ transform: 'scale(1.06)', transformOrigin: 'top center' }}
            />
          : <div className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(168deg, ${c.primary}f0 0%, ${c.primary}70 55%, ${c.primary}30 100%)` }}>
              <span className="text-8xl" style={{ opacity: 0.07 }}>📷</span>
            </div>}

        {/* Top burn — makes DI area legible */}
        <div className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: 90, background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0) 100%)' }} />

        {/* "GRADUATION" label — top-left, below DI */}
        <div className="absolute left-4 top-[52px] flex items-center gap-1.5">
          <div className="h-[1.5px] w-3" style={{ backgroundColor: c.secondary }} />
          <p className="text-[5.5px] font-black tracking-[0.55em] uppercase text-white" style={{ opacity: 0.82 }}>
            Graduation
          </p>
        </div>
      </div>

      {/* ── SEPARATOR — 1.5px gold gradient ── */}
      <div className="flex-shrink-0"
        style={{ height: 1.5, background: `linear-gradient(to right, transparent 0%, ${c.secondary}cc 35%, ${c.secondary} 50%, ${c.secondary}cc 65%, transparent 100%)` }} />

      {/* ── CONTENT ZONE — cream panel ── */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-6">

        {/* Title */}
        <p className="text-[26px] font-black leading-[1.05]"
          style={{ color: c.primary, letterSpacing: '-0.025em' }}>
          {data.title || 'Tên người nhận'}
        </p>

        {data.subtitle && (
          <p className="mt-1.5 text-[7px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: c.primary, opacity: 0.38 }}>
            {data.subtitle}
          </p>
        )}

        {/* Gold + faint rule */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-[2px] w-8 rounded-full" style={{ backgroundColor: c.secondary }} />
          <div className="h-px flex-1" style={{ backgroundColor: c.primary, opacity: 0.1 }} />
        </div>

        {/* Description */}
        <p className="mt-2.5 text-[8px] leading-[1.88]"
          style={{ color: c.primary, opacity: 0.5 }}>
          {data.description || 'Chúc mừng tốt nghiệp. Hành trình mới đang chờ bạn phía trước.'}
        </p>

        {/* Date — pushed to bottom */}
        <div className="mt-auto pt-3">
          {data.date && (
            <p className="text-[7px] font-bold tracking-[0.32em] uppercase"
              style={{ color: c.secondary }}>
              — {fmt(data.date)} —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
