# UniOffer — Claude Code Master Prompt V3
## Consolidate the split build, ship Andy's #0d2538 night site, pass all gates

> **You are Claude Code working inside `unioffer-mvp-platform` (folder: `admitos-mvp-platform`).**
> Paste this entire prompt. Work in order. Commit after every phase. Stop and report at the end of each phase — do not auto-chain.

---

## 0. What is broken right now (verified in Chrome, 16 Apr)

The current preview (`commit b115c61`, URL `https://unioffer-bzd2btaju-vaibhav4046s-projects.vercel.app`) ships **two diverged sites**:

| Path | Title | Body bg | Contact Sales | Dark mode | Verdict |
|---|---|---|---|---|---|
| `/` | "UniOffer — The Operating System for University Applications" | `#ffffff` (light only) | `/contact-sales` ✓ | Toggle exists but dead | Content is correct, **no night version at all** |
| `/preview` | "Unioffer — More Than Offers. We Spark Futures." | `#0a3042` (WRONG) | `href="#"` (broken) | Dark only | Aurora design, **wrong shade, broken routing** |
| `/preview/dashboard` | "Unioffer — Dashboard" | `#0a3042` (WRONG) | — | Dark only | Same wrong shade |

**Andy's canonical `#0d2538` appears nowhere in production.** Two artifacts, two visual languages, two title conventions. This must end.

### Ground truth from the Chrome audit
- `html` and `body` on `/` compute to `rgb(255, 255, 255)`
- `:root` on `/` only defines `--color-bg: #fff` — there is no dark theme CSS
- The "Switch to dark mode" button exists but `click()` does not change the background
- `/preview` body computes to `rgb(10, 48, 66)` = `#0a3042`, not `#0d2538`
- Two Contact Sales anchors on `/preview` have `href="#"`
- Language switcher on `/` is correct: 10 items, EN active, 9 others aria-disabled "Coming soon", no DE ✓
- Pricing "Up to 5 schools" + "Up to 12 schools" both present on `/` ✓
- Zero admitos, zero "undecided", zero emoji ✓
- OG image served at `/brand/og-image.jpg` ✓
- `ASIDE.foot-adie` is the footer disclaimer (wellbeing copy) — NOT the Adie FAB. FAB suppression is a non-issue here.

### What this prompt fixes
1. **One canonical site at `/`**, driven by Next.js App Router. The static `public/*.html` prototype is removed. `/preview` either goes away or proxies to `/` for backward-compat on the email link Andy already has.
2. **Dark mode is real**, wired to `:root[data-theme='dark']`, persisted in `localStorage`, and uses **`#0d2538`** as canonical night bg. Theme toggle becomes functional across landing, dashboard, and chat agent.
3. **Every route uses the same palette.** `/`, `/app`, `/app/chat`, `/app/dashboard`, `/contact-sales`, `/signin`, `/signup` all share one `app/globals.css` token set.
4. **All 7 Andy items pass.** The audit commands in Phase E must all return 0 non-pipeline hits.
5. **Performance, a11y, SEO, and animation quality** are raised to Lighthouse ≥ 95 across the board.

---

## 1. Design tokens — single source of truth

Add to `app/globals.css` as the first `@layer base` block. Overwrite any conflicting token files (`tokens.css`, `theme.css`, `landing.css`). This is the only place colors live.

