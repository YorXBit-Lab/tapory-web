'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { LayoutProps } from '@/templates/types';

function parseSpotifyEmbed(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator` : null;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${m}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

const DURATION = 214; // 3:34

export function SpotPlayerPremium({ data, c }: LayoutProps) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [progress,  setProgress]    = useState(0); // 0–100
  const [rippleKey, setRippleKey]   = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const embedUrl   = parseSpotifyEmbed(data.spotifyUrl);
  const currentSec = Math.round((progress / 100) * DURATION);

  /* ── progress ticker ── */
  useEffect(() => {
    if (isPlaying) {
      const step = 100 / DURATION / 10;
      tickRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 0; }
          return Math.min(100, p + step);
        });
      }, 100);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isPlaying]);

  /* ── controls ── */
  const toggle = useCallback(() => {
    if (!embedUrl) return;
    const next = !isPlaying;
    setIsPlaying(next);
    setRippleKey(k => k + 1);
    try {
      iframeRef.current?.contentWindow?.postMessage({ command: next ? 'play' : 'pause' }, '*');
    } catch { /* cross-origin — best effort */ }
  }, [isPlaying, embedUrl]);

  const skipBack = () => setProgress(p => Math.max(0, p - 7));
  const skipFwd  = () => setProgress(p => Math.min(100, p + 7));

  /* ── derived visual state ── */
  const albumShadow = isPlaying
    ? `0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.85), 0 0 80px ${c.primary}38`
    : `0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.7)`;
  const btnShadow = isPlaying
    ? `0 0 0 8px ${c.primary}1c, 0 0 0 16px ${c.primary}0a, 0 8px 36px ${c.primary}52`
    : `0 0 0 4px ${c.primary}12, 0 6px 22px rgba(0,0,0,0.55)`;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes _spotRipple {
          from { transform: scale(1); opacity: 0.55; }
          to   { transform: scale(2.6); opacity: 0; }
        }
        @keyframes _spotBreathe {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.88; }
        }
      `}</style>

      {/* ── BACKGROUND ── */}
      {/* Top center glow — breathes when playing */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${c.primary}2a 0%, transparent 65%)`,
          filter: 'blur(52px)',
          animation: isPlaying ? '_spotBreathe 3.4s ease-in-out infinite' : undefined,
        }} />
      {/* Bottom-left accent glow */}
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}16 0%, transparent 65%)`, filter: 'blur(38px)' }} />
      {/* Edge vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.56) 100%)' }} />
      {/* Diagonal micro-texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.005) 0px, rgba(255,255,255,0.005) 1px, transparent 1px, transparent 10px)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* ── NOW PLAYING BADGE ── */}
      <div className="relative z-10 mx-5 flex items-center gap-2">
        <div className="relative h-[7px] w-[7px] flex-shrink-0 rounded-full"
          style={{ backgroundColor: embedUrl ? c.primary : `${c.secondary}28` }}>
          {isPlaying && (
            <div className="absolute inset-0 rounded-full"
              style={{ backgroundColor: c.primary, animation: '_spotBreathe 1.1s ease-in-out infinite' }} />
          )}
        </div>
        <p className="text-[6px] font-bold tracking-[0.52em] uppercase"
          style={{ color: embedUrl ? c.primary : `${c.secondary}30` }}>
          {isPlaying ? 'Now Playing' : embedUrl ? 'Ready' : 'No Track'}
        </p>
      </div>

      {/* ── ALBUM CARD ── */}
      <div className="relative z-10 mx-auto mt-4 flex-shrink-0" style={{ width: 132, height: 132 }}>
        {/* Outer glow ring — fades in on play */}
        <div className="absolute -inset-3 rounded-[24px] transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, ${c.primary}2a 0%, transparent 70%)`,
            filter: 'blur(16px)',
            opacity: isPlaying ? 1 : 0,
          }} />

        {/* Card face */}
        <div className="relative h-full w-full overflow-hidden rounded-[20px]"
          style={{
            background: `
              radial-gradient(ellipse at 30% 22%, ${c.primary}48 0%, transparent 50%),
              radial-gradient(ellipse at 72% 80%, ${c.primary}1c 0%, transparent 46%),
              linear-gradient(148deg, #1d2b1e 0%, #0c130d 100%)
            `,
            boxShadow: albumShadow,
            transform: isPlaying ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s ease',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
          {/* Glass top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%]"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.09) 0%, transparent 100%)' }} />
          {/* Icon */}
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[44px]"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.55))' }}>🎵</span>
          </div>
          {/* Inner vignette */}
          <div className="pointer-events-none absolute inset-0 rounded-[20px]"
            style={{ boxShadow: 'inset 0 0 24px rgba(0,0,0,0.4)' }} />
        </div>
      </div>

      {/* ── TRACK INFO ── */}
      <div className="relative z-10 mt-4 px-5 text-center">
        <p className="truncate text-[20px] font-bold leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '-0.012em' }}>
          {data.title || 'Tên bài hát'}
        </p>
        <p className="mt-1 text-[8px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: c.primary, opacity: 0.82 }}>
          {data.subtitle || 'Nghệ sĩ'}
        </p>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="relative z-10 mt-4 px-5">
        {/* Timestamps */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[6.5px]"
            style={{ color: c.secondary, opacity: 0.38, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(currentSec)}
          </span>
          <span className="text-[6.5px]"
            style={{ color: c.secondary, opacity: 0.2, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(DURATION)}
          </span>
        </div>

        {/* Track + knob */}
        <div className="relative flex items-center" style={{ height: 12 }}>
          {/* Track bg */}
          <div className="absolute inset-x-0"
            style={{ height: 3, borderRadius: 2, backgroundColor: `${c.secondary}12` }}>
            {/* Fill */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: `${progress}%`,
              borderRadius: 2,
              background: `linear-gradient(to right, ${c.primary}bb, ${c.primary})`,
              transition: 'width 0.1s linear',
            }} />
          </div>
          {/* Knob */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: c.secondary,
            boxShadow: `0 0 10px ${c.primary}99, 0 2px 4px rgba(0,0,0,0.4)`,
            transition: 'left 0.1s linear',
            opacity: progress > 0.8 ? 1 : 0,
            zIndex: 1,
          }} />
        </div>
      </div>

      {/* ── PLAYBACK CONTROLS ── */}
      <div className="relative z-10 mt-5 flex items-center justify-center gap-8">
        {/* Skip back */}
        <button
          type="button"
          onClick={skipBack}
          style={{
            width: 38, height: 38,
            background: 'none', border: 'none',
            cursor: 'pointer',
            opacity: progress > 2 ? 0.52 : 0.2,
            transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <span style={{ fontSize: 20, color: c.secondary }}>⏮</span>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={toggle}
          disabled={!embedUrl}
          style={{
            position: 'relative',
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            background: embedUrl
              ? `linear-gradient(148deg, ${c.primary}f0, ${c.primary}b0)`
              : 'rgba(255,255,255,0.07)',
            boxShadow: btnShadow,
            cursor: embedUrl ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: embedUrl ? 1 : 0.35,
            transition: 'box-shadow 0.35s ease',
            flexShrink: 0,
          }}>
          {/* Ripple ring */}
          <div
            key={rippleKey}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2.5px solid ${c.primary}`,
              animation: rippleKey > 0 ? '_spotRipple 0.8s ease-out forwards' : 'none',
              pointerEvents: 'none',
            }}
          />
          {/* Play/pause icon */}
          <span style={{
            fontSize: 22,
            color: '#fff',
            marginLeft: isPlaying ? 0 : 3,
            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))',
          }}>
            {isPlaying ? '⏸' : '▶'}
          </span>
        </button>

        {/* Skip forward */}
        <button
          type="button"
          onClick={skipFwd}
          style={{
            width: 38, height: 38,
            background: 'none', border: 'none',
            cursor: 'pointer',
            opacity: 0.52,
            transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <span style={{ fontSize: 20, color: c.secondary }}>⏭</span>
        </button>
      </div>

      {/* ── DESCRIPTION ── */}
      {data.description && (
        <div className="relative z-10 mx-5 mt-4">
          <div className="mb-3"
            style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.secondary}10, transparent)` }} />
          <p className="text-center text-[7.5px] italic leading-[1.85]"
            style={{ color: c.secondary, opacity: 0.32 }}>
            {data.description}
          </p>
        </div>
      )}

      {/* ── NO TRACK FALLBACK ── */}
      {!embedUrl && (
        <p className="relative z-10 mt-3 text-center text-[7.5px]"
          style={{ color: c.secondary, opacity: 0.2 }}>
          No track available
        </p>
      )}

      {/* ── HIDDEN SPOTIFY IFRAME ── */}
      {embedUrl && (
        <iframe
          ref={iframeRef}
          title="Spotify"
          src={embedUrl}
          width={1}
          height={1}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
}
