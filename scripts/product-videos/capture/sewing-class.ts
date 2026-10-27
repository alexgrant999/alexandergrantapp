/**
 * Records the TRNZK sewing class footage (public pages only, nothing typed or submitted, stops before any personal details).
 *
 *   node_modules/.bin/tsx scripts/product-videos/capture/sewing-class.ts
 *
 * Uses the playwright install from ~/development/teddycalls (no install here).
 * Writes raw/sewing-class/NN.webm, footage/sewing-class/NN.mp4 and shots.json.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContext, type Page } from "/Users/alexgrant/development/teddycalls/node_modules/playwright/index.mjs";

const SLUG = "sewing-class";
const URL = "https://sewing-class.vercel.app";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "raw", SLUG);
const OUT = path.join(ROOT, "footage", SLUG);
const VIEWPORT = { width: 1280, height: 800 };

const BLOCKED = [
  "google-analytics.com", "analytics.google.com", "googletagmanager.com", "doubleclick.net",
  "googleadservices.com", "facebook.net", "facebook.com/tr", "klaviyo", "hotjar", "clarity.ms", "tiktok",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

/** Eased wheel scroll: slow start, slow stop, small steps every ~16ms. */
async function smoothScroll(page: Page, totalPx: number, ms: number): Promise<void> {
  const start = Date.now();
  let done = 0;
  while (true) {
    const t = Math.min(1, (Date.now() - start) / ms);
    const target = Math.round(totalPx * ease(t));
    if (target - done > 0) await page.mouse.wheel(0, target - done);
    done = target;
    if (t >= 1) break;
    await sleep(16);
  }
}

async function settle(page: Page, imageWaitMs = 5000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), undefined, { timeout: imageWaitMs }).catch(() => {});
  await sleep(600);
}

type Shot = { file: string; label: string; run: (page: Page, mark: () => void) => Promise<void> };

async function openHome(page: Page): Promise<void> {
  await page.goto(URL, { waitUntil: "load" });
  await page.getByRole("heading", { name: "Sewing Classes" }).waitFor();
  await settle(page);
}

async function openBooking(page: Page): Promise<void> {
  await page.goto(`${URL}/book/new`, { waitUntil: "load" });
  await page.getByRole("heading", { name: "Book Your Term Place" }).waitFor();
  await settle(page);
}

const SHOTS: Shot[] = [
  {
    file: "01",
    label: "Term and classes",
    run: async (page, mark) => {
      await openHome(page);
      mark();
      await sleep(1500);
      await smoothScroll(page, 760, 4200);
      await sleep(900);
    },
  },
  {
    file: "02",
    label: "Spots left",
    run: async (page, mark) => {
      await openHome(page);
      await page.evaluate(() => window.scrollTo(0, 760));
      await page.getByText("Class availability").waitFor();
      await sleep(600);
      mark();
      await sleep(1200);
      await smoothScroll(page, 360, 3200);
      await sleep(800);
    },
  },
  {
    file: "03",
    label: "Start a booking",
    run: async (page, mark) => {
      await openHome(page);
      mark();
      await sleep(1000);
      await page.getByRole("link", { name: "New Student · Book Term" }).click();
      await page.getByRole("heading", { name: "Book Your Term Place" }).waitFor();
      await sleep(1000);
      await page.getByText("Class levels & descriptions").click();
      await sleep(1000);
      await smoothScroll(page, 380, 2200);
      await sleep(600);
    },
  },
  {
    file: "04",
    label: "Choose and pay",
    run: async (page, mark) => {
      await openBooking(page);
      await page.evaluate(() => window.scrollTo(0, 560));
      await sleep(500);
      mark();
      await sleep(1200);
      await smoothScroll(page, 840, 4400);
      await sleep(900);
    },
  },
];

async function record(shot: Shot): Promise<{ webm: string; t0: number; t1: number }> {
  const dir = fs.mkdtempSync(path.join(RAW, ".video-"));
  const browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir, size: VIEWPORT },
  });
  await context.route("**/*", (route) => {
    const u = route.request().url();
    return BLOCKED.some((b) => u.includes(b)) ? route.abort() : route.continue();
  });
  const page = await context.newPage();
  const created = Date.now();
  let t0 = 0;
  await shot.run(page, () => { t0 = (Date.now() - created) / 1000; });
  const t1 = (Date.now() - created) / 1000;
  await page.close();
  await context.close();
  await browser.close();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webm"));
  const webm = path.join(RAW, `${shot.file}.webm`);
  fs.renameSync(path.join(dir, files[0]), webm);
  fs.rmSync(dir, { recursive: true, force: true });
  return { webm, t0, t1 };
}

function probeSeconds(file: string): number {
  const r = spawnSync("ffmpeg", ["-i", file], { encoding: "utf8" });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);
  if (!m) throw new Error(`no duration for ${file}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function main(): Promise<void> {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const shots: { file: string; seconds: number; label: string }[] = [];
  for (const shot of SHOTS) {
    const { webm, t0, t1 } = await record(shot);
    const out = path.join(OUT, `${shot.file}.mp4`);
    const len = +(t1 - t0 - 0.1).toFixed(2);
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t0 + 0.1), "-i", webm, "-t", String(len), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", "30", "-movflags", "+faststart", out], { encoding: "utf8" });
    if (r.status !== 0 || !fs.existsSync(out) || fs.statSync(out).size < 50_000) throw new Error(`transcode failed for ${shot.file}: ${r.stderr}`);
    const seconds = +probeSeconds(out).toFixed(1);
    console.log(shot.file, "seconds", seconds, "bytes", fs.statSync(out).size);
    shots.push({ file: `${shot.file}.mp4`, seconds, label: shot.label });
  }
  fs.writeFileSync(
    path.join(OUT, "shots.json"),
    JSON.stringify({ slug: SLUG, name: "TRNZK Sewing Classes", url: "sewing-class.vercel.app", frame: "browser", shots }, null, 2) + "\n",
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
