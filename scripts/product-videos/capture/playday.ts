/**
 * Records public playday.com footage for the portfolio video. Public pages only:
 * the flow stops at the session booking link (which leads to a sign-in gate), nothing is
 * ever typed, submitted or booked. Run: npx tsx scripts/product-videos/capture/playday.ts
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/alexgrant/development/teddycalls/node_modules/playwright") as typeof import("playwright");
type Page = import("playwright").Page;

const SLUG = "playday";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "raw", SLUG);
const OUT = path.join(ROOT, "footage", SLUG);
const BLOCKED = /google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|facebook\.net|facebook\.com\/tr|klaviyo|hotjar|clarity\.ms|tiktok/;
const HIDE_CSS = `div.fixed.bottom-4.right-4{display:none !important}html{scroll-behavior:auto !important}`;

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

const SHOTS: Shot[] = [
  {
    file: "01.mp4",
    label: "Choose a studio",
    run: async (page, mark) => {
      await page.goto("https://www.playday.com/locations", { waitUntil: "load" });
      await settle(page);
      mark();
      await page.waitForTimeout(1500);
      await ease(page, 340, 3200);
      await page.waitForTimeout(1500);
    },
  },
  {
    file: "02.mp4",
    label: "Studio schedule",
    run: async (page, mark) => {
      await page.goto("https://www.playday.com/tribeca", { waitUntil: "load" });
      await settle(page);
      mark();
      await page.waitForTimeout(1200);
      await ease(page, 560, 2600);
      await page.waitForTimeout(2200);
    },
  },
  {
    file: "03.mp4",
    label: "Times and open spots",
    run: async (page, mark) => {
      await page.goto("https://www.playday.com/tribeca/schedule", { waitUntil: "load" });
      await settle(page);
      mark();
      await page.waitForTimeout(1200);
      await ease(page, 380, 2400);
      await page.waitForTimeout(800);
      await ease(page, 380, 2400);
      await page.waitForTimeout(800);
    },
  },
  {
    file: "04.mp4",
    label: "Pick a session",
    run: async (page, mark) => {
      await page.goto("https://www.playday.com/tribeca/schedule", { waitUntil: "load" });
      await settle(page);
      mark();
      await page.waitForTimeout(800);
      await ease(page, 200, 1400);
      await page.waitForTimeout(1000);
      // Booking requires sign-in, so stop on the session list before the gate.
      await page.locator('a[href^="/app/schedule/"]').nth(1).hover();
      await page.waitForTimeout(1800);
    },
  },
  {
    file: "05.mp4",
    label: "What's on",
    run: async (page, mark) => {
      await page.goto("https://www.playday.com/tribeca", { waitUntil: "load" });
      await settle(page);
      mark();
      await page.evaluate(() => window.scrollTo(0, 1500));
      await page.waitForTimeout(1200);
      await ease(page, 560, 3200);
      await page.waitForTimeout(1500);
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
    JSON.stringify({ slug: SLUG, name: "Playday", url: "playday.com/tribeca", frame: "browser", shots }, null, 2) + "\n",
  );
  console.log(`total ${shots.reduce((a, s) => a + s.seconds, 0).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
