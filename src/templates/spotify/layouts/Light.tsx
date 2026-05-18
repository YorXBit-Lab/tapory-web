'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

export function SpotLight({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, isBlocked, error, toggle } = useSpotifyPlayer(uri);

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

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mx-auto mt-4 flex items-center gap-2.5 rounded-full px-8 py-3.5"
        style={{
          background: hasUrl ? (playing ? `${c.primary}22` : c.primary) : `${c.primary}18`,
          boxShadow: hasUrl && !playing ? `0 6px 24px ${c.primary}40, 0 0 0 3px ${c.primary}18` : 'none',
          border: playing ? `1.5px solid ${c.primary}88` : 'none',
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize: 14, color: playing ? c.primary : (hasUrl ? '#fff' : `${c.primary}60`) }}>{playing ? '⏸' : '▶'}</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
          color: playing ? c.primary : (hasUrl ? '#fff' : `${c.primary}60`) }}>
          {!hasUrl ? 'Chưa có link' : isBlocked ? 'Chạm lại để phát 🎵' : playing ? 'Dừng lại' : 'Phát nhạc'}
        </span>
      </button>
      {hasUrl && (
        <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer"
          className="relative z-10 mt-2 flex items-center justify-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .55 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={c.primary}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/></svg>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase' }}>Mở trên Spotify</span>
        </a>
      )}
      <div ref={holderRef} aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

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
