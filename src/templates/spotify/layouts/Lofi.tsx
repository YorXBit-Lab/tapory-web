'use client';
import type { LayoutProps } from '@/templates/types';
import { toSpotifyUri } from '../utils';
import { useSpotifyEmbed } from '@/hooks/useSpotifyEmbed';

const DUST = [
  {top:'6%', left:'9%', size:2,dur:'8s', del:'0s'},
  {top:'18%',left:'78%',size:3,dur:'11s',del:'2s'},
  {top:'32%',left:'92%',size:2,dur:'9s', del:'4.5s'},
  {top:'55%',left:'5%', size:2,dur:'12s',del:'1.5s'},
  {top:'72%',left:'85%',size:3,dur:'7s', del:'3s'},
  {top:'88%',left:'22%',size:2,dur:'10s',del:'0.8s'},
];

export function SpotLofi({ data, c, autoPlay }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;
  const uri = toSpotifyUri(data.spotifyUrl);
  const { holderRef, isPlaying: playing, isLoading, isReady, error, toggle } = useSpotifyEmbed(uri, autoPlay);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _drift    { 0%{transform:translateY(0) translateX(0);opacity:.6} 50%{transform:translateY(-14px) translateX(3px);opacity:.3} 100%{transform:translateY(-28px);opacity:0} }
        @keyframes _vinSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _lofiFloat{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes _rain     { 0%{transform:translateY(-10px);opacity:0} 10%,90%{opacity:.4} 100%{transform:translateY(120px);opacity:0} }
        @keyframes _lofiBtn  { 0%,100%{box-shadow:0 2px 12px ${c.primary}33} 50%{box-shadow:0 4px 20px ${c.primary}55} }
      `}</style>

      {/* Grain */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`, backgroundSize:'200px 200px' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background:'radial-gradient(ellipse at center,transparent 38%,rgba(100,60,20,0.18) 100%)' }} />

      {/* Dust motes */}
      {DUST.map((d,i) => (
        <div key={i} className="pointer-events-none absolute rounded-full"
          style={{ top:d.top, left:d.left, width:d.size, height:d.size, backgroundColor:c.primary, opacity:.6,
            animation:`_drift ${d.dur} ease-in-out infinite`, animationDelay:d.del }} />
      ))}
      {/* Rain streaks */}
      {[14,28,42,60,76,88].map((x,i) => (
        <div key={i} className="pointer-events-none absolute top-0"
          style={{ left:`${x}%`, width:1, height:18, background:`linear-gradient(to bottom,transparent,${c.primary}28,transparent)`,
            animation:`_rain ${2.2+i*.3}s linear infinite`, animationDelay:`${i*.55}s` }} />
      ))}

      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background:`radial-gradient(circle,${c.primary}16 0%,transparent 65%)`, filter:'blur(44px)' }} />

      <div className="flex-shrink-0" style={{ height:44 }} />

      <div className="relative z-10 flex items-center justify-center gap-2">
        <div className="h-px w-8" style={{ background:`linear-gradient(to right,transparent,${c.primary}55)` }} />
        <p className="text-[5.5px] font-bold tracking-[0.5em] uppercase" style={{ color:c.primary, opacity:.6 }}>lo-fi beats</p>
        <div className="h-px w-8" style={{ background:`linear-gradient(to left,transparent,${c.primary}55)` }} />
      </div>

      {/* Vinyl */}
      <div className="relative z-10 mx-auto mt-4 flex-shrink-0" style={{ animation:'_lofiFloat 5s ease-in-out infinite' }}>
        <div style={{ position:'relative', width:148, height:148 }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', boxShadow:`0 16px 48px rgba(0,0,0,0.22),0 0 0 1px rgba(0,0,0,0.06)` }} />
          <div style={{ width:'100%', height:'100%', borderRadius:'50%',
            background:'repeating-radial-gradient(circle at center,#2a2218 0px,#2a2218 1.5px,#1a1410 2px,#1a1410 7.5px)',
            animation:'_vinSpin 4.8s linear infinite' }}>
            {[22,42,62].map((r,i) => (
              <div key={i} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
                width:r*2, height:r*2, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.028)' }} />
            ))}
            <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
              width:64, height:64, borderRadius:'50%', overflow:'hidden',
              boxShadow:`0 0 14px ${c.primary}44, 0 0 0 2px ${c.primary}88` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} alt="" />
                : <div style={{ width:'100%', height:'100%', background:`radial-gradient(circle at 38% 32%,${c.primary}f0,${c.primary}cc)` }} />}
              <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
                width:8, height:8, borderRadius:'50%', background:'#150f0a' }} />
            </div>
            <div style={{ position:'absolute', left:'18%', top:'12%', width:28, height:52, borderRadius:'50%',
              background:'radial-gradient(ellipse,rgba(255,255,255,0.06),transparent)', transform:'rotate(-20deg)' }} />
          </div>
        </div>
      </div>

      {/* Track info */}
      <p className="relative z-10 mt-4 px-6 text-center text-[18px] font-bold leading-tight"
        style={{ fontFamily:'Georgia, serif', color:c.secondary, letterSpacing:'-.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>
      <p className="relative z-10 mt-1 text-center text-[8px] font-semibold tracking-[0.2em] uppercase"
        style={{ color:c.primary, opacity:.72 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      <div className="relative z-10 mx-auto mt-3 flex items-center gap-1.5">
        <div style={{ width:28, height:1.5, background:c.primary, opacity:.35, borderRadius:1 }} />
        <span style={{ fontSize:8, color:c.primary, opacity:.4 }}>♪</span>
        <div style={{ width:28, height:1.5, background:c.primary, opacity:.35, borderRadius:1 }} />
      </div>

      {/* ── Play / Pause ── */}
      <button type="button" disabled={!hasUrl || !isReady || isLoading || !!error} onClick={toggle}
        className="relative z-10 mx-auto mt-4 flex items-center gap-2.5 rounded-xl px-7 py-3"
        style={{
          background: hasUrl ? (playing ? `rgba(255,255,255,0.4)` : `rgba(255,255,255,0.65)`) : `rgba(255,255,255,0.3)`,
          backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
          border:`1px solid ${c.primary}${hasUrl?'44':'22'}`,
          animation: hasUrl && !playing ? '_lofiBtn 3s ease-in-out infinite' : undefined,
          cursor: hasUrl ? 'pointer' : 'default',
        }}>
        <span style={{ fontSize:13, color: hasUrl ? c.primary : c.primary+'55' }}>{playing ? '⏸' : '▶'}</span>
        <span style={{ fontSize:8.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
          color: hasUrl ? c.secondary : c.secondary+'55', fontFamily:'Georgia, serif' }}>
          {!hasUrl ? 'Chưa có link' : playing ? 'Dừng lại' : 'Phát nhạc'}
        </span>
      </button>
      {hasUrl && (
        <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer"
          className="relative z-10 mt-2 flex items-center justify-center gap-1.5"
          style={{ textDecoration: 'none', opacity: .5 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={c.primary}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.519-.973.78.78 0 01.972-.519c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/></svg>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: c.primary, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>Mở trên Spotify</span>
        </a>
      )}
      {hasUrl && <div ref={holderRef} aria-hidden style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, pointerEvents: 'none', visibility: 'hidden' }} />}

      {data.description && (
        <div className="relative z-10 mx-5 mt-4 rounded-2xl px-5 pt-5 pb-4"
          style={{ background:`${c.primary}0e`, border:`1px solid ${c.primary}2a`, backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}>
          <span className="pointer-events-none absolute -top-[14px] left-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❝</span>
          <p className="text-center text-[9px] italic leading-[1.9]"
            style={{ color:c.secondary, opacity:.78, fontFamily:'Georgia, serif' }}>
            {data.description}
          </p>
          <span className="pointer-events-none absolute -bottom-[14px] right-3 text-[32px] leading-none"
            style={{ color:c.primary, opacity:.5, fontFamily:'Georgia, serif' }}>❞</span>
        </div>
      )}

      <div className="relative z-10 mt-auto flex items-center justify-center gap-1 pb-4 pt-3">
        <span style={{ fontSize:11, opacity:.22 }}>🐱</span>
        <span style={{ fontSize:7, color:c.primary, opacity:.25 }}>♪</span>
        <span style={{ fontSize:11, opacity:.22 }}>☕</span>
      </div>
    </div>
  );
}
