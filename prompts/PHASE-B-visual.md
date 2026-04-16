# Phase B — V2 Prototype Conversion (2–3 hours)

Read `CLAUDE-CODE-MASTER-PROMPT.md` sections 4–7 and 10–11 for full context. Phase A must be complete.

**Canonical night background:** `#0d2538` — from Andy's logo plate. Apply to landing AND chat agent. No `#0f1722` / `#0f172a` anywhere.

## Tasks

### B.1 — Study the V2 prototypes
```bash
ls -la docs/prototypes/
wc -l docs/prototypes/*.html
```
Read `docs/prototypes/unioffer-landing.html` fully. It is your source of truth.

### B.2 — Set up fonts in root layout
Update `app/layout.tsx` per Section 6.0 of the master prompt. Global body background `#0d2538`, text `#eaf1f7`, fonts Libre Baskerville + Inter via `next/font/google`.

### B.3 — Extract CSS
Copy the entire `<style>` block from `docs/prototypes/unioffer-landing.html` into `app/_landing/landing.css` (complete replacement). Do not edit the CSS — scope it under `.uo-landing` if you hit Tailwind preflight conflicts; add `@layer` if needed. Verify `@property --angle` is preserved.

### B.4 — Convert HTML to JSX
Copy the entire `<body>` content into `app/_landing/LandingClient.tsx`. Add `'use client'`. Convert:
- `class=` → `className=`
- `for=` → `htmlFor=`
- self-close all void tags
- inline `style=""` → `style={{ }}` objects
- `<script>` → `useEffect` hooks

### B.5 — Hook up interactions (useEffect)
From Section 5:
- Loading screen state (5.1)
- Page entry animation `.loaded` toggle (5.2)
- IntersectionObserver for `.reveal` (5.3)
- Typing placeholder loop (5.5) — add `suppressHydrationWarning` on the input

### B.6 — Brand treatment
- Nav: green cat icon 24–32px left
- Footer: green cat + "unioffer" wordmark (full logo), max 200px
- Loading screen: green cat icon breathing on `#0d2538`
- Delete every reference to the old "UO" monogram / navy-red wordmark
- Update `public/favicon.ico` + `favicon-16/32/64.png` with green cat icon

### B.7 — Chat agent page uses the same bg
Ensure `app/app/chat/page.tsx` (or wherever the chat agent lives) uses `background: #0d2538`. Conversation canvas = same `#0d2538`. Message bubbles can sit on `--bg-surface` (`#162130`) elevation.

### B.8 — Wire up page.tsx
`app/page.tsx` imports and renders `LandingClient`. Confirm route architecture: `/` = landing, `/app` = dashboard.

## End of Phase B

```bash
pnpm typecheck
pnpm lint
pnpm dev   # Open http://localhost:3000 — verify all 13 animations, landing bg, chat agent bg
```

Don't commit until you've eyeballed the page in a browser. Then:
```bash
git add -A
git commit -m "feat(v2): Phase B — landing V2 conversion (#0d2538 global, green cat logo, 13 animations)"
```

Report back: "Phase B complete. Screenshots attached? Ready for Phase C." Do not proceed automatically.
