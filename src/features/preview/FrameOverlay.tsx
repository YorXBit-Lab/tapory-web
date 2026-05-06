import type { IFrame } from '@/configs/types';

interface Props { frame: IFrame }

const base = 'pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300';

/* ── Corner bracket helper (for minimal) ── */
function Bracket({ top, right, bottom, left }: {
  top?: number; right?: number; bottom?: number; left?: number;
}) {
  const bt = top    !== undefined ? '2px solid rgba(60,60,80,0.30)' : 'none';
  const bb = bottom !== undefined ? '2px solid rgba(60,60,80,0.30)' : 'none';
  const bl = left   !== undefined ? '2px solid rgba(60,60,80,0.30)' : 'none';
  const br = right  !== undefined ? '2px solid rgba(60,60,80,0.30)' : 'none';
  const radius =
    top !== undefined && left  !== undefined ? '2px 0 0 0' :
    top !== undefined && right !== undefined ? '0 2px 0 0' :
    bottom !== undefined && left  !== undefined ? '0 0 0 2px' :
    '0 0 2px 0';
  return (
    <div className="absolute h-5 w-5"
      style={{ top, right, bottom, left, borderTop: bt, borderBottom: bb, borderLeft: bl, borderRight: br, borderRadius: radius }} />
  );
}

/* ── Floral corner rose ── */
function FloralCorner() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path d="M8 62 Q16 38 28 30 Q18 48 8 62Z" fill="rgba(100,175,100,0.48)"/>
      <path d="M30 70 Q25 48 28 30 Q36 54 30 70Z" fill="rgba(130,195,120,0.42)"/>
      <ellipse cx="28" cy="18" rx="10" ry="13" fill="rgba(255,180,198,0.60)"/>
      <ellipse cx="39" cy="28" rx="13" ry="10" fill="rgba(255,155,185,0.55)"/>
      <ellipse cx="28" cy="39" rx="10" ry="13" fill="rgba(255,180,198,0.60)"/>
      <ellipse cx="17" cy="28" rx="13" ry="10" fill="rgba(255,170,193,0.55)"/>
      <circle cx="28" cy="28" r="10" fill="rgba(255,192,203,0.70)"/>
      <circle cx="28" cy="28" r="6"  fill="rgba(255,218,185,0.80)"/>
      <circle cx="28" cy="28" r="3"  fill="rgba(255,238,210,0.88)"/>
    </svg>
  );
}

/* ── Graduation cap ── */
function GradCap() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <polygon points="17,3 32,11 17,19 2,11" fill="rgba(8,8,8,0.88)"/>
      <polygon points="17,3 31,11 17,19 3,11"
        fill="none" stroke="rgba(201,169,60,0.88)" strokeWidth="1.2"/>
      <rect x="23.5" y="11" width="2" height="10" rx="1" fill="rgba(201,169,60,0.82)"/>
      <circle cx="24.5" cy="23" r="2.5" fill="rgba(201,169,60,0.88)"/>
    </svg>
  );
}

/* ── Cute heart ── */
function Heart({ color = 'rgba(255,90,140,0.88)' }: { color?: string }) {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <path d="M11 18 C11 18 2 12 2 6.5 A4.5 4.5 0 0 1 11 4 A4.5 4.5 0 0 1 20 6.5 C20 12 11 18 11 18Z"
        fill={color}/>
    </svg>
  );
}

/* ── Cute star ── */
function Star({ color = 'rgba(255,210,0,0.92)' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <polygon
        points="11,2 13.5,8.5 20.5,8.5 15,13 17,20 11,16 5,20 7,13 1.5,8.5 8.5,8.5"
        fill={color}/>
    </svg>
  );
}

/* ── Luxury ornament ── */
function LuxuryOrnament() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="10" cy="10" r="3.5" fill="none" stroke="rgba(201,169,60,0.75)" strokeWidth="1"/>
      <path d="M 10 13.5 L 10 26" stroke="rgba(201,169,60,0.65)" strokeWidth="1.5" fill="none"/>
      <path d="M 6 19 Q 10 15 14 19" stroke="rgba(201,169,60,0.60)" strokeWidth="1.2" fill="none"/>
      <path d="M 4 10 Q 7 7 10 10" stroke="rgba(201,169,60,0.55)" strokeWidth="1" fill="none"/>
      <path d="M 10 4 Q 13 7 10 10" stroke="rgba(201,169,60,0.55)" strokeWidth="1" fill="none"/>
      {[{ cx:4,cy:4 }, { cx:16,cy:4 }, { cx:4,cy:16 }].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="1.2" fill="rgba(201,169,60,0.58)"/>
      ))}
    </svg>
  );
}

