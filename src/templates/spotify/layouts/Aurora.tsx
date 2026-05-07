'use client';
import type { LayoutProps } from '@/templates/types';

const SPARKLES = [
  {top:'8%', left:'12%', size:8,  delay:'0s',   dur:'3.2s'},
  {top:'14%',left:'82%', size:6,  delay:'0.8s', dur:'2.8s'},
  {top:'28%',left:'88%', size:10, delay:'1.4s', dur:'3.6s'},
  {top:'5%', left:'52%', size:5,  delay:'0.3s', dur:'2.4s'},
  {top:'22%',left:'5%',  size:7,  delay:'1.8s', dur:'4s'},
  {top:'38%',left:'93%', size:4,  delay:'0.6s', dur:'3s'},
  {top:'42%',left:'2%',  size:6,  delay:'2.1s', dur:'2.6s'},
  {top:'18%',left:'62%', size:4,  delay:'1.1s', dur:'3.4s'},
];

export function SpotAurora({ data, c }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _aurora      { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes _sparkle     { 0%,100%{opacity:0;transform:scale(.4) rotate(0deg)} 40%,60%{opacity:1;transform:scale(1) rotate(180deg)} }
        @keyframes _auroraFloat { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-8px) scaleX(1.04)} }
        @keyframes _albumGlow   { 0%,100%{box-shadow:0 8px 48px ${c.primary}55,0 0 0 1px ${c.primary}22} 50%{box-shadow:0 8px 64px ${c.primary}88,0 0 0 1px ${c.primary}55} }
        @keyframes _glassBtn    { 0%,100%{box-shadow:0 4px 20px ${c.primary}44} 50%{box-shadow:0 4px 32px ${c.primary}88,0 0 0 4px ${c.primary}22} }
      `}</style>

      {/* Aurora curtains */}
      <div className="pointer-events-none absolute -top-10 left-0 right-0"
        style={{ height:220, background:`linear-gradient(180deg,${c.primary}2a 0%,#6366f122 18%,${c.primary}18 32%,#8b5cf622 48%,transparent 100%)`,
          backgroundSize:'300% 300%', animation:'_aurora 8s ease infinite', filter:'blur(12px)' }} />
      <div className="pointer-events-none absolute -top-4 left-0 right-0"
        style={{ height:160, background:`linear-gradient(180deg,#4ade8022 0%,${c.primary}1a 25%,transparent 100%)`,
          filter:'blur(8px)', animation:'_auroraFloat 6s ease-in-out infinite' }} />

      {SPARKLES.map((s,i) => (
        <div key={i} className="pointer-events-none absolute select-none"
          style={{ top:s.top, left:s.left, fontSize:s.size, color:c.primary,
            animation:`_sparkle ${s.dur} ease-in-out infinite`, animationDelay:s.delay }}>✦</div>
      ))}

      <div className="pointer-events-none absolute inset-0"
        style={{ background:'radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.62) 100%)' }} />

      <div className="flex-shrink-0" style={{ height:50 }} />

      <div className="relative z-10 flex items-center justify-center gap-2">
        <span style={{ fontSize:6, color:c.primary, opacity:.6 }}>✦</span>
        <p className="text-[5.5px] font-bold tracking-[0.55em] uppercase" style={{ color:c.primary, opacity:.75 }}>Aurora</p>
        <span style={{ fontSize:6, color:c.primary, opacity:.6 }}>✦</span>
      </div>

      {/* Album art */}
      <div className="relative z-10 mx-auto mt-5 flex-shrink-0" style={{ width:130, height:130 }}>
        <div className="absolute -inset-5 rounded-full"
          style={{ background:`conic-gradient(from 0deg,${c.primary}3a,#6366f12e,${c.primary}22,#8b5cf62e,${c.primary}3a)`,
            filter:'blur(14px)', animation:'_aurora 6s linear infinite' }} />
        <div className="relative h-full w-full overflow-hidden rounded-[26px]"
          style={{ border:`1.5px solid ${c.primary}44`, animation:'_albumGlow 4s ease-in-out infinite' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:`linear-gradient(135deg,${c.primary}22 0%,rgba(99,102,241,0.15) 40%,${c.primary}12 100%)` }}>
                <span className="text-[50px]" style={{ filter:`drop-shadow(0 0 18px ${c.primary})` }}>🎵</span>
              </div>}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
            style={{ background:'linear-gradient(to bottom,rgba(255,255,255,0.1),transparent)' }} />
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-5 px-5 text-center text-[20px] font-bold leading-tight"
        style={{ fontFamily:'Georgia, serif', color:c.secondary, letterSpacing:'-.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[8px] font-semibold tracking-[0.22em] uppercase"
        style={{ color:c.primary, opacity:.82 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mx-auto mt-3.5"
        style={{ width:'64%', height:1.5, background:`linear-gradient(to right,transparent,${c.primary}99,rgba(139,92,246,.55),${c.primary}77,transparent)`, boxShadow:`0 0 12px ${c.primary}44` }} />

      {/* Play button — glassmorphism */}
      <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
        className="relative z-10 mx-auto mt-5" style={{ textDecoration:'none', pointerEvents: hasUrl ? 'auto' : 'none' }}>
        <div className="flex items-center gap-2.5 rounded-full px-7 py-3.5"
          style={{
            background: hasUrl ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
            backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            border:`1.5px solid ${hasUrl ? c.primary+'66' : c.primary+'22'}`,
            animation: hasUrl ? '_glassBtn 2.5s ease-in-out infinite' : undefined,
          }}>
          <span style={{ fontSize:13, color: hasUrl ? c.primary : c.primary+'44', filter: hasUrl ? `drop-shadow(0 0 8px ${c.primary})` : undefined }}>▶</span>
          <span style={{ fontSize:8.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase',
            color: hasUrl ? c.secondary : c.secondary+'44' }}>
            {hasUrl ? 'Phát nhạc' : 'Chưa có link'}
          </span>
        </div>
      </a>

      {data.description && (
        <div className="relative z-10 mx-5 mt-3.5 rounded-2xl px-4 py-2.5"
          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${c.primary}1a`, backdropFilter:'blur(12px)' }}>
          <p className="text-center text-[7.5px] italic leading-[1.85]" style={{ color:c.secondary, opacity:.38 }}>
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}
