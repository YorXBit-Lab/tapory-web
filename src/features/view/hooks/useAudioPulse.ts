'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * ─── SIMULATED AUDIO-REACTIVE ENGINE ─────────────────────────────────────────
 *
 * Spotify / YouTube iframes block Web Audio API access (CORS).
 * We simulate a rhythmic pulse at a configurable BPM instead.
 *
 * The callback receives `value` in 0-1:
 *   • 1.0  right on the beat
 *   • ↓    decays exponentially until the next beat
 *
 * The RAF loop fires at ~60fps — zero React state, zero re-renders.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** How quickly the beat value decays between hits (per-frame multiplier). */
const DECAY = 0.88;

export function useAudioPulse(
  onBeat: (value: number) => void,
  bpm    = 96,
  enabled = true,
): void {
  const rafRef   = useRef<number>(0);
  const valRef   = useRef(0);
  const startRef = useRef(performance.now());
  const cbRef    = useRef(onBeat);
  cbRef.current  = onBeat;

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const beatMs  = 60_000 / bpm;
    const phase   = (elapsed % beatMs) / beatMs; // 0–1 within one beat cycle

    if (phase < 0.055) {
      // Onset — snap to 1
      valRef.current = 1.0;
    } else {
      // Decay
      valRef.current = Math.max(0, valRef.current * DECAY);
    }

    cbRef.current(valRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [bpm]);

  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      cbRef.current(0);
      return;
    }
    startRef.current = performance.now();
    rafRef.current   = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, enabled, bpm]);
}
