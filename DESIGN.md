# DESIGN.md

The design kit for alexandergrant.app. PRODUCT.md says what the site is for and how it talks. This file says what it looks like. Every page and component follows it. Anything not written here is a decision to make deliberately, not a gap for a default to fill.

## Direction

An account book kept by a careful shopkeeper. Ruled lines, tabular figures, paper, ink, one red rule reserved for money. Photographs of real shops, slightly warmed. Nothing floats, nothing glows, nothing is a card.

Reference objects: a ledger, a country store counter, a firm handshake.

## Colour

Defined once on `:root` in `src/app/page.tsx`. Use the variable, never the literal.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f3f0e8` | Page background. Matches the background baked into the product videos. |
| `--ink` | `oklch(23% .02 155)` | Text, hard rules, footer background. |
| `--muted` | `oklch(45% .02 150)` | Secondary text, ledger labels. |
| `--green` | `oklch(38% .075 160)` | Links, the button, focus rings. The only interactive colour. |
| `--green-deep` | `oklch(31% .06 160)` | Contact section background. |
| `--red` | `oklch(52% .17 27)` | The double rule beside a figure. Nothing else, ever. |
| `--rule` | `oklch(80% .045 235)` | Ledger row lines (the blue of ruled paper). |
| `--line` | `oklch(86% .015 120)` | Soft dividers between list rows. |

Four colours plus neutrals. No new colours. No gradients except the shade that keeps hero text readable over the photo.

## Type

Two families, loaded from Google Fonts in `src/app/layout.tsx`.

- **Besley** (serif): every heading, every figure, every quotation, the wordmark. Weight 600 for headings, 700 for the H1 and wordmark, italic 400 for quotes and captions.
- **Libre Franklin** (sans): body, labels, navigation, form controls. Weight 400 and 600 only.

Scale, from quiet to loud. One oversized step, and it belongs to figures.

| Step | Size | Where |
|---|---|---|
| small | .9375rem | nav, footer, captions, cites, case numbers |
| body | 1.0625rem / 1.55 | paragraphs, form fields |
| lead | 1.125 to 1.25rem | hero copy, case body, offer body |
| h3 | clamp(1.6rem, 2.6vw, 2.4rem) | offer and project names |
| h2 | clamp(2.2rem, 4.2vw, 3.8rem) | section headlines, max 20ch |
| h1 | clamp(2.6rem, 4vw, 3.75rem) | the one H1 |
| display | clamp(3rem, 6.4vw, 6rem) | contact headline only |
| figure | clamp(2.4rem, 4.5vw, 4rem) | the money row in a large ledger |

Headings: line-height 1.0 to 1.1, letter-spacing -.01em. Figures: `font-variant-numeric: lining-nums tabular-nums`, always.

## Space

- Page width `min(1440px, 100%)`, gutter `clamp(18px, 3.2vw, 52px)`.
- Section padding varies on purpose. Results is the most generous, `clamp(80px, 10vw, 140px)`. Services and Builds are tighter, `clamp(56px, 7vw, 96px)`. Equal padding on every section is the single biggest tell of an averaged layout.
- Lists are separated by rules, not gaps. Rows get `padding` and a `border-bottom`, never `margin` and a shadow.

## Shape

- Border radius: 2px on buttons and the one video toggle. 0 everywhere else. No rounded cards, no pills.
- Shadows: none. Depth comes from the photo and the dark sections, not from elevation.
- Rules: `1px solid var(--ink)` to open a section or table, `1px solid var(--line)` between rows, `3px double var(--ink)` to close a ledger, `3px double var(--red)` to the left of a figure.
- Icons: none. No icon fonts, no emoji, no logo grids. Where a mark is needed, use a word.

## Components

- **Button**: green fill, paper text, 52px minimum height, 14px 24px padding, 2px radius. Hover goes to ink. There is one per section at most, and one call to action on the page.
- **Ledger**: a table. Label left in muted sans, figure right in Besley 600 with the red double rule. Opens with an ink rule, closes with a double rule. Caption in italic Besley above. Large variant for the money row.
- **Section label**: a ruled row with the section name on the left and its folio on the right, like a page heading in an account book. Not a coloured eyebrow above the headline.
- **Inputs**: transparent, underlined only, inherit the section's text colour. No boxes.
- **Photos**: `filter: sepia(.08) saturate(.94)`, `background: var(--line)` while loading. Real shops and real hands. No stock handshakes, no laptops on white desks.
- **Product videos**: 16 by 10, muted, loop, with a 44px play toggle in the corner.

## What is allowed to be loud

Figures. A client's number can be the biggest thing in its section. Headlines are the next step down. Everything else is quiet. If two things in one view are competing, one of them is wrong.

## Rhythm

Consecutive sections must differ in at least two of: density, column count, background, headline size. Results is airy and two-column. Services is a tight numbered list. Builds is a dense index. Contact is dark and large.

## The tour

The homepage reads as six numbered chapters: Who I am, Adventureline, Playday, How I work, More builds, Talk to me. A case chapter pins its video, headline and quote on one side while three or four steps scroll past on the other, each step with a ruled kicker (Where they started, What I built, What runs on its own, What changed) and the ledger arriving last. From 1024px up the media is pinned; below that the chapter stacks, media first. A chapter rail with the folio numbers sits down the left edge from 1181px, and a thin green progress line runs across the top at every width.

## Motion

Scroll-linked only. Steps rise into place, ledger rows settle, whole-number figures count up, and the progress line fills, all driven by the reader's scroll position through native `animation-timeline`, behind `@supports` and `prefers-reduced-motion: no-preference`. Browsers without support get the finished state. Hover and focus transitions at .2s. Nothing runs on a clock, with one exception: the hero ledger turns to the next client every seven seconds, the red rule under the active tab filling as it waits. It pauses while the pointer or focus is on it, the tabs work with arrow keys, and under reduced motion it stays on the first client until clicked. No fade-up on load, no autoplaying reveals, no parallax.

## Banned

Named so they cannot be averaged back in.

- Purple or blue gradients, or any gradient on a surface.
- Inter, Geist, system fonts, or any third family.
- A centered hero with two buttons.
- A three-column grid of equal cards, with or without icons.
- Rounded cards with soft shadows.
- Coloured eyebrow labels above headlines.
- Lucide, Heroicons, emoji, or any icon as decoration.
- Fade-up or stagger animations on page load.
- Copy words: seamless, unlock, elevate, empower, leverage, streamline, journey, transform. Em dashes and en dashes anywhere.
- Dark hacker themes, monospace labels, version tags, status dots.
- Navy and white consultant templates.

## The tells pass

Before any page ships, review it as a senior designer hunting for AI tells. List every spot that looks templated, rank by how obvious it is, fix the top five, leave anything intentional alone. Then check the page against the rhythm rule and the loud rule above. Screenshot at 1440 and 390 wide and look at it.