/* ── Geometric corner triangle ── */
function GeometricCorner({ flip }: { flip?: boolean }) {
  const gId = `geo-${flip ? 'r' : 'l'}`;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <defs>
        <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.72"/>
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.45"/>
        </linearGradient>
      </defs>
      <polygon points="0,0 52,0 0,52" fill={`url(#${gId})`} opacity="0.38"/>
      <polyline points="46,0 0,0 0,46" stroke={`url(#${gId})`} strokeWidth="2.5" fill="none"/>
      <polyline points="28,0 0,0 0,28"  stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.45"/>
    </svg>
  );
}

/* ── Rose Gold corner rose ── */
function RoseGoldCorner() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path d="M8 62 Q16 38 28 30 Q18 48 8 62Z" fill="rgba(100,175,100,0.35)"/>
      <path d="M30 70 Q25 48 28 30 Q36 54 30 70Z" fill="rgba(130,195,120,0.30)"/>
      <ellipse cx="28" cy="18" rx="10" ry="13" fill="rgba(210,135,160,0.62)"/>
      <ellipse cx="39" cy="28" rx="13" ry="10" fill="rgba(218,148,173,0.58)"/>
      <ellipse cx="28" cy="39" rx="10" ry="13" fill="rgba(210,135,160,0.62)"/>
      <ellipse cx="17" cy="28" rx="13" ry="10" fill="rgba(215,142,167,0.58)"/>
      <circle cx="28" cy="28" r="10" fill="rgba(232,172,192,0.72)"/>
      <circle cx="28" cy="28" r="6"  fill="rgba(245,204,218,0.82)"/>
      <circle cx="28" cy="28" r="3"  fill="rgba(255,228,234,0.90)"/>
    </svg>
  );
}

/* ── Lace corner (pearl chain + diamond ornament) ── */
function LaceCorner() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
      <path d="M 5 49 Q 15 38 24 27 Q 33 17 45 6"
        stroke="rgba(185,172,158,0.45)" strokeWidth="1" fill="none"
        strokeLinecap="round" strokeDasharray="1.5 4.5"/>
      <circle cx="8"  cy="46" r="2.4" fill="rgba(225,215,205,0.78)" stroke="rgba(200,190,178,0.50)" strokeWidth="0.8"/>
      <circle cx="18" cy="36" r="2.4" fill="rgba(225,215,205,0.78)" stroke="rgba(200,190,178,0.50)" strokeWidth="0.8"/>
      <circle cx="28" cy="26" r="2.4" fill="rgba(225,215,205,0.78)" stroke="rgba(200,190,178,0.50)" strokeWidth="0.8"/>
      <circle cx="38" cy="16" r="2.4" fill="rgba(225,215,205,0.78)" stroke="rgba(200,190,178,0.50)" strokeWidth="0.8"/>
      <circle cx="47" cy="7"  r="2.4" fill="rgba(225,215,205,0.78)" stroke="rgba(200,190,178,0.50)" strokeWidth="0.8"/>
      <path d="M11 18 L15 22 L11 26 L7 22 Z"
        fill="rgba(218,208,195,0.60)" stroke="rgba(188,176,162,0.42)" strokeWidth="0.8"/>
      <circle cx="11" cy="22" r="1.6" fill="rgba(232,224,214,0.72)"/>
      <path d="M22 7 L26 11 L22 15 L18 11 Z"
        fill="rgba(218,208,195,0.55)" stroke="rgba(188,176,162,0.38)" strokeWidth="0.8"/>
      <circle cx="22" cy="11" r="1.6" fill="rgba(232,224,214,0.68)"/>
    </svg>
  );
}

