import * as THREE from 'three';

export type RevealStyle = 'gather' | 'lines';
export type DissolveStyle = 'ribbon' | 'converge' | 'explode' | 'drift' | 'spiral';
const dissolveCode: Record<DissolveStyle, number> = { ribbon: 0, converge: 1, explode: 2, drift: 3, spiral: 4 };

export type TextFieldOptions = {
  text: string;
  fontPx?: number;
  fontFamily?: string;
  weight?: number;
  palette: readonly string[];
  gap?: number;
  reveal?: RevealStyle;
  maxPoints?: number;
  /** Extra letter spacing in em. */
  tracking?: number;
  /** Max line width in em (multiples of fontPx). Longer input auto-wraps
   *  at word boundaries; explicit \n still forces a break. 0 = no wrap. */
  wrap?: number;
  /** Idle 3D sway + drag-to-spin. Main titles only; captions stay still. */
  interactive?: boolean;
  /** Faint mirrored reflection below the baseline â€” luxury-logo look. */
  reflect?: boolean;
};

const vertexShader = /* glsl */`
  attribute vec3 aFrom;
  attribute vec3 aColor;
  attribute vec3 aDir;
  attribute float aSeed;
  attribute float aSize;
  attribute float aLine;
  attribute float aGlow;
  attribute float aEdge;
  uniform float uTime, uReveal, uRevealMode, uDissolve, uDissolveMode, uWave;
  uniform float uLines, uWidth, uHeight, uFocal, uPixelRatio, uWorldScale, uLayer, uScanX, uScanI, uDepthRange;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBoost;
  varying float vShade;
  varying float vFlash;
  varying float vSoft;
  varying float vFire;
  float easeOut(float x){ return 1.0 - pow(1.0 - x, 3.0); }
  void main(){
    vec3 target = position;
    float local;
    if (uRevealMode > 0.5) {
      float lineT = clamp(uReveal * (uLines + 0.999) - aLine, 0.0, 1.0);
      local = clamp((lineT - aSeed * 0.3) / 0.7, 0.0, 1.0);
    } else {
      local = clamp((uReveal - aSeed * 0.45) / 0.55, 0.0, 1.0);
    }
    float formed = easeOut(local);
    vec3 p = mix(aFrom, target, formed);
    // vortex convergence: particles spiral into place instead of flying straight
    float swirl = (1.0 - formed) * 2.2 * (aSeed - 0.5);
    float cs = cos(swirl), sn = sin(swirl);
    p.xy = mat2(cs, -sn, sn, cs) * p.xy;
    float fade = formed;
    // depth shading: front face bright, back face falls into shadow â€”
    // the core cue that sells the extruded-3D look while rotating
    float nz = clamp(target.z / max(uDepthRange, 1.0), -1.0, 1.0);
    vShade = 1.0 + nz * 0.45;
    // in-glyph depth of field: particles deeper in the slab render as
    // soft bokeh behind the razor-sharp front face
    vSoft = clamp(-nz, 0.0, 1.0) * 0.65 + (1.0 - aEdge) * 0.1;
    // idle shimmer lives in the fill; contour particles stay rock steady
    // so the silhouette reads razor sharp
    p.xy += vec2(sin(uTime * 1.1 + aSeed * 21.0), cos(uTime * 0.9 + aSeed * 15.0))
          * uWave * formed * (1.0 - aEdge * 0.85);
    // dissolve
    float d = uDissolve;
    if (d > 0.001) {
      float prog; vec3 push = vec3(0.0);
      if (uDissolveMode < 0.5) { // ribbon sweep to the right
        prog = clamp(d * 1.7 - (target.x / max(uWidth, 1.0) + 0.5) * 0.7, 0.0, 1.0);
        float e = easeOut(prog);
        push = (aDir * 120.0 + vec3(320.0, 40.0 * sin(aSeed * 6.28), 60.0 * (aSeed - 0.5))) * e;
        fade *= 1.0 - smoothstep(0.35, 1.0, prog);
      } else if (uDissolveMode < 1.5) { // converge to a bright point
        prog = clamp((d - aSeed * 0.35) / 0.65, 0.0, 1.0);
        float e = easeOut(prog);
        p = mix(p, vec3(0.0, 0.0, 30.0), e);
        fade *= 1.0 - smoothstep(0.72, 1.0, prog);
      } else if (uDissolveMode < 2.5) { // 3D explosion
        prog = clamp((d - aSeed * 0.15) / 0.85, 0.0, 1.0);
        float e = pow(prog, 1.4);
        push = aDir * e * 1400.0;
        fade *= 1.0 - smoothstep(0.45, 1.0, prog);
      } else if (uDissolveMode < 3.5) { // gentle drift up + fade
        prog = clamp((d - aSeed * 0.2) / 0.8, 0.0, 1.0);
        float e = easeOut(prog);
        push = vec3(0.0, 50.0, 0.0) * e + aDir * 30.0 * e;
        fade *= 1.0 - e;
      } else { // spiral: glyphs unwind around their centre as they fade
        prog = clamp((d - aSeed * 0.25) / 0.75, 0.0, 1.0);
        float e = easeOut(prog);
        float ang = e * (2.5 + aSeed * 3.0);
        float ca2 = cos(ang), sa2 = sin(ang);
        p.xy = mat2(ca2, -sa2, sa2, ca2) * p.xy * (1.0 + e * 0.7);
        p.z += e * 260.0 * (aSeed - 0.3);
        fade *= 1.0 - smoothstep(0.45, 1.0, prog);
      }
      p += push;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // rare hero glints read as jewels catching the light
    float hero = step(0.985, aSeed);
    float twinkle = 0.82 + 0.28 * sin(uTime * (1.2 + aSeed * 2.6) + aSeed * 43.0);
    // contour barely twinkles â€” the interior carries the life
    twinkle = mix(twinkle, 1.0, aEdge * 0.75);
    // diamond fire: every particle occasionally fires a diffraction glint,
    // heroes flare hard â€” like glitter photographed with a star filter
    float twRaw = sin(uTime * (0.55 + aSeed * 1.9) + aSeed * 47.0);
    vFlash = smoothstep(0.9, 1.0, twRaw) * (0.35 + hero * 1.1) * formed;
    vFire = aSeed * 1.7 + uTime * 0.12;
    float sizeMul = (abs(uLayer - 1.0) < 0.5 ? 3.4 : 1.0) * (1.0 + hero * 1.1);
    gl_PointSize = max(uLayer > 0.5 ? 2.0 : 1.25,
      aSize * sizeMul * uWorldScale * uPixelRatio * uFocal
      * (0.85 + 0.3 * vShade) * (1.0 + vFlash * 0.9 + vSoft * 0.45) / max(0.1, -mv.z));
    // shimmer sweep band across the face of the glyphs
    float band = exp(-pow((target.x - uScanX) / (max(uWidth, 1.0) * 0.09), 2.0));
    vBoost = band * uScanI + hero * (0.3 + 0.35 * twinkle);
    // engraved lighting baked per particle (rim light / shadow side / fill)
    vColor = aColor * aGlow;
    vAlpha = fade * twinkle;
    // reflection layer: strongest near the baseline, melting away below
    if (uLayer > 1.5) {
      float ny = target.y / max(uHeight * 0.5, 1.0);
      vAlpha *= 0.15 * smoothstep(0.9, -0.5, ny);
    }
  }`;

