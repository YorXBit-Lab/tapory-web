'use client';

/**
 * TextureMaterial — Ultra-premium Cinematic Texture & Material System
 *
 * Renders as the LAST child inside `tapory-screen` (position:relative 232×500).
 * Every layer is position:absolute, inset:0, pointer-events:none — pure overlay.
 *
 * Layer stack (lowest → highest):
 *   25 — BloomLayer       (breathing color glow)
 *   26 — MatteNoiseLayer  (universal fine roughness)
 *   27 — PaperLayer       (warm-light themes only)
 *   28 — FilmGrainLayer   (animated A+B cross-fade — "alive" grain)
 *   29 — GlassOverlay     (edge highlights + inner glow)
 *   30 — ChromeEdge       (metallic sweep — luxury themes)
 */

/* ══════════════════════════════════════════════════════════════
   SVG DATA URI TEXTURES
   Using feTurbulence fractalNoise — zero external files.
   Anisotropic baseFrequency (x ≠ y) gives directional fiber feel.
══════════════════════════════════════════════════════════════ */

// Film grain A — default seed, coarser feel
const GRAIN_A = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='_tga'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.64' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23_tga)'/%3E%3C/svg%3E")`;

// Film grain B — seed 37, slightly different texture for cross-fade illusion
const GRAIN_B = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='_tgb'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.64' numOctaves='4' stitchTiles='stitch' seed='37'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23_tgb)'/%3E%3C/svg%3E")`;

// Paper texture — anisotropic (horizontal fibers feel like real paper grain)
const PAPER_TEX = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='_tp'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88 .40' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23_tp)'/%3E%3C/svg%3E")`;

// Matte noise — very fine, near-invisible, universal
const MATTE_TEX = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='_tm'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23_tm)'/%3E%3C/svg%3E")`;

/* ══════════════════════════════════════════════════════════════
   KEYFRAMES — injected once, GPU-only (opacity + transform)
══════════════════════════════════════════════════════════════ */
const KF = `
/* Film grain: two layers cross-fade to simulate moving analog grain */
@keyframes _tm_ga { 0%{opacity:var(--ga0)} 100%{opacity:var(--ga1)} }
@keyframes _tm_gb { 0%{opacity:var(--gb0)} 100%{opacity:var(--gb1)} }

/* Bloom breathing — slow, organic, almost subconscious */
@keyframes _tm_blm { 0%{opacity:.60} 100%{opacity:1} }

/* Chrome sweep — premium metallic shimmer across card */
@keyframes _tm_chr {
  0%   { transform: translateX(-160%) skewX(-18deg); }
  100% { transform: translateX(380%)  skewX(-18deg); }
}

/* Paper pulse — very slow, barely perceptible */
@keyframes _tm_pap { 0%,100%{opacity:var(--pa)} 55%{opacity:calc(var(--pa)*0.72)} }
`;

/* ══════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════ */

/** Relative luminance (0=black, 1=white) from a #rrggbb hex string */
function luminance(hex: string): number {
  if (!hex || hex.length < 7) return 0.5;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Append 2-digit hex alpha to a #rrggbb color → #rrggbbaa */
const alpha = (hex: string, a: number) =>
  hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

/** CSS custom property object (cast to React.CSSProperties) */
const cv = (o: Record<string, string | number>) => o as React.CSSProperties;

/* Which layouts are "paper-appropriate" (warm, light, editorial, physical) */
const PAPER_LAYOUTS = new Set([
  'scrapbook', 'boho', 'floral', 'watercolor', 'romantic', 'pastel',
  'classic', 'academic', 'elegant', 'retro', 'party', 'minimal',
  'editorial', 'clean', 'creative',
]);

/* Which layouts get chrome metallic reflection */
const CHROME_LAYOUTS = new Set([
  'luxury', 'golddark', 'academic', 'elegant', 'classic',
  'vinyl', 'premium', 'cassette', 'dark', 'love', 'film',
]);

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/** Universal matte noise — very fine, removes "sterile UI" flatness */
function MatteNoiseLayer() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: MATTE_TEX,
      opacity: 0.022,
      mixBlendMode: 'overlay' as const,
      pointerEvents: 'none',
      zIndex: 26,
    }} />
  );
}

