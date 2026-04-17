/**
 * Nav — S0 per UNIOFFER-SPEC-01 v2.2 (landing surface).
 *
 * Sticky, blurred top nav. Server-rendered shell with one client island
 * (LangSwitcher). On landing the theme is OS-driven only — there is NO
 * manual light/dark toggle here. User-configurable theme lives in the
 * dashboard surface (time-based auto + manual override), never on the
 * marketing site.
 *
 * Logo mapping (CSS swaps by data-theme — see landing-v3.css):
 *   /logo-color.svg — light theme (green-cat + navy wordmark)
 *   /logo-white.svg — dark theme (white wordmark)
 *
 * CTAs:
 *   "Log in"        → /signin
 *   "Get Unioffer"  → /signin (Google + email auth surface)
 *   "Contact Sales" lives in pricing + footer, not the nav.
 */

import Link from "next/link";
import { LangSwitcher } from "./LangSwitcher";
import { NavScrollWatcher } from "./NavScrollWatcher";

interface NavCopy {
  features?: string;
  how?: string;
  pricing?: string;
  login?: string;
  getStarted?: string;
  ariaPrimary?: string;
  ariaHome?: string;
}

interface NavProps {
  /**
   * Localized labels for nav links and CTAs. Optional so existing
   * callers that want the default English strings keep rendering
   * without any prop wiring.
   */
  copy?: NavCopy;
  /**
   * Server-resolved locale so the LangSwitcher hydrates in the right
   * state without a client-only flash of English.
   */
  locale?: string;
}

export function Nav({ copy, locale }: NavProps = {}) {
  const labels = {
    features: copy?.features ?? "Features",
    how: copy?.how ?? "How it works",
    pricing: copy?.pricing ?? "Pricing",
    login: copy?.login ?? "Log in",
    getStarted: copy?.getStarted ?? "Get Unioffer",
    ariaPrimary: copy?.ariaPrimary ?? "Primary",
    ariaHome: copy?.ariaHome ?? "UniOffer home",
  };
  return (
    <header className="uo-nav" role="banner">
      <div className="uo-nav__inner">
        <Link href="/" aria-label={labels.ariaHome} className="uo-nav__brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-color.svg"
            alt=""
            width={148}
            height={28}
            className="uo-brand-img-light"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-white.svg"
            alt=""
            width={148}
            height={28}
            className="uo-brand-img-dark"
          />
          <span className="uo-visually-hidden">UniOffer</span>
        </Link>
        <nav className="uo-nav__links" aria-label={labels.ariaPrimary}>
          <Link href="/#features">{labels.features}</Link>
          <Link href="/#how-it-works">{labels.how}</Link>
          <Link href="/#pricing">{labels.pricing}</Link>
        </nav>
        <div className="uo-nav__actions">
          <LangSwitcher currentLocale={locale} />
          <Link href="/signin" className="uo-btn uo-btn--ghost">
            {labels.login}
          </Link>
          <Link href="/signin" className="uo-btn uo-btn--primary">
            {labels.getStarted}
          </Link>
        </div>
      </div>
      <NavScrollWatcher />
    </header>
  );
}
