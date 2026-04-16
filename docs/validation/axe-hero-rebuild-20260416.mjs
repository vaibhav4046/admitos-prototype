/**
 * axe-core WCAG 2.1 AA accessibility audit — hero-rebuild validation pass,
 * 16 Apr 2026.
 *
 * Runs against the LOCAL prod build (pnpm build && pnpm start) on
 * http://localhost:3000/ so results reflect what will ship, not the stale
 * bundle on Vercel. Dismisses the cookie banner first so transient overlay
 * nodes do not inflate the violation count.
 *
 * Writes:
 *   docs/validation/axe-hero-rebuild-20260416.json
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync } from "fs";
import { createRequire } from "module";

const URL = process.env.AXE_CHECK_URL ?? "http://localhost:3000/";
const require = createRequire(import.meta.url);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  const rejectBtn = page.locator("button", { hasText: "Reject all" });
  if ((await rejectBtn.count()) > 0) {
    await rejectBtn.click();
    await page.waitForTimeout(500);
  }

  const axeCorePath = require.resolve("axe-core");
  const axeSource = readFileSync(axeCorePath, "utf8");
  await page.evaluate(axeSource);

  const results = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      window.axe
        .run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag21aa", "wcag2aa", "wcag21a", "wcag2a"],
          },
        })
        .then(resolve)
        .catch(reject);
    });
  });

  await browser.close();

  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];

  console.log(`\n=== AXE (hero-rebuild 20260416) ===`);
  console.log(`URL:        ${URL}`);
  console.log(`Violations: ${violations.length}`);
  console.log(`Passes:     ${passes.length}`);
  console.log(`Incomplete: ${incomplete.length}`);

  if (violations.length > 0) {
    console.log(`\nViolations:`);
    for (const v of violations) {
      console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`    → ${node.target.join(" > ")}`);
      }
    }
  }

  writeFileSync(
    "./docs/validation/axe-hero-rebuild-20260416.json",
    JSON.stringify(
      {
        url: URL,
        violationCount: violations.length,
        passCount: passes.length,
        incompleteCount: incomplete.length,
        violations: violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          wcagTags: v.tags.filter((t) => t.startsWith("wcag")),
          nodes: v.nodes.map((n) => ({
            target: n.target,
            html: n.html?.substring(0, 200),
            failureSummary: n.failureSummary,
          })),
        })),
        incomplete: incomplete.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodeCount: v.nodes.length,
        })),
      },
      null,
      2
    )
  );

  process.exit(violations.length === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
