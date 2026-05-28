'use client';

/**
 * PreviewBackdrop — scaled-down CinematicParallax for the editor PhonePreview.
 *
 * Reuses the same keyframe names as CinematicParallax so animations are
 * shared when both are on page. Falls back correctly if CinematicParallax is
 * not mounted (editor page — keyframes injected here instead).
 *
 * Designed to sit inside PhoneShell's `backdrop` slot (position:absolute, inset:0).
 */

/* ── Keyframes (same names as CinematicParallax — harmless duplicate if both present) ── */
const KF = `
@keyframes _cp_bg1{0%{transform:translate3d(-22px,-16px,0) scale(1.02)}100%{transform:translate3d(22px,16px,0) scale(1.07)}}
@keyframes _cp_bg2{0%{transform:translate3d(18px,20px,0) scale(1.06)}100%{transform:translate3d(-18px,-20px,0) scale(1.02)}}
@keyframes _cp_bg3{0%{transform:translate3d(-10px,14px,0) scale(1.04)}100%{transform:translate3d(14px,-10px,0) scale(1.08)}}
@keyframes _cp_float{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:var(--pop)}88%{opacity:var(--pop)}100%{transform:translate3d(var(--pdx),var(--pdy),0);opacity:0}}
@keyframes _cp_bokeh{0%,100%{opacity:0;transform:scale(0.75)}20%,80%{opacity:var(--pop);transform:scale(1.0)}50%{opacity:var(--pop);transform:scale(1.25)}}
@keyframes _cp_spark{0%,100%{opacity:0;transform:scale(0.6) rotate(0deg)}25%{opacity:var(--pop);transform:scale(1.1) rotate(15deg)}50%{opacity:calc(var(--pop)*0.6);transform:scale(0.9) rotate(-10deg)}75%{opacity:var(--pop);transform:scale(1.05) rotate(8deg)}}
@keyframes _cp_lk{0%{transform:translate3d(var(--la),var(--lb),0) scale(1.0);opacity:var(--lo)}100%{transform:translate3d(var(--lc),var(--ld),0) scale(1.1);opacity:calc(var(--lo)*0.6)}}
`;

/* ── Deterministic particles (same math as CinematicParallax, fewer count) ── */
const N = 16;
const PARTICLES = Array.from({ length: N }, (_, i) => {
  const type = i % 4;
  return {
    id: i,
    x:  ((i * 41 + 17) % 92) + 4,
    y:  ((i * 67 + 11) % 88) + 6,
    size:
      type === 0 ? 8 + (i % 4) * 4
    : type === 1 ? 6 + (i % 3) * 2
    : type === 2 ? 2 + (i % 2)
    : 1,
    pop:   0.10 + (i % 6) * 0.04,
    delay: ((i * 0.62) % 9).toFixed(2),
    dur:   (7 + (i % 6) * 1.8).toFixed(1),
    pdx:   (((i * 23 + 5) % 22) - 11).toFixed(0) + 'px',
    pdy:   (-45 - (i % 5) * 10) + 'px',
    type,
  };
});

const SPARKLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: ((i * 71 + 13) % 86) + 7,
  y: ((i * 43 + 29) % 80) + 8,
  size: 7 + (i % 3) * 2,
  pop:  0.28 + (i % 3) * 0.08,
  delay: ((i * 1.3) % 7).toFixed(2),
  dur:   (8 + i * 1.4).toFixed(1),
  useSec: i % 2 === 1,
}));

interface Props {
  primary:   string;
  secondary: string;
  accent:    string;
  screenBg:  React.CSSProperties;
}

