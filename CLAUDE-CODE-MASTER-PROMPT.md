# Unioffer Landing Page V2 — Claude Code Master Prompt

**Paste this entire prompt into Claude Code. Execute end-to-end. Do not ask for clarification unless genuinely blocked.**

---

## 0 · SITUATION

Andy Yu (CEO) rejected the V1 landing page. His exact words: "The current page is a wall of text. Every section is dense, the typography feels compressed, there is almost no breathing room. It reads like a specification document rendered as a webpage."

**Two complete V2 HTML prototypes are already in the repo** at `docs/prototypes/`. They were designed to fix every issue Andy raised and are themed to match the AdmitOS Excellence V2 reference site. Your job is to:

1. Complete Andy's 7-item merge checklist (Section 1)
2. Convert the V2 prototypes into Next.js components, preserving EVERY animation (Section 2)
3. Build, deploy to Vercel, push to GitHub, update PR #2

### References to study BEFORE writing any code

1. **AdmitOS Excellence V2** — `https://admitos-excellence-as-a-service-v2.pages.dev/` and `/dashboard/overview` — This is the CEO's product. Our theme MUST match.
2. **Manus.im** — `https://manus.im` — Andy's benchmark for premium AI product polish.
3. **Claude.ai** — Andy also referenced this as a benchmark for clean, minimal design.
4. **V2 landing prototype** — `docs/prototypes/unioffer-landing.html` (~1500 lines) — open in browser, study every section and animation.
5. **V2 dashboard prototype** — `docs/prototypes/unioffer-dashboard.html` (~850 lines) — open in browser.
6. **Brand PDF** — `docs/brand/unioffer-brand-identity-guidelines.pdf`
7. **All 14 spec documents** Andy committed — find them:
   ```bash
   find . -path "*/docs/*" \( -name "*.pdf" -o -name "*.docx" \) -not -path "*/node_modules/*" | head -30
   ls -la docs/specs/ 2>/dev/null
   ```
   Key docs: 01 Preparation OS V2.2, 02 Application OS V2.2, 03 Landing Page V3.1, 04 Agent Chat V2.2, 05 School List Strategy V2.2, 06 Essay Writing V2.2, 07 Advising Services V2.2, 08 Candidacy Evaluation Form V2.2, 09 Adie Commons V2.2, 10 Consent Modal V2.2, 11 Terms of Service V2.2, 12 Privacy Policy V2.2, 13 Referral Credits Module V1.0, Features/How-it-works/Pricing modules.

### Platform identity

- Brand name: **Unioffer** (lowercase "o" in "offer" — NOT "UniOffer", NOT "UNIOFFER")
- In code: `unioffer` (all lowercase)
- Logo: SMALL — icon-sized (~24-32px), think manus.im logo size
- Domain: `unioffer.ai`
- Tagline: "More Than Offers. We Spark Futures."
- Subtitle: "AI-Powered Admissions for the AI-Native Generation."

### Codebase

- Stack: Next.js 15 App Router (`"next": "15.0.8"` in package.json)
- Branch: `feat/landing-page-v2` (create from current branch)
- CI gates: `pnpm typecheck && pnpm test && pnpm lint && pnpm check:isolation`
- Existing landing: `app/_landing/LandingClient.tsx` + `app/_landing/landing.css` — this is V1, being REPLACED
- Root page: `app/page.tsx` — update to import V2

---

## 1 · ANDY'S 7-ITEM MERGE CHECKLIST (PR #2)

**Every item below is MANDATORY before PR #2 can move from Draft to Ready for Review.**

### Item 1 — Repo rename compliance scan
The repo is `admitos-mvp-platform`. Andy wants it renamed to `unioffer-mvp-platform` (this is a GitHub-level rename — if you cannot do it, document it). What you MUST do:
- Run a grep scan confirming ZERO matches for `admitos` or `AdmitOS` across all source files, `.env.example`, `docs/`, `.github/workflows/`, and `README.md`
- The 11 residual hits in `admitos-training-pipeline/` are acceptable as a deferred PR — document them explicitly in the PR description
- Include the grep scan output in the PR description

```bash
grep -ri "admitos\|AdmitOS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.env*" -l . | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline
```

### Item 2 — Visual redesign (THE MAIN EVENT)
This is covered in detail in Section 2 below. The V2 prototypes already solve everything Andy asked for:
- No emoji/icons (clean typographic treatment only)
- Generous spacing (Manus-level whitespace)
- Typography calibrated to viewport (Libre Baskerville headlines, Inter body)
- White space used deliberately (hero is headline + composer + chips, nothing else)
- manus.im is the benchmark

