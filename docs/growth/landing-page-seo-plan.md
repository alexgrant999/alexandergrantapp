# Landing page and organic search plan, alexandergrant.app

Dated 2026-11-16. Author: searchlight (seo-planner). Planning only, no site code touched, nothing submitted to Search Console.

## 0. Changes to the theme list (read first)

Keeping T1 to T4 and the ids as given, with two warnings and one recommendation.

1. T1 outgrown-site-builder and T2 studio-booking-software are the same cluster for organic search. Both are "my booking setup has outgrown what I have", both lean on Playday, and a Wix user shopping for booking software types the same words as one shopping for studio booking software. If the two pages differ only in the first paragraph, Google's doorway policy applies (pages made to rank for similar queries that funnel to the same place). They are kept apart below only because the searcher differs: T1 is a person who already has a Wix or Squarespace site and wants to know whether to leave it; T2 is a person who is choosing a booking system and is open to anything. Each page gets its own proof angle and its own sections. If Alex will not write genuinely different copy for both, merge T1 into T2 for organic and keep T1 as an ads-only page set to noindex (allowed, but it wastes the chance to rank).
2. T4 made-to-measure-software is the broadest and the least winnable on head terms. It is the page that matters most for positioning, so it is kept, but its organic job is the long tail ("replace spreadsheets", "one system instead of Mailchimp and Google Docs"), not "custom software".
3. Recommendation: no new theme. A fifth page for "Australia" is a doorway risk and is not needed; location signals go in the copy of every page (New York, United States and Australia).

## 0a. Update 2026-11-16 (later): search volumes from the ads plan

The ads planner ran 20 seodata.dev lookups today (US and Australia, source: Appendix A of docs/growth/google-ads-campaign-plan.md, third party estimates, not Google data) and sent me the results. What they change here:

1. The volumes are small. Every phrase this plan targets as a primary keyword has either no record in seodata ("wix bookings alternative", "custom booking software", "custom booking system", "custom app development for small business") or under 200 searches a month ("custom software for small business" 170, "class booking software" 110, "mindbody alternative" 170, "shopify marketing agency" 260, all US). "Not in database" means very low, not zero. So the organic prize on these pages is a handful of high intent visits a month, not traffic. That fits a consultant who needs a few calls a month, and it is why the pages must convert, not just rank.
2. LP-T1: the primary keyword "alternative to Wix Bookings" has no measured volume. The measured volume is builder shopping ("wix alternatives" 1,300, "squarespace alternatives" 1,000, "wix competitors" 480, US a month), and those searchers want another website builder, not Alex. Do not chase them with this page. Keep LP-T1 on the owner who wants to leave Wix because bookings outgrew it; volume will be small and the article (move off Wix without losing rankings) is the better entry point. The ads plan drops T1 from paid, so this page is organic only, with an ads sitelink.
3. LP-T2: camp software (1,900), camp registration software (880) and summer camp registration software (210) are real volumes, but they belong to off-the-shelf vendors with dedicated pages. Only worth a section on the page and one article if Alex wants camps, and Playday's camp features must be confirmed first. Left to organic, not bid on, as the ads planner also concluded.
4. LP-T3: "shopify seo expert, agency, services" is 1,600 a month in the US and "shopify seo consultant" 390, so my primary keyword "Shopify marketing consultant" may be the wrong head phrase. Add "Shopify SEO consultant" and "Shopify SEO expert" to the title, H1 and copy of LP-T3 after checking the SERP for them (not done; estimate: still high difficulty). Ads cover it too (US 1,600 at 12.76 USD for agency and services, but 60.95 USD for expert).
5. Ads need from the landing pages, now part of the build checklist: no #fragment URLs (the UTM suffix and gclid would land inside the fragment, so each page has its own path), no login gate, the booking widget embedded inline on every landing page (Calendly or Cal.com embed) plus a separate booking page for an ad sitelink. This makes the open question "which booking tool" a blocker for all four pages. Check that an embedded third party widget does not break the page speed constraints below (load it lazily below the first screen or after interaction).
6. Measured traffic to date, same source: GA4 property 478059970, 2026-08-18 to 2026-11-15, alexandergrant.app had 69 sessions and 1 organic search session. Treat any organic estimate as starting from zero.

