# Unioffer V2 — Complete Deployment Prompt for Claude Code

**Paste this entire document into Claude Code. Execute end-to-end. Do not ask for clarification unless genuinely blocked.**

---

## 0 · SITUATION & MISSION

Andy Yu (CEO of Unioffer) rejected the V1 landing page. His exact feedback:

> "The current page is a wall of text. Every section is dense, the typography feels compressed, there is almost no breathing room. It reads like a specification document rendered as a webpage. This is not the aesthetic UniOffer needs to occupy."

> "Before you do anything else: open a fresh browser window and go to manus.im. Look at their hero. It is one headline, one input box, four action buttons, and a lot of white space. Nothing else. That is the design language of modern AI-native products. Then open claude.ai. Clean, minimal, generous spacing, typography that breathes. UniOffer's landing page needs to look like it belongs in that world."

**Two complete V2 HTML prototypes are already in the repo** at `docs/prototypes/`. They fix every issue Andy raised and are themed to match the AdmitOS Excellence V2 reference site. Your job:

1. Run `git pull` to get Andy's latest brand assets (green cat logo uploaded 16 Apr)
2. Complete Andy's 7-item merge checklist (Section 2)
3. Implement Andy's 8 answered questions (Section 3)
4. Convert the V2 prototypes into Next.js with ALL animations at 120fps (Section 4–5)
5. Apply global brand treatment to EVERY page (Section 6)
6. Build, deploy to Vercel, push to GitHub, update PR #2

---

## 1 · BEFORE YOU WRITE A SINGLE LINE OF CODE

### 1.0 Pull latest

```bash
git pull origin $(git branch --show-current)
```

Andy pushed final designer-made brand assets on 16 Apr. You MUST have them locally.

### 1.1 Study the three benchmark references

Open each in a browser. Spend real time studying them. Extract DevTools measurements.

**Reference 1 — Manus.im** (`https://manus.im`)
Andy's primary benchmark. Measure these in DevTools:
- Hero headline: Libre Baskerville, ~36px, weight 400, generous line-height ~1.3
- Body/nav text: Inter or similar sans-serif, 14–16px
- Chat composer: 670–800px wide, border-radius ~24px, centered
- Hero content: headline + one input + 4 chips + nothing else
- Section padding: 120–160px vertical between sections
- White space ratio: ~60% of viewport is empty space in hero
- Color palette: near-black backgrounds, minimal accent usage
- Loading: subtle, fast, no heavy splash
- Overall feel: restrained, confident, nothing competes for attention

**Reference 2 — Claude.ai** (`https://claude.ai`)
Andy's secondary benchmark. Measure:
- Headline font: Anthropic Serif (their custom), ~40px, weight ~290 (ultralight)
- Composer width: centered, ~800px, generous padding
- Nav: minimal, text only, 14px
- Spacing: extreme generosity — sections float with massive margins
- Color: warm neutrals, near-zero visual noise

**Reference 3 — AdmitOS Excellence V2** (`https://admitos-excellence-as-a-service-v2.pages.dev/` and `/dashboard/overview`)
This is Andy's existing product. Our theme MUST match exactly:
- Body background: `#0d2538` (rgb 15, 23, 34)
- Sidebar background: `#162130` (rgb 22, 33, 48)
- Accent purple: `#7c3aed` (rgb 124, 58, 237)
- Light mode content: `#f7f5f1` (rgb 247, 245, 241)
- Primary text: `#eaf1f7` (rgb 234, 241, 247)
- Font: Inter, heading weight 300
- Sidebar width: 260px (full) / 64px (collapsed)
- Nav items: Home, Overview, Preparation OS, Application OS, School List, Essays & Writing, Advising & Services, Commons, Adie

### 1.2 Study the V2 prototypes

```bash
# Open these in a browser — they ARE the design spec
open docs/prototypes/unioffer-landing.html
open docs/prototypes/unioffer-dashboard.html
wc -l docs/prototypes/*.html
```

The landing prototype is ~1500 lines. The dashboard is ~850 lines. Read them thoroughly. Every CSS rule, every animation, every interaction — these are your source of truth.

### 1.3 Find and inventory Andy's brand assets

```bash
# Find all image/asset files
find . -path "*/node_modules" -prune -o -path "*/.next" -prune -o \
  \( -iname "*.png" -o -iname "*.svg" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" -o -iname "*.ico" \) \
  -type f -print | grep -v node_modules | grep -v .next | sort

# Check brand directories
ls -la public/brand/ public/images/ public/logo* public/assets/ docs/brand/ 2>/dev/null
```

**The FINAL logo is: green cat icon (sitting pose) + "unioffer" wordmark in white, on dark teal/navy background.** This was made by a graphic designer and uploaded by Andy on 16 Apr. It replaces ALL previous placeholder assets (old "UO" monogram, navy/red wordmark — delete those).

### 1.4 Read the 14 spec documents

```bash
find . -path "*/docs/*" \( -name "*.pdf" -o -name "*.docx" \) -not -path "*/node_modules/*" | head -30
ls -la docs/specs/ 2>/dev/null
```

Key docs: 01 Preparation OS V2.2, 02 Application OS V2.2, 03 Landing Page V3.1, 04 Agent Chat V2.2, 05 School List Strategy V2.2, 06 Essay Writing V2.2, 07 Advising Services V2.2, 08 Candidacy Evaluation Form V2.2, 09 Adie Commons V2.2, 10 Consent Modal V2.2, 11 Terms of Service V2.2, 12 Privacy Policy V2.2, 13 Referral Credits Module V1.0, Features/How-it-works/Pricing modules.

Also read: `docs/brand/unioffer-brand-identity-guidelines.pdf`