/** Paper texture — physical luxury print feeling for warm light themes */
function PaperLayer({ strong }: { strong: boolean }) {
  const op = strong ? 0.048 : 0.028;
  return (
    <>
      {/* Main paper grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: PAPER_TEX,
        mixBlendMode: 'multiply' as const,
        pointerEvents: 'none',
        zIndex: 27,
        animation: '_tm_pap 18s ease-in-out infinite',
        ...cv({ '--pa': op }),
      }} />
      {/* Horizontal fiber accent — very faint parallel lines like real paper */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.006) 3px, rgba(0,0,0,0.006) 4px)',
        mixBlendMode: 'multiply' as const,
        pointerEvents: 'none',
        zIndex: 27,
      }} />
    </>
  );
}

/**
 * Animated film grain — two SVG textures with different seeds cross-fade.
 * Net effect: the grain "moves" without canvas or JS per frame.
 */
function FilmGrainLayer({ isDark }: { isDark: boolean }) {
  // Dark themes: grain more visible (contributes to cinematic feel)
  // Light themes: grain almost invisible (just tactile presence)
  const darkA0 = 0.068, darkA1 = 0.032;
  const darkB0 = 0.028, darkB1 = 0.062;
  const liteA0 = 0.035, liteA1 = 0.016;
  const liteB0 = 0.014, liteB1 = 0.032;

  return (
    <>
      {/* Grain layer A */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: GRAIN_A,
        mixBlendMode: 'overlay' as const,
        pointerEvents: 'none',
        zIndex: 28,
        animation: '_tm_ga 4.2s ease-in-out infinite alternate',
        ...cv({
          '--ga0': isDark ? darkA0 : liteA0,
          '--ga1': isDark ? darkA1 : liteA1,
        }),
      }} />
      {/* Grain layer B — opposite phase, different seed */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: GRAIN_B,
        mixBlendMode: 'soft-light' as const,
        pointerEvents: 'none',
        zIndex: 28,
        animation: '_tm_gb 5.8s ease-in-out infinite alternate-reverse',
        ...cv({
          '--gb0': isDark ? darkB0 : liteB0,
          '--gb1': isDark ? darkB1 : liteB1,
        }),
      }} />
    </>
  );
}

/**
 * Glass overlay — physical edge lighting, NOT generic glassmorphism.
 * Simulates light catching the top and left edge of a glass surface.
 */
