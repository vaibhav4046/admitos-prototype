/**
 * Footer — S5 per UNIOFFER-SPEC-01 v2.2 (simplified, Delta 7).
 *
 * Spec layout (top → bottom):
 *   1. Brand logo (swaps by theme — Color in light, White in dark)
 *      — 158 × 28 per spec
 *   2. Registered office + info@adropedu.com + unioffer.ai
 *   3. Horizontal separator
 *   4. Base row — © YYYY unioffer · IECA / NACAC / UCAS compliant
 *      and a right-aligned Privacy · Terms link cluster
 *
 * Delta 7 cuts vs previous:
 *   - Catie disclaimer aside removed (lives in dashboard surfaces only)
 *   - Cookies link removed (cookie banner handles consent)
 *   - Logo resized from 180×32 → 158×28
 *   - Copyright string lowercased to "unioffer"
 */

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="uo-foot" role="contentinfo">
      <div className="uo-foot__inner">
        <div className="uo-foot__brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-color.svg"
            alt="UniOffer"
            width={158}
            height={28}
            className="uo-brand-img-light"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-white.svg"
            alt="UniOffer"
            width={158}
            height={28}
            className="uo-brand-img-dark"
          />
        </div>

        <address className="uo-foot__meta" style={{ fontStyle: "normal" }}>
          <span>12 John Princes Street, London, W1G 0JG</span>
          <a href="mailto:info@adropedu.com">info@adropedu.com</a>
          <a href="https://unioffer.ai">unioffer.ai</a>
        </address>

        <hr className="uo-foot__sep" />

        <div className="uo-foot__base">
          <p>© {year} unioffer · IECA · NACAC · UCAS compliant</p>
          <div className="uo-foot__base__links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
