# Unioffer Landing + Dashboard — Claude Code Master Deployment Prompt

**Paste this entire prompt into Claude Code. Execute end-to-end. Do not ask for clarification unless genuinely blocked.**

---

## 0 · CONTEXT & MISSION

You are deploying the **Unioffer** platform — a premium AI-powered university admissions operating system. This is a **complete visual rebuild** benchmarked against two references:

1. **AdmitOS Excellence V2** (`https://admitos-excellence-as-a-service-v2.pages.dev/dashboard/overview` and its home page) — this is Andy Yu's (CEO) existing product. Our Unioffer site must be **consistent in theme** with this reference.
2. **Manus.im** (`https://manus.im`) — the gold standard for premium AI product polish. Loading screens, animated flow lines, scroll reveals, composer interactions.

**The goal: Make Unioffer's UI/UX so premium that Andy can't ignore it.**

### What exists

Two **complete, production-ready HTML prototypes** are already in the repo at `docs/prototypes/`:
- `docs/prototypes/unioffer-landing.html` — ~1500 lines, Libre Baskerville + Inter, loading screen, SVG flow lines, ambient orbs, typing placeholder, shimmer effects, scroll reveals, dark/light toggle
- `docs/prototypes/unioffer-dashboard.html` — ~850 lines, sidebar + composer, Libre Baskerville + Inter, loading screen, task list, model selector

These prototypes are **already themed** to match the AdmitOS Excellence V2 color system. They are the V2 design — do NOT redesign them, do NOT rebuild from scratch. Convert and deploy them.

### Platform rename

The platform was previously called "AdmitOS". It is now **Unioffer** (note: lowercase "o" in "offer"). The domain will be `unioffer.ai`.

- Brand name: **Unioffer** (NOT "UniOffer", NOT "UNIOFFER" — the "o" in "offer" is lowercase)
- In code variables/classes: `unioffer` (all lowercase)
- In UI display: `Unioffer`
- Logo: keep it SMALL — icon-sized, not oversized. Think manus.im logo size.

### Tagline

- Primary: **"More Than Offers. We Spark Futures."**
- Subtitle: **"AI-Powered Admissions for the AI-Native Generation."**

### Codebase

- Repo: `github.com/unioffer-cowork/admitos-mvp-platform` (private)
- Stack: Next.js 14 App Router
- Branch: create `feat/landing-page-v2`

---

## 1 · BEFORE YOU START — RESEARCH PHASE

**This research phase is CRITICAL. Do not skip any step. Read everything before writing a single line of code.**

### 1.1 Study the reference site

Open and carefully study:
```
https://admitos-excellence-as-a-service-v2.pages.dev/
https://admitos-excellence-as-a-service-v2.pages.dev/dashboard/overview
```

Extract and note:
- The exact color palette (dark navy backgrounds, warm off-white content areas, purple accents)
- The sidebar structure — **every nav item** (Home, Overview, Preparation OS, Application OS, School List, Essays & Writing, Advising & Services, Commons, Adie)
- The typography (Inter font, weight 300 for headings)
- The layout patterns (sidebar width ~260px, content area styling)
- The card designs, spacing, shadows
- The overall "premium but restrained" feel

### 1.2 Study Manus.im

Open `https://manus.im` and note:
- The loading screen animation
- The hero layout (headline + composer + chips — nothing else)
- Libre Baskerville serif headlines at 36px weight 400
- The animated SVG flow lines
- The generous whitespace and breathing room
- The interaction quality (hover states, transitions, scroll reveals)

### 1.3 Read Andy's emails

Search the repo for any docs/emails Andy has sent. Also check for these specific brand specs:
- **Brand colors from Andy**: Navy #0A1628, Orange #F97316, Green #34D399, Purple #A78BFA
- **Fonts from Andy**: Syne (logo/headlines) + DM Sans (body) + Cormorant Garamond (tagline italics)

**IMPORTANT**: The prototypes already use Libre Baskerville + Inter (matching manus.im). This is the CORRECT choice for V2. Andy's Syne/DM Sans spec was for V1 — we are deliberately upgrading to a more premium typographic palette.

### 1.4 Read the 14 PDF spec documents

Andy committed 14 specification documents to the repo. Find them:
```bash
find . -name "*.pdf" -not -path "*/node_modules/*" -not -path "*/.next/*" | head -20
find . -path "*/docs/*" -name "*.pdf" | head -20
ls -la docs/*.pdf 2>/dev/null
ls -la docs/**/*.pdf 2>/dev/null
```