---

## 2 · ANDY'S 7-ITEM MERGE CHECKLIST (PR #2)

**Every item is MANDATORY. Missing even one = Andy will not merge.**

### Item 1 — Repo rename compliance scan

```bash
grep -ri "admitos\|AdmitOS" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" \
  --include="*.env*" -l . \
  | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline
```

- Must return ZERO results
- Fix any hits by renaming admitos → unioffer
- The 11 residual hits in `admitos-training-pipeline/` are acceptable — document them as deferred in the PR description
- Include grep scan output in PR description

### Item 2 — Visual redesign

The V2 prototypes solve this. Convert them faithfully (full details in Sections 4–5):
- Zero emoji/icons — clean typographic treatment only
- Generous whitespace — manus.im level spacing
- Typography calibrated to viewport — Libre Baskerville 36px headlines, Inter 16px body
- White space is deliberate — hero is headline + composer + chips, nothing else
- manus.im is the benchmark

### Item 3 — Contact Sales routing

The Contact Sales button in Pricing currently routes to `/signin?mode=signup`. **This is wrong.**

Create `/contact-sales` route:

```tsx
// app/contact-sales/page.tsx
export default function ContactSalesPage() {
  return (
    <div className="uo-contact-sales" style={{
      minHeight: '100vh',
      background: 'var(--bg, #0d2538)',
      color: 'var(--fg, #eaf1f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
        <h1 style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '2rem',
          fontWeight: 400,
          marginBottom: '1rem'
        }}>Book a Discovery Call</h1>
        <p style={{ color: 'var(--fg-secondary, #aab7c4)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Our advisory team will walk you through Unioffer Premium —
          AI + human expertise for your university applications.
        </p>
        <a href="mailto:andy.yu@adropedu.com?subject=Unioffer%20Premium%20Inquiry"
           style={{
             display: 'inline-block',
             padding: '14px 32px',
             background: 'var(--accent, #7c3aed)',
             color: '#fff',
             borderRadius: 12,
             textDecoration: 'none',
             fontWeight: 500,
             fontSize: '1rem'
           }}>
          Contact Sales
        </a>
      </div>
    </div>
  );
}
```

### Item 4 — Remove stray text node

```bash
grep -rn "undecided" app/ --include="*.tsx" --include="*.ts" --include="*.jsx"
```

Find and delete the `undecided` text node after the Adie footer disclaimer.

### Item 5 — Language switcher

Remove DE (German). Implement the correct 10-language priority order:

```typescript
const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', active: true },
  { code: 'zh-CN', label: 'Simplified Chinese', native: '简体中文', active: false, priority: 1 },
  { code: 'zh-TW', label: 'Traditional Chinese', native: '繁體中文', active: false, priority: 2 },
  { code: 'ko', label: 'Korean', native: '한국어', active: false, priority: 3 },
  { code: 'ar', label: 'Arabic', native: 'العربية', active: false, priority: 4, rtl: true },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', active: false, priority: 5 },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu', active: false, priority: 6 },
  { code: 'th', label: 'Thai', native: 'ภาษาไทย', active: false, priority: 7 },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', active: false, priority: 8 },
  { code: 'ja', label: 'Japanese', native: '日本語', active: false, priority: 9 },
] as const;
```

- All 10 visible in switcher
- EN active, all others show "Coming soon" with `aria-disabled`
- No i18n payload preload for inactive languages
- **DE is REMOVED — not a target market**

### Item 6 — Pricing school count limits

Add to pricing feature lists:
- **Basic**: "Up to 5 schools (US or UK track)"
- **Plus**: "Up to 12 schools (US + UK dual track)"

These are currently missing from all materials. Andy explicitly confirmed they must be added.

### Item 7 — Adie FAB suppression

The Adie floating action button must NOT appear on the unauthenticated landing page.
- Check auth state before rendering the FAB
- Suppress for logged-out visitors
- Confirm in PR description

---

## 3 · ANDY'S 8 ANSWERED QUESTIONS (implement all)

Andy answered 8 open questions. Implement every answer:

| # | Question | Andy's Answer | Action |
|---|----------|---------------|--------|
| 1 | Route architecture | Landing at `/`, app at `/app` — confirmed, do not revert | Verify routing is correct |
| 2 | Repo rename | YES rename to `unioffer-mvp-platform`. Zero-tolerance. Grep scan required. 11 pipeline hits deferred. | Item 1 in checklist |
| 3 | GA4 / Search Console | New property for `unioffer.ai`. Do NOT migrate admitos.ai. Clean slate. | Add TODO comment in code |
| 4 | OG image | Compose from brand assets: green cat + wordmark on `#0d2538`, tagline in white, 1200×630. Non-blocking — placeholder OK. | Section 8 |
| 5 | Pipeline rename | Deferred to dedicated follow-up PR. Document 11 hits in PR description. | Document in PR |
| 6 | V3.1 landing copy | Confirmed FINAL. Add school count limits to pricing (Basic: 5, Plus: 12). | Item 6 in checklist |
| 7 | SKB / Credits sequencing | Path B — credits tables first, then SKB. Document as next sprint scope. | Add TODO comment |
| 8 | Languages | Remove DE. 10-language order as specified. ZH-CN first translation sprint. No language activates without Andy's sign-off. | Item 5 in checklist |

---

## 4 · DESIGN SYSTEM & TOKENS

### 4.0 Color tokens (match AdmitOS Excellence V2 exactly)

