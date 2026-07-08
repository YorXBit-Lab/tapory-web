import * as THREE from 'three';
import { gsap } from 'gsap';
import { experience } from '../experience';
import { QualityManager } from './quality';
import { AudioDirector } from './audio';
import { Environment } from './environment';
import { CardsModule } from './cards';
import { createPost, PostStack } from './post';
import { Director } from './director';

const burstVertex = /* glsl */`
  attribute vec3 aDir;
  attribute float aSeed;
  uniform float uTime, uStart, uFocal, uPixelRatio;
  uniform vec3 uOrigin;
  varying float vFade;
  varying float vSeed;
  void main(){
    float age = clamp((uTime - uStart) / 1.1, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - age, 3.0);
    vec3 p = uOrigin + aDir * e * (0.8 + aSeed * 1.7);
    p.y -= age * age * 0.45; // stardust settles softly
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, (0.028 + aSeed * 0.05) * (1.0 - age * 0.45) * uPixelRatio * uFocal / max(0.1, -mv.z));
    vFade = 1.0 - age;
    vSeed = aSeed;
  }`;

const burstFragment = /* glsl */`
  varying float vFade;
  varying float vSeed;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 color = mix(vec3(1.0, 0.88, 0.96), vec3(1.0, 0.6, 0.84), vSeed);
    gl_FragColor = vec4(color, smoothstep(0.5, 0.06, d) * vFade * vFade * 0.9);
  }`;

/** A little firework of stardust wherever the viewer touches the film. */
class TapBurst {
  readonly points: THREE.Points;
  readonly uniforms = {
    uTime: { value: 0 }, uStart: { value: -10 },
    uFocal: { value: 800 }, uPixelRatio: { value: 1 },
    uOrigin: { value: new THREE.Vector3() }
  };

  constructor(count = 120) {
    const geometry = new THREE.BufferGeometry();
    const dirs = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dirs[i * 3] = Math.sin(phi) * Math.cos(theta);
      dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      dirs[i * 3 + 2] = Math.cos(phi) * 0.4;
      seeds[i] = Math.random();
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
    const material = new THREE.ShaderMaterial({
      vertexShader: burstVertex, fragmentShader: burstFragment,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending, uniforms: this.uniforms
    });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 55;
  }

  /** ndc â†’ a point 9 units in front of the camera. */
  trigger(ndcX: number, ndcY: number, camera: THREE.PerspectiveCamera, now: number) {
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 9;
    this.uniforms.uOrigin.value.set(ndcX * halfH * camera.aspect, ndcY * halfH, -9);
    this.uniforms.uStart.value = now;
  }
}

/**
 * The shared WebGL stage: one renderer, one scene, one camera rig, one
 * post-processing chain for the entire film. React only attaches/detaches
 * the canvas; all choreography lives in the Director.
 */
export class Stage {
  private static instance: Stage | null = null;
  static get(): Stage {
    if (!Stage.instance) Stage.instance = new Stage();
    return Stage.instance;
  }

  /**
   * Tear the singleton down completely. The config is sampled once per
   * instance, so the next get() rebuilds the film with fresh content.
   */
  static destroy() {
    const s = Stage.instance;
    if (!s) return;
    s.stop();
    s.hostObserver?.disconnect();
    s.hostObserver = null;
    removeEventListener('resize', s.resize);
    document.removeEventListener('visibilitychange', s.onVisibility);
    s.audio.stop();
    s.director.dispose();
    gsap.globalTimeline.clear();
    s.renderer.domElement.remove();
    s.renderer.dispose();
    Stage.instance = null;
  }

  readonly quality = new QualityManager();
  readonly audio = new AudioDirector();
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly rig = new THREE.Group();
  readonly captionAnchor = new THREE.Group();
  readonly captionPlate: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  readonly env: Environment;
  readonly cards: CardsModule;
  readonly post: PostStack;
  readonly director: Director;
  readonly cardCount: number;
  baseFov = experience.camera.presets.intro.fov;
  shake = 0;
  bloomScale = 1;

