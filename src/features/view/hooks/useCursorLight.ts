'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Cinematic ambient lighting engine.
 *
 * Tracks cursor / touch / gyroscope position and returns a normalised
 * x,y (0-1) position plus an intensity value (0-1) that decays to 0
 * roughly 2 s after the last interaction — so the light gently fades
 * away when the user stops moving.
 *
 * Runs its own RAF loop independent of useParallaxDepth so the two
 * systems can have different smoothing characteristics.
 */

/** Slower smoothing than parallax — light feels heavier / more inertia */
const SMOOTH = 0.048;

export function useCursorLight(
  onUpdate: (x: number, y: number, intensity: number) => void,
): void {
  const rafRef      = useRef<number>(0);
  const targetRef   = useRef({ x: 0.5, y: 0.5 });
  const curRef      = useRef({ x: 0.5, y: 0.5 });
  const lastMoveRef = useRef(performance.now());
  const cbRef       = useRef(onUpdate);
  cbRef.current     = onUpdate;

  const tick = useCallback(() => {
    const t  = targetRef.current;
    const c  = curRef.current;
    const nx = c.x + (t.x - c.x) * SMOOTH;
    const ny = c.y + (t.y - c.y) * SMOOTH;
    curRef.current = { x: nx, y: ny };

    const elapsed   = performance.now() - lastMoveRef.current;
    const intensity = Math.max(0, 1 - elapsed / 2200);

    cbRef.current(nx, ny, intensity);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const move = (cx: number, cy: number) => {
      targetRef.current = {
        x: Math.max(0, Math.min(1, cx / window.innerWidth)),
        y: Math.max(0, Math.min(1, cy / window.innerHeight)),
      };
      lastMoveRef.current = performance.now();
    };

    const onMouse       = (e: MouseEvent)              => move(e.clientX, e.clientY);
    const onTouch       = (e: TouchEvent)              => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
    const onOrientation = (e: DeviceOrientationEvent)  => {
      const gx = Math.max(0, Math.min(1, ((e.gamma ?? 0) + 45) / 90));
      const gy = Math.max(0, Math.min(1, (((e.beta  ?? 45) - 15) + 45) / 90));
      move(gx * window.innerWidth, gy * window.innerHeight);
    };

    window.addEventListener('mousemove',         onMouse,       { passive: true });
    window.addEventListener('touchmove',         onTouch,       { passive: true });
    window.addEventListener('deviceorientation', onOrientation, { passive: true });

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',         onMouse);
      window.removeEventListener('touchmove',         onTouch);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [tick]);
}