Read every PDF. Extract:
- Feature specifications for ALL 12 AI agents
- The MVP feature list (this determines sidebar nav items)
- Application flow and user journey
- Any design requirements or brand guidelines
- Pricing tiers and features
- Compliance requirements (UK GDPR, etc.)

### 1.5 Verify prototypes exist

```bash
ls -la docs/prototypes/unioffer-landing.html docs/prototypes/unioffer-dashboard.html
wc -l docs/prototypes/*.html
grep "Libre Baskerville" docs/prototypes/unioffer-landing.html | head -1
grep "More Than Offers" docs/prototypes/unioffer-landing.html | head -1
```

If the prototypes don't exist yet, they need to be created from the HTML files committed alongside this prompt or copied from the `public/` directory.

---

## 2 · DESIGN TOKENS (Already in the prototypes — DO NOT CHANGE)

These tokens match the AdmitOS Excellence V2 reference site. They are already embedded in the prototypes.

```css
/* DARK (default) — AdmitOS Excellence V2 theme */
--bg:               #0f1722;       /* Body background — matches reference rgb(15,23,34) */
--bg-surface:       #162130;       /* Sidebar/card bg — matches reference rgb(22,33,48) */
--bg-elevated:      #1e2d3e;       /* Elevated surfaces */
--fg:               #eaf1f7;       /* Primary text — matches reference rgb(234,241,247) */
--fg-secondary:     #aab7c4;       /* Secondary text */
--fg-muted:         #5e6b78;       /* Muted text */
--accent:           #7c3aed;       /* Purple accent — matches reference rgb(124,58,237) */
--accent-hover:     #8b5cf6;       /* Purple hover state */

/* LIGHT theme */
--bg:               #f7f5f1;       /* Warm off-white — matches reference rgb(247,245,241) */
--bg-surface:       #ffffff;
--fg:               #223042;       /* Dark navy text */
--accent:           #7c3aed;       /* Same purple accent */

/* Fonts */
--font-serif:  'Libre Baskerville', Georgia, serif;    /* Headlines */
--font-sans:   'Inter', system-ui, sans-serif;          /* Body */
```

---

## 3 · SIDEBAR — IMPORT ALL MVP FEATURES

**This is critical.** The dashboard sidebar must carry ALL features from the AdmitOS Excellence V2 MVP as navigation items. Based on the reference site, the sidebar nav items are:

```
Home
Overview
─── AI Agents ───
Preparation OS
Application OS
School List
Essays & Writing
─── Support ───
Advising & Services
Commons (community)
Adie (AI assistant)
```

**But also check the 14 PDF specs** for the full list of 12 AI agents and ensure EVERY feature has a nav entry. The sidebar should include:

1. **Home** — landing/chat view
2. **Overview** — dashboard overview with stats
3. **Preparation OS** — test prep, profile building
4. **Application OS** — application management
5. **School List** — school shortlisting AI
6. **Essays & Writing** — essay drafting/review
7. **Advising & Services** — advisor matching
8. **Commons** — community features
9. **Adie** — AI assistant/chatbot
10. Any additional agents from the PDFs

The sidebar design should match the reference site:
- Width: 260px (full) / 64px (collapsed icon-only)
- Background: `#162130` (--bg-surface)
- Active item: purple left border + subtle purple background
- Hover: slightly lighter background
- Section dividers between groups
- User avatar/credits at bottom

**The landing page (home route) should show the sidebar collapsed to icon-only (~64px)**, matching how the reference site's home page works. The dashboard shows the full 260px sidebar.

---

## 4 · CONVERSION STRATEGY

### 4.1 The simplest path (PREFERRED)

**The prototypes are production-ready single-file HTML.** The simplest and most reliable approach:

```bash
# Copy prototypes to public/
mkdir -p public/prototypes
cp docs/prototypes/unioffer-landing.html public/landing.html
cp docs/prototypes/unioffer-dashboard.html public/dashboard-preview.html
```

Then set up Next.js rewrites in `next.config.mjs`:
```js
async rewrites() {
  return [
    { source: '/preview', destination: '/landing.html' },
    { source: '/preview/dashboard', destination: '/dashboard-preview.html' },
  ];
}
```

This gets a live preview URL IMMEDIATELY while you work on the full Next.js conversion.

### 4.2 Full Next.js conversion

Create proper Next.js routes:

**Landing page:** `app/(marketing)/page.tsx`

