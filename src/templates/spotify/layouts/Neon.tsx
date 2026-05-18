'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

const EQ_ANIMS = [
  [10,24],[18,8],[8,28],[22,10],[14,26],[6,20],
  [24,12],[10,22],[18,6],[8,26],[20,10],[12,24],
  [6,18],[22,8],[14,28],[8,16],
];

export function SpotNeon({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, isBlocked, error, toggle } = useSpotifyPlayer(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _neonRing  { 0%,100%{box-shadow:0 0 8px ${c.primary},0 0 24px ${c.primary}66;opacity:.75} 50%{box-shadow:0 0 16px ${c.primary},0 0 48px ${c.primary};opacity:1} }
        @keyframes _neonBg    { 0%,100%{opacity:.08} 50%{opacity:.2} }
        @keyframes _scan      { 0%{top:-2px} 100%{top:100%} }
        @keyframes _eq0 { 0%,100%{height:10px} 50%{height:24px} }
        @keyframes _eq1 { 0%,100%{height:18px} 50%{height:8px}  }
        @keyframes _eq2 { 0%,100%{height:8px}  50%{height:28px} }
        @keyframes _eq3 { 0%,100%{height:22px} 50%{height:10px} }
        @keyframes _eq4 { 0%,100%{height:14px} 50%{height:26px} }
        @keyframes _eq5 { 0%,100%{height:6px}  50%{height:20px} }
        @keyframes _neonBtn   { 0%,100%{box-shadow:0 0 12px ${c.primary}88,0 0 24px ${c.primary}44} 50%{box-shadow:0 0 20px ${c.primary},0 0 40px ${c.primary}88} }
      `}</style>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `linear-gradient(${c.primary}09 1px,transparent 1px),linear-gradient(90deg,${c.primary}09 1px,transparent 1px)`, backgroundSize:'28px 28px' }} />
      {/* Scanline */}
      <div className="pointer-events-none absolute left-0 right-0" style={{ height:2, animation:'_scan 5s linear infinite' }}>
        <div className="h-full" style={{ background:`linear-gradient(to right,transparent,${c.secondary}44,transparent)` }} />
      </div>
      <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background:`radial-gradient(circle,${c.primary}2e 0%,transparent 65%)`, filter:'blur(44px)', animation:'_neonBg 3s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full"
        style={{ background:`radial-gradient(circle,${c.secondary}1a 0%,transparent 65%)`, filter:'blur(36px)' }} />

      <div className="flex-shrink-0" style={{ height:50 }} />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-0 px-5">
        <div className="h-px flex-1" style={{ background:`linear-gradient(to right,transparent,${c.primary}55)` }} />
        <p className="mx-3 text-[7px] font-bold tracking-[0.62em] uppercase"
          style={{ color:c.primary, textShadow:`0 0 12px ${c.primary}` }}>Now Playing</p>
        <div className="h-px flex-1" style={{ background:`linear-gradient(to left,transparent,${c.primary}55)` }} />
      </div>

      {/* Album art */}
      <div className="relative z-10 mx-auto mt-5 flex-shrink-0" style={{ width:128, height:128 }}>
        <div className="absolute -inset-[5px] rounded-[24px]"
          style={{ border:`2px solid ${c.primary}`, animation:'_neonRing 2.2s ease-in-out infinite' }} />
        <div className="absolute -inset-[14px] rounded-[32px]"
          style={{ border:`1px solid ${c.secondary}22`, animation:'_neonRing 2.2s ease-in-out infinite .9s' }} />
        <div className="relative h-full w-full overflow-hidden rounded-[18px]"
          style={{ border:`1.5px solid ${c.primary}55`, boxShadow:`inset 0 0 28px ${c.primary}18,0 8px 36px rgba(0,0,0,0.85)` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:`linear-gradient(135deg,${c.accent} 0%,${c.primary}1a 100%)` }}>
                <span className="text-[50px]" style={{ filter:`drop-shadow(0 0 14px ${c.primary})` }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-0 rounded-[18px]"
            style={{ boxShadow:`inset 0 0 0 1.5px ${c.primary}55, inset 0 0 28px ${c.primary}14` }} />
          <span className="pointer-events-none absolute left-2 top-2 text-[10px]" style={{ color:c.secondary, opacity:.55 }}>◈</span>
          <span className="pointer-events-none absolute bottom-2 right-2 text-[10px]" style={{ color:c.primary, opacity:.55 }}>◈</span>
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-5 text-center text-[18px] font-bold leading-tight"
        style={{ color:c.secondary, letterSpacing:'.02em', textShadow:`0 0 20px ${c.secondary}55`, fontFamily:'monospace' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[9px] font-bold tracking-[0.36em] uppercase"
        style={{ color:c.primary, textShadow:`0 0 10px ${c.primary}` }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Equalizer */}
      <div className="relative z-10 mt-4 flex items-end justify-center gap-[3px]" style={{ height:30 }}>
        {EQ_ANIMS.map((_,i) => (
          <div key={i} style={{ width:4, height:8, borderRadius:2,
            background:`linear-gradient(to top,${c.primary},${c.secondary}aa)`,
            boxShadow:`0 0 6px ${c.primary}88`,
            animation:`_eq${i%6} ${.55+(i%4)*.12}s ease-in-out infinite`,
            animationDelay:`${(i*.07).toFixed(2)}s` }} />
        ))}
      </div>

      {/* Rule */}
      <div className="relative z-10 mx-8 mt-3"
        style={{ height:1, background:`linear-gradient(to right,transparent,${c.primary}88,${c.secondary}66,transparent)`, boxShadow:`0 0 8px ${c.primary}55` }} />

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mx-auto mt-4 flex items-center gap-2.5 rounded px-7 py-3"
        style={{
          border:`1.5px solid ${hasUrl ? c.primary : c.primary+'33'}`,
          background: hasUrl ? `${c.primary}18` : 'transparent',
          animation: hasUrl && !playing ? '_neonBtn 2s ease-in-out infinite' : undefined,
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize:13, color: hasUrl ? c.primary : c.primary+'44', textShadow: hasUrl ? `0 0 10px ${c.primary}` : undefined }}>
          {playing ? '⏸' : '▶'}
        </span>
        <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase', fontFamily:'monospace',
          color: hasUrl ? c.primary : c.primary+'44', textShadow: hasUrl ? `0 0 8px ${c.primary}` : undefined }}>
          {!hasUrl ? 'NO_LINK_SET' : isBlocked ? 'TOUCH_TO_PLAY' : playing ? 'STOP' : 'PLAY'}
        </span>
      </button>
      {hasUrl && (
        <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer"
          className="relative z-10 mt-2 flex items-center justify-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .55 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={c.primary}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/></svg>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: c.primary, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>OPEN_SPOTIFY</span>
        </a>
      )}
      <div aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div ref={holderRef} style={{ width: 300, height: 80 }} />
      </div>

      {data.description && (
        <div className="relative z-10 mx-5 mt-4 mb-4 rounded px-5 pt-5 pb-4"
          style={{ background:`${c.primary}0e`, border:`1px solid ${c.primary}33`, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', boxShadow:`0 0 12px ${c.primary}0a` }}>
          <span className="pointer-events-none absolute -top-[14px] left-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.55, fontFamily:'Georgia, serif', textShadow:`0 0 8px ${c.primary}` }}>❝</span>
          <p className="text-center text-[10.5px] italic leading-[1.9]"
            style={{ color:c.secondary, opacity:.8, fontFamily:'monospace' }}>
            {data.description}
          </p>
          <span className="pointer-events-none absolute -bottom-[14px] right-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.55, fontFamily:'Georgia, serif', textShadow:`0 0 8px ${c.primary}` }}>❞</span>
        </div>
      )}
    </div>
  );
}
