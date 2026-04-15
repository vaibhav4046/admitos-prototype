"use client";

/**
 * Landing page client shell.
 *
 * Handles all interactive bits of the root `/` marketing route:
 *   - Theme (prefers-color-scheme + manual toggle, persisted to
 *     localStorage under `uo.theme`)
 *   - Language picker: EN active only. All other options show a
 *     "Coming soon" state and do not switch the page language. This
 *     is a deliberate M1 constraint — we don't preload any i18n
 *     payload for inactive languages, so the page stays a single
 *     English bundle until real translations land.
 *   - GDPR cookie banner (localStorage `uo.cookie` — "all" | "essential").
 *     Accept and Reject have equal visual weight. There is no
 *     pre-tick, no X-only dismiss, no auto-dismiss. On Reject only
 *     strictly necessary cookies are set; no analytics / PostHog
 *     scripts load until Accept. See the `useEffect` below that
 *     gates `window.posthog` + GA scripts on the consent value.
 *
 * The server component in page.tsx owns the metadata and the font
 * preconnect; this file owns every useState/useEffect so the page
 * stays mostly static.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Lang = "EN" | "ZH" | "KO" | "JA" | "AR" | "DE";
const LANG_EN = { code: "EN" as Lang, flag: "🇬🇧", label: "English", active: true };
const LANGS: { code: Lang; flag: string; label: string; active: boolean }[] = [
  LANG_EN,
  { code: "ZH", flag: "🇨🇳", label: "中文", active: false },
  { code: "KO", flag: "🇰🇷", label: "한국어", active: false },
  { code: "JA", flag: "🇯🇵", label: "日本語", active: false },
  { code: "AR", flag: "🇦🇪", label: "العربية", active: false },
  { code: "DE", flag: "🇩🇪", label: "Deutsch", active: false },
];

type Theme = "light" | "dark";
type Consent = "all" | "essential" | null;

/**
 * Gate analytics scripts on cookie consent.
 *
 * We deliberately load NO tracking scripts at module level. Only once
 * the user has explicitly accepted "all" cookies do we inject the
 * PostHog + GA snippets. This satisfies UK GDPR's prior-consent rule
 * for non-essential cookies. If consent is "essential" (Reject all)
 * or null (undecided), this function is a no-op.
 *
 * NOTE: The actual PostHog / GA init call is stubbed for M1 — the
 * marketing site is currently robots:noindex and has no analytics
 * property provisioned yet (Andy's open Q on GA). When the scripts
 * arrive, drop them into `loadAnalytics()` below and nothing else in
 * the consent pipeline changes.
 */
function loadAnalytics() {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.__uoAnalyticsLoaded) return;
  w.__uoAnalyticsLoaded = true;
  // Real PostHog snippet wiring lands in a follow-up commit once the
  // project key is provisioned. For now we simply mark that consent
  // was granted so the network-tab verification (CHUNK 7) passes.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[uo] analytics consent granted — would init PostHog/GA here");
  }
}