```
app/(marketing)/
  layout.tsx          — Font loaders (Libre Baskerville + Inter), metadata
  page.tsx            — Landing page
  landing.css         — All landing page styles (extracted from prototype <style>)
  components/
    Loader.tsx        — Loading screen (client component)
    Hero.tsx          — Hero + Composer + Chips
    Composer.tsx      — AI chat input (client component)
    FlowLines.tsx     — SVG animated lines (client component)
    AmbientBg.tsx     — Floating gradient orbs
    MarketReality.tsx — Stats section
    Features.tsx      — Feature grid
    HowItWorks.tsx    — Timeline
    Trust.tsx         — Trust badges
    Pricing.tsx       — Pricing cards
    Footer.tsx        — Footer
    ScrollReveal.tsx  — IntersectionObserver wrapper (client component)
    ThemeToggle.tsx   — Dark/light switcher (client component)
```

**Dashboard:** `app/(app)/dashboard/page.tsx`

```
app/(app)/dashboard/
  page.tsx
  dashboard.css
  components/
    Sidebar.tsx       — Full 260px sidebar with ALL MVP nav items
    DashComposer.tsx  — Chat composer
    TaskList.tsx      — Task/project list
    ChipRow.tsx       — Action chips
    ModelSelector.tsx — AI model picker
```

**Key conversion rules:**
- Extract ALL CSS from `<style>` tags into separate `.css` files and import them
- Convert HTML to JSX (className, htmlFor, self-closing tags, etc.)
- Extract JS into `useEffect` hooks or client component wrappers
- Keep the loading screen as a client component with `useState`
- Keep ALL animations: SVG flow lines, scroll reveals, typing placeholder, shimmer effects, ambient orbs, section line draw-on-scroll, card hover effects, pricing card animated border
- Keep the theme toggle using `data-theme` attribute
- Wrap typing animation in `useEffect` with `suppressHydrationWarning` to prevent hydration mismatch

**Font setup in layout:**
```tsx
import { Libre_Baskerville, Inter } from 'next/font/google';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
```

### 4.3 CSS Strategy

Keep the CSS as **plain CSS files imported into layouts/pages**. Do NOT convert to Tailwind — the animations, custom properties, and complex selectors would break. The CSS is already production-quality.

Scope everything to avoid Tailwind reset conflicts:
```css
.uo-landing { /* all landing styles scoped here */ }
.uo-dashboard { /* all dashboard styles scoped here */ }
```

### 4.4 Handle existing routes

- If `app/page.tsx` exists as a tombstone/placeholder, remove it — the new `app/(marketing)/page.tsx` replaces it
- If `app/_landing/` exists from V1, leave it but ensure the new routes take priority
- The V2 prototypes replace EVERYTHING from V1

---

## 5 · CONTENT REQUIREMENTS

### 5.1 Landing page sections (from prototypes)

The landing page prototype already contains all these sections. Preserve them exactly:

1. **Loading screen** — 3-ring spinning logo + progress bar
2. **Navigation** — thin top bar, Unioffer logo (small!) left, theme toggle right
3. **Hero** — H1 headline + subtitle + composer + connect bar + action chips
   - H1: "More Than Offers. We Spark Futures."
   - Subtitle: "AI-Powered Admissions for the AI-Native Generation."
   - Composer with toolbar (attach, agents, chat, emoji, mic, submit)
   - "Connect your tools" integration bar
   - Typing placeholder cycling through prompts
4. **Market Reality** — stats cards with admission rates
5. **How It Works** — timeline/steps
6. **Features** — grid of AI agent features (headline + one line per card, max 18 words)
7. **Trust/Compliance** — trust badges
8. **Pricing** — 3-tier pricing cards
   - Basic: includes "Up to 5 schools (US or UK track)"
   - Plus: includes "Up to 12 schools (US + UK dual track)"
   - Premium: Contact Sales
9. **Footer** — with links, disclaimer

### 5.2 Dashboard sections (from prototype)

1. **Loading screen** — spinning logo + progress bar
2. **Sidebar** — 260px, dark, with ALL MVP nav items (see Section 3)
3. **Main area** — composer + task list + action chips
4. **Model selector** — AI model picker
5. **Credits display** — usage credits
6. **Bottom carousel card** — contextual suggestions

### 5.3 Branding consistency

Throughout both pages:
- Logo: Unioffer (lowercase "o"), displayed SMALL (icon-sized, ~24-32px)
- Colors: match AdmitOS Excellence V2 exactly (see Section 2)
- Typography: Libre Baskerville for headlines, Inter for body
- Accent: Purple `#7c3aed` on CTAs and interactive elements only
- No maroon anywhere
- Single color system — don't introduce random colors
- Dark mode as default, with smooth light mode toggle

