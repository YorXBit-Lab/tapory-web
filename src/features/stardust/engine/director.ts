import * as THREE from 'three';
import { gsap } from 'gsap';
import { experience, SceneName, SceneGrade } from '../experience';
import { TextField } from './text';
import { STATIONS, Formation } from './cards';
import type { Stage } from './stage';

export const sceneOrder: SceneName[] = ['intro', 'greeting', 'letter', 'wish', 'explosion', 'sphere', 'tunnel', 'rain', 'gallery', 'final'];

export type DirectorState = {
  scene: SceneName;
  index: number;
  started: boolean;
  loaded: boolean;
  transitioning: boolean;
  duration: number;
};

type FieldSpec = {
  key: string;
  field: TextField;
  /** world z of the text, or 'caption' for camera-attached */
  station: number | 'caption';
  wFrac: number;
  hFrac: number;
  yOffset?: number;
};

const CAPTION_DISTANCE = 13;

function grade(name: SceneName): SceneGrade { return experience.grades[name]; }

/** Portrait screens need a longer lens-to-subject distance to keep card scenes framed. */
function portraitBoost(aspect: number) {
  return aspect < 1.2 ? THREE.MathUtils.clamp(1.55 - aspect * 0.45, 1, 1.55) : 1;
}

/**
 * The film director: builds one GSAP timeline per chapter transition,
 * driving camera rig, particle-text uniforms, card formations, color grade,
 * post-processing and audio together.
 */
export class Director {
  state: DirectorState;
  private stage: Stage;
  private listeners = new Set<() => void>();
  private locked = false;
  private pending: gsap.core.Tween | null = null;
  private timeline: gsap.core.Timeline | null = null;
  private fields = new Map<string, FieldSpec>();

  constructor(stage: Stage) {
    this.stage = stage;
    const requested = new URLSearchParams(location.search).get('scene') as SceneName | null;
    const initial = requested && sceneOrder.includes(requested) ? requested : 'intro';
    this.state = {
      scene: 'intro', index: 0, started: false, loaded: false, transitioning: false,
      duration: 0
    };
    this.buildFields();
    this.applyGrade(grade('intro'), 0);
    stage.cards.ready.then(() => {
      this.state = { ...this.state, loaded: true };
      this.emit();
      if (initial !== 'intro') this.jumpTo(initial);
    });
  }

