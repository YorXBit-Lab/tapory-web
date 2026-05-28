'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Cinematic parallax spring engine.
 *
 * Normalised offset (x, y) in range -1..1 is computed each RAF frame from:
 *   • mouse position (desktop)
 *   • touch position (mobile, fallback)
 *   • device orientation / gyroscope (mobile, primary)
 *
 * The callback is called every frame — callers update DOM refs directly
 * (no React state → zero re-renders → 60fps guaranteed).
 */

/** How fast current chases target — lower = smoother / slower catch-up */
const SMOOTH = 0.068;

/** Clamp a value to [-1, 1] */
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function useParallaxDepth(
  onUpdate: (x: number, y: number) => void,
): void {
  const rafRef    = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const curRef    = useRef({ x: 0, y: 0 });
  // Keep the latest callback without re-registering effects
  const cbRef     = useRef(onUpdate);
  cbRef.current   = onUpdate;

  const tick = useCallback(() => {
    const t = targetRef.current;
    const c = curRef.current;
    const nx = c.x + (t.x - c.x) * SMOOTH;
    const ny = c.y + (t.y - c.y) * SMOOTH;
    curRef.current = { x: nx, y: ny };
    cbRef.current(nx, ny);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const set = (nx: number, ny: number) => {
      targetRef.current = { x: clamp(nx), y: clamp(ny) };
    };

    /* ── Mouse ── */
    const onMouse = (e: MouseEvent) =>
      set(
        (e.clientX / window.innerWidth  - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      );

    /* ── Touch (fallback when gyro unavailable) ── */
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      set(
        (t.clientX / window.innerWidth  - 0.5) * 2,
        (t.clientY / window.innerHeight - 0.5) * 2,
      );
    };

    /* ── Gyroscope ── */
    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;           // left/right: -90..90°
      const beta  = (e.beta ?? 45) - 45;   // normalize: natural hold ≈ 45°
      // ±22° mapped to ±1 — feels premium, not jittery
      set(gamma / 22, beta / 22);
    };

    /* iOS 13+ needs explicit permission requested on a user gesture */
    const setupGyro = () => {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<PermissionState>;
      };
      if (typeof DOE.requestPermission === 'function') {
        const req = () => {
          DOE
            .requestPermission!()
            .then(res => {
              if (res === 'granted')
                window.addEventListener('deviceorientation', onOrientation, { passive: true });
            })
            .catch(() => {/* silently ignore */});
          window.removeEventListener('touchstart', req);
        };
        window.addEventListener('touchstart', req, { once: true });
      } else {
        /* Android & desktop browsers — add directly */
        window.addEventListener('deviceorientation', onOrientation, { passive: true });
      }
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    setupGyro();

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',        onMouse);
      window.removeEventListener('touchmove',        onTouch);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [tick]);
}
