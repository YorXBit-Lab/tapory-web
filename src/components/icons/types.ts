import type { SVGProps } from 'react';

/**
 * Shared props for every hand-drawn icon in this folder.
 *
 * - Icons stroke/fill with `currentColor`, so color comes from CSS `color`
 *   (e.g. Tailwind `text-primary`, `text-content2`).
 * - `size` sets a square width/height in px (defaults per icon).
 * - All other native `<svg>` props (className, style, onClick, aria-*, …)
 *   are forwarded to the root `<svg>`.
 */
export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};
