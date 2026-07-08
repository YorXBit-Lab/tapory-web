import { gsap } from 'gsap';
import { experience } from '../experience';

export type CueName = keyof typeof experience.soundCues;
const STORAGE_KEY = 'stardust-audio';

/** Background music + optional one-shot cues. Missing files fail silently. */
export class AudioDirector {
  readonly available = Boolean(experience.audio.src);
  muted = false;
  private music: HTMLAudioElement | null = null;
  private cues = new Map<CueName, HTMLAudioElement>();
  private listeners = new Set<() => void>();

  private wasPlaying = false;

  constructor() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (saved && typeof saved.muted === 'boolean') this.muted = saved.muted;
    } catch { /* storage unavailable */ }
    if (this.available) {
      const music = new Audio(experience.audio.src);
      music.loop = true; music.preload = 'auto'; music.volume = 0; music.muted = this.muted;
      music.addEventListener('error', () => { this.music = null; });
      this.music = music;
    }
    // the film pauses when the tab hides â€” so does its soundtrack
    document.addEventListener('visibilitychange', () => {
      if (!this.music) return;
      if (document.hidden) {
        this.wasPlaying = !this.music.paused;
        this.music.pause();
      } else if (this.wasPlaying) {
        this.music.play().catch(() => undefined);
      }
    });
  }

  onChange(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }

  start() {
    if (!this.music) return;
    this.music.play().then(() => {
      gsap.to(this.music, { volume: experience.audio.volume, duration: 2.4, ease: 'sine.out' });
    }).catch(() => undefined);
  }

  stop() {
    if (!this.music) return;
    const music = this.music;
    gsap.to(music, { volume: 0, duration: 0.9, ease: 'sine.in', onComplete: () => { music.pause(); music.currentTime = 0; } });
  }

  duck(level: number, seconds = 0.6) {
    if (!this.music || this.music.paused) return;
    gsap.to(this.music, { volume: experience.audio.volume * level, duration: seconds, ease: 'sine.inOut', overwrite: 'auto' });
  }

  cue(name: CueName) {
    const def = experience.soundCues[name];
    if (!def?.src || this.muted) return;
    try {
      let el = this.cues.get(name);
      if (!el) { el = new Audio(def.src); el.preload = 'auto'; this.cues.set(name, el); }
      el.volume = def.volume;
      el.currentTime = 0;
      el.play().catch(() => undefined);
    } catch { /* never let a missing cue break the film */ }
  }

  /** Spec-friendly aliases used by the Director. */
  playCue(name: CueName) { this.cue(name); }
  fadeMusic(level: number, seconds = 0.6) { this.duck(level, seconds); }
  setMuted(muted: boolean) { if (muted !== this.muted) this.toggle(); }

  toggle() {
    this.muted = !this.muted;
    if (this.music) {
      this.music.muted = this.muted;
      if (!this.muted && this.music.paused) this.music.play().catch(() => undefined);
    }
    try {
      const payload = JSON.stringify({ muted: this.muted });
      sessionStorage.setItem(STORAGE_KEY, payload); localStorage.setItem(STORAGE_KEY, payload);
    } catch { /* storage unavailable */ }
    this.listeners.forEach(fn => fn());
  }
}
