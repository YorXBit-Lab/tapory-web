import * as THREE from 'three';
import { gsap } from 'gsap';
import { experience } from '../experience';

export type Formation = 'hidden' | 'burst' | 'sphere' | 'tunnel' | 'rain' | 'gallery' | 'final';

/** World-space stations the camera travels through. One continuous universe. */
export const STATIONS = {
  intro: { focus: new THREE.Vector3(0, 0, -8) },
  greeting: { focus: new THREE.Vector3(0, 0, -40) },
  letter: { focus: new THREE.Vector3(0, 0, -90) },
  wish: { focus: new THREE.Vector3(0, 0, -140) },
  explosion: { focus: new THREE.Vector3(0, 0, -172) },
  sphere: { focus: new THREE.Vector3(0, 0, -200) },
  tunnelStart: -208,
  tunnelStep: -3.4,
  rainCam: new THREE.Vector3(0, 0, -330),
  gallery: { focus: new THREE.Vector3(0, 0, -372) },
  final: { focus: new THREE.Vector3(0, 0, -420) }
} as const;

const SPHERE_RADIUS = 5.4;
const CARD_W = 1.5, CARD_H = 1.875;

type CardData = {
  seed: number;
  homeQuat: THREE.Quaternion;
  sphereBase: THREE.Vector3;     // offset from sphere centre, unrotated
  sphereQuat: THREE.Quaternion;  // surface orientation, unrotated
  face: number;                  // 0 = keep surface orientation, 1 = full billboard
  layer: 0 | 1 | 2;              // rain depth layer: fg / mid / bg
  fallSpeed: number;
  spin: number;
};

type Card = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> & { userData: CardData };

const RAIN_LAYERS = [
  { dz: -7, jitter: 1.6, scale: 2.05, speed: 2.1, spreadX: 8.5, minX: 3.2 },
  { dz: -13, jitter: 2.2, scale: 1.35, speed: 1.35, spreadX: 10, minX: 0 },
  { dz: -20, jitter: 3, scale: 0.82, speed: 0.85, spreadX: 13, minX: 0 }
] as const;

// Asymmetric floating-gallery slots: hero + supports + deliberate negative space.
const GALLERY_SLOTS: Array<{ x: number; y: number; z: number; s: number; o: number }> = [
  { x: -3.4, y: 0.25, z: 4, s: 2.55, o: 1 },       // hero
  { x: 3.9, y: 1.7, z: 1.4, s: 1.55, o: 1 },
  { x: 5.7, y: -1.9, z: -0.6, s: 1.3, o: 0.95 },
  { x: -6.3, y: 2.5, z: -2.2, s: 1.2, o: 0.9 },
  { x: -5.2, y: -2.7, z: 0.4, s: 1.45, o: 0.95 },
  { x: 1.3, y: -3, z: -2.6, s: 1.15, o: 0.85 },
  { x: 7.4, y: 2.9, z: -4.2, s: 1, o: 0.75 },
  { x: -2, y: 3.6, z: -4.6, s: 1, o: 0.75 },
  { x: -8.3, y: 0.2, z: -5.5, s: 0.9, o: 0.6 },
  { x: 4.3, y: -3.6, z: -6, s: 0.9, o: 0.6 },
  { x: 8.9, y: -0.4, z: -8, s: 0.8, o: 0.5 },
  { x: -4.6, y: -0.6, z: -9, s: 0.75, o: 0.45 },
  { x: 0.8, y: 2.2, z: -10, s: 0.7, o: 0.4 },
  { x: -1.4, y: -2, z: -11.5, s: 0.7, o: 0.35 }
];

