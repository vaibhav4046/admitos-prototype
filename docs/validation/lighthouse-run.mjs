/**
 * GATE 1 — Lighthouse via Playwright Chromium CDP port.
 * Avoids chrome-launcher EPERM / ENOENT issues on Windows.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

const URL = "https://unioffer-mvp.vercel.app/";

async function runLH(preset) {
  // Launch Playwright Chromium with remote debugging
  const browser = await chromium.launch({
    headless: true,
    args: ["--remote-debugging-port=9222"],
  });

  // Give Chrome a moment to start
  await new Promise((r) => setTimeout(r, 1000));

  const { default: lighthouse } = await import("lighthouse");

  const flags = {
    port: 9222,
    output: "json",
    logLevel: "error",
  };

  const config =
    preset === "desktop"
      ? {
          extends: "lighthouse:default",
          settings: {
            formFactor: "desktop",
            screenEmulation: {
              mobile: false,
              width: 1350,
              height: 940,
              deviceScaleFactor: 1,
              disabled: false,
            },
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1,
              requestLatencyMs: 0,
              downloadThroughputKbps: 0,
              uploadThroughputKbps: 0,
            },
          },
        }
      : undefined;

  let result;
  try {
    result = await lighthouse(URL, flags, config);
  } finally {
    await browser.close();
  }
  return result;
}

async function run() {
  for (const preset of ["desktop", "mobile"]) {
    console.log(`Running Lighthouse (${preset})...`);
    try {
      const result = await runLH(preset);
      const lhr = result.lhr;

      const scores = {
        performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
        seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
      };

      console.log(`  ${preset} scores:`, JSON.stringify(scores));

      const failingAudits = Object.values(lhr.audits)
        .filter(
          (a) =>
            a.score !== null &&
            a.score < 1 &&
            a.scoreDisplayMode !== "informative" &&
            a.scoreDisplayMode !== "notApplicable"
        )
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
        .slice(0, 10)
        .map((a) => ({
          id: a.id,
          title: a.title,
          score: a.score,
          displayValue: a.displayValue || "",
        }));

      writeFileSync(
        `./docs/validation/lighthouse-${preset}.json`,
        JSON.stringify({ scores, failingAudits, fetchTime: lhr.fetchTime }, null, 2)
      );
      console.log(`  Saved to lighthouse-${preset}.json`);
    } catch (e) {
      console.error(`  ${preset} failed:`, e.message);
      writeFileSync(
        `./docs/validation/lighthouse-${preset}.json`,
        JSON.stringify({ error: e.message }, null, 2)
      );
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
