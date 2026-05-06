'use client';
import { useEffect, useRef } from 'react';
import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { loadEmojiShape } from '@tsparticles/shape-emoji';
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters';
import type { ISourceOptions } from '@tsparticles/engine';
import type { IEffect } from '@/configs/types';

/* ── Engine singleton ──────────────────────────────── */
let enginePromise: Promise<void> | null = null;

function ensureEngine(): Promise<void> {
  if (!enginePromise) {
    enginePromise = (async () => {
      await loadSlim(tsParticles);
      await loadEmojiShape(tsParticles);
      await loadEmittersPlugin(tsParticles);
    })();
  }
  return enginePromise;
}

/* ── Shared palette ────────────────────────────────── */
const VIVID = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f72585', '#ff9f1c', '#c77dff', '#a8dadc'];

/* ── Per-effect configs ────────────────────────────── */
// Phone screen ≈ 232×500 px. Targets:
//   emoji (large): ~8–15 on screen → 1 per 0.5–0.8 s
//   shapes (small): ~40–70 on screen → 2–3 per 0.2–0.3 s
//   fireworks: 1 burst of 22 particles per emitter cycle (rate.delay = duration)
const CONFIGS: Record<string, ISourceOptions> = {

  /* 🎆 Pháo hoa — 5 burst emitters, 22 particles each, staggered 1–3 s */
  fireworks: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      color: { value: VIVID },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.5, max: 1 } },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 12 },
        speed: { min: 5, max: 16 },
        direction: 'none',
        random: true,
        outModes: { default: 'destroy' },
      },
    },
    // rate.delay = duration → exactly 1 emit event per cycle = 22 particles/burst
    emitters: [
      { position: { x: 22, y: 30 }, life: { count: 0, duration: 0.1, delay: 1.2 }, rate: { quantity: 22, delay: 0.1 } },
      { position: { x: 75, y: 22 }, life: { count: 0, duration: 0.1, delay: 2.2 }, rate: { quantity: 22, delay: 0.1 } },
      { position: { x: 50, y: 48 }, life: { count: 0, duration: 0.1, delay: 3.0 }, rate: { quantity: 22, delay: 0.1 } },
      { position: { x: 30, y: 62 }, life: { count: 0, duration: 0.1, delay: 1.8 }, rate: { quantity: 22, delay: 0.1 } },
      { position: { x: 70, y: 40 }, life: { count: 0, duration: 0.1, delay: 2.6 }, rate: { quantity: 22, delay: 0.1 } },
    ],
  },

  /* 🎊 Confetti — small falling shapes, ~50 on screen at steady state */
  confetti: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      color: { value: VIVID },
      shape: { type: ['square', 'circle', 'triangle'] },
      opacity: { value: { min: 0.7, max: 1 } },
      size: { value: { min: 4, max: 9 } },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: 36, sync: false },
      },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 4, max: 9 },   // faster → off-screen sooner → fewer on screen
        random: true,
        gravity: { enable: true, acceleration: 3 },
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 3, delay: 0.22 }, // ~14/s → ~14 × 7 s avg ≈ 98, manageable
      size: { width: 100, height: 0 },
      position: { x: 50, y: 0 },
    },
  },

  /* ❄️ Tuyết rơi — gentle flakes, ~25 on screen */
  snow: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      color: { value: ['#dce8ff', '#b8d4ff', '#ffffff', '#e8f4ff'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.45, max: 0.90 } },
      size: { value: { min: 3, max: 7 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 1.5, max: 4 },
        random: true,
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 2, delay: 0.25 },
      size: { width: 100, height: 0 },
      position: { x: 50, y: 0 },
    },
  },

  /* 💕 Tim bay — ~10 hearts visible, rising slowly */
  hearts: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['❤️', '💕', '💗', '💖', '🩷'] } },
      },
      size: { value: { min: 10, max: 20 } },
      opacity: {
        value: { min: 0.6, max: 1 },
        animation: { enable: true, speed: 0.8, sync: false },
      },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 2, max: 4 },
        random: true,
        straight: false,
        outModes: { default: 'destroy' },
      },
      rotate: {
        value: { min: -20, max: 20 },
        direction: 'random',
        animation: { enable: true, speed: 4, sync: false },
      },
    },
    emitters: {
      direction: 'top',
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.6 }, // ~1.7/s → ~1.7 × 6 s avg ≈ 10 hearts
      size: { width: 100, height: 0 },
      position: { x: 50, y: 108 },
    },
  },

  /* ✨ Lấp lánh — 18 static twinkling stars */
  sparkles: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 18 },
      color: { value: ['#ffd700', '#fff8c0', '#ffd93d', '#fffbe0', '#ffec6a'] },
      shape: {
        type: 'star',
        options: { star: { sides: 4 } },
      },
      opacity: {
        value: { min: 0, max: 1 },
        animation: { enable: true, speed: 1.8, sync: false, startValue: 'random' },
      },
      size: {
        value: { min: 3, max: 10 },
        animation: { enable: true, speed: 2.5, sync: false, startValue: 'random' },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: 7, sync: false },
      },
      move: { enable: false },
    },
  },

  /* 🌸 Cánh hoa — ~10 petals drifting */
  petals: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['🌸', '🌺', '🌷', '💮'] } },
      },
      size: { value: { min: 10, max: 18 } },
      opacity: {
        value: { min: 0.55, max: 0.95 },
        animation: { enable: true, speed: 0.6, sync: false },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: 10, sync: false },
      },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 2, max: 4.5 },
        random: true,
        straight: false,
        gravity: { enable: true, acceleration: 1.2 },
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.65 }, // ~1.5/s → ~1.5 × 7 s avg ≈ 11 petals
      size: { width: 100, height: 0 },
      position: { x: 50, y: 0 },
    },
  },

  /* 🫧 Bong bóng — ~8 bubbles rising */
  bubbles: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      color: { value: ['#90e0ef', '#caf0f8', '#a8dadc', '#48cae4'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: {
        value: { min: 10, max: 28 },
        animation: { enable: true, speed: 1.5, sync: false },
      },
      stroke: { width: 1.5, color: { value: '#90e0ef' } },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 2.5, max: 5 },
        random: true,
        straight: false,
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      direction: 'top',
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.75 }, // ~1.3/s → ~1.3 × 6 s avg ≈ 8 bubbles
      size: { width: 100, height: 0 },
      position: { x: 50, y: 108 },
    },
  },

  /* 💩 Mưa bùn — ~8 poops falling (funny, not overwhelming) */
  poop: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['💩', '💩', '💩', '🚽'] } },
      },
      size: { value: { min: 14, max: 24 } },
      opacity: { value: { min: 0.85, max: 1 } },
      rotate: {
        value: { min: -20, max: 20 },
        direction: 'random',
        animation: { enable: true, speed: 12, sync: false },
      },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 3, max: 7 },
        random: true,
        straight: false,
        gravity: { enable: true, acceleration: 2 },
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.7 }, // ~1.4/s → ~1.4 × 6 s avg ≈ 9 poops
      size: { width: 100, height: 0 },
      position: { x: 50, y: 0 },
    },
  },

  /* 💸 Tiền bay — ~10 money emojis rising */
  money: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['💸', '💵', '💰', '🪙', '💎'] } },
      },
      size: { value: { min: 10, max: 20 } },
      opacity: {
        value: { min: 0.7, max: 1 },
        animation: { enable: true, speed: 0.7, sync: false },
      },
      rotate: {
        value: { min: -15, max: 15 },
        direction: 'random',
        animation: { enable: true, speed: 6, sync: false },
      },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 2.5, max: 5 },
        random: true,
        straight: false,
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      direction: 'top',
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.6 }, // ~1.7/s → ~1.7 × 6 s avg ≈ 10 emojis
      size: { width: 100, height: 0 },
      position: { x: 50, y: 108 },
    },
  },

  /* 🎉 Bữa tiệc — ~12 party emojis falling */
  party: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['🎉', '🎊', '🥳', '🎈', '🎁', '✨'] } },
      },
      size: { value: { min: 12, max: 20 } },
      opacity: { value: { min: 0.8, max: 1 } },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: 16, sync: false },
      },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 3, max: 6 },
        random: true,
        gravity: { enable: true, acceleration: 1.5 },
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 1, delay: 0.5 }, // ~2/s → ~2 × 6 s avg ≈ 12 emojis
      size: { width: 100, height: 0 },
      position: { x: 50, y: 0 },
    },
  },

  /* 🌧️ Mưa vàng — fast diagonal drops, ~60 visible */
  rain: {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 0 },
      color: { value: ['#ffd700', '#ffc300', '#ffb700', '#ffe066', '#ffd93d'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.4, max: 0.85 },
        animation: { enable: true, speed: 1.5, sync: false },
      },
      size: { value: { min: 1.5, max: 3 } },
      move: {
        enable: true,
        direction: 'bottom-right',
        speed: { min: 10, max: 18 }, // fast → off-screen in ~2–3 s
        straight: true,
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      life: { count: 0 },
      rate: { quantity: 3, delay: 0.07 }, // ~43/s → ~43 × 2 s ≈ 86 tiny drops
      size: { width: 110, height: 0 },
      position: { x: 20, y: 0 },
    },
  },
};

/* ── Component ─────────────────────────────────────── */
export function EffectOverlay({ effect }: { effect: IEffect }) {
  const divRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (effect.id === 'none' || !CONFIGS[effect.id]) return;

    let active = true;

    ensureEngine()
      .then(() => {
        if (!active || !divRef.current) return;
        return tsParticles.load({
          id: `tapory-fx-${effect.id}`,
          element: divRef.current,
          options: CONFIGS[effect.id],
        });
      })
      .then(container => {
        if (!active && container) { container.destroy(); return; }
        containerRef.current = container ?? null;
      })
      .catch(console.error);

    return () => {
      active = false;
      containerRef.current?.destroy();
      containerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect.id]);

  if (effect.id === 'none') return null;

  return (
    <div
      ref={divRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 25,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