function bakeCardTexture(url: string, onReady: () => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 640;
  const ctx = canvas.getContext('2d')!;
  const paintFallback = () => {
    const g = ctx.createLinearGradient(0, 0, 512, 640);
    g.addColorStop(0, '#472040'); g.addColorStop(0.55, '#8a2a60'); g.addColorStop(1, '#d76d9d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 640);
  };
  paintFallback();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const image = new Image();
  image.decoding = 'async';
  // remote photos (Cloudinary/R2) must not taint the canvas â†’ WebGL texture
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    ctx.clearRect(0, 0, 512, 640);
    ctx.save();
    roundedRect(ctx, 6, 6, 500, 628, 30);
    ctx.clip();
    const ir = image.naturalWidth / image.naturalHeight, cr = 512 / 640;
    let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight;
    if (ir > cr) { sw = image.naturalHeight * cr; sx = (image.naturalWidth - sw) / 2; }
    else { sh = image.naturalWidth / cr; sy = (image.naturalHeight - sh) / 2; }
    // gentle lift only â€” keep photos looking like photos
    ctx.filter = 'brightness(1.08) saturate(1.08) contrast(1.05)';
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 512, 640);
    ctx.filter = 'none';
    // frosted-glass sheen top corner + faint warm base
    const sheen = ctx.createLinearGradient(0, 0, 400, 520);
    sheen.addColorStop(0, 'rgba(255,255,255,0.16)');
    sheen.addColorStop(0.3, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(255,180,150,0.06)');
    ctx.fillStyle = sheen; ctx.fillRect(0, 0, 512, 640);
    ctx.restore();
    // luminous 1px edge
    roundedRect(ctx, 6, 6, 500, 628, 30);
    ctx.strokeStyle = 'rgba(255,236,246,0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    roundedRect(ctx, 9, 9, 494, 622, 27);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 6;
    ctx.stroke();
    texture.needsUpdate = true;
    onReady();
  };
  image.onerror = () => { paintFallback(); texture.needsUpdate = true; onReady(); };
  image.src = url;
  return texture;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const tmpQuat = new THREE.Quaternion();
const tmpQuat2 = new THREE.Quaternion();
const tmpMat = new THREE.Matrix4();
const tmpVec = new THREE.Vector3();
const tmpVec2 = new THREE.Vector3();
const tmpEuler = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);

/**
 * One persistent pool of photo cards that morphs between formations.
 * Geometry and textures are created once; formations only retarget transforms,
 * so every transition is physical motion inside the same world.
 */
