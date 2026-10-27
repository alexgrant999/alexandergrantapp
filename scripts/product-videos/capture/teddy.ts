/**
 * Teddy footage. Records the public marketing site (read only, no forms), one
 * context per shot so every clip starts on a loaded frame, then transcodes to
 * the contract format. Run: npx tsx scripts/product-videos/capture/teddy.ts
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/Users/alexgrant/development/teddycalls/package.json");
const { chromium } = require("playwright") as typeof import("playwright");

const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "raw/teddy");
const OUT = path.join(ROOT, "footage/teddy");
const URL = "https://www.teddycalls.com";
const BLOCKED = /google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|facebook\.net|facebook\.com\/tr|klaviyo|hotjar|clarity\.ms|tiktok/;

interface Shot {
  file: string;
  label: string;
  /** scroll positions: [fromSelector or px, toSelector or px, ms] then hold */
  from: string | number;
  to: string | number;
  scrollMs: number;
  holdBeforeMs: number;
  holdAfterMs: number;
}

const SHOTS: Shot[] = [
  { file: "01.mp4", label: "Check-ins between sessions", from: 0, to: "#how-it-works", scrollMs: 4600, holdBeforeMs: 1400, holdAfterMs: 1000 },
  { file: "02.mp4", label: "What clients get", from: "text=What your client gets", to: 2800, scrollMs: 4000, holdBeforeMs: 1500, holdAfterMs: 1200 },
  { file: "03.mp4", label: "Your coach dashboard", from: "text=What you get", to: "text=Your coaching library", scrollMs: 4200, holdBeforeMs: 1600, holdAfterMs: 1200 },
  { file: "04.mp4", label: "Practices and teams", from: 3560, to: 4159, scrollMs: 3200, holdBeforeMs: 1400, holdAfterMs: 1200 },
];

async function recordShot(browser: import("playwright").Browser, shot: Shot): Promise<void> {
  const dir = path.join(RAW, shot.file.replace(".mp4", ""));
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir, size: { width: 1280, height: 800 } },
  });
  const page = await ctx.newPage();
  await page.route("**/*", (r) => (BLOCKED.test(r.request().url()) ? r.abort() : r.continue()));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  const y = async (t: string | number, align: "top" | "center"): Promise<number> =>
    typeof t === "number"
      ? t
      : page.locator(t).first().evaluate((el, a) => {
          const r = el.getBoundingClientRect();
          return Math.max(0, Math.round(window.scrollY + r.top - (a === "center" ? window.innerHeight / 2 - r.height / 2 : 90)));
        }, align);
  const y0 = await y(shot.from, "top");
  const y1 = await y(shot.to, "center");
  console.log(shot.file, "scroll", y0, "->", y1);
  await page.evaluate((v) => window.scrollTo(0, v), y0);
  await page.waitForTimeout(1200);
  const t0 = Date.now();
  await page.waitForTimeout(shot.holdBeforeMs);
  // String source: tsx injects a __name helper into function refs that the browser lacks.
  await page.evaluate(`new Promise((res) => {
    var a = ${y0}, b = ${y1}, ms = ${shot.scrollMs}, start = performance.now();
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function tick(now) {
      var t = Math.min(1, (now - start) / ms);
      window.scrollTo(0, a + (b - a) * ease(t));
      if (t < 1) requestAnimationFrame(tick); else res();
    }
    requestAnimationFrame(tick);
  })`);
  await page.waitForTimeout(shot.holdAfterMs);
  const total = (Date.now() - t0) / 1000;
  await ctx.close();
  const webm = fs.readdirSync(dir).find((f) => f.endsWith(".webm"))!;
  const src = path.join(dir, webm);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString());
  const start = Math.max(0, dur - total - 0.1);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", start.toFixed(2), "-i", src, "-t", total.toFixed(2), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", "30", "-movflags", "+faststart", path.join(OUT, shot.file)]);
  console.log(shot.file, total.toFixed(1), "s");
}

(async () => {
  const browser = await chromium.launch();
  for (const s of SHOTS) await recordShot(browser, s);
  await browser.close();
})();
