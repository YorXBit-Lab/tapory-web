'use client';
import type { LayoutProps } from '@/templates/types';

export function SpotPlayerPremium({ data, c }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _premRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _premFloat  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes _premGlow   { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes _premShimmer {
          0%  {background-position:-200% center}
          100%{background-position:200% center}
        }
      `}</style>

      {/* Rotating conic bg */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-[10%]"
        style={{
          background: `conic-gradient(from 0deg, ${c.primary}12, transparent 30%, ${c.primary}0c 60%, transparent 80%, ${c.primary}12)`,
          animation: '_premRotate 18s linear infinite',
          filter: 'blur(30px)',
        }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)' }} />

      <div className="flex-shrink-0" style={{ height: 48 }} />

      {/* "SPOTIFY PREMIUM" tag */}
      <div className="relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1"
        style={{ border: `1px solid ${c.primary}44`, background: `${c.primary}0e` }}>
        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.primary, animation: '_premGlow 2s ease-in-out infinite' }} />
        <span className="text-[5.5px] font-bold tracking-[0.5em] uppercase" style={{ color: c.primary }}>Spotify</span>
      </div>

      {/* Album art — tilted, floating */}
      <div className="relative z-10 mt-5 flex-shrink-0" style={{ animation: '_premFloat 5s ease-in-out infinite' }}>
        {/* Outer glow */}
        <div className="absolute -inset-6 rounded-[32px]"
          style={{ background: `radial-gradient(circle, ${c.primary}2a, transparent 70%)`, filter: 'blur(20px)' }} />
        {/* Shimmer border */}
        <div className="absolute -inset-[2px] rounded-[26px]"
          style={{
            background: `linear-gradient(135deg, ${c.primary}88, transparent 40%, ${c.primary}44 70%, transparent)`,
            backgroundSize: '200% 200%',
            animation: '_premShimmer 3s linear infinite',
          }} />
        <div className="relative h-[120px] w-[120px] overflow-hidden rounded-[24px]"
          style={{ boxShadow: `0 24px 72px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `radial-gradient(ellipse at 28% 24%, ${c.primary}55 0%, transparent 55%), radial-gradient(ellipse at 75% 78%, ${c.primary}22 0%, transparent 45%), linear-gradient(148deg, #1d2b1e 0%, #0c130d 100%)` }}>
                <span className="text-[48px]" style={{ filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.6))` }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%]"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-5 text-center text-[20px] font-bold leading-tight"
        style={{ color: c.secondary, letterSpacing: '-.012em', fontFamily: 'Georgia, serif' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[8px] font-semibold tracking-[0.26em] uppercase"
        style={{ color: c.primary, opacity: .85 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Animated gradient rule */}
      <div className="relative z-10 mt-3.5 h-px w-[60%]"
        style={{
          background: `linear-gradient(to right, transparent, ${c.primary}99, ${c.secondary}44, ${c.primary}77, transparent)`,
          backgroundSize: '200% 100%',
          animation: '_premShimmer 4s linear infinite',
        }} />

      {/* Play button */}
      <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
        className="relative z-10 mt-5" style={{ textDecoration: 'none', pointerEvents: hasUrl ? 'auto' : 'none' }}>
        <div className="flex items-center gap-3 rounded-2xl px-8 py-3.5"
          style={{
            background: hasUrl
              ? `linear-gradient(135deg, ${c.primary}f0, ${c.primary}cc)`
              : 'rgba(255,255,255,0.06)',
            boxShadow: hasUrl
              ? `0 8px 32px ${c.primary}55, 0 0 0 1px ${c.primary}33, inset 0 1px 0 rgba(255,255,255,0.2)`
              : 'none',
          }}>
          <span style={{ fontSize: 16, color: hasUrl ? '#000' : 'rgba(255,255,255,0.2)' }}>▶</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase',
            color: hasUrl ? '#000' : 'rgba(255,255,255,0.2)' }}>
            {hasUrl ? 'Phát trên Spotify' : 'Chưa có link'}
          </span>
        </div>
      </a>

      {data.description && (
        <div className="relative z-10 mx-6 mt-4 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.primary}18`, backdropFilter: 'blur(12px)' }}>
          <p className="text-center text-[7.5px] italic leading-[1.88]" style={{ color: c.secondary, opacity: .38 }}>
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}
