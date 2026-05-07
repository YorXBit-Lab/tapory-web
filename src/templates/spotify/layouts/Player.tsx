'use client';
import { useState, useEffect, useRef } from 'react';
import type { LayoutProps } from '@/templates/types';

function fmt(s: number) { return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
const DURATION = 214;

export function SpotPlayer({ data, c }: LayoutProps) {
  const [progress, setProgress] = useState(22);
  const [playing,  setPlaying]  = useState(false);
  const tick = useRef<ReturnType<typeof setInterval>|null>(null);
  const hasUrl = !!data.spotifyUrl;

  useEffect(() => {
    if (playing) {
      tick.current = setInterval(() => setProgress(p => p >= 100 ? (setPlaying(false), 0) : p + 100/DURATION/10), 100);
    } else { if (tick.current) clearInterval(tick.current); }
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [playing]);

  const cur = Math.round(progress/100*DURATION);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      <style>{`
        @keyframes _plBreathe { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.06)} }
        @keyframes _plPing    { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.85;transform:scale(1.16)} }
        @keyframes _plSlide   { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
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
          {playing && <div className="absolute inset-0 rounded-full" style={{ backgroundColor: c.primary, animation: '_plPing 1s ease-in-out infinite' }} />}
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

      {/* Progress bar */}
      <div className="relative z-10 mt-4 px-5">
        <div className="mb-1.5 flex justify-between">
          <span className="text-[6px]" style={{ color: c.secondary, opacity: .35 }}>{fmt(cur)}</span>
          <span className="text-[6px]" style={{ color: c.secondary, opacity: .2 }}>{fmt(DURATION)}</span>
        </div>
        <div className="relative h-[3px] w-full rounded-full" style={{ backgroundColor: `${c.secondary}12` }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: `linear-gradient(to right, ${c.primary}bb, ${c.primary})` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-5 flex items-center justify-center gap-6">
        <button type="button" onClick={() => setProgress(p => Math.max(0,p-8))}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:c.secondary, opacity:.45 }}>⏮</button>

        {/* Play / Open Spotify */}
        <a href={hasUrl ? data.spotifyUrl : undefined} target="_blank" rel="noopener noreferrer"
          onClick={() => setPlaying(p => !p)}
          style={{ textDecoration: 'none' }}>
          <div className="relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: hasUrl ? `linear-gradient(148deg, ${c.primary}f0, ${c.primary}bb)` : 'rgba(255,255,255,0.08)',
              boxShadow: playing ? `0 0 0 8px ${c.primary}1c, 0 0 0 16px ${c.primary}0a, 0 8px 32px ${c.primary}55` : `0 4px 18px ${c.primary}44`,
              transition: 'box-shadow .35s ease',
            }}>
            <span style={{ fontSize: 22, color: '#fff', marginLeft: playing ? 0 : 3 }}>
              {playing ? '⏸' : '▶'}
            </span>
          </div>
        </a>

        <button type="button" onClick={() => setProgress(p => Math.min(100,p+8))}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:c.secondary, opacity:.45 }}>⏭</button>
      </div>

      {data.description && (
        <p className="relative z-10 mt-4 px-6 text-center text-[7.5px] italic leading-[1.85]"
          style={{ color: c.secondary, opacity: .3 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