7. Volumes for the exact phrases in section 3, US, seodata.dev public keyword pages checked 2026-11-16 (third party estimates). With a record: custom software for small business 170 a month (CPC 37.76 USD, competition 0.12, record updated 2026-07-19); shopify seo consultant 390; shopify marketing agency 260 (40.25 USD); shopify marketing services 70. No record (very low volume or not tracked, not zero) for: alternative to wix bookings, wix bookings limitations, move off wix without losing seo, custom booking software for studios, birthday party booking system for art studio, shopify marketing consultant, shopify collection page seo, replace spreadsheets with software. Google autocomplete only (no volume): wix bookings alternative, wix website limitations, wix seo limitations, birthday party booking software. Consequence: LP-T1, LP-T2 and the articles are plays for a handful of searches, so their value is high intent and positioning, and "Shopify marketing consultant" as primary for LP-T3 is unmeasured; "Shopify SEO consultant" (390) is the better measured head phrase for that page.

## 1. What is real data and what is estimate

Real data, all read today (2026-11-16):

1. Search Console, sc-domain:alexandergrant.app is available to the service account (owner). Page report 2026-08-16 to 2026-11-16: one page, https://alexandergrant.app/, 1 click, 18 impressions, average position 6.4. The query report for the same range and for 2026-10-17 to 2026-11-16 returned nothing (Search Console hides rare queries), so I cannot say which query the 18 impressions came from.
2. URL inspection of / on 2026-11-16: submitted and indexed, Google canonical https://alexandergrant.app/, last crawl 2026-11-04, crawled as mobile. Referring URLs include schedule.balispiritfestival.com, so at least one client site links to it.
3. Code read: src/app/layout.tsx (one site wide title and description, no canonical, no JSON-LD anywhere in src), src/app/sitemap.ts (5 URLs: /, /resources, /sms, /privacy, /terms), src/app/robots.ts (disallows /dashboard and /api), src/app/page.tsx (one long page, H1 "I help independent shops sell more.", six chapters, GA4 loads in production only).
4. Search results for the four primary phrases (section 3), read through the WebSearch tool.

Not real data, treat as estimates:

1. Search volumes. I have no Keyword Planner or third party volume tool in this session, and Search Console has no history for these queries. Every difficulty and timing figure below is my judgement from the shape of the results page, not a measurement. The Google Ads agent can get volumes from Keyword Planner; check them there before committing to a keyword.
2. WebSearch is not Google (lesson 2026-10-27, teddycalls). It is not localised to New York or Australia and not personalised. Treat the competitor lists as a sample, and re-check each primary keyword in a normal Chrome window before the pages ship.
3. Ranking targets and timelines are estimates, labelled as such.

## 2. Where the domain stands, and what "top page rank" can mean

Honest read: alexandergrant.app is effectively a new site in Google's eyes. 18 impressions in 90 days means Google barely shows it for anything today. It has no content pages (the homepage is one long page about the whole business), no structured data, and a title tag that still says "Growth Partner for Independent Retailers", which does not mention software, booking, Wix or Shopify at all.

What is not achievable: page one for "custom booking software", "Shopify marketing agency" or "custom software for small business" inside six months. Those results are filled by established vendors, agencies and directories (section 3), many with years of links. Nobody can promise it, and I will not.

What is achievable, estimates:

1. Page one (positions 1 to 10) for Alex's own name and brand queries: days to weeks once crawled. High confidence.
2. Page one for specific long tail phrases with few good pages, such as "alternative to Wix bookings for class studios" or "move off Wix without losing Google rankings": 3 to 6 months after the page and its supporting article are indexed. Roughly even odds per phrase. Estimate.
3. Positions 11 to 30 on the mid-tail primary keywords in the same window, which brings impressions but few clicks. Estimate.
4. Head terms: 12 months or more, and only with outside links and case studies that other sites cite. Not planned for.

The fastest real lever is not rankings, it is paid search for the terms organic cannot win (section 4) while the organic pages age.

