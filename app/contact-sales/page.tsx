/**
 * /contact-sales — Discovery-call placeholder for the Premium tier.
 *
 * Replaces the prior `/signin?mode=signup` deep-link used by the Premium
 * pricing-card CTA. The production Calendly link is not yet issued, so
 * this page ships a placeholder card with a mailto fallback to
 * `contact@unioffer.ai`. Swap the card body for the live embed the
 * moment Andy lands the Calendly URL.
 *
 * Design tokens reuse the marketing surface (Syne display, DM Sans body,
 * same light/dark palette) so the jump from pricing → contact-sales
 * keeps the same visual language.
 */

import type { Metadata } from "next";
import Link from "next/link";

import "../_landing/landing.css";

export const metadata: Metadata = {
  title: "Book a Discovery Call — UniOffer",
  description:
    "Speak to the UniOffer team about Premium advisory, former Admissions Officer review, and bespoke school-list strategy.",
  robots: { index: false, follow: false },
};

export default function ContactSalesPage() {
  return (
    <main className="uo-landing">
      <section className="uo-section uo-contact-section">
        <Link href="/" className="uo-contact-back">
          ← Back to UniOffer
        </Link>
        <h1 className="uo-contact-h1">Book a Discovery Call</h1>
        <p className="uo-contact-sub">
          Speak to the UniOffer team about Premium advisory, former
          Admissions Officer review, and bespoke school-list strategy.
        </p>
        <div className="uo-contact-card">
          <p className="uo-contact-card-label">Calendar loading</p>
          <p className="uo-contact-card-body">
            Our Discovery Call scheduler is being finalised. In the
            meantime, email{" "}
            <a
              className="uo-contact-mailto"
              href="mailto:contact@unioffer.ai?subject=UniOffer%20Premium%20Discovery%20Call"
            >
              contact@unioffer.ai
            </a>{" "}
            and we&apos;ll reply with a slot within one business day.
          </p>
        </div>
      </section>
    </main>
  );
}
