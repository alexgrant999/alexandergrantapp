/**
 * Records public adventureline.com.au footage for the portfolio video. Public pages only:
 * only colour and size swatches are clicked, nothing is added to cart, typed or submitted. Run: npx tsx scripts/product-videos/capture/adventureline.ts
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/alexgrant/development/teddycalls/node_modules/playwright") as typeof import("playwright");
type Page = import("playwright").Page;

const SLUG = "adventureline";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "raw", SLUG);
const OUT = path.join(ROOT, "footage", SLUG);
const BLOCKED = /google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|facebook\.net|facebook\.com\/tr|klaviyo|hotjar|clarity\.ms|tiktok|forms\.shopifyapps\.com|shopify-forms/;
// Shopify Forms is the 20% newsletter pop-up. Blocking it is the same as dismissing it, nothing is submitted.
const HIDE_CSS = `[id*="__popups"]{display:none !important}html{scroll-behavior:auto !important}`;

async function ease(page: Page, px: number, ms: number) {
  // A source string, not a function: tsx injects a __name helper that does not exist in the page.
  await page.evaluate(`new Promise((resolve) => {
    const dist = ${px}, dur = ${ms};
    const start = performance.now();
    let last = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const y = dist * e;
      window.scrollBy(0, y - last);
      last = y;
      if (t < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  })`);
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
}

type Shot = { file: string; label: string; run: (page: Page, mark: () => void) => Promise<void> };

async function open(page: Page, url: string, mark: () => void) {
  await page.goto(url, { waitUntil: "load" });
  await settle(page);
  mark();
}

const SHOTS: Shot[] = [
  {
    file: "01.mp4",
    label: "Store home",
    run: async (page, mark) => {
      await open(page, "https://adventureline.com.au/", mark);
      await page.waitForTimeout(1800);
      await ease(page, 640, 3600);
      await page.waitForTimeout(1500);
    },
  },
  {
    file: "02.mp4",
    label: "Browse a collection",
    run: async (page, mark) => {
      await open(page, "https://adventureline.com.au/collections/mens-jackets-1", mark);
      await page.waitForTimeout(1500);
      await ease(page, 560, 3400);
      await page.waitForTimeout(1200);
    },
  },
  {
    file: "03.mp4",
    label: "Product and sizes",
    run: async (page, mark) => {
      await open(page, "https://adventureline.com.au/products/mens-drovers-shirt", mark);
      await page.waitForTimeout(1600);
      await ease(page, 150, 1600);
      await page.waitForTimeout(700);
      await page.locator('label:has-text("Large")').first().click();
      await page.waitForTimeout(1400);
      await ease(page, 380, 2600);
      await page.waitForTimeout(1200);
    },
  },
  {
    file: "04.mp4",
    label: "Product photos",
    run: async (page, mark) => {
      await open(page, "https://adventureline.com.au/products/mens-drovers-shirt", mark);
      await page.waitForTimeout(1200);
      await ease(page, 150, 1200);
      await page.waitForTimeout(500);
      await page.locator('label:has-text("Burnt Navy Check")').first().click();
      await page.waitForTimeout(1800);
      await page.locator('label:has-text("Red Check")').first().click();
      await page.waitForTimeout(2000);
    },
  },
  {
    file: "05.mp4",
    label: "Shop by category",
    run: async (page, mark) => {
      await open(page, "https://adventureline.com.au/collections/womens", mark);
      await page.waitForTimeout(1500);
      await ease(page, 600, 3600);
      await page.waitForTimeout(1200);
    },
  },
];

function durationOf(file: string): number {
  const r = spawnSync("ffmpeg", ["-i", file], { encoding: "utf8" });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);
  if (!m) throw new Error(`no duration for ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

async function main() {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const shots: { file: string; seconds: number; label: string }[] = [];

  for (const shot of SHOTS) {
    const dir = fs.mkdtempSync(path.join(RAW, ".v-"));
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir, size: { width: 1280, height: 800 } },
    });
    const born = Date.now();
    await ctx.route("**/*", (r) => (BLOCKED.test(r.request().url()) ? r.abort() : r.continue()));
    const page = await ctx.newPage();
    await page.addInitScript(
      `new MutationObserver(()=>{if(!document.getElementById("__h")&&document.head){const s=document.createElement("style");s.id="__h";s.textContent=${JSON.stringify(HIDE_CSS)};document.head.appendChild(s)}}).observe(document,{childList:true,subtree:true})`,
    );
    let readyAt = 0;
    await shot.run(page, () => {
      if (!readyAt) readyAt = Date.now();
    });
    const endAt = Date.now();
    await page.close();
    await ctx.close();

    const webm = fs
      .readdirSync(dir)
      .filter((n) => n.endsWith(".webm"))
      .map((n) => path.join(dir, n))
      .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0];
    const raw = path.join(RAW, shot.file.replace(".mp4", ".webm"));
    fs.renameSync(webm, raw);
    fs.rmSync(dir, { recursive: true, force: true });

    // Footage starts at the mark (fonts and images settled), with a margin for video clock drift.
    const start = (readyAt - born) / 1000 + 0.35;
    const len = Math.min((endAt - born) / 1000 - start - 0.2, durationOf(raw) - start - 0.1);
    const out = path.join(OUT, shot.file);
    spawnSync("ffmpeg", ["-y", "-ss", start.toFixed(2), "-i", raw, "-t", len.toFixed(2), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", "30", "-movflags", "+faststart", out], { stdio: "ignore" });
    const size = fs.existsSync(out) ? fs.statSync(out).size : 0;
    const seconds = size > 0 ? durationOf(out) : 0;
    console.log(`${shot.file}: ${seconds.toFixed(1)}s ${(size / 1024).toFixed(0)}KB`);
    if (size < 50_000 || seconds < 3) throw new Error(`${shot.file} looks like a stub`);
    shots.push({ file: shot.file, seconds: Math.round(seconds * 10) / 10, label: shot.label });
    await new Promise((r) => setTimeout(r, 2500));
  }

  await browser.close();
  fs.writeFileSync(
    path.join(OUT, "shots.json"),
    JSON.stringify({ slug: SLUG, name: "Adventureline", url: "adventureline.com.au", frame: "browser", shots }, null, 2) + "\n",
  );
  console.log(`total ${shots.reduce((a, s) => a + s.seconds, 0).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