  onChange(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { this.listeners.forEach(fn => fn()); }
  private setState(patch: Partial<DirectorState>) { this.state = { ...this.state, ...patch }; this.emit(); }

  // ---------------------------------------------------------------- fields
  private buildFields() {
    const c = experience.colors;
    const q = this.stage.quality.snapshot;
    const maxPoints = Math.round((q.mobile ? 13000 : 36000) * (q.tier === 'low' ? 0.6 : 1));
    const add = (spec: Omit<FieldSpec, 'field'> & { field: TextField }) => {
      this.fields.set(spec.key, spec);
      if (spec.station === 'caption') this.stage.captionAnchor.add(spec.field.group);
      else {
        spec.field.group.position.z = spec.station;
        this.stage.scene.add(spec.field.group);
      }
    };
    const gap = q.mobile ? 3 : 2;
    // auto-wrap widths (em) â€” remote content can be any length; portrait
    // screens wrap sooner so the fitted text stays large and readable
    const wrapWide = q.mobile ? 6 : 9;    // display titles (greeting / wish)
    const wrapBody = q.mobile ? 12 : 18;  // letter body & captions
    add({
      key: 'greeting', station: STATIONS.greeting.focus.z, wFrac: 0.82, hFrac: 0.4,
      field: new TextField({ text: experience.mainGreeting, fontPx: 190, gap, maxPoints, palette: ['#fff5fa', '#ffd6ea', '#ff9ecb', '#c86adf'], tracking: 0.02, interactive: true, reflect: true, wrap: wrapWide })
    });
    add({
      key: 'greetingHint', station: STATIONS.greeting.focus.z, wFrac: 0.5, hFrac: 0.07, yOffset: -0.3,
      field: new TextField({ text: experience.copy.greetingHint, fontPx: 64, gap: 2, maxPoints: 5000, palette: ['#f0c2d6', c.gold], weight: 400 })
    });
    add({
      key: 'letter', station: STATIONS.letter.focus.z, wFrac: 0.84, hFrac: 0.66,
      field: new TextField({ text: experience.messages.join('\n'), fontPx: 84, gap: 2, maxPoints, palette: ['#fff2f8', '#ffcfe6', '#eda6d2', '#a98ae8'], fontFamily: '"Segoe UI", system-ui, sans-serif', weight: 600, reveal: 'lines', interactive: true, wrap: wrapBody })
    });
    add({
      key: 'wish', station: STATIONS.wish.focus.z, wFrac: 0.86, hFrac: 0.42,
      field: new TextField({ text: experience.bigWish, fontPx: 170, gap, maxPoints, palette: ['#fff7f0', '#ffdcc9', '#ff9eb8', '#e878c8'], tracking: 0.01, interactive: true, reflect: true, wrap: wrapWide })
    });
    (['sphere', 'tunnel', 'rain', 'gallery'] as const).forEach(key => {
      add({
        key: `caption-${key}`, station: 'caption', wFrac: 0.74, hFrac: 0.2,
        field: new TextField({ text: experience.copy[key], fontPx: 58, gap: 2, maxPoints: 7000, palette: ['#fff4f8', '#ffd9e8', '#d9b8c8'], weight: 600, fontFamily: '"Segoe UI", system-ui, sans-serif', wrap: wrapBody })
      });
    });
    add({
      key: 'final', station: STATIONS.final.focus.z, wFrac: 0.85, hFrac: 0.5,
      field: new TextField({ text: experience.finalMessage, fontPx: 110, gap, maxPoints, palette: ['#fff4f6', '#ffd9e2', '#ffb0c8', '#d898e8'], interactive: true, wrap: q.mobile ? 9 : 13 })
    });
    add({
      key: 'signature', station: STATIONS.final.focus.z, wFrac: 0.4, hFrac: 0.06, yOffset: -4.2,
      field: new TextField({ text: experience.copy.signature, fontPx: 54, gap: 2, maxPoints: 4000, palette: [c.gold, c.pink], weight: 400, wrap: wrapBody })
    });
    this.refit();
  }

  field(key: string) { return this.fields.get(key)!.field; }

  forEachField(fn: (field: TextField) => void) { for (const spec of this.fields.values()) fn(spec.field); }

  /** Route a drag gesture to the chapter's main particle text. */
  dragText(dx: number, dy: number, t: number) {
    const key = ({ greeting: 'greeting', letter: 'letter', wish: 'wish', final: 'final' } as Partial<Record<SceneName, string>>)[this.state.scene];
    if (key) this.fields.get(key)?.field.spin(dx, dy, t);
  }

  /** Re-fit every text block to the camera frustum. Called on resize. */
  refit() {
    const aspect = this.stage.camera.aspect;
    for (const spec of this.fields.values()) {
      const distance = spec.station === 'caption' ? CAPTION_DISTANCE : experience.camera.presets[this.chapterOfField(spec.key)]?.distance ?? 16;
      const fov = spec.station === 'caption' ? experience.camera.baseFov : experience.camera.presets[this.chapterOfField(spec.key)]?.fov ?? experience.camera.baseFov;
      const h = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const w = h * aspect;
      spec.field.fit(w * spec.wFrac, h * spec.hFrac);
      if (spec.station === 'caption') {
        spec.field.group.position.set(0, 0, 0);
      } else {
        const chapter = this.chapterOfField(spec.key);
        const baseY = spec.key === 'greetingHint' ? -h * 0.30 : spec.key === 'signature' ? (spec.yOffset ?? 0) : spec.key === 'final' ? h * 0.06 : 0;
        spec.field.group.position.set(0, baseY, STATIONS[chapter as 'greeting' | 'letter' | 'wish' | 'final'].focus.z);
      }
    }
    // caption anchor sits in the bottom safe area of the camera frustum
    const h = 2 * CAPTION_DISTANCE * Math.tan(THREE.MathUtils.degToRad(experience.camera.baseFov / 2));
    this.stage.captionAnchor.position.set(0, -h * 0.30, -CAPTION_DISTANCE);
  }

  private chapterOfField(key: string): SceneName {
    if (key.startsWith('caption-')) return key.slice(8) as SceneName;
    if (key === 'greetingHint') return 'greeting';
    if (key === 'signature') return 'final';
    return key as SceneName;
  }

  // ---------------------------------------------------------------- grading
  private applyGrade(g: SceneGrade, seconds: number) {
    const u = this.stage.post.grade.uniforms;
    const bloomTarget = g.bloom * this.stage.bloomScale;
    if (seconds <= 0) {
      (u.uShadow.value as THREE.Color).set(g.shadow);
      (u.uHighlight.value as THREE.Color).set(g.highlight);
      u.uAmount.value = g.amount; u.uExposure.value = g.exposure; u.uVignette.value = g.vignette;
      u.uFocus.value = g.focus;
      this.stage.post.bloom.strength = bloomTarget;
    } else {
      const shadow = new THREE.Color(g.shadow), highlight = new THREE.Color(g.highlight);
      gsap.to(u.uShadow.value, { r: shadow.r, g: shadow.g, b: shadow.b, duration: seconds, ease: 'sine.inOut', overwrite: 'auto' });
      gsap.to(u.uHighlight.value, { r: highlight.r, g: highlight.g, b: highlight.b, duration: seconds, ease: 'sine.inOut', overwrite: 'auto' });
      gsap.to(u.uAmount, { value: g.amount, duration: seconds, overwrite: 'auto' });
      gsap.to(u.uExposure, { value: g.exposure, duration: seconds, overwrite: 'auto' });
      gsap.to(u.uVignette, { value: g.vignette, duration: seconds, overwrite: 'auto' });
      gsap.to(u.uFocus, { value: g.focus, duration: seconds, overwrite: 'auto' });
      gsap.to(this.stage.post.bloom, { strength: bloomTarget, duration: seconds, overwrite: 'auto' });
    }
    // environment tint targets are eased in Environment.update
    this.stage.env.setGrade(g);
    const dust = new THREE.Color(g.dust);
    gsap.to(this.stage.env.dustUniforms.uColor.value, { r: dust.r, g: dust.g, b: dust.b, duration: Math.max(0.01, seconds), overwrite: 'auto' });
  }

  /** Short chromatic-aberration pulse; zero the rest of the time. */
  private caPulse(tl: gsap.core.Timeline, at: number, strength = 1, duration = 0.9) {
    if (this.stage.quality.reducedMotion) return;
    const u = this.stage.post.grade.uniforms.uCA;
    tl.to(u, { value: experience.post.chromatic * strength, duration: duration * 0.35, ease: 'power2.in' }, at);
    tl.to(u, { value: 0, duration: duration * 0.65, ease: 'power2.out' }, at + duration * 0.35);
  }

  private flare(tl: gsap.core.Timeline, at: number, peak = 0.7, duration = 1.1) {
    const material = this.stage.env.flareMaterial;
    tl.to(material, { opacity: peak, duration: duration * 0.3, ease: 'power2.in' }, at);
    tl.to(material, { opacity: 0, duration: duration * 0.7, ease: 'power2.out' }, at + duration * 0.3);
    tl.fromTo(this.stage.env.flare.scale, { x: 0.35 }, { x: 1, duration, ease: 'power2.out' }, at);
  }

  private moveRig(tl: gsap.core.Timeline, at: number, opts: { z?: number; x?: number; y?: number; fov?: number; duration: number; ease?: string }) {
    const { duration, ease = 'power2.inOut' } = opts;
    const target: Record<string, number> = {};
    if (opts.x !== undefined) target.x = opts.x;
    if (opts.y !== undefined) target.y = opts.y;
    if (opts.z !== undefined) target.z = opts.z;
    tl.to(this.stage.rig.position, { ...target, duration, ease }, at);
    if (opts.fov !== undefined) tl.to(this.stage, { baseFov: opts.fov, duration, ease }, at);
  }

  private revealText(tl: gsap.core.Timeline, key: string, at: number, duration = 0.85) {
    const field = this.field(key);
    tl.set(field.group, { visible: true }, at);
    tl.set(field.u.uDissolve, { value: 0 }, at);
    tl.fromTo(field.u.uReveal, { value: 0 }, { value: 1, duration, ease: 'sine.inOut' }, at);
    if (key.startsWith('caption-')) {
      tl.to(this.stage.captionPlate.material, { opacity: 0.6, duration: duration + 0.4, ease: 'sine.inOut', overwrite: 'auto' }, at);
    }
  }

  private shimmerSweep(tl: gsap.core.Timeline, key: string, at: number) {
    const field = this.field(key);
    tl.fromTo(field.u.uScanX, { value: -field.pxWidth * 0.7 }, { value: field.pxWidth * 0.7, duration: 1.3, ease: 'sine.inOut' }, at);
    tl.fromTo(field.u.uScanI, { value: 0.9 }, { value: 0, duration: 1.5, ease: 'sine.in' }, at);
  }

  private dissolveText(tl: gsap.core.Timeline, key: string, style: 'ribbon' | 'converge' | 'explode' | 'drift' | 'spiral', at: number, duration = 1.2) {
    const field = this.field(key);
    tl.call(() => field.setDissolveStyle(style), undefined, at);
    tl.to(field.u.uDissolve, { value: 1, duration, ease: style === 'converge' || style === 'explode' ? 'power2.in' : 'power2.inOut' }, at);
    tl.set(field.group, { visible: false }, at + duration + 0.05);
    if (key.startsWith('caption-')) {
      tl.to(this.stage.captionPlate.material, { opacity: 0, duration: duration * 0.8, ease: 'sine.inOut', overwrite: 'auto' }, at);
    }
  }

  private shakePulse(tl: gsap.core.Timeline, at: number, amp: number, duration: number) {
    if (this.stage.quality.reducedMotion) return;
    tl.to(this.stage, { shake: amp, duration: duration * 0.3, ease: 'power2.in' }, at);
    tl.to(this.stage, { shake: 0, duration: duration * 0.7, ease: 'power2.out' }, at + duration * 0.3);
  }

  private warpPulse(tl: gsap.core.Timeline, at: number, peak: number, up: number, down: number) {
    const u = this.stage.env.starUniforms.uWarp;
    const capped = this.stage.quality.reducedMotion ? Math.min(peak, 0.25) : peak;
    tl.to(u, { value: capped, duration: up, ease: 'power2.in' }, at);
    tl.to(u, { value: 0, duration: down, ease: 'power2.out' }, at + up);
  }

  // ---------------------------------------------------------------- flow
  begin() {
    if (this.state.started || !this.state.loaded) return;
    this.setState({ started: true });
    this.stage.audio.start();
    this.stage.audio.cue('rise');
    this.go('greeting');
  }

  advance() {
    if (this.locked || !this.state.started) return;
    const index = sceneOrder.indexOf(this.state.scene);
    if (index >= 0 && index < sceneOrder.length - 1) this.go(sceneOrder[index + 1]);
  }

  replay() {
    this.pending?.kill();
    this.timeline?.kill();
    this.locked = false;
    gsap.killTweensOf(this.stage.rig.position);
    gsap.killTweensOf(this.stage);
    const post = this.stage.post.grade.uniforms;
    [post.uShadow.value, post.uHighlight.value, post.uAmount, post.uExposure, post.uVignette, post.uCA,
      this.stage.env.starUniforms.uWarp, this.stage.env.flareMaterial, this.stage.post.bloom,
      this.stage.env.dustUniforms.uColor.value].forEach(o => gsap.killTweensOf(o));
    for (const spec of this.fields.values()) {
      Object.values(spec.field.u).forEach(u => gsap.killTweensOf(u));
      gsap.killTweensOf(spec.field.group);
      spec.field.reset();
    }
    this.stage.cards.reset();
    this.stage.env.starUniforms.uWarp.value = 0;
    this.stage.env.flareMaterial.opacity = 0;
    gsap.killTweensOf(this.stage.captionPlate.material);
    this.stage.captionPlate.material.opacity = 0;
    this.stage.post.grade.uniforms.uCA.value = 0;
    this.stage.shake = 0;
    this.stage.rig.position.set(0, 0, 10);
    this.stage.baseFov = experience.camera.presets.intro.fov;
    this.applyGrade(grade('intro'), 0);
    this.stage.audio.stop();
    this.setState({ scene: 'intro', index: 0, started: false, transitioning: false, duration: 0 });
  }

  toggleSound() { this.stage.audio.toggle(); this.setState({}); }

  private scheduleAdvance(scene: SceneName) {
    this.pending?.kill();
    if (scene === 'intro' || scene === 'final') return;
    const seconds = Math.max(2, (experience.timings[scene as keyof typeof experience.timings] ?? 7000) / 1000);
    this.pending = gsap.delayedCall(seconds, () => this.advance());
  }

  private go(next: SceneName) {
    if (this.locked || next === this.state.scene) return;
    this.locked = true;
    this.pending?.kill();
    this.timeline?.kill();
    const from = this.state.scene;
    this.setState({ scene: next, index: sceneOrder.indexOf(next), transitioning: true, duration: experience.timings[next as keyof typeof experience.timings] ?? 0 });
    const unlock = () => {
      if (!this.locked) return;
      this.locked = false;
      this.setState({ transitioning: false });
    };
    const tl = gsap.timeline({ onComplete: unlock });
    this.timeline = tl;
    this.build(tl, from, next);
    // let the viewer skip once the essential motion has landed,
    // even while decorative tails (shimmer, slow dolly) are still playing
    tl.call(unlock, undefined, Math.min(tl.duration(), 3));
    this.scheduleAdvance(next);
  }

  // ------------------------------------------------------- chapter builds
  private build(tl: gsap.core.Timeline, from: SceneName, next: SceneName) {
    const presets = experience.camera.presets;
    this.applyGrade(grade(next), 1.8);
    switch (next) {
      case 'greeting': {
        this.stage.audio.cue('whoosh');
        this.warpPulse(tl, 0.1, 1, 0.7, 0.9);
        this.moveRig(tl, 0, { z: STATIONS.greeting.focus.z + presets.greeting.distance, fov: presets.greeting.fov, duration: 2.4, ease: 'power3.inOut' });
        this.flare(tl, 1.1, 0.55, 1);
        this.caPulse(tl, 0.9, 1.2);
        this.revealText(tl, 'greeting', 1.3, 4.6);
        this.shimmerSweep(tl, 'greeting', 6.3);
        this.revealText(tl, 'greetingHint', 3.4, 3);
        tl.call(() => this.stage.audio.cue('gather'), undefined, 1.3);
        break;
      }
      case 'letter': {
        this.stage.audio.cue('whoosh');
        this.dissolveText(tl, 'greeting', 'ribbon', 0, 1.15);
        this.dissolveText(tl, 'greetingHint', 'drift', 0, 0.8);
        this.warpPulse(tl, 0.3, 0.45, 0.8, 1.2);
        this.moveRig(tl, 0.25, { z: STATIONS.letter.focus.z + presets.letter.distance, fov: presets.letter.fov, duration: 2.6, ease: 'power3.inOut' });
        this.revealText(tl, 'letter', 1.7, 7.5);
        this.shimmerSweep(tl, 'letter', 9.5);
        tl.call(() => this.stage.audio.cue('gather'), undefined, 1.7);
        break;
      }
      case 'wish': {
        this.dissolveText(tl, 'letter', 'converge', 0, 1.1);
        this.flare(tl, 1.0, 0.85, 1.2);
        this.caPulse(tl, 1.05, 2, 1.1);
        this.shakePulse(tl, 1.1, 0.14, 0.9);
        this.moveRig(tl, 0.3, { z: STATIONS.wish.focus.z + presets.wish.distance, fov: presets.wish.fov, duration: 2.3, ease: 'power3.inOut' });
        this.revealText(tl, 'wish', 1.55, 3.4);
        this.shimmerSweep(tl, 'wish', 5.2);
        tl.call(() => this.stage.audio.cue('impact'), undefined, 1.1);
        break;
      }
      case 'explosion': {
        this.dissolveText(tl, 'wish', 'explode', 0.1, 1.5);
        tl.call(() => this.stage.audio.cue('impact'), undefined, 0.15);
        this.shakePulse(tl, 0.2, 0.3, 1.4);
        this.caPulse(tl, 0.15, 2.4, 1.6);
        this.warpPulse(tl, 0.2, 1.6, 0.9, 1.6);
        this.flare(tl, 0.25, 0.9, 1.4);
        this.moveRig(tl, 0.1, { z: STATIONS.explosion.focus.z - 4, fov: presets.explosion.fov, duration: 2.6, ease: 'power3.inOut' });
        // stardust condenses into memory cards mid-flight
        tl.call(() => {
          this.stage.cards.snapTo('burst', this.stage.camera.aspect);
          this.stage.cards.morphTo('sphere', { duration: 3, stagger: 0.02, ease: 'power3.inOut' });
        }, undefined, 0.9);
        break;
      }
      case 'sphere': {
        if (from !== 'explosion') {
          tl.call(() => { this.stage.cards.morphTo('sphere', { duration: 2.2, stagger: 0.015 }); }, undefined, 0);
        }
        const sphereDist = presets.sphere.distance * portraitBoost(this.stage.camera.aspect);
        this.moveRig(tl, 0, { z: STATIONS.sphere.focus.z + sphereDist, fov: presets.sphere.fov, duration: 2.2, ease: 'power2.inOut' });
        // deep dolly-in: the camera leans right into the memories
        tl.to(this.stage.rig.position, { z: STATIONS.sphere.focus.z + sphereDist - 2.6, duration: 8.5, ease: 'sine.inOut' }, 2.3);
        this.revealText(tl, 'caption-sphere', 1.4, 2.8);
        tl.call(() => this.stage.audio.cue('gather'), undefined, 1.2);
        break;
      }
      case 'tunnel': {
        this.dissolveText(tl, 'caption-sphere', 'spiral', 0, 0.8);
        // match cut: one card swells into a portal, the camera dives through it
        tl.call(() => {
          const portal = this.stage.cards.portalCard();
          gsap.killTweensOf([portal.position, portal.scale]);
          const rigZ = this.stage.rig.position.z;
          gsap.to(portal.position, { x: 0, y: 0, z: rigZ - 7, duration: 0.95, ease: 'power2.in', overwrite: 'auto' });
          gsap.to(portal.scale, { x: 4.4, y: 4.4, z: 4.4, duration: 0.95, ease: 'power2.in', overwrite: 'auto' });
          gsap.to(portal.userData, { face: 1, duration: 0.5, overwrite: 'auto' });
        }, undefined, 0.05);
        this.flare(tl, 0.95, 0.9, 0.9);
        this.caPulse(tl, 0.9, 1.8, 1);
        tl.call(() => this.stage.audio.cue('whoosh'), undefined, 0.95);
        tl.call(() => {
          this.stage.cards.morphTo('tunnel', { duration: 1.9, stagger: 0.012, ease: 'power2.inOut' });
        }, undefined, 1.05);
        // dive, then fly the helix with acceleration â†’ deceleration
        this.moveRig(tl, 0.1, { z: this.stage.rig.position.z - 8, fov: presets.tunnel.fov, duration: 1.1, ease: 'power2.in' });
        tl.to(this.stage.rig.position, { z: STATIONS.tunnelStart + STATIONS.tunnelStep * this.stage.cardCount - 2, duration: 7.6, ease: 'power2.inOut' }, 1.25);
        if (!this.stage.quality.reducedMotion) {
          tl.to(this.stage.rig.position, {
            keyframes: [{ x: 0.5, y: -0.3 }, { x: -0.45, y: 0.35 }, { x: 0.3, y: -0.2 }, { x: 0, y: 0 }],
            duration: 7.6, ease: 'sine.inOut'
          }, 1.25);
          tl.to(this.stage.rig.rotation, {
            keyframes: [{ z: 0.05 }, { z: -0.05 }, { z: 0.03 }, { z: 0 }],
            duration: 7.6, ease: 'sine.inOut'
          }, 1.25);
        }
        this.warpPulse(tl, 1.2, 0.7, 1.4, 5.5);
        this.revealText(tl, 'caption-tunnel', 2.8, 2.8);
        break;
      }
      case 'rain': {
        this.dissolveText(tl, 'caption-tunnel', 'spiral', 0, 0.8);
        // time almost freezes: decelerate, cards lose orbit and start to fall
        this.moveRig(tl, 0, { z: STATIONS.rainCam.z, x: 0, y: 0, fov: presets.rain.fov, duration: 2.4, ease: 'power3.out' });
        tl.to(this.stage.rig.rotation, { z: 0, duration: 1.5, ease: 'sine.out' }, 0);
        tl.call(() => {
          this.stage.cards.morphTo('rain', { duration: 2, stagger: 0.014, ease: 'power2.inOut' });
        }, undefined, 0.35);
        tl.call(() => this.stage.audio.cue('whoosh'), undefined, 0.1);
        this.revealText(tl, 'caption-rain', 2.4, 2.8);
        break;
      }
      case 'gallery': {
        this.dissolveText(tl, 'caption-rain', 'spiral', 0, 0.8);
        tl.call(() => {
          this.stage.cards.morphTo('gallery', { duration: 2.3, stagger: 0.02, ease: 'back.out(1.15)' });
        }, undefined, 0.3);
        this.moveRig(tl, 0, { z: STATIONS.gallery.focus.z + presets.gallery.distance, fov: presets.gallery.fov, duration: 2.5, ease: 'power2.inOut' });
        this.revealText(tl, 'caption-gallery', 2.2, 2.8);
        tl.call(() => this.stage.audio.cue('gather'), undefined, 0.9);
        break;
      }
      case 'final': {
        this.dissolveText(tl, 'caption-gallery', 'spiral', 0, 0.8);
        tl.call(() => {
          this.stage.cards.morphTo('final', { duration: 2.8, stagger: 0.015, ease: 'power2.inOut' });
        }, undefined, 0.2);
        this.moveRig(tl, 0.1, { z: STATIONS.final.focus.z + presets.final.distance, fov: presets.final.fov, duration: 2.8, ease: 'power2.inOut' });
        this.flare(tl, 1.6, 0.5, 1.6);
        this.revealText(tl, 'final', 2, 4.6);
        this.shimmerSweep(tl, 'final', 6.9);
        this.revealText(tl, 'signature', 4.8, 3);
        tl.call(() => { this.stage.audio.duck(0.75, 2); this.stage.audio.cue('rise'); }, undefined, 1.4);
        break;
      }
      default: break;
    }
  }

  /** Deep link (?scene=...) â€” place the whole world mid-film instantly. */
  jumpTo(scene: SceneName) {
    const presets = experience.camera.presets;
    this.setState({ scene, index: sceneOrder.indexOf(scene), started: true, duration: experience.timings[scene as keyof typeof experience.timings] ?? 0 });
    this.applyGrade(grade(scene), 0);
    const formation: Formation =
      scene === 'sphere' ? 'sphere' : scene === 'tunnel' ? 'tunnel' : scene === 'rain' ? 'rain' :
      scene === 'gallery' ? 'gallery' : scene === 'final' ? 'final' : scene === 'explosion' ? 'burst' : 'hidden';
    this.stage.cards.snapTo(formation, this.stage.camera.aspect);
    const focusZ =
      scene === 'greeting' ? STATIONS.greeting.focus.z : scene === 'letter' ? STATIONS.letter.focus.z :
      scene === 'wish' ? STATIONS.wish.focus.z : scene === 'explosion' ? STATIONS.explosion.focus.z :
      scene === 'sphere' ? STATIONS.sphere.focus.z : scene === 'tunnel' ? STATIONS.tunnelStart - 14 - presets.tunnel.distance :
      scene === 'rain' ? STATIONS.rainCam.z - presets.rain.distance : scene === 'gallery' ? STATIONS.gallery.focus.z :
      scene === 'final' ? STATIONS.final.focus.z : -8;
    const jumpDist = presets[scene].distance * (scene === 'sphere' ? portraitBoost(this.stage.camera.aspect) : 1);
    this.stage.rig.position.set(0, 0, focusZ + jumpDist);
    this.stage.baseFov = presets[scene].fov;
    // show this chapter's texts fully formed
    const show = (key: string) => {
      const spec = this.fields.get(key);
      if (!spec) return;
      spec.field.reset();
      spec.field.u.uReveal.value = 1;
      spec.field.group.visible = true;
    };
    if (scene === 'greeting') { show('greeting'); show('greetingHint'); }
    if (scene === 'letter') show('letter');
    if (scene === 'wish') show('wish');
    if (scene === 'sphere' || scene === 'tunnel' || scene === 'rain' || scene === 'gallery') {
      show(`caption-${scene}`);
      this.stage.captionPlate.material.opacity = 0.6;
    }
    if (scene === 'final') { show('final'); show('signature'); }
    if (scene === 'tunnel') {
      // continue the fly-through from mid-helix
      gsap.to(this.stage.rig.position, { z: STATIONS.tunnelStart + STATIONS.tunnelStep * this.stage.cardCount - 2, duration: 8, ease: 'power2.inOut' });
    }
    this.scheduleAdvance(scene);
  }

  dispose() {
    this.pending?.kill();
    this.timeline?.kill();
    for (const spec of this.fields.values()) spec.field.dispose();
    this.fields.clear();
  }
}
