/**
 * Nav — S0 per UNIOFFER-SPEC-01 v2.2, Module 1.
 *
 * Sticky, blurred top nav. Server-rendered shell with two client
 * islands (LangSwitcher, ThemeToggle). The brand ships BOTH logo
 * variants; data-theme scoped CSS in landing-v3.css hides the
 * inactive one so the switch is free of client-render flash.
 *
 * Logo mapping (confirmed):
 *   - /logo-color.svg — light theme (green-cat + navy wordmark)
 *   - /logo-white.svg — dark theme (white wordmark)
 *
 * CTAs (v2.2):
 *   - "Log in" → /signin
 *   - "Get Unioffer" → /signin (opens Google + email auth surface)
 *   - "Contact Sales" lives in pricing and footer, not in the nav
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
