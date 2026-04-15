/**
 * GATE 4 — Cross-Browser Smoke Test
 * Screenshots in chromium, firefox, webkit at desktop + mobile viewports.
 */
import { chromium, firefox, webkit } from "playwright";

const URL = "https://unioffer-mvp.vercel.app/";
const ENGINES = [
  { name: "chromium", launcher: chromium },
  { name: "firefox", launcher: firefox },
  { name: "webkit", launcher: webkit },
];
const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 375, height: 812 },
];

async function run() {
  const results = [];

  for (const engine of ENGINES) {
    const browser = await engine.launcher.launch({ headless: true });

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      try {
        await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
        // Dismiss cookie banner if present so it doesn't obscure screenshots
        const rejectBtn = page.locator("button", { hasText: "Reject all" });
        if ((await rejectBtn.count()) > 0) {
          await rejectBtn.click();
          await page.waitForTimeout(500);
        }

        const path = `./docs/validation/screenshots/${engine.name}-${vp.label}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log(`✓ ${engine.name} ${vp.label} → ${path}`);
        results.push({ engine: engine.name, viewport: vp.label, pass: true });
      } catch (err) {
        console.error(`✗ ${engine.name} ${vp.label}: ${err.message}`);
        results.push({
          engine: engine.name,
          viewport: vp.label,
          pass: false,
          error: err.message,
        });
      }

      await context.close();
    }

    await browser.close();
  }

  console.log("\n=== GATE 4 SUMMARY ===");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"} ${r.engine}-${r.viewport}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
