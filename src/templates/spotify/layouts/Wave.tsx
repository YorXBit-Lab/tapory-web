'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyEmbed } from '@/hooks/useSpotifyEmbed';

const BARS: [number,number,number,number][] = [
  [4,14,500,0],[6,22,420,80],[3,28,560,40],[8,18,380,120],
  [5,32,610,20],[4,20,450,100],[7,26,490,60],[5,16,530,140],
  [3,30,400,30],[8,24,570,90],[4,18,430,70],[6,28,510,110],
  [5,22,460,50],[3,16,540,130],[7,30,390,10],[4,26,620,85],
  [6,20,475,45],[3,28,555,105],[8,18,415,25],[5,24,485,145],
  [4,32,535,65],[6,16,600,35],[3,22,445,95],[7,28,520,55],
];

export function SpotWave({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, error, toggle } = useSpotifyEmbed(uri, autoPlay);

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

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mx-auto mt-4 flex items-center gap-2.5 rounded-full px-8 py-3.5"
        style={{
          background: hasUrl ? (playing ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg,${c.primary},${c.secondary}cc)`) : 'rgba(255,255,255,0.06)',
          animation: hasUrl && !playing ? '_waveBtn 2s ease-in-out infinite' : undefined,
          border: playing ? '1px solid rgba(255,255,255,0.25)' : 'none',
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize:14, color: playing ? 'rgba(255,255,255,0.9)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>
          {playing ? '⏸' : '▶'}
        </span>
        <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase',
          color: playing ? 'rgba(255,255,255,0.85)' : (hasUrl ? '#000' : 'rgba(255,255,255,0.2)') }}>
          {!hasUrl ? 'Chưa có link' : playing ? 'Dừng lại' : 'Phát nhạc'}
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
