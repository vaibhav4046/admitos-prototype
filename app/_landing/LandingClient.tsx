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
  const [activeSection, setActiveSection] = useState<string>("");
  const [authModal, setAuthModal] = useState(false);

  // ── Active-section tracker ─────────────────────────────────────
  // Drives the `.nav-lnk.active` highlight so the user always sees
  // which section the viewport is centred on. IntersectionObserver
  // fires once per section per scroll, so it's cheap.
  useEffect(() => {
    const ids = ["features", "how-it-works", "pricing"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
        {/* Nav lockup: uo icon PNG + typeset wordmark (Uni [Syne 400]
            + Offer [Syne 800, crimson]). One icon per theme (light/dark),
            cropped from Andy's source sheet. The wordmark is hand-typeset
            until a proper PNG/SVG asset is delivered. */}
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
          <a
            href="#features"
            className={`nav-lnk${activeSection === "features" ? " active" : ""}`}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={`nav-lnk${activeSection === "how-it-works" ? " active" : ""}`}
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className={`nav-lnk${activeSection === "pricing" ? " active" : ""}`}
          >
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
          <button
            type="button"
            className="btn-get"
            onClick={() => setAuthModal(true)}
          >
            Get UniOffer
          </button>
        </div>
      </nav>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main className="main">
        <div className="hero-band">
        <div className="card">
          <div className="hero-copy">
            {/* V3.1 Hero Status Tag — compliance + operating badges.
                Copy locked to spec; never substitute or abbreviate
                the compliance acronyms. */}
            <div className="eyebrow" aria-label="Platform status">
              <span className="ey-tag-lead">12 AI agents</span>
              <div className="ey-dot" />
              <span>Always on</span>
              <div className="ey-dot" />
              <span>Compliance-first</span>
              <div className="ey-dot" />
              <span>IECA</span>
              <div className="ey-dot" />
              <span>NACAC</span>
              <div className="ey-dot" />
              <span>UCAS</span>
            </div>
            <div className="headline">
              <span className="hl-pre">
                The Operating System for
              </span>
              <span className="hl-main">
                University Applications{" "}
                <span className="hl-spark">&amp; Preparations</span>
              </span>
            </div>
            <p className="hero-sub">
              One AI-native platform. Build your competitive candidacy,
              execute your full application, and access expert human
              guidance at every critical decision point — from your first
              essay to your final submission.
            </p>

            {/* V3.1 Hero Chat Composer — placeholder-only surface for
                the unauthenticated visitor. Submitting the composer
                fires the coming-soon toast and focuses the auth-card
                email input below; there is no chat route yet, and the
                composer MUST NOT imply prediction or admission
                probability in any state. */}
            <form
              className="hero-chat"
              onSubmit={(e) => {
                e.preventDefault();
                setAuthModal(true);
              }}
              aria-label="Ask UniOffer"
            >
              <input
                type="text"
                className="hero-chat-inp"
                placeholder="Ask about school strategy, essay planning, test prep, application deadlines, or readiness indicators..."
                aria-label="Ask UniOffer"
              />
              <button type="submit" className="hero-chat-btn">
                <span>Ask UniOffer</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </button>
            </form>

            {/* V3.1 Quick Action Buttons — four preset prompts that,
                on signed-in surfaces, open the chat with the prompt
                pre-filled. Pre-auth we fire a coming-soon toast so the
                user isn't dropped into a broken chat surface.
                Compliance note: never use "probability/chances/odds"
                in any chip label. */}
            <div
              className="hero-chips"
              role="group"
              aria-label="Quick actions"
            >
              <button
                type="button"
                className="hero-chip"
                onClick={() => setAuthModal(true)}
              >
                Build my school shortlist
              </button>
              <button
                type="button"
                className="hero-chip"
                onClick={() => setAuthModal(true)}
              >
                What-if: How does my readiness change if SAT improves to 1550?
              </button>
              <button
                type="button"
                className="hero-chip"
                onClick={() => setAuthModal(true)}
              >
                Oxford MAT four-week prep plan
              </button>
              <button
                type="button"
                className="hero-chip"
                onClick={() => setAuthModal(true)}
              >
                Check my essay for voice drift
              </button>
            </div>
          </div>
        </div>
        </div>
        {/* /.hero-band — closes the centered hero band; sections below
            are full-width and stack vertically. */}

        {/* V3.1 §Hero Bottom Navigation — three text links with
            middle-dot separators. Smooth-scroll handled by the
            `html { scroll-behavior: smooth }` rule in globals.css,
            plus scroll-margin-top on each target section anchor. */}
        <nav className="hero-bottom-nav" aria-label="Jump to section">
          <a href="#how-it-works">How it works</a>
          <span className="hero-bottom-nav-sep" aria-hidden="true">·</span>
          <a href="#pricing">See pricing</a>
          <span className="hero-bottom-nav-sep" aria-hidden="true">·</span>
          <a href="#features">Meet all 12 agents</a>
        </nav>

        {/* V3.1 Module 2 — Market Reality
            Five data cards surface the nationality-pool admit rates that
            make UniOffer's Application Readiness Engine necessary. Every
            stat comes from the PDF; do NOT edit numbers without a
            counter-signed data source. Compliance: no "probability" or
            "chance" language. */}
        <section
          id="market-reality"
          className="uo-section"
          aria-labelledby="market-heading"
        >
          <div className="sec-eyebrow">Market reality</div>
          <h2 id="market-heading" className="sec-h2">
            The competition is not who you think it is.
          </h2>
          <p className="sec-sub">
            International applicants don&apos;t compete against all
            applicants. You compete within your own nationality pool — at
            admit rates that are 2 to 3 times harder than the headline
            numbers suggest.
          </p>
          <ul className="market-grid">
            <li className="market-card">
              <div className="market-flag" aria-hidden="true">🇨🇳</div>
              <h3 className="market-h">China → Cambridge</h3>
              <div className="market-stat">
                <span className="market-stat-n">10.9%</span>
                <span className="market-stat-l">admit rate</span>
              </div>
              <p className="market-p">
                2,308 applicants · 252 admitted. The general Cambridge
                rate is 21%. Chinese applicants face a pool twice as
                competitive.
              </p>
            </li>
            <li className="market-card">
              <div className="market-flag" aria-hidden="true">🇮🇳</div>
              <h3 className="market-h">India → Oxford</h3>
              <div className="market-stat">
                <span className="market-stat-n">4.2%</span>
                <span className="market-stat-l">admit rate</span>
              </div>
              <p className="market-p">
                1,757 applicants · 74 admitted. The lowest admit rate
                among all major applicant nationalities at Oxford.
              </p>
            </li>
            <li className="market-card">
              <div className="market-flag" aria-hidden="true">🇸🇬</div>
              <h3 className="market-h">Singapore → Cambridge</h3>
              <div className="market-stat">
                <span className="market-stat-n">26.5%</span>
                <span className="market-stat-l">admit rate</span>
              </div>
              <p className="market-p">
                577 applicants · 153 admitted. The highest rate — but
                only because the competitive bar within Singapore is
                already extreme.
              </p>
            </li>
            <li className="market-card">
              <div className="market-flag" aria-hidden="true">🇭🇰</div>
              <h3 className="market-h">Hong Kong → Cambridge</h3>
              <div className="market-stat">
                <span className="market-stat-n">17.6%</span>
                <span className="market-stat-l">admit rate</span>
              </div>
              <p className="market-p">
                557 applicants · 98 admitted. Still nearly double the
                China rate. UniOffer&apos;s ARE understands why.
              </p>
            </li>
            <li className="market-card">
              <div className="market-flag" aria-hidden="true">🇰🇷</div>
              <h3 className="market-h">South Korea → Top US</h3>
              <div className="market-stat">
                <span className="market-stat-n">Extreme</span>
                <span className="market-stat-l">applicant pool</span>
              </div>
              <p className="market-p">
                Among the most competitive international applicant pools
                at every Ivy League institution.
              </p>
            </li>
          </ul>
          <p className="market-foot">
            UniOffer&apos;s Application Readiness Engine is calibrated to
            your nationality pool — not the general admit rate.
          </p>
          {/* V3.1 §Module 2 — section CTA routing readers from the
              nationality-pool framing to the agent-indexed explanation
              of how readiness is actually computed. In-page anchor so
              the user stays on the landing surface. */}
          <div className="market-cta-row">
            <a href="#how-it-works" className="market-cta">
              See how it works
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </section>

        {/* V3.1 Module 4 — Features
            Seven cards in the grid; the full-width compliance strip
            below is logically "card 08" but is explicitly NOT a card in
            the same grid per spec — it's a horizontal navy band.
            Copy is verbatim from 03_Landing_Page_V3.1.pdf. */}
        <section id="features" className="uo-section" aria-labelledby="features-heading">
          <div className="sec-eyebrow">Features</div>
          <h2 id="features-heading" className="sec-h2">
            12 specialist AI agents. One unified platform. Built for the top 1%.
          </h2>
          <div className="feat-grid">
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">01</div>
              <h3 className="feat-h">12-Agent AI Mesh</h3>
              <p className="feat-p">
                Twelve specialist agents execute in parallel — essay,
                strategy, research, interview, test prep, and more. Not a
                chatbot. A complete expert team working around the clock
                on your application.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">02</div>
              <h3 className="feat-h">Student DNA Engine</h3>
              <p className="feat-p">
                An 8-dimension candidacy profile built from your first
                session. Every agent output is personalised to your
                cognitive style, writing voice, and motivation pattern —
                and stays that way throughout your entire journey.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">03</div>
              <h3 className="feat-h">Application Readiness Engine</h3>
              <p className="feat-p">
                Multi-factor preparation strength analysis calibrated to
                your nationality pool and each university&apos;s
                published selection criteria. You see clear, actionable
                readiness indicators — never misleading probability
                numbers.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">04</div>
              <h3 className="feat-h">Voice Interview Simulator</h3>
              <p className="feat-p">
                Real-time emotion analysis powered by Hume AI. Oxbridge
                academic, medical MMI, and US top-college alumni
                interview modes. After five AI sessions, a human coach
                refines the final 10% AI cannot reach.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">05</div>
              <h3 className="feat-h">Adie — Your Wellbeing Companion</h3>
              <p className="feat-p">
                The first admissions platform to embed a dedicated
                wellbeing companion at every tier. Light-touch care and
                friendly nudges — reminding you to rest, checking in at
                the right moments, staying with you through results day.
                Adie is a peer support tool, not a substitute for
                professional mental health care.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">06</div>
              <h3 className="feat-h">Commons — Student Community</h3>
              <p className="feat-p">
                Every student&apos;s journey becomes collective
                knowledge. A governed, anonymous space locked to
                admissions topics — where students share experiences, ask
                questions, and offer limited peer commentary in a safe
                and moderated environment.
              </p>
            </article>
            <article className="feat-card">
              <div className="feat-ico" aria-hidden="true">07</div>
              <h3 className="feat-h">
                Live Student Profile + Student Knowledge Base
              </h3>
              <p className="feat-p">
                Powered by your Student DNA and continuously enriched
                throughout your journey, UniOffer builds and maintains a
                private personal knowledge base for every student. Your
                12 agents always know who you are — no re-introduction
                needed. Parents, counsellors, and partner schools stay
                informed through your live profile at
                unioffer.ai/p/[student-id].
              </p>
            </article>
          </div>

          {/* V3.1 §4 — "08 Compliance-First. Wellbeing-First."
              Explicitly NOT a card in the same grid. Full-width dark
              navy strip, no icon. Reads as founding-principle statement
              rather than product feature. */}
          <aside
            className="compliance-strip"
            role="note"
            aria-labelledby="compliance-strip-h"
          >
            <div className="compliance-strip-kicker">08 — Founding principles</div>
            <h3 id="compliance-strip-h" className="compliance-strip-h">
              Compliance-First. Wellbeing-First.
            </h3>
            <p className="compliance-strip-p">
              Not features. Founding principles. Every agent output,
              every data decision, and every user interaction is built
              against the strictest applicable standard — IECA, NACAC,
              UCAS, UK GDPR, and the Online Safety Act. Compliance and
              student wellbeing are core company assets, not
              afterthoughts.
            </p>
          </aside>
        </section>

        {/* V3.1 Module 3 — How UniOffer Works
            Agent-indexed 4-step flow. Each step references the specific
            agents (A0–A11) that execute that phase, plus the Student
            Knowledge Base + Live Student Profile touchpoints. Copy is
            verbatim from 03_Landing_Page_V3.1.pdf — do NOT paraphrase;
            the agent numbering is authoritative. */}
        <section
          id="how-it-works"
          className="uo-section uo-section-alt"
          aria-labelledby="how-heading"
        >
          <div className="sec-eyebrow">How it works</div>
          <h2 id="how-heading" className="sec-h2">
            From profile to application. Guided at every step.
          </h2>
          <p className="sec-sub">
            UniOffer replaces the fragmented, human-dependent, high-cost
            traditional admissions process with an AI-native execution
            platform built for the most competitive university
            applications in the world.
          </p>
          <ol className="how-steps">
            <li className="how-step">
              <div className="how-num">01</div>
              <div className="how-agents" aria-hidden="true">A1</div>
              <h3 className="how-h">Build Your DNA</h3>
              <p className="how-lede">Your applicant persona starts here.</p>
              <p className="how-p">
                A1 — Student DNA — maps your cognitive style, writing
                voice, academic depth, stress index, achievement
                motivation, leadership tendency, creativity index, and
                time management across 8 dimensions. The result is your
                applicant persona, stored in your Student Knowledge Base
                and powering every recommendation that follows. It also
                generates your Live Student Profile — a personal page
                that keeps everyone in your circle informed throughout
                your entire journey.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">02</div>
              <div className="how-agents" aria-hidden="true">A3 · A4 · A11</div>
              <h3 className="how-h">Set Your Strategy</h3>
              <p className="how-lede">
                Your school list. Your narrative. Your timeline.
              </p>
              <p className="how-p">
                A3 and A4 build your US and UK school lists with ED/EA
                timing, college balance, and preparation priorities. Your
                counsellor and agents work together to define your core
                narratives — the through-lines that connect your persona
                to your target schools. A11 shows you exactly where to
                focus.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">03</div>
              <div className="how-agents" aria-hidden="true">A5 – A9 · via A0</div>
              <h3 className="how-h">Execute with Your Agent Team</h3>
              <p className="how-lede">
                12 specialists working in parallel. Coordinated by AI.
              </p>
              <p className="how-p">
                A5 drafts and refines your essays, protecting your
                authentic voice. A6 trains your interview performance.
                A7 builds your test-prep plan. A8 strengthens your
                activities narrative. A9 supports your capstone research
                programme. All twelve agents work in parallel,
                coordinated by A0 — and every agent reads from your
                personal knowledge base to deliver responses that are
                genuinely about you, not a generic student.
              </p>
            </li>
            <li className="how-step">
              <div className="how-num">04</div>
              <div className="how-agents" aria-hidden="true">A10</div>
              <h3 className="how-h">Submit with Confidence</h3>
              <p className="how-lede">
                Every narrative. Every essay. Every activity. Reviewed.
              </p>
              <p className="how-p">
                A10 — Former Admissions Officer Review — gives your
                application a dual-perspective read before submission.
                Every essay, every activity, every narrative is evaluated
                through the lens of a real admissions reader to ensure
                your persona lands with clarity and authenticity.
              </p>
            </li>
          </ol>
        </section>

        {/* V3.1 Module 5 — Trust Signals
            Four compliance badges positioned between Features/HIW and
            Pricing per spec. No hyperlinks yet — the detailed
            compliance framework page is a follow-up route. */}
        <section
          id="trust"
          className="uo-section uo-section-alt"
          aria-labelledby="trust-heading"
        >
          <div className="sec-eyebrow">Trust</div>
          <h2 id="trust-heading" className="sec-h2">
            Built to the highest standard in the industry.
          </h2>
          <ul className="trust-grid">
            <li className="trust-card">
              <div className="trust-badge" aria-hidden="true">IECA</div>
              <h3 className="trust-h">IECA Member Standards</h3>
              <p className="trust-p">
                Independent Educational Consultants Association guidelines
                hardwired into every feature.
              </p>
            </li>
            <li className="trust-card">
              <div className="trust-badge" aria-hidden="true">NACAC</div>
              <h3 className="trust-h">NACAC Compliant</h3>
              <p className="trust-p">
                No admission outcome may be guaranteed or implied at any
                tier. Ever.
              </p>
            </li>
            <li className="trust-card">
              <div className="trust-badge" aria-hidden="true">UCAS</div>
              <h3 className="trust-h">UCAS Aligned</h3>
              <p className="trust-p">
                UK application processes built to UCAS specifications and
                guidelines.
              </p>
            </li>
            <li className="trust-card">
              <div className="trust-badge" aria-hidden="true">UK GDPR</div>
              <h3 className="trust-h">UK GDPR · Online Safety Act</h3>
              <p className="trust-p">
                EU-West data residency. Right to erasure within 30 days.
                Age verification at registration.
              </p>
            </li>
          </ul>
        </section>

        {/* V3.1 Module 6 — Pricing
            Tiers, prices, and feature bullets per 03_Landing_Page_V3.1.pdf.
            Plus price is £50/mo (not £45 from the placeholder rev).
            Tier 3 renamed "Team" → "Premium — Contact Sales" per spec.
            Raw token caps stay backend-only; marketing surfaces AI
            credits only, per Andy's brief. */}
        <section id="pricing" className="uo-section" aria-labelledby="pricing-heading">
          <div className="sec-eyebrow">Pricing</div>
          <h2 id="pricing-heading" className="sec-h2">
            Simple, transparent pricing.
          </h2>
          <p className="sec-sub">
            Start with AI. Upgrade when you&apos;re ready for human expertise.
          </p>
          <div className="price-grid">
            <article className="price-card">
              <h3 className="price-name">Basic</h3>
              <div className="price-amt">
                <span className="price-num">£20</span>
                <span className="price-per">/ month</span>
              </div>
              <p className="price-year">
                Year plan: 2 months free · £200/year
              </p>
              <p className="price-sub">
                Your AI admissions foundation. 500 AI credits included monthly.
                Purchased credits never expire.
              </p>
              <ul className="price-ul">
                <li>Student DNA + Student Knowledge Base</li>
                <li>AI Orchestrator — weekly action plans and timeline</li>
                <li>School Intelligence — official CDS and UCAS data</li>
                <li>US or UK Application Strategy</li>
                <li>Essay Agent — brainstorming and first draft</li>
                <li>Application Readiness indicators</li>
                <li>Interview Prep — 2 AI voice sessions per month</li>
                <li>Adie — wellbeing companion, every tier</li>
                <li>Commons — full community access</li>
                <li>Live Student Profile — one share link</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta">
                Get Started
              </Link>
            </article>
            <article className="price-card price-card-featured">
              <div className="price-flag">Most popular</div>
              <h3 className="price-name">Plus</h3>
              <div className="price-amt">
                <span className="price-num">£50</span>
                <span className="price-per">/ month</span>
              </div>
              <p className="price-year">
                Year plan: 2 months free · £500/year
              </p>
              <p className="price-sub">
                Full AI execution across your entire application. 2,000 AI
                credits monthly. Purchased credits roll over, never expire.
              </p>
              <ul className="price-ul">
                <li>Everything in Basic, plus:</li>
                <li>US + UK Dual-Track Strategy with ED/EA conflict detection</li>
                <li>Essay Agent Full — unlimited revisions, voice drift protection</li>
                <li>Voice Interview + Hume AI — 5 sessions per month</li>
                <li>Test Prep Agent — adaptive diagnostic and predicted score curve</li>
                <li>Activities + Leadership Programme</li>
                <li>Capstone Research Programme — 200+ PhD mentor network</li>
                <li>Application Readiness + What-if scenarios</li>
                <li>Adie Advanced — voice responses, weekly report</li>
                <li>Top-up credits — never run out mid-application</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta price-cta-featured">
                Start Plus
              </Link>
            </article>
            <article className="price-card">
              <h3 className="price-name">Premium</h3>
              <div className="price-amt">
                <span className="price-num">Contact Sales</span>
              </div>
              <p className="price-year">AI + Human Expertise</p>
              <p className="price-sub">
                Private advisory service. For families who want AI precision
                and expert human judgement at every critical moment. All
                Premium plans are privately designed.
              </p>
              <ul className="price-ul">
                <li>Everything in Plus, plus:</li>
                <li>Former Admissions Officer Review</li>
                <li>Private Counsellor Sessions</li>
                <li>Interview Coaching</li>
                <li>Adie Counsellor Sync</li>
                <li>Unlimited AI Credits</li>
                <li>Fully bespoke service design</li>
              </ul>
              <Link href="/signin?mode=signup" className="price-cta">
                Contact Sales
              </Link>
            </article>
          </div>

          {/* V3.1 §Module 6 — mandatory compliance disclaimer strip.
              Non-removable, must be clearly visible without scrolling on
              the pricing section. Uses full-width dark navy background so
              it reads as a system note, not a marketing card. */}
          <aside
            className="readiness-strip"
            role="note"
            aria-label="Readiness indicator disclaimer"
          >
            <p className="readiness-strip-body">
              Readiness indicators reflect preparation strength only.
              Admission decisions are made entirely by universities and
              cannot be predicted by any third party. UniOffer makes no
              representation about admission outcomes.
            </p>
          </aside>
        </section>
      </main>

      {/* ── FOOTER — V3.1 §Module 7 ────────────────────────────
          Four-column nav + bottom bar with registration line + two
          non-removable compliance notes (readiness disclaimer is on
          the pricing strip; the Adie disclaimer with Samaritans +
          NHS numbers lives here at the page foot so it is present
          on every viewport regardless of scroll position). */}
      <footer className="uo-footer" aria-label="Site footer">
        <div className="foot-cols">
          <div className="foot-col">
            <h4 className="foot-h">Product</h4>
            <ul className="foot-ul">
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("12-agent roster — coming soon")}
                >
                  Meet the 12 agents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Plan & credits — coming soon")}
                >
                  Plan &amp; Credits
                </button>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4 className="foot-h">Company</h4>
            <ul className="foot-ul">
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("About UniOffer — coming soon")}
                >
                  About UniOffer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Compliance framework — coming soon")}
                >
                  Compliance framework
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Careers — coming soon")}
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Press — coming soon")}
                >
                  Press
                </button>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4 className="foot-h">Support</h4>
            <ul className="foot-ul">
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Help centre — coming soon")}
                >
                  Help centre
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Contact — coming soon")}
                >
                  Contact us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="foot-link-btn"
                  onClick={() => flashToast("Advisory team — coming soon")}
                >
                  Talk to our advisory team
                </button>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4 className="foot-h">Legal</h4>
            <ul className="foot-ul">
              <li><Link href="/signin">Privacy Policy</Link></li>
              <li><Link href="/signin">Terms of Service</Link></li>
              <li><Link href="/signin">Cookie Policy</Link></li>
              <li><Link href="/signin">Adie Terms of Use</Link></li>
              <li><Link href="/signin">UK GDPR rights</Link></li>
            </ul>
          </div>
        </div>

        <div className="foot-bar">
          <p className="foot-copy">
            © 2026 UniOffer. All rights reserved. Registered in England
            and Wales.
          </p>
          <p className="foot-tags">
            Compliance-First · Wellbeing-First · AI-Native · Student-Centred
          </p>
        </div>

        {/* V3.1 — Adie disclaimer. Non-removable per spec; must appear
            on every landing view. Samaritans 116 123 and NHS 111 are
            the two crisis lines called out in the PDF verbatim. */}
        <aside
          className="foot-adie"
          role="note"
          aria-label="Adie disclaimer"
        >
          <strong>Adie disclaimer.</strong> Adie is a peer support and
          wellbeing resource tool. It is not a medical service, mental
          health service, therapy service, or clinical service of any
          kind. If you are experiencing a mental health crisis, please
          contact a qualified professional immediately. UK:{" "}
          <strong>Samaritans 116 123</strong> · NHS urgent mental
          health: <strong>111 option 2</strong>.
        </aside>
      </footer>

      {/* ── AUTH MODAL ────────────────────────────────────────────
          Extracted from the hero card per FIX B. Triggered by:
          "Get UniOffer" nav button, chat composer submit, and
          quick-action chip clicks. Contains Google + email auth
          + privacy note + desktop-app row. */}
      {authModal && (
        <div
          className="auth-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign up for UniOffer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthModal(false);
          }}
        >
          <div className="auth-modal">
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setAuthModal(false)}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>

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
      )}

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
