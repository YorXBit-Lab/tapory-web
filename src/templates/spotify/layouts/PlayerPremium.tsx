'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyEmbed } from '@/hooks/useSpotifyEmbed';

export function SpotPlayerPremium({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, error, toggle } = useSpotifyEmbed(uri, autoPlay);

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

      {/* ── Play / Pause button ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mt-5 flex items-center gap-3 rounded-2xl px-8 py-3.5"
        style={{
          background: hasUrl ? (playing ? 'rgba(255,255,255,0.12)' : `linear-gradient(135deg, ${c.primary}f0, ${c.primary}cc)`) : 'rgba(255,255,255,0.06)',
          boxShadow: hasUrl && !playing ? `0 8px 32px ${c.primary}55, 0 0 0 1px ${c.primary}33, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
          border: playing ? `1px solid rgba(255,255,255,0.25)` : 'none',
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize: 16, color: playing ? 'rgba(255,255,255,0.9)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>
          {playing ? '⏸' : '▶'}
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase',
          color: playing ? 'rgba(255,255,255,0.85)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>
          {!hasUrl ? 'Chưa có link' : playing ? 'Dừng lại' : 'Phát nhạc'}
        </span>
      </button>

      {/* ── Open Spotify link ── */}
      {hasUrl && (
        <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer"
          className="relative z-10 mt-2 flex items-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .55 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={c.primary}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/></svg>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase' }}>Mở trên Spotify</span>
        </a>
      )}

      {hasUrl && <div ref={holderRef} aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, pointerEvents: 'none', visibility: 'hidden' }} />}

      {data.description && (
        <div className="relative z-10 mx-5 mt-4 mb-4 rounded-2xl px-5 pt-5 pb-4"
          style={{ background:`${c.primary}0e`, border:`1px solid ${c.primary}2a`, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
          <span className="pointer-events-none absolute -top-[14px] left-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❝</span>
          <p className="text-center text-[9px] italic leading-[1.9]"
            style={{ color:c.secondary, opacity:.8, fontFamily:'Georgia, serif' }}>
            {data.description}
          </p>
          <span className="pointer-events-none absolute -bottom-[14px] right-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❞</span>
        </div>
      )}
    </div>
  );
}
