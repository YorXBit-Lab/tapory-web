'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/* ══════════════════════════════════════════════════════════
   § TYPOGRAPHY & EASING
══════════════════════════════════════════════════════════ */
const FD = "var(--font-playfair),'Playfair Display',Georgia,'Times New Roman','Noto Serif',serif";
const FS = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif";

/** Expo-out: fast launch → glides to stop. */
const EXPO = 'cubic-bezier(0.16,1,0.30,1)';
/** Spring: 10% overshoot, physical feel. */
const SPR  = 'cubic-bezier(0.34,1.56,0.64,1)';
/** Cinematic: symmetric in-out for sweeping moves. */
const CIN  = 'cubic-bezier(0.76,0,0.24,1)';

/* ══════════════════════════════════════════════════════════
   § CSS KEYFRAMES  (GPU-safe: transform + opacity only)
══════════════════════════════════════════════════════════ */
const CSS = `
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
interface BaseProps {
  onComplete: () => void;
  primaryColor: string;
  accentColor: string;
  title: string;
  imageUrl?: string;
}

const WRAP: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden',
  userSelect: 'none', WebkitUserSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};

function useFadeOut(onComplete: () => void, ms = 620) {
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

function Skip({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
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

/* ══════════════════════════════════════════════════════════
   1.  LETTER  —  The Luxury Invitation
══════════════════════════════════════════════════════════ */
function LetterIntro({ onComplete, title }: BaseProps) {
  type Ph = 'arriving' | 'idle' | 'opening' | 'revealing';
  const [ph, setPh] = useState<Ph>('arriving');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const t = setTimeout(() => setPh('idle'), 720);
    return () => clearTimeout(t);
  }, []);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('opening');
    // Letter rises at 580 ms — flap has passed 90° and back-face is hidden by then
    setTimeout(() => setPh('revealing'), 580);
    setTimeout(() => trigger(), 2300);
  }, [ph, fading, trigger]);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph === 'idle' ? 'pointer' : 'default',
      background: 'radial-gradient(ellipse at 50% 38%, #1c1508 0%, #0d0a06 55%, #07060a 100%)',
      ...fs,
    }}>
      {/* Ambient warm glow */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 32%, rgba(201,164,83,0.07) 0%, transparent 58%)' }} />

      {/* Envelope */}
      <div style={{
        position:'relative', width:264, height:170,
        animation: ph === 'arriving' ? `_ltr_arrive 700ms ${EXPO} forwards` : 'none',
        opacity: ph === 'arriving' ? 0 : 1,
      }}>
        {/* Deep shadow stack */}
        <div style={{ position:'absolute', inset:0, transform:'translateY(16px) scale(.96)', borderRadius:8, background:'rgba(0,0,0,0.7)', filter:'blur(20px)' }} />
        <div style={{ position:'absolute', inset:0, transform:'translateY(6px) scale(.99)', borderRadius:8, background:'rgba(201,164,83,0.06)', filter:'blur(8px)' }} />

        {/* Envelope body — cream paper */}
        <div style={{
          position:'absolute', inset:0, borderRadius:8,
          background:'linear-gradient(165deg, #f5ede0 0%, #eee0c6 50%, #e6d2b0 100%)',
          border:'1px solid rgba(155,115,55,0.3)',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.07)',
          overflow:'hidden',
        }}>
          {/* Subtle paper grain */}
          <div style={{ position:'absolute', inset:0, opacity:.035,
            backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }} />
          {/* Inside fold lines — two diagonal crease lines from bottom corners meeting at centre-bottom */}
          <svg width="264" height="170" style={{ position:'absolute', inset:0 }}>
            {/* Bottom flap triangle (the lower panel that folds inward) */}
            <path d="M0 170 L132 105 L264 170" fill="rgba(120,82,25,0.07)" />
            {/* Left & right side crease lines */}
            <line x1="0"   y1="170" x2="132" y2="105" stroke="rgba(120,82,25,0.12)" strokeWidth=".75" />
            <line x1="264" y1="170" x2="132" y2="105" stroke="rgba(120,82,25,0.12)" strokeWidth=".75" />
            {/* Left side panel fold */}
            <line x1="0"   y1="0"   x2="0"   y2="170" stroke="rgba(120,82,25,0.06)" strokeWidth=".5" />
            <line x1="264" y1="0"   x2="264" y2="170" stroke="rgba(120,82,25,0.06)" strokeWidth=".5" />
          </svg>
          {/* Gold foil edges */}
          <div style={{ position:'absolute', inset:0, border:'1px solid rgba(201,164,83,0.18)', borderRadius:7, pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:6, border:'0.5px solid rgba(201,164,83,0.1)', borderRadius:4, pointerEvents:'none' }} />
        </div>

        {/* Wax seal — zIndex:9 so it sits visibly ON TOP of the closed flap (zIndex:7) */}
        <div style={{
          position:'absolute', top:44, left:'50%',
          transform:'translateX(-50%)',           /* centred baseline for _pulse */
          width:48, height:48, zIndex:9,
          animation: ph === 'idle' ? '_pulse 3s ease-in-out infinite'
            : (ph === 'opening' || ph === 'revealing') ? `_ltr_seal 280ms ${EXPO} forwards` : 'none',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <defs>
              <radialGradient id="seal" cx="36%" cy="28%">
                <stop offset="0%" stopColor="#d44040" />
                <stop offset="55%" stopColor="#aa1414" />
                <stop offset="100%" stopColor="#780808" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#seal)" />
            <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,220,215,0.25)" strokeWidth=".75" />
            <text x="24" y="29" textAnchor="middle" fontSize="14" fill="rgba(255,240,235,0.82)"
              fontWeight="700" fontFamily={FD} letterSpacing="0.5">T</text>
          </svg>
        </div>

        {/* Flap — hinge at top-center; backface hidden so its reverse never shows */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:96, zIndex:7,
          transformOrigin:'center top',
          backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          animation:(ph==='opening'||ph==='revealing') ? `_ltr_flap 1.1s ${SPR} forwards` : 'none',
        }}>
          <svg width="266" height="96" style={{ display:'block' }}>
            <defs>
              <linearGradient id="flapF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eee2cc" />
                <stop offset="100%" stopColor="#d8c4a4" />
              </linearGradient>
              {/* Subtle inner shadow along the fold edge */}
              <linearGradient id="flapEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(60,30,0,0.12)" />
              </linearGradient>
            </defs>
            {/* Main flap face */}
            <path d="M0 0 L133 88 L266 0 Z" fill="url(#flapF)" />
            {/* Fold-edge shadow gradient overlay */}
            <path d="M0 0 L133 88 L266 0 Z" fill="url(#flapEdge)" />
            {/* Perimeter stroke for paper edge definition */}
            <path d="M1 1 L133 87 L265 1" fill="none" stroke="rgba(140,100,40,0.2)" strokeWidth=".6" />
          </svg>
        </div>

        {/* Inner letter card — zIndex:8 above flap (7) so it rises clear of it */}
        {(ph === 'revealing') && (
          <div style={{
            position:'absolute', left:16, right:16, top:20, bottom:16, zIndex:8,
            background:'linear-gradient(160deg, #fdfaf5 0%, #f8f2e8 100%)',
            borderRadius:4,
            boxShadow:'0 -10px 36px rgba(0,0,0,0.24), 0 -2px 8px rgba(0,0,0,0.1)',
            border:'0.5px solid rgba(175,135,70,0.22)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'12px 18px', gap:5,
            animation:`_ltr_letter 800ms ${SPR} forwards`,
          }}>
            <div style={{ width:'68%', display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#c9a453)' }} />
              <span style={{ fontSize:6, color:'#c9a453', letterSpacing:2 }}>✦</span>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#c9a453,transparent)' }} />
            </div>
            <p style={{ margin:'3px 0 1px', fontSize:14, fontWeight:400, color:'#38220e',
              textAlign:'center', fontFamily:FD, fontStyle:'italic', letterSpacing:'.015em', lineHeight:1.5 }}>
              {title || 'Dành cho bạn'}
            </p>
            <p style={{ margin:0, fontSize:8, color:'#9a7850', letterSpacing:'.18em',
              textTransform:'uppercase', fontFamily:FS, opacity:.75 }}>
              với tất cả yêu thương
            </p>
            <div style={{ width:'68%', display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#c9a453)' }} />
              <span style={{ fontSize:6, color:'#c9a453', letterSpacing:2 }}>✦</span>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#c9a453,transparent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Prompt */}
      {ph === 'idle' && (
        <div style={{ marginTop:44, textAlign:'center', animation:'_hint 2.6s ease-in-out infinite' }}>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.25)', fontFamily:FS }}>chạm để mở</p>
          <div style={{ width:1, height:14, background:'rgba(255,255,255,0.12)', margin:'8px auto 0' }} />
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2.  CURTAIN  —  The Private Chamber
══════════════════════════════════════════════════════════ */
function CurtainIntro({ onComplete, title }: BaseProps) {
  const [open, setOpen] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (open || fading) return;
    setOpen(true);
    setTimeout(() => trigger(), 1100);
  }, [open, fading, trigger]);

  // Velvet fold layers
  const foldL = useMemo(() => [
    { w:'54%', bg:'#1c0808', shadow:'inset -12px 0 28px rgba(0,0,0,.5)' },
    { w:'44%', bg:'#200a0a', shadow:'inset -8px 0 18px rgba(0,0,0,.4)' },
    { w:'34%', bg:'#180606', shadow:'inset -6px 0 14px rgba(0,0,0,.35)' },
    { w:'24%', bg:'#1e0909', shadow:'inset -4px 0 10px rgba(0,0,0,.3)' },
    { w:'14%', bg:'#160606', shadow:'inset -3px 0 8px rgba(0,0,0,.25)' },
  ], []);

  return (
    <div onClick={tap} style={{ ...WRAP, cursor: open ? 'default' : 'pointer', background:'#030104', ...fs }}>

      {/* Warm center glow from behind */}
      {open && (
        <div style={{
          position:'absolute', top:0, bottom:0, left:'10%', right:'10%', zIndex:1,
          background:'radial-gradient(ellipse at 50% 48%, rgba(255,210,130,.18) 0%, rgba(255,180,80,.08) 40%, transparent 75%)',
          animation:`_crt_light 900ms ${EXPO} forwards`,
        }} />
      )}

      {/* LEFT CURTAIN PANEL */}
      <div style={{
        position:'absolute', top:0, left:0, width:'53%', height:'100%', zIndex:10,
        transformOrigin:'left center',
        animation: open ? `_crt_L 1050ms ${CIN} forwards` : 'none',
      }}>
        {foldL.map((f,i) => (
          <div key={i} style={{
            position:'absolute', top:0, left:0, width:f.w, height:'100%',
            background:f.bg, boxShadow:f.shadow, zIndex:5-i,
          }}>
            {/* Vertical weave texture */}
            {i === 0 && (
              <div style={{ position:'absolute', inset:0, opacity:.08,
                backgroundImage:'repeating-linear-gradient(180deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 5px)' }} />
            )}
          </div>
        ))}
        {/* Gold fringe bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:18, zIndex:6,
          backgroundImage:'repeating-linear-gradient(90deg,#c9a453 0,#c9a453 2px,transparent 2px,transparent 9px)',
          opacity:.65 }} />
        {/* Tie-back suggestion */}
        <div style={{ position:'absolute', top:'58%', right:6, width:10, height:36,
          background:'radial-gradient(circle at 40% 30%,#e8c878,#8a6010)',
          borderRadius:5, opacity:.8, boxShadow:'0 2px 10px rgba(0,0,0,.6)' }} />
      </div>

      {/* RIGHT CURTAIN PANEL */}
      <div style={{
        position:'absolute', top:0, right:0, width:'53%', height:'100%', zIndex:10,
        transformOrigin:'right center',
        animation: open ? `_crt_R 1050ms ${CIN} forwards` : 'none',
      }}>
        {foldL.map((f,i) => (
          <div key={i} style={{
            position:'absolute', top:0, right:0, width:f.w, height:'100%',
            background:f.bg,
            boxShadow:f.shadow.replace('-12px','12px').replace('-8px','8px').replace('-6px','6px').replace('-4px','4px').replace('-3px','3px'),
            zIndex:5-i,
          }}>
            {i === 0 && (
              <div style={{ position:'absolute', inset:0, opacity:.08,
                backgroundImage:'repeating-linear-gradient(180deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 5px)' }} />
            )}
          </div>
        ))}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:18, zIndex:6,
          backgroundImage:'repeating-linear-gradient(90deg,#c9a453 0,#c9a453 2px,transparent 2px,transparent 9px)',
          opacity:.65 }} />
        <div style={{ position:'absolute', top:'58%', left:6, width:10, height:36,
          background:'radial-gradient(circle at 40% 30%,#e8c878,#8a6010)',
          borderRadius:5, opacity:.8, boxShadow:'0 2px 10px rgba(0,0,0,.6)' }} />
      </div>

      {/* Center seam & prompt */}
      {!open && (
        <div style={{ position:'absolute', zIndex:11, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          {/* Monogram */}
          <div style={{ width:28, height:28, borderRadius:'50%',
            border:'1px solid rgba(201,164,83,.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 14px rgba(201,164,83,.2)',
          }}>
            <span style={{ fontSize:11, color:'#c9a453', fontFamily:FD, fontWeight:700 }}>T</span>
          </div>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(201,164,83,.45)', fontFamily:FS, animation:'_hint 2.8s ease-in-out infinite' }}>
            {title || 'chạm để mở'}
          </p>
        </div>
      )}

      {/* Gold header bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:32, zIndex:12, pointerEvents:'none',
        background:'linear-gradient(180deg,#1a1000 0%,#c9a453 40%,#e8c878 50%,#c9a453 60%,#1a1000 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ fontSize:8, letterSpacing:5, color:'#1a1000', fontWeight:800, textTransform:'uppercase', fontFamily:FS }}>
          TAPORY
        </span>
      </div>

      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3.  POLAROID  —  Darkroom Dreams
══════════════════════════════════════════════════════════ */
function PolaroidIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'landing' | 'idle' | 'developing';
  const [ph, setPh] = useState<Ph>('landing');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const t = setTimeout(() => setPh('idle'), 980);
    return () => clearTimeout(t);
  }, []);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('developing');
    setTimeout(() => trigger(), 3600);
  }, [ph, fading, trigger]);

  // 6 scattered bg polaroids — static, blurred, different tints
  const bgPols = useMemo(() => [
    { x:7,  y:14, r:-18, w:82,  h:106, c:'#c45a2a', o:.24 },
    { x:82, y:10, r:14,  w:72,  h:92,  c:'#3a6a8a', o:.20 },
    { x:88, y:70, r:20,  w:90,  h:116, c:'#8a5220', o:.22 },
    { x:6,  y:74, r:-13, w:76,  h:96,  c:'#5a2a6a', o:.18 },
    { x:65, y:85, r:-8,  w:66,  h:84,  c:'#2a6a58', o:.20 },
    { x:20, y:48, r:-24, w:58,  h:74,  c:'#7a4218', o:.16 },
  ], []);

  // 14 warm amber bokeh lights
  const bokehs = useMemo(() => [...Array(14)].map((_, i) => ({
    x:   [8, 20, 32, 48, 60, 72, 84, 90, 14, 28, 44, 58, 70, 82][i],
    y:   [18, 75, 25, 88, 10, 68, 38, 82, 50, 20, 62, 42, 28, 55][i],
    s:   [7,  11,  8, 15,  7, 13,  9, 17,  6, 12,  8, 14,  7, 11][i],
    o:   [.15,.10,.20,.07,.14,.12,.18,.09,.13,.16,.11,.14,.12,.17][i],
    d:   i * 0.42,
    dur: 2.6 + (i % 5) * 0.55,
  })), []);

  // photo bokeh blobs inside polaroid
  const photoBlobs = useMemo(() => [
    { l:20, t:25, s:44, o:.22 }, { l:55, t:18, s:30, o:.18 },
    { l:68, t:58, s:52, o:.15 }, { l:38, t:65, s:36, o:.20 },
    { l:82, t:32, s:24, o:.14 }, { l:50, t:45, s:18, o:.12 },
  ], []);

  const isDark = ph === 'landing' || ph === 'idle';

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background: 'radial-gradient(ellipse at 48% 28%, #271309 0%, #150902 50%, #0c0602 100%)',
      ...fs,
    }}>
      {/* Amber safelight — top */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 75% 38% at 50% 0%, rgba(210,85,15,.2) 0%, transparent 100%)' }} />
      {/* Warm pool — bottom */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 80% 35% at 50% 100%, rgba(160,55,8,.09) 0%, transparent 100%)' }} />
      {/* Film grain */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.042,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

      {/* ── Bokeh lights ── */}
      {bokehs.map((b, i) => (
        <div key={i} style={{
          position:'absolute', left:`${b.x}%`, top:`${b.y}%`,
          width:b.s, height:b.s, borderRadius:'50%',
          background:`radial-gradient(circle, rgba(225,130,45,${(b.o*2.8).toFixed(2)}) 0%, rgba(195,80,15,${b.o.toFixed(2)}) 45%, transparent 72%)`,
          transform:'translate(-50%,-50%)',
          ['--bo' as string]: b.o.toFixed(3),
          animation:`_pol_bokeh ${b.dur}s ease-in-out ${b.d.toFixed(2)}s infinite`,
        }} />
      ))}

      {/* ── Scattered bg polaroids ── */}
      {bgPols.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:p.w, height:p.h,
          transform:`translate(-50%,-50%) rotate(${p.r}deg)`,
          background:'linear-gradient(160deg, #f6f0e4 0%, #ede6d8 100%)',
          borderRadius:2, padding:'7px 7px 0',
          boxShadow:'0 6px 20px rgba(0,0,0,.65), 0 2px 6px rgba(0,0,0,.4)',
          filter:'blur(1.8px)', opacity:p.o,
        }}>
          <div style={{
            width:'100%', height:p.h - 26,
            background:`linear-gradient(138deg, ${p.c}cc 0%, ${p.c}55 100%)`,
            borderRadius:1,
          }} />
          <div style={{ height:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:22, height:1, background:'rgba(90,55,25,.22)', borderRadius:1 }} />
          </div>
        </div>
      ))}

      {/* ── Main polaroid ── */}
      <div style={{ position:'relative', zIndex:10 }}>
        <div style={{
          width:192, height:248,
          animation: ph === 'landing'
            ? `_pol_land 980ms ${SPR} forwards`
            : `_pol_sway 4.2s ease-in-out infinite`,
        }}>
          {/* White polaroid frame — slightly warm tint */}
          <div style={{
            width:'100%', height:'100%',
            background:'linear-gradient(160deg, #f9f4ec 0%, #f1ebe0 100%)',
            borderRadius:3,
            padding:'12px 12px 0',
            boxShadow:
              '0 30px 75px rgba(0,0,0,.9),' +
              '0 10px 30px rgba(0,0,0,.65),' +
              '0 3px 8px rgba(0,0,0,.45),' +
              'inset 0 0 0 .5px rgba(255,255,255,.75)',
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>

            {/* ── Photo area ── */}
            <div style={{
              flex:1, position:'relative', overflow:'hidden',
              borderRadius:'1.5px 1.5px 0 0',
              filter: isDark ? 'brightness(.05) saturate(0) sepia(1)' : undefined,
              animation: ph === 'developing' ? `_pol_develop 3.2s ${EXPO} forwards` : undefined,
            }}>
              {imageUrl ? (
                /* ── User photo ── */
                <>
                  <img
                    src={imageUrl}
                    alt=""
                    style={{
                      position:'absolute', inset:0,
                      width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center',
                      display:'block',
                    }}
                  />
                  {/* Vignette over photo */}
                  <div style={{ position:'absolute', inset:0,
                    background:'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,.45) 100%)' }} />
                </>
              ) : (
                /* ── Fallback: bokeh + heart ── */
                <>
                  {/* Dark base */}
                  <div style={{ position:'absolute', inset:0,
                    background:'linear-gradient(145deg, #1c1016 0%, #0e0810 100%)' }} />
                  {/* Primary color tint */}
                  <div style={{ position:'absolute', inset:0, background:primaryColor, opacity:.24 }} />

                  {/* Bokeh blobs */}
                  {photoBlobs.map((b, i) => (
                    <div key={i} style={{
                      position:'absolute', left:`${b.l}%`, top:`${b.t}%`,
                      width:b.s, height:b.s, borderRadius:'50%',
                      background:primaryColor, opacity:b.o,
                      filter:'blur(10px)',
                      transform:'translate(-50%,-50%)',
                    }} />
                  ))}

                  {/* Central heart */}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="62" height="58" viewBox="0 0 62 58" fill="none"
                      style={{ filter:`drop-shadow(0 0 12px ${primaryColor}99) drop-shadow(0 0 4px ${primaryColor}66)` }}>
                      {/* Outer soft halo */}
                      <path
                        d="M31,52 C43,43 54,32 54,20 C54,12 49,7 42,7 C38,7 34.5,9.5 31,14.5 C27.5,9.5 24,7 20,7 C13,7 8,12 8,20 C8,32 19,43 31,52Z"
                        fill={primaryColor} opacity=".22"
                      />
                      {/* Main heart — smooth 6-segment bezier */}
                      <path
                        d="M31,49 C43,40 52,30 52,20 C52,13 47.5,9 42,9 C38.5,9 35.5,11 31,16 C26.5,11 23.5,9 20,9 C14.5,9 10,13 10,20 C10,30 19,40 31,49Z"
                        fill={primaryColor} opacity=".7"
                      />
                      {/* Inner highlight layer — top half only, lighter */}
                      <path
                        d="M31,34 C38,28 46,22 46,16 C46,12 43,10 39.5,10 C37,10 35,11.5 31,16 C27,11.5 25,10 22.5,10 C19,10 16,12 16,16 C16,22 24,28 31,34Z"
                        fill="rgba(255,255,255,.12)"
                      />
                      {/* Left inner highlight arc */}
                      <path d="M17,16 C16,18 15,22 15,26"
                        stroke="rgba(255,255,255,.42)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                      {/* Glint dots */}
                      <circle cx="43" cy="13" r="1.5" fill="rgba(255,255,255,.65)"/>
                      <circle cx="48" cy="22" r=".9" fill="rgba(255,255,255,.42)"/>
                      <circle cx="38" cy="10" r=".7" fill="rgba(255,255,255,.5)"/>
                    </svg>
                  </div>

                  {/* Photo vignette */}
                  <div style={{ position:'absolute', inset:0,
                    background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)' }} />
                </>
              )}
            </div>

            {/* ── Caption strip ── */}
            <div style={{
              height:56, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:4, padding:'0 10px',
            }}>
              <p style={{
                margin:0, fontSize:14,
                fontFamily:`var(--font-dancing),'Dancing Script',cursive`,
                color:'#4a2e14', textAlign:'center', lineHeight:1.2,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%',
                opacity: isDark ? 0 : 1,
                transition:'opacity 1s ease 1.9s',
              }}>
                {title || 'Một khoảnh khắc'}
              </p>
              <p style={{
                margin:0, fontSize:7.5, fontFamily:FS,
                color:'rgba(110,70,35,.42)', letterSpacing:'.2em',
                opacity: isDark ? 0 : 1,
                transition:'opacity 0.8s ease 2.5s',
              }}>
                ♡ &nbsp; {new Date().getFullYear()} &nbsp; ♡
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hint / status */}
      {ph === 'idle' && (
        <p style={{
          marginTop:30, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
          color:'rgba(220,130,55,.38)', fontFamily:FS,
          animation:'_hint 2.4s ease-in-out infinite',
        }}>
          chạm để xem ảnh
        </p>
      )}
      {ph === 'developing' && (
        <p style={{
          marginTop:30, fontSize:9, letterSpacing:'.18em', textTransform:'uppercase',
          color:'rgba(205,105,40,.6)', fontFamily:FS,
          animation:'_pulse 1.6s ease-in-out infinite',
        }}>
          đang hiện ảnh…
        </p>
      )}

      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4.  COUNTDOWN  —  The Title Card
══════════════════════════════════════════════════════════ */
function CountdownIntro({ onComplete, title }: BaseProps) {
  const [n, setN] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const ts = [
      setTimeout(() => setN(2), 1200),
      setTimeout(() => setN(1), 2400),
      setTimeout(() => setShowGo(true), 3600),
      setTimeout(() => trigger(), 4200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [trigger]);

  const scratches = useMemo(() => [...Array(5)].map((_, i) => ({
    x: 8 + Math.random() * 84, y: 5 + Math.random() * 90,
    h: 8 + Math.random() * 18, r: (Math.random() - .5) * 12,
    delay: Math.random() * 4000, dur: 180 + Math.random() * 280,
  })), []);

  return (
    <div onClick={() => { if (!fading) trigger(); }} style={{
      ...WRAP, cursor:'pointer',
      background:'#070708',
      animation:'_cdn_film 6s ease-in-out infinite',
      ...fs,
    }}>
      {/* Film grain */}
      <svg style={{ position:'absolute', width:0, height:0 }}>
        <defs>
          <filter id="fgrain">
            <feTurbulence type="fractalNoise" baseFrequency=".88" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feBlend in="SourceGraphic" mode="overlay"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
      </svg>
      <div style={{ position:'absolute', inset:'-5%', opacity:.1, filter:'url(#fgrain)',
        background:'rgba(255,255,255,.55)',
        animation:'_cdn_grain 0.14s steps(1) infinite', pointerEvents:'none' }} />

      {/* Scan line */}
      <div style={{ position:'absolute', left:0, right:0, height:3,
        background:'rgba(255,255,255,.055)', animation:'_cdn_scan 3.5s linear infinite',
        zIndex:2, pointerEvents:'none' }} />

      {/* Burn flash on number change */}
      <div key={`b${n}`} style={{
        position:'absolute', inset:0,
        background:'rgba(255,248,220,.06)',
        animation:`_popIn 200ms ease-out forwards`,
        pointerEvents:'none', zIndex:3,
      }} />

      {/* Scratches */}
      {scratches.map((s, i) => (
        <div key={i} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:1, height:`${s.h}%`,
          background:'rgba(255,255,255,.28)', transform:`rotate(${s.r}deg)`,
          animation:`_pulse ${s.dur}ms ${s.delay}ms ease-out infinite`,
          pointerEvents:'none', zIndex:4,
        }} />
      ))}

      {/* Sprocket holes */}
      {[...Array(8)].map((_, i) => (
        <div key={`l${i}`} style={{ position:'absolute', left:4, top:`${7+i*11.5}%`,
          width:14, height:18, border:'1.5px solid rgba(255,255,255,.1)', borderRadius:2 }} />
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`r${i}`} style={{ position:'absolute', right:4, top:`${7+i*11.5}%`,
          width:14, height:18, border:'1.5px solid rgba(255,255,255,.1)', borderRadius:2 }} />
      ))}

      {/* Center frame */}
      <div style={{ position:'relative', zIndex:5, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>

        {/* Rule line */}
        {!showGo && (
          <div key={`rule${n}`} style={{
            width:60, height:1, background:'rgba(255,255,255,.2)',
            marginBottom:20,
            animation:`_cdn_rule 1.2s ${EXPO} forwards`,
          }} />
        )}

        {!showGo ? (
          <div key={n} style={{ position:'relative', width:148, height:148 }}>
            {/* Arc timer */}
            <svg width="148" height="148" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="74" cy="74" r="45" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1.5"/>
              <circle cx="74" cy="74" r="45" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5"
                strokeDasharray="283" strokeDashoffset="283"
                style={{ animation:`_cdn_arc 1.2s linear forwards` }} />
            </svg>
            {/* Crosshairs */}
            <svg width="148" height="148" style={{ position:'absolute', inset:0 }}>
              <line x1="74" y1="6" x2="74" y2="22" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="74" y1="126" x2="74" y2="142" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="6" y1="74" x2="22" y2="74" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="126" y1="74" x2="142" y2="74" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <circle cx="74" cy="74" r="4" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
              <text x="104" y="14" fontSize="7" fill="rgba(255,255,255,.25)" fontFamily="SF Mono,monospace">{n*111}A</text>
            </svg>
            {/* Number */}
            <div style={{
              width:148, height:148, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:78, fontWeight:900, color:'#fff', fontFamily:FD,
              textShadow:'0 0 28px rgba(255,255,255,.3)',
              animation:`_cdn_num 1.2s ${EXPO} forwards`,
            }}>{n}</div>
          </div>
        ) : (
          <div style={{ fontSize:56, color:'rgba(255,255,255,.8)', animation:`_popIn .5s ${SPR} forwards` }}>▶</div>
        )}

        {/* Title strip */}
        <div style={{ marginTop:20, opacity:.5 }}>
          <div style={{ width:50, height:.5, background:'rgba(255,255,255,.3)', margin:'0 auto 8px' }} />
          <p style={{ margin:0, fontSize:8, color:'rgba(255,255,255,.4)', letterSpacing:'.28em',
            textTransform:'uppercase', fontFamily:'SF Mono,ui-monospace,monospace' }}>
            {title || 'TAPORY'}
          </p>
        </div>
      </div>

      <p style={{ position:'absolute', bottom:26, fontSize:8, letterSpacing:'.22em',
        color:'rgba(255,255,255,.15)', textTransform:'uppercase', fontFamily:FS }}>
        chạm để bỏ qua
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5.  TYPEWRITER  —  The Handwritten Letter
══════════════════════════════════════════════════════════ */
function TypewriterIntro({ onComplete, primaryColor, title }: BaseProps) {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [ready, setReady] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const msg1 = 'Có điều này muốn nói với bạn…';
  const msg2 = title ? `— ${title}` : '— Luôn bên bạn  ♡';

  useEffect(() => {
    // Store ALL timer IDs so cleanup is complete — prevents double-fire in Strict Mode
    const ids: ReturnType<typeof setTimeout>[] = [];
    let j = 0;

    const typeLine2 = () => {
      j++;
      setLine2(msg2.slice(0, j));
      if (j < msg2.length) {
        ids.push(setTimeout(typeLine2, 52 + Math.random() * 42));
      } else {
        ids.push(setTimeout(() => { setShowMark(true); setShowHint(true); setReady(true); }, 600));
      }
    };

    let i = 0;
    const typeLine1 = () => {
      i++;
      setLine1(msg1.slice(0, i));
      if (i < msg1.length) {
        ids.push(setTimeout(typeLine1, 42 + Math.random() * 38));
      } else {
        // Line1 fully typed → wait briefly → start line2
        ids.push(setTimeout(typeLine2, 380));
      }
    };

    ids.push(setTimeout(typeLine1, 500));
    return () => ids.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onClick={() => { if (ready && !fading) trigger(); }} style={{
      ...WRAP,
      background:'radial-gradient(ellipse at 50% 35%, #f8f0e0 0%, #f2e8d0 55%, #ebe0c4 100%)',
      cursor: ready ? 'pointer' : 'default', ...fs,
    }}>
      {/* Paper grain */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.025,
        backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at center, transparent 50%, rgba(80,50,15,.18) 100%)' }} />
      {/* Fine border */}
      <div style={{ position:'absolute', inset:20, border:'.5px solid rgba(140,95,30,.2)', borderRadius:2, pointerEvents:'none' }} />

      {/* Paper sheet with text */}
      <div style={{
        maxWidth:280, padding:'0 36px', position:'relative', zIndex:2,
        animation:`_twr_paper 600ms ${EXPO} backwards`,
      }}>
        {/* Top rule */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:30, opacity:.4 }}>
          <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#8a6030)' }} />
          <span style={{ fontSize:8, color:'#8a6030', letterSpacing:2 }}>✦</span>
          <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#8a6030,transparent)' }} />
        </div>

        {/* Line 1 */}
        <p style={{
          margin:'0 0 18px', fontSize:15, lineHeight:1.75,
          color:'rgba(50,30,10,.82)', fontFamily:FD, fontStyle:'italic', minHeight:28,
        }}>
          {line1}
          {line1.length < msg1.length && line1.length > 0 && (
            <span style={{ animation:'_twr_cursor .6s step-end infinite',
              borderRight:'1.8px solid rgba(50,30,10,.65)', marginLeft:1 }} />
          )}
        </p>

        {/* Line 2 */}
        {line1.length >= msg1.length && (
          <p style={{
            margin:'0 0 26px', fontSize:13, fontFamily:FD, fontStyle:'italic',
            color: primaryColor, fontWeight:500, letterSpacing:'.01em', minHeight:22,
          }}>
            {line2}
            {line2.length < msg2.length && (
              <span style={{ animation:'_twr_cursor .6s step-end infinite',
                borderRight:'1.8px solid currentColor', marginLeft:1 }} />
            )}
          </p>
        )}

        {/* Underline decoration — ink stroke */}
        {showMark && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              border:`1.5px solid ${primaryColor}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              transform:'rotate(-15deg)',
              opacity:.75,
              animation:`_popIn .45s ${SPR} backwards`,
            }}>
              <span style={{ fontSize:16, color:primaryColor }}>♡</span>
            </div>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div style={{ display:'flex', alignItems:'center', gap:8, animation:'_hint 2.4s ease-in-out infinite' }}>
            <div style={{ flex:1, height:'.5px', background:'rgba(100,60,20,.18)' }} />
            <span style={{ fontSize:8, letterSpacing:'.2em', textTransform:'uppercase',
              color:'rgba(100,60,20,.38)', fontFamily:FS }}>nhấn để tiếp tục</span>
            <div style={{ flex:1, height:'.5px', background:'rgba(100,60,20,.18)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   6.  ROSE  —  Makoto Shinkai × Apple — Sakura Cinematic
══════════════════════════════════════════════════════════ */
function RoseIntro({ onComplete, title }: BaseProps) {
  type Ph = 'idle' | 'bloom' | 'shower';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete, 1000);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('bloom');
    setTimeout(() => setPh('shower'), 1500);
    setTimeout(() => trigger(), 5800);
  }, [ph, fading, trigger]);

  // 54 petals — 3 depth layers (fg/mid/bg): varied size, speed, drift, opacity
  const petals = useMemo(() => [...Array(54)].map((_, i) => {
    const d = i % 3; // depth: 0=foreground 1=mid 2=background
    return {
      left:  `${3 + (i * 7.1 + (i % 5) * 13) % 92}%`,
      sx:    `${(i % 2 ? 1 : -1) * (12 + (i * 33) % 88)}px`,
      sr:    `${(i % 2 ? 1 : -1) * (55 + (i * 61) % 430)}deg`,
      delay: (i * 107) % 2800,
      dur:   d === 0 ? 3.2 + (i * 0.19) % 2.6 : d === 1 ? 4.0 + (i * 0.22) % 3.0 : 5.2 + (i * 0.25) % 3.6,
      so:    d === 0 ? 0.72 + (i % 4) * 0.07 : d === 1 ? 0.52 + (i % 5) * 0.06 : 0.28 + (i % 4) * 0.06,
      size:  d === 0 ? 11 + (i * 7) % 10 : d === 1 ? 8 + (i * 7) % 9 : 6 + (i * 5) % 7,
      color: ['#ffc4d6','#ffd6e6','#ffe8f2','#ffb0c8','#ffdde8','#ffa8c0'][i % 6],
      d,
    };
  }), []);

  // 15 blossoms — placed along the SVG branch (viewBox 0 0 320 480)
  const flowers = useMemo(() => [
    { x: 60, y:283, delay:  18, fs:.83, fr:-19 },
    { x: 29, y:215, delay:  78, fs:.70, fr: 11 },
    { x: 73, y:226, delay: 132, fs:.68, fr: 28 },
    { x:118, y:360, delay:  52, fs:.91, fr:-22 },
    { x:143, y:342, delay: 106, fs:.79, fr: 16 },
    { x:168, y:310, delay: 160, fs:.87, fr:  7 },
    { x:199, y:289, delay:  88, fs:.93, fr:-11 },
    { x:213, y:213, delay: 208, fs:.76, fr: 23 },
    { x:200, y:157, delay: 292, fs:.66, fr:-14 },
    { x:223, y:157, delay: 328, fs:.63, fr: 33 },
    { x:256, y:251, delay: 148, fs:.89, fr: -7 },
    { x:297, y:231, delay: 192, fs:.81, fr: 19 },
    { x:315, y:166, delay: 260, fs:.73, fr:-20 },
    { x:327, y:116, delay: 308, fs:.61, fr: 13 },
    { x: 83, y:335, delay:  36, fs:.74, fr: -4 },
  ], []);

  const bloom = ph === 'bloom' || ph === 'shower';

  // 3 petal colour variants cycling per flower
  const PK = [
    'radial-gradient(ellipse at 48% 82%, #fffaf8 0%, #ffd8e8 36%, #ffb4cc 66%, #ff92b4 100%)',
    'radial-gradient(ellipse at 48% 82%, #fffcfc 0%, #ffe4ef 36%, #ffc4d8 66%, #ffa0be 100%)',
    'radial-gradient(ellipse at 48% 82%, #fff6f8 0%, #ffccd8 36%, #ffaac4 66%, #ff88aa 100%)',
  ];

  // Petal SVG path: 5-petal sakura shape, base at bottom, notched tip
  // viewBox "0 0 20 30" — base at (10,29), tip at (10,0), notch via Q
  const PETAL = 'M10,29C3,23,1,15,2,8C3,1,6,-1,9,-1Q10,3,11,-1C14,-1,17,1,18,8C19,15,17,23,10,29Z';
  const VEIN  = 'M10,29L10,-1';

  return (
    <div onClick={tap} style={{ ...WRAP, cursor:ph==='idle'?'pointer':'default', overflow:'hidden', ...fs }}>

      {/* ── L1 · Deep midnight sky ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0,
        background:'linear-gradient(180deg,#12081f 0%,#1c0e2e 30%,#2a1540 58%,#381a44 100%)' }} />

      {/* ── L2 · Atmospheric haze ── */}
      <div style={{ position:'absolute', inset:'-5% -5%', zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse 110% 48% at 48% 62%,rgba(130,60,165,.07) 0%,transparent 68%)',
        animation:'_sak_haze 22s ease-in-out infinite' }} />

      {/* ── L3 · Cloud wisps ── */}
      <div style={{ position:'absolute', top:'12%', left:'-8%', right:'-8%', height:'20%',
        zIndex:1, pointerEvents:'none',
        background:[
          'radial-gradient(ellipse 75% 100% at 28% 50%,rgba(180,140,210,.04) 0%,transparent 56%)',
          'radial-gradient(ellipse 55% 100% at 72% 50%,rgba(155,115,200,.03) 0%,transparent 52%)',
        ].join(','),
        animation:'_sak_haze 30s 5s ease-in-out infinite' }} />

      {/* ── L4 · Ambient bloom glow ── */}
      <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse 65% 42% at 44% 56%,rgba(210,110,165,.05) 0%,transparent 68%)' }} />

      {/* ── L5 · Pink aurora (post-bloom only) ── */}
      {bloom && (
        <div style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'radial-gradient(ellipse 90% 58% at 43% 50%,rgba(255,115,165,.10) 0%,rgba(190,60,115,.05) 40%,transparent 70%)',
          animation:`_sak_sky .85s ${EXPO} forwards,_sak_aurora 11s 1.4s ease-in-out infinite` }} />
      )}

      {/* ── Moon ── */}
      <div style={{ position:'absolute', top:'9%', right:'13%', zIndex:6, pointerEvents:'none' }}>
        {/* Outer corona */}
        <div style={{ position:'absolute', top:'50%', left:'50%', width:96, height:96,
          transform:'translate(-50%,-50%)', borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,218,80,.07) 0%,rgba(255,200,55,.03) 42%,transparent 70%)',
          animation:'_sak_halo 7s ease-in-out infinite' }} />
        {/* Mid halo */}
        <div style={{ position:'absolute', top:'50%', left:'50%', width:60, height:60,
          transform:'translate(-50%,-50%)', borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,230,120,.12) 0%,transparent 66%)' }} />
        {/* Moon face */}
        <div style={{ position:'relative', width:40, height:40, borderRadius:'50%', overflow:'hidden',
          background:'radial-gradient(circle at 36% 30%,#fffef4 0%,#fff4d2 28%,#ffe8a0 58%,#f8d868 100%)',
          boxShadow:'inset -3px -3px 9px rgba(175,115,18,.18),inset 2px 2px 6px rgba(255,255,232,.65)',
          animation:'_sak_moon 5.5s ease-in-out infinite' }}>
          {/* Natural surface texture */}
          <div style={{ position:'absolute', inset:0, borderRadius:'50%',
            background:[
              'radial-gradient(circle at 64% 60%,rgba(188,135,28,.1) 0%,transparent 36%)',
              'radial-gradient(circle at 28% 72%,rgba(168,120,18,.08) 0%,transparent 26%)',
            ].join(',') }} />
        </div>
      </div>

      {/* ── Stars (18 sharp + 6 soft-blur) ── */}
      {[...Array(24)].map((_,i) => (
        <div key={i} style={{ position:'absolute', zIndex:3, pointerEvents:'none',
          left:`${(i*71+13)%87+5}%`, top:`${(i*43+9)%44+3}%`,
          width: i%5===0?2.8:i%3===0?2:1.4,
          height: i%5===0?2.8:i%3===0?2:1.4,
          borderRadius:'50%', background:'#fff',
          opacity:.13+(i%8)*.07,
          filter: i%7===0?'blur(0.7px)':'none',
          animation:`_twinkle ${1.5+(i%6)*.42}s ${i*.19}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Branch + Blossoms (SVG coordinate system 320×480) ── */}
      <div style={{ position:'absolute', bottom:'-2%', left:'-4%', zIndex:8, pointerEvents:'none',
        width:'84vw', height:'calc(84vw * 1.5)',
        maxWidth:500, maxHeight:750 }}>

        {/* Branch SVG */}
        <svg viewBox="0 0 320 480" width="100%" height="100%"
          style={{ position:'absolute', inset:0 }} preserveAspectRatio="xMinYMax meet">

          {/* Soft drop shadow */}
          <g transform="translate(3,6)" style={{ filter:'blur(5px)' }} opacity=".55">
            <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
              fill="none" stroke="#000" strokeWidth="13" strokeLinecap="round"/>
            <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
          </g>

          {/* Main trunk — 3-stroke bark system */}
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="#1d0b07" strokeWidth="11.5" strokeLinecap="round"/>
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="rgba(95,46,18,.35)" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="rgba(185,100,55,.07)" strokeWidth="1.8" strokeLinecap="round"/>

          {/* Sub-branch upper-left */}
          <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="#1d0b07" strokeWidth="8" strokeLinecap="round"/>
          <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="rgba(95,46,18,.30)" strokeWidth="3" strokeLinecap="round"/>

          {/* Sub-branch upper */}
          <path d="M200,288C204,265,210,240,214,214" fill="none" stroke="#1d0b07" strokeWidth="6.5" strokeLinecap="round"/>
          <path d="M200,288C204,265,210,240,214,214" fill="none" stroke="rgba(95,46,18,.28)" strokeWidth="2.2" strokeLinecap="round"/>

          {/* Far-right extension */}
          <path d="M298,232C305,214,314,193,317,170" fill="none" stroke="#1d0b07" strokeWidth="5.5" strokeLinecap="round"/>
          <path d="M298,232C305,214,314,193,317,170" fill="none" stroke="rgba(95,46,18,.26)" strokeWidth="2" strokeLinecap="round"/>

          {/* Fine twigs */}
          <path d="M58,282C46,260,36,238,28,214" fill="none" stroke="#1d0b07" strokeWidth="4" strokeLinecap="round"/>
          <path d="M58,282C68,260,72,240,74,216" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M214,214C218,196,222,176,224,158" fill="none" stroke="#1d0b07" strokeWidth="4" strokeLinecap="round"/>
          <path d="M214,214C208,196,204,178,202,158" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M317,170C321,152,325,132,327,112" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M317,170C310,155,306,136,306,116" fill="none" stroke="#1d0b07" strokeWidth="3" strokeLinecap="round"/>
        </svg>

        {/* Cherry blossoms — positioned as % of SVG coords */}
        {flowers.map((f, fi) => (
          <div key={fi} style={{ position:'absolute',
            left:`${(f.x/320)*100}%`, top:`${(f.y/480)*100}%`,
            transform:'translate(-50%,-50%)',
            width:32, height:32,
            '--fs':f.fs, '--fr':`${f.fr}deg`,
            opacity: bloom ? undefined : 0,
            animation: bloom ? `_sak_bud .66s ${f.delay}ms ${SPR} both` : 'none',
          } as React.CSSProperties}>

            {/* 5 petals using SVG path for notched sakura shape */}
            {[0,72,144,216,288].map((ang,pi) => (
              <svg key={pi} width="13" height="16" viewBox="0 0 20 30"
                style={{ position:'absolute', left:'50%', top:'50%',
                  marginLeft:-6.5, marginTop:-14,
                  transformOrigin:'50% 100%',
                  transform:`rotate(${ang}deg)`,
                  overflow:'visible',
                }}>
                <defs>
                  <radialGradient id={`pg${fi}${pi}`} cx="48%" cy="82%" r="62%">
                    <stop offset="0%"   stopColor={fi%3===0?'#fffaf8':fi%3===1?'#fffcfc':'#fff6f8'}/>
                    <stop offset="38%"  stopColor={fi%3===0?'#ffd8e8':fi%3===1?'#ffe4ef':'#ffccd8'}/>
                    <stop offset="68%"  stopColor={fi%3===0?'#ffb4cc':fi%3===1?'#ffc4d8':'#ffaac4'}/>
                    <stop offset="100%" stopColor={fi%3===0?'#ff92b4':fi%3===1?'#ffa0be':'#ff88aa'}/>
                  </radialGradient>
                </defs>
                <path d={PETAL} fill={`url(#pg${fi}${pi})`}
                  style={{ filter:'drop-shadow(0 -1px 2px rgba(200,60,100,.14))' }}/>
                <path d={VEIN} stroke="rgba(240,155,185,.22)" strokeWidth=".6" fill="none"/>
              </svg>
            ))}

            {/* Stamen centre disc */}
            <div style={{ position:'absolute', left:'50%', top:'50%',
              transform:'translate(-50%,-50%)', zIndex:3,
              width:7, height:7, borderRadius:'50%',
              background:'radial-gradient(circle at 35% 28%,#fffde2 0%,#ffe448 55%,#f0bc18 100%)',
              boxShadow:'0 0 8px rgba(255,210,35,.9)',
            }} />
            {/* 7 stamen filament dots */}
            {[0,51,103,154,206,257,309].map((a,si) => (
              <div key={si} style={{ position:'absolute', zIndex:3,
                left:`calc(50% + ${(Math.cos(a*Math.PI/180)*5.8).toFixed(1)}px - 1.5px)`,
                top: `calc(50% + ${(Math.sin(a*Math.PI/180)*5.8).toFixed(1)}px - 1.5px)`,
                width:3, height:3, borderRadius:'50%',
                background:'#ffd636', opacity:.88,
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* ── Ambient petals on idle (5 slow) ── */}
      {ph === 'idle' && petals.slice(0,5).map((p,i) => (
        <div key={`ap${i}`} style={{ position:'absolute', left:p.left, top:'-20px',
          zIndex:11, pointerEvents:'none',
          animation:`_sak_fall ${p.dur+1.6}s ${p.delay+2000}ms linear infinite`,
          '--sx':p.sx, '--sr':p.sr, '--so':p.so,
        } as React.CSSProperties}>
          <svg width={p.size} height={p.size*1.15} viewBox="0 0 20 30" fill="none">
            <path d={PETAL} fill={p.color} opacity=".82"/>
            <path d={VEIN} stroke="rgba(255,155,185,.2)" strokeWidth=".6"/>
          </svg>
        </div>
      ))}

      {/* ── Full petal shower (depth-layered) ── */}
      {ph === 'shower' && petals.map((p,i) => (
        <div key={`sp${i}`} style={{ position:'absolute', left:p.left, top:'-20px',
          zIndex: p.d===0?12:p.d===1?11:10,
          pointerEvents:'none',
          animation:`_sak_fall ${p.dur}s ${p.delay}ms linear infinite`,
          '--sx':p.sx, '--sr':p.sr, '--so':p.so,
        } as React.CSSProperties}>
          <svg width={p.size} height={p.size*1.15} viewBox="0 0 20 30" fill="none"
            style={p.d===2?{filter:'blur(1px)'}:undefined}>
            <path d={PETAL} fill={p.color} opacity={p.d===2?'.55':'.88'}/>
            <path d={VEIN} stroke="rgba(255,155,185,.18)" strokeWidth=".6"/>
          </svg>
        </div>
      ))}

      {/* ── Title reveal ── */}
      {bloom && (
        <p style={{ position:'absolute', bottom:'20%', left:'5%', right:'5%',
          margin:0, textAlign:'center', zIndex:14,
          fontSize:14, fontFamily:FD, fontStyle:'italic',
          color:'rgba(255,198,222,.92)',
          textShadow:'0 1px 20px rgba(255,100,158,.5)',
          letterSpacing:'.025em',
          animation:`_riseIn .9s .75s ${EXPO} both`,
        }}>
          {title || '🌸 Dành tặng bạn'}
        </p>
      )}

      {/* ── Tap prompt ── */}
      {ph === 'idle' && (
        <div style={{ position:'absolute', bottom:'20%', left:0, right:0,
          zIndex:14, textAlign:'center', animation:'_hint 2.6s ease-in-out infinite' }}>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.25em', textTransform:'uppercase',
            color:'rgba(255,168,202,.28)', fontFamily:FS }}>
            chạm để hoa nở
          </p>
          <div style={{ width:1, height:16, background:'rgba(255,168,202,.1)', margin:'10px auto 0' }} />
        </div>
      )}

      {/* ── L6 · Cinematic bottom fog ── */}
      <div style={{ position:'absolute', bottom:0, left:'-6%', right:'-6%', height:'18%',
        zIndex:9, pointerEvents:'none',
        background:'linear-gradient(to top,rgba(125,48,78,.09) 0%,rgba(155,75,120,.04) 45%,transparent 100%)',
        borderRadius:'50% 50% 0 0/28% 28% 0 0',
        animation:'_sak_mist 11s ease-in-out infinite',
      }} />

      {/* ── L6b · Lower mist glow ── */}
      <div style={{ position:'absolute', bottom:'12%', left:'-5%', right:'-5%', height:'12%',
        zIndex:8, pointerEvents:'none',
        background:'radial-gradient(ellipse 100% 100% at 50% 100%,rgba(200,100,160,.05) 0%,transparent 70%)',
        animation:'_sak_mist 14s 2s ease-in-out infinite',
      }} />

      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   7.  LOCK  —  The Jewelled Heart
══════════════════════════════════════════════════════════ */
function LockIntro({ onComplete, primaryColor, title }: BaseProps) {
  type Ph = 'idle' | 'cracking' | 'glowing' | 'burst';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('cracking');
    setTimeout(() => setPh('glowing'), 740);
    setTimeout(() => setPh('burst'),   1140);
    setTimeout(() => trigger(),        2150);
  }, [ph, fading, trigger]);

  // Heart path — 120×120 viewBox, smooth 6-segment bezier
  const HP = 'M60,96 C42,84 8,65 8,42 C8,28 18,18 32,18 C40,18 48,22 60,34 C72,22 80,18 88,18 C102,18 112,28 112,42 C112,65 78,84 60,96Z';

  // 8 gem facets [points, w=white|b=black, opacity]
  const facets = useMemo<[string,'w'|'b',number][]>(() => [
    ['60,34 32,18 60,50', 'w', .18], ['60,34 60,50 88,18', 'w', .10],
    ['32,18 8,42  60,50', 'w', .13], ['88,18 60,50 112,42','w', .06],
    ['8,42  22,74 60,50', 'w', .08], ['112,42 60,50 98,74','b', .06],
    ['22,74 60,96 60,50', 'b', .04], ['98,74 60,50  60,96','b', .10],
  ], []);

  // deterministic shards (no Math.random → stable SSR)
  const shards = useMemo(() => [...Array(10)].map((_,i) => ({
    sx: `${Math.cos((i/10)*Math.PI*2) * (44 + (i*17)%37)}px`,
    sy: `${Math.sin((i/10)*Math.PI*2) * (44 + (i*13)%33)}px`,
    sr: `${(i*67)%340 - 170}deg`,
    size: 9+(i%3)*5, delay: (i*8)%80,
  })), []);

  const confetti = useMemo(() => [...Array(18)].map((_,i) => ({
    cx:`${((i*43+7)%160)-80}px`, cy:`${35+((i*31)%110)}px`,
    cr:`${((i*97)%480)-240}deg`,
    color:['#f06090','#f0d060','#60c0f0','#90f060','#f09060'][i%5],
    size:5+(i%4), delay:(i*14)%250,
  })), []);

  // 8 radial spark rays
  const sparks = useMemo(() => [...Array(8)].map((_,i) => {
    const a = (i/8)*Math.PI*2 - Math.PI/2;
    return { sx:`${Math.round(Math.cos(a)*82)}px`, sy:`${Math.round(Math.sin(a)*82)}px`,
      delay:i*22, w:i%2===0?3:2, h:i%2===0?20:14 };
  }), []);

  // 12 ambient motes
  const motes = useMemo(() => [...Array(12)].map((_,i) => ({
    x:  [10,22,35,52,65,78,88, 6,42,58,74,84][i],
    y:  [20,68,32,82,15,55,28,48,72,38,62,85][i],
    s:  [ 3, 5, 4, 6, 3, 4, 5, 3, 4, 5, 3, 4][i],
    o:  [.20,.15,.25,.10,.18,.14,.22,.16,.12,.20,.15,.18][i],
    d: i*0.32, dur:2.2+(i%4)*0.7,
  })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph==='idle' ? 'pointer' : 'default',
      background:`radial-gradient(ellipse at 50% 38%, ${primaryColor}20 0%, #0e0510 58%, #070408 100%)`,
      ...fs,
    }}>
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.52) 100%)' }} />

      {/* ── Ambient motes ── */}
      {motes.map((m,i) => (
        <div key={i} style={{ position:'absolute', left:`${m.x}%`, top:`${m.y}%`,
          width:m.s, height:m.s, borderRadius:'50%', transform:'translate(-50%,-50%)' }}>
          <div style={{
            width:'100%', height:'100%', borderRadius:'50%',
            background:`radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            ['--mo' as string]: m.o.toFixed(3),
            animation:`_hrt_mote ${m.dur}s ${m.d.toFixed(2)}s ease-in-out infinite`,
          }} />
        </div>
      ))}

      {/* ── Ambient halo ── */}
      <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)' }}>
        <div style={{
          width:230, height:230, borderRadius:'50%',
          background:`radial-gradient(circle, ${primaryColor}28 0%, transparent 68%)`,
          animation: ph==='glowing'
            ? `_hrt_glow .35s ease-in-out infinite`
            : `_hrt_glow 3.2s ease-in-out infinite`,
        }} />
      </div>

      {/* ── Burst effects (zero-size anchor at screen center) ── */}
      {ph==='burst' && (
        <div style={{ position:'absolute', left:'50%', top:'42%', width:0, height:0, zIndex:4 }}>
          {/* Expanding ring */}
          <div style={{
            position:'absolute', left:0, top:0,
            width:110, height:110, borderRadius:'50%',
            border:`2px solid ${primaryColor}`,
            animation:`_hrt_burst .85s ${EXPO} forwards`,
          }} />
          {/* Spark rays */}
          {sparks.map((s,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:s.w, height:s.h, borderRadius:2,
              background:`linear-gradient(to bottom, ${primaryColor}, transparent)`,
              ['--sx' as string]:s.sx, ['--sy' as string]:s.sy,
              animation:`_hrt_spark .65s ${s.delay}ms ${EXPO} forwards`,
            }} />
          ))}
          {/* Confetti */}
          {confetti.map((c,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:c.size, height:c.size*1.6, background:c.color, borderRadius:2,
              ['--cx' as string]:c.cx, ['--cy' as string]:c.cy, ['--cr' as string]:c.cr,
              animation:`_hrt_conf .95s ${c.delay}ms ${EXPO} forwards`,
            }} />
          ))}
          {/* Shards */}
          {shards.map((s,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:s.size, height:s.size,
              background:`linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
              clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
              ['--sx' as string]:s.sx, ['--sy' as string]:s.sy, ['--sr' as string]:s.sr,
              animation:`_hrt_shard .72s ${s.delay}ms ${EXPO} forwards`,
            }} />
          ))}
        </div>
      )}

      {/* ── Heart + Lock ── */}
      {ph !== 'burst' && (
        <div style={{
          position:'relative', zIndex:2,
          ['--hc' as string]: primaryColor,
          animation: ph==='idle'    ? '_hrt_pulse 2.8s ease-in-out infinite'
                    : ph==='cracking'? `_hrt_shake .75s ease-in-out`
                    : ph==='glowing' ? '_hrt_pulse .32s ease-in-out infinite'
                    : 'none',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="_hg_hl" cx="32%" cy="22%" r="65%">
                <stop offset="0%"   stopColor="white" stopOpacity=".55"/>
                <stop offset="55%"  stopColor="white" stopOpacity=".04"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="_hg_dk" cx="68%" cy="72%" r="55%">
                <stop offset="0%"   stopColor="black" stopOpacity="0"/>
                <stop offset="100%" stopColor="black" stopOpacity=".38"/>
              </radialGradient>
              <filter id="_hg_gl" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Base fill */}
            <path d={HP} fill={primaryColor} filter="url(#_hg_gl)"/>
            {/* 8 gem facets */}
            {facets.map(([pts,col,op],i) => (
              <polygon key={i} points={pts} fill={col==='w'?'white':'black'} opacity={op}/>
            ))}
            {/* Light overlay — bright top-left */}
            <path d={HP} fill="url(#_hg_hl)"/>
            {/* Dark edge */}
            <path d={HP} fill="url(#_hg_dk)"/>
            {/* Rim highlight */}
            <path d={HP} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
            {/* Glint dots */}
            <circle cx="38" cy="26" r="3.5" fill="rgba(255,255,255,.55)"/>
            <circle cx="30" cy="34" r="1.5" fill="rgba(255,255,255,.38)"/>
            <circle cx="90" cy="26" r="1.8" fill="rgba(255,255,255,.28)"/>

            {/* 3 crack lines */}
            {ph==='cracking' && (<>
              <line x1="60" y1="44" x2="46" y2="68"
                stroke="rgba(255,220,228,.85)" strokeWidth="1.2"
                strokeDasharray="27" strokeDashoffset="27"
                style={{ animation:'_hrt_crack .3s ease-out forwards','--cl':'27' } as React.CSSProperties}/>
              <line x1="60" y1="44" x2="74" y2="70"
                stroke="rgba(255,210,220,.72)" strokeWidth="1.2"
                strokeDasharray="30" strokeDashoffset="30"
                style={{ animation:'_hrt_crack .3s .06s ease-out forwards','--cl':'30' } as React.CSSProperties}/>
              <line x1="60" y1="44" x2="52" y2="28"
                stroke="rgba(255,210,220,.50)" strokeWidth=".8"
                strokeDasharray="18" strokeDashoffset="18"
                style={{ animation:'_hrt_crack .22s .04s ease-out forwards','--cl':'18' } as React.CSSProperties}/>
            </>)}

            {/* ── Lock ── centered at ~(60,50) */}
            <g transform="translate(43,22)">
              {/* Shackle shadow */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(0,0,0,.38)" strokeWidth="6" strokeLinecap="round"/>
              {/* Shackle body */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(0,0,0,.60)" strokeWidth="4.5" strokeLinecap="round"/>
              {/* Shackle highlight */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Body shadow */}
              <rect x="1" y="22" width="34" height="24" rx="5.5" fill="rgba(0,0,0,.28)"/>
              {/* Body */}
              <rect x="0" y="21" width="34" height="24" rx="5.5" fill="rgba(0,0,0,.58)"/>
              {/* Body top shine */}
              <rect x="2" y="22.5" width="30" height="9" rx="4" fill="rgba(255,255,255,.13)"/>
              {/* Keyhole circle */}
              <circle cx="17" cy="32" r="5.2" fill="rgba(255,255,255,.50)"/>
              {/* Keyhole slot */}
              <rect x="15" y="34" width="4" height="7" rx="1.5" fill="rgba(255,255,255,.44)"/>
            </g>
          </svg>
        </div>
      )}

      {/* ── Text ── */}
      <div style={{ marginTop:20, textAlign:'center', zIndex:2 }}>
        <p style={{ margin:'0 0 6px', fontSize:14, fontWeight:500, fontFamily:FD,
          color:'rgba(255,255,255,.85)', letterSpacing:'.01em' }}>
          {title || 'Dành cho bạn'}
        </p>
        {ph==='idle' && (
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:`${primaryColor}88`, fontFamily:FS, animation:'_hint 2.4s ease-in-out infinite' }}>
            chạm để mở khóa
          </p>
        )}
        {ph==='burst' && (
          <p style={{ margin:0, fontSize:12, color:primaryColor, fontWeight:600, fontFamily:FD,
            animation:`_popIn .35s ${SPR} forwards` }}>
            💝 Đã mở khóa
          </p>
        )}
      </div>
      <Skip onClick={trigger}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   8.  GATE  —  The Threshold
══════════════════════════════════════════════════════════ */
function GateIntro({ onComplete, title }: BaseProps) {
  type Ph = 'idle' | 'opening' | 'open';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('opening');
    setTimeout(() => setPh('open'), 960);
    setTimeout(() => trigger(), 1800);
  }, [ph, fading, trigger]);

  const rays = useMemo(() =>
    [-24, -14, -5, 0, 5, 14, 24].map((angle, i) => ({
      angle, opacity: .2 + Math.abs(i - 3) * .035, delay: i * 38,
    })), []);

  const motes = useMemo(() => [...Array(18)].map((_, i) => ({
    mx:`${26+Math.random()*48}%`, my:`${18+Math.random()*55}%`,
    mdx:`${(Math.random()-.5)*44}px`,
    size:1+Math.random()*2, delay:Math.random()*1400, dur:2+Math.random()*2.5,
  })), []);

  const wood: React.CSSProperties = {
    backgroundImage:[
      'repeating-linear-gradient(92deg,transparent,transparent 38px,rgba(0,0,0,.04) 38px,rgba(0,0,0,.04) 40px)',
      'repeating-linear-gradient(2deg,transparent,transparent 60px,rgba(0,0,0,.035) 60px,rgba(0,0,0,.035) 62px)',
      'linear-gradient(160deg,#6a3010 0%,#4a1f08 20%,#7a3c18 40%,#582808 60%,#8a4818 80%,#6a3010 100%)',
    ].join(','),
  };

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'radial-gradient(ellipse at 50% 58%, rgba(255,170,50,.08) 0%, #080400 65%)',
      ...fs,
    }}>
      {/* God rays */}
      {(ph==='open') && rays.map((r, i) => (
        <div key={i} style={{
          position:'absolute', bottom:'24%', left:'50%',
          width:r.opacity>.22 ? 72 : 52, height:'90%',
          background:`linear-gradient(to top, rgba(255,195,72,.6) 0%, rgba(255,195,72,${r.opacity}) 35%, transparent 72%)`,
          transform:`rotate(${r.angle}deg)`, transformOrigin:'bottom center',
          filter:'blur(16px)',
          animation:`_gte_ray 2.2s ${r.delay}ms ${EXPO} forwards`,
          '--ro':r.opacity, zIndex:1, pointerEvents:'none',
        } as React.CSSProperties} />
      ))}

      {/* Dust motes */}
      {ph==='open' && motes.map((m, i) => (
        <div key={i} style={{
          position:'absolute', left:m.mx, top:m.my,
          width:m.size, height:m.size, borderRadius:'50%',
          background:'rgba(255,210,110,.65)',
          boxShadow:`0 0 ${m.size*3}px rgba(255,190,60,.45)`,
          animation:`_gte_mote ${m.dur}s ${m.delay}ms ${EXPO} forwards`,
          '--mx':m.mx, '--my':m.my, '--mdx':m.mdx, zIndex:6,
        } as React.CSSProperties} />
      ))}

      {/* LEFT DOOR */}
      <div style={{
        position:'absolute', top:0, left:0, width:'50%', height:'100%',
        ...wood, transformOrigin:'left center', zIndex:5,
        animation: ph!=='idle' ? `_gte_L 1.08s ${CIN} forwards` : 'none',
        boxShadow:'inset -12px 0 32px rgba(0,0,0,.6)',
      }}>
        <div style={{ position:'absolute',top:'10%',left:8,right:6,height:'34%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'52%',left:8,right:6,height:'26%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'8%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'48%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'80%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        {[17,47,74].map(t => (
          <div key={t} style={{ position:'absolute',top:`${t}%`,left:3,width:12,height:22,
            background:'linear-gradient(90deg,#a08040,#c9a93c)',borderRadius:2,
            boxShadow:'1px 1px 4px rgba(0,0,0,.5)' }} />
        ))}
        <div style={{ position:'absolute',top:'50%',right:10,transform:'translateY(-50%)',
          width:18,height:18,borderRadius:'50%',
          background:'radial-gradient(circle at 35% 30%,#f5d060,#7a5e10)',
          border:'1px solid #c9a93c',boxShadow:'1px 2px 6px rgba(0,0,0,.6)' }} />
      </div>

      {/* RIGHT DOOR */}
      <div style={{
        position:'absolute', top:0, right:0, width:'50%', height:'100%',
        ...wood, transformOrigin:'right center', zIndex:5,
        animation: ph!=='idle' ? `_gte_R 1.08s ${CIN} forwards` : 'none',
        boxShadow:'inset 12px 0 32px rgba(0,0,0,.6)',
      }}>
        <div style={{ position:'absolute',top:'10%',left:6,right:8,height:'34%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'52%',left:6,right:8,height:'26%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'8%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'48%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'80%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        {[17,47,74].map(t => (
          <div key={t} style={{ position:'absolute',top:`${t}%`,right:3,width:12,height:22,
            background:'linear-gradient(270deg,#a08040,#c9a93c)',borderRadius:2,
            boxShadow:'-1px 1px 4px rgba(0,0,0,.5)' }} />
        ))}
        <div style={{ position:'absolute',top:'50%',left:10,transform:'translateY(-50%)',
          width:18,height:18,borderRadius:'50%',
          background:'radial-gradient(circle at 35% 30%,#f5d060,#7a5e10)',
          border:'1px solid #c9a93c',boxShadow:'-1px 2px 6px rgba(0,0,0,.6)' }} />
      </div>

      {/* Keyhole + title when closed */}
      {ph === 'idle' && (
        <div style={{ position:'absolute',zIndex:9,display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
          <svg width="28" height="44" viewBox="0 0 28 44" style={{ filter:'drop-shadow(0 0 8px rgba(201,164,83,.65))' }}>
            <circle cx="14" cy="13" r="8.5" fill="#c9a453" opacity=".88"/>
            <circle cx="14" cy="13" r="5" fill="#080400"/>
            <path d="M10 20 L18 20 L16 40 L12 40 Z" fill="#c9a453" opacity=".88"/>
          </svg>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(201,164,83,.42)', fontFamily:FS, animation:'_hint 2.2s ease-in-out infinite' }}>
            {title || 'chạm để mở'}
          </p>
        </div>
      )}

      {/* Light flood when open */}
      {ph==='open' && (
        <div style={{
          position:'absolute', top:0, bottom:0, left:'15%', right:'15%', zIndex:2,
          background:'radial-gradient(ellipse at 50% 68%, rgba(255,210,90,.16) 0%, transparent 60%)',
          animation:`_gte_glow .7s ${EXPO} forwards`, pointerEvents:'none',
        }} />
      )}

      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   9.  ALBUM  —  The Precious Journal
══════════════════════════════════════════════════════════ */
function FlipIntro({ onComplete, primaryColor, accentColor, title }: BaseProps) {
  const [flipped, setFlipped] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (flipped || fading) return;
    setFlipped(true);
    setTimeout(() => trigger(), 1400);
  }, [flipped, fading, trigger]);

  const dust = useMemo(() => [...Array(10)].map((_, i) => ({
    left:`${36+Math.random()*28}%`,
    ddx:`${(Math.random()-.5)*55}px`, ddy:`${-18-Math.random()*36}px`,
    size:1.5+Math.random()*2, delay:Math.random()*480,
  })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: flipped ? 'default' : 'pointer',
      background:'radial-gradient(ellipse at 42% 50%, #2c1808 0%, #100604 55%, #070404 100%)',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 42% 52%,rgba(255,150,50,.08) 0%,transparent 52%)' }} />

      {/* Dust on flip */}
      {flipped && dust.map((d, i) => (
        <div key={i} style={{
          position:'absolute', left:d.left, top:'50%',
          width:d.size, height:d.size, borderRadius:'50%',
          background:'rgba(255,170,70,.55)',
          animation:`_flp_dust 1.6s ${d.delay}ms ${EXPO} forwards`,
          '--ddx':d.ddx, '--ddy':d.ddy,
        } as React.CSSProperties} />
      ))}

      <div style={{ position:'relative', width:210, height:270 }}>
        {/* Spine */}
        <div style={{
          position:'absolute', left:-14, top:10, bottom:10, width:20,
          background:'linear-gradient(90deg,#180800,#5a2808,#281000)',
          borderRadius:'3px 0 0 3px', boxShadow:'-5px 0 18px rgba(0,0,0,.7)',
        }}>
          {[20,42,65].map(t => (
            <div key={t} style={{ position:'absolute',top:`${t}%`,left:0,right:0,height:3,
              background:'#c9a453',opacity:.55 }} />
          ))}
        </div>

        {/* Pages stack */}
        {[4,3,2,1].map(i => (
          <div key={i} style={{
            position:'absolute', inset:0,
            background:`hsl(42,${28-i*2}%,${93-i}%)`,
            borderRadius:'1px 4px 4px 1px', zIndex:i,
            transform:`translateX(${i*2}px) translateY(${i*.4}px)`,
            boxShadow:'1px 1px 3px rgba(0,0,0,.12)',
          }} />
        ))}

        {/* Inside endpapers after flip */}
        {flipped && (
          <div style={{
            position:'absolute', inset:0, zIndex:8,
            background:'linear-gradient(140deg,#fdf9f0 0%,#f6ede0 100%)',
            borderRadius:'1px 4px 4px 1px',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:24, gap:8,
            animation:`_flp_page .75s .1s ${SPR} backwards`,
            boxShadow:'2px 0 22px rgba(0,0,0,.22)',
          }}>
            {/* Marbled pattern */}
            <div style={{ position:'absolute',inset:0,opacity:.06,
              backgroundImage:'repeating-linear-gradient(45deg,#c9a453 0,#c9a453 1px,transparent 1px,transparent 16px),repeating-linear-gradient(-45deg,#c9a453 0,#c9a453 1px,transparent 1px,transparent 16px)',
              borderRadius:'1px 4px 4px 1px',
            }} />
            {/* Content */}
            <div style={{ display:'flex',alignItems:'center',gap:6,width:'78%',opacity:.6 }}>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
              <span style={{ fontSize:7,color:accentColor }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
            </div>
            <p style={{ margin:0,fontSize:16,fontFamily:FD,fontWeight:700,color:'#38180a',
              textAlign:'center',lineHeight:1.45 }}>
              {title || 'Dành cho bạn'}
            </p>
            <p style={{ margin:0,fontSize:9,fontFamily:FD,fontStyle:'italic',color:'#9a6840',
              letterSpacing:'.04em' }}>một trang ký ức</p>
            <div style={{ display:'flex',alignItems:'center',gap:6,width:'78%',opacity:.6,marginTop:4 }}>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
              <span style={{ fontSize:7,color:accentColor }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
            </div>
          </div>
        )}

        {/* Book cover */}
        <div style={{
          position:'absolute', inset:0, transformOrigin:'left center', zIndex:10,
          animation: flipped ? `_flp_open 1.15s ${CIN} forwards` : 'none',
        }}>
          <div style={{
            width:'100%', height:'100%',
            background:`linear-gradient(155deg, ${primaryColor} 0%, #1a0810 48%, ${primaryColor}88 100%)`,
            borderRadius:'2px 4px 4px 2px',
            boxShadow:'6px 6px 34px rgba(0,0,0,.72)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:24, position:'relative', overflow:'hidden',
          }}>
            {/* Leather grain */}
            <div style={{ position:'absolute',inset:0,opacity:.1,
              backgroundImage:'repeating-linear-gradient(32deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 7px)' }} />
            {/* Gold borders */}
            {[12,17,21].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,border:`1px solid rgba(201,164,83,${.5-.12*(n/12)})`,borderRadius:2,pointerEvents:'none' }} />
            ))}
            {/* Corner ornaments */}
            {([{t:14,l:14},{t:14,r:14},{b:14,l:14},{b:14,r:14}] as unknown as React.CSSProperties[]).map((pos,i) => (
              <span key={i} style={{ position:'absolute',...pos,color:accentColor,fontSize:10,opacity:.85,
                textShadow:`0 0 5px ${accentColor}` }}>✦</span>
            ))}
            {/* Ribbon */}
            <div style={{ position:'absolute',top:-2,right:28,width:12,height:40,
              background:`linear-gradient(180deg,${accentColor},${accentColor}88)`,
              clipPath:'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)',
              boxShadow:`0 0 7px ${accentColor}44` }} />
            {/* Text */}
            <p style={{ margin:'0 0 10px',fontSize:17,fontWeight:700,color:'#fff',fontFamily:FD,
              textAlign:'center',lineHeight:1.4,textShadow:'0 2px 8px rgba(0,0,0,.5)',
              letterSpacing:'.01em' }}>
              {title || 'Dành cho bạn'}
            </p>
            <div style={{ width:48,height:.75,background:accentColor,opacity:.75 }} />
          </div>
        </div>
      </div>

      {!flipped && (
        <p style={{ marginTop:28,fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',
          color:'rgba(255,170,70,.3)',fontFamily:FS,animation:'_hint 2.4s ease-in-out infinite' }}>
          chạm để lật trang
        </p>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   10.  SCRATCH  —  Holographic Reveal
══════════════════════════════════════════════════════════ */
function ScratchIntro({ onComplete, primaryColor }: BaseProps) {
  const cvRef   = useRef<HTMLCanvasElement>(null);
  const isDown  = useRef(false);
  const lastP   = useRef<{x:number;y:number}|null>(null);
  const checkT  = useRef<number>(0);
  const completing = useRef(false);

  const [pct,   setPct]   = useState(0);
  const [hint,  setHint]  = useState(true);
  const [done,  setDone]  = useState(false);

  const stars = useMemo(() => [...Array(18)].map((_, i) => ({
    left:`${(i*53+3)%96}%`, top:`${(i*67+7)%92}%`,
    size:4+Math.random()*5, delay:Math.random()*3200, dur:1.6+Math.random()*2,
  })), []);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    const ctx = cv.getContext('2d', { willReadFrequently:true }); if (!ctx) return;

    // ── Wood-paper base gradient (horizontal warm grain light) ──
    const g = ctx.createLinearGradient(0, 0, cv.width, 0);
    g.addColorStop(0,   '#b8844a');
    g.addColorStop(.18, '#cfa060');
    g.addColorStop(.35, '#b87840');
    g.addColorStop(.52, '#d4aa72');
    g.addColorStop(.68, '#c09050');
    g.addColorStop(.82, '#d0a868');
    g.addColorStop(1,   '#b88048');
    ctx.fillStyle = g; ctx.fillRect(0,0,cv.width,cv.height);

    // Depth variation — vertical gradient overlay
    const gv = ctx.createLinearGradient(0, 0, 0, cv.height);
    gv.addColorStop(0,   'rgba(255,200,120,.1)');
    gv.addColorStop(.45, 'rgba(255,200,120,.18)');
    gv.addColorStop(1,   'rgba(80,30,0,.12)');
    ctx.fillStyle = gv; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Wood grain lines ──
    for (let y = 0; y < cv.height; y += 2.8) {
      const wave1 = Math.sin(y * 0.055) * 5;
      const wave2 = Math.sin(y * 0.22 + 1.4) * 1.8;
      const alpha = 0.03 + Math.random() * 0.055;
      ctx.strokeStyle = `rgba(65,25,5,${alpha})`;
      ctx.lineWidth   = 0.4 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.moveTo(wave1 + wave2, y);
      // gentle bezier wave across width
      ctx.bezierCurveTo(
        cv.width * 0.28 + wave1, y + (Math.random() - .5) * 1.2,
        cv.width * 0.68 + wave2, y + (Math.random() - .5) * 1.2,
        cv.width + wave1 + wave2, y
      );
      ctx.stroke();
    }

    // ── Warm highlight shimmer band ──
    const sh = ctx.createLinearGradient(0, 0, cv.width, 0);
    sh.addColorStop(0,   'rgba(255,230,160,0)');
    sh.addColorStop(.35, 'rgba(255,230,160,.08)');
    sh.addColorStop(.5,  'rgba(255,230,160,.22)');
    sh.addColorStop(.65, 'rgba(255,230,160,.08)');
    sh.addColorStop(1,   'rgba(255,230,160,0)');
    ctx.fillStyle = sh; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Vignette edges ──
    const vg = ctx.createRadialGradient(cv.width/2, cv.height/2, cv.width*.3, cv.width/2, cv.height/2, cv.width*.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(50,18,2,.28)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Centre text ──
    const cx = cv.width/2, cy = cv.height/2;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(40,12,0,.4)'; ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(45,18,4,.52)';
    ctx.font = `600 ${Math.min(24,cv.width*.062)}px ${FS}`;
    ctx.fillText('CÀO ĐỂ KHÁM PHÁ', cx, cy - 20);
    ctx.shadowBlur = 0;
    ctx.font = `${Math.min(38,cv.width*.095)}px serif`;
    ctx.fillStyle = 'rgba(45,18,4,.38)';
    ctx.fillText('✦', cx, cy + 20);
    ctx.font = `${Math.min(11,cv.width*.028)}px ${FS}`;
    ctx.fillStyle = 'rgba(45,18,4,.3)';
    ctx.fillText('Vuốt ngón tay để cào', cx, cy + 54);
  }, []);

  const getPos = useCallback((e: React.MouseEvent|React.TouchEvent) => {
    const cv=cvRef.current; if(!cv) return null;
    const r=cv.getBoundingClientRect();
    const sx=cv.width/r.width, sy=cv.height/r.height;
    if ('touches' in e) {
      const t=e.touches[0];
      return {x:(t.clientX-r.left)*sx, y:(t.clientY-r.top)*sy};
    }
    return {x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy};
  }, []);

  const scratchAt = useCallback((x:number, y:number) => {
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext('2d',{willReadFrequently:true}); if(!ctx) return;
    ctx.globalCompositeOperation='destination-out';
    const g=ctx.createRadialGradient(x,y,0,x,y,32);
    g.addColorStop(0,'rgba(0,0,0,1)');
    g.addColorStop(.65,'rgba(0,0,0,.88)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(x,y,32,0,Math.PI*2); ctx.fill();
    if(lastP.current){
      ctx.lineWidth=46; ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,.88)';
      ctx.beginPath(); ctx.moveTo(lastP.current.x,lastP.current.y); ctx.lineTo(x,y); ctx.stroke();
    }
    lastP.current={x,y};
    ctx.globalCompositeOperation='source-over';
    setHint(false);

    clearTimeout(checkT.current);
    checkT.current=window.setTimeout(()=>{
      const d=ctx.getImageData(0,0,cv.width,cv.height);
      let t=0; const tot=Math.floor(d.data.length/(4*16));
      for(let i=3;i<d.data.length;i+=64) if(d.data[i]<64) t++;
      const p=Math.min(100,(t/tot)*100);
      setPct(p);
      if(p>50 && !completing.current){
        completing.current=true;
        const c2=cv.getContext('2d');
        if(c2){
          let a=1;
          const anim=()=>{
            a-=.045; c2.globalAlpha=Math.max(0,a);
            c2.clearRect(0,0,cv.width,cv.height);
            if(a>0.02) requestAnimationFrame(anim);
            else { setDone(true); setTimeout(onComplete,320); }
          };
          setTimeout(anim,60);
        }
      }
    },100);
  },[onComplete]);

  return (
    <div style={{ ...WRAP, background:'transparent' }}>
      {/* Warm gold glint sparks — embedded in the wood coating */}
      {stars.map((s,i) => (
        <div key={i} style={{
          position:'fixed', left:s.left, top:s.top,
          width:s.size, height:s.size,
          clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          background:'rgba(240,185,70,.72)',
          filter:`drop-shadow(0 0 ${s.size*.6}px rgba(220,160,40,.5))`,
          animation:`_scr_star ${s.dur}s ${s.delay}ms ease-in-out infinite`,
          zIndex:9999, pointerEvents:'none',
        }} />
      ))}

      {/* Progress bar */}
      {pct>0 && (
        <div style={{ position:'fixed',top:0,left:0,right:0,height:3,zIndex:10002 }}>
          <div style={{
            height:'100%', width:`${pct}%`, borderRadius:'0 2px 2px 0',
            background:'linear-gradient(90deg,#c8903a,#e8c060,#d4a040)',
            transition:'width .1s', boxShadow:'0 0 8px rgba(210,160,50,.55)',
          }} />
        </div>
      )}

      {/* Canvas */}
      <canvas ref={cvRef} style={{
        position:'fixed', inset:0, zIndex:10000,
        cursor:'crosshair', touchAction:'none',
        opacity:done?0:1, transition:done?'opacity .4s':'none',
      }}
        onMouseDown={e=>{isDown.current=true;lastP.current=null;const p=getPos(e);if(p)scratchAt(p.x,p.y);}}
        onMouseMove={e=>{if(isDown.current){const p=getPos(e);if(p)scratchAt(p.x,p.y);}}}
        onMouseUp={()=>{isDown.current=false;lastP.current=null;}}
        onMouseLeave={()=>{isDown.current=false;lastP.current=null;}}
        onTouchStart={e=>{e.preventDefault();isDown.current=true;lastP.current=null;const p=getPos(e);if(p)scratchAt(p.x,p.y);}}
        onTouchMove={e=>{e.preventDefault();const p=getPos(e);if(p&&isDown.current)scratchAt(p.x,p.y);}}
        onTouchEnd={()=>{isDown.current=false;lastP.current=null;}}
      />

      {hint && (
        <div style={{ position:'fixed',bottom:52,left:0,right:0,zIndex:10002,textAlign:'center',pointerEvents:'none' }}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:7,
            background:'rgba(0,0,0,.58)',backdropFilter:'blur(10px)',
            borderRadius:20,padding:'8px 18px',
            border:'1px solid rgba(255,255,255,.1)',
            animation:'_hint 2.4s ease-in-out infinite',
          }}>
            <p style={{ margin:0,fontSize:11,letterSpacing:'.12em',color:'#f0d060',fontWeight:500,fontFamily:FS }}>
              Vuốt để cào lộ nội dung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   11. DUST  —  Memory Dust
══════════════════════════════════════════════════════════ */
function DustIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'idle' | 'gathering' | 'revealed';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('gathering');
    setTimeout(() => setPh('revealed'), 1100);
    setTimeout(() => trigger(), 3200);
  }, [ph, fading, trigger]);

  const particles = useMemo(() => [...Array(52)].map((_, i) => {
    const angle = (i / 52) * Math.PI * 2;
    const r = 22 + (i * 23) % 38;
    const left = Math.round(50 + Math.cos(angle) * r * 0.88);
    const top  = Math.round(50 + Math.sin(angle) * r * 0.58);
    return {
      left: `${Math.max(2, Math.min(98, left))}%`,
      top:  `${Math.max(2, Math.min(98, top))}%`,
      gx: `${50 - left}%`, gy: `${50 - top}%`,
      do: (0.18 + (i % 7) * 0.08).toFixed(2),
      size: 2 + (i % 4),
      dur: `${2.0 + (i % 6) * 0.45}s`,
      delay: `${(i * 211) % 3000}ms`,
      gdelay: `${(i * 41) % 700}ms`,
      type: i % 3,
    };
  }), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background: `radial-gradient(ellipse at 50% 50%, ${primaryColor}12 0%, #060308 62%, #030107 100%)`,
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at center,transparent 28%,rgba(0,0,0,.75) 100%)' }} />

      {ph !== 'revealed' && particles.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, top:p.top,
          width:p.size, height:p.size,
          borderRadius: p.type === 2 ? 1 : '50%',
          background: p.type === 1
            ? `radial-gradient(circle,#fff 0%,${primaryColor} 50%,transparent 100%)`
            : `radial-gradient(circle,${primaryColor} 0%,transparent 75%)`,
          boxShadow: `0 0 ${p.size * 4}px ${primaryColor}`,
          transform: 'translate(-50%,-50%)',
          ['--do' as string]: p.do, ['--gx' as string]: p.gx, ['--gy' as string]: p.gy,
          animation: ph === 'idle'
            ? `_dst_float ${p.dur} ${p.delay} ease-in-out infinite`
            : `_dst_gather .85s ${p.gdelay} ${EXPO} forwards`,
        }} />
      ))}

      {ph === 'gathering' && (
        <div style={{
          position:'absolute', left:'50%', top:'50%',
          width:130, height:130, borderRadius:'50%',
          background:`radial-gradient(circle,${primaryColor}cc 0%,${primaryColor}44 40%,transparent 70%)`,
          animation:`_dst_glow .75s .72s ${EXPO} both`,
          pointerEvents:'none',
        }} />
      )}

      {ph === 'revealed' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:18,
          padding:'0 28px',textAlign:'center',animation:`_dst_mem .65s ${SPR} both` }}>
          {imageUrl ? (
            <div style={{ width:112,height:112,borderRadius:'50%',overflow:'hidden',
              boxShadow:`0 0 48px ${primaryColor}66,0 0 80px ${primaryColor}28`,
              border:`2px solid ${primaryColor}55` }}>
              <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
            </div>
          ) : (
            <div style={{ width:88,height:88,borderRadius:'50%',
              background:`radial-gradient(circle,${primaryColor}44 0%,transparent 70%)`,
              boxShadow:`0 0 48px ${primaryColor}66`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:36 }}>✨</div>
          )}
          <p style={{ margin:0,fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',
            textShadow:`0 0 28px ${primaryColor}`,letterSpacing:'.02em' }}>
            {title || '✨ Ký ức của bạn'}
          </p>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
            color:`${primaryColor}88`,fontFamily:FS }}>chạm để xem</p>
        </div>
      )}

      {ph === 'idle' && (
        <div style={{ position:'absolute',bottom:'22%',left:0,right:0,textAlign:'center',
          animation:'_hint 2.6s ease-in-out infinite',pointerEvents:'none' }}>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.26em',textTransform:'uppercase',
            color:`${primaryColor}55`,fontFamily:FS }}>chạm để hội tụ ký ức</p>
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   12. VOICE  —  Voice Message
══════════════════════════════════════════════════════════ */
function VoiceIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'idle' | 'playing' | 'revealed';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('playing');
    setTimeout(() => setPh('revealed'), 2600);
    setTimeout(() => trigger(), 4500);
  }, [ph, fading, trigger]);

  const bars = useMemo(() => [...Array(30)].map((_, i) => {
    const h = 6 + ((i * 37 + 11) % 36);
    return {
      idleH: h,
      bh: (0.1 + (h / 44) * 0.8).toFixed(3),
      dur: `${0.30 + (i % 7) * 0.06}s`,
      delay: `${(i * 53) % 460}ms`,
    };
  }), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'#060810',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:`radial-gradient(ellipse at 50% 44%,${primaryColor}10 0%,transparent 60%)` }} />

      {/* Blurred bg image */}
      {imageUrl && (
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:`url(${imageUrl})`,
          backgroundSize:'cover',backgroundPosition:'center',
          filter: ph === 'revealed' ? 'blur(0px) brightness(.65)' : 'blur(22px) brightness(.22)',
          transition: ph === 'revealed' ? 'filter 1.1s ease' : 'none',
          transform:'scale(1.08)',
        }} />
      )}
      {ph !== 'revealed' && (
        <div style={{ position:'absolute',inset:0,background:'rgba(6,8,16,.86)',pointerEvents:'none' }} />
      )}

      {ph !== 'revealed' && (
        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',
          alignItems:'center',gap:18,width:'72%' }}>
          {/* Avatar */}
          <div style={{ width:72,height:72,borderRadius:'50%',overflow:'hidden',
            border:`2px solid ${primaryColor}44`,flexShrink:0,
            animation:'_vox_pulse 2.2s ease-in-out infinite' }}>
            {imageUrl
              ? <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',
                  filter:ph==='playing'?'none':'blur(8px)',transition:'filter .7s' }} />
              : <div style={{ width:'100%',height:'100%',background:`radial-gradient(circle,${primaryColor}22 0%,transparent 70%)`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>💌</div>
            }
          </div>
          {/* Title */}
          <p style={{ margin:0,fontSize:13,fontFamily:FD,color:'rgba(255,255,255,.82)',
            letterSpacing:'.01em',textAlign:'center' }}>
            {title || 'Tin nhắn thoại'}
          </p>
          {/* Waveform */}
          <div style={{ display:'flex',alignItems:'flex-end',gap:2,height:44,width:'100%' }}>
            {bars.map((bar, i) => (
              <div key={i} style={{ flex:1,height:'100%',display:'flex',
                alignItems:'flex-end',justifyContent:'center' }}>
                <div style={{
                  width:'100%',
                  height: ph === 'playing' ? '100%' : `${bar.idleH}px`,
                  borderRadius:2,
                  background: i === 14 || i === 15
                    ? primaryColor
                    : `${primaryColor}${i%3===0?'cc':i%3===1?'88':'aa'}`,
                  transformOrigin:'center',
                  ['--bh' as string]: bar.bh,
                  opacity: ph === 'playing' ? 1 : 0.42,
                  animation: ph === 'playing'
                    ? `_vox_bar ${bar.dur} ${bar.delay} ease-in-out infinite`
                    : 'none',
                }} />
              </div>
            ))}
          </div>
          {ph === 'idle' && (
            <p style={{ margin:0,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
              color:`${primaryColor}66`,fontFamily:FS,animation:'_hint 2.2s ease-in-out infinite' }}>
              chạm để nghe
            </p>
          )}
          {ph === 'playing' && (
            <p style={{ margin:0,fontSize:10,letterSpacing:'.12em',
              color:`${primaryColor}aa`,fontFamily:FS }}>▶ đang phát…</p>
          )}
        </div>
      )}

      {ph === 'revealed' && (
        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',
          alignItems:'center',gap:14,padding:'0 28px',textAlign:'center',
          animation:`_dst_mem .7s ${SPR} both` }}>
          <p style={{ margin:0,fontSize:19,fontFamily:FD,fontWeight:700,color:'#fff',
            textShadow:'0 2px 20px rgba(0,0,0,.8)',letterSpacing:'.02em' }}>
            {title || 'Dành cho bạn'}
          </p>
          <div style={{ width:40,height:1,background:`${primaryColor}88` }} />
          <p style={{ margin:0,fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',
            color:'rgba(255,255,255,.42)',fontFamily:FS }}>chạm để xem</p>
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   13. UNIVERSE  —  Cinematic Galaxy
══════════════════════════════════════════════════════════ */
function UniverseIntro({ onComplete, primaryColor, accentColor, title, imageUrl }: BaseProps) {
  type Ph = 'void' | 'emerging' | 'drifting' | 'converging' | 'blooming';
  const [ph, setPh]  = useState<Ph>('void');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const stRef  = useRef<{ ph: Ph; t0emerge: number; t0conv: number; t0bloom: number }>(
    { ph: 'void', t0emerge: 0, t0conv: 0, t0bloom: 0 },
  );
  const rafRef = useRef<number>(0);

  const tap = useCallback(() => {
    if (stRef.current.ph !== 'drifting' || fading) return;
    stRef.current.ph     = 'converging';
    stRef.current.t0conv = performance.now();
    setPh('converging');
    setTimeout(() => {
      stRef.current.ph      = 'blooming';
      stRef.current.t0bloom = performance.now();
      setPh('blooming');
    }, 1950);
    setTimeout(() => trigger(), 4700);
  }, [fading, trigger]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W  = cv.width  = window.innerWidth;
    const H  = cv.height = window.innerHeight;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const cx = W / 2, cy = H / 2;
    const R  = (a: number, b: number) => a + Math.random() * (b - a); // range helper

    /* ── Phase auto-sequence ── */
    const tE = setTimeout(() => {
      stRef.current.t0emerge = performance.now();
      stRef.current.ph       = 'emerging';
      setPh('emerging');
    }, 750);
    const tD = setTimeout(() => {
      if (stRef.current.ph === 'void' || stRef.current.ph === 'emerging') {
        stRef.current.ph = 'drifting';
        setPh('drifting');
      }
    }, 5200);

    /* ── Colors ── */
    const hex2rgb = (h: string): [number,number,number] => {
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h ?? '');
      return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [99,102,241];
    };
    const K = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
    const [pr, pg, pb] = hex2rgb(primaryColor ?? '#6366f1');
    const [ar, ag, ab] = hex2rgb(accentColor  ?? '#a5b4fc');

    /* ── Stars ── */
    interface Star {
      bx:number; by:number; vx:number; vy:number;
      r:number; baseA:number; tAmp:number; tSpd:number; tPh:number;
      cr:number; cg:number; cb:number; layer:number;
      birth:number; fadeD:number;  // fade-in timing (ms from canvas start)
    }
    const stars: Star[] = [];

    /* Galaxy spiral arms — 2 × 80 = 160 */
    for (let i = 0; i < 160; i++) {
      const arm  = i & 1;
      const frac = (i >> 1) / 80;
      const t    = frac * Math.PI * 3.6 + arm * Math.PI;
      const dist = 18 + frac * Math.max(W, H) * 0.46;
      const sc   = R(-1, 1) * dist * 0.30; const jt = R(-9, 9);
      stars.push({
        bx: Math.cos(t) * (dist + sc) + jt, by: Math.sin(t) * (dist + sc) * 0.58 + jt * 0.5,
        vx: R(-0.036, 0.036), vy: R(-0.022, 0.022),
        r: R(0.7, 2.3), baseA: R(0.35, 0.88), tAmp: R(0.18, 0.60), tSpd: R(0.5, 2.1), tPh: R(0, Math.PI*2),
        cr: K(200+R(0,55)), cg: K(215+R(0,40)), cb: 255, layer: 1,
        birth: R(1100, 4600), fadeD: R(600, 1200),
      });
    }
    /* Bright foreground — 90 */
    for (let i = 0; i < 90; i++) {
      const a = Math.random()*Math.PI*2; const d = R(20, Math.max(W,H)*0.62);
      stars.push({
        bx: Math.cos(a)*d, by: Math.sin(a)*d*0.80,
        vx: R(-0.058, 0.058), vy: R(-0.036, 0.036),
        r: R(1.4, 3.3), baseA: R(0.50, 0.98), tAmp: R(0.28, 0.55), tSpd: R(0.6, 2.5), tPh: R(0,Math.PI*2),
        cr: K(pr+70+R(0,85)), cg: K(pg+55+R(0,85)), cb: K(pb+30+R(0,75)), layer: 2,
        birth: R(1400, 5000), fadeD: R(700, 1300),
      });
    }
    /* Mid stars — 195 */
    for (let i = 0; i < 195; i++) {
      const a = Math.random()*Math.PI*2; const d = Math.random()*Math.max(W,H)*0.74;
      stars.push({
        bx: Math.cos(a)*d, by: Math.sin(a)*d*0.86,
        vx: R(-0.022, 0.022), vy: R(-0.014, 0.014),
        r: R(0.38, 1.0), baseA: R(0.15, 0.42), tAmp: R(0.08, 0.22), tSpd: R(0.3, 1.2), tPh: R(0,Math.PI*2),
        cr: K(185+R(0,70)), cg: K(192+R(0,63)), cb: K(210+R(0,45)), layer: 1,
        birth: R(600, 4000), fadeD: R(500, 1000),
      });
    }
    /* Deep background — 210 */
    for (let i = 0; i < 210; i++) {
      stars.push({
        bx: R(-1,1)*W*1.55, by: R(-1,1)*H*1.55,
        vx: R(-0.007, 0.007), vy: R(-0.004, 0.004),
        r: R(0.15, 0.55), baseA: R(0.04, 0.15), tAmp: R(0.02, 0.06), tSpd: R(0.08, 0.5), tPh: R(0,Math.PI*2),
        cr: K(175+R(0,80)), cg: K(188+R(0,67)), cb: K(212+R(0,43)), layer: 0,
        birth: R(300, 3800), fadeD: R(400, 1000),
      });
    }

    /* ── Shooting stars ── */
    interface Shoot { x:number;y:number;dx:number;dy:number;len:number;alpha:number;life:number;maxLife:number; }
    const shoots: Shoot[] = [];
    let shootTimer = R(1800, 3200);
    const spawnShoot = () => {
      const ang = R(-0.55, -0.10); const spd = R(7, 15);
      shoots.push({ x: R(0.03, 0.58)*W, y: R(0, 0.52)*H,
        dx: Math.cos(ang)*spd, dy: Math.sin(ang)*spd + R(1, 3),
        len: R(60, 135), alpha: R(0.65, 1), life: 0, maxLife: R(28, 52) });
    };

    /* ── Nebulae ── */
    const nebulae = [
      { x:W*0.12, y:H*0.17, rx:W*0.30, ry:H*0.18, r:pr,          g:pg,          b:pb,           a:0.062 },
      { x:W*0.82, y:H*0.11, rx:W*0.24, ry:H*0.15, r:ar,          g:ag,          b:ab,           a:0.050 },
      { x:W*0.06, y:H*0.66, rx:W*0.26, ry:H*0.16, r:K(pr+25),    g:K(pg+15),    b:K(pb+85),     a:0.055 },
      { x:W*0.87, y:H*0.72, rx:W*0.28, ry:H*0.18, r:K(ar-15),    g:K(ag+50),    b:K(ab+8),      a:0.060 },
      { x:W*0.50, y:H*0.50, rx:W*0.38, ry:H*0.26, r:pr,          g:pg,          b:pb,           a:0.032 },
      { x:W*0.30, y:H*0.78, rx:W*0.20, ry:H*0.14, r:K(pr-20),    g:K(pg+38),    b:K(pb+65),     a:0.042 },
      { x:W*0.68, y:H*0.32, rx:W*0.18, ry:H*0.12, r:K(ar+10),    g:K(ag-10),    b:K(ab+30),     a:0.038 },
    ];

    /* ── Milky Way cluster blobs ── */
    const mwBlobs = Array.from({ length: 200 }, (_, i) => {
      const t = i / 200;
      return { x: R(-0.08, 0.08)*W + t*W, y: R(-0.06, 0.06)*H + t*H*0.52 + H*0.14, r: R(1, 6), a: R(0.003, 0.016) };
    });

    /* ── God ray angles (converging) ── */
    const rays = Array.from({ length: 14 }, () => ({ angle: R(0, Math.PI*2), width: R(5, 16), alpha: R(0.10, 0.25) }));

    /* ── Dust motes ── */
    const motes = Array.from({ length: 78 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: R(0.28, 0.88), a: R(0.018, 0.068), vx: R(-0.09, 0.09), vy: R(-0.075, -0.018),
    }));

    /* ── Core micro-stars (center cluster) ── */
    const coreStars = Array.from({ length: 36 }, (_, i) => {
      const ang = (i/36)*Math.PI*2; const d = R(3, 28);
      return { x: cx+Math.cos(ang)*d, y: cy+Math.sin(ang)*d*0.65, r: R(0.3, 1.8), a: R(0.20, 0.58), ph: R(0,Math.PI*2) };
    });

    /* ── Camera drift coefficients ── */
    const CAM = { ax:22, ay:14, f1:0.000096, f2:0.000138, f3:0.000110, f4:0.000083, zAmp:0.016, zF:0.000064 };

    let prevNow = performance.now();
    let t0: number | null = null;
    let mounted = true;

    const draw = (now: number) => {
      if (!mounted) return;
      if (t0 === null) t0 = now;
      const ms  = now - t0;
      const dt  = Math.min(now - prevNow, 50); prevNow = now;
      const { ph: curPh, t0emerge, t0conv, t0bloom } = stRef.current;

      /* Emergence progress (0→1 over 4.5s from first star appearing) */
      const emergeT  = t0emerge > 0 ? Math.min(1, (now - t0emerge) / 4200) : 0;
      /* Convergence ease-in³: slow start → dramatic rush */
      const convRaw  = curPh === 'converging' ? Math.min(1, (now - t0conv) / 1900)
                     : curPh === 'blooming'   ? 1 : 0;
      const convE    = convRaw * convRaw * convRaw;
      /* Bloom dark-overlay alpha */
      const blA      = curPh === 'blooming' ? Math.min(0.93, (now - t0bloom) / 700) : 0;
      /* Cinematic camera drift (fades out during convergence) */
      const camMult  = curPh === 'converging' ? Math.max(0, 1 - convE * 2.4)
                     : curPh === 'blooming'   ? 0 : 1;
      const camX     = (CAM.ax*Math.sin(ms*CAM.f1) + CAM.ax*0.38*Math.cos(ms*CAM.f2)) * camMult;
      const camY     = (CAM.ay*Math.cos(ms*CAM.f3) + CAM.ay*0.28*Math.sin(ms*CAM.f4)) * camMult;
      const camZ     = 1 + CAM.zAmp*Math.sin(ms*CAM.zF);

      ctx.clearRect(0, 0, W, H);

      /* ── Deep space background ── */
      const bg = ctx.createRadialGradient(cx, cy*0.88, 0, cx, cy, Math.max(W,H)*0.92);
      bg.addColorStop(0,    `rgba(${pr>>1},${pg>>1},${pb>>1},0.18)`);
      bg.addColorStop(0.18, 'rgba(4,2,10,1)');
      bg.addColorStop(0.52, 'rgba(2,1,7,1)');
      bg.addColorStop(1,    'rgba(1,0,4,1)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* ── Milky Way band ── */
      const mwVis = Math.min(1, emergeT * 1.6);
      if (mwVis > 0) {
        for (const b of mwBlobs) {
          ctx.beginPath(); ctx.arc(b.x + camX*0.08, b.y + camY*0.08, b.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${(b.a * mwVis).toFixed(4)})`; ctx.fill();
        }
        const mwG = ctx.createLinearGradient(0, H*0.08, W, H*0.92);
        mwG.addColorStop(0,    'rgba(255,255,255,0)');
        mwG.addColorStop(0.30, `rgba(${pr},${pg},${pb},${(0.022*mwVis).toFixed(4)})`);
        mwG.addColorStop(0.50, `rgba(${ar},${ag},${ab},${(0.034*mwVis).toFixed(4)})`);
        mwG.addColorStop(0.70, `rgba(${pr},${pg},${pb},${(0.020*mwVis).toFixed(4)})`);
        mwG.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.fillStyle = mwG; ctx.fillRect(0, 0, W, H);
      }

      /* ── Nebulae ── */
      const nebVis = Math.min(1, emergeT * 2.0);
      for (const n of nebulae) {
        const pulse = 1 + 0.028 * Math.sin(ms*0.000422 + n.x*0.011);
        ctx.save();
        ctx.translate(n.x + camX*0.14, n.y + camY*0.14);
        ctx.scale(pulse, pulse*0.76);
        const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
        ng.addColorStop(0,    `rgba(${n.r},${n.g},${n.b},${(n.a*3.5*nebVis).toFixed(3)})`);
        ng.addColorStop(0.28, `rgba(${n.r},${n.g},${n.b},${(n.a*nebVis).toFixed(3)})`);
        ng.addColorStop(1,    `rgba(${n.r},${n.g},${n.b},0)`);
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.ellipse(0, 0, n.rx, n.ry, Math.PI*0.06, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      /* ── Dust motes (drifting only) ── */
      if (curPh === 'drifting') {
        for (const m of motes) {
          m.x += m.vx; m.y += m.vy;
          if (m.x<0) m.x=W; else if (m.x>W) m.x=0;
          if (m.y<0) m.y=H;
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${m.a.toFixed(3)})`; ctx.fill();
        }
      }

      /* ── Stars ── */
      if (curPh !== 'blooming') {
        for (const s of stars) {
          s.bx += s.vx; s.by += s.vy;
          const bnd = Math.max(W,H)*0.86;
          if (s.bx<-bnd) s.bx=bnd; else if (s.bx>bnd) s.bx=-bnd;
          if (s.by<-bnd) s.by=bnd; else if (s.by>bnd) s.by=-bnd;

          /* Fade-in from birth */
          const age    = ms - s.birth;
          const fadeIn = age < 0 ? 0 : Math.min(1, age / s.fadeD);
          if (fadeIn < 0.005) continue;

          const twink = 1 - s.tAmp + s.tAmp * Math.sin(ms*0.001*s.tSpd + s.tPh);
          const alpha = s.baseA * twink * fadeIn * Math.max(0, 1 - convE*1.22);
          if (alpha < 0.007) continue;

          /* Camera + convergence lerp */
          const lerpF = convE;
          const x = cx + (s.bx*(1-lerpF) + camX) * camZ;
          const y = cy + (s.by*(1-lerpF)*0.90 + camY) * camZ;
          const r = Math.max(0.1, s.r*(1-lerpF*0.92));

          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${alpha.toFixed(3)})`; ctx.fill();

          /* 4-point sparkle cross on bright foreground stars */
          if (s.layer === 2 && s.r > 1.6 && alpha > 0.22) {
            const span = r*(2.1 + twink*0.8);
            ctx.strokeStyle = `rgba(${s.cr},${s.cg},${s.cb},${(alpha*0.28).toFixed(3)})`;
            ctx.lineWidth   = 0.50;
            ctx.beginPath();
            ctx.moveTo(x-span,y); ctx.lineTo(x+span,y);
            ctx.moveTo(x,y-span); ctx.lineTo(x,y+span);
            ctx.stroke();
          }
        }
      }

      /* ── Core micro-stars (idle/emerging) ── */
      if (curPh === 'drifting' || curPh === 'emerging') {
        const cVis = Math.min(1, emergeT * 2.5);
        for (const s of coreStars) {
          const a = s.a * cVis * (0.48 + 0.52*Math.sin(ms*0.0024 + s.ph));
          ctx.beginPath(); ctx.arc(s.x + camX*0.2, s.y + camY*0.2, s.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${a.toFixed(3)})`; ctx.fill();
        }
      }

      /* ── Shooting stars ── */
      if (curPh === 'drifting') {
        shootTimer -= dt;
        if (shootTimer <= 0) { spawnShoot(); shootTimer = R(1500, 2900); }
        for (let i = shoots.length-1; i >= 0; i--) {
          const sh = shoots[i];
          sh.x += sh.dx; sh.y += sh.dy; sh.life++;
          if (sh.life > sh.maxLife) { shoots.splice(i,1); continue; }
          const prog = sh.life / sh.maxLife;
          const sa   = sh.alpha * (1-prog);
          const mag  = Math.hypot(sh.dx, sh.dy);
          const tx   = sh.x - (sh.dx/mag)*sh.len;
          const ty   = sh.y - (sh.dy/mag)*sh.len;
          const grd  = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
          grd.addColorStop(0,    `rgba(255,255,255,${sa.toFixed(3)})`);
          grd.addColorStop(0.20, `rgba(${ar},${ag},${ab},${(sa*0.55).toFixed(3)})`);
          grd.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
          ctx.strokeStyle = grd; ctx.lineWidth = Math.max(0.3, 1.5-prog); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(sh.x,sh.y); ctx.lineTo(tx,ty); ctx.stroke();
        }
      }

      /* ── God rays — volumetric light during convergence ── */
      if (curPh === 'converging' && convE > 0.04) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rA = Math.min(1, (convE-0.04) * 1.8);
        for (const ray of rays) {
          const a = ray.alpha * rA;
          if (a < 0.005) continue;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ray.angle + ms*0.000032);
          const len = Math.max(W, H) * 1.5;
          const grd = ctx.createLinearGradient(0, 0, 0, -len);
          grd.addColorStop(0,    `rgba(${pr},${pg},${pb},${a.toFixed(3)})`);
          grd.addColorStop(0.30, `rgba(${pr},${pg},${pb},${(a*0.38).toFixed(3)})`);
          grd.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.moveTo(-ray.width, 0);
          ctx.lineTo(-ray.width*0.08, -len);
          ctx.lineTo(ray.width*0.08, -len);
          ctx.lineTo(ray.width, 0);
          ctx.fill();
          ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      /* ── Convergence energy bloom ── */
      if (curPh === 'converging') {
        const bloomR = 4 + convE*Math.max(W,H)*0.72;
        const bInt   = Math.min(0.96, convE*2.1);
        const bl = ctx.createRadialGradient(cx,cy,0, cx,cy,bloomR);
        bl.addColorStop(0,    `rgba(255,255,255,${Math.min(1,convE*3.2).toFixed(3)})`);
        bl.addColorStop(0.04, `rgba(${pr},${pg},${pb},${bInt.toFixed(3)})`);
        bl.addColorStop(0.24, `rgba(${pr},${pg},${pb},${(bInt*0.38).toFixed(3)})`);
        bl.addColorStop(0.56, `rgba(${pr},${pg},${pb},${(bInt*0.08).toFixed(3)})`);
        bl.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
        ctx.fillStyle = bl;
        ctx.beginPath(); ctx.arc(cx,cy,bloomR,0,Math.PI*2); ctx.fill();
        if (convE > 0.25) {
          const rR = bloomR*0.34;
          const rg = ctx.createRadialGradient(cx,cy,0, cx,cy,rR);
          rg.addColorStop(0, `rgba(${ar},${ag},${ab},${((convE-0.25)*0.62*1.4).toFixed(3)})`);
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(cx,cy,rR,0,Math.PI*2); ctx.fill();
        }
      }

      /* ── Blooming: fade to darkness + residual glow ── */
      if (curPh === 'blooming') {
        ctx.fillStyle = `rgba(1,0,4,${blA.toFixed(3)})`; ctx.fillRect(0,0,W,H);
        const halo = ctx.createRadialGradient(cx,cy,0, cx,cy,Math.max(W,H)*0.58);
        halo.addColorStop(0,    `rgba(${pr},${pg},${pb},${(0.15*(1-blA)).toFixed(3)})`);
        halo.addColorStop(0.36, `rgba(${pr},${pg},${pb},${(0.04*(1-blA)).toFixed(3)})`);
        halo.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = halo; ctx.fillRect(0,0,W,H);
      }

      /* ── Void: black overlay that fades out at start ── */
      const voidA = Math.max(0, 1 - ms / 2200);
      if (voidA > 0) { ctx.fillStyle = `rgba(0,0,0,${voidA.toFixed(3)})`; ctx.fillRect(0,0,W,H); }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(tE);
      clearTimeout(tD);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={tap}
      style={{ ...WRAP, cursor: ph === 'drifting' ? 'pointer' : 'default', background:'#000000', ...fs }}
    >
      {/* ── Cinematic galaxy canvas ── */}
      <canvas ref={cvRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      {/* ── Convergence energy ring ── */}
      {ph === 'converging' && (
        <div style={{
          position:'absolute', left:'50%', top:'50%', marginLeft:-135, marginTop:-135,
          width:270, height:270, borderRadius:'50%', zIndex:2, pointerEvents:'none',
          border:`1.5px solid ${primaryColor}50`,
          animation:`_gal_ring 1.95s ${EXPO} forwards`,
        }} />
      )}

      {/* ── Cinematic bloom reveal ── */}
      {ph === 'blooming' && (<>
        {/* Three expanding corona rings at staggered sizes */}
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-165, marginTop:-165,
          width:330, height:330, borderRadius:'50%', border:`1px solid ${primaryColor}25`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 2.7s ${EXPO} both` }} />
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-115, marginTop:-115,
          width:230, height:230, borderRadius:'50%', border:`1px solid ${primaryColor}45`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 2.15s .14s ${EXPO} both` }} />
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-76, marginTop:-76,
          width:152, height:152, borderRadius:'50%', border:`1px solid ${primaryColor}65`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 1.80s .26s ${EXPO} both` }} />

        {/* Memory content */}
        <div style={{ position:'relative', zIndex:3, display:'flex', flexDirection:'column',
          alignItems:'center', gap:20, padding:'0 32px', textAlign:'center' }}>

          {imageUrl && (
            <div style={{ position:'relative', flexShrink:0 }}>
              {/* Outer ambient glow */}
              <div style={{
                position:'absolute', inset:-18, borderRadius:'50%', pointerEvents:'none',
                background:`radial-gradient(circle,${primaryColor}1e 30%,transparent 72%)`,
                animation:`_float 4s ease-in-out infinite`,
              }} />
              {/* Photo */}
              <div style={{
                width:130, height:130, borderRadius:'50%', overflow:'hidden',
                border:`2.5px solid ${primaryColor}80`,
                boxShadow:`0 0 0 8px ${primaryColor}12,0 0 72px ${primaryColor}68,0 0 160px ${primaryColor}25`,
                animation:`_gal_rise .92s .20s ${EXPO} both`, position:'relative', zIndex:2,
              }}>
                <img
                  src={imageUrl} alt=""
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                    filter:'brightness(1.06) contrast(1.04) saturate(1.10)' }}
                />
              </div>
            </div>
          )}

          <p style={{
            margin:0, fontSize:21, fontFamily:FD, fontWeight:700, color:'#ffffff',
            letterSpacing:'.03em', lineHeight:1.28,
            textShadow:`0 0 52px ${primaryColor},0 0 110px ${primaryColor}50,0 2px 20px rgba(0,0,0,.85)`,
            animation:`_gal_rise .88s .48s ${EXPO} both`,
          }}>
            {title || '🌌 Ký ức vũ trụ'}
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:10, width:'60%',
            animation:`_gal_rise .78s .64s ${EXPO} both` }}>
            <div style={{ flex:1, height:'.5px', background:`linear-gradient(to right,transparent,${primaryColor}58)` }} />
            <span style={{ color:`${primaryColor}88`, fontSize:9, lineHeight:1 }}>✦</span>
            <div style={{ flex:1, height:'.5px', background:`linear-gradient(to left,transparent,${primaryColor}58)` }} />
          </div>

          <p style={{ margin:0, fontSize:9, letterSpacing:'.30em', textTransform:'uppercase',
            color:`${primaryColor}58`, fontFamily:FS,
            animation:`_gal_rise .72s .80s ${EXPO} both` }}>
            chạm để xem
          </p>
        </div>
      </>)}

      {/* ── Tap prompt (only when galaxy is ready) ── */}
      {ph === 'drifting' && (
        <div style={{ position:'absolute', bottom:'18%', left:0, right:0, zIndex:2,
          textAlign:'center', pointerEvents:'none', animation:'_hint 3.4s ease-in-out infinite' }}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:1, height:30,
              background:`linear-gradient(to bottom,transparent,${primaryColor}38)` }} />
            <p style={{ margin:0, fontSize:9, letterSpacing:'.30em', textTransform:'uppercase',
              color:`${primaryColor}46`, fontFamily:FS }}>chạm để hội tụ</p>
          </div>
        </div>
      )}

      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   14. REEL  —  Cinema Reel
══════════════════════════════════════════════════════════ */
function ReelIntro({ onComplete, primaryColor, title }: BaseProps) {
  type Ph = 'idle' | 'counting' | 'projecting';
  const [ph, setPh] = useState<Ph>('idle');
  const [count, setCount] = useState(3);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('counting');
    setTimeout(() => setCount(2), 900);
    setTimeout(() => setCount(1), 1800);
    setTimeout(() => { setPh('projecting'); setCount(0); }, 2700);
    setTimeout(() => trigger(), 4600);
  }, [ph, fading, trigger]);

  const sprockets = useMemo(() => [...Array(6)].map((_, i) => ({ t: 8 + i * 16 })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'#040404',
      ...fs,
    }}>
      {/* Film strip chrome + grain */}
      {ph !== 'projecting' && (
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',
          animation: ph === 'counting' ? `_rl_flicker 1.5s steps(1) infinite` : 'none' }}>
          {sprockets.map((s, i) => (
            <div key={`L${i}`} style={{ position:'absolute',left:6,top:`${s.t}%`,
              width:10,height:14,border:'1.5px solid rgba(255,255,255,.18)',
              borderRadius:2,background:'rgba(0,0,0,.75)' }} />
          ))}
          {sprockets.map((s, i) => (
            <div key={`R${i}`} style={{ position:'absolute',right:6,top:`${s.t}%`,
              width:10,height:14,border:'1.5px solid rgba(255,255,255,.18)',
              borderRadius:2,background:'rgba(0,0,0,.75)' }} />
          ))}
          <div style={{ position:'absolute',inset:0,opacity:.038,
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation:'_cdn_grain .48s steps(1) infinite' }} />
          <div style={{ position:'absolute',inset:0,
            background:'radial-gradient(ellipse at center,rgba(255,180,80,.04) 0%,rgba(20,10,4,.38) 100%)',
            mixBlendMode:'multiply' as const }} />
        </div>
      )}

      {/* Countdown */}
      {ph === 'counting' && count > 0 && (
        <div style={{ position:'relative',zIndex:5,textAlign:'center' }}>
          <svg width="110" height="110" style={{ position:'absolute',inset:0 }}>
            <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2"/>
            {[...Array(12)].map((_, i) => (
              <line key={i}
                x1={55 + 48 * Math.cos(i / 12 * Math.PI * 2 - Math.PI / 2)}
                y1={55 + 48 * Math.sin(i / 12 * Math.PI * 2 - Math.PI / 2)}
                x2={55 + (i % 3 === 0 ? 38 : 42) * Math.cos(i / 12 * Math.PI * 2 - Math.PI / 2)}
                y2={55 + (i % 3 === 0 ? 38 : 42) * Math.sin(i / 12 * Math.PI * 2 - Math.PI / 2)}
                stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
            ))}
          </svg>
          <div style={{ width:110,height:110,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span key={count} style={{ fontSize:56,fontWeight:900,color:'#fff',
              fontFamily:'Georgia,serif',textShadow:'0 0 28px rgba(255,255,255,.38)',
              animation:`_rl_num .85s ${EXPO} both` }}>{count}</span>
          </div>
          <div style={{ position:'absolute',left:0,right:0,height:2,top:0,
            background:'rgba(255,255,255,.16)',
            animation:`_rl_scan 1.8s linear infinite` }} />
        </div>
      )}

      {/* Idle: clapboard + prompt */}
      {ph === 'idle' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16,zIndex:2 }}>
          <div style={{ position:'relative',width:60,height:48 }}>
            <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1e1e1e,#2e2e2e)',
              borderRadius:3,border:'2px solid #484848',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ fontSize:18,color:'rgba(255,255,255,.4)' }}>▶</span>
            </div>
            <div style={{ position:'absolute',top:-11,left:-2,right:-2,height:13,
              background:'repeating-linear-gradient(90deg,#f0f0f0 0,#f0f0f0 9px,#111 9px,#111 18px)',
              borderRadius:'2px 2px 0 0',border:'1.5px solid #484848',borderBottom:'none',
              transform:'rotate(-7deg)',transformOrigin:'bottom left' }} />
          </div>
          <p style={{ margin:0,fontSize:14,fontFamily:FD,color:'rgba(255,255,255,.68)',
            letterSpacing:'.02em' }}>{title || 'Ký ức điện ảnh'}</p>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.26em',textTransform:'uppercase',
            color:'rgba(255,255,255,.22)',fontFamily:FS,animation:'_hint 2.4s ease-in-out infinite' }}>
            chạm để chiếu phim
          </p>
        </div>
      )}

      {/* Projector beam reveal */}
      {ph === 'projecting' && (
        <>
          <div style={{ position:'absolute',inset:0,
            background:`linear-gradient(180deg,${primaryColor}28 0%,rgba(0,0,0,.2) 55%,rgba(0,0,0,.5) 100%)`,
            animation:`_rl_beam 1.1s ${EXPO} both`,pointerEvents:'none' }} />
          <div style={{ position:'relative',zIndex:5,display:'flex',flexDirection:'column',
            alignItems:'center',gap:14,padding:'0 24px',textAlign:'center',
            animation:`_dst_mem .65s .85s ${EXPO} both` }}>
            <p style={{ margin:0,fontSize:20,fontFamily:FD,fontWeight:700,color:'#fff',
              letterSpacing:'.015em',
              textShadow:`0 0 40px ${primaryColor},0 2px 14px rgba(0,0,0,.85)` }}>
              {title || '🎬 Khởi chiếu ký ức'}
            </p>
            <div style={{ width:44,height:1,background:`${primaryColor}88` }} />
          </div>
          <div style={{ position:'absolute',left:0,right:0,height:3,top:0,zIndex:6,
            background:`linear-gradient(90deg,transparent,${primaryColor}88,transparent)`,
            animation:`_rl_scan 2.2s linear infinite`,pointerEvents:'none' }} />
        </>
      )}
      <Skip onClick={trigger} dark={ph === 'projecting'} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   15. BOOK  —  Luxury Storybook
══════════════════════════════════════════════════════════ */
function BookIntro({ onComplete, primaryColor, accentColor, title, imageUrl }: BaseProps) {
  type Ph = 'closed' | 'turning' | 'open';
  const [ph, setPh] = useState<Ph>('closed');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'closed' || fading) return;
    setPh('turning');
    setTimeout(() => setPh('open'), 1050);
    setTimeout(() => trigger(), 3400);
  }, [ph, fading, trigger]);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'closed' ? 'pointer' : 'default',
      background:'radial-gradient(ellipse at 46% 50%,#1c1208 0%,#0c0804 55%,#060404 100%)',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 46% 50%,rgba(201,164,83,.07) 0%,transparent 55%)' }} />

      <div style={{ position:'relative',width:220,height:280 }}>
        {/* Drop shadow */}
        <div style={{ position:'absolute',left:10,top:14,width:'100%',height:'100%',
          background:'rgba(0,0,0,.55)',filter:'blur(24px)',borderRadius:6,
          animation: ph !== 'closed' ? `_bk_shadow .9s ${EXPO} forwards` : 'none' }} />

        {/* Page stack */}
        {[3, 2, 1].map(n => (
          <div key={n} style={{ position:'absolute',inset:0,
            background:`hsl(42,${22-n}%,${94-n}%)`,
            borderRadius:'2px 5px 5px 2px',zIndex:n,
            transform:`translateX(${n*2.5}px) translateY(${n*.5}px)`,
            boxShadow:'1px 1px 4px rgba(0,0,0,.14)' }} />
        ))}

        {/* Inside endpaper */}
        {(ph === 'turning' || ph === 'open') && (
          <div style={{ position:'absolute',inset:0,zIndex:8,
            background:'linear-gradient(148deg,#fdf9f0 0%,#f5ede0 100%)',
            borderRadius:'2px 5px 5px 2px',
            display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',padding:22,gap:10,
            boxShadow:'3px 0 26px rgba(0,0,0,.28)',
            animation:`_bk_inner .55s .72s ${EXPO} both` }}>
            <div style={{ position:'absolute',inset:0,opacity:.05,
              backgroundImage:'repeating-linear-gradient(48deg,#c9a453 0,#c9a453 .7px,transparent .7px,transparent 12px),repeating-linear-gradient(-48deg,#c9a453 0,#c9a453 .7px,transparent .7px,transparent 12px)',
              borderRadius:'2px 5px 5px 2px' }} />
            {[12, 17].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,
                border:`1px solid rgba(201,164,83,${(.48-.16*(n/12)).toFixed(2)})`,
                borderRadius:3,pointerEvents:'none' }} />
            ))}
            {imageUrl && (
              <div style={{ width:82,height:82,borderRadius:4,overflow:'hidden',
                border:'1.5px solid rgba(201,164,83,.4)',
                boxShadow:'0 3px 16px rgba(0,0,0,.22)',flexShrink:0 }}>
                <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:5,width:'75%' }}>
              <div style={{ flex:1,height:'.5px',background:'rgba(201,164,83,.5)' }} />
              <span style={{ fontSize:7,color:accentColor,opacity:.75 }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:'rgba(201,164,83,.5)' }} />
            </div>
            <p style={{ margin:0,fontSize:16,fontFamily:FD,fontWeight:700,color:'#2c1808',
              textAlign:'center',lineHeight:1.45 }}>{title || 'Dành cho bạn'}</p>
            <p style={{ margin:0,fontSize:9,fontFamily:FD,fontStyle:'italic',color:'#9a7050',
              letterSpacing:'.04em' }}>một trang ký ức đặc biệt</p>
          </div>
        )}

        {/* Book cover — flips away */}
        <div style={{ position:'absolute',inset:0,zIndex:10,
          transformOrigin:'left center',
          backfaceVisibility:'hidden',
          WebkitBackfaceVisibility:'hidden' as const,
          animation: ph !== 'closed' ? `_bk_turn 1.18s ${CIN} forwards` : 'none' }}>
          <div style={{ width:'100%',height:'100%',
            background:`linear-gradient(158deg,${primaryColor} 0%,#180c04 48%,${primaryColor}88 100%)`,
            borderRadius:'2px 5px 5px 2px',
            boxShadow:'7px 7px 38px rgba(0,0,0,.76)',
            display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',padding:26,position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,opacity:.09,
              backgroundImage:'repeating-linear-gradient(35deg,rgba(255,255,255,.07) 0,rgba(255,255,255,.07) .8px,transparent .8px,transparent 7px)' }} />
            {[10, 15, 20].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,
                border:`1px solid rgba(201,164,83,${(.56-.16*(n/10)).toFixed(2)})`,borderRadius:3 }} />
            ))}
            {([{ top:12,left:12 },{ top:12,right:12 },{ bottom:12,left:12 },{ bottom:12,right:12 }] as React.CSSProperties[]).map((pos, i) => (
              <span key={i} style={{ position:'absolute',...pos,color:accentColor,fontSize:11,opacity:.88,
                textShadow:`0 0 6px ${accentColor}` }}>✦</span>
            ))}
            <div style={{ position:'absolute',top:-2,right:30,width:10,height:42,
              background:`linear-gradient(180deg,${accentColor},${accentColor}77)`,
              clipPath:'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)',
              boxShadow:`0 0 8px ${accentColor}44` }} />
            <p style={{ margin:'0 0 10px',fontSize:16,fontWeight:700,color:'#fff',
              fontFamily:FD,textAlign:'center',lineHeight:1.4,
              textShadow:'0 2px 10px rgba(0,0,0,.55)',letterSpacing:'.015em' }}>
              {title || 'Dành cho bạn'}
            </p>
            <div style={{ width:40,height:.75,background:accentColor,opacity:.72 }} />
          </div>
        </div>
      </div>

      {ph === 'closed' && (
        <p style={{ marginTop:26,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
          color:'rgba(201,164,83,.28)',fontFamily:FS,animation:'_hint 2.2s ease-in-out infinite' }}>
          chạm để mở sách
        </p>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   § MAIN EXPORT
══════════════════════════════════════════════════════════ */
export interface IntroOverlayProps {
  introId: string;
  onComplete: () => void;
  primaryColor?: string;
  accentColor?: string;
  title?: string;
  imageUrl?: string;
}

export function IntroOverlay({
  introId,
  onComplete,
  primaryColor = '#c45c8a',
  accentColor  = '#f8b4cc',
  title        = '',
  imageUrl,
}: IntroOverlayProps) {
  const props: BaseProps = { onComplete, primaryColor, accentColor, title, imageUrl };

  if (!introId || introId === 'none') { onComplete(); return null; }

  const map: Record<string, React.ComponentType<BaseProps>> = {
    letter:     LetterIntro,
    curtain:    CurtainIntro,
    polaroid:   PolaroidIntro,
    countdown:  CountdownIntro,
    typewriter: TypewriterIntro,
    rose:       RoseIntro,
    lock:       LockIntro,
    gate:       GateIntro,
    flip:       FlipIntro,
    scratch:    ScratchIntro,
    dust:       DustIntro,
    voice:      VoiceIntro,
    universe:   UniverseIntro,
    reel:       ReelIntro,
    book:       BookIntro,
  };

  const Component = map[introId];
  if (!Component) { onComplete(); return null; }

  return (
    <>
      <style>{CSS}</style>
      <Component {...props} />
    </>
  );
}
