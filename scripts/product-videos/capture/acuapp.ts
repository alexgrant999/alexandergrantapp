/**
 * AcuApp footage. Public pages only (the app is gated behind sign-up), so this
 * records the landing page and /explore, whose sample patterns, flashcards and
 * quiz run client side. No login, no form, no account. One browser context per
 * shot so every clip starts on a loaded frame. Run:
 * npx tsx scripts/product-videos/capture/acuapp.ts
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/Users/alexgrant/development/teddycalls/package.json");
const { chromium } = require("playwright") as typeof import("playwright");

const ROOT = path.resolve(path.dirname(process.argv[1]), "..");
const RAW = path.join(ROOT, "raw/acuapp");
const OUT = path.join(ROOT, "footage/acuapp");
const BASE = "https://www.acuapp.io";
const BLOCKED = /google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|facebook\.net|facebook\.com\/tr|klaviyo|hotjar|clarity\.ms|tiktok|google\.com\/(rmkt|ccm|pagead)/;

type Step =
  | { hold: number }
  | { scroll: string | number; ms: number; offset?: number }
  | { click: string; text?: boolean };

interface Shot {
  file: string;
  path: string;
  start: string | number;
  steps: Step[];
}

const SHOTS: Shot[] = [
  {
    file: "01.mp4",
    path: "/",
    start: 0,
    steps: [{ hold: 1500 }, { scroll: "text=Everything you need to master TCM", ms: 4200 }, { hold: 1300 }],
  },
  {
    file: "02.mp4",
    path: "/explore",
    start: 0,
    steps: [{ hold: 1200 }, { scroll: "text=Patterns, as you see them in the app", ms: 2600 }, { hold: 900 }, { scroll: "text=Patterns, as you see them in the app", ms: 2600, offset: 440 }, { hold: 1200 }],
  },
  {
    file: "03.mp4",
    path: "/explore",
    start: "text=Flip a few cards",
    steps: [
      { hold: 1300 },
      { click: "text=What are the contraindications and cautions for auricular therapy?" },
      { hold: 1100 },
      { click: "text=What time is the Stomach organ clock?" },
      { hold: 1100 },
      { click: "text=Which organ combines Grain Essence with Clear Air to form Zong Qi?" },
      { hold: 1500 },
    ],
  },
  {
    file: "04.mp4",
    path: "/explore",
    start: "text=5 questions from the real bank",
    steps: [
      { hold: 1500 },
      { click: "button:has-text('Slippery, wiry (hua xian)')" },
      { hold: 2200 },
      { click: "button:has-text('Next question')" },
      { hold: 1700 },
    ],
  },
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
  await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  const top = async (t: string | number, offset = 0): Promise<number> =>
    typeof t === "number"
      ? t + offset
      : page.locator(t).first().evaluate((el, o) => Math.max(0, Math.round(window.scrollY + el.getBoundingClientRect().top - 90 + o)), offset);
  await page.evaluate((v) => window.scrollTo(0, v), await top(shot.start));
  await page.waitForTimeout(1200);
  const t0 = Date.now();
  for (const step of shot.steps) {
    if ("hold" in step) await page.waitForTimeout(step.hold);
    else if ("click" in step) await page.locator(step.click).first().click();
    else {
      const to = await top(step.scroll, step.offset ?? 0);
      // String source: tsx injects a __name helper into function refs that the browser lacks.
      await page.evaluate(`new Promise((res) => {
        var a = window.scrollY, b = ${to}, ms = ${step.ms}, start = performance.now();
        function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
        function tick(now) {
          var t = Math.min(1, (now - start) / ms);
          window.scrollTo(0, a + (b - a) * ease(t));
          if (t < 1) requestAnimationFrame(tick); else res();
        }
        requestAnimationFrame(tick);
      })`);
    }
  }
  const total = (Date.now() - t0) / 1000;
  await ctx.close();
  const src = path.join(dir, fs.readdirSync(dir).find((f) => f.endsWith(".webm"))!);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString());
  const start = Math.max(0, dur - total - 0.1);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", start.toFixed(2), "-i", src, "-t", total.toFixed(2), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", "30", "-movflags", "+faststart", path.join(OUT, shot.file)]);
  console.log(shot.file, total.toFixed(1), "s");
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const s of SHOTS) await recordShot(browser, s);
  await browser.close();
})();
