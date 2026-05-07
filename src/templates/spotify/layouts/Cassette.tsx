'use client';
import type { LayoutProps } from '@/templates/types';

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

export function SpotCassette({ data, c }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

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

      <p className="relative z-10 text-[5.5px] font-bold tracking-[0.58em] uppercase"
        style={{ color:c.primary, opacity:.65 }}>◀ Side A ▶</p>

      {/* Album art polaroid */}
      {data.imageUrl && (
        <div className="relative z-10 mt-3 flex-shrink-0"
          style={{ padding:'4px 4px 16px 4px', background:'rgba(255,255,255,0.88)', borderRadius:3,
            boxShadow:'0 4px 16px rgba(0,0,0,0.18)', transform:'rotate(-2deg)' }}>
          <div className="overflow-hidden rounded-[2px]" style={{ width:70, height:70 }}>
            <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
          </div>
          <div className="mt-1 text-center text-[5px] font-bold tracking-widest uppercase"
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
            <span style={{ fontSize:7, color:'rgba(255,255,255,0.9)', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:700 }}>
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
      <p className="relative z-10 mt-1 text-center text-[8px] font-bold tracking-[0.22em] uppercase"
        style={{ color:c.primary, opacity:.8 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mt-3 flex items-center gap-1">
        {Array.from({length:18}).map((_,i) => (
          <div key={i} style={{ width:3, height:3, borderRadius:'50%', backgroundColor:c.primary, opacity:i%2===0?.35:.15 }} />
        ))}
      </div>

      {/* Play button */}
      <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
        className="relative z-10 mt-4" style={{ textDecoration:'none', pointerEvents: hasUrl ? 'auto' : 'none' }}>
        <div className="flex items-center gap-2.5 rounded-lg px-7 py-3"
          style={{ background: hasUrl ? `linear-gradient(135deg,${c.primary}e8,${c.primary}bb)` : `${c.primary}18`,
            boxShadow: hasUrl ? `0 4px 18px ${c.primary}44` : 'none',
            border:`1px solid ${hasUrl ? c.primary+'66' : c.primary+'22'}` }}>
          <span style={{ fontSize:13, color: hasUrl ? 'white' : c.primary+'55' }}>▶</span>
          <span style={{ fontSize:8.5, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase',
            color: hasUrl ? 'white' : c.primary+'55' }}>
            {hasUrl ? 'Phát nhạc' : 'Chưa có link'}
          </span>
        </div>
      </a>

      {data.description && (
        <p className="relative z-10 mt-3.5 px-7 text-center text-[7.5px] italic leading-[1.88]"
          style={{ color:c.secondary, opacity:.5 }}>"{data.description}"</p>
      )}
    </div>
  );
}
