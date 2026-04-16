/**
 * Footer
 *
 * Five-column grid on desktop, single column on mobile. Includes the
 * Adie compliance disclaimer (Samaritans + crisis line — wellbeing
 * surface, not the Adie FAB). The disclaimer is a static aside, not
 * a chat trigger; AdieFAB is suppressed on every public route.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer className="uo-foot" role="contentinfo">
      <div className="uo-foot__grid">
        <div className="uo-foot__brand">
          <img
            src="/brand/v2/unioffer-wordmark-on-navy.svg"
            alt="UniOffer"
            width={180}
            height={32}
            className="uo-brand-img-dark"
          />
          <img
            src="/brand/v2/unioffer-wordmark-greencat-dark.svg"
            alt="UniOffer"
            width={180}
            height={32}
            className="uo-brand-img-light"
          />
          <p className="uo-foot__tag">
            The decision-stage operating system for UK + US university
            applications. IECA · NACAC · UCAS compliant.
          </p>
        </div>
        <div>
          <h3 className="uo-foot__h4">Product</h3>
          <ul>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#how-it-works">How it works</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/contact-sales">Sales</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uo-foot__h4">Company</h3>
          <ul>
            <li><Link href="/contact-sales">Contact sales</Link></li>
            <li><Link href="/signin">Log in</Link></li>
            <li><Link href="/signin">Start free</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uo-foot__h4">Legal</h3>
          <ul>
            <li><Link href="/signin">Privacy Policy</Link></li>
            <li><Link href="/signin">Terms of Service</Link></li>
            <li><Link href="/signin">Cookie Policy</Link></li>
            <li><Link href="/signin">Adie Terms of Use</Link></li>
            <li><Link href="/signin">UK GDPR rights</Link></li>
          </ul>
        </div>
        <aside className="uo-foot__adie" aria-labelledby="foot-adie-h">
          <h3 id="foot-adie-h" className="uo-foot__h4">Adie wellbeing</h3>
          <p>
            Adie is a wellbeing companion, not a substitute for clinical
            care. If you or someone you know is in crisis, contact your
            local emergency line. In the UK, Samaritans is available
            24/7 on 116 123.
          </p>
        </aside>
      </div>
      <div className="uo-foot__base">
        <p>© {new Date().getFullYear()} UniOffer Ltd · Registered in England</p>
        <p>Built with former Cambridge, Oxford, and Ivy admissions officers.</p>
      </div>
    </footer>
  );
}