function GlassOverlay({ isDark }: { isDark: boolean }) {
  const edgeOp  = isDark ? 0.22 : 0.38;
  const innerOp = isDark ? 0.025 : 0.04;
  const bottomOp = isDark ? 0.12 : 0.06;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      zIndex: 29,
    }}>
      {/* Top edge — primary highlight where light catches the glass rim */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,
          transparent 4%,
          rgba(255,255,255,${edgeOp * 0.55}) 18%,
          rgba(255,255,255,${edgeOp}) 48%,
          rgba(255,255,255,${edgeOp * 0.55}) 78%,
          transparent 96%)`,
      }} />
      {/* Inner top glow — diffused light entering the surface */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 56,
        background: `linear-gradient(to bottom, rgba(255,255,255,${innerOp}) 0%, transparent 100%)`,
      }} />
      {/* Left edge rim — side light */}
      <div style={{
        position: 'absolute', top: '8%', left: 0, bottom: '8%', width: 1,
        background: `linear-gradient(to bottom,
          transparent,
          rgba(255,255,255,${edgeOp * 0.50}) 28%,
          rgba(255,255,255,${edgeOp * 0.50}) 72%,
          transparent)`,
      }} />
      {/* Right edge — faint counter-light */}
      <div style={{
        position: 'absolute', top: '15%', right: 0, bottom: '15%', width: 1,
        background: `linear-gradient(to bottom,
          transparent,
          rgba(255,255,255,${edgeOp * 0.18}) 40%,
          rgba(255,255,255,${edgeOp * 0.18}) 60%,
          transparent)`,
      }} />
      {/* Bottom depth — shadow grounding the card */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
        background: `linear-gradient(to top, rgba(0,0,0,${bottomOp}) 0%, transparent 100%)`,
      }} />
      {/* Subtle inner vignette — focuses eye on centre */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 88% 80% at 50% 42%, transparent 55%, rgba(0,0,0,0.06) 100%)',
      }} />
    </div>
  );
}

/**
 * Chrome edge — premium metallic sweep.
 * A diagonal shimmer that passes across the card every ~14s.
 * Feels like light catching a luxury surface.
 */
function ChromeEdge() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 30,
    }}>
      {/* Primary sweep — broad, soft */}
      <div style={{
        position: 'absolute',
        top: '-25%', left: 0,
        width: '28%', height: '150%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.04) 75%, transparent 100%)',
        mixBlendMode: 'screen' as const,
        animation: '_tm_chr 14s cubic-bezier(0.4,0,0.2,1) 1.5s infinite',
      }} />
      {/* Secondary sweep — narrow, sharper highlight */}
      <div style={{
        position: 'absolute',
        top: '-25%', left: 0,
        width: '8%', height: '150%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
        mixBlendMode: 'screen' as const,
        animation: '_tm_chr 14s cubic-bezier(0.4,0,0.2,1) 1.8s infinite',
      }} />
    </div>
  );
}

/**
 * Bloom layer — breathing color glow that brings emotional warmth.
 * Reacts to the style's primary + secondary palette.
 */
function BloomLayer({
  primary, secondary, isDark,
}: { primary: string; secondary: string; isDark: boolean }) {
  const pOp  = isDark ? 0.22 : 0.10;
  const sOp  = isDark ? 0.16 : 0.07;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      zIndex: 25,
      mixBlendMode: 'screen' as const,
    }}>
      {/* Primary bloom — top area, emotional anchor */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 52% at 50% 18%, ${alpha(primary, pOp)} 0%, transparent 68%)`,
        animation: '_tm_blm 7s ease-in-out infinite alternate',
      }} />
      {/* Secondary bloom — lower corner, depth warmth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 55% 40% at 72% 78%, ${alpha(secondary, sOp)} 0%, transparent 65%)`,
        animation: '_tm_blm 9s ease-in-out 3.5s infinite alternate-reverse',
      }} />
      {/* Opposite corner micro-glow — premium bilateral lighting */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 40% 32% at 18% 72%, ${alpha(primary, sOp * 0.7)} 0%, transparent 60%)`,
        animation: '_tm_blm 11s ease-in-out 1.5s infinite alternate',
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */

interface TextureMaterialProps {
  templateId: string;
  layout:     string;
  primary:    string;
  secondary:  string;
  accent:     string; // card background colour
}

export function TextureMaterial({
  templateId, layout, primary, secondary, accent,
}: TextureMaterialProps) {
  const lum      = luminance(accent);
  const isDark   = lum < 0.36;
  const isLight  = lum > 0.55;

  // Paper: warm light themes, not music/social/redirect
  const hasPaper =
    isLight &&
    !['spotify', 'social', 'redirect'].includes(templateId);
  const isPaperStrong = PAPER_LAYOUTS.has(layout);

  // Chrome: luxury/metallic layouts
  const hasChrome = CHROME_LAYOUTS.has(layout);

  return (
    <>
      {/* Inject keyframes once into the document */}
      <style>{KF}</style>

      {/* ── Bloom — emotional warmth (lowest, underneath grain) */}
      <BloomLayer primary={primary} secondary={secondary} isDark={isDark} />

      {/* ── Matte noise — universal tactile roughness */}
      <MatteNoiseLayer />

      {/* ── Paper — warm editorial physical feel */}
      {hasPaper && <PaperLayer strong={isPaperStrong} />}

      {/* ── Film grain — cinematic analog presence */}
      <FilmGrainLayer isDark={isDark} />

      {/* ── Glass overlay — edge lighting / rim highlights */}
      <GlassOverlay isDark={isDark} />

      {/* ── Chrome edge — metallic luxury shimmer */}
      {hasChrome && <ChromeEdge />}
    </>
  );
}