### Item 3 — Contact Sales routing
The Contact Sales button in Pricing currently routes to `/signin?mode=signup`. This is WRONG.
- Create a `/contact-sales` placeholder route
- Show a simple "Book a Discovery Call" message
- Optionally embed a Calendly widget or mailto link
- It must NOT route to the sign-up flow

### Item 4 — Remove stray text node
There is an `undecided` text node visible in the page source after the Adie footer disclaimer. Find it and remove it.

```bash
grep -rn "undecided" app/ --include="*.tsx" --include="*.ts" --include="*.jsx"
```

### Item 5 — Language switcher correction
Current switcher shows EN / ZH / KO / JA / AR / DE. Andy's directive:
- **Remove DE (German)** — not a target market
- Add the correct 10-language priority order:

```
1.  English              — active at launch
2.  Simplified Chinese 简体中文    — Priority 1
3.  Traditional Chinese 繁體中文   — Priority 2
4.  Korean 한국어                  — Priority 3
5.  Arabic العربية                 — Priority 4 (RTL layout required)
6.  Vietnamese Tiếng Việt          — Priority 5
7.  Malay Bahasa Melayu            — Priority 6
8.  Thai ภาษาไทย                   — Priority 7
9.  Hindi हिन्दी                    — Priority 8
10. Japanese 日本語                 — Priority 9
```

- All 10 languages visible in the switcher
- EN is active, all others show "Coming soon" state with `aria-disabled`
- No i18n payload preload for inactive languages

### Item 6 — Pricing card school count limits
Add to the Pricing section feature lists:
- **Basic tier**: "Up to 5 schools (US or UK track)"
- **Plus tier**: "Up to 12 schools (US + UK dual track)"

These limits are currently missing from all materials. Andy explicitly confirmed they must be added.

### Item 7 — Adie FAB suppression
The Adie floating action button must be conditionally suppressed on the unauthenticated landing page.
- Adie icon must NOT appear for logged-out visitors
- Confirm in the PR description that this is enforced

---

## 2 · VISUAL REDESIGN — V2 PROTOTYPE CONVERSION

### 2.0 Design tokens (already in prototypes — DO NOT CHANGE)

These match the AdmitOS Excellence V2 reference site exactly:

```css
/* DARK (default) */
--bg:            #0f1722;    /* Body background */
--bg-surface:    #162130;    /* Sidebar/card background */
--bg-elevated:   #1e2d3e;    /* Elevated surfaces */
--fg:            #eaf1f7;    /* Primary text */
--fg-secondary:  #aab7c4;    /* Secondary text */
--fg-muted:      #5e6b78;    /* Muted text */
--accent:        #7c3aed;    /* Purple accent */
--accent-hover:  #8b5cf6;    /* Purple hover */

/* LIGHT */
--bg:            #f7f5f1;    /* Warm off-white */
--bg-surface:    #ffffff;
--fg:            #223042;    /* Dark navy text */
--accent:        #7c3aed;    /* Same purple */

/* Fonts */
--font-serif: 'Libre Baskerville', Georgia, serif;   /* Headlines */
--font-sans:  'Inter', system-ui, sans-serif;         /* Body */
```

### 2.1 Conversion steps

**Open `docs/prototypes/unioffer-landing.html` in a browser first. Study every section and animation. Then convert:**

1. **Extract all CSS** from the `<style>` tag into `app/_landing/landing.css` (replace existing V1 CSS entirely)
2. **Convert HTML to JSX** in `app/_landing/LandingClient.tsx` (replace existing V1 component entirely):
   - `class` → `className`
   - `for` → `htmlFor`
   - Self-closing tags (`<br/>`, `<img/>`, `<input/>`)
   - Inline `style` attributes → `style={{ }}` objects
3. **Extract JavaScript** from `<script>` tags into `useEffect` hooks in the client component
4. **Font setup** in the layout:
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
5. **Scope all CSS** under `.uo-landing` to avoid Tailwind reset conflicts (the prototype CSS already does this)
6. **Update `app/page.tsx`** to import the new V2 LandingClient

### 2.2 Animations — PRESERVE ALL OF THESE

The V2 prototype contains these animations. Every single one must work in the Next.js version:

