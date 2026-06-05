import type { ITemplateStyle, TemplateId } from '@/configs/types';
import type { ExtractedPalette } from './useColorExtraction';
import { getTemplateStyles } from '@/templates/registry';

/**
 * ─── SMART LAYOUT SUGGESTION ENGINE ──────────────────────────────────────────
 *
 * Given an extracted colour palette (from useColorExtraction), ranks available
 * template+style combinations by colour compatibility and image mood, then
 * returns the top 3 suggestions.
 *
 * Pure utility — no React hooks, safe to call from any client context.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SmartSuggestion {
  templateId: TemplateId;
  styleId:    string;
  styleName:  string;
  reason:     string;
  colors:     { primary: string; secondary: string; accent: string };
  score:      number;
}

/* ── Colour helpers ─────────────────────────────────────────────────────────── */

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l   = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else                h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hueDist(a: string, b: string): number {
  if (!a.startsWith('#') || !b.startsWith('#') || a.length < 7 || b.length < 7) return 90;
  const [ha] = hexToHSL(a);
  const [hb] = hexToHSL(b);
  const d = Math.abs(ha - hb);
  return Math.min(d, 360 - d);
}

const DARK_LAYOUTS = new Set([
  'story','film','vinyl','dark','cassette','luxury','golddark','bold','premium',
]);

function scoreStyle(style: ITemplateStyle, palette: ExtractedPalette): number {
  // Hue proximity: 1 = identical hue, 0 = opposite
  const proximity = 1 - hueDist(palette.primary, style.colors.primary) / 180;

  // Mood alignment: dark image → dark layout preferred
  const isDarkLayout = DARK_LAYOUTS.has(style.layout);
  const moodBonus    = (palette.isDark && isDarkLayout) || (!palette.isDark && !isDarkLayout)
    ? 0.30 : 0;

  return proximity + moodBonus;
}

/* ── Template catalogue ─────────────────────────────────────────────────────── */

const TEMPLATE_HINTS: Partial<Record<TemplateId, string>> = {
  graduation:  'Ảnh chân dung & lễ tốt nghiệp',
  wedding:     'Ảnh đôi & kỷ niệm tình yêu',
  birthday:    'Ảnh tiệc & sinh nhật',
  anniversary: 'Kỷ niệm & hành trình yêu',
};

const SCORED_TEMPLATES: TemplateId[] = ['graduation', 'wedding', 'birthday', 'anniversary'];

/* ── Public API ─────────────────────────────────────────────────────────────── */

export function getSmartSuggestions(
  palette: ExtractedPalette,
  _currentTemplateId?: string,
): SmartSuggestion[] {
  const results: SmartSuggestion[] = [];

  for (const tid of SCORED_TEMPLATES) {
    const styles = getTemplateStyles(tid);
    if (!styles.length) continue;

    const best = styles
      .map(s => ({ style: s, score: scoreStyle(s, palette) }))
      .sort((a, b) => b.score - a.score)[0];

    results.push({
      templateId: tid,
      styleId:    best.style.id,
      styleName:  best.style.name,
      reason:     TEMPLATE_HINTS[tid] ?? '',
      colors:     best.style.colors,
      score:      best.score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