const fragmentShader = /* glsl */`
  uniform float uLayer, uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBoost;
  varying float vShade;
  varying float vFlash;
  varying float vSoft;
  varying float vFire;
  void main(){
    vec2 pc = gl_PointCoord - 0.5;
    float d = length(pc);
    if (d > 0.5) discard;
    float alpha;
    vec3 color;
    if (abs(uLayer - 1.0) < 0.5) { // soft additive halo, tinted
      float a = smoothstep(0.5, 0.0, d);
      alpha = a * a * 0.08 * (1.0 - vSoft * 0.25);
      color = vColor * vShade * (1.0 + vBoost * 0.6);
    } else { // sharp core (also used dimmed for the reflection layer)
      // bokeh: deep-slab particles melt soft and dim behind the sharp face
      alpha = smoothstep(0.5, 0.26 + vSoft * 0.18, d) * 0.9 * (1.0 - vSoft * 0.35);
      color = mix(vec3(1.0), vColor, smoothstep(0.08, 0.45, d));
      color *= vShade * (1.0 + vBoost * 0.6);
      // four-point diffraction star + spectral "diamond fire" on glints
      if (vFlash > 0.01) {
        float cx = max(0.0, 1.0 - abs(pc.x) * 8.0) * max(0.0, 1.0 - abs(pc.y) * 2.4);
        float cy = max(0.0, 1.0 - abs(pc.y) * 8.0) * max(0.0, 1.0 - abs(pc.x) * 2.4);
        float star = (cx + cy) * vFlash;
        vec3 fire = 0.62 + 0.38 * cos(6.2832 * vFire + vec3(0.0, 2.094, 4.188));
        color += fire * star * 1.4;
        alpha = min(1.0, alpha + star * 0.75);
      }
    }
    gl_FragColor = vec4(color, alpha * vAlpha * uOpacity);
  }`;