/* ── Botanical corner (eucalyptus branches) ── */
function BotanicalCorner() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
      <path d="M 6 64 Q 22 46 36 30 Q 50 18 63 7"
        stroke="rgba(105,148,95,0.60)" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
      <path d="M 12 56 Q 4 46 10 38 Q 16 32 20 44 Q 18 52 12 56 Z"
        fill="rgba(125,168,106,0.48)"/>
      <path d="M 24 44 Q 30 34 38 34 Q 42 40 36 48 Q 28 52 24 44 Z"
        fill="rgba(135,178,112,0.45)"/>
      <path d="M 38 30 Q 30 20 34 14 Q 40 10 42 20 Q 44 28 38 30 Z"
        fill="rgba(125,168,106,0.48)"/>
      <path d="M 50 20 Q 54 10 62 9 Q 65 16 58 22 Q 52 26 50 20 Z"
        fill="rgba(135,178,112,0.45)"/>
      <ellipse cx="62" cy="7" rx="3.5" ry="6" fill="rgba(142,182,116,0.50)" transform="rotate(-50 62 7)"/>
      <circle cx="18" cy="49" r="2.4" fill="rgba(188,158,132,0.58)"/>
      <circle cx="45" cy="22" r="2"   fill="rgba(188,158,132,0.52)"/>
    </svg>
  );
}

