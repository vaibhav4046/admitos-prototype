/**
 * GATE 2 — axe-core WCAG 2.1 AA accessibility audit via Playwright.
 * Injects axe-core into the page and runs against the production URL.
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const URL = "https://unioffer-mvp.vercel.app/";
const require = createRequire(import.meta.url);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  // Dismiss cookie banner so it doesn't interfere
  const rejectBtn = page.locator("button", { hasText: "Reject all" });
  if ((await rejectBtn.count()) > 0) {
    await rejectBtn.click();
    await page.waitForTimeout(500);
  }

  // Inject axe-core
  const axeCorePath = require.resolve("axe-core");
  const axeSource = readFileSync(axeCorePath, "utf8");
  await page.evaluate(axeSource);

  // Run axe with WCAG 2.1 AA tags
  const results = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag21aa", "wcag2aa", "wcag21a", "wcag2a"],
        },
      }).then(resolve).catch(reject);
    });
  });

  await browser.close();

  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];

  console.log(`\n=== GATE 2 — AXE ACCESSIBILITY SUMMARY ===`);
  console.log(`Violations: ${violations.length}`);
  console.log(`Passes: ${passes.length}`);
  console.log(`Incomplete (needs review): ${incomplete.length}`);

  if (violations.length > 0) {
    console.log(`\nViolations:`);
    for (const v of violations) {
      console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
      console.log(`    WCAG: ${v.tags.filter(t => t.startsWith("wcag")).join(", ")}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`    → ${node.target.join(" > ")}`);
      }
    }
  }

  writeFileSync(
    "./docs/validation/axe-report.json",
    JSON.stringify(
      {
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

  console.log(`\nSaved to axe-report.json`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
