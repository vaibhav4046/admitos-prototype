/**
 * V2 QA pass — 16 Apr 2026.
 *
 * Runs against the Vercel preview deploy for feat/landing-page-v2:
 *   https://unioffer-f5wezdnfv-vaibhav4046s-projects.vercel.app
 *
 * For each of /preview (landing) and /preview/dashboard:
 *   1. axe-core WCAG 2.1 AA run at 1366x900 (desktop).
 *   2. Responsive snapshot at 1366x900, 1024x800, 768x1024, 480x800 —
 *      each viewport is rendered, page waits for networkidle, and a
 *      JS snippet captures document.body.scrollWidth so we can detect
 *      horizontal overflow (scrollWidth > innerWidth means layout
 *      breaks at that breakpoint).
 *   3. Console-error capture across the whole run.
 *
 * Writes docs/validation/v2-qa-20260416.json with violations, overflow
 * counts, and any console errors.
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync } from "fs";
import { createRequire } from "module";

const BASE =
  process.env.V2_BASE_URL ??
  "https://unioffer-f5wezdnfv-vaibhav4046s-projects.vercel.app";
const require = createRequire(import.meta.url);

const ROUTES = [
  { name: "landing", path: "/preview" },
  { name: "dashboard", path: "/preview/dashboard" },
];

const VIEWPORTS = [
  { label: "desktop-1366", width: 1366, height: 900 },
  { label: "laptop-1024", width: 1024, height: 800 },
  { label: "tablet-768", width: 768, height: 1024 },
  { label: "mobile-480", width: 480, height: 800 },
  { label: "mobile-375", width: 375, height: 812 },
];

async function runAxe(page) {
  const axeCorePath = require.resolve("axe-core");
  const axeSource = readFileSync(axeCorePath, "utf8");
  await page.evaluate(axeSource);
  return await page.evaluate(() => {
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
}

async function measureOverflow(page) {
  return await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, routes: [] };

  for (const route of ROUTES) {
    const url = BASE + route.path;
    const routeReport = {
      name: route.name,
      url,
      viewports: [],
      axe: null,
      consoleErrors: [],
    };

    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      const dismiss = page.locator("button", { hasText: "Reject all" });
      if ((await dismiss.count()) > 0) {
        await dismiss.click().catch(() => {});
        await page.waitForTimeout(300);
      }

      const overflow = await measureOverflow(page);
      const horizontalOverflow =
        overflow.scrollWidth > overflow.innerWidth + 1;

      routeReport.viewports.push({
        ...vp,
        ...overflow,
        horizontalOverflow,
        consoleErrorCount: consoleErrors.length,
      });

      // Run axe only at the desktop viewport (1366) to keep output tight.
      if (vp.label === "desktop-1366") {
        const axeResult = await runAxe(page);
        routeReport.axe = {
          violations: axeResult.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            wcagTags: v.tags.filter((t) => t.startsWith("wcag")),
            nodes: v.nodes.slice(0, 5).map((n) => ({
              target: n.target,
              failureSummary: n.failureSummary,
            })),
          })),
          violationCount: axeResult.violations.length,
          passCount: axeResult.passes.length,
          incompleteCount: axeResult.incomplete.length,
        };
      }

      routeReport.consoleErrors.push(...consoleErrors);
      await ctx.close();
    }

    report.routes.push(routeReport);
  }

  await browser.close();

  console.log("\n=== V2 QA SUMMARY ===");
  console.log(`Base: ${BASE}`);
  for (const r of report.routes) {
    console.log(`\n[${r.name}] ${r.url}`);
    console.log(`  axe violations: ${r.axe?.violationCount ?? "n/a"}`);
    console.log(`  console errors: ${r.consoleErrors.length}`);
    for (const v of r.viewports) {
      const flag = v.horizontalOverflow ? " *OVERFLOW*" : "";
      console.log(
        `  ${v.label} (${v.width}x${v.height}): scrollW=${v.scrollWidth} innerW=${v.innerWidth}${flag}`
      );
    }
    if (r.axe?.violations?.length) {
      for (const v of r.axe.violations) {
        console.log(`  - [${v.impact}] ${v.id}: ${v.help}`);
      }
    }
  }

  writeFileSync(
    "./docs/validation/v2-qa-20260416.json",
    JSON.stringify(report, null, 2)
  );

  const totalViolations = report.routes.reduce(
    (a, r) => a + (r.axe?.violationCount ?? 0),
    0
  );
  const totalOverflow = report.routes.reduce(
    (a, r) => a + r.viewports.filter((v) => v.horizontalOverflow).length,
    0
  );
  process.exit(totalViolations === 0 && totalOverflow === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