Two things that will move the needle more than any single page: (a) links to these pages from the client sites Alex built (Playday, Find Yoga, Bali Spirit, TRNZK and Adventureline footers, "Site by Alex Grant", only where the client agrees and the link is a normal editorial credit, not a link scheme); (b) a Google Business Profile for the New York consultancy, if Alex has a service area business address he is willing to use. Both are decisions for Alex (section 8).

## 3. Page profiles

Shared rules for all four pages:

1. Primary action: book a 15 minute call. Secondary: message via WhatsApp or form (WhatsAppForm.tsx). There is no booking tool in the repo (no Cal.com, Calendly or similar found), so the call link target is an open question (section 8). Both buttons appear above the fold, after the proof section, and at the foot.
2. Proof: only the client approved figures from the brief. No other numbers, no invented costs, no testimonials unless Alex has real ones.
3. Server rendered, text in the HTML, no hero video, no carousel hiding content. One H1, plain H2s.
4. Each page has its own proof screenshot or short walkthrough of a real client, not stock art.
5. No FAQ markup (Google stopped showing FAQ rich results in May 2026, see best-practices.md section 8). Plain on-page questions are fine.
6. Copy rule: say what the product does today. Check each claim with Alex before it ships.

### LP-T1 outgrown-site-builder

URL: /wix-booking-alternative

The searcher and what they typed: a studio, school or activity owner whose Wix or Squarespace site takes bookings but is straining (double bookings, manual payments, no automation, parents emailing to change dates). Typed: "alternative to wix bookings", "wix bookings not good enough", "outgrown wix", "wix booking limitations", "move off wix", "squarespace scheduling alternative".

Primary organic keyword: alternative to Wix Bookings (estimate, check volume in Keyword Planner).
Secondary: outgrown Wix website; Wix Bookings limitations; move off Wix without losing SEO; Squarespace booking alternative; replace Wix with custom website.

Title tag (58 characters): Outgrown Wix Bookings? A Custom Booking Site | Alex Grant
Meta description (about 150): When Wix or Squarespace can no longer handle your bookings, I build a system around how you already work. Built for Playday, 8 studios live. Book a 15 minute call.
H1: When your Wix site can no longer run your bookings

Outline, section by section:

1. Hero. Job: confirm the problem in the visitor's words, show the two actions. One sentence on what changes (one system, built around how you already run classes, staff do not relearn their job). Buttons: "Book a 15 minute call" and "Message me on WhatsApp".
2. Signs you have outgrown it. Job: self-qualify, and match long tail queries. Five to six plain bullets (bookings and payments live in different places, staff retype data, parents cannot manage their own bookings, you pay for apps to patch gaps). Do not claim Wix limits that are not true; check each against current Wix documentation before publishing.
3. What I replace it with. Job: explain "made to measure" concretely: bookings, payments, invoicing, automated follow-up, in one system, built from your current process.
4. Proof, Playday. Job: the credibility block. Figures allowed: replaced a Wix site with a booking platform for a chain of children's art studios; bookings, Square payments, invoicing, automated follow-up; 8 studios live; 30,844 users since the August launch. Link to playday.com (new tab, noopener). Do not add the 760 children or the 35 families figures unless Alex re-confirms them for this page (they are on the homepage).
5. What about my Google rankings? Job: remove the biggest fear of leaving Wix. Redirects mapped page for page before launch. Only say Alex did this for Playday after he confirms it (the playday SEO notes show old Wix domains redirect page for page, but that is not on the client approved list).
6. How it works. Job: three steps (call, I look at how you work now, I build and you go live studio by studio). No prices unless Alex gives a range.
7. Closing call to action. Same two buttons, one line of reassurance (honest answer if I am not the right fit, which the homepage already promises).

Call to action wording: "Book a 15 minute call" (primary), "Message me on WhatsApp" (secondary).

Structured data: Organization and Person for Alex on the homepage only (once, see section 6). On this page: BreadcrumbList (Home, Wix booking alternative). No Service or FAQ markup needed. No review or rating markup (self-owned reviews cannot earn stars, and there are none).

