/**
 * GDPR network verification — hero-rebuild validation pass, 16 Apr 2026.
 *
 * Runs against the LOCAL prod build (`pnpm build && pnpm start`) so the
 * check reflects what will ship, not whatever is currently on Vercel.
 * Asserts that:
 *   1. No tracking requests fire before the user accepts cookies.
 *   2. No tracking requests fire after the user REJECTS cookies.
 *   3. (Informational) What loads after Accept. For M1 the analytics
 *      snippet is stubbed, so this should also be 0 until PostHog lands.
 *
 * Output is a single JSON log at docs/validation/gdpr-hero-rebuild-20260416.log.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

const URL = process.env.GDPR_CHECK_URL ?? "http://localhost:3000/";
const TRACKING_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "posthog.com",
  "app.posthog.com",
  "us.i.posthog.com",
  "eu.i.posthog.com",
  "segment.io",
  "segment.com",
  "hotjar.com",
  "facebook.com/tr",
  "connect.facebook.net",
  "linkedin.com/insight",
];

function isTracking(url) {
  return TRACKING_DOMAINS.some((d) => url.includes(d));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const result = { url: URL, scenarios: {} };

  for (const mode of ["reject", "accept"]) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const log = [];
    page.on("request", (req) => log.push({ url: req.url(), phase: "pre" }));

    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);

    const preConsentTracking = log.filter((r) => isTracking(r.url));

    const label = mode === "accept" ? "Accept all" : "Reject all";
    const btn = page.locator("button", { hasText: label });
    const found = (await btn.count()) > 0;
    if (found) {
      // Tag subsequent requests as post-decision so we can split them in
      // the log file rather than grepping timestamps.
      page.removeAllListeners("request");
      page.on("request", (req) => log.push({ url: req.url(), phase: "post" }));
      await btn.click();
      await page.waitForTimeout(2500);
    }

    const postDecisionTracking = log
      .filter((r) => r.phase === "post")
      .filter((r) => isTracking(r.url));

    result.scenarios[mode] = {
      bannerFound: found,
      totalRequests: log.length,
      preConsentTrackingCount: preConsentTracking.length,
      postDecisionTrackingCount: postDecisionTracking.length,
      preConsentTracking,
      postDecisionTracking,
      pass:
        preConsentTracking.length === 0 && postDecisionTracking.length === 0,
    };

    await ctx.close();
  }

  await browser.close();

  const pass =
    result.scenarios.reject.pass && result.scenarios.accept.pass;
  result.pass = pass;
  writeFileSync(
    "./docs/validation/gdpr-hero-rebuild-20260416.log",
    JSON.stringify(result, null, 2)
  );
  console.log(
    `GDPR check: pre-consent-trackers (reject run) = ${result.scenarios.reject.preConsentTrackingCount}`
  );
  console.log(
    `GDPR check: pre-consent-trackers (accept run) = ${result.scenarios.accept.preConsentTrackingCount}`
  );
  console.log(
    `GDPR check: post-reject trackers              = ${result.scenarios.reject.postDecisionTrackingCount}`
  );
  console.log(
    `GDPR check: post-accept trackers (informational) = ${result.scenarios.accept.postDecisionTrackingCount}`
  );
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