  private host: HTMLElement | null = null;
  private hostObserver: ResizeObserver | null = null;
  // kích thước khung nhìn hiện tại (theo host nếu có, không thì theo window)
  private viewW = 1;
  private viewH = 1;
  // DPR thực tế đang render — khung nhỏ được boost lên 2 cho sắc nét
  private dpr = 1;
  // bloom theo tier — nhân thêm hệ số khung nhìn trong resize()
  private tierBloom = 1;
  private attachCount = 0;
  private raf = 0;
  private running = false;
  private previous = 0;
  private lastRender = 0;
  private elapsed = 0;
  private pointerX = 0;
  private pointerY = 0;
  private dragging = false;
  private lastDragX = 0;
  private lastDragY = 0;
  // user-driven zoom (wheel / pinch) in the photo chapters
  private zoom = 0;
  private zoomTarget = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private lastPinch = 0;
  private burst = new TapBurst();
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();

  private constructor() {
    const q = this.quality.snapshot;
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(new THREE.Color(experience.colors.black), 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(q.dpr);
    this.renderer.setSize(innerWidth, innerHeight);
    this.scene.fog = new THREE.FogExp2(new THREE.Color(experience.colors.black), 0.012);

    this.camera = new THREE.PerspectiveCamera(this.baseFov, innerWidth / innerHeight, 0.1, 400);
    this.rig.add(this.camera);
    this.camera.add(this.burst.points);
    this.rig.position.set(0, 0, 10);
    this.scene.add(this.rig);
    this.camera.add(this.captionAnchor);

    // soft dark plate guaranteeing caption contrast over busy photo scenes
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256; plateCanvas.height = 96;
    const plateCtx = plateCanvas.getContext('2d')!;
    // elliptical falloff that reaches zero before every canvas edge
    plateCtx.setTransform(1, 0, 0, 96 / 256, 0, 0);
    const plateGradient = plateCtx.createRadialGradient(128, 128, 4, 128, 128, 124);
    plateGradient.addColorStop(0, 'rgba(0,0,0,0.9)');
    plateGradient.addColorStop(0.55, 'rgba(0,0,0,0.55)');
    plateGradient.addColorStop(1, 'rgba(0,0,0,0)');
    plateCtx.fillStyle = plateGradient;
    plateCtx.fillRect(0, 0, 256, 256);
    plateCtx.setTransform(1, 0, 0, 1, 0, 0);
    const plateTexture = new THREE.CanvasTexture(plateCanvas);
    this.captionPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 6.2),
      new THREE.MeshBasicMaterial({ map: plateTexture, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
    );
    this.captionPlate.renderOrder = 39;
    this.captionPlate.position.z = -0.1;
    this.captionAnchor.add(this.captionPlate);

    this.env = new Environment(q.mobile ? 900 : 1600, q.mobile ? 150 : 280);
    this.env.setDensity(q.particleScale);
    this.scene.add(this.env.group);
    this.captionAnchor.add(this.env.flare);
    this.env.flare.position.set(0, 3.2, -1);

    this.cardCount = Math.max(16, Math.round((q.mobile ? 26 : 40) * q.cardScale));
    this.cards = new CardsModule(this.camera, this.cardCount);
    this.scene.add(this.cards.group);

    this.post = createPost(this.renderer, this.scene, this.camera);
    this.post.setSize(innerWidth, innerHeight, q.dpr);
    this.applyTier();

    this.director = new Director(this);
    (window as unknown as { __stage?: Stage }).__stage = this;

    addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.quality.onChange(() => this.applyTier());
    this.resize();
  }

  private applyTier() {
    const q = this.quality.snapshot;
    // medium (mặc định trên mobile) giữ 0.9 — bloom là linh hồn của màu phim,
    // giảm sâu quá là cả phim xỉn lại; tiết kiệm GPU đã có dpr/particle scale lo
    this.tierBloom = q.tier === 'high' ? 1 : q.tier === 'medium' ? 0.9 : 0;
    this.post.bloom.enabled = q.tier !== 'low';
    this.post.grade.uniforms.uGrain.value = q.reducedMotion ? 0 : experience.post.grain * (q.tier === 'low' ? 0.6 : 1);
    this.env.setDensity(q.particleScale);
    this.resize(); // pixel ratio + buffer size đều tính trong resize
  }

  // ---------------------------------------------------------------- lifecycle
  attach(host: HTMLElement) {
    this.attachCount++;
    this.host = host;
    if (this.renderer.domElement.parentElement !== host) host.appendChild(this.renderer.domElement);
    // theo dõi kích thước host — phim có thể chạy nhúng trong khung preview
    this.hostObserver?.disconnect();
    this.hostObserver = new ResizeObserver(() => this.resize());
    this.hostObserver.observe(host);
    host.addEventListener('pointermove', this.onPointerMove);
    host.addEventListener('pointerdown', this.onPointerDown);
    host.addEventListener('pointerup', this.onPointerUp);
    host.addEventListener('pointercancel', this.onPointerUp);
    host.addEventListener('wheel', this.onWheel, { passive: false });
    this.resize();
    this.start();
  }

  detach(host: HTMLElement) {
    this.attachCount = Math.max(0, this.attachCount - 1);
    host.removeEventListener('pointermove', this.onPointerMove);
    host.removeEventListener('pointerdown', this.onPointerDown);
    host.removeEventListener('pointerup', this.onPointerUp);
    host.removeEventListener('pointercancel', this.onPointerUp);
    host.removeEventListener('wheel', this.onWheel);
    if (this.attachCount === 0) {
      this.stop();
      this.hostObserver?.disconnect();
      this.hostObserver = null;
      this.renderer.domElement.remove();
      this.host = null;
    }
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.previous = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  // ---------------------------------------------------------------- events
  private onVisibility = () => {
    if (document.hidden) gsap.globalTimeline.pause();
    else {
      gsap.globalTimeline.resume();
      this.previous = performance.now();
    }
  };

  private zoomableScene() {
    const scene = this.director?.state.scene;
    return scene === 'sphere' || scene === 'gallery';
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.zoomableScene()) return;
    e.preventDefault();
    this.zoomTarget = THREE.MathUtils.clamp(this.zoomTarget - e.deltaY * 0.006, -3, 6.5);
  };

  /** Tap anywhere: stardust burst; tap a photo: it pulses. Returns true if a card was hit. */
  tapInteract(clientX: number, clientY: number): boolean {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    );
    this.burst.trigger(this.ndc.x, this.ndc.y, this.camera, this.elapsed);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.cards.pulseAt(this.raycaster);
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    this.cards.setPointer(this.pointerX, this.pointerY);
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // two-finger pinch = zoom (sphere chapter only)
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const pinch = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.lastPinch > 0 && this.zoomableScene()) {
        this.zoomTarget = THREE.MathUtils.clamp(this.zoomTarget + (pinch - this.lastPinch) * 0.02, -3, 6.5);
      }
      this.lastPinch = pinch;
      return;
    }
    if (this.dragging) {
      const dx = e.clientX - this.lastDragX;
      const dy = e.clientY - this.lastDragY;
      this.cards.drag(dx, dy);
      this.director?.dragText(dx, dy, this.elapsed);
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size >= 2) {
      // second finger down: stop rotating, start pinching
      this.dragging = false;
      this.cards.endDrag();
      this.lastPinch = 0;
      return;
    }
    this.dragging = true;
    this.lastDragX = e.clientX;
    this.lastDragY = e.clientY;
    this.cards.beginDrag();
    this.host?.setPointerCapture?.(e.pointerId);
  };

  private onPointerUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    this.lastPinch = 0;
    this.dragging = false;
    this.cards.endDrag();
  };

  resize = () => {
    const q = this.quality.snapshot;
    // getBoundingClientRect: kích thước thật trên màn hình — preview trong editor
    // bị scale bằng CSS transform nên clientWidth nhỏ hơn kích thước hiển thị
    const rect = this.host?.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect?.width || innerWidth));
    const h = Math.max(1, Math.round(rect?.height || innerHeight));
    this.viewW = w;
    this.viewH = h;
    // khung nhỏ: buffer rẻ nên render ở DPR 2 (supersample) — chữ hạt và bloom
    // mới sắc nét; fullscreen giữ cap của quality tier để không quá tải GPU
    const small = w * h < innerWidth * innerHeight * 0.5;
    this.dpr = small ? 2 : q.dpr;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h);
    this.post.setSize(w, h, this.dpr);
    // buffer hẹp: hạt chữ dồn vào ít pixel (additive) nên tự sáng hơn — ghìm
    // bloom theo bề rộng buffer thật (chuẩn = desktop bản gốc ~1600 device px)
    // để lõi chữ không cháy trắng trong preview nhỏ nhưng không xỉn trên phone
    this.bloomScale = this.tierBloom * THREE.MathUtils.clamp((w * this.dpr) / 1500, 0.6, 1);
    this.director?.refit();
  };

  // ---------------------------------------------------------------- loop
  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden) { this.previous = now; return; }

    const state = this.director?.state;
    const q = this.quality.snapshot;
    const cap = !state?.started
      ? experience.quality.backgroundFps
      : state.scene === 'final' ? Math.min(45, q.targetFps) : q.targetFps;
    if (now - this.lastRender < 1000 / cap) return;
    this.lastRender = now;

    const dt = Math.min(0.05, (now - this.previous) / 1000);
    this.previous = now;
    this.elapsed += dt;
    const t = this.elapsed;
    this.quality.tick(now);

    // camera: parallax + shake + lens breathing on top of the rig
    const reduced = q.reducedMotion;
    // micro camera drift: two incommensurate sine waves â‰ˆ hand-held life
    const driftX = reduced ? 0 : Math.sin(t * 0.13) * 0.05 + Math.sin(t * 0.047) * 0.035;
    const driftY = reduced ? 0 : Math.cos(t * 0.11) * 0.035 + Math.sin(t * 0.067) * 0.025;
    const parallaxX = this.pointerX * 0.32 + driftX;
    const parallaxY = -this.pointerY * 0.2 + driftY;
    this.camera.position.x += (parallaxX - this.camera.position.x) * 0.04;
    this.camera.position.y += (parallaxY - this.camera.position.y) * 0.04;
    if (this.shake > 0.001 && !reduced) {
      this.camera.position.x += Math.sin(t * 91) * this.shake * 0.12;
      this.camera.position.y += Math.cos(t * 83) * this.shake * 0.1;
    }
    // user zoom: damped dolly on the camera's local axis; eases home
    // automatically once the film moves past the sphere
    if (!this.zoomableScene()) this.zoomTarget *= 0.94;
    this.zoom += (this.zoomTarget - this.zoom) * 0.08;
    this.camera.position.z = -this.zoom;

    const breath = reduced ? 0 : Math.sin(t * 0.3) * 0.18;
    this.camera.fov = this.baseFov + breath;
    this.camera.updateProjectionMatrix();

    const focal = this.viewH / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    this.burst.uniforms.uTime.value = t;
    this.burst.uniforms.uFocal.value = focal;
    this.burst.uniforms.uPixelRatio.value = this.dpr;
    this.env.setView(focal, this.dpr);
    this.env.update(t, this.rig.position);
    this.cards.update(dt, t);
    this.director?.forEachField(field => {
      field.tick(t, dt, this.pointerX, this.pointerY, reduced);
      field.setView(focal, this.dpr);
      if (reduced) field.u.uWave.value = 0.15;
    });

    this.post.composer.render();
  };
}
