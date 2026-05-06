# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Run production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS v4 + Ant Design 6 + Redux Toolkit + TanStack Query v5 + Firebase (Firestore + Storage)

**Source layout:**

```
src/
├── app/           # App Router pages and layouts
│   └── (routes)/  # Route group: /, /templates, /dashboard/*, /edit/[orderId], /view/[orderId]
├── components/    # Shared UI components (layout, ui, dashboard)
├── configs/       # Typed constants and configuration
├── features/      # Feature modules — editor, preview
├── hooks/         # Custom hooks (base utilities, memorial domain)
├── libs/          # External service setup: firebase.ts, env.ts, Redux/Tanstack/Theme providers
├── redux/         # Redux store + slices (editSlice, persisted to localStorage)
├── services/      # API layer (MemorialAPI)
├── templates/     # Template definitions: birthday, wedding, anniversary, graduation, social, spotify
└── utils/         # Firebase Storage helpers and misc utilities
```

**Path alias:** `@/*` resolves to `src/`.

## Key Patterns

**Provider stack** (nested in root layout): ThemeProvider → ReduxProvider + PersistGate → TanstackProvider → AntdRegistry → AntdProvider.

**State management:** Redux Toolkit handles editor state (persisted). TanStack Query handles server data with 5-minute stale time and 1 retry.

**Environment variables:** All Firebase config lives in `src/libs/env.ts` typed from `NEXT_PUBLIC_*` env vars. Never access `process.env` directly — import from `env.ts`.

**Templates:** Each template type (birthday, wedding, etc.) in `src/templates/` defines its own layout variants. The editor (`/edit/[orderId]`) and viewer (`/view/[orderId]`) consume these.

**TypeScript errors** are currently ignored during build (`next.config.ts`). Do not rely on build success to validate types — run `tsc --noEmit` separately.

**Styling:** Tailwind CSS v4 with custom Montserrat font and fluid typography via `clamp()`. Use Tailwind utility classes first; Ant Design components for complex UI (tables, forms, modals).