Internal links: from the homepage Playday chapter ("Read how a Wix site became a booking platform") and from the homepage services section; to /custom-booking-software-for-studios, the Wix migration article, and back to the homepage in the footer. From the Playday client card on the homepage.

Who ranks now (WebSearch sample for "outgrown wix booking system custom alternative", 2026-11-16): Pembee blog ("best wix booking system"), Capterra's Wix Bookings listing, Wix Studio forum threads, Beyonk (two "alternative to a Wix booking plugin" pages), Koalendar's Wix booking alternative page, Fiverr gigs for Wix booking builds, websitebuilderinsider. A second search for "when to move off Wix" returned mostly agency blog posts on cheap domains (eseospace.com, pages.dev sites), which is a sign the custom-build angle is less defended than the software angle.
Difficulty, estimate: medium for "alternative to Wix Bookings" (vendors with real pages and a Capterra listing), lower for the "move off Wix" and "outgrown" long tail where the results are thin agency posts. Realistic target: first page for two or three long tail phrases within 3 to 6 months (estimate); the head phrase stays on page two or lower for the first year.

### LP-T2 studio-booking-software

URL: /custom-booking-software-for-studios

The searcher: an owner or manager of a studio, class business, camp, or party venue comparing booking software, often fed up with a monthly fee per feature. Typed: "booking software for art studio", "class booking system for studios", "camp registration software", "birthday party booking software", "mindbody alternative" (competitor names only if Alex wants to be in that fight, see articles).

Primary organic keyword: custom booking software for studios (estimate, low volume; the phrase "booking software for studios" is likely higher but off-the-shelf vendors own it).
Secondary: class booking system custom built; camp registration system for activity business; party booking system with deposits; membership booking software alternative.

Title tag (60): Custom Booking Software for Studios and Classes | Alex Grant
Meta description: Class, camp, party and membership booking built around how your studio already runs. Live at Playday (8 studios) and TRNZK sewing school. Book a 15 minute call.
H1: Booking software built around how your studio already runs

Outline:

1. Hero. Job: say plainly who it is for (studios, camps, party venues, class businesses) and what is different (built to measure, not another subscription to learn). Two buttons.
2. Off the shelf versus made to measure. Job: honest comparison for someone choosing. When a ready-made product is the right answer (small studio, simple classes) and when it is not (your process does not fit, you pay per feature, you want parents to book their own dates). This honesty is what makes it rankable and trustworthy. Name no competitor features here without checking them on the competitor's own site.
3. What a studio system can include. Job: classes and terms, camps, parties, memberships, payments, deposits, invoicing, automated follow-up. Only list what Alex has built (Playday: bookings, Square payments, invoicing, automated follow-up; TRNZK: term bookings with deposits and payment plans and class caps).
4. Proof, Playday and TRNZK, side by side. Playday figures: 8 studios live, 30,844 users since the August launch. TRNZK: term bookings with deposits and payment plans for a sewing school (the homepage says three terms booked, seven weekly slots; these are on the homepage but not on the brief list, confirm they are client approved before reuse). The owner changes dates each term and little else.
5. How it works and what you get. Job: three steps, plus what the client owns (confirm ownership and hosting terms with Alex before writing).
6. Closing call to action.

Structured data: BreadcrumbList. Optionally Service with provider Person and areaServed United States and Australia (no Google feature attaches, so low value; add only if cheap).

Internal links: from the homepage Playday chapter and the builds list (TRNZK entry); to LP-T1 and LP-T4; to the two supporting articles for this page.

Who ranks now ("custom booking software for art studio classes camps parties", 2026-11-16): ClassForKids, eSoft Planner, SuperSaaS, YouCanBook.me, Activity Messenger, SimplyBook, Koalendar, Pembee, Zenamu, Occasion, Anolla, BookItLive. These are all off-the-shelf products with dedicated landing pages per industry.
Difficulty, estimate: high for "booking software for art studios" and similar (many established vendors with a page per niche). Medium for the word "custom" and for "alternative" phrases because almost none of the results offer a built-to-order service. Realistic target: page one for "custom" long tails within 4 to 6 months (estimate, lower confidence than T1); stay out of the "best booking software" fight.

