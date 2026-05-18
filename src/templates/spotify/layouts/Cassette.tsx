'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

const SPOKES = [0,60,120,180,240,300];

function Reel({ side, accent }: { side:'left'|'right'; accent:string }) {
  const pos = side === 'left' ? { left:10 } : { right:10 };
  return (
    <div style={{ position:'absolute', top:6, ...pos, width:40, height:40, borderRadius:'50%',
      background:`radial-gradient(circle at 38% 32%,${accent}f0,${accent}b0)`,
      border:'1.5px solid rgba(0,0,0,0.18)', boxShadow:'inset 0 0 8px rgba(0,0,0,0.18)',
      animation:`_reelSpin 2.6s linear infinite ${side==='right'?'reverse':''}` }}>
      {SPOKES.map((deg,i) => (
        <div key={i} style={{ position:'absolute', left:'50%', top:'50%', width:1.5, height:14,
          background:'rgba(0,0,0,0.22)', transformOrigin:'50% 0%',
          transform:`translateX(-50%) rotate(${deg}deg)` }} />
      ))}
      <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
        width:9, height:9, borderRadius:'50%', background:'rgba(0,0,0,0.3)' }} />
    </div>
  );
}

export function SpotCassette({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, isBlocked, error, toggle } = useSpotifyPlayer(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _reelSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes _tapePulse{ 0%,100%{opacity:.55} 50%{opacity:.85} }
      `}</style>

      {/* Grain */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, backgroundSize:'200px 200px' }} />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background:`radial-gradient(circle,${c.primary}18 0%,transparent 65%)`, filter:'blur(48px)' }} />

      <div className="flex-shrink-0" style={{ height:44 }} />

      <p className="relative z-10 text-[7px] font-bold tracking-[0.58em] uppercase"
        style={{ color:c.primary, opacity:.65 }}>◀ Side A ▶</p>

      {/* Album art polaroid */}
      {data.imageUrl && (
        <div className="relative z-10 mt-3 flex-shrink-0"
          style={{ padding:'4px 4px 16px 4px', background:'rgba(255,255,255,0.88)', borderRadius:3,
            boxShadow:'0 4px 16px rgba(0,0,0,0.18)', transform:'rotate(-2deg)' }}>
          <div className="overflow-hidden rounded-[2px]" style={{ width:70, height:70 }}>
            <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
          </div>
          <div className="mt-1 text-center text-[6px] font-bold tracking-widest uppercase"
            style={{ color:`${c.primary}99` }}>♪</div>
        </div>
      )}

      {/* Cassette */}
      <div className="relative z-10 mt-3 flex-shrink-0" style={{ animation:'_floatUp 4s ease-in-out infinite' }}>
        <div style={{ width:188, height:118, borderRadius:10,
          background:`linear-gradient(160deg,${c.secondary}f8 0%,${c.secondary}e2 100%)`,
          boxShadow:'0 12px 48px rgba(0,0,0,0.2),inset 0 2px 0 rgba(255,255,255,0.45),inset 0 -2px 0 rgba(0,0,0,0.08)',
          border:'1px solid rgba(0,0,0,0.12)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-54%)',
            width:140, height:58, borderRadius:6, background:'rgba(0,0,0,0.1)', border:'1px solid rgba(0,0,0,0.14)', overflow:'hidden' }}>
            <svg width="140" height="58" viewBox="0 0 140 58" fill="none" style={{ position:'absolute', inset:0, opacity:.22 }}>
              <path d="M18 44 Q70 20 122 44" stroke={c.accent} strokeWidth="2" fill="none" />
            </svg>
            <Reel side="left" accent={c.accent} />
            <Reel side="right" accent={c.accent} />
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28,
            background:`linear-gradient(to right,${c.primary}e0,${c.primary}bb)`,
            borderTop:'1px solid rgba(0,0,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.9)', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:700 }}>
              ▶ PLAYING
            </span>
          </div>
          {[12,168].map((x,i) => (
            <div key={i} style={{ position:'absolute', left:x, top:9, width:9, height:9, borderRadius:'50%',
              background:'rgba(0,0,0,0.14)', border:'1px solid rgba(0,0,0,0.1)' }} />
          ))}
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-6 text-center text-[19px] font-bold leading-tight"
        style={{ fontFamily:'Georgia, serif', color:c.secondary, letterSpacing:'-.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[10px] font-bold tracking-[0.22em] uppercase"
        style={{ color:c.primary, opacity:.8 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mt-3 flex items-center gap-1">
        {Array.from({length:18}).map((_,i) => (
          <div key={i} style={{ width:3, height:3, borderRadius:'50%', backgroundColor:c.primary, opacity:i%2===0?.35:.15 }} />
        ))}
      </div>

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mt-4 flex items-center gap-2.5 rounded-lg px-7 py-3"
        style={{
          background: hasUrl ? (playing ? `${c.primary}22` : `linear-gradient(135deg,${c.primary}e8,${c.primary}bb)`) : `${c.primary}18`,
          boxShadow: hasUrl && !playing ? `0 4px 18px ${c.primary}44` : 'none',
          border:`1px solid ${hasUrl ? c.primary+'66' : c.primary+'22'}`,
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize:13, color: playing ? c.primary : (hasUrl ? 'white' : c.primary+'55') }}>{playing ? '⏸' : '▶'}</span>
        <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase',
          color: playing ? c.primary : (hasUrl ? 'white' : c.primary+'55') }}>
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