| Animation | Implementation | Notes |
|-----------|---------------|-------|
| Loading screen (3 rings + progress bar) | CSS keyframes + JS progress | Client component with `useState` |
| Page reveal (slide up after loader) | CSS transition on `.loaded` class | Trigger after loader completes |
| Typing placeholder | JS `setInterval` cycling prompts | `useEffect` with cleanup, add `suppressHydrationWarning` |
| Scroll reveals (`.reveal` class) | IntersectionObserver | `useEffect` with observer setup |
| SVG flow lines + glowing particles | Inline SVG + CSS animations | Keep as JSX SVG |
| Section line draw-on-scroll | IntersectionObserver + CSS | Part of scroll reveal system |
| Composer shimmer on focus | CSS `::after` pseudo-element | Pure CSS, just preserve it |
| Card hover lift + gradient | CSS `:hover` transitions | Pure CSS |
| Timeline step glow | CSS `:nth-child` animations | Pure CSS |
| Pricing card animated border | CSS `@property --angle` + `conic-gradient` | Keep the `@property` rule in CSS |
| Theme toggle (dark↔light) | JS `data-theme` attribute toggle | `useEffect` or `useState` |
| CTA pulse glow | CSS keyframes | Pure CSS |
| Ambient floating orbs | CSS `@keyframes drift` | Pure CSS |

### 2.3 Landing page sections (all present in prototype)

1. **Loading screen** — 3-ring spinning logo + progress bar
2. **Navigation** — thin top bar, Unioffer logo (SMALL!) left, theme toggle right
3. **Hero** — H1 + subtitle + composer + connect bar + action chips
   - H1: "More Than Offers. We Spark Futures."
   - Subtitle: "AI-Powered Admissions for the AI-Native Generation."
   - Composer with toolbar (attach, agents, chat, emoji, mic, submit)
   - "Connect your tools" integration bar
   - Typing placeholder cycling through prompts
4. **Market Reality** — stats cards with admission rates (NO flag emoji — clean typographic treatment)
5. **How It Works** — timeline/steps
6. **Features** — grid of AI agent features (headline + one line per card, max 18 words)
7. **Trust/Compliance** — trust badges (IECA, NACAC, UCAS, UK GDPR)
8. **Pricing** — 3-tier cards:
   - Basic: £20/month, £200/year, 500 AI credits, **Up to 5 schools (US or UK track)**
   - Plus: £50/month, £500/year, 2000 AI credits, **Up to 12 schools (US + UK dual track)**, MOST POPULAR
   - Premium: Contact Sales → routes to `/contact-sales` (NOT `/signin?mode=signup`)
9. **Footer** — 4 columns (Product, Company, Support, Legal), entity line, Adie disclaimer with Samaritans 116 123 and NHS 111 option 2
10. **Readiness disclaimer** below pricing: "Readiness indicators reflect preparation strength only. Admission decisions are made entirely by universities and cannot be predicted by any third party. UniOffer makes no representation about admission outcomes."

### 2.4 Content from V3.1 spec (confirmed final by Andy)

The V3.1 landing copy is confirmed final. The V2 prototype already contains this content. Key items to verify are present:
- Hero headline and subtitle (exact wording above)
- Market Reality: China → Cambridge 10.9%, India → Oxford 4.2%, Singapore → Cambridge 26.5%, Hong Kong → Cambridge 17.6%, South Korea → Top US Extreme
- How It Works: 4-step agent-indexed flow
- Features: 7 cards + compliance strip
- Trust badges: IECA Member Standards, NACAC Compliant, UCAS Aligned, UK GDPR · Online Safety Act
- Pricing with school count limits (Item 6 from checklist)

---

## 3 · EXECUTION ORDER

### Phase A — Blocking fixes (Items 1, 3, 4, 5, 7)

Do these FIRST — they are quick and must not be forgotten:

```bash
# 1. Grep scan for admitos references
grep -ri "admitos\|AdmitOS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.env*" -l . | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline > /tmp/admitos-scan.txt
cat /tmp/admitos-scan.txt
# Fix any hits (rename to unioffer)

# 3. Create /contact-sales placeholder route
mkdir -p app/contact-sales
# Create a simple page.tsx with "Book a Discovery Call" content

# 4. Remove 'undecided' text node
grep -rn "undecided" app/ --include="*.tsx" --include="*.ts"
# Remove the stray text

# 5. Fix language switcher (remove DE, add correct 10-language order)
# Find the language switcher component and update

# 7. Suppress Adie FAB on landing page (check auth state)
```

### Phase B — Visual redesign (Item 2)

This is the main work. Convert the V2 prototype:

