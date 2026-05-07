'use client';
import type { LayoutProps } from '@/templates/types';

const BARS: [number,number,number,number][] = [
  [4,14,500,0],[6,22,420,80],[3,28,560,40],[8,18,380,120],
  [5,32,610,20],[4,20,450,100],[7,26,490,60],[5,16,530,140],
  [3,30,400,30],[8,24,570,90],[4,18,430,70],[6,28,510,110],
  [5,22,460,50],[3,16,540,130],[7,30,390,10],[4,26,620,85],
  [6,20,475,45],[3,28,555,105],[8,18,415,25],[5,24,485,145],
  [4,32,535,65],[6,16,600,35],[3,22,445,95],[7,28,520,55],
];

export function SpotWave({ data, c }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

  const keyframes = BARS.map((_,i) => `
    @keyframes _bar${i}{0%,100%{height:${BARS[i][0]}px}50%{height:${BARS[i][1]}px}}
  `).join('');

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        ${keyframes}
        @keyframes _pulse1 { 0%,100%{transform:scale(1);opacity:.22} 50%{transform:scale(1.28);opacity:0} }
        @keyframes _pulse2 { 0%,100%{transform:scale(1);opacity:.14} 50%{transform:scale(1.5);opacity:0} }
        @keyframes _waveBg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes _waveBtn{ 0%,100%{box-shadow:0 4px 20px ${c.primary}55} 50%{box-shadow:0 4px 32px ${c.primary}99,0 0 0 6px ${c.primary}22} }
      `}</style>

      <div className="pointer-events-none absolute inset-0"
        style={{ background:`linear-gradient(135deg,${c.primary}1a 0%,${c.accent} 45%,${c.secondary}18 100%)`,
          backgroundSize:'300% 300%', animation:'_waveBg 10s ease infinite' }} />
      <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rotate-45 opacity-[0.04]"
        style={{ background:`linear-gradient(135deg,${c.primary},transparent)` }} />

      <div className="flex-shrink-0" style={{ height:46 }} />

      {/* Top waveform */}
      <div className="relative z-10 flex items-end justify-center gap-[2.5px] px-3" style={{ height:36 }}>
        {BARS.slice(0,12).map((b,i) => (
          <div key={i} style={{ width:`calc((100% - ${11*2.5}px)/12)`, height:b[0], borderRadius:3,
            background:`linear-gradient(to top,${c.primary},${c.secondary}66)`, opacity:.55,
            animation:`_bar${i} ${b[2]}ms ease-in-out infinite`, animationDelay:`${b[3]}ms` }} />
        ))}
      </div>

      {/* Album art with pulse rings */}
      <div className="relative z-10 mx-auto mt-3 flex-shrink-0" style={{ width:136, height:136 }}>
        <div className="absolute inset-0 rounded-full"
          style={{ border:`2px solid ${c.primary}`, animation:'_pulse1 2.4s ease-out infinite' }} />
        <div className="absolute inset-0 rounded-full"
          style={{ border:`2px solid ${c.primary}`, animation:'_pulse2 2.4s ease-out infinite .6s' }} />
        <div className="relative h-full w-full overflow-hidden rounded-full"
          style={{ padding:3, background:`conic-gradient(from 0deg,${c.primary},${c.secondary}88,${c.primary}66,${c.secondary}44,${c.primary})`,
            boxShadow:`0 12px 48px rgba(0,0,0,0.55)` }}>
          <div className="h-full w-full overflow-hidden rounded-full">
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" />
              : <div className="flex h-full w-full items-center justify-center"
                  style={{ background:`radial-gradient(circle at 38% 32%,${c.primary}28 0%,${c.accent} 65%)` }}>
                  <span className="text-[52px]" style={{ filter:`drop-shadow(0 0 16px ${c.primary}aa)` }}>🎵</span>
                </div>}
          </div>
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-4 px-5 text-center text-[20px] font-black leading-tight"
        style={{ color:c.secondary, letterSpacing:'-.02em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-0.5 text-center text-[8px] font-semibold tracking-[0.25em] uppercase"
        style={{ color:c.primary, opacity:.85 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Bottom waveform */}
      <div className="relative z-10 mt-3 flex items-center justify-center gap-[2.5px] px-3" style={{ height:36 }}>
        {BARS.slice(12).map((b,i) => (
          <div key={i} style={{ width:`calc((100% - ${11*2.5}px)/12)`, height:b[0], borderRadius:3,
            background:`linear-gradient(to bottom,${c.primary},${c.secondary}55)`, opacity:.55,
            animation:`_bar${i+12} ${b[2]}ms ease-in-out infinite`, animationDelay:`${b[3]}ms` }} />
        ))}
      </div>

      <div className="relative z-10 mx-6 mt-1"
        style={{ height:1.5, background:`linear-gradient(to right,transparent,${c.primary}88,${c.secondary}66,transparent)` }} />

      {/* Play button */}
      <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
        className="relative z-10 mx-auto mt-4" style={{ textDecoration:'none', pointerEvents: hasUrl ? 'auto' : 'none' }}>
        <div className="flex items-center gap-2.5 rounded-full px-8 py-3.5"
          style={{ background: hasUrl ? `linear-gradient(135deg,${c.primary},${c.secondary}cc)` : 'rgba(255,255,255,0.06)',
            animation: hasUrl ? '_waveBtn 2s ease-in-out infinite' : undefined }}>
          <span style={{ fontSize:14, color: hasUrl ? '#000' : 'rgba(255,255,255,0.2)' }}>▶</span>
          <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase',
            color: hasUrl ? '#000' : 'rgba(255,255,255,0.2)' }}>
            {hasUrl ? 'Phát nhạc' : 'Chưa có link'}
          </span>
        </div>
      </a>

      {data.description && (
        <p className="relative z-10 mt-3 px-6 text-center text-[7.5px] italic leading-[1.85]"
          style={{ color:c.secondary, opacity:.42 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
