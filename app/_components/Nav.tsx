/**
 * Nav
 *
 * Sticky, blurred top nav. Server-rendered shell with three client
 * islands (ThemeToggle, LangSwitcher, MobileMenuButton). The brand
 * mark is the green-cat wordmark in dark, with a green-cat + dark-text
 * variant in light. Both SVGs ship from /public/brand/v2/ and the
 * inactive one is hidden by data-theme scoped CSS so there is no
 * client toggling and no double-render flash.
 *
 * CTAs:
 *   - "Log in" → /signin
 *   - "Get Unioffer" → /signin (opens the Google + email auth surface)
 *   - "Contact Sales" never appears in the nav itself; the enterprise
 *     CTA lives in pricing and footer per Andy's brief.
 */

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitcher } from "./LangSwitcher";

export function Nav() {
  return (
    <header className="uo-nav" role="banner">
      <div className="uo-nav__inner">
        <Link href="/" aria-label="UniOffer home" className="uo-nav__brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/brand/v2/unioffer-wordmark-on-navy.svg"
            alt=""
            width={148}
            height={28}
            className="uo-brand-img-dark"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/brand/v2/unioffer-wordmark-greencat-dark.svg"
            alt=""
            width={148}
            height={28}
            className="uo-brand-img-light"
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
          <ThemeToggle />
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
