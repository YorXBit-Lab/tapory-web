
import { experience, QualityProfile } from '../experience';

export type QualityTier = 'low' | 'medium' | 'high';
export type QualitySnapshot = {
  tier: QualityTier; mobile: boolean; dpr: number;
  particleScale: number; cardScale: number; targetFps: number;
  reducedMotion: boolean;
};

const tierValues: Record<QualityTier, { particleScale: number; cardScale: number; targetFps: number }> = {
  low: { particleScale: 0.5, cardScale: 0.6, targetFps: 30 },
  medium: { particleScale: 0.75, cardScale: 0.8, targetFps: 45 },
  high: { particleScale: 1, cardScale: 1, targetFps: 60 }
};

function initialTier(profile: QualityProfile, mobile: boolean): QualityTier {
  if (profile !== 'auto') return profile;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  return mobile || cores <= 4 || memory <= 4 ? 'medium' : 'high';
}

/** Frame-rate aware quality state shared by the whole engine. */
export class QualityManager {
  readonly mobile = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  tier: QualityTier = initialTier(experience.quality.profile, this.mobile);
  private listeners = new Set<(q: QualitySnapshot) => void>();
  private frames = 0;
  private windowStart = performance.now();
  private upStreak = 0;

  get snapshot(): QualitySnapshot {
    const cap = this.mobile ? experience.quality.mobileDpr : experience.quality.desktopDpr;
    // the low tier also renders at reduced resolution â€” the single biggest GPU saving
    const dprScale = this.tier === 'low' ? 0.8 : 1;
    return {
      tier: this.tier, mobile: this.mobile,
      dpr: Math.min(devicePixelRatio || 1, cap) * dprScale,
      reducedMotion: this.reducedMotion,
      ...tierValues[this.tier]
    };
  }

  onChange(fn: (q: QualitySnapshot) => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }

  /** Call once per rendered frame; auto-degrades or restores the tier. */
  tick(now: number) {
    if (experience.quality.profile !== 'auto') return;
    this.frames++;
    const span = now - this.windowStart;
    if (span < 2500) return;
    const fps = (this.frames * 1000) / span;
    this.frames = 0; this.windowStart = now;
    if (fps < this.snapshot.targetFps * 0.72 && this.tier !== 'low') {
      this.setTier(this.tier === 'high' ? 'medium' : 'low'); this.upStreak = 0;
    } else if (fps > 54 && !this.mobile && this.tier !== 'high' && ++this.upStreak >= 3) {
      this.setTier(this.tier === 'low' ? 'medium' : 'high'); this.upStreak = 0;
    } else if (fps < 48) this.upStreak = 0;
  }

  private setTier(tier: QualityTier) {
    this.tier = tier;
    const snap = this.snapshot;
    this.listeners.forEach(fn => fn(snap));
  }
}
