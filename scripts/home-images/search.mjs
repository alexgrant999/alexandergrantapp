// Searches Pexels for homepage photo candidates and renders labelled contact sheets for review.
// Usage: PEXELS_API_KEY=... node scripts/home-images/search.mjs <outDir> [slot ...]
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const KEY = process.env.PEXELS_API_KEY
if (!KEY) throw new Error('PEXELS_API_KEY is not set')

// Each slot has search rounds. A later round skips photos an earlier round already returned.
const QUERIES = {
  hero: { tag: 'h', orientation: 'portrait', rounds: [
    ['shop owner arranging shelves', 'ceramicist working in studio', 'florist working in flower shop', 'bookshop owner', 'tailor working in workshop', 'woman working in boutique', 'small business owner at work', 'craftsman workshop'],
    ['potter', 'woman arranging flowers in shop', 'shopkeeper', 'baker at work', 'leather craftsman', 'dressmaker studio', 'shop assistant folding clothes', 'framing workshop'],
  ] },
  band: { tag: 'b', orientation: 'landscape', rounds: [
    ['street of small shops', 'storefront street', 'shop counter', 'general store interior', 'boutique interior wooden', 'shop window', 'old shopfronts'],
    ['shop interior warm light', 'wooden shop counter', 'hardware store interior', 'vintage shop interior', 'bakery counter', 'cobblestone street shops', 'bookstore interior', 'row of shops'],
    ['quiet shopping street morning', 'european street shops', 'shop facade wooden', 'corner shop exterior', 'flower shop storefront', 'bakery storefront', 'village shop', 'shop window display'],
  ] },
  demand: { tag: 'd', orientation: 'landscape', rounds: [
    ['customer browsing in shop', 'people shopping in boutique', 'browsing books in bookstore', 'customers in small shop', 'shopping clothing rack', 'customer at market stall'],
    ['browsing records vinyl shop', 'customer looking at ceramics', 'shopping at bakery', 'people in bookshop', 'customer in florist', 'woman browsing clothes boutique'],
  ] },
  build: { tag: 'u', orientation: 'landscape', rounds: [
    ['tablet at shop counter', 'using tablet in cafe', 'small business owner laptop counter', 'point of sale tablet', 'laptop on workbench', 'reception desk studio'],
    ['hands typing laptop counter', 'tablet in hands shop', 'cafe owner laptop', 'florist laptop', 'woman working on laptop in shop', 'studio front desk', 'laptop in workshop'],
    ['shop owner using laptop', 'ceramic studio laptop', 'bakery owner tablet', 'card payment counter small shop', 'laptop on wooden table shop', 'tablet on counter', 'studio owner laptop', 'boutique owner laptop'],
  ] },
  followup: { tag: 'f', orientation: 'landscape', rounds: [
    ['packing orders small business', 'handwritten thank you note', 'wrapping parcel kraft paper', 'packaging shipping boxes', 'phone in hand shop counter', 'writing a card'],
    ['hands packing box', 'tying parcel string', 'thank you card handwritten', 'small business packaging order', 'writing note', 'phone in hand counter'],
  ] },
  contact: { tag: 'c', orientation: 'portrait', rounds: [
    ['open sign shop', 'shop door open', 'shop entrance door', 'quiet shop interior', 'we are open sign', 'doorway storefront'],
    ['shop door', 'open door morning light', 'empty shop interior morning', 'wooden shop front door', 'door ajar', 'shop entrance plants'],
  ] },
}
const PER_ROUND = 48
const COLS = 6
const ROWS = 4
const CELL = 250
const LABEL = 28

const outDir = process.argv[2]
if (!outDir) throw new Error('Pass an output directory')
const slots = process.argv.length > 3 ? process.argv.slice(3) : Object.keys(QUERIES)

async function search(term, orientation) {
  const url = `https://api.pexels.com/v1/search?${new URLSearchParams({ query: term, orientation, size: 'large', per_page: '30' })}`
  const res = await fetch(url, { headers: { Authorization: KEY } })
  if (!res.ok) throw new Error(`Pexels ${res.status} for "${term}"`)
  return (await res.json()).photos
}

async function thumb(photo) {
  const res = await fetch(photo.src.medium)
  const buf = Buffer.from(await res.arrayBuffer())
  return sharp(buf).resize(CELL, CELL - LABEL, { fit: 'contain', background: '#f3f0e8' }).toBuffer()
}

function label(text) {
  return Buffer.from(`<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#191916"/><text x="8" y="20" font-family="Helvetica" font-size="16" fill="#f3f0e8">${text}</text></svg>`)
}

for (const slot of slots) {
  const { tag, orientation, rounds } = QUERIES[slot]
  const seen = new Set()
  for (const [r, terms] of rounds.entries()) {
    const round = `${tag}${r + 1}`
    const lists = []
    for (const term of terms) lists.push(await search(term, orientation))

    const picked = []
    for (let i = 0; picked.length < PER_ROUND && lists.some((l) => l[i]); i++) {
      for (const list of lists) {
        const p = list[i]
        if (p && !seen.has(p.id) && picked.length < PER_ROUND) {
          seen.add(p.id)
          picked.push(p)
        }
      }
    }

    const dir = path.join(outDir, `${slot}-${r + 1}`)
    await mkdir(dir, { recursive: true })
    const candidates = picked.map((p, i) => ({ key: `${round}-${i}`, id: p.id, w: p.width, h: p.height, alt: p.alt, photographer: p.photographer, photographerUrl: p.photographer_url, url: p.url, avg: p.avg_color, original: p.src.original }))
    await writeFile(path.join(dir, 'candidates.json'), JSON.stringify(candidates, null, 2))

    const thumbs = await Promise.all(picked.map(thumb))
    const perSheet = COLS * ROWS
    for (let s = 0; s * perSheet < thumbs.length; s++) {
      const composites = []
      thumbs.slice(s * perSheet, (s + 1) * perSheet).forEach((t, j) => {
        const i = s * perSheet + j
        const left = (j % COLS) * CELL
        const top = Math.floor(j / COLS) * CELL
        composites.push({ input: t, left, top }, { input: label(`${candidates[i].key}  ${candidates[i].w}x${candidates[i].h}`), left, top: top + CELL - LABEL })
      })
      await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: '#f3f0e8' } })
        .composite(composites)
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, `sheet-${s + 1}.jpg`))
    }
    console.log(`${slot} round ${r + 1}: ${picked.length} candidates`)
  }
}
