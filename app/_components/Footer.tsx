/**
 * Footer — S5 per UNIOFFER-SPEC-01 v2.2 (simplified).
 *
 * Spec layout (top → bottom):
 *   1. Brand logo (swaps by theme — Color in light, White in dark)
 *   2. Registered office + info@adropedu.com + unioffer.ai
 *   3. Catie disclaimer aside (Samaritans 116 123 / NHS 111 opt 2)
 *   4. Horizontal separator
 *   5. Base row — © 2026 UniOffer · IECA / NACAC / UCAS compliant
 *      and a right-aligned Privacy · Terms · Cookies link cluster
 *
 * The 4-column Product/Company/Support/Legal grid from V4 was
 * explicitly cut in v2.2 — the marketing site does not need a site
 * map footer at MVP scale.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer className="uo-foot" role="contentinfo">
      <div className="uo-foot__inner">
        <div className="uo-foot__brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-color.svg"
            alt="UniOffer"
            width={180}
            height={32}
            className="uo-brand-img-light"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
          <img
            src="/logo-white.svg"
            alt="UniOffer"
            width={180}
            height={32}
            className="uo-brand-img-dark"
          />
        </div>

        <address className="uo-foot__meta" style={{ fontStyle: "normal" }}>
          <span>12 John Princes Street, London, W1G 0JG</span>
          <a href="mailto:info@adropedu.com">info@adropedu.com</a>
          <a href="https://unioffer.ai">unioffer.ai</a>
        </address>

        <aside className="uo-foot__catie" aria-labelledby="foot-catie-h">
          <h3 id="foot-catie-h">Catie disclaimer</h3>
          <p>
            Catie is a peer support and wellbeing resource. It is not a
            medical service, mental health service, or crisis helpline. If
            you or someone you know is in distress, please contact your
            local emergency service. In the UK: Samaritans 116 123 (free,
            24/7) or NHS 111 option 2 for mental health crisis support.
          </p>
        </aside>

        <hr className="uo-foot__sep" />

        <div className="uo-foot__base">
          <p>
            © {new Date().getFullYear()} UniOffer · IECA · NACAC · UCAS
            compliant
          </p>
          <div className="uo-foot__base__links">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
