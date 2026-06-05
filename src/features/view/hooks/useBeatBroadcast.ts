/**
 * Module-level beat signal — no React state, no re-renders.
 *
 * MusicPulse writes the current beat value (0..1) via setBeat().
 * CinematicParallax reads it every RAF frame via getBeat().
 *
 * Pattern: shared mutable module ref, zero overhead.
 */

let _value = 0;

/** Called by MusicPulse on every RAF frame when music is active. */
export function setBeat(v: number): void {
  _value = v;
}

/** Called by CinematicParallax on every RAF frame to read current beat. */
export function getBeat(): number {
  return _value;
}