function parseHex(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

let glowTexture: THREE.CanvasTexture | null = null;
function getGlowTexture(): THREE.CanvasTexture {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

type Sampled = {
  targets: Float32Array; froms: Float32Array; colors: Float32Array; dirs: Float32Array;
  seeds: Float32Array; sizes: Float32Array; glows: Float32Array; edges: Float32Array; lines: Float32Array;
  pxWidth: number; pxHeight: number; lineCount: number;
  /** the rasterised glyphs themselves â€” reused as a crisp ghost layer */
  canvas: HTMLCanvasElement;
};

/** Greedy word-wrap: keeps every rendered line under maxWidth px.
 *  A single word wider than the limit stays whole (fit() absorbs it). */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const words = line.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`;
      if (ctx.measureText(candidate).width > maxWidth) { out.push(current); current = words[i]; }
      else current = candidate;
    }
    out.push(current);
  }
  return out;
}

function sampleGlyphs(opts: Required<Pick<TextFieldOptions, 'text' | 'fontPx' | 'fontFamily' | 'weight' | 'gap' | 'palette' | 'maxPoints' | 'tracking' | 'wrap'>>): Sampled {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const font = (px: number) => `${opts.weight} ${px}px ${opts.fontFamily}`;
  ctx.font = font(opts.fontPx);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.tracking * opts.fontPx}px`;
  const lines = opts.wrap > 0
    ? wrapLines(ctx, opts.text, opts.wrap * opts.fontPx)
    : opts.text.split('\n');
  const lineHeight = opts.fontPx * 1.32;
  const pad = Math.ceil(opts.fontPx * 0.35);
  const width = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width))) + pad * 2;
  const height = Math.ceil(lines.length * lineHeight) + pad * 2;
  canvas.width = Math.max(4, width); canvas.height = Math.max(4, height);
  ctx.font = font(opts.fontPx);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.tracking * opts.fontPx}px`;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * lineHeight));
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const W = canvas.width, H = canvas.height;
  const alphaAt = (x: number, y: number) =>
    x < 0 || y < 0 || x >= W || y >= H ? 0 : pixels[(y * W + x) * 4 + 3];

  // raw entry: [x, y, line, edge 0..1, lightDot -1..1]
  let gap = Math.max(1, Math.round(opts.gap));
  let raw: Array<[number, number, number, number, number]> = [];
  for (;;) {
    raw = [];
    for (let y = 0; y < H; y += gap) {
      const lineIndex = Math.min(lines.length - 1, Math.max(0, Math.floor((y - pad) / lineHeight)));
      for (let x = 0; x < W; x += gap) {
        if (alphaAt(x, y) <= 110) continue;
        // alpha gradient = distance-to-contour signal + pseudo surface normal
        const gx = alphaAt(x + 2, y) - alphaAt(x - 2, y);
        const gy = alphaAt(x, y + 2) - alphaAt(x, y - 2);
        const mag = Math.hypot(gx, gy);
        const edge = Math.min(1, mag / 230);
        // key-light from the top-left, like an engraver's lamp
        const lightDot = mag > 1 ? (-gx * 0.55 - gy * 0.83) / mag : 0;
        // thin out the fill so the interior sparkles instead of mushing
        if (edge < 0.3 && fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) > 0.8) continue;
        raw.push([x, y, lineIndex, edge, lightDot]);
      }
    }
    if (raw.length <= opts.maxPoints || gap > 12) break;
    gap++;
  }

  const n = raw.length;
  const targets = new Float32Array(n * 3), froms = new Float32Array(n * 3), colors = new Float32Array(n * 3), dirs = new Float32Array(n * 3);
  const seeds = new Float32Array(n), sizes = new Float32Array(n), lineIdx = new Float32Array(n);
  const glows = new Float32Array(n), edges = new Float32Array(n);
  const paletteRgb = opts.palette.map(parseHex);
  const thickness = opts.fontPx * 0.6;
  for (let i = 0; i < n; i++) {
    const [x, y, li, edge, lightDot] = raw[i];
    const s1 = fract(Math.sin((i + 1) * 91.913) * 47453.5453);
    const s2 = fract(Math.sin((i + 1) * 43.11 + 7.7) * 23421.631);
    const s3 = fract(Math.sin((i + 1) * 17.73 + 3.1) * 15731.743);
    targets[i * 3] = x - W / 2;
    targets[i * 3 + 1] = H / 2 - y;
    // contour particles pin to the front or back face (30%) â†’ crisp rims
    // on both ends of the extrusion; fill spreads through the volume
    if (edge > 0.3) {
      targets[i * 3 + 2] = s3 > 0.7
        ? -thickness * 0.5 + (s3 - 0.7) * thickness * 0.2   // back rim
        : thickness * 0.5 - s3 * thickness * 0.18;           // front rim
    } else {
      targets[i * 3 + 2] = (s3 - 0.5) * thickness;
    }
    const angle = s1 * Math.PI * 2;
    const radius = Math.max(W, H) * (0.7 + s2 * 0.9);
    froms[i * 3] = Math.cos(angle) * radius;
    froms[i * 3 + 1] = Math.sin(angle) * radius * 0.7;
    froms[i * 3 + 2] = (s3 - 0.5) * 900;
    const theta = s2 * Math.PI * 2, phi = Math.acos(2 * s3 - 1);
    dirs[i * 3] = Math.sin(phi) * Math.cos(theta);
    dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
    dirs[i * 3 + 2] = Math.cos(phi);
    seeds[i] = s1;
    sizes[i] = edge > 0.3 ? gap * 1.02 : gap * (0.62 + s2 * 0.4);
    lineIdx[i] = li;
    edges[i] = edge;
    // engraved-metal lighting: rims catching the key light glow brightest,
    // shadow-side rims stay deep, fill glimmers quietly in between
    glows[i] = edge > 0.3
      ? 0.85 + Math.max(0, lightDot) * 0.65 + edge * 0.15
      : 0.5 + s2 * 0.22;
    // vertical gradient through the palette (light top â†’ deep bottom)
    const lineTop = pad + li * lineHeight;
    const within = Math.min(1, Math.max(0, (y - lineTop) / lineHeight));
    const idx = Math.min(paletteRgb.length - 1, Math.max(0, Math.floor(within * paletteRgb.length + (s2 - 0.5) * 1.2)));
    const pick = paletteRgb[idx];
    colors[i * 3] = pick[0]; colors[i * 3 + 1] = pick[1]; colors[i * 3 + 2] = pick[2];
  }
  return { targets, froms, colors, dirs, seeds, sizes, glows, edges, lines: lineIdx, pxWidth: W, pxHeight: H, lineCount: lines.length, canvas };
}

function fract(x: number) { return x - Math.floor(x); }

/**
 * Particle-built text. Two THREE.Points layers share one geometry:
 * a sharp core and a soft additive halo. All motion is uniform-driven so
 * GSAP can choreograph reveal / hold / shimmer / dissolve. Interactive
 * fields sway gently in 3D and can be spun by dragging.
 */
export class TextField {
  readonly group = new THREE.Group();
  readonly u: {
    uTime: { value: number }; uReveal: { value: number }; uDissolve: { value: number };
    uDissolveMode: { value: number }; uWave: { value: number }; uOpacity: { value: number };
    uScanX: { value: number }; uScanI: { value: number };
    uFocal: { value: number }; uPixelRatio: { value: number }; uWorldScale: { value: number };
  };
  readonly pxWidth: number;
  readonly pxHeight: number;
  private geometry: THREE.BufferGeometry;
  private materials: THREE.ShaderMaterial[] = [];
  private interactive: boolean;
  private swayScale: number;
  private groundGlow: THREE.Sprite | null = null;
  private ghost: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;
  private ghostTexture: THREE.CanvasTexture | null = null;
  private rotVelX = 0;
  private rotVelY = 0;
  private userRotX = 0;
  private userRotY = 0;
  private lastSpin = -10;

  constructor(opts: TextFieldOptions) {
    const fontPx = opts.fontPx ?? 150;
    const sampled = sampleGlyphs({
      // Times New Roman first: full Vietnamese diacritic coverage (Georgia lacks some precomposed glyphs)
      text: opts.text.normalize('NFC'), fontPx, fontFamily: opts.fontFamily ?? '"Times New Roman", Georgia, serif',
      weight: opts.weight ?? 700, gap: opts.gap ?? 3, palette: opts.palette,
      maxPoints: opts.maxPoints ?? 20000, tracking: opts.tracking ?? 0, wrap: opts.wrap ?? 0
    });
    this.interactive = opts.interactive ?? false;
    // wide multi-line blocks sway half as much so every line stays legible
    this.swayScale = opts.reveal === 'lines' ? 0.45 : 1;
    this.pxWidth = sampled.pxWidth; this.pxHeight = sampled.pxHeight;
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(sampled.targets, 3));
    this.geometry.setAttribute('aFrom', new THREE.BufferAttribute(sampled.froms, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(sampled.colors, 3));
    this.geometry.setAttribute('aDir', new THREE.BufferAttribute(sampled.dirs, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(sampled.seeds, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sampled.sizes, 1));
    this.geometry.setAttribute('aLine', new THREE.BufferAttribute(sampled.lines, 1));
    this.geometry.setAttribute('aGlow', new THREE.BufferAttribute(sampled.glows, 1));
    this.geometry.setAttribute('aEdge', new THREE.BufferAttribute(sampled.edges, 1));
    const bound = Math.max(sampled.pxWidth, sampled.pxHeight) * 2;
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), bound);

    this.u = {
      uTime: { value: 0 }, uReveal: { value: 0 }, uDissolve: { value: 0 },
      uDissolveMode: { value: 0 }, uWave: { value: 0.4 }, uOpacity: { value: 1 },
      uScanX: { value: -sampled.pxWidth }, uScanI: { value: 0 },
      uFocal: { value: 800 }, uPixelRatio: { value: 1 }, uWorldScale: { value: 1 }
    };
    const shared = {
      uRevealMode: { value: opts.reveal === 'lines' ? 1 : 0 },
      uLines: { value: sampled.lineCount },
      uWidth: { value: sampled.pxWidth },
      uHeight: { value: sampled.pxHeight },
      uDepthRange: { value: fontPx * 0.3 }
    };
    const layers = opts.reflect ? [1, 0, 2] : [1, 0];
    for (const layer of layers) {
      const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: { ...this.u, ...shared, uLayer: { value: layer } }
      });
      const points = new THREE.Points(this.geometry, material);
      points.frustumCulled = false;
      points.renderOrder = layer === 2 ? 39 : 40 + (1 - layer);
      if (layer === 2) {
        // mirror across the baseline, slightly squashed like a real reflection
        points.scale.y = -0.86;
        points.position.y = -sampled.pxHeight * 0.92;
      }
      this.materials.push(material);
      this.group.add(points);
    }
    // ghost glyph layer: the rasterised text itself, whisper-faint and additive,
    // floating just behind the front rim. Particles carry the 3D sparkle,
    // the ghost guarantees a typographically perfect, razor-sharp silhouette.
    this.ghostTexture = new THREE.CanvasTexture(sampled.canvas);
    this.ghostTexture.colorSpace = THREE.SRGBColorSpace;
    this.ghostTexture.anisotropy = 4;
    const ghostMaterial = new THREE.MeshBasicMaterial({
      map: this.ghostTexture, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
      color: new THREE.Color(opts.palette[Math.min(1, opts.palette.length - 1)])
    });
    this.ghost = new THREE.Mesh(new THREE.PlaneGeometry(sampled.pxWidth, sampled.pxHeight), ghostMaterial);
    this.ghost.position.z = fontPx * 0.12;
    this.ghost.renderOrder = 40;
    this.group.add(this.ghost);

    if (opts.reflect) {
      // a soft pool of light beneath the letters â€” grounds the text in space
      const glowMaterial = new THREE.SpriteMaterial({
        map: getGlowTexture(), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
        color: new THREE.Color(opts.palette[Math.min(1, opts.palette.length - 1)])
      });
      this.groundGlow = new THREE.Sprite(glowMaterial);
      this.groundGlow.scale.set(sampled.pxWidth * 0.8, sampled.pxHeight * 1.2, 1);
      this.groundGlow.position.y = -sampled.pxHeight * 0.7;
      this.groundGlow.renderOrder = 38;
      this.group.add(this.groundGlow);
    }
    this.group.visible = false;
  }

  /** Scale the px-space glyph cloud to fit a world-space box. */
  fit(maxWidth: number, maxHeight: number) {
    const s = Math.min(maxWidth / this.pxWidth, maxHeight / this.pxHeight);
    this.group.scale.setScalar(s);
    this.u.uWorldScale.value = s;
  }

  setDissolveStyle(style: DissolveStyle) { this.u.uDissolveMode.value = dissolveCode[style]; }

  setView(focalPx: number, pixelRatio: number) {
    this.u.uFocal.value = focalPx;
    this.u.uPixelRatio.value = pixelRatio;
  }

  reset() {
    this.u.uReveal.value = 0; this.u.uDissolve.value = 0; this.u.uOpacity.value = 1;
    this.u.uScanI.value = 0; this.u.uScanX.value = -this.pxWidth;
    this.group.rotation.set(0, 0, 0);
    this.rotVelX = this.rotVelY = this.userRotX = this.userRotY = 0;
    this.group.visible = false;
  }

  /** Drag interaction: spin the particle block freely in 3D with inertia. */
  spin(dx: number, dy: number, t: number) {
    if (!this.interactive || !this.group.visible || this.u.uReveal.value < 0.35) return;
    this.rotVelY = dx * 0.006;
    this.rotVelX = dy * 0.0035;
    this.lastSpin = t;
  }

  tick(t: number, dt = 0.016, pointerX = 0, pointerY = 0, reduced = false) {
    this.u.uTime.value = t;
    if (this.groundGlow) {
      this.groundGlow.material.opacity =
        0.11 * this.u.uReveal.value * this.u.uOpacity.value
        * (1 - this.u.uDissolve.value) * (0.9 + 0.1 * Math.sin(t * 0.7));
    }
    if (this.ghost) {
      // fades in as the particles lock into place, vanishes on dissolve
      const reveal = this.u.uReveal.value;
      this.ghost.material.opacity =
        0.22 * reveal * reveal * this.u.uOpacity.value * (1 - this.u.uDissolve.value);
    }
    if (!this.group.visible || !this.interactive) return;
    // free 360Â° spin around Y with inertia; X tilt stays bounded
    this.userRotY += this.rotVelY;
    this.userRotX = THREE.MathUtils.clamp(this.userRotX + this.rotVelX, -0.55, 0.55);
    this.rotVelX *= 0.95;
    this.rotVelY *= 0.95;
    // after the touch ends, settle to the nearest full turn â€” the block
    // may spin all the way around yet always comes home readable
    if (t - this.lastSpin > 2.2) {
      const homeY = Math.round(this.userRotY / (Math.PI * 2)) * Math.PI * 2;
      const back = Math.min(1, dt * 0.9);
      this.userRotY += (homeY - this.userRotY) * back;
      this.userRotX -= this.userRotX * back;
    }
    // permanent 3D presence: breathing sway + pointer parallax
    const swayY = reduced ? 0 : (Math.sin(t * 0.32) * 0.13 + pointerX * 0.16) * this.swayScale;
    const swayX = reduced ? 0 : (Math.cos(t * 0.24) * 0.055 - pointerY * 0.08) * this.swayScale;
    this.group.rotation.set(this.userRotX + swayX, this.userRotY + swayY, 0);
  }

  dispose() {
    this.geometry.dispose();
    this.materials.forEach(m => m.dispose());
    this.groundGlow?.material.dispose();
    this.ghost?.geometry.dispose();
    this.ghost?.material.dispose();
    this.ghostTexture?.dispose();
  }
}