### LP-T3 shopify-growth

URL: /shopify-marketing-for-independent-stores

The searcher: the owner of a small Shopify store, usually the founder, who wants someone to run Google Ads, SEO and email together and show whether it worked. Typed: "shopify marketing consultant", "shopify google ads management", "shopify seo for small stores", "hire someone to run my shopify ads".

Primary organic keyword: Shopify SEO consultant (390 a month US, seodata.dev, checked 2026-11-16). Changed 2026-11-16 from "Shopify marketing consultant", which has no measured volume. SERP checked the same day (WebSearch sample): Shero commerce, Ignite SEO, SEOProfy, Promodo, a Clutch profile, Upwork and Fiverr gigs, listicles (pingenerator, pctechmag). Same kind of competitor as before, not clearly harder, and almost all are agencies, so a named solo consultant with one real store is a gap. Estimate: medium to high difficulty.
Secondary: Shopify marketing consultant; Shopify SEO expert; Shopify Google Ads management; Shopify SEO for small stores; Shopify email marketing consultant; Shopify ads and SEO together.

Title tag (58): Shopify SEO Consultant: SEO, Ads and Email | Alex Grant
Meta description: One person for your Shopify store's Google and Meta ads, SEO and email. Adventureline: July sales up 69% year on year. Book a 15 minute call.
H1: A Shopify SEO consultant who also runs your ads and email

Outline:

1. Hero. Job: state the offer (one person runs Google and Meta ads, SEO and email, with a plain monthly report against your sales). Two buttons.
2. Why one person for all three. Job: ads, search and email share the same customers, so attribution and priorities should too. Mention honestly that the ad spend is paid to Google and Meta directly, separate from Alex's fee (the SERP sample shows this is standard and buyers look for it; confirm Alex's fee structure first).
3. Proof, Adventureline. Figures allowed: outdoor apparel store on Shopify; took over Google and Meta ads, SEO and email; July sales +69% year on year; July orders +84% year on year. Rewrote 22 collections and 57 products for search, and the 31 to 17 search position (July, year on year) and winter season sales +34% are on the homepage and approved there, but are not on the brief's list: confirm before reuse. Always say "year on year" and the month. Link adventureline.com.au.
4. What I do each month. Job: concrete list (campaign management, collection and product page rewrites, email flows and campaigns, a monthly report). Check against what Alex actually delivers.
5. Is it a fit? Job: honest qualifier (independent stores, not enterprise; what you need, such as Shopify and Google Merchant Center access). This filters wasted calls and reads as honest.
6. Closing call to action.

Structured data: BreadcrumbList. Service with areaServed is optional.

Internal links: from the homepage Adventureline chapter and the services section; to the Shopify supporting article; back to the homepage.

Who ranks now (WebSearch samples, 2026-11-16): agency service pages (Sherocommerce, Brenton Way, Blackbelt Commerce, Visionary Marketing, Digital Darts, Interodigital), blog checklists (Weboptic, Neal Schaffer, Perth Digital Edge), Fiverr and Upwork gigs, directories (DesignRush, Top Growth Marketing).
Difficulty, estimate: very high for "Shopify marketing agency", Shopify's own partner directory and listicles dominate. Medium to high for "Shopify marketing consultant". The one gap is a single person with one named store and real results. Realistic target: page one for niche long tails such as "shopify google ads and seo for small outdoor stores" or "shopify collection page seo" via the supporting article within 4 to 6 months (estimate), and positions 10 to 30 for "Shopify marketing consultant" in the first year. This is the page where paid search should carry most of the load.

### LP-T4 made-to-measure-software

URL: /custom-software-for-small-business

The searcher: an owner running the business on a patchwork (a Wix or Squarespace site, Google Docs, Mailchimp, spreadsheets) who has not yet decided what to do about it. Typed: "replace spreadsheets with custom software", "one system for my small business", "custom software for small business", "too many tools small business", "custom business management software".

Primary organic keyword: custom software for small business (estimate, high volume and high competition).
Secondary: replace spreadsheets with software; software that fits how we work; one system instead of many tools; custom business management software; small business software built to measure.

