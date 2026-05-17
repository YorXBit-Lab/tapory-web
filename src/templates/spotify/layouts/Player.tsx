'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyEmbed } from '@/hooks/useSpotifyEmbed';

const SpotifyLogo = ({ size = 10, color = '#1db954' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/>
  </svg>
);

export function SpotPlayer({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, error, toggle } = useSpotifyEmbed(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _plBreathe { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.06)} }
        @keyframes _plPing    { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.85;transform:scale(1.16)} }
        @keyframes _plSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="pointer-events-none absolute -top-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}2c 0%, transparent 65%)`, filter: 'blur(50px)',
          animation: playing ? '_plBreathe 2.8s ease-in-out infinite' : undefined }} />
      <div className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}18 0%, transparent 65%)`, filter: 'blur(36px)' }} />

      <div className="flex-shrink-0" style={{ height: 50 }} />

      {/* Now playing badge */}
      <div className="relative z-10 mx-5 flex items-center gap-2">
        <div className="relative h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: c.primary }}>
          {playing && <div className="absolute inset-0 rounded-full"
            style={{ backgroundColor: c.primary, animation: '_plPing 1s ease-in-out infinite' }} />}
        </div>
        <p className="text-[5.5px] font-bold tracking-[0.55em] uppercase"
          style={{ color: playing ? c.primary : `${c.secondary}40` }}>
          {playing ? 'Now Playing' : 'Spotify'}
        </p>
      </div>

      {/* Album art */}
      <div className="relative z-10 mx-auto mt-4 flex-shrink-0" style={{ width: 128, height: 128 }}>
        <div className="absolute -inset-3 rounded-[26px] opacity-60 transition-opacity duration-700"
          style={{ background: `radial-gradient(circle, ${c.primary}30 0%, transparent 70%)`, filter: 'blur(14px)', opacity: playing ? .8 : .3 }} />
        <div className="relative h-full w-full overflow-hidden rounded-[22px]"
          style={{
            boxShadow: playing
              ? `0 0 0 1px rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.8), 0 0 60px ${c.primary}44`
              : `0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px rgba(0,0,0,0.65)`,
            transform: playing ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform .5s cubic-bezier(.34,1.56,.64,1), box-shadow .5s ease',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background: `radial-gradient(ellipse at 32% 28%, ${c.primary}55 0%, ${c.primary}22 45%, rgba(255,255,255,0.04) 100%)` }}>
                <span className="text-[48px]" style={{ filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.55))` }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.09), transparent)' }} />
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-4 px-5 text-center text-[20px] font-bold leading-tight"
        style={{ color: c.secondary, letterSpacing: '-.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-0.5 text-center text-[8px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: c.primary, opacity: .82 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Visual progress bar (decorative) */}
      <div className="relative z-10 mt-4 px-5">
        <div className="relative h-[3px] w-full rounded-full" style={{ backgroundColor: `${c.secondary}12` }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            style={{
              width: playing ? '45%' : '22%',
              background: `linear-gradient(to right, ${c.primary}bb, ${c.primary})`,
              transition: 'width 1s linear',
            }} />
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-5 flex items-center justify-center gap-5">
        <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:c.secondary, opacity:.4 }}>⏮</button>

        {/* ── Play / Pause button ── */}
        <button
          type="button"
          disabled={!hasUrl || !isReady || isLoading || !!error}
          onClick={toggle}
          className="relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full transition-all"
          style={{
            background: hasUrl
              ? playing
                ? `rgba(255,255,255,0.15)`
                : `linear-gradient(148deg, ${c.primary}f0, ${c.primary}bb)`
              : 'rgba(255,255,255,0.08)',
            boxShadow: playing
              ? `0 0 0 8px ${c.primary}1c, 0 0 0 16px ${c.primary}0a, 0 8px 32px rgba(0,0,0,0.4)`
              : hasUrl
              ? `0 4px 18px ${c.primary}44`
              : 'none',
            border: playing ? `1px solid rgba(255,255,255,0.25)` : 'none',
            cursor: hasUrl ? 'pointer' : 'default',
            transition: 'box-shadow .35s ease, background .25s ease',
          }}
        >
          <span style={{ fontSize: 22, color: '#fff', marginLeft: (!playing && hasUrl) ? 3 : 0 }}>
            {playing ? '⏸' : '▶'}
          </span>
        </button>

        <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:c.secondary, opacity:.4 }}>⏭</button>
      </div>

      {/* ── Open Spotify link ── */}
      {hasUrl && (
        <a
          href={data.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-3 flex items-center justify-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .55 }}
        >
          <SpotifyLogo size={10} color={c.primary} />
          <span style={{ fontSize: 7.5, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Mở trên Spotify
          </span>
        </a>
      )}

      {hasUrl && <div ref={holderRef} aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, pointerEvents: 'none', visibility: 'hidden' }} />}

      {data.description && (
        <div className="relative z-10 mx-5 mt-4 mb-4 rounded-2xl px-5 pt-5 pb-4"
          style={{ background:`${c.primary}0e`, border:`1px solid ${c.primary}2a`, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
          <span className="pointer-events-none absolute -top-[14px] left-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❝</span>
          <p className="text-center text-[9px] italic leading-[1.9]"
            style={{ color:c.secondary, opacity:.8 }}>
            {data.description}
          </p>
          <span className="pointer-events-none absolute -bottom-[14px] right-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❞</span>
        </div>
      )}
    </div>
  );
}