export default function LandingClient() {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);
  const [showCookie, setShowCookie] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Theme bootstrap ────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("uo.theme") as Theme | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        return;
      }
    } catch {
      /* localStorage may throw in private modes — ignore */
    }
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  // ── Cookie banner + consent bootstrap ──────────────────────────
  // On first visit, localStorage.uo.cookie is null → show banner, no
  // analytics. On subsequent visits, respect the saved value. The
  // banner has NO auto-dismiss — it stays visible until the user
  // makes an explicit Accept/Reject choice.
  useEffect(() => {
    let saved: Consent = null;
    try {
      const v = window.localStorage.getItem("uo.cookie");
      if (v === "all" || v === "essential") saved = v;
    } catch {
      /* ignore */
    }
    setConsent(saved);
    setShowCookie(saved === null);
    if (saved === "all") loadAnalytics();
  }, []);

  // ── Close language dropdown on outside click ───────────────────
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest?.(".lang-btn")) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [langOpen]);

  const flashToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("uo.theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const pickLang = useCallback(
    (code: Lang, active: boolean, label: string) => {
      if (!active) {
        flashToast(`${label} — coming soon`);
        return;
      }
      setLang(code);
      setLangOpen(false);
      try {
        window.localStorage.setItem("uo.lang", code);
      } catch {
        /* ignore */
      }
    },
    [flashToast],
  );

  const decideCookies = useCallback((value: "all" | "essential") => {
    try {
      window.localStorage.setItem("uo.cookie", value);
    } catch {
      /* ignore */
    }
    setConsent(value);
    setShowCookie(false);
    if (value === "all") loadAnalytics();
  }, []);

  const activeLang = LANGS.find((l) => l.code === lang) ?? LANG_EN;

  return (
    <div className="uo-landing" data-theme={theme}>
      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Per brand guide §6.2 and §8.2, the nav uses the official uo
            icon PNG — never a hand-typeset wordmark. One image per
            theme (light/dark), cropped from Andy's 1536×1024 source
            sheet at /brand/unioffer-icon-source.png. */}
        <Link href="/" className="nav-logo" aria-label="UniOffer home">
          <span className="logo-mark">
            <Image
              src={
                theme === "dark"
                  ? "/brand/unioffer-icon-dark.png"
                  : "/brand/unioffer-icon-light.png"
              }
              alt="UniOffer"
              width={384}
              height={256}
              priority
            />
          </span>
        </Link>

        <div className="nav-center">
          <a href="#features" className="nav-lnk">
            Features
          </a>
          <a href="#how-it-works" className="nav-lnk">
            How it Works
          </a>
          <a href="#pricing" className="nav-lnk">
            Pricing
          </a>
        </div>

        <div className="nav-r">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="lang-btn"
            onClick={(e) => {
              e.stopPropagation();
              setLangOpen((v) => !v);
            }}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <svg className="lang-globe" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13M2 5h12M2 11h12" />
            </svg>
            <span>{activeLang.code}</span>
            <svg
              className={`lang-chev${langOpen ? " open" : ""}`}
              viewBox="0 0 10 6"
              aria-hidden="true"
            >
              <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {langOpen && (
              <div className="lang-drop" role="listbox">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={l.code === lang}
                    aria-disabled={!l.active}
                    className={`lang-opt${l.code === lang ? " active" : ""}${
                      l.active ? "" : " disabled"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      pickLang(l.code, l.active, l.label);
                    }}
                  >
                    <span aria-hidden="true">{l.flag}</span>
                    <span>&nbsp;{l.label}</span>
                    {!l.active && <span className="lang-soon">Coming soon</span>}
                  </button>
                ))}
              </div>
            )}
          </button>

          <Link href="/signin" className="btn-login">
            Log in
          </Link>
          <Link href="/signin?mode=signup" className="btn-get">
            Get UniOffer
          </Link>
        </div>
      </nav>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main className="main">
        <div className="hero-band">
        <div className="card">
          <div className="hero-copy">
            <div className="eyebrow">
              <div className="ey-dot" />
              AI-Powered Admissions
              <div className="ey-dot" />
              For the AI-Native Generation
            </div>
            <div className="headline">
              <span className="hl-pre">More than offers,</span>
              <span className="hl-main">
                we <span className="hl-spark">spark</span> futures.
              </span>
            </div>
          </div>

          <div className="divider" />

          <div className="auth-label">Continue to UniOffer</div>

          <Link href="/signin" className="btn-google">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Link>

          <div className="or-row">
            <div className="or-line" />
            <span className="or-t">or</span>
            <div className="or-line" />
          </div>

          <form
            action="/signin"
            method="get"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.assign("/signin?mode=signup");
            }}
          >
            <input
              className="email-inp"
              type="email"
              name="email"
              placeholder="Enter your email address"
              autoComplete="email"
            />
            <button type="submit" className="btn-cont">
              Continue with Email
            </button>
          </form>

          <div className="priv">
            By continuing, you acknowledge UniOffer&apos;s{" "}
            <Link href="/signin">Privacy Policy</Link>.
          </div>

          <div className="desktop-row">
            <span className="desk-label">Get the app</span>
            <div className="desk-sep" />
            <div className="desk-apps">
              <button
                type="button"
                className="desk-btn"
                onClick={() => flashToast("macOS app — coming soon")}
              >
                <svg width="14" height="14" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true" style={{ color: "var(--uo-text-p)" }}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 391.1-5.2 232.4 35.1 120.4 56.4 62.5 120.7 20 191.7 20c65.8 0 112.2 42.3 154.6 42.3 40.5 0 103.5-45.2 176.1-45.2 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                </svg>
                <span className="desk-btn-name">macOS</span>
              </button>
              <button
                type="button"
                className="desk-btn"
                onClick={() => flashToast("Windows app — coming soon")}
              >
                <svg width="14" height="14" viewBox="0 0 88 88" aria-hidden="true">
                  <rect x="0" y="0" width="40" height="40" rx="3" fill="#00A4EF" />
                  <rect x="48" y="0" width="40" height="40" rx="3" fill="#7FBA00" />
                  <rect x="0" y="48" width="40" height="40" rx="3" fill="#FFB900" />
                  <rect x="48" y="48" width="40" height="40" rx="3" fill="#F25022" />
                </svg>
                <span className="desk-btn-name">Windows</span>
              </button>
            </div>
          </div>
        </div>
        </div>
        {/* /.hero-band — closes the centered hero band; sections below
            are full-width and stack vertically. */}

        {/* PLACEHOLDER_COPY — swap when Andy provides 03_Landing_Page_V3.1.docx.
            Structure, layout, and interaction verified; copy is product-grounded
            placeholder, not final marketing text. */}
        <section id="features" className="uo-section" aria-labelledby="features-heading">
          <div className="sec-eyebrow">Features</div>
          <h2 id="features-heading" className="sec-h2">
            Six pillars of <span className="hl-spark">calm</span>, evidence-led admissions.
          </h2>
          <p className="sec-sub">
            Everything a sixth-form student and their counsellor need to turn a
            shortlist of dream universities into a set of confident offers — on
            one connected surface.
          </p>
          <div className="feat-grid">
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">✎</div>
              <h3 className="feat-h">AI Essay Coach</h3>
              <p className="feat-p">
                Five-dimension feedback on clarity, structure, evidence, voice
                and impact — minutes after you paste a draft. Counsellor review
                queued automatically.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">◆</div>
              <h3 className="feat-h">School Intelligence</h3>
              <p className="feat-p">
                Up-to-date profiles for every UK university and course: entry
                requirements, contextual offers, deadlines, interview formats
                and real-student pass rates.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">◷</div>
              <h3 className="feat-h">Deadline Timeline</h3>
              <p className="feat-p">
                One calendar that merges UCAS, scholarship and university-specific
                dates — with gentle reminders when a submission slips out of a
                safe window.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">◉</div>
              <h3 className="feat-h">Counsellor Dashboard</h3>
              <p className="feat-p">
                Your AdropEDU counsellor sees exactly what you see, plus a queue
                of the pieces that need a human eye. No more &ldquo;did you get
                my email?&rdquo;
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">✚</div>
              <h3 className="feat-h">Evidence Framework</h3>
              <p className="feat-p">
                Every recommendation in UniOffer is traceable to a source —
                policy, data point, or counsellor note — so you always know
                why an AI suggestion was made.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">★</div>
              <h3 className="feat-h">
                Student Knowledge Base &amp; Live Student Profile
              </h3>
              <p className="feat-p">
                Your Student Knowledge Base captures everything you tell us —
                grades, extracurriculars, essays, reflections. Your Live Student
                Profile then keeps it current for counsellors and parents, with
                one consent-controlled share link.
              </p>
            </article>
          </div>
        </section>

        {/* PLACEHOLDER_COPY — swap when Andy provides 03_Landing_Page_V3.1.docx. */}
        <section id="how-it-works" className="uo-section uo-section-alt" aria-labelledby="how-heading">
          <div className="sec-eyebrow">How it works</div>
          <h2 id="how-heading" className="sec-h2">
            Four steps from first draft to first offer.
          </h2>
          <ol className="how-steps">
            <li className="how-step">
              <div className="how-num">1</div>
              <h3 className="how-h">Upload</h3>
              <p className="how-p">
                Drop your transcript, predicted grades and any essay drafts into
                your Student Knowledge Base. Everything is private by default
                and encrypted at rest.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">2</div>
              <h3 className="how-h">Analyse</h3>
              <p className="how-p">
                UniOffer scores your profile against live entry data, flags gaps
                in your personal statement, and builds a shortlist your
                counsellor can sanity-check in one sitting.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">3</div>
              <h3 className="how-h">Apply</h3>
              <p className="how-p">
                Compose, iterate and submit each application with inline AI
                feedback and a human counsellor signing off at every gate. No
                unreviewed text ever reaches UCAS.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">4</div>
              <h3 className="how-h">Track</h3>
              <p className="how-p">
                Watch offers, interview invites and scholarship decisions land
                on your timeline. Share a read-only view with your parents and
                school in two clicks.
              </p>
            </li>
          </ol>
        </section>

        {/* PLACEHOLDER_COPY — swap when Andy provides 03_Landing_Page_V3.1.docx.
            Tier names and Basic price (£20/mo) per Andy's 14:39 BST note.
            Credits surface here; raw token caps (Basic 150K / Plus 500K) stay
            backend-only per Andy's brief — do NOT leak them into marketing. */}
        <section id="pricing" className="uo-section" aria-labelledby="pricing-heading">
          <div className="sec-eyebrow">Pricing</div>
          <h2 id="pricing-heading" className="sec-h2">
            Start free. Scale when your shortlist does.
          </h2>
          <p className="sec-sub">
            Transparent monthly tiers. Credits cover AI essay feedback, shortlist
            runs, and personalised interview prep. Cancel any time — your
            Knowledge Base stays yours.
          </p>
          <div className="price-grid">
            <article className="price-card">
              <h3 className="price-name">Basic</h3>
              <div className="price-amt">
                <span className="price-num">£20</span>
                <span className="price-per">/ month</span>
              </div>
              <p className="price-sub">For one student working on one cycle.</p>
              <ul className="price-ul">
                <li>Essay feedback credits</li>
                <li>1 shortlist run per week</li>
                <li>Deadline timeline</li>
                <li>Counsellor review queue</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta">
                Start Basic
              </Link>
            </article>
            <article className="price-card price-card-featured">
              <div className="price-flag">Most students</div>
              <h3 className="price-name">Plus</h3>
              <div className="price-amt">
                <span className="price-num">£45</span>
                <span className="price-per">/ month</span>
              </div>
              <p className="price-sub">For applicants targeting competitive courses.</p>
              <ul className="price-ul">
                <li>Everything in Basic</li>
                <li>Larger monthly credit bundle</li>
                <li>Unlimited shortlist runs</li>
                <li>Interview prep simulator</li>
                <li>Priority counsellor routing</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta price-cta-featured">
                Start Plus
              </Link>
            </article>
            <article className="price-card">
              <h3 className="price-name">Team</h3>
              <div className="price-amt">
                <span className="price-num">Custom</span>
              </div>
              <p className="price-sub">For schools, agencies and cohort programmes.</p>
              <ul className="price-ul">
                <li>Seat-based pricing</li>
                <li>Shared counsellor workspace</li>
                <li>Cohort analytics</li>
                <li>SSO and audit log</li>
                <li>Data-processing addendum</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta">
                Talk to us
              </Link>
            </article>
          </div>
          <p className="price-foot">
            Every paid plan includes an AdropEDU counsellor in the loop. Prices
            shown exclude VAT.
          </p>
        </section>
      </main>

      {/* ── COOKIE BANNER (UK GDPR — prior-consent, equal weight) ── */}
      {showCookie && (
        <div
          className="cookie"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
        >
          <div className="ck-title" id="cookie-title">
            <div className="ck-ico">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="4" stroke="#A33A3A" strokeWidth="1.2" />
                <circle cx="5" cy="5" r="1.5" fill="#A33A3A" />
              </svg>
            </div>
            Cookie preferences
          </div>
          <p className="ck-body">
            We use strictly necessary cookies to run this site. With your consent
            we&apos;d also like to set analytics cookies so we can improve the
            product. You can change your mind any time via{" "}
            <Link href="/signin">Cookie Policy</Link>.
          </p>
          <div className="ck-btns ck-btns-equal">
            <button
              type="button"
              className="ck-b ck-b-equal"
              onClick={() => decideCookies("essential")}
            >
              Reject all
            </button>
            <button
              type="button"
              className="ck-b ck-b-equal"
              onClick={() => decideCookies("all")}
            >
              Accept all
            </button>
          </div>
          <p className="ck-foot">
            Strictly necessary cookies only set on Reject. Analytics load only
            after Accept.
          </p>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────────────── */}
      {toast && (
        <div className="uo-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* Hidden consent marker for e2e tests / network-tab verification */}
      <span data-testid="uo-consent-state" hidden>
        {consent ?? "undecided"}
      </span>
    </div>
  );
}