1. Read `docs/prototypes/unioffer-landing.html` completely
2. Extract CSS → replace `app/_landing/landing.css`
3. Convert HTML → replace `app/_landing/LandingClient.tsx`
4. Extract JS → `useEffect` hooks in client component
5. Update font imports in layout
6. Add school count limits to pricing (Item 6)
7. Verify all animations work

### Phase C — Build & verify

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

Fix any errors. Common issues:
- `app/page.tsx` conflict with route groups → adjust routing
- Tailwind reset vs landing CSS → `@layer` scoping or CSS specificity
- Font loading → verify `next/font/google` in layout
- Hydration mismatch from typing animation → `suppressHydrationWarning`

### Phase D — Deploy

```bash
# Push to GitHub
git add -A
git commit -m "feat(v2): Unioffer landing redesign — Manus-level polish

Visual redesign addressing all 7 merge checklist items:
- V2 prototype conversion with all animations preserved
- No emoji/icons, generous spacing, calibrated typography
- Contact Sales routed to /contact-sales placeholder
- Stray 'undecided' text node removed
- Language switcher: 10 languages, DE removed, correct priority order
- Pricing: school count limits added (5 Basic, 12 Plus)
- Adie FAB suppressed on unauthenticated landing
- Theme matches AdmitOS Excellence V2 (#0f1722 / #7c3aed)
- admitos grep scan: zero matches (11 pipeline hits deferred)"

git push origin HEAD

# Deploy to Vercel
vercel deploy --no-wait 2>&1 | tee /tmp/vercel-deploy.log
```

### Phase E — Update PR #2

Update the PR description with:
- Preview URL
- All 7 checklist items marked as complete
- Grep scan output showing zero admitos matches
- 11 pipeline hits documented as deferred
- Adie FAB suppression confirmation
- Screenshots of dark and light mode

---

## 4 · FALLBACK STRATEGY

If Next.js conversion breaks animations or becomes too complex:

```bash
# Deploy the HTML prototypes directly as static files
cp docs/prototypes/unioffer-landing.html public/index.html
cp docs/prototypes/unioffer-dashboard.html public/dashboard.html
```

Then set up Next.js rewrites in `next.config.mjs`:
```js
async rewrites() {
  return [
    { source: '/', destination: '/index.html' },
    { source: '/dashboard-preview', destination: '/dashboard.html' },
  ];
}
```

Getting a live preview URL with working animations is MORE IMPORTANT than perfect Next.js architecture.

---

## 5 · CSS STRATEGY

**Use plain CSS files, NOT Tailwind.** The V2 prototype CSS is production-quality with complex animations, custom properties, and pseudo-element effects. Converting to Tailwind would break things.

- Extract prototype `<style>` → `app/_landing/landing.css`
- Import in LandingClient: `import './landing.css'`
- All rules scoped under `.uo-landing` to avoid conflicts with Tailwind preflight
- Keep the `@property --angle` CSS rule for animated pricing border

---

## 6 · COOKIE BANNER (UK GDPR)

The V1 implementation already has a compliant cookie banner. Preserve it:
- Accept and Reject buttons with EQUAL visual prominence
- No pre-tick, no X dismiss, no auto-dismiss, no Customize
- Analytics gated on explicit Accept
- Strictly necessary cookies only on Reject

---

## 7 · OG IMAGE