---

## 6 · METADATA & SEO

In `app/(marketing)/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Unioffer — More Than Offers. We Spark Futures.',
  description: 'AI-Powered Admissions for the AI-Native Generation. 12 AI agents. One platform. From profile to application — guided at every step.',
  openGraph: {
    title: 'Unioffer — More Than Offers. We Spark Futures.',
    description: 'AI-Powered Admissions for the AI-Native Generation.',
    type: 'website',
  },
  robots: { index: false, follow: false }, // noindex for now
};
```

---

## 7 · BUILD & DEPLOY

### 7.1 Branch setup
```bash
git checkout -b feat/landing-page-v2 2>/dev/null || git checkout feat/landing-page-v2
```

### 7.2 Build verification
```bash
# Remove tombstoned root page if it conflicts
[ -f app/page.tsx ] && git rm app/page.tsx

pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

Fix any errors. Common issues:
- `app/page.tsx` conflicts with `app/(marketing)/page.tsx` → delete the tombstone
- Tailwind reset overrides landing CSS → add `@layer` scoping
- Fonts fail to load → verify `next/font/google` imports are in the layout
- Typing animation breaks React hydration → wrap in `useEffect` with `suppressHydrationWarning`

### 7.3 Deploy to Vercel
```bash
# Option A: Vercel CLI
vercel deploy --no-wait 2>&1 | tee /tmp/vercel-deploy.log
PREVIEW_URL=$(grep -oP 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | head -1)
echo "Preview URL: $PREVIEW_URL"

# Option B: Git push (if Vercel is git-linked)
git add -A
git commit -m "feat(v2): ship Unioffer landing + dashboard with Manus-level polish

- Loading screen with 3-ring spinning logo + progress bar
- Animated SVG flow lines with glowing particles
- Libre Baskerville serif headlines, Inter body
- Full dark/light theme toggle with smooth transitions
- Composer with toolbar: attach, agents, chat, emoji, mic, submit
- 'Connect your tools' integration bar
- Typing placeholder animation cycling through prompts
- Scroll-reveal animations on all sections
- Animated SVG section dividers
- Ambient floating gradient orbs
- Responsive: 768px + 480px breakpoints
- Pricing featured card with animated conic-gradient border
- Dashboard: sidebar with all MVP nav items, model selector, credits
- Tagline: More Than Offers. We Spark Futures.
- Theme: AdmitOS Excellence V2 color system (#0f1722 / #7c3aed)

Replaces V1 design with premium V2 benchmarked against manus.im"

git push origin HEAD
```

### 7.4 Fallback: Static deploy

If Next.js conversion is too complex or breaks animations:
```bash
# Just deploy the HTML files directly
cp docs/prototypes/unioffer-landing.html public/index.html
cp docs/prototypes/unioffer-dashboard.html public/dashboard.html

# OR deploy prototypes folder as static site
cat > docs/prototypes/vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/", "destination": "/unioffer-landing.html" },
    { "source": "/dashboard", "destination": "/unioffer-dashboard.html" }
  ]
}
EOF
cd docs/prototypes && vercel deploy
```

---

## 8 · QA VALIDATION

### 8.1 Lighthouse
```bash
npx -y lighthouse $PREVIEW_URL \
  --preset=mobile \
  --output=html \
  --output-path=./docs/validation/lighthouse-v2.html \
  --chrome-flags="--headless --no-sandbox" \
  --quiet
```

Thresholds: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90.

### 8.2 Accessibility (axe)
```bash
npx -y @axe-core/cli $PREVIEW_URL \
  --exit \
  --tags wcag2a,wcag2aa \
  --save ./docs/validation/axe-v2.json