Title tag (59): Custom Software for Small Business, Made to Measure | Alex Grant
Meta description: Stop running your business across spreadsheets, Google Docs and Mailchimp. One system built around how you already work. Playday and Bali Spirit. Book a 15 minute call.
H1: One system built around how your business already works

Outline:

1. Hero. Job: name the patchwork the visitor recognises and promise the alternative. Two buttons.
2. The patchwork problem. Job: describe the cost of Wix or Squarespace plus Docs plus Mailchimp plus spreadsheets in plain terms (double entry, nothing talks to anything, one person holds the knowledge). Do not invent statistics.
3. What "made to measure" means. Job: the positioning in three steps: I watch how you work now, I build to match so staff do not relearn their job, I stay on to change it. Contrast with configuring someone else's software.
4. Proof, two examples. Playday (8 studios live, 30,844 users since the August launch). Bali Spirit Festival schedule app (replaced scheduling software that cost the festival over 7,000 dollars a year; the homepage also states 4,941 people during festival week, 450+ sessions and 8 minutes per visit, confirm approval before reuse).
5. What it does and does not suit. Job: honest limits (not a fit if an off-the-shelf tool already does the job; say so, the rankable and trustworthy angle). Link out to the T1 and T2 pages for the two commonest cases.
6. How it works and what it costs. Cost range only if Alex supplies one, because "how much does custom software cost" is a real query this page can own with a true answer.
7. Closing call to action.

Structured data: BreadcrumbList.

Internal links: the homepage "One person for the marketing and the software" chapter (about) and builds list; to LP-T1, LP-T2; from both of those back here as the broader option; to the spreadsheets and cost articles.

Who ranks now ("custom software for small business to replace spreadsheets", 2026-11-16): Upwork productised gigs, Velosio, DevSquad ("Custom Software for Small Businesses: A Complete 2026 Guide"), Emergent Software, Codestringers, Sandstorm IT, SCS Grand Rapids, and a long list of local dev shops and Medium posts.
Difficulty, estimate: high on "custom software for small business" (many dev shops with older domains), medium on the "replace spreadsheets" and "outgrown spreadsheets" phrasing where results are small agency blog posts. Realistic target: page one for two or three "replace spreadsheets" or "too many tools" long tails within 4 to 6 months (estimate); head term not targeted this year.

## 4. Paid versus organic, so the ads plan does not pay for what content can win

Principle (judgement, not data): pay for the terms where the searcher is ready to hire and organic cannot reach page one this year; win organically the informational and comparison phrases where a clear, honest page can beat thin agency posts.

