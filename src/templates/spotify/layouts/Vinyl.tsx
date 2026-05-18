'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

export function SpotVinyl({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, isBlocked, error, toggle } = useSpotifyPlayer(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _vinSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _vinArm    { 0%,100%{transform:rotate(-22deg) translateX(4px)} 50%{transform:rotate(-16deg) translateX(0)} }
        @keyframes _vinPulse  { 0%,100%{opacity:.45;filter:blur(48px)} 50%{opacity:.75;filter:blur(44px)} }
      `}</style>

      {/* Deep glow */}
      <div className="pointer-events-none absolute top-[8%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}28 0%, transparent 62%)`,
          animation: '_vinPulse 4s ease-in-out infinite', filter: 'blur(48px)' }} />
      <div className="pointer-events-none absolute bottom-[15%] -left-16 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}16 0%, transparent 65%)`, filter: 'blur(38px)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.48) 100%)' }} />

      <div className="flex-shrink-0" style={{ height: 48 }} />

      {/* Label */}
      <p className="relative z-10 text-[7px] font-bold tracking-[0.55em] uppercase"
        style={{ color: c.primary, opacity: .6 }}>
        ♫ Now Spinning ♫
      </p>

      {/* Vinyl + tonearm group */}
      <div className="relative z-10 mt-4 flex-shrink-0" style={{ width: 168, height: 168 }}>

        {/* Outer ambient halo */}
        <div className="absolute -inset-8 rounded-full"
          style={{ background: `radial-gradient(circle, ${c.primary}1e 0%, transparent 68%)`, filter: 'blur(20px)' }} />

        {/* Record */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'repeating-radial-gradient(circle at center, #282828 0px, #282828 1.5px, #161616 2px, #161616 7.5px)',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 20px 72px rgba(0,0,0,0.88), 0 0 48px ${c.primary}1c`,
            animation: '_vinSpin 3.6s linear infinite',
          }}>
          {/* Groove rings */}
          {[24, 44, 64].map((r, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: r*2, height: r*2, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.028)',
            }} />
          ))}
          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
            style={{ boxShadow: `0 0 18px ${c.primary}66, 0 0 0 2px ${c.primary}88` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
              : <div className="h-full w-full" style={{ background: `radial-gradient(circle at 38% 32%, ${c.primary}ff, ${c.primary}cc)` }} />}
            {/* Spindle hole always on top */}
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: '#050505', boxShadow: 'inset 0 0 4px rgba(255,255,255,0.1)' }} />
          </div>
          {/* Sheen */}
          <div className="pointer-events-none absolute left-[18%] top-[12%] h-14 w-7 rounded-full opacity-[0.055]"
            style={{ background: 'radial-gradient(ellipse, white, transparent)', transform: 'rotate(-22deg)' }} />
        </div>

        {/* Tonearm */}
        <div className="absolute" style={{ right: -4, top: 2, width: 72, height: 72, transformOrigin: '90% 8%', animation: '_vinArm 5s ease-in-out infinite' }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <line x1="62" y1="6" x2="28" y2="62" stroke={`${c.primary}88`} strokeWidth="2" strokeLinecap="round" />
            <circle cx="62" cy="6" r="5" fill={c.primary} opacity=".7" />
            <circle cx="27" cy="63" r="3.5" fill={c.primary} opacity=".5" />
          </svg>
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-6 text-center text-[18px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[9.5px] font-semibold tracking-[0.28em] uppercase"
        style={{ color: c.primary, opacity: .8 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mt-3 w-[52%]"
        style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.primary}77, transparent)` }} />

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mt-4 flex items-center gap-2.5 rounded-full px-7 py-3"
        style={{
          background: hasUrl ? (playing ? 'rgba(255,255,255,0.12)' : `linear-gradient(135deg, ${c.primary}f0, ${c.primary}cc)`) : 'rgba(255,255,255,0.06)',
          boxShadow: hasUrl && !playing ? `0 6px 22px ${c.primary}55, 0 0 0 3px ${c.primary}22` : 'none',
          border: playing ? `1px solid rgba(255,255,255,0.25)` : 'none',
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize: 13, color: playing ? 'rgba(255,255,255,0.9)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>{playing ? '⏸' : '▶'}</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
          color: playing ? 'rgba(255,255,255,0.85)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>
          {!hasUrl ? 'Chưa có link' : isBlocked ? 'Chạm lại để phát 🎵' : playing ? 'Dừng lại' : 'Phát nhạc'}
        </span>
      </button>
      {hasUrl && (
        <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer"
          className="relative z-10 mt-2 flex items-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .55 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={c.primary}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/></svg>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase' }}>Mở trên Spotify</span>
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