```css
@layer base {
  :root {
    /* Typography */
    --font-serif: "Libre Baskerville", Georgia, "Times New Roman", serif;
    --font-sans:  "Inter", system-ui, -apple-system, Segoe UI, sans-serif;
    --font-mono:  "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

    /* Spacing scale (manus.im level) */
    --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
    --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
    --space-9: 96px; --space-10: 128px;

    /* Radii, shadows */
    --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px; --r-2xl: 28px;
    --shadow-1: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04);
    --shadow-2: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08);

    /* Accents (shared both themes) */
    --accent:        #7c3aed;  /* purple — primary CTA */
    --accent-ink:    #ffffff;
    --accent-soft:   #a78bfa;
    --cat:           #64ee85;  /* green cat logo tint */
    --danger:        #ef4444;
    --warn:          #f59e0b;
    --ok:            #22c55e;

    /* ---------- LIGHT (default) ---------- */
    --bg:           #f7f5f1;   /* warm off-white */
    --bg-surface:   #ffffff;
    --bg-elevated:  #ffffff;
    --bg-sunken:    #efece6;
    --fg:           #0e1a24;
    --fg-muted:     #4a5b6b;
    --fg-soft:      #6b7a8a;
    --border:       #e6e1d8;
    --border-soft:  #ede8dd;
  }

  :root[data-theme='dark'] {
    /* ---------- DARK (Andy canonical) ---------- */
    --bg:           #0d2538;   /* logo plate — DO NOT change */
    --bg-surface:   #162130;
    --bg-elevated:  #1b2a3c;
    --bg-sunken:    #0a1e2e;
    --fg:           #eaf1f7;
    --fg-muted:     #a8b8c5;
    --fg-soft:      #7d8f9e;
    --border:       #203447;
    --border-soft:  #1a2c3d;
  }

  /* System preference fallback — only used pre-hydration */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      --bg: #0d2538; --bg-surface: #162130; --bg-elevated: #1b2a3c;
      --bg-sunken: #0a1e2e; --fg: #eaf1f7; --fg-muted: #a8b8c5;
      --fg-soft: #7d8f9e; --border: #203447; --border-soft: #1a2c3d;
    }
  }

  html, body {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-sans);
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3 { font-family: var(--font-serif); letter-spacing: -0.01em; }
  a { color: inherit; text-decoration: none; }
  ::selection { background: var(--accent); color: var(--accent-ink); }
}
```

### Theme init script (inline in `<head>`, blocks flash)

Create `app/theme-init.tsx`:

```tsx
// Renders a tiny synchronous script in <head> before hydration to prevent FOUC.
export function ThemeInit() {
  const code = `
    (function(){
      try {
        var t = localStorage.getItem('uo-theme');
        if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', t);
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />;
}
```

Mount it as the **first child** of `<head>` in `app/layout.tsx`. Add `suppressHydrationWarning` to `<html>` and `<body>`.

### Theme toggle (real, persisted)

Replace the dead toggle at `/` with:

```tsx
'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'light'|'dark') || 'dark';
    setTheme(t);
  }, []);
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('uo-theme', next); } catch {}
  };
  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={theme === 'dark'}
      onClick={flip}
      className="theme-toggle"
    >
      {theme === 'dark' ? '☾' : '☀'}
    </button>
  );
}
```

(Replace the glyphs with inline SVGs — no emoji allowed. Use Lucide `Moon`/`Sun` components or hand-rolled SVGs.)

---

## 2. Kill the split — one site, one URL

### 2.1 Delete the static preview
```bash
rm -rf public/landing-v2.html public/dashboard-v2.html public/preview
git rm -r --cached public/landing-v2.html public/dashboard-v2.html 2>/dev/null || true
```

### 2.2 Remove any `next.config.mjs` rewrites for `/preview` and `/preview/:path`
Open `next.config.mjs`, search for `preview`, delete those rewrite rules.

### 2.3 Add redirects so Andy's existing email link still works
```js
// next.config.mjs
export default {
  async redirects() {
    return [
      { source: '/preview', destination: '/', permanent: false },
      { source: '/preview/dashboard', destination: '/app', permanent: false },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]}];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { optimizePackageImports: ['lucide-react'] },
};
```

### 2.4 Route map — freeze this
```
/                       landing (public)
/contact-sales          sales inquiry form (public)
/signin                 auth
/signup                 auth
/app                    authenticated dashboard
/app/chat               Adie chat agent
/app/dashboard          application dashboard
/og-image.jpg           OG image (1200×630, #0d2538 plate)
```

Any stray route tombstone (`app/page.tsx` AND `app/(marketing)/page.tsx`) must be resolved before `pnpm build`.

---

## 3. Port the prototype design into Next.js (the real work)

You will rebuild the landing as a React Server Component with client islands, **not** a static HTML import. The prototype at `docs/prototypes/unioffer-landing.html` is the source of truth for copy and visual rhythm only.

### 3.1 Component tree

```
app/
├─ layout.tsx                # <ThemeInit/>, fonts, <Nav/>, <Footer/>, <CookieBanner/>
├─ page.tsx                  # Landing shell, renders sections
├─ globals.css               # tokens above + base resets
├─ contact-sales/page.tsx    # form
├─ _components/
│  ├─ Nav.tsx                # sticky, blurred, logo + links + ThemeToggle + LangSwitcher + CTAs
│  ├─ Footer.tsx             # green cat + wordmark, links, Adie disclaimer
│  ├─ ThemeToggle.tsx
│  ├─ LangSwitcher.tsx       # 10-language priority order
│  ├─ CookieBanner.tsx       # UK-GDPR Accept + Reject equal prominence
│  └─ icons/                 # hand-rolled SVGs, 0 emoji
└─ _landing/
   ├─ Hero.tsx               # serif headline, Adie sample chips, typing placeholder
   ├─ MarketReality.tsx      # nationality pool stats (China→Cambridge, India→Oxford, etc.)
   ├─ HowItWorks.tsx         # 5-step flow with SVG flow lines
   ├─ Features.tsx           # cards w/ hover glow
   ├─ Pricing.tsx            # Basic (5 schools) / Plus (12 schools) / Enterprise
   ├─ Timeline.tsx           # application timeline with glow
   ├─ SocialProof.tsx        # logos + quotes
   └─ Aurora.tsx             # 3 radial blobs + conic sweep, 30% opacity max
```

### 3.2 Aurora aesthetic — calibrated
Andy asked for manus.im-level minimalism. The prototype aurora at full intensity reads busy. Tone it.

```css
.aurora { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          overflow: hidden; contain: strict; }
.aurora::before, .aurora::after, .aurora > span { position: absolute;
          content: ""; border-radius: 50%; filter: blur(80px);
          opacity: .28;  /* was .6+ — reduce */
          will-change: transform, opacity; }
.aurora::before { background: radial-gradient(closest-side, #64ee85, transparent);
          top: -10%; left: -10%; width: 60vw; height: 60vw;
          animation: drift 28s ease-in-out infinite alternate; }
.aurora::after  { background: radial-gradient(closest-side, #7c3aed, transparent);
          bottom: -20%; right: -15%; width: 70vw; height: 70vw;
          animation: drift 34s ease-in-out -6s infinite alternate; }
.aurora > span  { background: radial-gradient(closest-side, #22d3ee, transparent);
          top: 30%; left: 40%; width: 45vw; height: 45vw;
          animation: drift 40s ease-in-out -12s infinite alternate; opacity: .18; }
@keyframes drift {
  0%   { transform: translate3d(0,0,0) scale(1); }
  100% { transform: translate3d(6%, -4%, 0) scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora::before, .aurora::after, .aurora > span { animation: none; opacity: .18; }
}
```

Light mode: drop aurora opacity further (`.15`) and swap palette to warm pastels (amber + lavender + mint).

### 3.3 Typography rhythm
- H1 hero: `clamp(40px, 6vw, 72px)`, `line-height: 1.05`, Libre Baskerville, weight 400, `letter-spacing: -0.02em`
- H2 section: `clamp(28px, 3.4vw, 44px)`, Libre Baskerville, weight 400
- Eyebrow: Inter, `11px`, `letter-spacing: 0.22em`, `text-transform: uppercase`, `color: var(--fg-soft)`
- Body: Inter, `17px` / `1.7` on landing, `16px` / `1.65` in app
- Max measure: `62ch`

### 3.4 Animations — the 13 called out in the master spec

All 13 must be GPU-only (`transform` + `opacity`), respect `prefers-reduced-motion`, and target 60fps on a mid-tier laptop.

1. Loading screen — green cat breathing (2s ease-in-out, scale 1 ↔ 1.06, opacity .8 ↔ 1)
2. Page reveal — `.loaded` class on `<body>` fades hero in (400ms)
3. Typing placeholder — rotate through Adie sample prompts in the hero search (use `suppressHydrationWarning` on the `<input>`)
4. Scroll reveals — `IntersectionObserver` staggered; sections slide up 12px + fade
5. SVG flow lines — `stroke-dasharray` draw-in on "How it Works"
6. Section line draw — underline under each eyebrow draws on scroll enter
7. Composer shimmer — subtle gradient sweep on the Adie input focus
8. Card hover — `translateY(-2px)` + shadow-2 + border glow
9. Timeline glow — milestone dots pulse on scroll enter
10. Pricing border rotation — `@property --angle` conic around "Plus" tier border
11. Theme toggle — crossfade 180ms, icon rotate 90°
12. CTA pulse — primary CTA has a slow 6s outward glow
13. Ambient orbs (aurora) — already covered above

Plus 3 app-shell animations (15, 16 from earlier):
14. Sticky nav blur — `backdrop-filter: blur(12px)` activates at scroll > 8px
15. Dashboard skeleton — shimmer on load (2s cubic-bezier)
16. Dashboard card entry — staggered 40ms pop-in

### 3.5 Fonts — next/font, no external CDN
```tsx
// app/layout.tsx
import { Libre_Baskerville, Inter } from 'next/font/google';
const serif = Libre_Baskerville({ subsets: ['latin'], weight: ['400','700'],
  variable: '--font-serif-raw', display: 'swap' });
const sans  = Inter({ subsets: ['latin'], weight: ['400','500','600','700'],
  variable: '--font-sans-raw', display: 'swap' });
// In <html className={`${serif.variable} ${sans.variable}`}>
// Then in globals.css: --font-serif: var(--font-serif-raw), Georgia, serif;
```

---

## 4. Andy's 7-item checklist — enforce each, with assertions

### Item 1: admitos scan
```bash
grep -ri "admitos\|AdmitOS" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" \
  --include="*.env*" -l . \
  | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline \
  > /tmp/admitos-scan.txt
test ! -s /tmp/admitos-scan.txt  # must exit 0 (empty)
```

### Item 2: Visual redesign — use the tokens + components in sections 1 and 3. No emoji anywhere:
```bash
# must return 0 matches across rendered content
grep -rnP "[\x{1F300}-\x{1FAFF}\x{1F600}-\x{1F64F}\x{2600}-\x{27BF}]" app/ --include="*.tsx" --include="*.ts"
```

### Item 3: `/contact-sales` route exists, all CTAs route there
```tsx
// app/contact-sales/page.tsx
export const metadata = { title: 'Contact Sales — UniOffer' };
export default function ContactSales() {
  return (
    <main className="cs-wrap">
      <section className="cs-card">
        <p className="eyebrow">Enterprise</p>
        <h1>Let's talk.</h1>
        <p className="lede">For multi-cohort schools, universities, and counselling teams.</p>
        <form action="/api/contact-sales" method="POST" className="cs-form">
          <label>Full name<input required name="name" autoComplete="name" /></label>
          <label>Work email<input required type="email" name="email" autoComplete="email" /></label>
          <label>Organisation<input required name="org" /></label>
          <label>How can we help?<textarea required name="message" rows={5} /></label>
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </section>
    </main>
  );
}
```
Assertion:
```bash
grep -rnE 'href="(/signin|/signup|#)"[^>]*>(\s*)(Contact|Get UniOffer|Get in touch)' app/
# must return 0 matches
```

### Item 4: zero "undecided" text nodes in rendered JSX
```bash
grep -rn ">[^<]*undecided[^<]*<" app/ --include="*.tsx" --include="*.jsx"
# must return 0
```

### Item 5: Language switcher — exact order, no DE
```tsx
// app/_components/LangSwitcher.tsx
export const LANGS = [
  { code: 'en', label: 'English',        active: true  },
  { code: 'zh', label: '简体中文',        active: false },
  { code: 'zt', label: '繁體中文',        active: false },
  { code: 'ko', label: '한국어',          active: false },
  { code: 'ar', label: 'العربية',         active: false },
  { code: 'vi', label: 'Tiếng Việt',     active: false },
  { code: 'ms', label: 'Bahasa Melayu',  active: false },
  { code: 'th', label: 'ภาษาไทย',        active: false },
  { code: 'hi', label: 'हिन्दी',           active: false },
  { code: 'ja', label: '日本語',          active: false },
];
```
Render inactive entries with `aria-disabled="true"` and a "Coming soon" suffix. 10 items, EN first.
```bash
grep -rnE "'de'|\"de\"|German" app/ --include="*.tsx" --include="*.ts"
# must return 0
```

### Item 6: Pricing limits present
```bash
grep -rn "Up to 5 schools" app/ --include="*.tsx"   # ≥ 1
grep -rn "Up to 12 schools" app/ --include="*.tsx"  # ≥ 1
```

### Item 7: Adie FAB suppressed on public routes
```tsx
// app/_components/AdieFAB.tsx
'use client';
export function AdieFAB({ user }: { user?: { id: string } | null }) {
  if (!user) return null;               // hard gate
  return <aside className="fab-adie" aria-label="Adie chat">…</aside>;
}
```
Assertion:
```bash
grep -rn "AdieFAB" app/_components/ app/_landing/
# AdieFAB must NEVER be imported in app/page.tsx or app/_landing/**
grep -rn "AdieFAB" app/page.tsx app/_landing/ --include="*.tsx"
# must return 0
```
Note: the footer disclaimer `<aside class="foot-adie">` is a compliance note (Samaritans etc.), not a FAB. Keep it in `Footer.tsx`.

---

## 5. Improvements beyond Andy's list (what moves the needle)

### 5.1 Performance targets
- Lighthouse Performance (desktop) ≥ **95**
- Lighthouse Performance (mobile)  ≥ **90**
- LCP < 1.8s on 4G throttle
- CLS = 0 (pre-define hero height, reserve image boxes with `aspect-ratio`)
- TBT < 150ms

Techniques:
- Every image uses `next/image` with `sizes` set. Hero illustration: `priority`.
- All client islands marked `'use client'` only where needed. Nav and Footer remain RSC; ThemeToggle + LangSwitcher + CookieBanner are islands.
- `next/font` with `display: 'swap'` and `preload: true`.
- Prefetch `/contact-sales` on CTA hover via `<Link prefetch>`.
- `contain: strict` on aurora, each section `contain: layout paint`.

### 5.2 Accessibility (WCAG 2.1 AA, zero violations)
- All interactive elements have accessible names
- `prefers-reduced-motion` honored on all 16 animations
- Focus visible: 2px `var(--accent)` ring with `box-shadow`, never `outline: none`
- Contrast ≥ 4.5:1 in both themes (`#eaf1f7` on `#0d2538` = 14.6:1 ✓)
- Form labels associated, errors `aria-describedby`
- Skip link to `#main` as first focusable

```bash
npx @axe-core/cli http://localhost:3000 --exit 1
# must exit 0
```

### 5.3 SEO & social
- Per-route `metadata` export with title, description, `openGraph`, `twitter`
- `app/sitemap.ts` generating `/`, `/contact-sales`, `/signin`, `/signup`
- `app/robots.ts` allowing crawl except `/app/*`
- OG image: 1200×630 on `#0d2538` plate with green cat + "UniOffer" wordmark (Libre Baskerville)
- `next-seo` not needed; App Router native metadata is enough

### 5.4 UK-GDPR cookie banner
Bottom-fixed card with **equal prominence** Accept / Reject buttons (not a dark pattern). Writes `uo-consent` cookie; analytics script only fires after `accept`.

### 5.5 Analytics TODO (don't wire yet)
```tsx
// app/_components/Analytics.tsx
// TODO(Andy): create GA4 property for unioffer.ai and paste the measurement ID.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // e.g. G-XXXXXXXXXX
// Only render <Script> when GA_ID && consent === 'accept'.
```

### 5.6 Error boundaries
- `app/error.tsx` — global boundary
- `app/not-found.tsx` — branded 404 on `#0d2538`
- `app/loading.tsx` — green cat breathing skeleton

### 5.7 Security
- Strict CSP via `next.config.mjs` headers (unsafe-inline allowed only for `next/font` inline style)
- No third-party scripts without consent
- Forms use server actions with `revalidatePath`

### 5.8 Test coverage
- Keep existing 345 tests green
- Add playwright smokes: `/` loads, theme toggle flips bg to `#0d2538`, lang switcher shows 10 items, `/contact-sales` responds 200
```bash
pnpm test
pnpm playwright test e2e/landing.spec.ts
```

---

## 6. Execution phases (paste the appropriate phase into Claude Code one at a time)

### Phase A — Setup & token cleanup (20 min)
1. `git checkout -b feat/landing-v3-consolidate || git checkout feat/landing-v3-consolidate`
2. Run the admitos scan from § 4 Item 1 — fix every hit.
3. Write `app/globals.css` with the tokens from § 1. Delete conflicting token files.
4. Create `app/theme-init.tsx` + `app/_components/ThemeToggle.tsx` from § 1.
5. Wire fonts in `app/layout.tsx` from § 3.5.
6. `pnpm typecheck && pnpm lint` — green.
7. Commit: `feat(v3): Phase A — tokens, theme init, fonts, admitos scan clean`.
8. **Stop. Report.**

### Phase B — Kill the split + routes (30 min)
1. Delete `public/landing-v2.html`, `public/dashboard-v2.html`, `public/preview/*`.
2. Strip `/preview` rewrites from `next.config.mjs`. Add redirects + security headers from § 2.3.
3. Write `app/contact-sales/page.tsx` from § 4 Item 3.
4. Write `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`.
5. Write `app/_components/LangSwitcher.tsx` with the exact 10-language array from § 4 Item 5.
6. `pnpm build` — must succeed, no route collisions.
7. Commit: `feat(v3): Phase B — kill /preview split, add routes, lang switcher`.
8. **Stop. Report.**

### Phase C — Port landing sections (2–3 h)
Build the 8 landing sections in `app/_landing/`. Use `docs/prototypes/unioffer-landing.html` as the copy source only. Sections in order:
1. `Hero.tsx` — Libre Baskerville H1, Adie input with typing placeholder, 4 sample chips
2. `MarketReality.tsx` — nationality pool stats cards (China→Cambridge 10.9%, India→Oxford 4.2%, Singapore→Cambridge 26.5%, Hong Kong→Cambridge 17.6%, South Korea→Top US "Extreme")
3. `HowItWorks.tsx` — 5-step flow, SVG dash-draw
4. `Features.tsx` — 6 cards on desktop, 2 on mobile, hover glow
5. `Pricing.tsx` — Basic / Plus / Enterprise; Basic "Up to 5 schools (US or UK track)", Plus "Up to 12 schools (US + UK dual track)"
6. `Timeline.tsx` — application milestones with glow dots
7. `SocialProof.tsx` — logos (greyscale) + 3 quotes
8. `Aurora.tsx` — reduced-opacity aurora from § 3.2

Each section uses `contain: layout paint`, animates on `IntersectionObserver` with `prefers-reduced-motion` fallback.

Commit: `feat(v3): Phase C — landing sections ported, tokens-only, reduced aurora`.
**Stop. Report.** Show a screenshot (or describe the page heights + section colors).

### Phase D — Chat agent and dashboard (1 h)
1. `app/app/layout.tsx` — authenticated shell; conditionally renders `<AdieFAB user={session.user} />` only when user exists.
2. `app/app/chat/page.tsx` — uses the same `#0d2538` via `:root[data-theme='dark']`. Chat bubbles sit on `--bg-surface` (#162130).
3. `app/app/dashboard/page.tsx` — skeleton on load, staggered card entry.
4. Commit: `feat(v3): Phase D — authenticated shell, chat agent, dashboard`.
5. **Stop. Report.**

### Phase E — Full gate sweep + validation (45 min)
Run these six in order. Every one must pass before proceeding.
```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm check:isolation
```

Then the Andy-item assertions from § 4:
```bash
# Item 1
grep -ri "admitos\|AdmitOS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.env*" -l . | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline
# Item 2 — no emoji
grep -rnP "[\x{1F300}-\x{1FAFF}\x{1F600}-\x{1F64F}\x{2600}-\x{27BF}]" app/ --include="*.tsx" --include="*.ts"
# Item 3
test -f app/contact-sales/page.tsx
grep -rnE 'href="(/signin|/signup|#)"[^>]*>\s*Contact Sales' app/
# Item 4
grep -rn ">[^<]*undecided[^<]*<" app/ --include="*.tsx"
# Item 5
grep -rnE "'de'|\"de\"|German" app/ --include="*.tsx" --include="*.ts"
# Item 6
grep -rn "Up to 5 schools" app/ --include="*.tsx"
grep -rn "Up to 12 schools" app/ --include="*.tsx"
# Item 7 — AdieFAB not on public routes
grep -rn "AdieFAB" app/page.tsx app/_landing/ --include="*.tsx"
```

Lighthouse + axe:
```bash
pnpm dev &
sleep 5
npx lighthouse http://localhost:3000 --preset=desktop --output=json --output-path=/tmp/lh-d.json --quiet
npx lighthouse http://localhost:3000 --form-factor=mobile --output=json --output-path=/tmp/lh-m.json --quiet
npx @axe-core/cli http://localhost:3000 --exit
```

Print scores. Targets: Perf desktop ≥ 95 / mobile ≥ 90, A11y ≥ 95, axe = 0.

Commit: `chore(v3): Phase E — all gates green, Andy 7/7 enforced`.
**Stop. Report the scores.**

### Phase F — Deploy + PR update (20 min)
```bash
git push origin HEAD
vercel deploy --no-wait 2>&1 | tee /tmp/vercel-deploy.log
PREVIEW_URL=$(grep -oE 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | head -1)
```

Smoke the live URL:
- `/` loads, theme toggle flips bg to `#0d2538` and persists after reload
- `/app/chat` and `/app/dashboard` (while signed out, should redirect to `/signin` or render public placeholder)
- `/contact-sales` loads with form
- `/preview` 307s to `/`
- OG image renders
- No console errors, no hydration warnings

Update PR #2 with the template from the previous Phase E prompt (§ E.1), substituting the new preview URL, Lighthouse scores, and empty grep-scan output.

```bash
gh pr ready 2
```

**Report**: "V3 complete. Preview [URL]. 7/7 Andy items pass. Lighthouse perf desktop XX / mobile XX. a11y XX. axe 0. Ready for Andy."

---

## 7. QA checklist — run this as a human before telling Andy

Open the deployed URL and verify, in order:

- [ ] `/` loads in dark by default, bg is exactly `rgb(13, 37, 56)` (`#0d2538`)
- [ ] Theme toggle flips to light (warm off-white `#f7f5f1`) and back; persists on reload
- [ ] Nav: green cat icon 28px left, "UniOffer" wordmark Libre Baskerville, theme toggle, lang switcher, "Log in" + "Get UniOffer" CTAs
- [ ] Hero H1 Libre Baskerville, Adie input with typing placeholder cycling
- [ ] 4 Adie sample chips under input
- [ ] Market Reality: 5 stat cards with nationality pool numbers
- [ ] How it Works: 5 steps with SVG flow lines animating on scroll
- [ ] Features: 6 cards, hover lifts
- [ ] Pricing: 3 tiers, Basic shows "Up to 5 schools", Plus shows "Up to 12 schools", Plus has conic rotating border
- [ ] Timeline section with glowing milestones
- [ ] Footer: green cat + wordmark (max 200px), Adie disclaimer (wellbeing, Samaritans), GDPR links
- [ ] Cookie banner: Accept + Reject equal, dismissible, persists
- [ ] Lang switcher: 10 items, EN active, 9 Coming soon aria-disabled, no German
- [ ] "Contact Sales" anywhere → `/contact-sales` (check every CTA)
- [ ] No emoji, no "admitos", no "undecided"
- [ ] Aurora blobs visible but subtle (< 30% opacity)
- [ ] `prefers-reduced-motion` disables aurora animation (test via DevTools → Rendering)
- [ ] Mobile (375px): no horizontal scroll, nav collapses, hero H1 readable
- [ ] Lighthouse perf ≥ 95 desktop, ≥ 90 mobile
- [ ] axe 0 violations
- [ ] `/app/chat` also on `#0d2538`

---

## 8. Message to Andy (paste after Phase F)

> Done. Commit `<SHA>` live at `<PREVIEW_URL>`.
>
> **7/7 checklist passes.** Canonical `#0d2538` night bg applied globally (landing + chat agent + dashboard). Theme toggle is real and persisted. Contact Sales CTAs route to `/contact-sales` everywhere. Lang switcher 10 items, no German. Pricing limits live. No emoji, no admitos outside pipeline, no "undecided".
>
> **Improvements beyond spec:** Lighthouse perf XX (desktop) / XX (mobile). axe 0 violations. UK-GDPR cookie banner (Accept/Reject equal). Security headers (CSP, X-Frame-Options, Permissions-Policy). `/preview` now 307s to `/` so your existing link still works.
>
> **Deferred (call when you're ready):** GA4 property for unioffer.ai, final OG image sign-off, `admitos-training-pipeline/` rename to its own PR (11 deferred hits), Week-3 credits tables.
>
> Your call on merge.

---

## 9. If a phase fails

- **Route conflict** (`app/page.tsx` + `app/(marketing)/page.tsx`): delete the duplicate.
- **Tailwind preflight vs tokens**: add `@layer base, components, utilities, landing;` at top of `globals.css`, move any legacy rules into `@layer landing`.
- **FOUT**: verify `next/font` imports live only in `app/layout.tsx`.
- **Hydration warning on typing placeholder `<input>`**: add `suppressHydrationWarning`.
- **`vercel deploy` fails**: `vercel whoami`, then `vercel link` to the unioffer-cowork project, retry.
- **Lighthouse perf < 95 desktop**: biggest wins are (a) `next/image` on the hero, (b) `font-display: swap`, (c) remove the SVG turbulence filter on grain (swap for a 1KB PNG), (d) code-split `Aurora.tsx` with `next/dynamic({ ssr: false })`.

---

## 10. Stop conditions — do NOT continue if

- Any grep-scan assertion in § 4 returns matches you can't explain.
- `pnpm build` fails.
- Hydration warning appears in console on `/` or `/app/chat`.
- Background color in DevTools is not exactly `rgb(13, 37, 56)` when `data-theme='dark'`.
- Andy's existing preview link `/preview` 404s instead of redirecting.

Report the failure, don't band-aid it.

---

**End of master prompt V3.** Paste Phase A first, commit, then Phase B, and so on. Do not run the whole thing in one shot — Claude Code will context-overflow.
