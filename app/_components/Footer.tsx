/**
 * Footer — V4 spec-accurate (Module 7, verbatim).
 *
 * Four link columns (Product · Company · Support · Legal), bottom bar
 * with registered-company text + compliance tagline, Adie disclaimer
 * with Samaritans 116 123 + NHS 111 option 2.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer className="uo-foot" role="contentinfo">
      <div className="uo-foot__brand">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
        <img
          src="/brand/v2/unioffer-wordmark-on-navy.svg"
          alt="UniOffer"
          width={180}
          height={32}
          className="uo-brand-img-dark"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, next/image optimisation not needed */}
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

      <div className="uo-foot__grid">
        <div>
          <h3 className="uo-foot__h4">Product</h3>
          <ul>
            <li><Link href="/#how-it-works">How it works</Link></li>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#features">Meet the 12 agents</Link></li>
            <li><Link href="/#pricing">Plan &amp; Credits</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uo-foot__h4">Company</h3>
          <ul>
            <li><Link href="/#trust">About UniOffer</Link></li>
            <li><Link href="/#trust">Compliance framework</Link></li>
            <li><Link href="/contact-sales">Careers</Link></li>
            <li><Link href="/contact-sales">Press</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="uo-foot__h4">Support</h3>
          <ul>
            <li><Link href="/contact-sales">Help centre</Link></li>
            <li><Link href="/contact-sales">Contact us</Link></li>
            <li><Link href="/contact-sales">Talk to our advisory team</Link></li>
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
      </div>

      <aside className="uo-foot__adie" aria-labelledby="foot-adie-h">
        <h3 id="foot-adie-h" className="uo-foot__h4">Adie disclaimer</h3>
        <p>
          Adie is a peer support and wellbeing resource tool. It is not a
          medical service, mental health service, or crisis helpline. If you
          or someone you know is in distress, please contact your local
          emergency service. In the UK: Samaritans 116 123 (free, 24/7) or
          NHS 111 option 2 for mental health crisis support.
        </p>
      </aside>

      <div className="uo-foot__base">
        <p>
          © {new Date().getFullYear()} UniOffer Ltd · Registered in England
          &amp; Wales
        </p>
        <p>
          Built with former Cambridge, Oxford, and Ivy admissions officers.
        </p>
      </div>
    </footer>
  );
}
