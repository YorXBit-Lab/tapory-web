'use client';
import { useEffect, useRef } from 'react';

/**
 * ─── TOUCH SCATTER SYSTEM ────────────────────────────────────────────────────
 *
 * When user taps / clicks the target element, a burst of particles explodes
 * outward from the touch point.
 *
 * Particles are created as plain DOM elements (no React state → zero re-renders).
 * They animate via a CSS keyframe and auto-remove after the animation ends.
 *
 * The scatter container must be `position:fixed` with `pointer-events:none`
 * so it overlays everything without blocking interactions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const KF_ID = '_tapory_scatter_kf';

function injectKeyframes() {
  if (document.getElementById(KF_ID)) return;
  const s = document.createElement('style');
  s.id = KF_ID;
  s.textContent = `
    @keyframes _sc_burst {
      0%   { transform: translate(0,0) scale(1);   opacity: 0.92; }
      60%  { opacity: 0.75; }
      100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
    }
    @keyframes _sc_burst_char {
      0%   { transform: translate(0,0) scale(1.2) rotate(0deg);   opacity: 0.88; }
      100% { transform: translate(var(--sx), var(--sy)) scale(0) rotate(var(--sr)); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

interface Options {
  primary:    string;
  secondary:  string;
  /** Number of particles per burst. Default: 14 */
  count?:     number;
}

export function useTouchScatter(
  /** Element to listen for tap/click events */
  targetRef: React.RefObject<HTMLElement | null>,
  /** Fixed-position overlay container for particles */
  containerRef: React.RefObject<HTMLElement | null>,
  options: Options,
) {
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const target    = targetRef.current;
    const container = containerRef.current;
    if (!target || !container) return;

    injectKeyframes();

    const SHAPES = ['✦', '◆', '✿', '·', '★'];

    const burst = (cx: number, cy: number) => {
      const { primary, secondary, count = 14 } = optsRef.current;
      const colors = [primary, secondary, 'rgba(255,255,255,0.92)', primary + 'cc', secondary + 'aa'];

      for (let i = 0; i < count; i++) {
        const isChar  = i % 4 === 1;
        const angle   = (i / count) * Math.PI * 2 + (Math.random() * 0.7 - 0.35);
        const dist    = 28 + Math.random() * 70;
        const sx      = (Math.cos(angle) * dist).toFixed(1) + 'px';
        const sy      = (Math.sin(angle) * dist).toFixed(1) + 'px';
        const size    = isChar ? 10 + Math.random() * 8 : 3 + Math.random() * 7;
        const color   = colors[i % colors.length];
        const dur     = (0.38 + Math.random() * 0.32).toFixed(2);
        const delay   = (Math.random() * 0.06).toFixed(2);
        const sr      = `${Math.round(Math.random() * 360 - 180)}deg`;

        const el = document.createElement('div');
        el.style.position      = 'fixed';
        el.style.left          = `${cx}px`;
        el.style.top           = `${cy}px`;
        el.style.width         = `${size}px`;
        el.style.height        = `${size}px`;
        el.style.marginLeft    = `${-size / 2}px`;
        el.style.marginTop     = `${-size / 2}px`;
        el.style.borderRadius  = isChar ? '0' : '50%';
        el.style.background    = isChar ? 'transparent' : color;
        el.style.color         = color;
        el.style.fontSize      = `${size}px`;
        el.style.lineHeight    = '1';
        el.style.pointerEvents = 'none';
        el.style.zIndex        = '55';
        el.style.willChange    = 'transform, opacity';
        el.style.filter        = `drop-shadow(0 0 ${Math.round(size * 0.6)}px ${color})`;
        el.style.animation     = `${isChar ? '_sc_burst_char' : '_sc_burst'} ${dur}s ${delay}s ease-out forwards`;
        el.style.setProperty('--sx', sx);
        el.style.setProperty('--sy', sy);
        el.style.setProperty('--sr', sr);

        if (isChar) el.textContent = SHAPES[i % SHAPES.length];

        container.appendChild(el);
        const removeAfter = (parseFloat(dur) + parseFloat(delay)) * 1000 + 80;
        setTimeout(() => el.remove(), removeAfter);
      }
    };

    const onClick = (e: MouseEvent) => burst(e.clientX, e.clientY);

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) burst(t.clientX, t.clientY);
    };

    target.addEventListener('click',      onClick);
    target.addEventListener('touchstart', onTouch, { passive: true });

    return () => {
      target.removeEventListener('click',      onClick);
      target.removeEventListener('touchstart', onTouch);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, containerRef]);
}
