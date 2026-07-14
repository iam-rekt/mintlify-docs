import { chromium } from "playwright";

const origin = process.env.DOCS_ORIGIN || "http://127.0.0.1:4177";
const browser = await chromium.launch({ headless: true });
const failures = [];
const checks = [];

function check(condition, label) {
  checks.push({ label, ok: Boolean(condition) });
  if (!condition) failures.push(label);
}

async function inspectPage(page, path, expectedHeading) {
  console.log(`checking ${path}`);
  const response = await page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded", timeout: 10_000 });
  check(response?.ok(), `${path} returns a successful response`);
  const heading = await page.locator("h1").first().textContent();
  check(heading?.includes(expectedHeading), `${path} renders ${expectedHeading}`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `${path} has no horizontal overflow`);
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  const routes = [
    ["/", "Markets move"],
    ["/quickstart", "Your first swap"],
    ["/guides/swap", "Swap"],
    ["/guides/liquidity", "Liquidity"],
    ["/guides/portfolio", "Portfolio"],
    ["/reference/contracts", "Contracts"],
  ];

  for (const [path, heading] of routes) await inspectPage(page, path, heading);

  await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "/tmp/robinswap-docs-desktop.png", fullPage: true });

  await page.getByRole("button", { name: /search documentation/i }).click();
  const search = page.getByPlaceholder(/search robinswap docs/i);
  await search.fill("zap");
  const searchResults = page.locator(".search-results a");
  check((await searchResults.count()) > 0, "search finds zap documentation");
  await searchResults.first().click();
  check(page.url().includes("/guides/liquidity"), "search result navigates to liquidity guide");

  const themeButton = page.getByRole("button", { name: /use dark theme/i });
  await themeButton.click();
  check((await page.locator("html").getAttribute("data-theme")) === "dark", "theme toggle enables dark mode");
  await page.reload({ waitUntil: "domcontentloaded" });
  check((await page.locator("html").getAttribute("data-theme")) === "dark", "dark theme persists after reload");
  await page.screenshot({ path: "/tmp/robinswap-docs-dark.png", fullPage: true });

  await inspectPage(page, "/not-a-real-page", "This page isn’t in the field guide");
  check(runtimeErrors.length === 0, `desktop runtime has no errors${runtimeErrors.length ? `: ${runtimeErrors.join(" | ")}` : ""}`);
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  mobile.setDefaultTimeout(8_000);
  const mobileErrors = [];
  mobile.on("pageerror", (error) => mobileErrors.push(error.message));
  await inspectPage(mobile, "/", "Markets move");
  await mobile.getByRole("button", { name: /open navigation/i }).click();
  check(await mobile.locator(".sidebar.is-open").isVisible(), "mobile navigation opens");
  await mobile.locator('.sidebar a[href="/guides/swap"]').click();
  check(mobile.url().includes("/guides/swap"), "mobile navigation opens the swap guide");
  await mobile.screenshot({ path: "/tmp/robinswap-docs-mobile.png", fullPage: true });
  await inspectPage(mobile, "/guides/liquidity", "Liquidity");
  check(mobileErrors.length === 0, `mobile runtime has no errors${mobileErrors.length ? `: ${mobileErrors.join(" | ")}` : ""}`);
  await mobileContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ origin, checks, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
