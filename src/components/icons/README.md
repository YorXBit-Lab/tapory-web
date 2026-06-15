# Icons

Hand-drawn SVG icons & brand illustrations, authored as typed React components.

We **do not** import raw `.svg` files (no SVGR / Turbopack loader config). Each icon
is a small `.tsx` component that renders an inline `<svg>`. This keeps icons
type-safe, tree-shakeable, themeable via `currentColor`, and zero-config.

> For generic, well-known glyphs prefer [`lucide-react`](https://lucide.dev)
> (already a dependency). Put **brand-specific / custom-drawn** marks here.

## Usage

```tsx
import { ArrowRightIcon, HeartKeychain } from '@/components/icons';

// Color follows CSS `color` (Tailwind text-*). `size` is square px.
<ArrowRightIcon className="text-primary" size={16} />
<HeartKeychain size={120} />
```

## Conventions

- **File = one icon**, named `<Name>Icon.tsx`, exporting `function <Name>Icon`.
  Brand illustrations may drop the `Icon` suffix (e.g. `HeartKeychain`).
- Accept `IconProps` (`./types`): native `SVGProps` + optional `size`.
  Spread `{...props}` onto the root `<svg>` and destructure `size` with a default.
- Stroke/fill with `currentColor` so a single icon adapts to any theme color.
- Add `aria-hidden="true"` by default (decorative). Callers that need a label
  can override via `{...props}` (e.g. `role="img" aria-label="…"`).
- If the SVG defines `<defs>` ids (gradients, clips, masks), scope them with
  `useId()` so multiple instances don't collide — see `HeartKeychain.tsx`.
  Such files must be Client Components (`'use client'`).
- Re-export every new icon from `index.ts`.

## Migration note

There are still inline `<svg>` blocks scattered across `src/` (templates,
features, etc.). Extract them here opportunistically as you touch those files —
no need for a big-bang migration.
