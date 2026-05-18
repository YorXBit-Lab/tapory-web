'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

const SpotifyLogo = ({ size = 14, color = '#000' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/>
  </svg>
);

export function SpotEmbed({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, isBlocked, error, toggle } = useSpotifyPlayer(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _embFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes _embPulse { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes _embRing  { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.18);opacity:0} }
        @keyframes _embSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}28 0%, transparent 65%)`, filter: 'blur(52px)' }} />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}14 0%, transparent 65%)`, filter: 'blur(40px)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)' }} />

      <div className="flex-shrink-0" style={{ height: 48 }} />

      {/* Spotify logo */}
      <div style={{ animation: '_embPulse 3s ease-in-out infinite' }}>
        <SpotifyLogo size={36} color={c.primary} />
      </div>

      {/* Album art */}
      <div className="relative z-10 mt-5 flex-shrink-0" style={{ animation: '_embFloat 4.5s ease-in-out infinite' }}>
        <div className="absolute -inset-5 rounded-full"
          style={{ background: `radial-gradient(circle, ${c.primary}28, transparent 70%)`, filter: 'blur(18px)' }} />
        <div className="absolute -inset-[2px] rounded-[26px]"
          style={{ background: `${c.primary}`, opacity: .18, animation: '_embRing 2.8s ease-out infinite' }} />
        <div className="relative h-[112px] w-[112px] overflow-hidden rounded-[24px]"
          style={{ boxShadow: `0 20px 60px ${c.primary}44, 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22)` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(148deg, ${c.primary}cc 0%, ${c.primary}77 55%, rgba(255,255,255,0.08) 100%)` }}>
                <span className="text-[46px]" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.45))' }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent 55%)' }} />
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-6 text-center text-[20px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '-.015em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[10.5px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: c.primary, opacity: .85 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mt-4 w-[55%]"
        style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.primary}66, transparent)` }} />

      {/* ── Play / Pause button ── */}
      <button
        type="button"
        disabled={!hasUrl || !isReady || isLoading || !!error}
        onClick={toggle}
        className="relative z-10 mt-5 flex items-center gap-2.5 rounded-full px-8 py-3.5 transition-opacity"
        style={{
          background: hasUrl ? (playing ? `rgba(255,255,255,0.15)` : c.primary) : `rgba(255,255,255,0.08)`,
          boxShadow: hasUrl && !playing ? `0 6px 24px ${c.primary}55, 0 0 0 4px ${c.primary}18` : 'none',
          border: playing ? `1px solid rgba(255,255,255,0.25)` : 'none',
          cursor: hasUrl ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontSize: 13, color: playing ? 'rgba(255,255,255,0.9)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.25)') }}>
          {playing ? '⏸' : '▶'}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
          color: playing ? 'rgba(255,255,255,0.85)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.25)'),
        }}>
          {!hasUrl ? 'Chưa có link' : isBlocked ? 'Chạm lại để phát 🎵' : playing ? 'Dừng lại' : 'Phát nhạc'}
        </span>
      </button>

      {/* ── Open Spotify link ── */}
      {hasUrl && (
        <a
          href={data.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-2.5 flex items-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .65 }}
        >
          <SpotifyLogo size={10} color={c.primary} />
          <span style={{ fontSize: 10, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Mở trên Spotify
          </span>
        </a>
      )}

      <div aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div ref={holderRef} style={{ width: 300, height: 80 }} />
      </div>

      {data.description && (
        <div className="relative z-10 mx-5 mt-4 mb-4 rounded-2xl px-5 pt-5 pb-4"
          style={{ background:`${c.primary}0e`, border:`1px solid ${c.primary}2a`, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
          <span className="pointer-events-none absolute -top-[14px] left-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❝</span>
          <p className="text-center text-[11px] italic leading-[1.9]"
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