```css
/* ============================================
   DARK THEME (default)
   Matches admitos-excellence-as-a-service-v2.pages.dev
   ============================================ */
:root[data-theme="dark"],
:root:not([data-theme="light"]) {
  --bg:            #0d2538;    /* Body background — rgb(15,23,34) */
  --bg-surface:    #162130;    /* Sidebar/card bg — rgb(22,33,48) */
  --bg-elevated:   #1e2d3e;    /* Elevated surfaces */
  --fg:            #eaf1f7;    /* Primary text — rgb(234,241,247) */
  --fg-secondary:  #aab7c4;    /* Secondary text */
  --fg-muted:      #94a0ac;    /* Muted text */
  --border-subtle: rgba(234,241,247,0.08);
  --accent:        #7c3aed;    /* Purple accent — rgb(124,58,237) */
  --accent-hover:  #8b5cf6;    /* Purple hover */
  --accent-glow:   rgba(124,58,237,0.32);
}

/* ============================================
   LIGHT THEME
   ============================================ */
:root[data-theme="light"] {
  --bg:            #f7f5f1;    /* Warm off-white — rgb(247,245,241) */
  --bg-surface:    #ffffff;
  --bg-elevated:   #ffffff;
  --fg:            #223042;    /* Dark navy text */
  --fg-secondary:  #4a5a6e;
  --fg-muted:      #5a6a7d;
  --border-subtle: rgba(34,48,66,0.10);
  --accent:        #7c3aed;    /* Same purple accent */
  --accent-hover:  #6d28d9;
  --accent-glow:   rgba(124,58,237,0.18);
}

/* ============================================
   TYPOGRAPHY
   ============================================ */
--font-serif: 'Libre Baskerville', Georgia, serif;
--font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 4.1 Typography scale (calibrated to manus.im)

```css
/* Headlines — Libre Baskerville */
h1 { font-family: var(--font-serif); font-size: 3rem; font-weight: 400; line-height: 1.2; letter-spacing: -0.02em; }     /* 48px — hero only */
h2 { font-family: var(--font-serif); font-size: 2.25rem; font-weight: 400; line-height: 1.25; letter-spacing: -0.01em; } /* 36px — section titles */
h3 { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 400; line-height: 1.3; }                            /* 24px — card titles */

/* Body — Inter */
body    { font-family: var(--font-sans); font-size: 1rem; font-weight: 400; line-height: 1.55; }   /* 16px */
.lead   { font-size: 1.25rem; line-height: 1.5; color: var(--fg-secondary); }                      /* 20px — subtitles */
.small  { font-size: 0.875rem; line-height: 1.5; }                                                  /* 14px — nav, meta */
.caption { font-size: 0.75rem; line-height: 1.4; color: var(--fg-muted); }                          /* 12px — captions */
```

### 4.2 Spacing scale

```css
/* Manus.im-calibrated vertical rhythm */
--space-section:  clamp(100px, 12vh, 160px);   /* Between major sections */
--space-block:    clamp(48px, 6vh, 80px);       /* Between content blocks within a section */
--space-element:  clamp(24px, 3vh, 40px);       /* Between elements */
--space-tight:    clamp(12px, 1.5vh, 20px);     /* Tight groupings */

/* Hero-specific */
--hero-padding-top: clamp(120px, 18vh, 200px);  /* Above hero headline */
--hero-gap:         clamp(24px, 3vh, 40px);      /* Between hero elements */
```

### 4.3 Component dimensions

```css
/* Composer — matches manus.im proportions */
--composer-max-width: 740px;      /* manus.im: ~670-800px */
--composer-radius:    24px;       /* manus.im: ~24px */
--composer-padding:   16px 20px;
--composer-min-height: 56px;

/* Cards */
--card-radius:     16px;
--card-padding:    clamp(24px, 3vw, 40px);

/* Nav */
--nav-height:      64px;
--nav-text-size:   14px;

