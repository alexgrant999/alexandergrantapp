/**
 * Records the Bali Spirit schedule footage (public pages only, nothing submitted).
 *
 *   node_modules/.bin/tsx scripts/product-videos/capture/balispirit.ts
 *
 * Uses the playwright install from ~/development/teddycalls (no install here).
 * Writes raw/balispirit/NN.webm, footage/balispirit/NN.mp4 and shots.json.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContext, type Page } from "/Users/alexgrant/development/teddycalls/node_modules/playwright/index.mjs";

const SLUG = "balispirit";
const URL = "https://schedule.balispiritfestival.com";
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

/** The install prompt appears a few seconds after load. Decline it as soon as it shows. */
function dismissInstallPrompt(page: Page): () => void {
  const timer = setInterval(() => {
    page.evaluate(() => document.querySelector<HTMLElement>('[aria-label="Dismiss install prompt"]')?.click()).catch(() => {});
  }, 150);
  return () => clearInterval(timer);
}

/** Scrolls the range ahead of recording so lazy images load and decode, then returns to the top. */
async function preloadImages(page: Page, rangePx: number): Promise<void> {
  await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
  for (let y = 0; y <= rangePx + 900; y += 300) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await sleep(350);
  }
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), undefined, { timeout: 15000 });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
}

type Shot = { file: string; label: string; run: (page: Page, mark: () => void) => Promise<void> };

async function openSchedule(page: Page): Promise<void> {
  await page.goto(URL, { waitUntil: "load" });
  await page.getByText("Wednesday, April 15").waitFor();
  await settle(page);
}

const SHOTS: Shot[] = [
  {
    file: "01",
    label: "Switch days",
    run: async (page, mark) => {
      await openSchedule(page);
      mark();
      await sleep(1200);
      await page.locator("select").first().selectOption({ label: "Fri, Apr 17" });
      await page.getByText("Friday, April 17").waitFor();
      await sleep(1000);
      await smoothScroll(page, 760, 4200);
      await sleep(700);
    },
  },
  {
    file: "02",
    label: "Card view",
    run: async (page, mark) => {
      await openSchedule(page);
      await page.locator("select").first().selectOption({ label: "Fri, Apr 17" });
      await page.getByText("Friday, April 17").waitFor();
      await sleep(500);
      mark();
      await sleep(800);
      await page.getByTitle("Card view").click();
      await page.getByText("Pranayama - The Yogic Breathwork").first().waitFor();
      await sleep(1200);
      await smoothScroll(page, 640, 4200);
      await sleep(700);
    },
  },
  {
    file: "03",
    label: "Open a session",
    run: async (page, mark) => {
      await openSchedule(page);
      await page.locator("select").first().selectOption({ label: "Fri, Apr 17" });
      await page.getByText("Friday, April 17").waitFor();
      await sleep(500);
      mark();
      await sleep(1200);
      await page.getByText("Pranayama - The Yogic Breathwork").first().click();
      await page.getByRole("heading", { name: "Pranayama - The Yogic Breathwork" }).waitFor();
      await sleep(1800);
      await page.mouse.move(640, 400);
      await smoothScroll(page, 360, 3000);
      await sleep(900);
    },
  },
  {
    file: "04",
    label: "Meet the teachers",
    run: async (page, mark) => {
      await openSchedule(page);
      await page.getByText("Presenters").first().click();
      await page.getByText("Artists, Teachers & Facilitators").waitFor();
      await preloadImages(page, 640);
      await sleep(1200);
      mark();
      await sleep(1200);
      await smoothScroll(page, 640, 4600);
      await sleep(700);
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
  const stopDismiss = dismissInstallPrompt(page);
  let t0 = 0;
  await shot.run(page, () => { t0 = (Date.now() - created) / 1000; });
  const t1 = (Date.now() - created) / 1000;
  stopDismiss();
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
  const only = process.argv[2];
  const jsonPath = path.join(OUT, "shots.json");
  const prior: { shots: { file: string; seconds: number; label: string }[] } | null = only && fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : null;
  const shots: { file: string; seconds: number; label: string }[] = [];
  for (const shot of SHOTS) {
    if (only && shot.file !== only) {
      const kept = prior?.shots.find((p) => p.file === `${shot.file}.mp4`);
      if (kept) shots.push(kept);
      continue;
    }
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
    JSON.stringify({ slug: SLUG, name: "Bali Spirit Festival", url: "schedule.balispiritfestival.com", frame: "browser", shots }, null, 2) + "\n",
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
