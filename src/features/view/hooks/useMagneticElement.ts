'use client';
import { useRef, useCallback, useEffect } from 'react';

/**
 * Magnetic button physics.
 *
 * When the cursor enters a configurable radius around the element,
 * the element springs toward the cursor with a strength factor.
 * When the cursor leaves, it springs back to rest (0,0).
 *
 * Uses a RAF spring loop — zero React state, zero re-renders.
 * GPU-safe: only `transform: translate()` is mutated.
 */

interface Options {
  /** 0-1 — how strongly the element is attracted. Default 0.38 */
  strength?: number;
  /** px — cursor must be within this distance to activate. Default 88 */
  radius?: number;
  /** Spring smoothing factor per frame. Default 0.10 */
  smoothing?: number;
}

export function useMagneticElement<T extends HTMLElement = HTMLElement>(
  options: Options = {},
) {
  const { strength = 0.38, radius = 88, smoothing = 0.10 } = options;

  const ref       = useRef<T>(null);
  const rafRef    = useRef<number>(0);
  const curRef    = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);

  const animate = useCallback(() => {
    const c = curRef.current;
    const t = targetRef.current;
    const nx = c.x + (t.x - c.x) * smoothing;
    const ny = c.y + (t.y - c.y) * smoothing;
    curRef.current = { x: nx, y: ny };

    if (ref.current) {
      ref.current.style.transform = `translate(${nx.toFixed(2)}px,${ny.toFixed(2)}px)`;
    }

    // Keep animating until nearly at rest
    if (Math.abs(nx) > 0.15 || Math.abs(ny) > 0.15 ||
        Math.abs(t.x) > 0.15 || Math.abs(t.y) > 0.15) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (ref.current) ref.current.style.transform = 'translate(0px,0px)';
    }
  }, [smoothing]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const factor = strength * (1 - dist / radius);
        targetRef.current = { x: dx * factor, y: dy * factor };
        if (!activeRef.current) {
          activeRef.current = true;
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(animate);
        }
      } else if (activeRef.current) {
        targetRef.current = { x: 0, y: 0 };
        activeRef.current = false;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
    };
  }, [animate, radius, strength]);

  return ref;
}