/* Sidebar (dashboard) */
--sidebar-width:       260px;
--sidebar-collapsed:   64px;
--sidebar-bg:          var(--bg-surface);  /* #162130 */
```

---

## 5 · ANIMATION SYSTEM — 120fps TARGET

**Every animation uses `transform` and `opacity` ONLY. No `width`, `height`, `top`, `left`, `margin`, or `padding` animations. GPU-accelerated exclusively.**

### 5.0 Performance rules

```css
/* Apply to all animated elements */
.animated {
  will-change: transform, opacity;
  transform: translateZ(0);  /* Force GPU layer */
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5.1 Loading screen

The green cat logo centered on dark teal `#0d2538`, with a breathing animation:

```css
/* Loading screen — first thing user sees */
.uo-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0d2538;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease, visibility 0.6s ease;
}

.uo-loader.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* Green cat logo breathing */
.uo-loader__logo {
  width: 64px;
  height: 64px;
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50%      { transform: scale(1.05); opacity: 1; }
}

/* Progress bar */
.uo-loader__progress {
  width: 200px;
  height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  margin-top: 32px;
  overflow: hidden;
}

.uo-loader__bar {
  height: 100%;
  background: var(--accent, #7c3aed);
  border-radius: 2px;
  width: 0%;
  transition: width 0.3s ease;
}
```

```tsx
// Loading screen component
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function Loader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const steps = [30, 60, 85, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setHidden(true), 400);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`uo-loader ${hidden ? 'hidden' : ''}`}>
      {/* Use the designer-made green cat logo */}
      <img src="/brand/unioffer-cat-icon.png" alt="" className="uo-loader__logo" />
      <div className="uo-loader__progress">
        <div className="uo-loader__bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
```

**NOTE:** Adjust the `src` path to match wherever Andy's green cat icon actually lives after `git pull`. Search for it:
```bash
find . -path "*/node_modules" -prune -o \( -iname "*cat*" -o -iname "*logo*" -o -iname "*icon*" \) -type f -print | grep -v node_modules | grep -v .next
```

### 5.2 Page entry animation

```css
/* Page content fades in after loader */
.uo-landing {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.uo-landing.loaded {
  opacity: 1;
  transform: translateY(0);
}
```

### 5.3 Scroll reveal system

```css
/* Elements start invisible, animate in when intersecting viewport */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children — 100ms per element */
.reveal-stagger > .reveal:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger > .reveal:nth-child(2) { transition-delay: 100ms; }
.reveal-stagger > .reveal:nth-child(3) { transition-delay: 200ms; }
.reveal-stagger > .reveal:nth-child(4) { transition-delay: 300ms; }
.reveal-stagger > .reveal:nth-child(5) { transition-delay: 400ms; }
.reveal-stagger > .reveal:nth-child(6) { transition-delay: 500ms; }
.reveal-stagger > .reveal:nth-child(7) { transition-delay: 600ms; }
.reveal-stagger > .reveal:nth-child(8) { transition-delay: 700ms; }
```

```tsx
// IntersectionObserver setup — put in useEffect
useEffect(() => {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, []);
```

### 5.4 Composer interactions

```css
/* Composer focus glow */
.uo-composer {
  position: relative;
  max-width: var(--composer-max-width, 740px);
  border-radius: var(--composer-radius, 24px);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: border-color 0.2s ease, box-shadow 0.3s ease;
}

.uo-composer:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* Shimmer effect on focus */
.uo-composer::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  pointer-events: none;
}

.uo-composer:focus-within::after {
  opacity: 1;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 5.5 Typing placeholder animation

```tsx
// Typing placeholder — useEffect with cleanup
const PROMPTS = [
  'Build my school shortlist for Oxbridge and Ivy League...',
  'What if I raise my SAT to 1550?',
  'Create an Oxford MAT preparation plan...',
  'Review my personal statement draft...',
  'Check my application timeline for Early Decision...',
];

useEffect(() => {
  const input = document.querySelector('.uo-composer__input') as HTMLInputElement;
  if (!input) return;

  let promptIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let timeout: ReturnType<typeof setTimeout>;

  const tick = () => {
    const prompt = PROMPTS[promptIdx];
    if (!deleting) {
      input.setAttribute('placeholder', prompt.slice(0, charIdx + 1));
      charIdx++;
      if (charIdx >= prompt.length) {
        deleting = true;
        timeout = setTimeout(tick, 2000); // Pause at full text
        return;
      }
      timeout = setTimeout(tick, 50);
    } else {
      input.setAttribute('placeholder', prompt.slice(0, charIdx));
      charIdx--;
      if (charIdx <= 0) {
        deleting = false;
        promptIdx = (promptIdx + 1) % PROMPTS.length;
        timeout = setTimeout(tick, 300);
        return;
      }
      timeout = setTimeout(tick, 30);
    }
  };

  timeout = setTimeout(tick, 500);
  return () => clearTimeout(timeout);
}, []);
```

Add `suppressHydrationWarning` to the input element to prevent hydration mismatch.

### 5.6 Card hover effects

```css
/* Card hover — scale + shadow lift */
.uo-card {
  border-radius: var(--card-radius);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: var(--card-padding);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.uo-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  border-color: var(--accent-glow);
}
```

### 5.7 Navigation

```css
/* Sticky nav with backdrop-blur */
.uo-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height, 64px);
  background: rgba(15, 23, 34, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  transition: background-color 0.3s ease;
}

/* Smooth scroll for anchor links */
html { scroll-behavior: smooth; }
```

### 5.8 Pricing card animated border

```css
/* Conic gradient rotation on featured card */
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.uo-pricing-featured {
  position: relative;
  background: var(--bg-surface);
  border-radius: var(--card-radius);
}

.uo-pricing-featured::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(from var(--angle), var(--accent), transparent 40%, var(--accent));
  animation: rotate-border 4s linear infinite;
  z-index: -1;
}

@keyframes rotate-border {
  to { --angle: 360deg; }
}
```

### 5.9 Ambient floating orbs

```css
.uo-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
  animation: drift 20s ease-in-out infinite alternate;
}

