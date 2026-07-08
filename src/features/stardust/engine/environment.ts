import * as THREE from 'three';
import { SceneGrade } from '../experience';

const starVertex = /* glsl */`
  attribute float aSeed;
  uniform float uTime, uWarp, uPixelRatio, uFocal;
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uColorA, uColorB, uColorC;
  void main(){
    vec3 p = position;
    // warp: stars rush past the camera along +z, reads as streaks at speed
    float travel = mod(aSeed * 90.0 + uTime * (2.0 + uWarp * 55.0), 90.0);
    p.z = 45.0 - travel;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (0.055 + aSeed * 0.13) * (1.0 + uWarp * 2.4);
    gl_PointSize = max(1.0, size * uPixelRatio * uFocal / max(0.1, -mv.z));
    vColor = aSeed > 0.82 ? uColorC : mix(uColorA, uColorB, aSeed);
    float twinkle = 0.72 + 0.28 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 40.0);
    vAlpha = (0.22 + aSeed * 0.6) * twinkle * (1.0 + uWarp * 0.8);
  }`;

const starFragment = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.08, d) * vAlpha);
  }`;

const dustVertex = /* glsl */`
  attribute float aSeed;
  uniform float uTime, uPixelRatio, uFocal;
  varying float vAlpha;
  void main(){
    vec3 p = position;
    p.x += sin(uTime * 0.11 + aSeed * 12.0) * 2.4;
    p.y += cos(uTime * 0.09 + aSeed * 9.0) * 1.8 + sin(uTime * 0.05) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.5, (0.45 + aSeed * 1.3) * uPixelRatio * uFocal / max(0.1, -mv.z));
    vAlpha = 0.028 + aSeed * 0.04;
  }`;

const dustFragment = /* glsl */`
  uniform vec3 uColor;
  varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }`;

function radialTexture(inner: string, outer: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.45, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function streakTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 8, 512, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Deep-space environment that travels with the camera rig: twinkling stars,
 * volumetric dust motes, tinted nebula veils and an anamorphic flare streak.
 * Palette is retinted per chapter via setGrade().
 */
export class Environment {
  readonly group = new THREE.Group();
  readonly flare: THREE.Mesh;
  readonly flareMaterial: THREE.MeshBasicMaterial;
  readonly starUniforms = {
    uTime: { value: 0 }, uWarp: { value: 0 }, uPixelRatio: { value: 1 }, uFocal: { value: 800 },
    uColorA: { value: new THREE.Color('#8fa3ff') },
    uColorB: { value: new THREE.Color('#b48cff') },
    uColorC: { value: new THREE.Color('#f4f6ff') }
  };
  readonly dustUniforms = {
    uTime: { value: 0 }, uPixelRatio: { value: 1 }, uFocal: { value: 800 },
    uColor: { value: new THREE.Color('#8fa3ff') }
  };
  private nebulaMaterials: THREE.SpriteMaterial[] = [];
  private nebulaTargets: THREE.Color[] = [];
  private disposables: Array<{ dispose(): void }> = [];
  private stars: THREE.Points;
  private dust: THREE.Points;
  private nebulaGroup = new THREE.Group();
  private shootingStar: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private shootStart = -10;
  private shootNext = 7;
  private shootFrom = new THREE.Vector3();
  private shootDir = new THREE.Vector3();

  constructor(starCount: number, dustCount: number) {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSeeds = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 70;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 46;
      starPositions[i * 3 + 2] = 45 - Math.random() * 90;
      starSeeds[i] = Math.random();
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('aSeed', new THREE.BufferAttribute(starSeeds, 1));
    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertex, fragmentShader: starFragment, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.starUniforms
    });
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.stars.frustumCulled = false;
    this.group.add(this.stars);
    this.disposables.push(starGeometry, starMaterial);

    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 36;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      dustPositions[i * 3 + 2] = 8 - Math.random() * 40;
      dustSeeds[i] = Math.random();
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));
    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: dustVertex, fragmentShader: dustFragment, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.dustUniforms
    });
    this.dust = new THREE.Points(dustGeometry, dustMaterial);
    this.dust.frustumCulled = false;
    this.group.add(this.dust);
    this.disposables.push(dustGeometry, dustMaterial);

    // Nebula veils: three big soft sprites far behind everything.
    const nebulaTexture = radialTexture('rgba(255,255,255,0.85)', 'rgba(255,255,255,0.28)');
    this.disposables.push(nebulaTexture);
    const placements = [
      { x: -22, y: 8, z: -75, s: 130, o: 0.09 },
      { x: 26, y: -10, z: -82, s: 150, o: 0.075 },
      { x: 0, y: 2, z: -90, s: 190, o: 0.06 },
      { x: 8, y: 14, z: -80, s: 110, o: 0.05 }
    ];
    placements.forEach(p => {
      const material = new THREE.SpriteMaterial({
        map: nebulaTexture, transparent: true, opacity: p.o,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
        color: new THREE.Color('#2a1b5e')
      });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(p.x, p.y, p.z);
      sprite.scale.setScalar(p.s);
      sprite.renderOrder = -10;
      this.nebulaGroup.add(sprite);
      this.nebulaMaterials.push(material);
      this.nebulaTargets.push(material.color.clone());
      this.disposables.push(material);
    });
    this.group.add(this.nebulaGroup);

    // Anamorphic flare: a razor-thin additive streak, camera-space, off by default.
    const flareTexture = streakTexture();
    this.flareMaterial = new THREE.MeshBasicMaterial({
      map: flareTexture, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
      color: new THREE.Color('#ffd6ee')
    });
    this.flare = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.42), this.flareMaterial);
    this.flare.renderOrder = 60;
    this.flare.frustumCulled = false;
    this.disposables.push(flareTexture, this.flareMaterial, this.flare.geometry);

    // occasional shooting star crossing the deep background
    const shootMaterial = new THREE.MeshBasicMaterial({
      map: flareTexture, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
      color: new THREE.Color('#d9e2ff')
    });
    this.shootingStar = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.09), shootMaterial);
    this.shootingStar.renderOrder = -5;
    this.shootingStar.frustumCulled = false;
    this.shootingStar.visible = false;
    this.group.add(this.shootingStar);
    this.disposables.push(shootMaterial, this.shootingStar.geometry);
  }

  setGrade(grade: SceneGrade) {
    // gsap-friendly: tween happens in Environment.update; here we just set targets
    this.nebulaTargets.forEach((target, i) => target.set(i % 2 ? grade.nebulaB : grade.nebulaA));
  }

  setView(focalPx: number, pixelRatio: number) {
    this.starUniforms.uFocal.value = focalPx;
    this.starUniforms.uPixelRatio.value = pixelRatio;
    this.dustUniforms.uFocal.value = focalPx;
    this.dustUniforms.uPixelRatio.value = pixelRatio;
  }

  /** Reduce visible particle share on lower quality tiers. */
  setDensity(scale: number) {
    const starGeo = this.stars.geometry as THREE.BufferGeometry;
    const dustGeo = this.dust.geometry as THREE.BufferGeometry;
    starGeo.setDrawRange(0, Math.floor(starGeo.getAttribute('position').count * scale));
    dustGeo.setDrawRange(0, Math.floor(dustGeo.getAttribute('position').count * scale));
  }

  update(t: number, rigPosition: THREE.Vector3) {
    this.starUniforms.uTime.value = t;
    this.dustUniforms.uTime.value = t;
    this.group.position.copy(rigPosition);
    this.nebulaGroup.rotation.z = t * 0.008;
    // lens breathing: barely-there nebula scale pulse
    const breath = 1 + Math.sin(t * 0.24) * 0.012;
    this.nebulaGroup.scale.setScalar(breath);
    this.nebulaMaterials.forEach((m, i) => m.color.lerp(this.nebulaTargets[i], 0.02));

    // shooting star lifecycle
    if (t > this.shootNext) {
      this.shootStart = t;
      this.shootNext = t + 12 + Math.random() * 10;
      this.shootFrom.set((Math.random() - 0.5) * 44, 6 + Math.random() * 9, -34 - Math.random() * 22);
      const dx = (Math.random() > 0.5 ? 1 : -1) * (9 + Math.random() * 8);
      this.shootDir.set(dx, -(4 + Math.random() * 3), 0);
      this.shootingStar.rotation.z = Math.atan2(this.shootDir.y, this.shootDir.x);
    }
    const p = (t - this.shootStart) / 1.4;
    if (p >= 0 && p < 1) {
      this.shootingStar.visible = true;
      this.shootingStar.position.copy(this.shootFrom).addScaledVector(this.shootDir, p);
      this.shootingStar.material.opacity = Math.sin(p * Math.PI) * 0.55;
    } else {
      this.shootingStar.visible = false;
    }
  }

  dispose() { this.disposables.forEach(d => d.dispose()); }
}
