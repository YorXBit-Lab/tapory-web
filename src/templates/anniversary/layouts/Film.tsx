import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

const PERF_COUNT = 12;

export function AnniFilm({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── LEFT FILM STRIP ── */}
      <div className="absolute inset-y-0 left-0 z-20 flex w-[18px] flex-col items-center justify-around py-3"
        style={{ backgroundColor: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {Array.from({ length: PERF_COUNT }).map((_, i) => (
          <div key={i} className="rounded-[2px] flex-shrink-0"
            style={{ width: 8, height: 10, backgroundColor: c.accent, opacity: 0.18 }} />
        ))}
      </div>

      {/* ── RIGHT FILM STRIP ── */}
      <div className="absolute inset-y-0 right-0 z-20 flex w-[18px] flex-col items-center justify-around py-3"
        style={{ backgroundColor: '#0d0d0d', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        {Array.from({ length: PERF_COUNT }).map((_, i) => (
          <div key={i} className="rounded-[2px] flex-shrink-0"
            style={{ width: 8, height: 10, backgroundColor: c.accent, opacity: 0.18 }} />
        ))}
      </div>

      {/* ── MAIN CONTENT — inset from strips ── */}
      <div className="relative z-10 flex h-full flex-col" style={{ marginLeft: 18, marginRight: 18 }}>

        {/* Safe zone spacer */}
        <div className="flex-shrink-0" style={{ height: 50 }} />

        {/* "ANNIVERSARY" header */}
        <div className="flex items-center gap-2 px-3">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}88)` }} />
          <p className="text-[5.5px] font-bold tracking-[0.6em] uppercase" style={{ color: c.secondary, opacity: 0.7 }}>
            Anniversary
          </p>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}88)` }} />
        </div>

        {/* ── LARGE PHOTO ZONE ── */}
        <div className="relative mt-3 flex-shrink-0 overflow-hidden" style={{ height: '46%' }}>
          {data.imageUrl
            ? <img
                src={data.imageUrl}
                className="h-full w-full object-cover object-center"
                alt=""
                style={{ transform: 'scale(1.06)' }}
              />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: '#1e1a14' }}>
                <span className="text-6xl" style={{ opacity: 0.12 }}>📷</span>
              </div>}

          {/* Warm sepia film overlay */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(to bottom right, ${c.secondary}22 0%, transparent 55%, rgba(0,0,0,0.15) 100%)` }} />

          {/* Bottom vignette */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ height: 56, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />

          {/* Top vignette */}
          <div className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: 36, background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 100%)' }} />

          {/* Grain texture */}
          <div className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.045\'/%3E%3C/svg%3E")',
              backgroundSize: '180px 180px',
            }} />

          {/* Frame number — bottom left */}
          <p className="absolute bottom-2 left-3 text-[6px] font-mono font-bold tracking-wider"
            style={{ color: c.secondary, opacity: 0.5 }}>
            ♥ 01A
          </p>
        </div>

        {/* Name */}
        <p className="mt-4 px-3 text-center text-[21px] font-bold leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: '#ffffff', letterSpacing: '0.01em' }}>
          {data.title || 'Tên đôi'}
        </p>

        {/* Gold ♡ divider */}
        <div className="mt-3 flex items-center gap-2 px-5">
          <div className="h-px flex-1"
            style={{ background: `linear-gradient(to right, transparent, ${c.secondary}88)` }} />
          <span className="text-[10px] leading-none" style={{ color: c.secondary }}>♥</span>
          <div className="h-px flex-1"
            style={{ background: `linear-gradient(to left, transparent, ${c.secondary}88)` }} />
        </div>

        {/* Date */}
        {data.date && (
          <p className="mt-2.5 text-center text-[6.5px] font-bold tracking-[0.5em] uppercase"
            style={{ color: c.secondary, opacity: 0.7 }}>
            {fmt(data.date)}
          </p>
        )}

        {/* Description */}
        <p className="mt-3 px-4 text-center text-[7.5px] leading-[1.85] italic"
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          {data.description || '"Những khoảnh khắc đẹp nhất luôn là những khoảnh khắc bên nhau."'}
        </p>

        {/* Spacer */}
        <div className="flex-1" />
      </div>
    </div>
  );
}
