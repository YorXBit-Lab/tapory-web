import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { experience } from '../experience';

/**
 * Single film-grade pass: luminance-mapped duotone grade, soft vignette,
 * fine grain and chromatic aberration that only wakes up during transitions.
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uShadow: { value: new THREE.Color('#0b0618') },
    uHighlight: { value: new THREE.Color('#dfe6ff') },
    uAmount: { value: 0.5 },
    uExposure: { value: 1 },
    uVignette: { value: 0.55 },
    uGrain: { value: experience.post.grain },
    uCA: { value: 0 },
    uFocus: { value: 0.15 },
    uContrast: { value: experience.post.contrast },
    uResolution: { value: new THREE.Vector2(1, 1) }
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime, uAmount, uExposure, uVignette, uGrain, uCA, uFocus, uContrast;
    uniform vec3 uShadow, uHighlight;
    uniform vec2 uResolution;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 centered = vUv - 0.5;
      float r2 = dot(centered, centered);
      // chromatic aberration â€” radial, effectively zero outside transitions
      vec2 caOffset = centered * r2 * uCA * 8.0;
      vec3 color;
      color.r = texture2D(tDiffuse, vUv + caOffset).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - caOffset).b;
      // cinematic focus: tilt-shift falloff â€” centre stays tack sharp,
      // frame edges melt softly like a shallow depth of field
      float edge = smoothstep(0.64, 1.08, abs(centered.y) * 2.0) + smoothstep(0.8, 1.2, abs(centered.x) * 2.0);
      float blurPx = min(edge, 1.0) * min(edge, 1.0) * uFocus * 9.0;
      if (blurPx > 0.05) {
        vec2 o = vec2(0.0, blurPx) / uResolution;
        vec2 ox = vec2(blurPx * 0.8, 0.0) / uResolution;
        vec3 b = texture2D(tDiffuse, vUv + o).rgb + texture2D(tDiffuse, vUv - o).rgb
               + texture2D(tDiffuse, vUv + o * 2.2 + ox).rgb + texture2D(tDiffuse, vUv - o * 2.2 - ox).rgb;
        color = color * 0.28 + b * 0.18;
      }
      color *= uExposure;
      // gentle filmic contrast around an 18%-grey pivot
      color = max(vec3(0.0), (color - 0.18) * uContrast + 0.18);
      // luminance duotone grade, subtle
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      vec3 tint = mix(uShadow * 2.2, uHighlight, smoothstep(0.0, 0.9, luma));
      color = mix(color, color * tint, uAmount);
      // soft vignette â€” real darkness at the edges
      float vig = 1.0 - uVignette * smoothstep(0.15, 0.62, r2);
      color *= vig;
      // fine film grain, strongest in midtones where real film shows it
      float g = hash(vUv * uResolution + fract(uTime) * 61.7) - 0.5;
      color += g * uGrain * smoothstep(0.02, 0.28, luma) * (1.25 - luma * 0.8);
      gl_FragColor = vec4(color, 1.0);
    }`
};

export type PostStack = {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  grade: ShaderPass;
  setSize: (w: number, h: number, dpr: number) => void;
};

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): PostStack {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    experience.post.bloomStrength, experience.post.bloomRadius, experience.post.bloomThreshold
  );
  const grade = new ShaderPass(GradeShader);
  const output = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(grade);
  composer.addPass(output);
  const setSize = (w: number, h: number, dpr: number) => {
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    bloom.setSize(w * dpr, h * dpr);
    (grade.uniforms.uResolution.value as THREE.Vector2).set(w * dpr, h * dpr);
  };
  return { composer, bloom, grade, setSize };
}
