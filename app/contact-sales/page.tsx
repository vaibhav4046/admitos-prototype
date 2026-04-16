/**
 * /contact-sales — Enterprise inquiry surface (V3).
 *
 * Replaces the v1 Discovery-Call placeholder. Now ships a real form
 * (POSTs to /api/contact-sales — endpoint stub lands with M1 Week 2
 * sales pipeline). Same V3 token chrome as `/`, no `landing.css`
 * dependency. Form fields and copy follow Andy's V3 §4 Item 3 spec
 * verbatim.
 *
 * Robots remain noindex/nofollow until Andy's GA + Search Console
 * property is wired in M1 Week 2.
 */

import type { Metadata } from "next";

import { Footer } from "../_components/Footer";
import { Nav } from "../_components/Nav";

import "../_landing/landing-v3.css";
import "./contact-sales.css";

export const metadata: Metadata = {
  title: "Contact Sales — UniOffer",
  description:
    "For multi-cohort schools, universities, and counselling teams. Speak to the UniOffer team about Premium advisory, former Admissions Officer review, and bespoke school-list strategy.",
  robots: { index: false, follow: false },
};

export default function ContactSalesPage() {
  return (
    <div className="uo-shell">
      <Nav />
      <main className="uo-main uo-cs-main" id="main">
        <section className="uo-cs-card">
          <p className="uo-eyebrow">Enterprise</p>
          <h1 className="uo-cs__h1">Let&apos;s talk.</h1>
          <p className="uo-cs__lede">
            For multi-cohort schools, universities, and counselling teams.
            We&apos;ll reply within one business day.
          </p>
          <form action="/api/contact-sales" method="POST" className="uo-cs__form">
            <label className="uo-cs__label">
              <span>Full name</span>
              <input required name="name" autoComplete="name" />
            </label>
            <label className="uo-cs__label">
              <span>Work email</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
              />
            </label>
            <label className="uo-cs__label">
              <span>Organisation</span>
              <input required name="org" />
            </label>
            <label className="uo-cs__label">
              <span>How can we help?</span>
              <textarea required name="message" rows={5} />
            </label>
            <button type="submit" className="uo-btn uo-btn--primary uo-cs__submit">
              Send
            </button>
          </form>
          <p className="uo-cs__alt">
            Or email{" "}
            <a
              className="uo-cs__mailto"
              href="mailto:contact@unioffer.ai?subject=UniOffer%20Enterprise%20Inquiry"
            >
              contact@unioffer.ai
            </a>{" "}
            directly.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
