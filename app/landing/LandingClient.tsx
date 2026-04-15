"use client";

/**
 * Landing page client shell.
 *
 * Handles all interactive bits of the /landing route:
 *   - Theme (prefers-color-scheme + manual toggle, persisted to
 *     localStorage under `uo.theme`)
 *   - Language picker (stub i18n — flips the visible label only;
 *     real translations land alongside the marketing site proper)
 *   - Cookie banner (localStorage `uo.cookie` — "all" | "essential")
 *   - Coming-soon toast for nav links whose destinations don't exist
 *     yet (Features / How it Works / Pricing)
 *
 * The server component in page.tsx owns the metadata and the font
 * preconnect; this file owns every useState/useEffect so the page
 * stays mostly static.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Lang = "EN" | "ZH" | "KO" | "JA" | "AR" | "DE";
const LANG_EN = { code: "EN" as Lang, flag: "🇬🇧", label: "English" };
const LANGS: { code: Lang; flag: string; label: string }[] = [
  LANG_EN,
  { code: "ZH", flag: "🇨🇳", label: "中文" },
  { code: "KO", flag: "🇰🇷", label: "한국어" },
  { code: "JA", flag: "🇯🇵", label: "日本語" },
  { code: "AR", flag: "🇦🇪", label: "العربية" },
  { code: "DE", flag: "🇩🇪", label: "Deutsch" },
];

type Theme = "light" | "dark";

export default function LandingClient() {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Theme bootstrap ────────────────────────────────────────────
  // Read saved preference first; fall back to prefers-color-scheme.
  // Runs once on mount — intentionally not a SSR-safe helper because
  // the <html> element doesn't own the theme (the landing wrapper
  // does), so a flash of light theme is acceptable for M1.
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

  // ── Cookie banner bootstrap ────────────────────────────────────
  useEffect(() => {
    try {
      const v = window.localStorage.getItem("uo.cookie");
      setShowCookie(v !== "all" && v !== "essential");
    } catch {
      setShowCookie(true);
    }
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

  const pickLang = useCallback((code: Lang) => {
    setLang(code);
    setLangOpen(false);
    try {
      window.localStorage.setItem("uo.lang", code);
    } catch {
      /* ignore */
    }
  }, []);

  const acceptCookies = useCallback((value: "all" | "essential") => {
    try {
      window.localStorage.setItem("uo.cookie", value);
    } catch {
      /* ignore */
    }
    setShowCookie(false);
  }, []);

  const comingSoon = useCallback(
    (label: string) => flashToast(`${label} — coming soon`),
    [flashToast],
  );

  const activeLang = LANGS.find((l) => l.code === lang) ?? LANG_EN;

  return (
    <div className="uo-landing" data-theme={theme}>
      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Per brand guide §6.2 and §8.2, the nav must use the official
            uo icon image — never a hand-typeset wordmark. Andy shipped
            the icon as a 1536×1024 presentation composite with four
            variants (solid + gradient × light-bg + dark-bg) in a 2×2
            grid; we cropped the two solid variants from the top row
            into per-theme assets so exactly one renders per theme.
            The source sheet is preserved at
            /brand/unioffer-icon-source.png. The full wordmark
            (/brand/unioffer-logo.jpg) is reserved for larger surfaces
            where the minimum 120 px width can be honoured. */}
        <Link href="/landing" className="nav-logo" aria-label="UniOffer home">
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
          <button
            type="button"
            className="nav-lnk"
            onClick={() => comingSoon("Features")}
          >
            Features<span className="soon">soon</span>
          </button>
          <button
            type="button"
            className="nav-lnk"
            onClick={() => comingSoon("How it Works")}
          >
            How it Works<span className="soon">soon</span>
          </button>
          <button
            type="button"
            className="nav-lnk"
            onClick={() => comingSoon("Pricing")}
          >
            Pricing<span className="soon">soon</span>
          </button>
        </div>

        <div className="nav-r">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              // Sun
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              // Moon
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
                    className={`lang-opt${l.code === lang ? " active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      pickLang(l.code);
                    }}
                  >
                    <span aria-hidden="true">{l.flag}</span>
                    <span>&nbsp;{l.label}</span>
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
              // Shim until /signin accepts email prefill — just route
              // the user to /signin, ignore the value for now.
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
                onClick={() => comingSoon("macOS app")}
              >
                <svg width="14" height="14" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true" style={{ color: "var(--uo-text-p)" }}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 391.1-5.2 232.4 35.1 120.4 56.4 62.5 120.7 20 191.7 20c65.8 0 112.2 42.3 154.6 42.3 40.5 0 103.5-45.2 176.1-45.2 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                </svg>
                <span className="desk-btn-name">macOS</span>
              </button>
              <button
                type="button"
                className="desk-btn"
                onClick={() => comingSoon("Windows app")}
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
      </main>

      {/* ── COOKIE BANNER ──────────────────────────────────────── */}
      {showCookie && (
        <div className="cookie" role="dialog" aria-label="Cookie preferences">
          <button
            type="button"
            className="ck-x"
            aria-label="Dismiss cookie banner"
            onClick={() => setShowCookie(false)}
          >
            ✕
          </button>
          <div className="ck-title">
            <div className="ck-ico">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="4" stroke="#A33A3A" strokeWidth="1.2" />
                <circle cx="5" cy="5" r="1.5" fill="#A33A3A" />
              </svg>
            </div>
            Cookie settings
          </div>
          We use cookies to deliver and improve our services, analyze site usage, and if you agree, to customize or personalize your experience and market our services to you. You can read our{" "}
          <Link href="/signin">Cookie Policy here</Link>.
          <div className="ck-btns">
            <button
              type="button"
              className="ck-b"
              onClick={() => flashToast("Custom preferences — coming soon")}
            >
              Customize
            </button>
            <button
              type="button"
              className="ck-b"
              onClick={() => acceptCookies("essential")}
            >
              Reject all
            </button>
            <button
              type="button"
              className="ck-b acc"
              onClick={() => acceptCookies("all")}
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────────────── */}
      {toast && (
        <div className="uo-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
