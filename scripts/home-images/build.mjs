// Downloads the chosen Pexels photos, crops and grades each one for its homepage slot,
// and writes public/images/home/<slot>.jpg plus images.json.
// Usage: PEXELS_API_KEY=... node scripts/home-images/build.mjs [cacheDir]
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const KEY = process.env.PEXELS_API_KEY
if (!KEY) throw new Error('PEXELS_API_KEY is not set')

// anchor: where the crop sits inside the spare width/height (0 = left/top, 1 = right/bottom).
// zoom: share of the largest possible crop to keep (1 = no zoom).
const SLOTS = [
  {
    slot: 'hero', id: 5413720, width: 2560, height: 1600, anchor: { x: 0.5, y: 0.5 }, zoom: 1, maxBytes: 900 * 1024,
    alt: 'A florist in a green apron opening the glass door of a flower shop, next to a "Come in, we\'re open" sign and pots of plants.',
    alternates: [5409760, 5414064],
  },
  // The same photo cropped for phones, where the full-screen hero is portrait.
  {
    slot: 'hero-mobile', id: 5413720, width: 1600, height: 2400, anchor: { x: 0.68, y: 0.5 }, zoom: 1, maxBytes: 700 * 1024,
    alt: 'A florist in a green apron opening the glass door of a flower shop, next to a "Come in, we\'re open" sign and pots of plants.',
    alternates: [],
  },
  {
    slot: 'band', id: 30667454, width: 2400, height: 1030, anchor: { x: 0.5, y: 0.5 }, zoom: 1,
    alt: 'A bakery window display of scones, cookies and croissants with handwritten labels, seen from inside over someone\'s shoulder, with the street beyond the glass.',
    alternates: [5673822, 35285900],
  },
  {
    slot: 'demand', id: 8311891, width: 1600, height: 1200, anchor: { x: 0.6, y: 0.5 }, zoom: 1,
    alt: 'A customer looking through a rail of clothes in a small, bright clothing boutique.',
    alternates: [5699089, 40107746],
  },
  {
    slot: 'build', id: 6684766, width: 1600, height: 1200, anchor: { x: 0.6, y: 0.5 }, zoom: 1,
    alt: 'Someone typing on a laptop at a café counter, with shelves of coffee bags and pour-over gear on the wall behind.',
    alternates: [5410081, 4491908],
  },
  {
    slot: 'followup', id: 7310209, width: 1600, height: 1200, anchor: { x: 0.25, y: 0.5 }, zoom: 1,
    alt: 'Hands stamping a thank you tag next to an ink pad and a stack of plain gift boxes on a wooden table.',
    alternates: [7857523, 6348095],
  },
]

// Not used on the page for now. A 4:5 contact photo if it comes back: 38217301 (Johnson Hie, quiet café counter
// with a wood stove), anchor { x: 0.5, y: 0.75 }; alternates 34748109 (open sign) and 32994613 (café entrance).

const OUT_DIR = path.resolve('public/images/home')
const MAX_BYTES = 450 * 1024
const cacheDir = process.argv[2] ?? path.join(os.tmpdir(), 'home-images-originals')

// Cached, and retried on 429, because Pexels has a short burst throttle well below the monthly quota.
async function photo(id) {
  const file = path.join(cacheDir, `${id}.json`)
  if (await stat(file).catch(() => null)) return JSON.parse(await readFile(file, 'utf8'))
  let res
  for (let attempt = 0; attempt < 20; attempt++) {
    res = await fetch(`https://api.pexels.com/v1/photos/${id}`, { headers: { Authorization: KEY } })
    if (res.status !== 429) break
    await new Promise((resolve) => setTimeout(resolve, 30_000))
  }
  if (!res.ok) throw new Error(`Pexels ${res.status} for photo ${id}`)
  const json = await res.json()
  await writeFile(file, JSON.stringify(json))
  return json
}

async function original(p) {
  const file = path.join(cacheDir, `${p.id}.jpg`)
  if (await stat(file).catch(() => null)) return readFile(file)
  const res = await fetch(p.src.original)
  if (!res.ok) throw new Error(`Download ${res.status} for photo ${p.id}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(file, buf)
  return buf
}

function cropBox(w, h, s) {
  const ratio = s.width / s.height
  const cw = Math.round(Math.min(w, h * ratio) * s.zoom)
  const ch = Math.min(h, Math.round(cw / ratio))
  return { left: Math.round((w - cw) * s.anchor.x), top: Math.round((h - ch) * s.anchor.y), width: cw, height: ch }
}

// One light grade across the set: a touch warmer, a little less saturated, blacks lifted slightly.
function grade(img) {
  return img
    .modulate({ saturation: 0.9 })
    .recomb([[1.03, 0, 0], [0, 1, 0], [0, 0, 0.95]])
    .linear(0.94, 9)
}

async function encode(img, maxBytes) {
  for (let quality = 82; quality >= 70; quality -= 3) {
    const buf = await img.clone().jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer()
    if (buf.length <= maxBytes) return { buf, quality }
  }
  throw new Error('Could not get under the size limit')
}

await mkdir(cacheDir, { recursive: true })
await mkdir(OUT_DIR, { recursive: true })

const manifest = []
for (const s of SLOTS) {
  const p = await photo(s.id)
  const src = await original(p)
  const meta = await sharp(src).metadata()
  const turned = (meta.orientation ?? 1) >= 5
  const box = cropBox(turned ? meta.height : meta.width, turned ? meta.width : meta.height, s)
  const img = grade(sharp(src).rotate().extract(box).resize(s.width, s.height, { kernel: 'lanczos3' }))
  const { buf, quality } = await encode(img, s.maxBytes ?? MAX_BYTES)
  await writeFile(path.join(OUT_DIR, `${s.slot}.jpg`), buf)

  const alternates = []
  for (const id of s.alternates) alternates.push((await photo(id)).url)
  manifest.push({
    slot: s.slot,
    src: `/images/home/${s.slot}.jpg`,
    width: s.width,
    height: s.height,
    alt: s.alt,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    pexelsUrl: p.url,
    alternates,
  })
  console.log(`${s.slot}: ${p.id} ${meta.width}x${meta.height} crop ${box.width}x${box.height}+${box.left}+${box.top} q${quality} ${Math.round(buf.length / 1024)} KB`)
}

await writeFile(path.join(OUT_DIR, 'images.json'), JSON.stringify(manifest, null, 2) + '\n')