Produce a 1200×630px OG image:
- Unioffer wordmark on dark background (#0f172a)
- Tagline: "The Operating System for University Applications"
- White text
- Save as `public/og-image.jpg`
- Reference in metadata

This is non-blocking — use a placeholder if needed and swap later.

---

## 8 · ADDITIONAL ITEMS FROM ANDY

### Post-registration flow (document only — separate from PR #2)
After sign-up, users should land on the Overview Dashboard matching `admitos-excellence-as-a-service-v2.pages.dev/dashboard/overview`. Add a comment in the code noting this requirement for the sign-in/sign-up flow sprint.

### Dashboard sidebar nav items
The sidebar must carry ALL features from the MVP. Based on the reference site:
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
Plus any additional agents found in the 14 spec documents. The sidebar design should match the reference: 260px full / 64px collapsed, `#162130` background, purple active border.

---

## 9 · QA CHECKLIST

Before marking PR as ready:

| # | Check | Expected |
|---|-------|----------|
| 1 | `pnpm typecheck` | Pass |
| 2 | `pnpm test` | 345/345 green |
| 3 | `pnpm lint` | Pass |
| 4 | `pnpm build` | Pass |
| 5 | `pnpm check:isolation` | Pass |
| 6 | admitos grep scan | Zero matches (excl. pipeline) |
| 7 | Loading animation | 3-ring spinner + progress bar works |
| 8 | All scroll reveals | Every section animates on scroll |
| 9 | Theme toggle | Smooth dark↔light transition |
| 10 | Typing placeholder | Cycles through prompts in composer |
| 11 | SVG flow lines | Animated with glowing particles |
| 12 | Pricing border | Animated conic-gradient rotation on Plus card |
| 13 | Contact Sales button | Routes to /contact-sales, NOT /signin |
| 14 | Language switcher | 10 languages, no DE, all non-EN "Coming soon" |
| 15 | School count limits | Basic: 5 schools, Plus: 12 schools visible |
| 16 | No emoji/icons | Zero emoji anywhere on page |
| 17 | Logo size | Small/icon-sized, not oversized |
| 18 | Brand name | "Unioffer" with lowercase "o" everywhere |
| 19 | Adie FAB | Not visible on landing page |
| 20 | Readiness disclaimer | Present below pricing |
| 21 | Footer | Samaritans 116 123 + NHS 111 option 2 |
| 22 | Mobile responsive | Works at 375px, 768px, 1440px |

---

## 10 · PR DESCRIPTION TEMPLATE

When updating PR #2, use this structure:

```markdown
## Preview

**Landing page:** [VERCEL_URL]
**Dashboard preview:** [VERCEL_URL]/dashboard-preview

## Andy's 7-Item Merge Checklist

- [x] **Repo rename scan** — grep output below, zero admitos/AdmitOS matches. 11 hits in admitos-training-pipeline/ deferred to dedicated PR.
- [x] **Visual redesign** — V2 prototype conversion. No emoji/icons, generous spacing, Libre Baskerville + Inter typography, manus.im benchmark met.
- [x] **Contact Sales** — routed to /contact-sales placeholder (Book a Discovery Call)
- [x] **Stray text node** — 'undecided' removed
- [x] **Language switcher** — DE removed, 10-language priority order implemented, non-EN show "Coming soon"
- [x] **Pricing school limits** — Basic: up to 5 schools (US or UK), Plus: up to 12 schools (US + UK dual)
- [x] **Adie FAB** — suppressed on unauthenticated landing page

## Grep Scan Output
[PASTE OUTPUT HERE]

## Deferred Items
- 11 admitos-training-pipeline/ hits → dedicated rename PR
- Post-registration flow → sign-in/sign-up sprint
- OG image → pending Andy's approval

## Validation
- Lighthouse Performance: __
- Lighthouse Accessibility: __
- axe violations: __
- Tests: 345/345 green
- All CI gates pass

## Animations Preserved
Loading screen, SVG flow lines, scroll reveals, typing placeholder, composer shimmer, card hover, timeline glow, pricing border rotation, theme toggle, CTA pulse, ambient orbs — all working.
```

---

## 11 · CONSTRAINTS

- Do NOT redesign the prototypes. They are approved V2 design. Convert faithfully.
- Do NOT use Tailwind for the landing page CSS. Plain CSS only.
- Do NOT introduce new colors. Stick to the token system in Section 2.0.
- Do NOT make the logo large. Icon-sized only.
- Do NOT route Contact Sales to /signin. Use /contact-sales.
- Do NOT include DE in the language switcher.
- Do NOT show Adie FAB on the landing page.
- Do NOT skip any animation from the prototype.

---

## 12 · CRITICAL REMINDERS

1. **Study the references FIRST** (Section 0). Open manus.im, the Excellence V2 site, and the HTML prototypes in a browser before writing any code.
2. **The V2 prototypes are the source of truth.** They already fix every issue Andy raised. Convert them faithfully.
3. **All 7 checklist items are MANDATORY.** Missing even one means Andy will not merge.
4. **Theme consistency with the MVP reference site is non-negotiable.** The colors must match exactly so the landing page blends seamlessly with the dashboard at `admitos-excellence-as-a-service-v2.pages.dev`.
5. **If Next.js conversion breaks animations, use the static fallback** (Section 4). A live URL with working animations beats a broken Next.js build.
6. **Deploy to Vercel.** Andy needs to see a live preview URL.
7. **Push to GitHub and update PR #2** with the template from Section 10.

---

**End of master prompt. Start with the research phase — study references and read prototypes. Then execute Phase A → B → C → D → E.**
