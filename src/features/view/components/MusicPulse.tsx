'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioPulse } from '../hooks/useAudioPulse';
import { setBeat } from '../hooks/useBeatBroadcast';

/**
 * ─── MUSIC MODE UI ────────────────────────────────────────────────────────────
 *
 * A subtle ambient pulse ring that surrounds the card.
 * Three BPM modes: slow (70) / mid (96) / fast (128).
 *
 * The ring is driven by the RAF loop — no React state for animation values.
 * Toggle button sits at bottom-left of the viewport.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CSS = `
@keyframes _mp_in{from{opacity:0;transform:translateY(6px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}
`;

type Mode = 'slow' | 'mid' | 'fast';
const BPM: Record<Mode, number> = { slow: 68, mid: 96, fast: 124 };
const LABEL: Record<Mode, string> = { slow: '♩', mid: '♪', fast: '♬' };

interface Props {
  primary: string;
}

export function MusicPulse({ primary }: Props) {
  const [active,  setActive]  = useState(false);
  const [mode,    setMode]    = useState<Mode>('mid');
  const ringRef               = useRef<HTMLDivElement>(null);

  const onBeat = useCallback((v: number) => {
    const el = ringRef.current;
    if (!el) return;
    const s  = (1 + v * 0.035).toFixed(4);
    const op = (0.06 + v * 0.16).toFixed(3);
    const gw = Math.round(v * 52);
    el.style.transform = `translate(-50%,-50%) scale(${s})`;
    el.style.opacity   = op;
    el.style.boxShadow = `0 0 ${gw}px ${primary}${Math.round(v * 0x55).toString(16).padStart(2,'0')}`;
    // Broadcast beat value so CinematicParallax can react
    setBeat(v);
  }, [primary]);

  // Reset beat broadcast to 0 whenever music is paused
  useEffect(() => { if (!active) setBeat(0); }, [active]);

  useAudioPulse(onBeat, BPM[mode], active);

  return (
    <>
      <style>{CSS}</style>

      {/* Pulse ring — behind card frame (z:44) */}
      {active && (
        <div ref={ringRef} style={{
          position:'fixed', left:'50%', top:'50%',
          width:270, height:540,
          borderRadius:14,
          border:`1.5px solid ${primary}66`,
          transform:'translate(-50%,-50%)',
          pointerEvents:'none',
          willChange:'transform, opacity, box-shadow',
          zIndex:44,
          opacity:0.06,
        }} />
      )}

      {/* Controls — bottom-left */}
      <div style={{ position:'fixed', bottom:20, left:20, zIndex:62, display:'flex', flexDirection:'column', alignItems:'flex-start', gap:7 }}>

        {/* BPM mode chips — slide in when active */}
        {active && (
          <div style={{
            display:'flex', gap:4,
            animation:'_mp_in .28s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {(['slow','mid','fast'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding:'5px 10px', borderRadius:9, border:'none', cursor:'pointer',
                  fontSize:11, fontWeight:700,
                  background: mode === m ? `${primary}dd` : 'rgba(255,255,255,0.80)',
                  color:      mode === m ? '#fff'          : 'rgba(0,0,0,0.52)',
                  backdropFilter:'blur(10px)',
                  WebkitBackdropFilter:'blur(10px)',
                  boxShadow:'0 1px 8px rgba(0,0,0,0.14)',
                  transition:'background .18s, color .18s',
                }}
              >
                {LABEL[m]}
              </button>
            ))}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setActive(v => !v)}
          aria-label={active ? 'Tắt nhạc' : 'Bật nhạc'}
          style={{
            width:40, height:40, borderRadius:'50%', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            background: active ? `${primary}ee` : 'rgba(255,255,255,0.88)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            boxShadow:'0 2px 16px rgba(0,0,0,0.20)',
            transition:'background .22s',
          }}
        >
          {active ? (
            /* Pause */
            <svg width="12" height="13" viewBox="0 0 24 24" fill="#fff">
              <rect x="6"  y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            /* Play */
            <svg width="13" height="14" viewBox="0 0 24 24" fill="rgba(0,0,0,0.60)">
              <polygon points="7,4 20,12 7,20"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