Better paid first (organic unrealistic for 12 months or more):
1. shopify marketing agency, shopify google ads management, shopify ads agency (agencies, directories and Shopify's own partner pages own these).
2. custom booking software, booking software for studios, class booking software (vendors with a landing page per niche).
3. custom software development for small business (dev shops with older domains).
4. A brand defence ad on "alex grant" plus consultant terms only if a competitor starts bidding on the name; the organic homepage should win this alone.

Better organic first (do not pay, or pay only for testing):
1. alternative to wix bookings, wix bookings limitations, outgrown wix, move off wix without losing seo, squarespace scheduling alternative (informational, results are thin and vendor-biased, low conversion per paid click).
2. replace spreadsheets with software, one system instead of many tools, small business software tools too many (early research, wasteful in ads).
3. shopify collection page seo, shopify seo for small stores (only the article is worth building).
4. how much does custom booking or business software cost (once Alex gives a range).

Test in both (paid shows what converts, organic will take months): shopify marketing consultant, custom booking software for studios. Use the paid search terms report to feed the organic page copy, and read Search Console after 28 days.

Estimate caveat: this split is judgement from the results pages in section 3, not from volume or cost per click data. The ads agent should check Keyword Planner before locking it.

## 5. Supporting content (six items, each feeds one landing page)

Each article needs real substance from work Alex has actually done. Do not publish thin articles; Google's spam policy on scaled low value content applies. One article per month is enough.

1. Wix Bookings limits, and when a studio outgrows them. Target query: wix bookings limitations. Feeds LP-T1. Angle: practical signs, no bashing, verify every limit on Wix's own docs.
2. Moving off Wix without losing your Google rankings. Target query: move off wix without losing seo. Feeds LP-T1. Angle: the redirect map, what to inventory, what breaks. Strongest candidate to get a first page result because the competing results are agency sales posts.
3. Off the shelf booking software or a custom build? How a studio decides. Target query: custom booking software vs off the shelf for studios. Feeds LP-T2. Angle: decision checklist, honest about when not to build.
4. Birthday party and camp booking: deposits, room capacity and follow-up. Target query: birthday party booking system for art studio. Feeds LP-T2. Angle: workflow, only from features Playday actually runs (confirm with Alex, there is a /birthday route in this repo).
5. What I rewrote on 22 collections and 57 products for an outdoor store, and what moved. Target query: shopify collection page seo. Feeds LP-T3. Angle: a real, specific write-up from Adventureline, with the approved year on year figures only.
6. Signs your spreadsheets have outgrown your business, and what to replace them with. Target query: outgrown spreadsheets small business. Feeds LP-T4. Angle: checklist from real jobs (Bali Spirit schedule app replacing paid scheduling software).

Where they live: /guides/<slug>, one index at /guides, each article links to its landing page with descriptive anchor text, and the landing page links back to the article.

## 6. Technical checklist for the build

Read the Next.js metadata docs in node_modules/next/dist/docs/ before writing code, because the installed version may differ from memory (rule from the seo skill).

Metadata and canonical:
1. Each page exports its own metadata (title, description, alternates.canonical as an absolute https://alexandergrant.app/<path>, openGraph with a real image, twitter card). The layout currently sets none of canonical or Open Graph.
2. Update the homepage title and description. The current title ("Growth Partner for Independent Retailers") predates the "software made to measure" positioning. Suggested: Alexander Grant | Ads, SEO, Email and Software Made to Measure. Needs Alex's sign off because it changes how the brand reads in Google.
3. One canonical host, https://alexandergrant.app (www 308s to apex, confirmed in sites.md). Use absolute canonicals so any preview or stray host cannot become the indexed copy.

Sitemap and robots:
1. Add the four paths and /guides plus articles to PUBLIC_PATHS in src/app/sitemap.ts. Add lastmod from the real edit date, not the build date.
2. Do not list any /portal, /dashboard, /birthday or /health-records URL. /health-records is a new untracked route in git status; check it is not indexable before it ships (this is a flag, I have not read it).
3. robots.ts needs no change.
4. Do not request indexing or submit the sitemap until Alex approves. After deploy: inspect each new URL after a week (a fresh page shows "URL is unknown to Google" for days).

Structured data:
1. Homepage only: Organization (or ProfessionalService) with name, url, logo, and sameAs for real profiles, plus Person for Alex, and WebSite with the site name. There is no JSON-LD anywhere today.
2. Landing pages: BreadcrumbList. No FAQ, HowTo, Review or AggregateRating markup.
3. JSON-LD as a script tag in the server component, content matches the visible page.

Page speed and rendering:
1. Landing pages are server components with the content in the first HTML response. No client-only rendering of copy.
2. The homepage uses a hero video and an inline style block; landing pages should not. Use one compressed image, explicit width and height, loading priority on the LCP image only, no autoplay video.
3. Fonts: layout.tsx loads Besley and Libre Franklin from Google Fonts with a link tag, which blocks rendering on slow connections. Move to next/font for the landing pages or the whole site. This is a real mobile LCP risk for paid traffic.
4. Ad clicks land on mobile first; test each page on a mid range phone profile. Core Web Vitals are a tie-breaker for ranking, not a lever, but slow pages cost paid conversions directly. Lighthouse locally (the PageSpeed Insights quota is shared and often exhausted, see sites.md).

Booking flow (decided by the lead 2026-11-16, closes the call link question): in house, a reusable component embedded inline on each landing page and at /book, with /book/thanks firing book_call. Keep /book and /book/thanks out of the sitemap and set them noindex (the thanks page is a conversion page, not a search landing page); keep /book itself indexable only if Alex wants it to rank, which I do not recommend. Embed it below the first screen and keep its JavaScript out of the first load for page speed.

Analytics:
1. generate_lead currently fires only from the WhatsApp send button. Add a distinct event for the call booking click (for example book_call) with the page path, and mark it a GA4 key event, so organic landing pages can be tied to calls. Conversion import into Google Ads is for the ads agent, and should start as secondary.
2. GA4 property 478059970 also holds other streams (Power the Tribe, Art Hub Online); filter by hostName alexandergrant.app in every report.

Avoiding cannibalisation of the homepage, and avoiding doorway pages:
1. The homepage keeps brand, "growth partner", and the overall pitch. Each landing page owns one intent: Wix exit, studio booking, Shopify marketing, spreadsheets and tools. No landing page title repeats the homepage title pattern or its H1.
2. One URL per intent. Ad traffic goes to the same indexable URL as organic, with UTM and gclid parameters. Do not make a second, near identical copy of a page for ads and noindex it; if the ads agent needs message matching, change the visible headline through the page itself or build a distinct page with distinct copy.
3. Parameter URLs: canonical always points at the clean path so UTM variants do not split signals.
4. Internal links use descriptive anchors that match the page's intent, one landing page per anchor. Do not point two different anchors with the same words at two different pages.
5. The homepage should link down to each landing page (services chapter and case chapters), and each landing page should link up and across.
6. /resources is an unrelated "Agentic Skills Resources" page (dark theme, force-dynamic, different brand). It sits in the sitemap and could blur what the site is about. Recommend Alex decide whether it stays indexed (open question, I recommend noindex only with his approval; not changed).

## 7. Order of work

1. Now: decide the booking link and the open questions below; fix the homepage title and description.
2. Next: build LP-T2 and LP-T4 first (broadest ad value) and LP-T1 and LP-T3 after, because the ad groups need them live; organic work starts the day they are indexed.
3. Then: one supporting article a month, in this order: 2, 5, 1, 6, 3, 4.
4. Reviews: 2026-12-14 (indexing check on each URL, first impressions), 2027-01-18 (28 days of query data, quick wins, title tests), 2027-03-15 (the three to four month read against the targets above).

## 8. Open questions for Alex

1. Closed 2026-11-16: the booking flow is in house (see build checklist). Original question: where does "Book a 15 minute call" go? No booking tool existed in the repo, and the ads plan needs it embedded inline on every landing page plus a standalone booking page. Which tool (Calendly or Cal.com), and who sets it up with a GA4 event? This blocks all four pages.
2. Which extra figures are client approved? Not on the brief but on the homepage: Playday 760 children and 35 families; Adventureline winter season sales +34%, search position 31 to 17, 22 collections and 57 products; Bali Spirit 4,941 users, 450+ sessions, 8 minutes; TRNZK three terms and seven weekly slots.
3. Prices. Can I use a "from" figure or typical range for builds and monthly retainers? "How much does it cost" is a real query and an honest answer ranks.
4. Can the five client sites carry a small "Site by Alex Grant" link to the matching landing page? It is the most useful link the site can get, but each client must agree.
5. Will Alex write or approve genuinely different copy for LP-T1 and LP-T2? If not, merge them for organic (section 0).
6. Does Alex want a Google Business Profile for the New York consultancy, and is a service area address acceptable?
7. May the homepage title and description change to the made to measure positioning?
8. Does /resources stay indexed? It is off brand for this audience.
9. Does Alex want to compete by name against Mindbody, Acuity and similar in the comparison articles? It brings traffic but needs fact checks and has some legal and reputational risk.
10. Which markets lead, United States or Australia? It changes the spelling and phrase choices ("studio" or "class business", "consultant" or "freelancer") and whether Search Console should be read by country.

## 9. Not doing

1. A page per city or per studio type with only the nouns swapped (doorway pages).
2. Mass AI written articles or comparison pages.
3. FAQ or review markup, fake or incentivised reviews, bought links.
4. Targeting "Shopify marketing agency", "best booking software" or "custom software" as organic head terms this year.
5. llms.txt, per best-practices.md section 11 (no evidence it helps).
