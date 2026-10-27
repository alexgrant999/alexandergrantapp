/**
 * iEmerge has no web app, so this builds stills from the public App Store listing.
 *
 *   node_modules/.bin/tsx scripts/product-videos/capture/iemerge.ts
 *
 * Reads the listing HTML, downloads the iPhone screenshots at full size into
 * raw/iemerge/, and writes footage/iemerge/NN.png plus shots.json.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "iemerge";
const PAGE = "https://apps.apple.com/pl/app/iemerge-app/id6503445578";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "raw", SLUG);
const OUT = path.join(ROOT, "footage", SLUG);

/** Which screenshot is which, by the tail of its file name: home screen first. */
const TAILS = ["Design_5.jpg", "Design-1.jpg", "Design.jpg"];
const LABELS = ["Spiritual emergence", "Meditation timer", "Breathing resources"];
const SECONDS = 8;

async function main(): Promise<void> {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const html = await (await fetch(PAGE)).text();
  const bases = [...new Set([...html.matchAll(/https:\/\/is\d-ssl\.mzstatic\.com\/image\/thumb\/[^\s,"]*iPhone[^\s,"]*?\.jpg(?=\/\d+x\d+bb)/g)].map((m) => m[0]))];
  if (bases.length < 3) throw new Error(`expected 3 iPhone screenshots, found ${bases.length}`);

  const raws: string[] = [];
  for (let i = 0; i < bases.length; i++) {
    const res = await fetch(`${bases[i]}/1290x2796bb.jpg`);
    if (!res.ok) throw new Error(`download failed: ${res.status} ${bases[i]}`);
    const file = path.join(RAW, `iphone${i + 1}.jpg`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    raws.push(file);
  }

  const shots = TAILS.map((tail, n) => {
    const idx = bases.findIndex((b) => b.endsWith(tail));
    if (idx < 0) throw new Error(`no screenshot ending ${tail}`);
    const name = `${String(n + 1).padStart(2, "0")}.png`;
    const out = path.join(OUT, name);
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", raws[idx], out], { encoding: "utf8" });
    if (r.status !== 0 || !fs.existsSync(out) || fs.statSync(out).size < 100_000) throw new Error(`still failed: ${name} ${r.stderr}`);
    return { file: name, seconds: SECONDS, still: true, label: LABELS[n] };
  });

  fs.writeFileSync(
    path.join(OUT, "shots.json"),
    JSON.stringify({ slug: SLUG, name: "iEmerge", url: "apps.apple.com/app/iemerge-app", frame: "phone", shots }, null, 2) + "\n",
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
