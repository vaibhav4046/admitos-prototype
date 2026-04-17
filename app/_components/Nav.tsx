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

export function Nav() {
  return (
    <header className="uo-nav" role="banner">
      <div className="uo-nav__inner">
        <Link href="/" aria-label="UniOffer home" className="uo-nav__brand">
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
        <nav className="uo-nav__links" aria-label="Primary">
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
        </nav>
        <div className="uo-nav__actions">
          <LangSwitcher />
          <Link href="/signin" className="uo-btn uo-btn--ghost">
            Log in
          </Link>
          <Link href="/signin" className="uo-btn uo-btn--primary">
            Get Unioffer
          </Link>
        </div>
      </div>
    </header>
  );
}
