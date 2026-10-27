Product videos

A Remotion project that turns each product's footage into the 20 second, silent, looping video that sits beside it in the homepage's Selected builds list. CONTRACT.md is the spec for slugs, footage and the final format. This file covers how to render.

Rendering

From this folder:

```bash
npm install
npm run render -- playday teddy     # the named slugs
npm run render:all                  # every slug with a footage/<slug>/shots.json
```

Each slug writes public/videos/<slug>.mp4 and public/videos/<slug>.jpg at the repo root. The script bundles once, renders each slug with Remotion to out/render/<slug>.mp4 (CRF 12, an intermediate), then re-encodes that with ffmpeg-static to the contract format: H.264 High, yuv420p, BT.709, no audio, CRF 28, faststart, exactly 600 frames. If a file comes out over 3 MB it steps the CRF up by 2 until it fits. The poster is frame 0 of the final file. It then checks every output (codec, size, 1280x800, 30 fps, no audio track, frame count, duration from ffmpeg -i, file sizes) and prints one line per slug, exiting non-zero if anything fails. out/check/<slug>-sheet.jpg holds one frame per second at 400 px wide, which is roughly how big the video is on the page, for a quick look.

Adding or re-recording footage needs no code change. Every footage/<slug>/shots.json becomes a composition with the slug as its id, and the shot list, labels and timing all come from that file.

Previewing

```bash
npm run studio
```

Opens Remotion Studio with footage/ as the public folder, one composition per slug.

How the timing works

The 20 seconds (600 frames) are shared between the shots in proportion to their footage, with 15 frame crossfades (browser) or slides (phone) between them. Every shot plays at the same rate: slower when there is less footage than time, up to 1.25 times faster when there is more, and past that the tail of each clip is cut. A clip never runs out before its slot ends, so there is never a frozen or blank frame. The last 15 frames bring the first shot back exactly as it stood on frame 0, so the loop does not jump. Each shot has a slow push in, 4% for footage and 8% for stills, which have no motion of their own. Labels fade in after their shot arrives and out before the next one starts. See src/timeline.ts.

Browser footage plays inside a fixed browser window whose address bar shows the url from shots.json. The widest shot sets the viewport, and every shot fills its width at its own aspect ratio, anchored to the top. Phone footage and stills sit in a ring of phones that slides one place per shot, with the label hung off the left edge of the centre phone. frame "card" uses the same ring for App Store images that already draw their own phone and title: a thin ink outline instead of a bezel, and no labels.

Testing without real footage

out/ is gitignored. To try a change against fixtures instead of footage/:

```bash
npm run render -- --footage out/fixture --out out/videos fixture-browser
npx remotion studio src/index.ts --public-dir=out/fixture
```

The fixtures were cut from the Teddy explainer's footage (teddycalls/scripts/explainer-video/public/footage), with each folder holding a shots.json in the contract shape.

Notes

Remotion is pinned to 4.0.533, the same version as the Teddy explainer. The first render downloads Chrome Headless Shell (about 90 MB) into node_modules.

ffmpeg-static ships no ffprobe, so the checks parse ffmpeg -i output and count frames with a null muxer.
