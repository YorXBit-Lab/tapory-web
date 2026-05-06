import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradCinematic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#080808' }}>

      {/* Full-bleed photo */}
      <div className="absolute inset-0">
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
              style={{ transform: 'scale(1.06)', transformOrigin: 'top center', opacity: 0.78 }} />
          : <div className="h-full w-full"
              style={{ background: 'linear-gradient(170deg, #1a1428, #0d0d1a 40%, #080808)' }} />}
      </div>

      {/* Cinematic vignette — heavy edge darkening */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 38%, transparent 28%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.92) 100%)' }} />

      {/* Bottom gradient — deep fade to black */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, rgba(0,0,0,0.5) 58%, rgba(8,8,8,0.96) 100%)' }} />

      {/* Top gradient — subtle burn */}
      <div className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }} />

      {/* Film grain texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAANDQ0ODg4PDw8QEBAREREAAAAuZ==")', backgroundSize: '80px 80px' }} />

      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22px]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.4))' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22px]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4))' }} />

      {/* Content — pinned to bottom third */}
      <div className="absolute inset-x-0 bottom-6 flex flex-col px-6">
        {/* Gold label */}
        <div className="mb-3 flex items-center gap-2.5">
          <div className="h-px w-6" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}80)` }} />
          <p className="text-[6.5px] font-bold tracking-[0.5em] uppercase"
            style={{ color: c.secondary, opacity: 0.78 }}>
            ✦ Graduation 2026 ✦
          </p>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${c.secondary}40, transparent)` }} />
        </div>

        {/* Title — cinematic card */}
        <p className="text-[26px] font-bold leading-[1.08]"
          style={{
            fontFamily: 'Georgia, serif',
            color: '#f0ebe0',
            letterSpacing: '0.01em',
            textShadow: `0 2px 18px rgba(0,0,0,0.8), 0 0 40px ${c.secondary}28`,
          }}>
          {data.title || 'Tên người nhận'}
        </p>

        {data.subtitle && (
          <p className="mt-1.5 text-[7.5px] tracking-[0.22em] uppercase"
            style={{ color: c.secondary, opacity: 0.62 }}>
            {data.subtitle}
          </p>
        )}

        {/* Accent line */}
        <div className="my-3 h-px w-14 rounded-full"
          style={{ backgroundColor: c.secondary, opacity: 0.55 }} />

        {/* Description — italic quote */}
        <p className="text-[8px] leading-[1.88] italic"
          style={{ color: c.secondary, opacity: 0.68 }}>
          {data.description || '"Cuối cùng cũng đến ngày này. Chúc mừng bạn đã hoàn thành hành trình."'}
        </p>

        {data.date && (
          <p className="mt-3.5 text-[7px] font-semibold tracking-[0.35em] uppercase"
            style={{ color: '#555', letterSpacing: '0.35em' }}>
            {fmt(data.date)}
          </p>
        )}
      </div>
    </div>
  );
}