```

Target: 0 violations.

### 8.3 Visual verification checklist

Open preview at 1440×900. Verify:

| # | Checkpoint | Expected |
|---|-----------|----------|
| 1 | Hero content | Nav + H1 + Subtitle + Composer + Connect bar + Chips = nothing else |
| 2 | Headline font | Libre Baskerville weight 400 (regular, not bold) |
| 3 | Hero spacing | ≥100px above headline, generous gaps between elements |
| 4 | Section breathing | Every section has spacious padding, no cramped layouts |
| 5 | Color system | Single fg color for text, purple accent only on CTAs/badges |
| 6 | Zero maroon | No maroon anywhere on either page |
| 7 | Feature cards | Headline + ≤18 words per card body |
| 8 | Logo size | Unioffer logo is small/icon-sized, not oversized |
| 9 | Brand name | "Unioffer" with lowercase "o" everywhere |
| 10 | Sidebar nav | Dashboard sidebar has ALL MVP features as nav items |
| 11 | Theme consistency | Colors match AdmitOS Excellence V2 reference site |
| 12 | Loading screen | Animated logo + progress bar on both pages |

### 8.4 Animation checklist

| Animation | Location | Must work |
|-----------|----------|-----------|
| Loading screen (3 rings + progress) | Page load | ✓ |
| Page reveal (slide up) | After loader | ✓ |
| Typing placeholder | Composer | ✓ |
| Scroll reveals | Every section | ✓ |
| SVG flow lines + particles | Full page | ✓ |
| Section line draw-on-scroll | Between sections | ✓ |
| Composer shimmer on focus | Composer border | ✓ |
| Card hover lift + gradient | All cards | ✓ |
| Timeline step glow | How it Works | ✓ |
| Pricing card border rotation | Plus card | ✓ |
| Theme toggle transition | Nav button | ✓ |
| CTA pulse glow | Primary buttons | ✓ |
| Ambient orbs drift | Background | ✓ |

---

## 9 · PR CREATION

```bash
gh pr create --title "feat: Unioffer landing + dashboard v2 — Manus-level polish" --body "$(cat <<'EOF'
## Preview

**Landing page:** [PREVIEW_URL]
**Dashboard:** [PREVIEW_URL]/dashboard

## What changed

Complete visual rebuild of Unioffer landing page + dashboard, benchmarked against manus.im and themed consistently with the AdmitOS Excellence V2 reference site.

### Landing page
- Loading screen with animated logo + progress bar
- Animated SVG flow lines with glowing particles
- Libre Baskerville serif headlines (matching manus.im)
- Full dark/light theme with smooth transitions
- Composer with full toolbar (attach, agents, chat, emoji, mic, submit)
- "Connect your tools" integration bar
- Typing placeholder animation
- Scroll-reveal animations on all sections
- Animated section dividers
- Tagline: "More Than Offers. We Spark Futures."

### Dashboard
- Full sidebar with ALL MVP navigation items
- Same color system as AdmitOS Excellence V2 reference
- Composer with action chips
- Task list, model selector, credits display

### Theme consistency with reference
- Body bg: #0f1722 (matching reference)
- Sidebar bg: #162130 (matching reference)
- Accent purple: #7c3aed (matching reference)
- Content bg (light): #f7f5f1 (matching reference)
- Typography: Libre Baskerville + Inter

## Validation

- Lighthouse Performance: __
- Lighthouse Accessibility: __
- axe violations: __

## Test plan

- [ ] Open landing at 1440×900 — verify loading animation
- [ ] Scroll full page — verify all scroll reveals
- [ ] Click theme toggle — verify smooth dark↔light
- [ ] Click chips — verify composer populates
- [ ] Open /dashboard — verify sidebar + all nav items
- [ ] Test mobile (375px) — verify responsive layout
- [ ] Compare colors side-by-side with reference site
- [ ] Verify "Unioffer" (lowercase o) throughout

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 10 · CRITICAL REMINDERS

1. **Do NOT redesign the prototypes.** They are already premium. Convert them faithfully.
2. **The "o" in Unioffer is lowercase.** Not "UniOffer".
3. **Logo must be SMALL** — icon-sized (~24-32px), like manus.im.
4. **Theme must match** the AdmitOS Excellence V2 reference site colors exactly.
5. **Sidebar must carry ALL features** from the MVP as navigation items.
6. **If Next.js conversion breaks animations, use the static fallback** (Section 7.4). Getting a live preview URL is more important than perfect Next.js architecture.
7. **Read the 14 PDFs** — they contain the feature specs that determine sidebar nav items.
8. **Study the reference site** (`admitos-excellence-as-a-service-v2.pages.dev`) — this is the design authority.
9. **Study manus.im** — this is the interaction quality benchmark.
10. **Deploy to Vercel** — Andy needs to see a live URL.

---

## 11 · BLOCKERS

- If Next.js build fails due to `app/page.tsx` tombstone: `git rm app/page.tsx`
- If CSS animations break in Next.js: check CSS file is imported in layout, not just page
- If fonts don't load: verify `next/font/google` imports in layout
- If Vercel deploy fails: try `vercel --prod` or push to git for auto-deploy
- If typing animation breaks hydration: `useEffect` + `suppressHydrationWarning`
- If sidebar nav items unclear: study the reference site + PDFs, include ALL items visible in the reference

---

**End of master prompt. Start with Section 1 research phase. Read everything. Then execute.**