.uo-orb--purple { background: var(--accent); width: 400px; height: 400px; }
.uo-orb--blue   { background: #3b82f6; width: 300px; height: 300px; animation-delay: -7s; }
.uo-orb--teal   { background: #14b8a6; width: 350px; height: 350px; animation-delay: -14s; }

@keyframes drift {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(60px, -40px) scale(1.1); }
  66%  { transform: translate(-30px, 50px) scale(0.9); }
  100% { transform: translate(20px, -20px) scale(1.05); }
}
```

### 5.10 SVG flow lines

Keep the SVG flow lines from the prototype exactly as-is. Convert to JSX (self-closing tags, camelCase attributes). These are the animated connection lines with glowing particles that give the page its premium feel.

### 5.11 Theme toggle

```css
/* Smooth theme transition */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 5.12 Dashboard skeleton loading

```css
/* Skeleton shimmer for dashboard cards */
.uo-skeleton {
  background: linear-gradient(90deg,
    var(--bg-surface) 25%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Dashboard card entry */
.uo-dash-card {
  opacity: 0;
  transform: translateY(16px);
  animation: card-enter 0.5s ease-out forwards;
}

.uo-dash-card:nth-child(1) { animation-delay: 0ms; }
.uo-dash-card:nth-child(2) { animation-delay: 100ms; }
.uo-dash-card:nth-child(3) { animation-delay: 200ms; }
.uo-dash-card:nth-child(4) { animation-delay: 300ms; }

@keyframes card-enter {
  to { opacity: 1; transform: translateY(0); }
}
```

### 5.13 Complete animation inventory

Every animation from the V2 prototypes that must work in production:

| # | Animation | CSS/JS | GPU-safe | Notes |
|---|-----------|--------|----------|-------|
| 1 | Loading screen (green cat breathing + progress bar) | CSS keyframes + JS | Yes | `scale` only |
| 2 | Page reveal (fade up) | CSS transition | Yes | `opacity` + `translateY` |
| 3 | Typing placeholder | JS `setTimeout` loop | N/A | No layout changes |
| 4 | Scroll reveals (`.reveal` → `.visible`) | IntersectionObserver + CSS | Yes | `opacity` + `translateY` |
| 5 | SVG flow lines + glowing particles | CSS `@keyframes` | Yes | `transform` based |
| 6 | Section line draw-on-scroll | IntersectionObserver + CSS `stroke-dashoffset` | Yes | SVG property only |
| 7 | Composer shimmer on focus | CSS `::after` + `background-position` | Yes | No layout |
| 8 | Card hover (lift + gradient) | CSS `:hover` + `scale(1.02)` | Yes | `transform` only |
| 9 | Timeline step glow | CSS `:nth-child` + keyframes | Yes | `opacity` + `box-shadow` |
| 10 | Pricing card animated border | CSS `@property --angle` + `conic-gradient` | Yes | Custom property animation |
| 11 | Theme toggle dark↔light | JS `data-theme` + CSS transitions | Yes | `background-color` + `color` |
| 12 | CTA pulse glow | CSS keyframes | Yes | `box-shadow` animation |
| 13 | Ambient floating orbs | CSS `@keyframes drift` | Yes | `transform` + `filter` |
| 14 | Sticky nav backdrop-blur | CSS `backdrop-filter` | Yes | Composited layer |
| 15 | Dashboard skeleton shimmer | CSS `background-position` | Yes | No layout |
| 16 | Dashboard card entry stagger | CSS `@keyframes` + `animation-delay` | Yes | `opacity` + `translateY` |

---

## 6 · GLOBAL BRAND TREATMENT — EVERY PAGE

**The green cat logo + dark teal/navy background applies to EVERY page in the application.**

### 6.−1 CANONICAL NIGHT-MODE BACKGROUND — `#0d2538`

Andy sampled the official logo plate (green cat + "unioffer" wordmark). The exact background color is:

```
--bg-night: #0d2538;   /* rgb(13, 37, 56) — the plate behind the green cat logo */
```

**This is the single source of truth for dark-mode backgrounds.** Apply to:
- Landing page `/` (body + all sections)
- Chat agent `/app` + all agent routes (body + conversation canvas)
- Loading screen (replace the earlier `#0d2538` reference)
- Dashboard body behind the sidebar
- Sign in / sign up pages
- Contact Sales page
- Any future route unless an explicit light-mode context overrides it

Update the color token system in Section 4.0 so `--bg` resolves to `#0d2538` in dark theme. The old `#0d2538` / `#0d2538` values are retired — do not use them. Favicons, OG image background, loading screen, nav bar translucent fill, all use `#0d2538` as the base. Translucent nav should be `rgba(13, 37, 56, 0.85)` with `backdrop-filter: blur(16px)`.

### 6.0 Root layout

```tsx
// app/layout.tsx — sets global brand baseline
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark"
          className={`${libreBaskerville.variable} ${inter.variable}`}>
      <body style={{ background: '#0d2538', color: '#eaf1f7', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
```

### 6.1 Per-page brand treatment

| Page | Nav | Logo | Background | Footer |
|------|-----|------|------------|--------|
| Landing `/` | Sticky top bar, backdrop-blur | Green cat icon (24px) left | `#0d2538` (night canonical) | Full footer with cat + wordmark |
| Chat Agent `/app/chat`, `/app/agents/*` | Minimal top bar | Green cat icon (24px) left | `#0d2538` (night canonical) — match landing exactly | Minimal |
| Contact Sales `/contact-sales` | Same sticky nav | Green cat icon left | `#0d2538` | Same footer |
| Dashboard `/app/*` | Sidebar | Green cat icon in sidebar header | Body `#0d2538`, sidebar `#162130` | Minimal |
| Sign in `/signin` | Minimal — logo only | Green cat + wordmark centered | `#0d2538` | None |
| Sign up `/signup` | Minimal — logo only | Green cat + wordmark centered | `#0d2538` | None |
| Loading (all routes) | None | Green cat breathing animation | `#0d2538` | None |

**Landing and Chat Agent MUST use identical `#0d2538` backgrounds** — Andy confirmed via WhatsApp that the night version of both surfaces must match the logo plate exactly. No per-page tweaks, no gradient overlays that shift the base tone, no "slightly lighter" conversation canvas. The canvas is `#0d2538`; bubbles/cards sit on top via `--bg-surface` elevation.

### 6.2 Brand asset rules

1. **Green cat icon** = favicon + nav logos (24-32px, icon-sized)
2. **Green cat + "unioffer" wordmark** = footer, auth pages, loading screen (max 200px wide)
3. Wordmark is WHITE on dark backgrounds — do NOT invert
4. On light theme: nav bar stays dark with white logo — only content area switches to `#f7f5f1`
5. **Delete ALL old assets**: "UO" monogram, navy/red wordmark — they are retired
6. Update `public/favicon.ico` and `favicon-16/32/64.png` with the green cat icon

---

## 7 · LANDING PAGE SECTIONS

All sections are in the V2 prototype. Convert them faithfully. Verify this content exists:

### 7.1 Loading screen
Green cat logo breathing animation, progress bar, dark teal `#0d2538` background. See Section 5.1.

### 7.2 Navigation
Sticky top bar, 64px height, backdrop-blur. Green cat icon (small!) left, theme toggle right.

### 7.3 Hero
- H1: **"More Than Offers. We Spark Futures."** (Libre Baskerville, 48px, weight 400)
- Subtitle: **"AI-Powered Admissions for the AI-Native Generation."** (Inter, 20px, `--fg-secondary`)
- Composer: 740px max-width, rounded 24px, with toolbar (attach, agents, chat, emoji, mic, submit)
- "Connect your tools" integration bar
- Action chips below composer
- Typing placeholder animation cycling through prompts
- **NOTHING ELSE in the hero.** No status tags, no auth cards, no navigation links. Headline → composer → chips. White space does the rest.

### 7.4 Market Reality
Stats cards with admission rates. **NO flag emoji** — clean typographic treatment:
- China → Cambridge 10.9%
- India → Oxford 4.2%
- Singapore → Cambridge 26.5%
- Hong Kong → Cambridge 17.6%
- South Korea → Top US Extreme

### 7.5 How It Works
4-step agent-indexed timeline flow:
1. Build Your DNA (A1)
2. Set Your Strategy (A3/A4/A11)
3. Execute with Your Agent Team (A5-A9 via A0 with SKB awareness)
4. Submit with Confidence (A10 Former Admissions Officer Review)

### 7.6 Features
7 cards + 1 compliance strip. **Headline + one line per card, max 18 words.**
- 12-Agent AI Mesh
- Student DNA Engine (8 dimensions)
- Application Readiness Engine (nationality-pool calibrated, "never misleading probability numbers")
- Voice Interview Simulator with Hume AI
- Adie Wellbeing Companion
- Commons Student Community
- Live Student Profile + Student Knowledge Base
- Full-width dark strip: "Compliance-First. Wellbeing-First."

### 7.7 Trust/Compliance
4 badges: IECA Member Standards, NACAC Compliant, UCAS Aligned, UK GDPR · Online Safety Act

### 7.8 Pricing
3-tier cards:
- **Basic**: £20/month, £200/year (2 months free), 500 AI credits monthly, **Up to 5 schools (US or UK track)**, purchased credits never expire
- **Plus** (MOST POPULAR): £50/month, £500/year, 2000 AI credits monthly with rollover, **Up to 12 schools (US + UK dual track)**
- **Premium**: Contact Sales → routes to `/contact-sales` (NOT `/signin?mode=signup`). AI + Human Expertise, private advisory, former AO review.

Mandatory readiness disclaimer below pricing:
> "Readiness indicators reflect preparation strength only. Admission decisions are made entirely by universities and cannot be predicted by any third party. UniOffer makes no representation about admission outcomes."

### 7.9 Footer
4 columns (Product, Company, Support, Legal). Entity line: "© 2026 UniOffer. Registered in England and Wales." Non-removable Adie disclaimer with Samaritans 116 123 and NHS urgent mental health 111 option 2.

---

## 8 · OG IMAGE

Produce a 1200×630px composition:
- Background: `#0d2538` (dark teal)
- Green cat icon from designer assets, centered or left
- "unioffer" wordmark in white next to icon
- Tagline below: "The Operating System for University Applications" in white Inter
- Save as `public/og-image.jpg`

```bash
# Find the highest-res logo to compose from
find . -path "*/node_modules" -prune -o \( -iname "*logo*" -o -iname "*cat*" -o -iname "*icon*" \) -iname "*.png" -type f -print | grep -v node_modules
```

Non-blocking — use a placeholder and swap after Andy reviews.

---

## 9 · COOKIE BANNER (UK GDPR)

Preserve the existing compliant cookie banner:
- Accept and Reject buttons with EQUAL visual prominence
- No pre-tick, no X dismiss, no auto-dismiss, no Customize
- Analytics gated on explicit Accept
- Strictly necessary cookies only on Reject

---

## 10 · CSS STRATEGY

**Plain CSS files. NOT Tailwind.**

The V2 prototype CSS is production-quality with complex animations, custom properties, `@property` rules, pseudo-elements, and animation keyframes. Converting to Tailwind would break things.

- Extract prototype `<style>` → `app/_landing/landing.css`
- Import: `import './landing.css'`
- All rules scoped under `.uo-landing` to avoid Tailwind preflight conflicts
- Keep the `@property --angle` rule for animated pricing border
- Use `@layer` if needed to manage specificity against Tailwind

---

## 11 · CONVERSION STEPS

### 11.1 Landing page

1. Read `docs/prototypes/unioffer-landing.html` completely (all ~1500 lines)
2. Extract all CSS from `<style>` → replace `app/_landing/landing.css` entirely
3. Convert HTML body to JSX → replace `app/_landing/LandingClient.tsx` entirely
4. Convert all `class=` to `className=`, `for=` to `htmlFor=`, self-close tags
5. Convert inline `style=""` to `style={{ }}` objects
6. Extract `<script>` JS into `useEffect` hooks
7. Add `'use client'` directive at top
8. Set up fonts in layout (Section 6.0)
9. Wire up `app/page.tsx` to import the new LandingClient
10. Add school count limits to pricing (Item 6)
11. Ensure Contact Sales routes to `/contact-sales`
12. Remove any `undecided` text node
13. Fix language switcher to 10-language order

### 11.2 Dashboard (if time permits)

1. Read `docs/prototypes/unioffer-dashboard.html` completely
2. Same extraction process as landing
3. Place in `app/(app)/dashboard/` route
4. Ensure sidebar has ALL MVP nav items from the reference site

### 11.3 Fallback (if Next.js conversion breaks animations)

```bash
# Emergency: deploy prototypes as static HTML
cp docs/prototypes/unioffer-landing.html public/landing-v2.html
cp docs/prototypes/unioffer-dashboard.html public/dashboard-v2.html
```

Add to `next.config.mjs`:
```js
async rewrites() {
  return [
    { source: '/preview', destination: '/landing-v2.html' },
    { source: '/preview/dashboard', destination: '/dashboard-v2.html' },
  ];
}
```

**A live URL with working animations beats a broken Next.js build.**

---

## 12 · EXECUTION ORDER

### Phase A — Setup & blocking fixes (30 min)

```bash
# 0. Pull latest (get Andy's brand assets)
git pull origin $(git branch --show-current)

# 1. Create branch
git checkout -b feat/landing-page-v2 2>/dev/null || git checkout feat/landing-page-v2

# 2. Grep scan for admitos
grep -ri "admitos\|AdmitOS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.env*" -l . | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline > /tmp/admitos-scan.txt
echo "=== ADMITOS SCAN RESULTS ===" && cat /tmp/admitos-scan.txt
# Fix any hits

# 3. Create /contact-sales route (see Item 3 above)

# 4. Remove 'undecided' text node
grep -rn "undecided" app/ --include="*.tsx" --include="*.ts" --include="*.jsx"

# 5. Fix language switcher (remove DE, 10-language order)

# 6. Replace old brand assets with new green cat logo
# Find and inventory new assets, update favicon, delete old UO monogram

# 7. Suppress Adie FAB on unauthenticated landing
```

### Phase B — V2 prototype conversion (2-3 hours)

1. Open `docs/prototypes/unioffer-landing.html` in browser — study thoroughly
2. Extract CSS → `app/_landing/landing.css` (complete replacement)
3. Convert HTML → `app/_landing/LandingClient.tsx` (complete replacement)
4. Extract JS → `useEffect` hooks in client component
5. Set up fonts in layout
6. Add school count limits to pricing
7. Apply green cat logo to nav, footer, loading screen
8. Test every animation manually

### Phase C — Build & verify (30 min)

```bash
pnpm install
pnpm typecheck    # Must pass
pnpm lint         # Must pass
pnpm build        # Must pass
pnpm test         # Must pass (345/345)
pnpm check:isolation  # Must pass
```

Common fixes:
- Route conflict: `app/page.tsx` vs route group → delete tombstone
- CSS specificity: Tailwind reset vs `.uo-landing` → add `@layer` scoping
- Font loading: verify `next/font/google` imports in layout
- Hydration: typing animation → `suppressHydrationWarning` on input element

### Phase D — Deploy (15 min)

```bash
git add -A
git commit -m "feat(v2): Unioffer landing V2 — Manus-level premium redesign

Complete visual rebuild addressing Andy's 7-item merge checklist:
1. Repo rename scan: zero admitos matches (11 pipeline hits deferred)
2. V2 prototype conversion: no emoji, generous spacing, calibrated typography
3. Contact Sales: routed to /contact-sales placeholder
4. Stray 'undecided' text node: removed
5. Language switcher: DE removed, 10-language priority order, Coming soon states
6. Pricing: school count limits (Basic 5, Plus 12)
7. Adie FAB: suppressed on unauthenticated landing

Design system:
- Theme: AdmitOS Excellence V2 (#0d2538 / #7c3aed)
- Typography: Libre Baskerville 36-48px headlines, Inter 16px body
- Animations: 13 GPU-accelerated effects, all 120fps
- Brand: final designer-made green cat logo throughout
- Loading: green cat breathing animation on dark teal
- Responsive: 375px / 768px / 1440px breakpoints"

git push origin HEAD
vercel deploy --no-wait 2>&1 | tee /tmp/vercel-deploy.log
PREVIEW_URL=$(grep -oP 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | head -1)
echo "Preview: $PREVIEW_URL"
```

### Phase E — Update PR #2 (15 min)

```bash
gh pr edit 2 --body "$(cat <<'PREOF'
## Preview

**Landing page:** [PREVIEW_URL]

## Andy's 7-Item Merge Checklist

- [x] **Repo rename scan** — grep output below, zero admitos/AdmitOS matches. 11 hits in admitos-training-pipeline/ documented as deferred.
- [x] **Visual redesign** — V2 prototype conversion. No emoji/icons, generous Manus-level spacing, Libre Baskerville + Inter typography calibrated to viewport.
- [x] **Contact Sales** — routed to /contact-sales placeholder (Book a Discovery Call). Does NOT route to /signin.
- [x] **Stray text node** — 'undecided' removed.
- [x] **Language switcher** — DE removed. 10-language priority order implemented. All non-EN show "Coming soon" with aria-disabled.
- [x] **Pricing school limits** — Basic: up to 5 schools (US or UK track). Plus: up to 12 schools (US + UK dual track).
- [x] **Adie FAB** — suppressed on unauthenticated landing page.

## Andy's 8 Answered Questions — All Implemented

1. Routes: Landing at /, app at /app ✓
2. Repo rename: grep scan included below ✓
3. GA4: TODO comment added for new unioffer.ai property ✓
4. OG image: placeholder deployed, pending approval ✓
5. Pipeline rename: 11 hits documented as deferred ✓
6. V3.1 copy: confirmed final, school limits added ✓
7. Credits sequencing: Path B documented as next sprint ✓
8. Languages: 10-language order, DE removed ✓

## Grep Scan Output
[PASTE SCAN OUTPUT]

## Deferred Items
- 11 admitos-training-pipeline/ hits → dedicated rename PR
- Post-registration flow → sign-in/sign-up sprint
- OG image final → pending Andy's review of composition
- GA4 property creation → post-launch
- Credits tables sprint → Week 3 Path B

## Brand Assets
- Final designer-made green cat logo used throughout (uploaded 16 Apr)
- Old "UO" monogram and navy/red wordmark removed
- Favicons updated to green cat icon
- Global dark teal background (#0d2538) on all pages

## Animations (all working, 120fps GPU-accelerated)
Loading screen (breathing cat logo), page reveal, typing placeholder, scroll reveals (staggered), SVG flow lines + particles, section line draw, composer shimmer, card hover lift, timeline glow, pricing border rotation, theme toggle, CTA pulse, ambient orbs, sticky nav blur, dashboard skeleton shimmer, dashboard card entry.

## Validation
- Lighthouse Performance: __
- Lighthouse Accessibility: __
- axe violations: __
- Tests: 345/345 green
- All CI gates pass
PREOF
)"
```

---

## 13 · QA CHECKLIST

Run through every item before marking PR as ready:

| # | Check | Expected |
|---|-------|----------|
| 1 | `pnpm typecheck` | Pass |
| 2 | `pnpm test` | 345/345 green |
| 3 | `pnpm lint` | Pass |
| 4 | `pnpm build` | Pass |
| 5 | `pnpm check:isolation` | Pass |
| 6 | admitos grep scan | Zero matches (excl. pipeline) |
| 7 | Loading screen | Green cat breathing + progress bar on `#0d2538` |
| 8 | Page reveal | Fade-up after loader (opacity + translateY) |
| 9 | All scroll reveals | Every section animates in on scroll, staggered |
| 10 | Theme toggle | Smooth dark↔light, nav stays dark |
| 11 | Typing placeholder | Cycles through 5 prompts in composer |
| 12 | SVG flow lines | Animated with glowing particles |
| 13 | Composer shimmer | Glow effect on focus |
| 14 | Card hover | scale(1.02) lift + shadow |
| 15 | Pricing border | Animated conic-gradient rotation on Plus card |
| 16 | Ambient orbs | Drifting gradient blurs in background |
| 17 | CTA pulse | Subtle glow animation on primary buttons |
| 18 | Contact Sales button | Routes to /contact-sales, NOT /signin |
| 19 | Language switcher | 10 languages, no DE, all non-EN "Coming soon" |
| 20 | School count limits | Basic: 5 schools, Plus: 12 schools visible |
| 21 | No emoji/icons | Zero emoji anywhere on page |
| 22 | Logo size | Green cat icon, small/icon-sized 24-32px in nav |
| 23 | Brand name | "Unioffer" with lowercase "o" everywhere |
| 24 | Adie FAB | Not visible on landing page |
| 25 | Readiness disclaimer | Present below pricing |
| 26 | Footer | Samaritans 116 123 + NHS 111 option 2 |
| 27 | Mobile responsive | Works at 375px, 768px, 1440px |
| 28 | Green cat logo everywhere | On landing, dashboard, contact-sales, auth pages |
| 29 | No old logo remnants | Zero "UO" monogram or navy/red wordmark anywhere |
| 30 | Global dark background | `#0d2538` consistent across all pages |
| 31 | prefers-reduced-motion | Animations disabled when user prefers reduced motion |
| 32 | Sticky nav blur | Backdrop-filter blur on scroll |
| 33 | Font loading | Libre Baskerville + Inter load via next/font/google, no FOUT |
| 34 | Cookie banner | UK GDPR compliant, Accept/Reject equal prominence |
| 35 | Lighthouse Perf | ≥ 85 |
| 36 | Lighthouse a11y | ≥ 95 |
| 37 | axe violations | 0 |

---

## 14 · CONSTRAINTS — DO NOT VIOLATE

- Do NOT redesign the prototypes. They are approved V2 design. Convert faithfully.
- Do NOT use Tailwind for landing page CSS. Plain CSS only.
- Do NOT introduce new colors. Stick to the token system in Section 4.0.
- Do NOT make the logo large. Icon-sized (24-32px) in nav.
- Do NOT route Contact Sales to /signin. Use /contact-sales.
- Do NOT include DE in the language switcher.
- Do NOT show Adie FAB on the landing page.
- Do NOT skip any animation from the prototype.
- Do NOT use the old "UO" monogram or navy/red wordmark. Use ONLY the designer-made green cat logo.
- Do NOT apply brand assets only to the landing page. Green cat + dark bg = GLOBAL, every page.
- Do NOT animate layout properties (width, height, top, left, margin, padding). Use transform + opacity ONLY.
- Do NOT forget `suppressHydrationWarning` on the typing placeholder input.
- Do NOT forget `git pull` before starting.
- Do NOT forget to read the prototypes in a browser before coding.

---

## 15 · CRITICAL REMINDERS

1. **`git pull` FIRST.** Andy pushed brand assets on 16 Apr.
2. **Study references FIRST.** Open manus.im, claude.ai, and the Excellence V2 site before coding.
3. **The V2 prototypes are the source of truth.** `docs/prototypes/unioffer-landing.html` is the design spec.
4. **All 7 checklist items are MANDATORY.** Missing one = Andy will not merge.
5. **All 8 answered questions must be implemented.** They are decisions, not suggestions.
6. **Theme consistency is non-negotiable.** Colors must match `admitos-excellence-as-a-service-v2.pages.dev` exactly.
7. **Every animation must hit 120fps.** GPU-accelerated only. Test on mobile.
8. **If Next.js conversion breaks animations, use the static fallback** (Section 11.3). A live URL with working animations beats a broken build.
9. **Deploy to Vercel.** Andy needs a live preview URL.
10. **Use ONLY the designer-made green cat logo.** The old assets are dead.

---

**END OF PROMPT. Execute: `git pull` → Phase A → Phase B → Phase C → Phase D → Phase E. Do not stop until PR #2 is updated with a live preview URL.**
