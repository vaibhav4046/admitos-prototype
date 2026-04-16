"use client";

/**
 * CookieBanner — UK-GDPR compliant.
 *
 * Equal-prominence Accept + Reject buttons (no dark pattern, no
 * pre-tick, no auto-dismiss). Writes the consent value to the
 * `uo-consent` cookie + localStorage so analytics scripts in
 * Analytics.tsx can read it server-side and only fire when accepted.
 *
 * The banner stays visible until the user makes an explicit choice.
 * On Reject, only strictly necessary cookies are set; no PostHog,
 * no GA, no Sentry user-level tracking.
 */

import { useEffect, useState } from "react";

type Consent = "accept" | "reject" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = window.localStorage.getItem("uo-consent");
      if (v === "accept" || v === "reject") setConsent(v);
    } catch {
      /* localStorage may throw — show banner anyway */
    }
  }, []);

  const decide = (value: "accept" | "reject") => {
    setConsent(value);
    try {
      window.localStorage.setItem("uo-consent", value);
      // Mirror to a cookie so server components and middleware can
      // read consent without depending on localStorage.
      document.cookie = `uo-consent=${value}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  };

  if (!mounted || consent !== null) return null;

  return (
    <div
      className="uo-cookie"
      role="dialog"
      aria-modal="false"
      aria-labelledby="uo-cookie-h"
    >
      <p id="uo-cookie-h" className="uo-cookie__txt">
        UniOffer uses essential cookies to run the site. With your consent,
        we also use product analytics to improve the experience. You can
        change your choice any time in Settings.
      </p>
      <div className="uo-cookie__btns">
        <button
          type="button"
          className="uo-cookie__btn"
          onClick={() => decide("reject")}
        >
          Reject non-essential
        </button>
        <button
          type="button"
          className="uo-cookie__btn uo-cookie__btn--accept"
          onClick={() => decide("accept")}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
