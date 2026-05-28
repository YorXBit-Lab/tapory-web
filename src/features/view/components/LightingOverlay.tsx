'use client';
import { useRef, useCallback, useEffect } from 'react';
import { useCursorLight } from '../hooks/useCursorLight';
import { getBeat } from '../hooks/useBeatBroadcast';

/*
 * ─── CINEMATIC DYNAMIC LIGHTING SYSTEM ───────────────────────────────────────
 *
 * Layers (all pointer-events:none, z-index:45 — above parallax, below frames):
 *
 *  1. Cursor spotlight   — large soft radial blob that follows cursor/gyro.
 *                          Fades out 2 s after last interaction.
 *  2. Left rim light     — strengthens when cursor is pushed left.
 *  3. Right rim light    — strengthens when cursor is pushed right.
 *  4. Top-edge glow      — volumetric light spill from above when cursor is high.
 *  5. Drift leak 1/2/3   — ambient light pools that slowly breathe and drift,
 *                          always present regardless of interaction.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CSS = `
@keyframes _lgt_d1{
  0%,100%{transform:translate(0,0) scale(1);opacity:.7}
  36%    {transform:translate(7%,5%) scale(1.08);opacity:.9}
  72%    {transform:translate(-4%,8%) scale(.95);opacity:.75}
}
@keyframes _lgt_d2{
  0%,100%{transform:translate(0,0) scale(1);opacity:.65}
  44%    {transform:translate(-6%,-5%) scale(1.07);opacity:.85}
  76%    {transform:translate(4%,-7%) scale(.97);opacity:.7}
}
@keyframes _lgt_d3{
  0%,100%{transform:translate(0,0) scale(1);opacity:.5}
  55%    {transform:translate(5%,-3%) scale(1.05);opacity:.7}
}
`;

interface Props {
  primary:   string;
  secondary: string;
  accent:    string;
}

export function LightingOverlay({ primary, secondary, accent }: Props) {
  const spotRef  = useRef<HTMLDivElement>(null);
  const rimLRef  = useRef<HTMLDivElement>(null);
  const rimRRef  = useRef<HTMLDivElement>(null);
  const edgeTRef = useRef<HTMLDivElement>(null);
  /** Beat-reactive bloom — brightens the whole lighting layer on each music beat */
  const beatBloomRef = useRef<HTMLDivElement>(null);
  /** Beat-reactive rim boost — hot rim edges pulse with the music */
  const beatRimRef   = useRef<HTMLDivElement>(null);

  /* ── Beat bloom RAF loop — reads module-level beat signal every frame ── */
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const b = getBeat();
      if (b > 0.005) {
        if (beatBloomRef.current) {
          beatBloomRef.current.style.opacity   = (b * 0.48).toFixed(3);
          beatBloomRef.current.style.transform = `scale(${(1 + b * 0.07).toFixed(4)})`;
        }
        if (beatRimRef.current) {
          beatRimRef.current.style.opacity = (b * 0.38).toFixed(3);
        }
      } else {
        if (beatBloomRef.current) beatBloomRef.current.style.opacity = '0';
        if (beatRimRef.current)   beatRimRef.current.style.opacity   = '0';
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const onLight = useCallback((x: number, y: number, intensity: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // ── Cursor spotlight (GPU transform only) ──
    if (spotRef.current) {
      const bw = Math.min(vw * 0.65, 440);
      const bh = Math.min(vh * 0.60, 400);
      spotRef.current.style.transform =
        `translate(${(x * vw - bw * 0.5).toFixed(0)}px,${(y * vh - bh * 0.5).toFixed(0)}px)`;
      spotRef.current.style.opacity = (0.08 + intensity * 0.24).toFixed(3);
    }

    // ── Left rim — stronger when cursor is left ──
    if (rimLRef.current)
      rimLRef.current.style.opacity = ((1 - x) * 0.14 * (0.25 + intensity * 0.75)).toFixed(3);

    // ── Right rim — stronger when cursor is right ──
    if (rimRRef.current)
      rimRRef.current.style.opacity = (x * 0.13 * (0.25 + intensity * 0.75)).toFixed(3);

    // ── Top-edge glow — volumetric light from above ──
    if (edgeTRef.current)
      edgeTRef.current.style.opacity = ((1 - y) * 0.09 * (0.4 + intensity * 0.6)).toFixed(3);
  }, []);

  useCursorLight(onLight);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:45, overflow:'hidden' }}>

        {/* 1 · Cursor spotlight — large blurred blob */}
        <div ref={spotRef} style={{
          position:'absolute', left:0, top:0,
          width:'min(440px,65vw)', height:'min(400px,58vh)',
          borderRadius:'50%',
          background:`radial-gradient(circle, ${primary}66 0%, ${primary}28 42%, transparent 70%)`,
          filter:'blur(48px)',
          willChange:'transform, opacity',
          opacity:0.08,
        }} />

        {/* 2 · Left rim */}
        <div ref={rimLRef} style={{
          position:'absolute', top:0, left:0, width:'35%', height:'100%',
          background:`linear-gradient(to right, ${secondary}66, transparent)`,
          willChange:'opacity', opacity:0.03,
        }} />

        {/* 3 · Right rim */}
        <div ref={rimRRef} style={{
          position:'absolute', top:0, right:0, width:'35%', height:'100%',
          background:`linear-gradient(to left, ${accent}55, transparent)`,
          willChange:'opacity', opacity:0.03,
        }} />

        {/* 4 · Top-edge volumetric glow */}
        <div ref={edgeTRef} style={{
          position:'absolute', top:0, left:0, right:0, height:'32%',
          background:`linear-gradient(to bottom, ${primary}cc, transparent)`,
          willChange:'opacity', opacity:0.03,
        }} />

        {/* 5a · Ambient drift leak — top-left, warm primary */}
        <div style={{
          position:'absolute', top:'-14%', left:'-10%',
          width:'56%', height:'52%',
          borderRadius:'50%',
          background:`linear-gradient(130deg, ${primary}1e 0%, transparent 65%)`,
          filter:'blur(58px)',
          animation:'_lgt_d1 16s ease-in-out infinite',
        }} />

        {/* 5b · Ambient drift leak — bottom-right, secondary */}
        <div style={{
          position:'absolute', bottom:'-12%', right:'-8%',
          width:'52%', height:'46%',
          borderRadius:'50%',
          background:`linear-gradient(320deg, ${secondary}18 0%, transparent 65%)`,
          filter:'blur(52px)',
          animation:'_lgt_d2 22s 5s ease-in-out infinite',
        }} />

        {/* 5c · Warm center haze — accent, very subtle */}
        <div style={{
          position:'absolute', top:'28%', left:'18%',
          width:'64%', height:'44%',
          borderRadius:'50%',
          background:`radial-gradient(ellipse, ${accent}0e 0%, transparent 70%)`,
          filter:'blur(40px)',
          animation:'_lgt_d3 26s 10s ease-in-out infinite',
        }} />

        {/* 6 · Beat bloom — expands on each music beat, screen-blended */}
        <div ref={beatBloomRef} style={{
          position:'absolute', inset:'-18%',
          background:`radial-gradient(ellipse 54% 50% at 50% 50%, ${primary}44 0%, ${secondary}22 50%, transparent 72%)`,
          filter:'blur(40px)',
          mixBlendMode:'screen' as const,
          willChange:'transform, opacity',
          opacity:0,
          transformOrigin:'50% 50%',
          pointerEvents:'none',
        }} />

        {/* 7 · Beat rim flash — hot edges pulse on beat */}
        <div ref={beatRimRef} style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse 120% 100% at 50% 0%,   ${primary}2a 0%, transparent 55%),
                      radial-gradient(ellipse 120% 100% at 50% 100%, ${secondary}22 0%, transparent 55%)`,
          mixBlendMode:'screen' as const,
          willChange:'opacity',
          opacity:0,
          pointerEvents:'none',
        }} />

      </div>
    </>
  );
}
