'use client';

import { useState, useCallback, useRef } from 'react';

/* ══════════════════════════════════════════════════════════
   § TYPOGRAPHY & EASING
══════════════════════════════════════════════════════════ */
export const FD = "var(--font-playfair),'Playfair Display',Georgia,'Times New Roman','Noto Serif',serif";
export const FS = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif";

/** Expo-out: fast launch → glides to stop. */
export const EXPO = 'cubic-bezier(0.16,1,0.30,1)';
/** Spring: 10% overshoot, physical feel. */
export const SPR = 'cubic-bezier(0.34,1.56,0.64,1)';
/** Cinematic: symmetric in-out for sweeping moves. */
export const CIN = 'cubic-bezier(0.76,0,0.24,1)';

/* ══════════════════════════════════════════════════════════
   § CSS KEYFRAMES  (GPU-safe: transform + opacity only)
══════════════════════════════════════════════════════════ */
export const CSS = `
/* shared */
@keyframes _fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes _fadeOut { from{opacity:1} to{opacity:0;pointer-events:none} }
@keyframes _riseIn  { from{transform:translateY(22px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes _popIn   { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes _hint    { 0%,100%{transform:translateY(0);opacity:.3} 50%{transform:translateY(6px);opacity:.7} }
@keyframes _float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes _pulse   { 0%,100%{opacity:.45} 50%{opacity:1} }
@keyframes _twinkle { 0%,100%{transform:scale(.4);opacity:.07} 50%{transform:scale(1);opacity:.65} }

/* letter */
@keyframes _ltr_arrive { from{transform:translateY(30px) scale(.95);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes _ltr_flap {
  0%  {transform:perspective(900px) rotateX(0deg)}
  68% {transform:perspective(900px) rotateX(-196deg)}
  84% {transform:perspective(900px) rotateX(-170deg)}
  100%{transform:perspective(900px) rotateX(-180deg)}
}
@keyframes _ltr_letter { from{transform:translateY(14px);opacity:0} to{transform:translateY(-60px);opacity:1} }
@keyframes _ltr_seal   { from{transform:translateX(-50%) scale(1);opacity:1} to{transform:translateX(-50%) scale(0) rotate(-22deg);opacity:0} }

/* curtain */
@keyframes _crt_L {0%{transform:translateX(0)} 68%{transform:translateX(-104%)} 84%{transform:translateX(-97%)} 100%{transform:translateX(-100%)}}
@keyframes _crt_R {0%{transform:translateX(0)} 68%{transform:translateX(104%)} 84%{transform:translateX(97%)} 100%{transform:translateX(100%)}}
@keyframes _crt_light {from{opacity:0;transform:scaleX(.02)} to{opacity:1;transform:scaleX(1)}}

/* polaroid v2 — Darkroom Dreams */
@keyframes _pol_land {
  0%  { transform:translateY(-95px) scale(.82) rotate(-1deg); opacity:0; }
  62% { transform:translateY(9px) scale(1.04) rotate(5deg); opacity:1; }
  78% { transform:translateY(-3px) scale(.99) rotate(3deg); }
  100%{ transform:translateY(0) scale(1) rotate(3.5deg); opacity:1; }
}
@keyframes _pol_sway {
  0%,100% { transform:translateY(0) rotate(3.5deg); }
  38%     { transform:translateY(-5px) rotate(4.5deg); }
  65%     { transform:translateY(-2px) rotate(2.8deg); }
}
@keyframes _pol_develop {
  0%  { filter:brightness(.05) saturate(0) sepia(1) blur(6px); }
  15% { filter:brightness(.18) saturate(.08) sepia(.92) blur(3.5px); }
  45% { filter:brightness(.62) saturate(.5) sepia(.28) blur(1px); }
  78% { filter:brightness(.94) saturate(.9) sepia(.05) blur(0); }
  100%{ filter:brightness(1) saturate(1) sepia(0) blur(0); }
}
@keyframes _pol_bokeh {
  0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:var(--bo); }
  50%     { transform:translate(-50%,-50%) scale(1.45); opacity:calc(var(--bo)*2.4); }
}

/* countdown */
@keyframes _cdn_num  { 0%{transform:scale(2.5);opacity:0} 14%{transform:scale(1);opacity:1} 82%{transform:scale(1);opacity:1} 100%{transform:scale(.5);opacity:0} }
@keyframes _cdn_arc  { from{stroke-dashoffset:283} to{stroke-dashoffset:0} }
@keyframes _cdn_rule { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
@keyframes _cdn_film { 0%,100%{opacity:1} 7%{opacity:.88} 9%{opacity:1} 62%{opacity:1} 63%{opacity:.92} 64%{opacity:1} }
@keyframes _cdn_scan { from{top:-4px} to{top:105%} }
@keyframes _cdn_grain { 0%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(-4%,2%)} 30%{transform:translate(3%,-4%)} 40%{transform:translate(-2%,6%)} 50%{transform:translate(-4%,2%)} 60%{transform:translate(4%,0)} 70%{transform:translate(0,4%)} 80%{transform:translate(-2%,3%)} 90%{transform:translate(2%,-2%)} 100%{transform:translate(0,0)} }

/* typewriter */
@keyframes _twr_cursor { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes _twr_ink    { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
@keyframes _twr_paper  { from{transform:translateY(12px) rotate(-.8deg);opacity:0} to{transform:translateY(0) rotate(-.8deg);opacity:1} }

/* rose */
@keyframes _rse_petal {
  0%  {transform:rotate(var(--pa)) translateY(0) scale(0);opacity:0}
  58% {transform:rotate(var(--pa)) translateY(var(--pd)) scale(1.1);opacity:1}
  100%{transform:rotate(var(--pa)) translateY(var(--pd)) scale(1);opacity:.88}
}
@keyframes _rse_inner {
  0%  {transform:rotate(var(--pa)) translateY(0) scale(0);opacity:0}
  62% {transform:rotate(var(--pa)) translateY(var(--pd)) scale(1.08);opacity:1}
  100%{transform:rotate(var(--pa)) translateY(var(--pd)) scale(1);opacity:.93}
}
@keyframes _rse_core { from{transform:scale(.05);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes _rse_stem { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
@keyframes _rse_leaf { from{transform:rotate(var(--la)) scaleX(0);transform-origin:right center} to{transform:rotate(var(--la)) scaleX(1);transform-origin:right center} }

/* heart */
@keyframes _hrt_pulse {
  0%,100%{ filter:drop-shadow(0 0 8px var(--hc))  }
  50%    { filter:drop-shadow(0 0 28px var(--hc)) drop-shadow(0 0 56px var(--hc)) }
}
@keyframes _hrt_shake {
  0%,100%{ transform:translate(0,0) rotate(0) }
  16%{ transform:translate(-12px,0) rotate(-8deg) }
  32%{ transform:translate(12px,0) rotate(8deg) }
  48%{ transform:translate(-7px,0) rotate(-4deg) }
  64%{ transform:translate(7px,0) rotate(4deg) }
  80%{ transform:translate(-3px,0) rotate(-2deg) }
  94%{ transform:translate(3px,0) rotate(2deg) }
}
@keyframes _hrt_glow {
  0%,100%{ transform:scale(1);    opacity:.15; }
  50%    { transform:scale(1.18); opacity:.35; }
}
@keyframes _hrt_mote  { 0%,100%{transform:scale(1);opacity:var(--mo)} 50%{transform:scale(1.45);opacity:calc(var(--mo)*2)} }
@keyframes _hrt_crack { from{stroke-dashoffset:var(--cl)} to{stroke-dashoffset:0} }
@keyframes _hrt_burst { 0%{transform:translate(-50%,-50%) scale(0);opacity:.9} 70%{opacity:.55} 100%{transform:translate(-50%,-50%) scale(5);opacity:0} }
@keyframes _hrt_spark { 0%{transform:translate(0,0) scale(1);opacity:1} 60%{opacity:.8} 100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0} }
@keyframes _hrt_shard { 0%{transform:translate(0,0) rotate(0) scale(1);opacity:1} 25%{opacity:1} 100%{transform:translate(var(--sx),var(--sy)) rotate(var(--sr)) scale(0);opacity:0} }
@keyframes _hrt_conf  { 0%{transform:translate(0,0) rotate(0);opacity:1} 100%{transform:translate(var(--cx),var(--cy)) rotate(var(--cr));opacity:0} }

/* gate */
@keyframes _gte_L {0%{transform:perspective(1200px) rotateY(0)} 68%{transform:perspective(1200px) rotateY(-88deg)} 82%{transform:perspective(1200px) rotateY(-80deg)} 100%{transform:perspective(1200px) rotateY(-84deg)}}
@keyframes _gte_R {0%{transform:perspective(1200px) rotateY(0)} 68%{transform:perspective(1200px) rotateY(88deg)} 82%{transform:perspective(1200px) rotateY(80deg)} 100%{transform:perspective(1200px) rotateY(84deg)}}
@keyframes _gte_ray  { from{opacity:0;transform:scaleY(.04)} to{opacity:var(--ro);transform:scaleY(1)} }
@keyframes _gte_mote { 0%{opacity:0;transform:translate(var(--mx),var(--my))} 22%{opacity:.7} 100%{opacity:0;transform:translate(calc(var(--mx) + var(--mdx)),calc(var(--my) - 52px))} }
@keyframes _gte_glow { from{opacity:0} to{opacity:1} }

/* album */
@keyframes _flp_open {
  0%  {transform:perspective(1400px) rotateY(0)}
  70% {transform:perspective(1400px) rotateY(-190deg)}
  85% {transform:perspective(1400px) rotateY(-172deg)}
  100%{transform:perspective(1400px) rotateY(-178deg)}
}
@keyframes _flp_page { from{transform:perspective(1400px) rotateY(90deg);opacity:.1} to{transform:perspective(1400px) rotateY(0);opacity:1} }
@keyframes _flp_dust { 0%{transform:translate(0,0);opacity:0} 18%{opacity:.55} 100%{transform:translate(var(--ddx),var(--ddy));opacity:0} }

/* scratch */
@keyframes _scr_holo { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes _scr_shim { 0%{transform:translateX(-220%) skewX(-20deg)} 100%{transform:translateX(420%) skewX(-20deg)} }
@keyframes _scr_star { 0%,100%{transform:scale(0) rotate(0);opacity:0} 50%{transform:scale(1) rotate(180deg);opacity:.8} }

/* ── sakura cinematic ── */
@keyframes _sak_fall {
  0%   { transform: translateY(0) translateX(0) rotate(0deg);               opacity: 0; }
  5%   { opacity: var(--so); }
  88%  { opacity: calc(var(--so) * 0.5); }
  100% { transform: translateY(110vh) translateX(var(--sx)) rotate(var(--sr)); opacity: 0; }
}
@keyframes _sak_bud {
  0%   { transform: scale(0)                       rotate(var(--fr)); opacity: 0; }
  50%  { transform: scale(calc(var(--fs) * 1.18))  rotate(var(--fr)); opacity: 1; }
  68%  { transform: scale(calc(var(--fs) * 0.93))  rotate(var(--fr)); opacity: 1; }
  100% { transform: scale(var(--fs))               rotate(var(--fr)); opacity: 1; }
}
@keyframes _sak_sky    { from{opacity:0} to{opacity:1} }
@keyframes _sak_aurora {
  0%,100% { transform:scaleX(1)    translateY(0);    opacity:.85; }
  50%     { transform:scaleX(1.02) translateY(-.4%); opacity:1; }
}
@keyframes _sak_moon {
  0%,100% { opacity:.88; transform:scale(1); }
  50%     { opacity:1;   transform:scale(1.04); }
}
@keyframes _sak_halo {
  0%,100% { transform:scale(1);    opacity:.5; }
  50%     { transform:scale(1.09); opacity:.9; }
}
@keyframes _sak_mist {
  0%,100% { transform:translateX(0)     scaleX(1);     opacity:.8; }
  38%     { transform:translateX(-1.2%) scaleX(1.025); opacity:1; }
  72%     { transform:translateX(.7%)   scaleX(.988);  opacity:.85; }
}
@keyframes _sak_haze {
  0%,100% { transform:translateX(0)   translateY(0);    opacity:.07; }
  35%     { transform:translateX(-1%) translateY(-.5%); opacity:.10; }
  70%     { transform:translateX(.7%) translateY(.3%);  opacity:.08; }
}

/* ── memory dust ── */
@keyframes _dst_float{0%,100%{transform:translateY(0) scale(1);opacity:var(--do)}50%{transform:translateY(-6px) scale(1.35);opacity:calc(var(--do)*2.1)}}
@keyframes _dst_gather{0%{transform:translate(0,0) scale(1);opacity:var(--do)}65%{opacity:calc(var(--do)*2.8)}100%{transform:translate(var(--gx),var(--gy)) scale(0);opacity:0}}
@keyframes _dst_glow{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}70%{opacity:1}100%{opacity:.82;transform:translate(-50%,-50%) scale(1)}}
@keyframes _dst_mem{from{opacity:0;transform:translateY(18px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}

/* ── voice message ── */
@keyframes _vox_bar{0%,100%{transform:scaleY(var(--bh))}50%{transform:scaleY(calc(var(--bh)*2.8+.15))}}
@keyframes _vox_pulse{0%,100%{transform:scale(1);opacity:.38}50%{transform:scale(1.07);opacity:.7}}

/* ── galaxy / stellar ── */
@keyframes _gal_ring{0%{opacity:0;transform:scale(.06)}50%{opacity:.75}100%{opacity:0;transform:scale(3.4)}}
@keyframes _gal_corona{0%{opacity:0;transform:scale(.10)}60%{opacity:.88}100%{opacity:.16;transform:scale(1)}}
@keyframes _gal_rise{from{opacity:0;transform:translateY(28px) scale(.88)}to{opacity:1;transform:translateY(0) scale(1)}}

/* ── cinema reel ── */
@keyframes _rl_flicker{0%,100%{opacity:1}4%{opacity:.68}5%{opacity:.95}11%{opacity:.82}12%{opacity:1}44%{opacity:1}45%{opacity:.42}46%{opacity:.88}47%{opacity:1}}
@keyframes _rl_num{0%{transform:scale(2.4);opacity:0}14%{transform:scale(1);opacity:1}80%{transform:scale(1);opacity:1}100%{transform:scale(.4);opacity:0}}
@keyframes _rl_beam{0%{clip-path:polygon(12% 0%,88% 0%,88% 0%,12% 0%);opacity:0}22%{opacity:.9}100%{clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%);opacity:1}}
@keyframes _rl_scan{from{top:-3px}to{top:104%}}

/* ── storybook ── */
@keyframes _bk_turn{0%{transform:perspective(920px) rotateY(0)}72%{transform:perspective(920px) rotateY(-195deg)}88%{transform:perspective(920px) rotateY(-177deg)}100%{transform:perspective(920px) rotateY(-180deg)}}
@keyframes _bk_inner{from{opacity:0;transform:scale(.96) translateX(8px)}to{opacity:1;transform:scale(1) translateX(0)}}
@keyframes _bk_shadow{0%{opacity:0;transform:translateX(8px) scaleX(.08)}100%{opacity:.6;transform:translateX(0) scaleX(1)}}
`;

/* ══════════════════════════════════════════════════════════
   § SHARED PRIMITIVES
══════════════════════════════════════════════════════════ */
export interface BaseProps {
  onComplete: () => void;
  primaryColor: string;
  accentColor: string;
  title: string;
  imageUrl?: string;
}

export const WRAP: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden',
  userSelect: 'none', WebkitUserSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};

export function useFadeOut(onComplete: () => void, ms = 620) {
  const [fading, setFading] = useState(false);
  const fired = useRef(false);
  const trigger = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setFading(true);
    setTimeout(onComplete, ms);
  }, [onComplete, ms]);
  const style: React.CSSProperties = fading ? { animation: `_fadeOut ${ms}ms ${EXPO} forwards` } : {};
  return { fading, trigger, style };
}

export function Skip({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        position: 'absolute', bottom: 26, right: 20, border: 'none',
        background: 'none', padding: '8px', cursor: 'pointer', zIndex: 20,
        fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
        fontFamily: FS, transition: 'color 0.25s',
        color: dark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.2)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = dark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.2)'; }}
    >bỏ qua</button>
  );
}