export function PreviewBackdrop({ primary, secondary, accent, screenBg }: Props) {
  /* CSS custom-property helper */
  const v = (obj: Record<string, string | number>) => obj as React.CSSProperties;

  return (
    <>
      <style>{KF}</style>

      {/* Base background (same as screenBg on view page) */}
      <div style={{ position: 'absolute', inset: 0, ...screenBg }} />

      {/* ── Ambient color blobs ── */}
      <div style={{
        position: 'absolute', inset: '-20%',
        pointerEvents: 'none', willChange: 'transform',
      }}>
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(ellipse 52% 44% at 32% 36%, ${primary}28 0%, transparent 65%)`,
          animation: '_cp_bg1 16s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }} />
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(ellipse 46% 54% at 70% 64%, ${secondary}20 0%, transparent 60%)`,
          animation: '_cp_bg2 21s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }} />
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(ellipse 40% 36% at 55% 22%, ${accent}14 0%, transparent 55%)`,
          animation: '_cp_bg3 27s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }} />

        {/* Film grain */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
        }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.38) 100%)',
        }} />

        {/* Depth fog top/bottom */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 30%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.07) 0%, transparent 22%)' }} />

        {/* Horizontal light streak */}
        <div style={{
          position: 'absolute', top: '28%', left: '-5%', right: '-5%', height: 1,
          background: `linear-gradient(90deg,transparent 0%,${primary}0c 20%,${secondary}14 50%,${primary}0c 75%,transparent 100%)`,
          filter: 'blur(2px)', mixBlendMode: 'screen',
        }} />
      </div>

      {/* ── Floating particles ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {PARTICLES.map(p => {
          const color = p.id % 3 === 0 ? primary : p.id % 3 === 1 ? secondary : 'rgba(255,255,255,0.8)';
          const anim =
            p.type === 0 ? `_cp_bokeh ${p.dur}s ease-in-out ${p.delay}s infinite` :
            p.type === 1 ? `_cp_spark ${p.dur}s ease-in-out ${p.delay}s infinite` :
                           `_cp_float ${p.dur}s ease-out ${p.delay}s infinite`;
          return (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width:  p.type === 3 ? 1 : p.size,
              height: p.type === 3 ? p.size * 4 : p.size,
              borderRadius: p.type === 3 ? 2 : '50%',
              background:
                p.type === 0
                  ? `radial-gradient(circle at 35% 35%, ${color}cc 0%, ${color}44 55%, transparent 75%)`
                  : p.type === 3 ? `linear-gradient(180deg, ${color}55, transparent)`
                  : color,
              filter: p.type === 0 ? 'blur(3px)' : p.type === 3 ? 'blur(1px)' : 'none',
              animation: anim,
              ...v({ '--pop': p.pop, '--pdx': p.pdx, '--pdy': p.pdy }),
            }} />
          );
        })}

        {SPARKLES.map(s => (
          <div key={`sp${s.id}`} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            fontSize: s.size, color: s.useSec ? secondary : primary,
            filter: `drop-shadow(0 0 ${3 + s.id}px ${s.useSec ? secondary : primary})`,
            lineHeight: 1,
            animation: `_cp_spark ${s.dur}s ease-in-out ${s.delay}s infinite`,
            ...v({ '--pop': s.pop }),
          }}>✦</div>
        ))}
      </div>

      {/* ── Light leaks ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { x:'-5%',  y:'8%',   w:200, h:160, dur:20, delay:0,   la:'-5px', lb:'-3px', lc:'7px',  ld:'5px',  lo:0.9, sec:false },
          { x:'52%',  y:'50%',  w:180, h:180, dur:26, delay:-10, la:'4px',  lb:'6px',  lc:'-6px', ld:'-4px', lo:0.9, sec:true  },
          { x:'8%',   y:'55%',  w:160, h:130, dur:23, delay:-14, la:'-6px', lb:'4px',  lc:'5px',  ld:'-5px', lo:0.8, sec:true  },
        ].map((lk, i) => {
          const col = lk.sec ? secondary : primary;
          return (
            <div key={i} style={{
              position: 'absolute', left: lk.x, top: lk.y, width: lk.w, height: lk.h,
              background: `radial-gradient(ellipse at 40% 40%, ${col}2a 0%, ${col}0e 45%, transparent 70%)`,
              filter: 'blur(24px)', borderRadius: '50%', mixBlendMode: 'screen',
              animation: `_cp_lk ${lk.dur}s ease-in-out ${lk.delay}s infinite alternate`,
              ...v({ '--la': lk.la, '--lb': lk.lb, '--lc': lk.lc, '--ld': lk.ld, '--lo': lk.lo }),
            }} />
          );
        })}
      </div>
    </>
  );
}
