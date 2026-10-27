Product videos contract

Written by the lead on 2026-10-27. Every agent on this build reads this first and builds to it. If something here cannot work, stop and report it to the lead rather than changing the shape on your own.

Goal

One 20 second, silent, looping video per shipped product. Each sits next to the product's short description on the alexandergrant.app homepage. They show the real product being used, not slides about it.

Products and slugs (fixed)

playday        Playday, booking platform for children's studios       https://www.playday.com/tribeca
adventureline  Adventureline, Shopify apparel store (ads, SEO, store)  https://adventureline.com.au
teddy          Teddy, check-in calls between coaching sessions         https://www.teddycalls.com   (product name is "Teddy", never "Teddy Calls")
acuapp         AcuApp, acupuncture board exam prep                     https://www.acuapp.io
findyoga       Find Yoga Australia, yoga studio and class directory     https://www.findyoga.com.au
balispirit     Bali Spirit Festival schedule                            https://schedule.balispiritfestival.com
sewing-class   TRNZK Sewing Classes, term bookings and payments         https://sewing-class.vercel.app
iemerge        iEmerge, wellness app on the iOS App Store               https://apps.apple.com/pl/app/iemerge-app/id6503445578

Folder layout (all under scripts/product-videos/ in ~/development/alexandergrantapp)

capture/<slug>.ts            capture script for one product, owned by that product's capture agent
raw/<slug>/                  raw Playwright recordings and stills (gitignored)
footage/<slug>/NN.mp4        trimmed clips, owned by the capture agent
footage/<slug>/NN.png        stills, only where no video is possible (iemerge)
footage/<slug>/shots.json    shot list, owned by the capture agent
src/, package.json, README.md, render script    the Remotion project, owned by the editor agent
public/videos/<slug>.mp4     final video, owned by the editor agent (repo root public/, not scripts/)
public/videos/<slug>.jpg     poster, owned by the editor agent

Footage format (capture agents produce, editor consumes)

Browser footage: H.264, yuv420p, 30 fps, no audio, width 1280, height 720 to 800 (1280x800 preferred, record with a 1280x800 viewport). Phone footage or stills: portrait, at least 780 px wide. Each clip starts on a clean, fully loaded frame (no blank or white lead-in, no spinners) and shows one action: a scroll, a click into a page, a filter, a step through a flow. 3 to 5 shots per product, each 4 to 8 seconds, with at least 22 seconds of usable footage in total.

Transcode raw recordings like this: ffmpeg -ss <start> -i raw.webm -t <len> -an -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 footage/<slug>/01.mp4

shots.json shape:

{
  "slug": "playday",
  "name": "Playday",
  "url": "playday.com/tribeca",
  "frame": "browser",
  "shots": [
    { "file": "01.mp4", "seconds": 6.2, "label": "Pick a class" },
    { "file": "02.mp4", "seconds": 5.0, "label": "See open spots" }
  ]
}

frame is "browser", "phone", or "card". "card" is for stills that already contain their own device mockup and titles (App Store marketing images): a thin ink outline, no bezel, no labels. Added 2026-10-27 for iemerge. url is what the editor prints in the address bar, without https://. seconds is the clip's real duration. For a still, add "still": true and a seconds value for how long it should hold. label is optional, at most 4 words, sentence case, no em dashes or en dashes.

Final video format (editor produces, site consumes)

public/videos/<slug>.mp4: 1280x800, 30 fps, exactly 20.0 seconds (600 frames), H.264 High, yuv420p, no audio track, -movflags +faststart, CRF about 28, 3 MB or less.
public/videos/<slug>.jpg: 1280x800 JPEG, 200 KB or less, identical to frame 0 of the video so the poster hands over to playback without a jump.

Look: the site's palette. Paper #f3f0e8 background, ink #191916, red #e43b2f accent. Fonts Instrument Sans for labels, Instrument Serif only if a display face is needed. Footage sits inside a thin, minimal browser frame (or phone frame) whose address bar shows the shots.json url. No title card and no product name card, the page already names the product. Start on the product on frame 0, and end with a short crossfade back toward frame 0 so the loop does not jump. Gentle motion only (slow push in, short crossfades or slides between shots). Labels, if used, are small ink on paper chips.

Hard rules for capture (production sites belong to Alex or his clients)

- Public pages only. Never log in, never create an account, never submit a form, never place a booking or order, never type personal data. Stop each flow on the step before payment or personal details.
- Block analytics and ad requests in Playwright so recordings do not pollute client data: route and abort any request whose host contains google-analytics.com, analytics.google.com, googletagmanager.com, doubleclick.net, googleadservices.com, facebook.net, facebook.com/tr, klaviyo, hotjar, clarity.ms, tiktok.
- Cookie or consent banners: choose decline or necessary only. Close newsletter pop-ups.
- No real customer names, emails, phone numbers, or children's names on screen. If a page shows any, record a different page.
- Be gentle with the sites: one browser, normal pacing, no parallel hammering. findyoga.com.au answered 429 to a quick curl on 2026-10-27, so pace it and retry with backoff.
- Reference for the recording approach: ~/development/teddycalls/scripts/howto-video/record-helpers.ts and record-client.ts. Reference for the Remotion approach: ~/development/teddycalls/scripts/explainer-video/ (README, src/). Read them, do not edit them.
- Playwright: ~/development/teddycalls has playwright ^1.63 installed, and chromium headless shells are cached in ~/Library/Caches/ms-playwright. Install into scripts/product-videos only if you must, and say so.

Ownership

Each agent edits only the paths listed for it in its prompt. Nobody edits src/app or src/components in the site, nobody commits, nobody touches a database. Append anything surprising to /Users/alexgrant/.claude/knowledge/inbox.md before finishing, dated [2026-10-27, alexandergrantapp].
