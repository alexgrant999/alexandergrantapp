// Renders footage/<slug>/shots.json into public/videos/<slug>.mp4 and .jpg (see CONTRACT.md).
//   npm run render -- playday teddy      render the named slugs
//   npm run render:all                   render every slug that has a shots.json
//   --footage <dir>   read footage from another folder (default footage/)
//   --out <dir>       write the final files elsewhere (default <repo>/public/videos)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shotListSchema } from "./src/timeline";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUGS = ["playday", "adventureline", "teddy", "acuapp", "findyoga", "balispirit", "sewing-class", "iemerge"];
const FRAMES = 600;
// Decimal units, so the files meet the contract whichever way "3 MB" and "200 KB" are read.
const MAX_MP4 = 3_000_000;
const MAX_JPG = 200_000;
const CRF = 28;

const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const footageDir = path.resolve(option("--footage") ?? path.join(HERE, "footage"));
const outDir = path.resolve(option("--out") ?? path.join(HERE, "../../public/videos"));
const all = args.includes("--all");
const requested = args.filter((arg) => !arg.startsWith("--"));

if (!ffmpegPath) throw new Error("ffmpeg-static has no binary for this platform");
const ffmpeg = (...argv: string[]) => {
  const result = spawnSync(ffmpegPath as unknown as string, ["-hide_banner", ...argv], { encoding: "utf8" });
  return { ok: result.status === 0, stderr: result.stderr };
};
const run = (...argv: string[]) => {
  const result = ffmpeg(...argv);
  if (!result.ok) throw new Error(`ffmpeg ${argv.join(" ")}\n${result.stderr}`);
};

const ready = readdirSync(footageDir).filter((slug) => existsSync(path.join(footageDir, slug, "shots.json")));
const slugs = all ? ready : requested;
if (slugs.length === 0) {
  console.error("Usage: npm run render -- <slug> [slug...]   or   npm run render:all");
  console.error(`Ready in ${footageDir}: ${ready.join(", ") || "none"}`);
  process.exit(1);
}

// Fail before the slow part if a shot list is malformed or points at a missing file.
for (const slug of slugs) {
  const file = path.join(footageDir, slug, "shots.json");
  if (!existsSync(file)) throw new Error(`${file} does not exist`);
  const list = shotListSchema.parse(JSON.parse(readFileSync(file, "utf8")));
  if (list.slug !== slug) throw new Error(`${file} says slug "${list.slug}"`);
  for (const shot of list.shots) {
    if (!existsSync(path.join(footageDir, slug, shot.file))) throw new Error(`${slug}: ${shot.file} is missing`);
    if (/[\u2013\u2014]/.test(shot.label ?? "")) throw new Error(`${slug}: label "${shot.label}" has a dash`);
  }
}

const durationOf = (stderr: string) => {
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(stderr);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : NaN;
};

const verify = (mp4: string, jpg: string) => {
  const problems: string[] = [];
  const info = ffmpeg("-i", mp4).stderr;
  const stream = /Stream #0:0.*Video: (.*)/.exec(info)?.[1] ?? "";
  if (!/^h264 \(High\)/.test(stream)) problems.push(`codec: ${stream}`);
  if (!/yuv420p/.test(stream)) problems.push("not yuv420p");
  if (!/1280x800/.test(stream)) problems.push("not 1280x800");
  if (!/ 30 fps/.test(stream)) problems.push("not 30 fps");
  if (/Audio:/.test(info)) problems.push("has an audio track");
  const frames = Number([...ffmpeg("-i", mp4, "-map", "0:v:0", "-c", "copy", "-f", "null", "-").stderr.matchAll(/frame=\s*(\d+)/g)].pop()?.[1]);
  if (frames !== FRAMES) problems.push(`${frames} frames`);
  const seconds = durationOf(info);
  if (Math.abs(seconds - FRAMES / 30) > 0.02) problems.push(`duration ${seconds}s`);
  if (statSync(mp4).size > MAX_MP4) problems.push("mp4 over 3 MB");
  const poster = /Stream #0:0.*Video: (.*)/.exec(ffmpeg("-i", jpg).stderr)?.[1] ?? "";
  if (!/1280x800/.test(poster)) problems.push(`poster: ${poster}`);
  if (statSync(jpg).size > MAX_JPG) problems.push("jpg over 200 KB");
  return { frames, seconds, problems };
};

console.log(`Bundling with footage from ${footageDir}`);
const serveUrl = await bundle({ entryPoint: path.join(HERE, "src/index.ts"), publicDir: footageDir });
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(HERE, "out/render"), { recursive: true });
mkdirSync(path.join(HERE, "out/check"), { recursive: true });

const report: string[] = [];
let failed = false;
for (const slug of slugs) {
  const raw = path.join(HERE, "out/render", `${slug}.mp4`);
  const mp4 = path.join(outDir, `${slug}.mp4`);
  const jpg = path.join(outDir, `${slug}.jpg`);

  const composition = await selectComposition({ serveUrl, id: slug });
  let shown = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 12,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    muted: true,
    jpegQuality: 95,
    outputLocation: raw,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== shown) process.stdout.write(`${slug} ${(shown = pct)}%  `);
    },
  });
  console.log("");

  // Re-encode for the web: smaller, no audio, moov atom up front. Step the CRF up if it is too big.
  let crf = CRF;
  for (;;) {
    run("-y", "-i", raw, "-an", "-map_metadata", "-1", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", String(crf),
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "30", "-frames:v", String(FRAMES), "-movflags", "+faststart", mp4);
    if (statSync(mp4).size <= MAX_MP4 || crf >= 36) break;
    crf += 2;
  }

  // The poster is frame 0 of the final file, decoded with the same BT.709 matrix a browser uses.
  for (const q of [2, 3, 4, 5, 6, 8, 10]) {
    run("-y", "-i", mp4, "-frames:v", "1", "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24", "-q:v", String(q), jpg);
    if (statSync(jpg).size <= MAX_JPG) break;
  }

  // One frame a second at homepage size, to eyeball how it reads small.
  run("-y", "-i", mp4, "-vf", "select='not(mod(n\\,30))',scale=400:-1,tile=5x4", "-frames:v", "1", "-q:v", "3", path.join(HERE, "out/check", `${slug}-sheet.jpg`));

  const { frames, seconds, problems } = verify(mp4, jpg);
  failed ||= problems.length > 0;
  report.push(
    `${slug.padEnd(14)} ${(statSync(mp4).size / 1e6).toFixed(2)} MB (crf ${crf})  ${seconds.toFixed(2)}s  ${frames} frames  poster ${Math.round(statSync(jpg).size / 1e3)} KB  ${problems.length ? `FAIL: ${problems.join(", ")}` : "ok"}`,
  );
}

console.log(`\n${report.join("\n")}`);
const missing = SLUGS.filter((slug) => !ready.includes(slug));
if (all && footageDir === path.join(HERE, "footage") && missing.length) console.log(`\nNo shots.json yet: ${missing.join(", ")}`);
process.exit(failed ? 1 : 0);
