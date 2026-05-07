'use client';
import type { LayoutProps } from '@/templates/types';

export function SpotLight({ data, c }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _ltFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes _ltPulse  { 0%,100%{transform:scale(1);opacity:.18} 50%{transform:scale(1.22);opacity:0} }
        @keyframes _ltSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _ltWave   {
          0%,100%{height:4px} 20%{height:12px} 40%{height:8px} 60%{height:16px} 80%{height:6px}
        }
      `}</style>

      {/* Color wash */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}1a 0%, transparent 65%)`, filter: 'blur(44px)' }} />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}10 0%, transparent 65%)`, filter: 'blur(36px)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* Album art */}
      <div className="relative z-10 mx-auto flex-shrink-0" style={{ animation: '_ltFloat 4s ease-in-out infinite' }}>
        <div className="absolute -inset-4 rounded-[30px]"
          style={{ background: `radial-gradient(circle, ${c.primary}20 0%, transparent 70%)`, filter: 'blur(14px)' }} />
        {/* Pulse ring */}
        <div className="absolute -inset-3 rounded-[28px]"
          style={{ border: `2px solid ${c.primary}`, animation: '_ltPulse 2.5s ease-out infinite' }} />
        <div className="relative h-[96px] w-[96px] overflow-hidden rounded-[24px]"
          style={{ boxShadow: `0 12px 40px ${c.primary}30, 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(140deg, ${c.primary}e8 0%, ${c.primary}99 55%, ${c.primary}55 100%)` }}>
                <div className="pointer-events-none absolute left-[10%] top-[8%] h-10 w-10 rounded-full opacity-25"
                  style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                <span className="relative z-10 text-[36px]" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)' }} />
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-6 text-center text-[21px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '-.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[8.5px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: c.primary }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Mini EQ bars */}
      <div className="relative z-10 mt-4 flex items-end justify-center gap-[3px]" style={{ height: 20 }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: 2,
            backgroundColor: c.primary, opacity: .5,
            animation: `_ltWave ${.6+(i*.08)}s ease-in-out infinite`,
            animationDelay: `${i*.1}s`,
          }} />
        ))}
      </div>

      {/* Divider */}
      <div className="relative z-10 mx-auto mt-3 rounded-full"
        style={{ width: 36, height: 1.5, backgroundColor: c.primary, opacity: .28 }} />

      {/* Play button */}
      <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
        className="relative z-10 mx-auto mt-4" style={{ textDecoration: 'none', pointerEvents: hasUrl ? 'auto' : 'none' }}>
        <div className="flex items-center gap-2.5 rounded-full px-8 py-3.5"
          style={{
            background: hasUrl ? c.primary : `${c.primary}18`,
            boxShadow: hasUrl ? `0 6px 24px ${c.primary}40, 0 0 0 3px ${c.primary}18` : 'none',
          }}>
          <span style={{ fontSize: 14, color: hasUrl ? '#fff' : `${c.primary}60` }}>▶</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
            color: hasUrl ? '#fff' : `${c.primary}60` }}>
            {hasUrl ? 'Phát nhạc' : 'Chưa có link'}
          </span>
        </div>
      </a>

      {data.description && (
        <p className="relative z-10 mt-4 px-7 text-center text-[7.5px] leading-[1.9]"
          style={{ color: c.secondary, opacity: .42 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
