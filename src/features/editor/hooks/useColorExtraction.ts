'use client';
import { useCallback } from 'react';

/**
 * ─── AI COLOR HARMONY SYSTEM ──────────────────────────────────────────────────
 *
 * Extracts a cinematic palette from any image URL using an offscreen Canvas.
 * No server, no external API — pure browser.
 *
 * Algorithm:
 *  1. Draw image into a 20×20 pixel canvas (400 sample points).
 *  2. Convert each pixel to HSL.
 *  3. Run hue-based K-means (k=6, 8 iterations) to find dominant colour groups.
 *  4. Score clusters by saturation × lightness-harmony → pick top 3.
 *  5. Derive primary / secondary / accent with luminance-aware adjustments.
 *
 * Falls back to brand defaults on cross-origin or decode failures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ExtractedPalette {
  primary:   string;   // most vivid / emotionally dominant colour
  secondary: string;   // complementary supporting colour
  accent:    string;   // soft background / highlight tint
  isDark:    boolean;  // true if image is predominantly dark
}

/* ── Conversion helpers ─────────────────────────────────────────────────────── */

function toHSL(r: number, g: number, b: number): [number, number, number] {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  const l   = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if      (max === nr) h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6;
  else if (max === ng) h = ((nb - nr) / d + 2) / 6;
  else                 h = ((nr - ng) / d + 4) / 6;
  return [h * 360, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1; if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

function fromHSL(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hn = h / 360;
  const r = Math.round(hue2rgb(p, q, hn + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, hn      ) * 255);
  const b = Math.round(hue2rgb(p, q, hn - 1/3) * 255);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/* ── Pixel sampling ─────────────────────────────────────────────────────────── */

function sampleImage(img: HTMLImageElement): { pixels: [number,number,number][]; avgL: number } {
  const SIZE = 20;
  const canvas = document.createElement('canvas');
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const raw = ctx.getImageData(0, 0, SIZE, SIZE).data;

  let sumL = 0;
  const pixels: [number, number, number][] = [];

  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sumL += L;
    pixels.push([r, g, b]);
  }
  return { pixels, avgL: sumL / pixels.length };
}

/* ── K-means (hue-space, 8 iterations) ─────────────────────────────────────── */

type Cluster = { h: number; s: number; l: number };

function kMeans(pixels: [number, number, number][], k = 6): Cluster[] {
  // Initialise centroids: evenly spaced hues, mid saturation/lightness
  let centroids: Cluster[] = Array.from({ length: k }, (_, i) => ({
    h: (i / k) * 360, s: 0.55, l: 0.50,
  }));

  for (let iter = 0; iter < 8; iter++) {
    const sums = centroids.map(() => ({ h: 0, s: 0, l: 0, n: 0 }));

    for (const [r, g, b] of pixels) {
      const [h, s, l] = toHSL(r, g, b);
      let best = 0, bestDist = Infinity;
      for (let ci = 0; ci < centroids.length; ci++) {
        const dh   = Math.abs(h - centroids[ci].h);
        const dist = Math.min(dh, 360 - dh);
        if (dist < bestDist) { bestDist = dist; best = ci; }
      }
      sums[best].h += h;
      sums[best].s += s;
      sums[best].l += l;
      sums[best].n += 1;
    }

    centroids = sums.map((s, i) =>
      s.n > 0 ? { h: s.h / s.n, s: s.s / s.n, l: s.l / s.n } : centroids[i],
    );
  }

  return centroids;
}

/* ── Main extraction ────────────────────────────────────────────────────────── */

const FALLBACK: ExtractedPalette = {
  primary:   '#c45c8a',
  secondary: '#f8b4cc',
  accent:    '#fdf5f8',
  isDark:    false,
};

function extractFromImage(img: HTMLImageElement): ExtractedPalette {
  const { pixels, avgL } = sampleImage(img);
  const isDark = avgL < 0.38;

  const clusters = kMeans(pixels, 6);

  // Score: saturation × mood alignment
  const scored = clusters.map(c => ({
    ...c,
    score: c.s * (isDark
      ? c.l * 1.8                            // dark image: prefer brighter clusters
      : (1 - Math.abs(c.l - 0.48)) * 2.0),  // light image: prefer mid-lightness
  })).sort((a, b) => b.score - a.score);

  const p = scored[0];
  const s = scored[1] ?? scored[0];

  // Primary: vivid, adjusted for mood
  const primaryH = p.h;
  const primaryS = Math.min(0.88, p.s * 1.25);
  const primaryL = isDark
    ? Math.min(0.72, p.l * 1.35)   // brighter for dark theme
    : Math.max(0.28, p.l * 0.82);  // darker for light theme
  const primary = fromHSL(primaryH, primaryS, primaryL);

  // Secondary: second cluster, slight warmth shift
  const secondaryH = s.h + (isDark ? 8 : -8);
  const secondaryS = Math.min(0.75, s.s * 1.1);
  const secondaryL = isDark ? Math.min(0.78, s.l * 1.2) : Math.min(0.82, s.l * 1.1);
  const secondary = fromHSL(secondaryH, secondaryS, secondaryL);

  // Accent: very desaturated, light (or very dark for dark themes)
  const accentL = isDark ? 0.10 : 0.95;
  const accent   = fromHSL(primaryH + 15, 0.10, accentL);

  return { primary, secondary, accent, isDark };
}

/* ── Public hook ────────────────────────────────────────────────────────────── */

export function useColorExtraction() {
  const extract = useCallback((imageUrl: string): Promise<ExtractedPalette> => {
    return new Promise(resolve => {
      if (!imageUrl) { resolve(FALLBACK); return; }

      const img    = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try   { resolve(extractFromImage(img)); }
        catch { resolve(FALLBACK); }
      };
      img.onerror = () => resolve(FALLBACK);

      // Append cache-bust so storage URLs get crossOrigin header
      img.src = imageUrl.includes('?') ? imageUrl : `${imageUrl}?_ce=1`;
    });
  }, []);

  return { extract };
}