/* ── Vintage flourish ── */
function VintageCorner() {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58">
      <path d="M 7 7 Q 22 7 25 18 Q 30 7 40 11"
        stroke="rgba(139,115,85,0.58)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M 7 7 Q 7 22 18 25 Q 7 30 11 40"
        stroke="rgba(139,115,85,0.58)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <circle cx="7"  cy="7"  r="2.5" fill="rgba(139,115,85,0.62)"/>
      <circle cx="25" cy="18" r="1.8" fill="rgba(175,148,110,0.52)"/>
      <circle cx="18" cy="25" r="1.8" fill="rgba(175,148,110,0.52)"/>
      <path d="M 14 14 Q 18 12 20 15 Q 22 18 18 19"
        stroke="rgba(160,132,95,0.45)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/* ═══════════════════════════���══════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════ */
export function FrameOverlay({ frame }: Props) {
  if (frame.id === 'none') return null;

  /* ── 1. Minimal ── */
  if (frame.id === 'minimal') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{ borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1.5px rgba(50,50,70,0.16)' }}/>
      <div className="absolute" style={{ inset: 9, borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px rgba(50,50,70,0.07)' }}/>
      <Bracket top={10}    left={10}  />
      <Bracket top={10}    right={10} />
      <Bracket bottom={10} left={10}  />
      <Bracket bottom={10} right={10} />
    </div>
  );

  /* ── 2. Floral ── */
  if (frame.id === 'floral') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{ borderRadius: 'inherit', boxShadow: 'inset 0 0 0 2px rgba(190,130,150,0.18)' }}/>
      {/* TL */}
      <div className="absolute top-0 left-0"><FloralCorner/></div>
      {/* TR */}
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><FloralCorner/></div>
      {/* BL */}
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><FloralCorner/></div>
      {/* BR */}
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><FloralCorner/></div>
    </div>
  );

  /* ── 3. Rose Gold ── */
  if (frame.id === 'rose-gold') return (
    <div className={`${base} animate-frame-shimmer`} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 11px rgba(155,80,105,0.86)',
          'inset 0 0 0 12.8px rgba(220,162,183,0.72)',
          'inset 0 0 0 15px rgba(155,80,105,0.20)',
          'inset 0 0 0 16.5px rgba(220,162,183,0.28)',
        ].join(', '),
      }}/>
      <div className="absolute top-0 left-0"><RoseGoldCorner/></div>
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><RoseGoldCorner/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><RoseGoldCorner/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><RoseGoldCorner/></div>
      {(['top-[11px] left-[11px]', 'top-[11px] right-[11px]', 'bottom-[11px] left-[11px]', 'bottom-[11px] right-[11px]'] as const).map((pos, i) => (
        <span key={i} className={`absolute text-[9px] leading-none ${pos}`}
          style={{ color: 'rgba(220,162,183,0.90)', textShadow: '0 0 6px rgba(210,140,165,0.55)' }}>✦</span>
      ))}
    </div>
  );

  /* ── 4. Lace ── */
  if (frame.id === 'lace') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 2px rgba(215,202,188,0.60)',
          'inset 0 0 0 4px rgba(248,244,240,0.85)',
          'inset 0 0 0 6.5px rgba(208,196,182,0.42)',
          'inset 0 0 0 8px rgba(248,244,240,0.50)',
        ].join(', '),
      }}/>
      <div className="absolute top-0 left-0"><LaceCorner/></div>
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><LaceCorner/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><LaceCorner/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><LaceCorner/></div>
      {/* Pearl dots along top & bottom edges */}
      {[25, 37, 50, 63, 75].map(pct => (
        <span key={pct} className="absolute" style={{
          top: 2.5, left: `${pct}%`, transform: 'translateX(-50%)',
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(222,212,200,0.72)',
          boxShadow: '0 0 2px rgba(200,188,174,0.50)',
        }}/>
      ))}
      {[25, 37, 50, 63, 75].map(pct => (
        <span key={pct} className="absolute" style={{
          bottom: 2.5, left: `${pct}%`, transform: 'translateX(-50%)',
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(222,212,200,0.72)',
          boxShadow: '0 0 2px rgba(200,188,174,0.50)',
        }}/>
      ))}
    </div>
  );

  /* ── 5. Botanical ── */
  if (frame.id === 'botanical') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: 'inset 0 0 0 1.5px rgba(110,150,95,0.28)',
      }}/>
      <div className="absolute top-0 left-0"><BotanicalCorner/></div>
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><BotanicalCorner/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><BotanicalCorner/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><BotanicalCorner/></div>
    </div>
  );

  /* ── 6. Graduation ── */
  if (frame.id === 'grad-border') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      {/* Gold double border */}
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 10px rgba(8,8,8,0.84)',
          'inset 0 0 0 11.5px rgba(201,169,60,0.82)',
          'inset 0 0 0 13px rgba(8,8,8,0.20)',
          'inset 0 0 0 14.5px rgba(201,169,60,0.35)',
        ].join(', '),
      }}/>
      {/* Gold top banner — below Dynamic Island (DI: top 10, h 30, safe ≥ 44px) */}
      <div className="absolute inset-x-0 top-[44px] flex items-center justify-center">
        <div style={{ height: 1.5, width: 40, background: 'rgba(201,169,60,0.72)', marginRight: 8 }}/>
        <span style={{ fontSize: 9, color: 'rgba(201,169,60,0.85)', letterSpacing: '0.15em', fontWeight: 600 }}>CONGRATULATIONS</span>
        <div style={{ height: 1.5, width: 40, background: 'rgba(201,169,60,0.72)', marginLeft: 8 }}/>
      </div>
      {/* Corner caps */}
      <div className="absolute" style={{ top: 18, left: 14 }}><GradCap/></div>
      <div className="absolute" style={{ top: 18, right: 14, transform: 'scaleX(-1)' }}><GradCap/></div>
      <div className="absolute" style={{ bottom: 18, left: 14, transform: 'scaleY(-1)' }}><GradCap/></div>
      <div className="absolute" style={{ bottom: 18, right: 14, transform: 'scale(-1,-1)' }}><GradCap/></div>
    </div>
  );

  /* ── 4. Cute ── */
  if (frame.id === 'cute') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 3px rgba(255,100,160,0.55)',
          'inset 0 0 0 7px rgba(255,255,255,0.12)',
          'inset 0 0 0 10px rgba(100,190,240,0.40)',
        ].join(', '),
      }}/>
      {/* Hearts at top */}
      <div className="absolute" style={{ top: 12, left: 14 }}><Heart/></div>
      <div className="absolute" style={{ top: 12, right: 14 }}><Heart color="rgba(255,130,170,0.82)"/></div>
      {/* Stars at bottom */}
      <div className="absolute" style={{ bottom: 12, left: 14 }}><Star/></div>
      <div className="absolute" style={{ bottom: 12, right: 14 }}><Star color="rgba(255,180,50,0.90)"/></div>
      {/* Small accent dots */}
      {[
        { top: 28, left: 6 },   { bottom: 28, left: 6 },
        { top: 28, right: 6 },  { bottom: 28, right: 6 },
      ].map((pos, i) => (
        <div key={i} className="absolute h-1.5 w-1.5 rounded-full"
          style={{ ...pos, backgroundColor: i % 2 === 0 ? 'rgba(255,100,160,0.55)' : 'rgba(100,190,240,0.55)' }}/>
      ))}
    </div>
  );

  /* ── 5. Luxury ── */
  if (frame.id === 'luxury') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 13px rgba(6,6,10,0.90)',
          'inset 0 0 0 14.5px rgba(201,169,60,0.78)',
          'inset 0 0 0 17px rgba(6,6,10,0.22)',
          'inset 0 0 0 18.5px rgba(201,169,60,0.28)',
        ].join(', '),
      }}/>
      {/* Corner ornaments */}
      <div className="absolute top-0 left-0"><LuxuryOrnament/></div>
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><LuxuryOrnament/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><LuxuryOrnament/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><LuxuryOrnament/></div>
      {/* Gold corner sparkles */}
      {(['top-[13px] left-[13px]', 'top-[13px] right-[13px]', 'bottom-[13px] left-[13px]', 'bottom-[13px] right-[13px]'] as const).map((pos, i) => (
        <span key={i} className={`absolute text-[9px] leading-none ${pos}`}
          style={{ color: 'rgba(201,169,60,0.88)', textShadow: '0 0 6px rgba(201,169,60,0.50)' }}>✦</span>
      ))}
    </div>
  );

  /* ── 6. Geometric ── */
  if (frame.id === 'geometric') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: 'inset 0 0 0 1.5px rgba(99,102,241,0.35)',
      }}/>
      {/* Corner triangles */}
      <div className="absolute top-0 left-0"><GeometricCorner/></div>
      <div className="absolute top-0 right-0"><GeometricCorner flip/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><GeometricCorner/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><GeometricCorner/></div>
      {/* Accent edge lines */}
      <div className="absolute inset-x-0 top-0" style={{ height: 1.5, background: 'linear-gradient(90deg,transparent 60px,rgba(99,102,241,0.45) 60px,rgba(168,85,247,0.45) calc(100% - 60px),transparent calc(100% - 60px))' }}/>
      <div className="absolute inset-x-0 bottom-0" style={{ height: 1.5, background: 'linear-gradient(90deg,transparent 60px,rgba(99,102,241,0.45) 60px,rgba(168,85,247,0.45) calc(100% - 60px),transparent calc(100% - 60px))' }}/>
    </div>
  );

  /* ── 7. Vintage ── */
  if (frame.id === 'vintage') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 9px rgba(139,115,85,0.28)',
          'inset 0 0 0 10.5px rgba(212,185,140,0.42)',
          'inset 0 0 0 12.5px rgba(139,115,85,0.16)',
          'inset 0 0 0 14px rgba(212,185,140,0.22)',
        ].join(', '),
      }}/>
      {/* Texture noise overlay */}
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        backgroundImage: 'repeating-linear-gradient(45deg,rgba(139,115,85,0.03) 0px,rgba(139,115,85,0.03) 1px,transparent 1px,transparent 6px)',
      }}/>
      {/* Corner flourishes */}
      <div className="absolute top-0 left-0"><VintageCorner/></div>
      <div className="absolute top-0 right-0" style={{ transform: 'scaleX(-1)' }}><VintageCorner/></div>
      <div className="absolute bottom-0 left-0" style={{ transform: 'scaleY(-1)' }}><VintageCorner/></div>
      <div className="absolute bottom-0 right-0" style={{ transform: 'scale(-1,-1)' }}><VintageCorner/></div>
    </div>
  );

  /* ── 8. 3D Pop-up ── */
  if (frame.id === 'popup') return (
    <div className={base} style={{ borderRadius: 'inherit' }}>
      {/* White paper margin */}
      <div className="absolute inset-0" style={{
        borderRadius: 'inherit',
        boxShadow: [
          'inset 0 0 0 13px rgba(255,255,255,0.95)',
          'inset 0 0 0 14px rgba(0,0,0,0.06)',
          'inset 2px 2px 10px rgba(255,255,255,0.20)',
          'inset -1px -2px 6px rgba(0,0,0,0.06)',
        ].join(', '),
      }}/>
      {/* Paper fold – bottom-right */}
      <div className="absolute bottom-0 right-0" style={{
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 0 28px 28px',
        borderColor: 'transparent transparent rgba(210,205,195,0.90) transparent',
      }}/>
      <div className="absolute bottom-0 right-0" style={{
        width: 28, height: 28,
        background: 'linear-gradient(225deg,rgba(150,145,135,0.35) 0%,transparent 55%)',
      }}/>
      {/* Stacked pages shadow (top-left offset) */}
      <div className="absolute top-0 left-0" style={{
        width: '100%', height: '100%',
        boxShadow: '-4px -5px 0 -2px rgba(230,228,224,0.80), -7px -9px 0 -4px rgba(220,218,212,0.60)',
        borderRadius: 'inherit',
      }}/>
    </div>
  );

  return null;
}
