'use client';
import { useRef, type ReactNode } from 'react';
import { useParallaxDepth } from '../hooks/useParallaxDepth';
import { getBeat } from '../hooks/useBeatBroadcast';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CSS KEYFRAMES (injected once via <style>)
   All animations use GPU-only properties: transform + opacity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const KEYFRAMES = `
/* Background ambient drift — two blobs drift in opposite directions */
@keyframes _cp_bg1 {
  0%   { transform: translate3d(-22px,-16px,0) scale(1.02); }
  100% { transform: translate3d( 22px, 16px,0) scale(1.07); }
}
@keyframes _cp_bg2 {
  0%   { transform: translate3d( 18px, 20px,0) scale(1.06); }
  100% { transform: translate3d(-18px,-20px,0) scale(1.02); }
}
@keyframes _cp_bg3 {
  0%   { transform: translate3d(-10px, 14px,0) scale(1.04); }
  100% { transform: translate3d( 14px,-10px,0) scale(1.08); }
}

/* Particle float upward with CSS var drift & opacity arc */
@keyframes _cp_float {
  0%         { transform: translate3d(0, 0, 0);                       opacity: 0;          }
  12%        { opacity: var(--pop);                                                        }
  88%        { opacity: var(--pop);                                                        }
  100%       { transform: translate3d(var(--pdx), var(--pdy), 0);    opacity: 0;          }
}

/* Bokeh pulse — fade in, breathe, fade out */
@keyframes _cp_bokeh {
  0%, 100%   { opacity: 0;           transform: scale(0.75);  }
  20%, 80%   { opacity: var(--pop);  transform: scale(1.0);   }
  50%        { opacity: var(--pop);  transform: scale(1.25);  }
}

/* Sparkle twinkle */
@keyframes _cp_spark {
  0%, 100%   { opacity: 0;    transform: scale(0.6) rotate(0deg);    }
  25%        { opacity: var(--pop); transform: scale(1.1) rotate(15deg);  }
  50%        { opacity: calc(var(--pop)*0.6); transform: scale(0.9) rotate(-10deg); }
  75%        { opacity: var(--pop); transform: scale(1.05) rotate(8deg); }
}

/* Light leak slow drift */
@keyframes _cp_lk {
  0%   { transform: translate3d(var(--la), var(--lb),0) scale(1.0); opacity: var(--lo); }
  100% { transform: translate3d(var(--lc), var(--ld),0) scale(1.1); opacity: calc(var(--lo)*0.6); }
}

`;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATIC PARTICLE DATA — deterministic (no Math.random)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const N = 28;
const PARTICLES = Array.from({ length: N }, (_, i) => {
  const type = i % 4; // 0=bokeh, 1=sparkle, 2=dust, 3=streak
  return {
    id: i,
    x:  ((i * 41 + 17) % 92) + 4,           // 4..95 %
    y:  ((i * 67 + 11) % 88) + 6,            // 6..93 %
    size:
      type === 0 ? 10 + (i % 5) * 5          // bokeh: 10..30px
    : type === 1 ? 8  + (i % 3) * 3          // sparkle char: 8..14px
    : type === 2 ? 2  + (i % 3)              // dust dot: 2..4px
    :              1,                          // streak: 1px wide
    pop:  0.10 + (i % 7) * 0.04,             // peak opacity 0.10..0.34
    delay: ((i * 0.62) % 9).toFixed(2),
    dur:   (7 + (i % 6) * 1.8).toFixed(1),
    pdx:  (((i * 23 + 5) % 22) - 11).toFixed(0) + 'px',   // -11..10px
    pdy:  (-55 - (i % 5) * 12) + 'px',                     // -55..-103px
    type,
  };
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LIGHT LEAK BLOBS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const LEAKS = [
  { id:0, x:'-8%',  y:'5%',  w:320, h:260, dur:20, delay:0,   la:'-6px', lb:'-4px', lc:'8px',  ld:'6px',  lo:1, useSecondary:false },
  { id:1, x:'55%',  y:'48%', w:280, h:300, dur:26, delay:-10, la:'5px',  lb:'8px',  lc:'-7px', ld:'-5px', lo:1, useSecondary:true  },
  { id:2, x:'65%',  y:'-5%', w:220, h:220, dur:17, delay:-5,  la:'4px',  lb:'-6px', lc:'-5px', ld:'8px',  lo:1, useSecondary:false },
  { id:3, x:'10%',  y:'60%', w:240, h:190, dur:23, delay:-14, la:'-8px', lb:'5px',  lc:'6px',  ld:'-7px', lo:1, useSecondary:true  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPARKLE POSITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SPARKLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: ((i * 71 + 13) % 86) + 7,
  y: ((i * 43 + 29) % 80) + 8,
  size: 8 + (i % 4) * 2,
  pop:  0.30 + (i % 4) * 0.08,
  delay: ((i * 1.3) % 7).toFixed(2),
  dur:   (8 + i * 1.4).toFixed(1),
  useSec: i % 2 === 1,
}));

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DEPTH MULTIPLIERS  (px at full normalized offset ±1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const D = {
  bg:       { x: 14, y: 10 },
  particles:{ x: 22, y: 16 },
  card:     { x: 30, y: 22, ry: 3.5, rx: 2.5 }, // degrees max tilt
  lights:   { x: 48, y: 36 },
} as const;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Props {
  children: ReactNode;
  primary:   string;
  secondary: string;
  accent:    string;
  screenBg:  React.CSSProperties;
}

export function CinematicParallax({ children, primary, secondary, accent, screenBg }: Props) {
  const bgRef        = useRef<HTMLDivElement>(null);
  const ptRef        = useRef<HTMLDivElement>(null);
  const cdRef        = useRef<HTMLDivElement>(null);
  const lkRef        = useRef<HTMLDivElement>(null);
  /** Beat flash overlay — brightens whole scene on each music beat */
  const beatFlashRef = useRef<HTMLDivElement>(null);
  /** Particle wrapper — brightness/saturation filter driven by beat */
  const ptBeatRef    = useRef<HTMLDivElement>(null);

  /* Inline transform helper — called every RAF frame, no React state */
  useParallaxDepth((x, y) => {
    const t3 = (tx: number, ty: number, extra = '') =>
      `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)${extra}`;

    if (bgRef.current)
      bgRef.current.style.transform = t3(x * D.bg.x, y * D.bg.y);

    if (ptRef.current)
      ptRef.current.style.transform = t3(x * D.particles.x, y * D.particles.y);

    if (cdRef.current)
      cdRef.current.style.transform = t3(
        x * D.card.x, y * D.card.y,
        ` rotateY(${(x * D.card.ry).toFixed(2)}deg) rotateX(${(-y * D.card.rx).toFixed(2)}deg)`,
      );

    if (lkRef.current)
      lkRef.current.style.transform = t3(x * D.lights.x, y * D.lights.y);

    /* ── Beat-reactive layers ── */
    const beat = getBeat();
    if (beat > 0.01) {
      // Whole-scene flash — radial bloom from center
      if (beatFlashRef.current) {
        beatFlashRef.current.style.opacity  = (beat * 0.32).toFixed(3);
        beatFlashRef.current.style.transform = `scale(${(1 + beat * 0.055).toFixed(4)})`;
      }
      // Particles — brighter and more saturated on beat
      if (ptBeatRef.current) {
        ptBeatRef.current.style.filter =
          `brightness(${(1 + beat * 0.85).toFixed(3)}) saturate(${(1 + beat * 0.45).toFixed(3)})`;
      }
    } else {
      if (beatFlashRef.current) beatFlashRef.current.style.opacity = '0';
      if (ptBeatRef.current)    ptBeatRef.current.style.filter     = '';
    }
  });

  /* Utility: CSS custom-property style (TS doesn't know about --vars) */
  const vars = (obj: Record<string, string | number>) =>
    obj as React.CSSProperties;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        overflow: 'hidden',
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
        ...screenBg,
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ══════════════════════════════════════
          LAYER 0 — Cinematic background
          Slowest: 14px max, ambient drift CSS
      ══════════════════════════════════════ */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute', inset: '-6%',
          willChange: 'transform',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Animated ambient glow blob 1 — primary colour */}
        <div style={{
          position: 'absolute', inset: '-25%',
          background: `radial-gradient(ellipse 52% 44% at 32% 36%, ${primary}1e 0%, transparent 65%)`,
          animation: '_cp_bg1 16s ease-in-out infinite alternate',
          mixBlendMode: 'screen' as const,
        }}/>
        {/* Animated ambient glow blob 2 — secondary colour */}
        <div style={{
          position: 'absolute', inset: '-25%',
          background: `radial-gradient(ellipse 46% 54% at 70% 64%, ${secondary}18 0%, transparent 60%)`,
          animation: '_cp_bg2 21s ease-in-out infinite alternate',
          mixBlendMode: 'screen' as const,
        }}/>
        {/* Animated ambient glow blob 3 — accent, subtle */}
        <div style={{
          position: 'absolute', inset: '-25%',
          background: `radial-gradient(ellipse 40% 36% at 55% 22%, ${accent}10 0%, transparent 55%)`,
          animation: '_cp_bg3 27s ease-in-out infinite alternate',
          mixBlendMode: 'screen' as const,
        }}/>

        {/* Film grain texture — adds cinematic texture */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: 0.042,
          mixBlendMode: 'overlay' as const,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
        }}/>

        {/* Edge vignette — draws focus to centre */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 42%, rgba(0,0,0,0.42) 100%)',
        }}/>

        {/* Cinematic depth fog — bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.14) 0%, transparent 32%)',
        }}/>

        {/* Cinematic depth fog — top */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 24%)',
        }}/>

        {/* Horizontal light streak — lens flare atmosphere */}
        <div style={{
          position: 'absolute',
          top: '28%', left: '-5%', right: '-5%', height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${primary}0a 15%, ${secondary}12 42%, ${primary}0e 72%, transparent 100%)`,
          filter: 'blur(2px)',
          mixBlendMode: 'screen' as const,
        }}/>
        <div style={{
          position: 'absolute',
          top: '68%', left: '-5%', right: '-5%', height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${secondary}08 20%, ${primary}0c 50%, ${secondary}08 80%, transparent 100%)`,
          filter: 'blur(3px)',
          mixBlendMode: 'screen' as const,
        }}/>
      </div>

      {/* ══════════════════════════════════════
          BEAT FLASH — full-scene bloom on each beat
          z:0.5 — sits between bg and particles
      ══════════════════════════════════════ */}
      <div
        ref={beatFlashRef}
        style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${primary}44 0%, ${secondary}22 45%, transparent 70%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          opacity: 0,
          willChange: 'transform, opacity',
          zIndex: 0,
          transformOrigin: '50% 50%',
        }}
      />

      {/* ══════════════════════════════════════
          LAYER 1 — Floating particles
          Dust, bokeh, streaks, sparkles
      ══════════════════════════════════════ */}
      <div
        ref={ptRef}
        style={{
          position: 'absolute', inset: 0,
          willChange: 'transform',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Beat-reactive wrapper — brightness + saturation filter */}
        <div ref={ptBeatRef} style={{ position: 'absolute', inset: 0, willChange: 'filter' }}>
        {PARTICLES.map(p => {
          const color = p.id % 3 === 0 ? primary : p.id % 3 === 1 ? secondary : 'rgba(255,255,255,0.8)';
          const anim =
            p.type === 0 ? `_cp_bokeh  ${p.dur}s ease-in-out ${p.delay}s infinite` :
            p.type === 1 ? `_cp_spark  ${p.dur}s ease-in-out ${p.delay}s infinite` :
                           `_cp_float  ${p.dur}s ease-out    ${p.delay}s infinite`;

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`, top: `${p.y}%`,
                width:  p.type === 3 ? 1.5 : p.size,
                height: p.type === 3 ? p.size * 5 : p.size,
                borderRadius: p.type === 3 ? 2 : '50%',
                background:
                  p.type === 0
                    ? `radial-gradient(circle at 35% 35%, ${color}cc 0%, ${color}44 55%, transparent 75%)`
                    : p.type === 3
                    ? `linear-gradient(180deg, ${color}55, transparent)`
                    : color,
                filter:
                  p.type === 0 ? 'blur(4px)' :
                  p.type === 3 ? 'blur(1px)' : 'none',
                animation: anim,
                ...vars({
                  '--pop': p.pop,
                  '--pdx': p.pdx,
                  '--pdy': p.pdy,
                }),
              }}
            />
          );
        })}

        {/* ✦ Sparkle characters — twinkling stars */}
        {SPARKLES.map(s => (
          <div
            key={`sp${s.id}`}
            style={{
              position: 'absolute',
              left: `${s.x}%`, top: `${s.y}%`,
              fontSize: s.size,
              color: s.useSec ? secondary : primary,
              filter: `drop-shadow(0 0 ${4 + s.id}px ${s.useSec ? secondary : primary})`,
              lineHeight: 1,
              animation: `_cp_spark ${s.dur}s ease-in-out ${s.delay}s infinite`,
              ...vars({ '--pop': s.pop }),
            }}
          >
            ✦
          </div>
        ))}
        </div>{/* end ptBeatRef */}
      </div>

      {/* ══════════════════════════════════════
          LAYER 2 — Main card content
          30px max shift + 3.5° tilt
      ══════════════════════════════════════ */}
      <div
        ref={cdRef}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          zIndex: 2,
          /* NOTE: no filter here — filter breaks preserve-3d / rotateX/Y */
        }}
      >
        {children}
      </div>

      {/* ══════════════════════════════════════
          LAYER 3 — Cinematic light leaks
          Fastest: 48px max, screen blend
      ══════════════════════════════════════ */}
      <div
        ref={lkRef}
        style={{
          position: 'absolute', inset: 0,
          willChange: 'transform',
          zIndex: 3,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {LEAKS.map(lk => {
          const col = lk.useSecondary ? secondary : primary;
          return (
            <div
              key={lk.id}
              style={{
                position: 'absolute',
                left: lk.x, top: lk.y,
                width: lk.w, height: lk.h,
                background: `radial-gradient(ellipse at 40% 40%, ${col}28 0%, ${col}10 45%, transparent 72%)`,
                filter: 'blur(32px)',
                borderRadius: '50%',
                mixBlendMode: 'screen' as const,
                animation: `_cp_lk ${lk.dur}s ease-in-out ${lk.delay}s infinite alternate`,
                ...vars({
                  '--la': lk.la, '--lb': lk.lb,
                  '--lc': lk.lc, '--ld': lk.ld,
                  '--lo': lk.lo,
                }),
              }}
            />
          );
        })}

        {/* Diagonal light streak — premium editorial feel */}
        <div style={{
          position: 'absolute',
          top: '-10%', left: '40%',
          width: 1, height: '130%',
          background: `linear-gradient(180deg, transparent 0%, ${primary}14 30%, ${secondary}10 60%, transparent 100%)`,
          filter: 'blur(6px)',
          transform: 'rotate(18deg)',
          transformOrigin: 'top center',
          mixBlendMode: 'screen' as const,
          animation: '_cp_lk 30s ease-in-out -8s infinite alternate',
          ...vars({ '--la': '-12px', '--lb': '-5px', '--lc': '10px', '--ld': '7px', '--lo': 0.9 }),
        }}/>
      </div>
    </div>
  );
}