export class CardsModule {
  readonly group = new THREE.Group();
  formation: Formation = 'hidden';
  ready: Promise<void>;
  private cards: Card[] = [];
  private textures: THREE.CanvasTexture[] = [];
  private geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
  private decoration = new THREE.Group();
  private decorationMaterials: THREE.Material[] = [];
  private decorationGeometries: THREE.BufferGeometry[] = [];
  private angleX = 0; private angleY = 0;
  private rotVelX = 0; private rotVelY = 0;
  private galleryRot = 0;
  private galleryRotSmooth = 0;
  private dragging = false;
  private age = 0;              // seconds since last morph
  private settleTime = 0;       // when procedural motion may take over positions
  private pointer = new THREE.Vector2();
  private camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera, count: number) {
    this.camera = camera;
    let loaded = 0;
    let resolveReady: () => void = () => undefined;
    this.ready = new Promise<void>(res => { resolveReady = res; });
    const urls = experience.photoUrls;
    if (urls.length === 0) resolveReady();
    this.textures = urls.map(url => bakeCardTexture(url, () => { if (++loaded >= urls.length) resolveReady(); }));

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: this.textures[i % this.textures.length],
        transparent: true, opacity: 0, side: THREE.DoubleSide,
        depthWrite: true, fog: true
      });
      const card = new THREE.Mesh(this.geometry, material) as unknown as Card;
      card.visible = false;
      card.userData = {
        seed: (i * 0.6180339887) % 1,
        homeQuat: new THREE.Quaternion(),
        sphereBase: new THREE.Vector3(),
        sphereQuat: new THREE.Quaternion(),
        face: 1,
        layer: (i % 10 < 2 ? 0 : i % 10 < 5 ? 1 : 2) as 0 | 1 | 2,
        fallSpeed: 1,
        spin: (Math.random() - 0.5) * 0.5
      };
      this.group.add(card);
      this.cards.push(card);
    }
    this.buildDecoration();
    this.group.add(this.decoration);
  }

  private buildDecoration() {
    this.decoration.position.copy(STATIONS.sphere.focus);
    const coreCanvas = document.createElement('canvas');
    coreCanvas.width = coreCanvas.height = 128;
    const cctx = coreCanvas.getContext('2d')!;
    const g = cctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,240,250,0.9)'); g.addColorStop(0.4, 'rgba(255,120,190,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cctx.fillStyle = g; cctx.fillRect(0, 0, 128, 128);
    const coreTexture = new THREE.CanvasTexture(coreCanvas);
    const coreMaterial = new THREE.SpriteMaterial({ map: coreTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const core = new THREE.Sprite(coreMaterial);
    core.scale.setScalar(6.5);
    this.decoration.add(core);
    this.decorationMaterials.push(coreMaterial);
    [6.6, 7.15].forEach((radius, i) => {
      const geometry = new THREE.TorusGeometry(radius, 0.008 + i * 0.004, 6, 128);
      const material = new THREE.MeshBasicMaterial({
        color: i ? 0x9b5cff : 0xffb8d9, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.set(Math.PI / 2.4 + i * 0.5, i * 0.7, 0);
      this.decoration.add(ring);
      this.decorationGeometries.push(geometry);
      this.decorationMaterials.push(material);
    });
    const dustCount = 140;
    const dustGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2, r = 5.8 + Math.random() * 2.2, y = (Math.random() - 0.5) * 3;
      positions[i * 3] = Math.cos(a) * r; positions[i * 3 + 1] = y; positions[i * 3 + 2] = Math.sin(a) * r;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: 0xe9c8ff, size: 0.045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    this.decoration.add(dust);
    this.decorationGeometries.push(dustGeometry);
    this.decorationMaterials.push(dustMaterial);
  }

  setPointer(x: number, y: number) { this.pointer.set(x, y); }
  beginDrag() { this.dragging = this.formation === 'sphere' || this.formation === 'gallery'; }
  endDrag() { this.dragging = false; }
  drag(dx: number, dy: number) {
    if (!this.dragging) return;
    if (this.formation === 'gallery') {
      // tilt the whole gallery slightly â€” like leaning around the frames
      this.galleryRot = THREE.MathUtils.clamp(this.galleryRot + dx * 0.0014, -0.24, 0.24);
      return;
    }
    this.rotVelY = dx * 0.0045;
    this.rotVelX = dy * 0.0028;
  }

  /** Tap a photo â†’ it pulses like a heartbeat. True if one was hit. */
  pulseAt(raycaster: THREE.Raycaster): boolean {
    const interactive = this.formation === 'sphere' || this.formation === 'gallery' || this.formation === 'rain';
    if (!interactive || this.age <= this.settleTime) return false;
    const hits = raycaster.intersectObjects(this.cards as unknown as THREE.Object3D[], false);
    const card = hits[0]?.object as Card | undefined;
    if (!card || !card.visible) return false;
    const s = card.scale.x;
    gsap.timeline()
      .to(card.scale, { x: s * 1.16, y: s * 1.16, z: s * 1.16, duration: 0.16, ease: 'power2.out' })
      .to(card.scale, { x: s, y: s, z: s, duration: 0.45, ease: 'back.out(2.2)' });
    return true;
  }

  /** The card the tunnel transition dives through. */
  portalCard(): Card { return this.cards[0]; }

  private widthFactor(aspect: number) { return THREE.MathUtils.clamp(aspect / 1.65, 0.5, 1); }

  targetsFor(formation: Formation, aspect: number, snap = false) {
    const n = this.cards.length;
    const wf = this.widthFactor(aspect);
    return this.cards.map((card, i) => {
      const d = card.userData;
      const out = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1, opacity: 1, face: 1 };
      if (formation === 'burst') {
        const theta = d.seed * Math.PI * 2, phi = Math.acos(2 * ((i + 0.5) / n) - 1);
        out.pos.setFromSphericalCoords(16 + d.seed * 18, phi, theta).add(STATIONS.explosion.focus);
        out.scale = 0.12; out.opacity = 0; out.face = 1;
      } else if (formation === 'sphere') {
        const shrink = 0.55 + wf * 0.45; // keep the full silhouette on portrait screens
        const phi = Math.acos(1 - 2 * (i + 0.5) / n);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        d.sphereBase.setFromSphericalCoords(SPHERE_RADIUS * shrink, phi, theta);
        out.pos.copy(d.sphereBase).add(STATIONS.sphere.focus);
        // face outward along the surface normal
        tmpVec.copy(out.pos).add(d.sphereBase);
        tmpMat.lookAt(tmpVec, STATIONS.sphere.focus, UP);
        out.quat.setFromRotationMatrix(tmpMat);
        d.sphereQuat.copy(out.quat);
        out.scale = 1.18 * shrink; out.opacity = 1; out.face = 0.3; // ~70% keeps the curvature
      } else if (formation === 'tunnel') {
        const angle = i * 2.44;
        const radius = 4.1 + ((i % 3) - 1) * 0.55;
        out.pos.set(Math.cos(angle) * radius * wf, Math.sin(angle) * radius * 0.82, STATIONS.tunnelStart + i * STATIONS.tunnelStep);
        // tilt toward the flight path
        tmpVec.set(out.pos.x * 0.2, out.pos.y * 0.2, out.pos.z + 9);
        tmpMat.lookAt(tmpVec, out.pos, UP);
        out.quat.setFromRotationMatrix(tmpMat);
        out.scale = 1.5; out.opacity = 1; out.face = 0.2;
      } else if (formation === 'rain') {
        const layer = RAIN_LAYERS[d.layer];
        // snap: even vertical spread; morph: keep continuity with current height
        const y = snap
          ? -9 + ((i * 0.618034) % 1) * 18
          : THREE.MathUtils.clamp(card.position.y * 1.2, -6, 6) + (d.seed - 0.3) * 5;
        out.pos.set(this.rainX(d, layer), y, STATIONS.rainCam.z + layer.dz + (d.seed - 0.5) * layer.jitter * 2);
        out.quat.identity();
        out.scale = layer.scale * (0.9 + d.seed * 0.2);
        out.opacity = d.layer === 2 ? 0.72 : 1;
        out.face = 0.85;
      } else if (formation === 'gallery') {
        const slot = GALLERY_SLOTS[i];
        if (slot) {
          out.pos.set(slot.x * wf, slot.y, STATIONS.gallery.focus.z + slot.z);
          out.scale = slot.s * (wf < 0.7 ? 0.8 : 1); out.opacity = slot.o;
        } else {
          const a = d.seed * Math.PI * 2;
          out.pos.set(Math.cos(a) * 14 * wf, Math.sin(a * 1.7) * 7, STATIONS.gallery.focus.z - 14 - d.seed * 8);
          out.scale = 0.6; out.opacity = 0.22;
        }
        out.quat.identity(); out.face = 0.9;
      } else if (formation === 'final') {
        const a = d.seed * Math.PI * 2 + i;
        out.pos.set(Math.cos(a) * (7 + d.seed * 9) * wf, Math.sin(a * 1.3) * 5, STATIONS.final.focus.z - 12 - d.seed * 16);
        out.quat.identity();
        out.scale = 0.7 + d.seed * 0.4; out.opacity = 0.2; out.face = 1;
      } else { // hidden
        out.pos.set(0, 0, 40); out.scale = 0.01; out.opacity = 0; out.face = 1;
      }
      return out;
    });
  }

  /** Visible half-width of the frustum at a rain layer's depth (slight overscan). */
  private rainHalfWidth(layer: (typeof RAIN_LAYERS)[number]) {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    return Math.tan(fovRad / 2) * this.camera.aspect * Math.abs(layer.dz) * 1.12;
  }

  private rainX(d: CardData, layer: (typeof RAIN_LAYERS)[number]) {
    const halfWidth = this.rainHalfWidth(layer);
    const spread = Math.min(layer.spreadX, halfWidth);
    let x = (d.seed * 2 - 1) * spread;
    // keep the caption corridor (screen centre-bottom) clear of foreground cards
    const corridor = Math.min(layer.minX, halfWidth * 0.5);
    if (corridor > 0 && Math.abs(x) < corridor) x = (d.seed > 0.5 ? 1 : -1) * (corridor + d.seed * (spread - corridor));
    return x;
  }

  /** Choreographed retarget. Cards physically travel to the next formation. */
  morphTo(formation: Formation, opts: { duration?: number; stagger?: number; ease?: string; aspect?: number } = {}) {
    const { duration = 2.2, stagger = 0.018, ease = 'power3.inOut', aspect = this.camera.aspect } = opts;
    const targets = this.targetsFor(formation, aspect);
    this.formation = formation;
    this.age = 0;
    this.settleTime = duration + stagger * this.cards.length + 0.1;
    this.angleX = this.angleY = 0;
    this.rotVelX = this.rotVelY = 0;
    this.cards.forEach((card, i) => {
      const target = targets[i];
      card.visible = true;
      card.rotation.reorder('XYZ');
      gsap.killTweensOf([card.position, card.scale, card.material, card.userData]);
      const delay = stagger * i;
      gsap.to(card.position, { x: target.pos.x, y: target.pos.y, z: target.pos.z, duration, delay, ease, overwrite: 'auto' });
      gsap.to(card.scale, { x: target.scale, y: target.scale, z: target.scale, duration, delay, ease, overwrite: 'auto' });
      gsap.to(card.material, { opacity: target.opacity, duration: duration * 0.7, delay, ease: 'sine.inOut', overwrite: 'auto' });
      gsap.to(card.userData, { face: target.face, duration, delay, ease: 'sine.inOut', overwrite: 'auto' });
      card.userData.homeQuat.copy(target.quat);
      card.userData.fallSpeed = RAIN_LAYERS[card.userData.layer].speed * (0.85 + card.userData.seed * 0.35);
    });
    this.decoration.scale.setScalar(0.55 + this.widthFactor(aspect) * 0.45);
    this.fadeDecoration(formation === 'sphere');
  }

  private fadeDecoration(show: boolean) {
    this.decorationMaterials.forEach((m, i) => {
      const target = show ? (i === 0 ? 0.5 : i === 3 ? 0.45 : 0.15) : 0;
      gsap.to(m, { opacity: target, duration: 1.6, ease: 'sine.inOut', overwrite: 'auto' });
    });
  }

  /** Instantly place cards in a formation (deep links / replay). */
  snapTo(formation: Formation, aspect: number) {
    const targets = this.targetsFor(formation, aspect, true);
    this.formation = formation;
    this.age = this.settleTime = 0;
    this.angleX = this.angleY = this.rotVelX = this.rotVelY = 0;
    this.cards.forEach((card, i) => {
      gsap.killTweensOf([card.position, card.scale, card.material, card.userData]);
      const target = targets[i];
      card.visible = formation !== 'hidden';
      card.position.copy(target.pos);
      card.scale.setScalar(target.scale);
      card.material.opacity = target.opacity;
      card.userData.face = target.face;
      card.userData.homeQuat.copy(target.quat);
      card.quaternion.copy(target.quat);
    });
    if (formation === 'rain') this.age = 10; // gravity already settled
    this.decorationMaterials.forEach((m, i) => { m.opacity = formation === 'sphere' ? (i === 0 ? 0.5 : i === 3 ? 0.45 : 0.15) : 0; });
  }

  update(dt: number, t: number) {
    const mode = this.formation;
    if (mode === 'hidden') return;
    this.age += dt;
    const settled = this.age > this.settleTime;
    const cameraPos = tmpVec2.setFromMatrixPosition(this.camera.matrixWorld);
    const wf = this.widthFactor(this.camera.aspect);

    if (mode === 'sphere') {
      if (settled) {
        if (!this.dragging) {
          this.rotVelY += (0.0018 - this.rotVelY) * 0.02; // ease toward idle orbit
          this.rotVelX *= 0.95;
        }
        this.angleY += this.rotVelY;
        this.angleX = THREE.MathUtils.clamp(this.angleX + this.rotVelX, -0.55, 0.55);
        if (!this.dragging) { this.rotVelX *= 0.94; }
        tmpQuat2.setFromEuler(tmpEuler.set(this.angleX, this.angleY, 0, 'YXZ'));
        for (const card of this.cards) {
          const d = card.userData;
          card.position.copy(d.sphereBase).applyQuaternion(tmpQuat2).add(STATIONS.sphere.focus);
          d.homeQuat.copy(tmpQuat2).multiply(d.sphereQuat);
        }
      }
      this.decoration.rotation.y = t * 0.05;
      this.decoration.rotation.z = Math.sin(t * 0.1) * 0.04;
    }

    if (mode === 'rain' && settled) {
      const gravity = Math.min(1, (this.age - this.settleTime) / 2.2); // soft freeze-then-fall
      const wind = Math.sin(t * 0.4) * 0.3;
      for (const card of this.cards) {
        const d = card.userData;
        card.position.y -= d.fallSpeed * gravity * dt * 1.15;
        card.position.x += (Math.sin(t * 0.7 + d.seed * 9) * 0.12 + wind * (d.layer === 0 ? 0.6 : 1)) * dt;
        if (card.position.y < -9.5) {
          const layer = RAIN_LAYERS[d.layer];
          d.seed = Math.random();
          card.position.y = 9.5 + Math.random() * 4;
          card.position.x = this.rainX(d, layer);
          card.position.z = STATIONS.rainCam.z + layer.dz + (d.seed - 0.5) * layer.jitter * 2;
          d.fallSpeed = layer.speed * (0.85 + d.seed * 0.35);
        }
      }
    } else if (mode === 'gallery' && settled) {
      for (const card of this.cards) {
        const d = card.userData;
        card.position.y += Math.sin(t * 0.6 + d.seed * 11) * dt * 0.08;
        card.position.x += Math.cos(t * 0.5 + d.seed * 7) * dt * 0.05;
      }
    } else if (mode === 'final' && settled) {
      for (const card of this.cards) {
        const d = card.userData;
        card.position.x += Math.sin(t * 0.15 + d.seed * 8) * dt * 0.1;
        card.position.y += Math.cos(t * 0.12 + d.seed * 5) * dt * 0.08;
      }
    }

    // multi-layer pointer parallax + drag orbit (gallery only), eased back elsewhere
    if (mode === 'gallery') {
      if (!this.dragging) this.galleryRot *= 0.97;
      this.galleryRotSmooth += (this.galleryRot - this.galleryRotSmooth) * 0.08;
      // orbit about the gallery's own centre: rotate the group, then
      // counter-translate so the pivot stays put (group origin is world 0)
      const z0 = STATIONS.gallery.focus.z;
      const rot = this.galleryRotSmooth;
      this.group.rotation.y = rot;
      const targetX = this.pointer.x * 0.9 - z0 * Math.sin(rot);
      const targetZ = z0 * (1 - Math.cos(rot));
      this.group.position.x += (targetX - this.group.position.x) * 0.06;
      this.group.position.y += ((-this.pointer.y * 0.55) - this.group.position.y) * 0.03;
      this.group.position.z += (targetZ - this.group.position.z) * 0.06;
    } else {
      this.galleryRot = this.galleryRotSmooth = 0;
      this.group.position.x *= 0.95;
      this.group.position.y *= 0.95;
      this.group.position.z *= 0.9;
      this.group.rotation.y *= 0.9;
    }

    // orientation: damped pursuit of blend(surface orientation â†’ camera billboard)
    const damp = Math.min(1, dt * 5);
    for (const card of this.cards) {
      const d = card.userData;
      tmpMat.lookAt(cameraPos, card.position, UP);
      tmpQuat.setFromRotationMatrix(tmpMat);
      const mix = 0.2 + d.face * 0.65; // billboard constraint 60â€“85%
      tmpQuat.slerp(d.homeQuat, 1 - mix);
      if (mode === 'rain') {
        // gentle tumble on top of the billboard, quaternion-safe
        tmpQuat2.setFromEuler(tmpEuler.set(Math.sin(t * 0.5 + d.seed * 9) * 0.18, 0, Math.sin(t * 0.4 + d.seed * 12) * (0.22 + d.spin), 'XYZ'));
        tmpQuat.multiply(tmpQuat2);
      }
      card.quaternion.slerp(tmpQuat, damp);
    }
  }

  reset() {
    this.snapTo('hidden', this.camera.aspect);
    this.group.position.set(0, 0, 0);
  }

  dispose() {
    this.cards.forEach(card => { gsap.killTweensOf([card.position, card.scale, card.material, card.userData]); card.material.dispose(); });
    this.textures.forEach(t => t.dispose());
    this.geometry.dispose();
    this.decorationGeometries.forEach(g => g.dispose());
    this.decorationMaterials.forEach(m => m.dispose());
  }
}
