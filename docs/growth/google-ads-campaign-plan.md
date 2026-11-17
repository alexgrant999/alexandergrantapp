# Google Ads plan: first Search test for alexandergrant.app

Written 2026-11-16 by the ads agent. Planning only. No Google Ads account was created, changed or paused, nothing was spent, and no secret values are printed here. Read-only checks used the python google-ads library (v25) with ~/google-ads.yaml.

## Theme changes against the contract (read this first)

- T1 outgrown-site-builder: dropped from paid search. No ad group, no keywords. LP-T1 stays as an organic page and as one sitelink, and its buyer story ("replaced a Wix site") moves into the T4 and T2 ads. Reason in section 2.
- T2 studio-booking-software: kept, narrowed to "custom booking" and kids class, party and class booking phrases. It shares a campaign with T4.
- T3 shopify-growth: kept. Runs in the United States and Australia.
- T4 made-to-measure-software: kept. Lead ad group of the software campaign.
- No theme added.

## Recommendation in brief

1. Two Search campaigns, exact match only, built paused: "AG Software, US" (T4 and T2) and "AG Shopify growth, US and AU" (T3).
2. Geo: United States for software, United States plus Australia for Shopify. Presence only. Not New York metro alone (too little volume).
3. Budget: 25 USD per day per campaign, 50 USD per day in total, for six weeks. Maximum spend about 2,100 USD.
4. Bidding: Maximize Clicks with a CPC cap (35 USD software, 25 USD Shopify) for the whole test. Smart Bidding is not realistic at the expected conversion count.
5. Launch Monday 2027-01-04, not before the holidays. Thanksgiving is 2026-11-26 and Cyber Monday 2026-11-30.
6. Primary conversion: a booked free 15 minute call, fired by the Google Ads tag on /book/thanks in the app's own booking flow, as a coded event with the booking ID. WhatsApp form submits are secondary.
7. Strongest keywords: [shopify seo agency] (1,600 searches per month, CPC 12.76 USD), [custom software for small business] (170, 37.76 USD), [shopify marketing agency] (260, 40.25 USD). All from seodata.dev, see section 1.
8. Expect 70 to 130 clicks and 3 to 10 contacts over six weeks (estimate). Enough to learn whether qualified owners book calls. Not enough to price a client.
9. Stop rule: 1,000 USD spent with no qualified conversation pauses both campaigns.
10. Alex has to create the account, add billing and start advertiser verification before anything can be built (section 8).

## 1. What is real data and what is estimate

| Source | What it gave | Status |
|---|---|---|
| Google Ads Keyword Planner through the API (GenerateKeywordIdeas) | Nothing. Refused on 2026-11-16 with DEVELOPER_TOKEN_NOT_APPROVED, "not allowed for use with explorer access". | Not available |
| seodata.dev MCP (lookup_keyword, lookup_keywords), anonymous | Monthly search volume, a CPC and competition for 20 seed keywords in the US and Australia, plus about 10 similar keywords per seed with their own volume and CPC. Full table in Appendix A. | Real third-party data. The service states its figures are Google search volume data; one record showed updated_at 2026-07-19. |
| Google autocomplete (suggestqueries.google.com, gl=us and gl=au) | Which phrasings people actually type. No volumes. Appendix B. | Real, but proves existence only |
| WordStream and LocaliQ 2026 benchmarks (13,000 campaigns, April 2025 to March 2026) | Business Services: CTR 6.10 percent, CPC 5.87 USD, conversion rate 4.85 percent, cost per lead 93.69 USD | Real industry averages, not this market |
| GA4 property 478059970, 2026-08-18 to 2026-11-15 | alexandergrant.app: 69 sessions, 43 users, 1 organic search session, 0 generate_lead events | Real |
| Google Ads API, list_accessible_customers and customer_client | No account exists for the consulting business | Real |
| US Census vintage 2024 | New York metro 19.94 million of 340.1 million people, about 5.9 percent | Real, but population, not search data |

How to read the seodata figures:
- Searches per month are averages. Similar keywords often share one figure (for example 1,600 for shopify seo agency, services and expert) because Google groups close variants. Do not add them up.
- The CPC is a single figure whose exact definition (average CPC or top of page bid) the service does not document. Treat it as a rough price level. Some values are clearly noise (shopify seo company in Australia at 441.18 USD).
- "Not in database" means the service has no record, not that nobody searches it.
- The anonymous quota is 20 lookups a day per IP. All 20 were used today, shared with the SEO agent; raw JSON is in the session scratchpad folder ads/seodata.

Everything else in this plan that is a number and is not in the table above is an estimate, and is labelled as one where it appears.

## 2. Verdict per theme

The going-in view was that broad terms are too crowded and expensive, and that the campaign should bid on narrow searches from people who have outgrown a specific tool. The data supports the first half and contradicts the second.

- Broad terms are too expensive. "custom software development" has 3,600 searches per month at 67.28 USD, "custom software development company" 3,600 at 48.57 USD. At 25 USD per day that is under one click a day, from buyers who mostly want an outsourcing firm. "marketing agency for small business" has 2,400 at 20.89 USD and its variants 1,900 at 23.28 to 35.66 USD. Cheaper per click, but generic agency shopping with nothing in it that Alex's proof answers.
- The "outgrown a tool" searches barely exist as typed phrases. Autocomplete returns nothing at all for "outgrown wix", "outgrown squarespace", "outgrown mindbody", "outgrown spreadsheets" or "outgrown airtable". seodata has no record for "wix bookings alternative", "custom booking system", "custom booking software", "custom crm for small business" or "custom app development for small business".
- The tool-alternative searches that do have volume come from people shopping for another subscription product, not hiring someone: "wix alternatives" 1,300 at 12.25 USD, "squarespace alternatives" 1,000 at 10.93 USD, "mindbody alternatives" 170 at 28.01 USD, "class scheduling app" 480 at 10.11 USD. Autocomplete for "moving from wix to" ends in squarespace, shopify, wordpress, godaddy and hostinger.
- The ground that works is in the middle: hire-intent phrases that name the platform or the business size, such as "shopify seo agency", "shopify marketing agency" and "custom software for small business".

| Theme | Verdict | Evidence | Decision |
|---|---|---|---|
| T1 outgrown-site-builder | Not viable for paid search | No autocomplete for "outgrown wix" or "outgrown squarespace". The volume sits in builder shopping: wix alternatives 1,300 at 12.25 USD, squarespace alternatives 1,000 at 10.93 USD, wix competitors 480. The hire-intent cluster "wix developer" (390 at 39.16 USD, wix developers 480 at 37.90 USD) is people paying for Wix work, so they want to stay on Wix. | Drop from paid. Keep LP-T1 for organic and as a sitelink. Possible later test: "wix developer" with a "before you pay for more Wix work" angle. |
| T2 studio-booking-software | Marginal; test small | class booking software 110 at 47.62 USD, booking system for classes and class booking system 90 at 25.79 USD. Kids and party phrases are typed (autocomplete: "booking system for kids classes", "kids class booking system", "birthday party booking software") but have no volume record. Most of these searchers expect a monthly app, so ads must filter for studios that have outgrown one. | Keep as a small exact-match ad group inside the software campaign. Expect several keywords to come back RARELY_SERVED. |
| T3 shopify-growth | Viable; the largest pool | US: shopify seo agency and shopify seo services 1,600 at 12.76 USD, shopify seo expert 1,600 at 60.95 USD, shopify seo consultant 390, shopify marketing agency 260 at 40.25 USD. Australia: shopify seo expert 110 at 9.53 USD. "shopify google ads agency", "shopify meta ads agency" and "shopify email marketing agency" are typed. Crowded with agencies, but the clearest hire intent of the four themes, and Adventureline is direct proof. | Keep. US and Australia in one campaign. |
| T4 made-to-measure-software | Viable but thin and expensive | custom software for small business 170 at 37.76 USD, custom small business software 140 at 33.79 USD, software development for small business 140 at 14.07 USD, small business custom software development 140 at 97.13 USD, small business software developers 30 at 42.79 USD. | Keep as the lead ad group of the software campaign. Volume, not budget, will limit it. |

Keyword Planner volumes are national. New York metro holds about 5.9 percent of the US population, so a New York-only campaign would see roughly 10 searches a month for "custom software for small business" (estimate by population share). Past campaigns showed what happens at that level: on AcuApp 21 of 43 launch keywords came back RARELY_SERVED, and on Teddy 11 of 22.

## 3. Campaign structure

### 3.1 Account

No Google Ads account exists for the consulting business. Checked 2026-11-16: the token sees 14 customer IDs. The manager "Alexandergrantapp" 838-154-4517 is a manager account and cannot run campaigns. Under it sits only Adventureline 634-509-1429. The other readable accounts are AcuApp, PLAYDAY, Teddy Calls and one cancelled account; eight more answer CUSTOMER_NOT_ENABLED. The API cannot create the account at Explorer access, so Alex creates it in the UI under the manager (section 8). Settings: name Alexander Grant, currency USD (Australian clicks are billed in USD too), time zone America/New_York.

### 3.2 Campaign settings

| Setting | AG Software, US | AG Shopify growth, US and AU |
|---|---|---|
| Ad groups | T4 made-to-measure software, T2 studio booking software | T3 Shopify growth |
| Status at build | Paused (campaign and ad groups) | Paused (campaign and ad groups) |
| Budget | 25 USD per day (25,000,000 micros) | 25 USD per day (25,000,000 micros) |
| Bidding | Maximize Clicks, CPC cap 35 USD | Maximize Clicks, CPC cap 25 USD |
| Networks | Google Search only. Search partners off, Display off | Same |
| AI Max | Off. Text customization and final URL expansion opted out | Same |
| Locations | United States, presence only | United States and Australia, presence only |
| Language | English | English |
| Ad schedule and devices | All hours, all devices, no adjustments | Same |
| Final URL suffix | utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_content={_adgroup}&utm_term={keyword} | Same |
| Custom parameters | campaign=ag-software-us; adgroup=t4-made-to-measure, t2-studio-booking | campaign=ag-shopify-us-au; adgroup=t3-shopify-growth |
| Auto-tagging | On (account) | On (account) |
| Conversion goal | Account default: Book appointment (primary) | Same |
| EU political advertising | Does not contain | Same |
| Negative lists | AG master negatives, AG software negatives | AG master negatives, AG Shopify negatives |

Why two campaigns and not one: in one campaign, Maximize Clicks would spend almost everything on T3, whose clicks cost 12 to 25 USD, and leave T4 and T2 (25 to 48 USD) with no impressions. T4 is the positioning the business is built on, so it gets its own budget. The two services also have different buyers, prices and proof, and they need to be read separately.

Why Australia is in the Shopify campaign only: Shopify clicks there cost about a sixth of the US price (shopify seo expert 9.53 USD in Australia against 60.95 USD in the US). Adventureline is an Australian store, and Alex already serves Australian clients. For software, the only Australian data is the enterprise head ("custom software development", 260 searches at 22.78 USD; "custom software developers", 70 at 99.22 USD), with no small-business phrasing found, so it stays out of the first test. The location report will show the US and Australian split. If Australia takes more than half the clicks without producing calls, split it into its own campaign then.

Landing pages and URLs: each ad group's final URL is its LP. The SEO agent's paths, agreed 2026-11-16 (docs/growth/landing-page-seo-plan.md):

| LP | Path | Used by |
|---|---|---|
| LP-T1 | https://alexandergrant.app/wix-booking-alternative | Software campaign sitelink only (organic page) |
| LP-T2 | https://alexandergrant.app/custom-booking-software-for-studios | T2 ad group final URL, sitelinks |
| LP-T3 | https://alexandergrant.app/shopify-marketing-for-independent-stores | T3 ad group final URL, sitelink |
| LP-T4 | https://alexandergrant.app/custom-software-for-small-business | T4 ad group final URL, sitelinks |
| BOOK | https://alexandergrant.app/book (the app's own booking flow, ported from Teddy Calls; confirmation at /book/thanks?b=bookingId) | Sitelinks, and the call to action on every LP |

None of these pages exist yet (the current sitemap lists /, /resources, /sms, /privacy and /terms), so the build waits on them. Sitelinks also use the homepage (HOME). Rules from past accounts: no #fragments in any final URL, because the suffix and gclid land inside the fragment. Use a separate page or a ?s= query parameter instead. No login-gated paths, and /book must stay public. Every LP carries a "Book a free 15 minute call" button to /book above the fold and the WhatsApp form lower down. The www to apex redirect already returns 308 and keeps the query string (checked 2026-11-16).

### 3.3 Ad groups and exact match keywords

Searches per month and CPC from seodata.dev (US unless marked AU). "Autocomplete only" means the phrase is typed but has no volume record. Every keyword is exact match.

Ad group T4 made-to-measure software (final URL LP-T4)
[custom software for small business] | 170 | 37.76
[small business custom software] | 170 | 37.76
[custom small business software] | 140 | 33.79
[custom software development for small business] | 140 | no CPC in data
[small business custom software development] | 140 | 97.13
[software development for small business] | 140 | 14.07
[small business software development] | 140 | 9.78
[small business software developers] | 30 | 42.79
[custom crm for small business] | not in database, autocomplete only
[custom business software] | not looked up, autocomplete only

Ad group T2 studio booking software (final URL LP-T2)
[custom booking system] | not in database, autocomplete only
[custom booking software] | not in database, autocomplete only
[custom booking website] | not looked up, autocomplete only
[class booking software] | 110 | 47.62
[booking system for classes] | 90 | 25.79
[class booking system] | 90 | 25.79
[booking system for kids classes] | not looked up, autocomplete only
[kids class booking system] | not looked up, autocomplete only
[birthday party booking software] | not looked up, autocomplete only
[birthday party booking system] | not looked up, autocomplete only
[studio booking software] | not looked up, autocomplete only

Ad group T3 Shopify growth (final URL LP-T3)
[shopify seo agency] | 1,600 | 12.76
[shopify seo services] | 1,600 | 12.76; AU 110, no CPC in data
[shopify seo expert] | 1,600 | 60.95; AU 110 | 9.53
[shopify seo consultant] | 390 | no CPC in data
[shopify seo company] | autocomplete US; AU 70 (CPC in data 441.18, treat as noise)
[shopify marketing agency] | 260 | 40.25
[shopify digital marketing agency] | 50 | 23.50
[shopify marketing services] | 70 | 22.27
[shopify advertising agency] | 40 | 28.97
[shopify ads agency] | 40 | 113.05 (the cap holds this to 25 USD)
[shopify google ads agency] | autocomplete only, US and AU
[shopify email marketing agency] | autocomplete only

Read system_serving_status on every keyword the day the build lands, and again at day 7. Pause anything RARELY_SERVED that is not the only keyword carrying its phrase.

### 3.4 Keywords held back, and which belong to organic search

| Keyword or cluster | Data | Why not paid now | Better won by |
|---|---|---|---|
| custom software development, custom software development company | 3,600 at 67.28 and 48.57 USD | Enterprise outsourcing intent, under one click a day at this budget | Neither; not Alex's buyer |
| marketing agency for small business and variants | 2,400 at 20.89 USD; 1,900 at 23.28 to 35.66 USD | Generic agency shopping, crowded, no proof match | Neither |
| wix alternatives, squarespace alternatives, wix competitors, sites like wix | 1,300, 1,000, 480, 320 at 9 to 13 USD | DIY builder shoppers | Organic: an honest "when a site builder stops being enough" page on LP-T1 |
| wix developer, wix developers, web developer wix | 390 to 590 at 18 to 39 USD | Want Wix work done | Later paid test once T4 has a read |
| mindbody alternatives, mindbody competitors | 170 at 28.01 USD, 260 at 51.50 USD | Subscription shoppers; Playday never ran on Mindbody, so there is no migration proof | Organic comparison article |
| camp software, camp registration software, summer camp registration software | 1,900 at 25.09, 880 at 35.64, 210 at 48.95 USD | Subscription shoppers, expensive | Organic, or a later T2 expansion |
| class scheduling app | 480 at 10.11 USD | App shoppers | Neither |
| klaviyo agency, klaviyo email marketing agency | 170 at 51.79, 210 at 46.75 USD | Adventureline's email ran on Mailchimp (Klaviyo was only discussed), so there is no Klaviyo proof | Neither until there is Klaviyo work to cite |
| shopify google ads, google ads for shopify | 320 at 40.61 and 29.82 USD | Mostly do-it-yourself setup intent (autocomplete: conversion tracking, integration, app, credit, tag) | Organic how-to content that points to LP-T3 |
| how much does custom software cost | autocomplete only | Research intent. The site publishes no prices, so the ad would disappoint | Organic, if Alex will publish a range |

### 3.5 Negative keyword lists

Three shared lists. Phrase match unless shown in brackets. With exact-match keywords these are mostly a safety net against close variants. They become essential if broad match is ever tried. Checked by script: none of them blocks any keyword above.

AG master negatives (both campaigns, 120)
Jobs: "jobs", "job", "career", "careers", "salary", "salaries", "hiring", "internship", "intern", "resume", "remote jobs", "work from home"
Learning and do it yourself: "course", "courses", "tutorial", "tutorials", "how to", "learn", "learning", "training", "certification", "certificate", "degree", "bootcamp", "youtube", "udemy", "coursera", "for beginners", "template", "templates", "theme", "themes", "checklist", "pdf", "examples", "sample"
Price and marketplaces: "free", "cheap", "cheapest", "open source", "github", "download", "apk", "fiverr", "upwork"
Wrong country: "india", "indian", "pakistan", "bangladesh", "philippines", "nigeria", "dubai", "uae", "uk", "united kingdom", "london", "canada", "toronto", "singapore"
Support and login: "login", "log in", "sign in", "customer service", "customer support", "phone number", "contact number"
Off topic, from autocomplete: "roblox", "minecraft", "game", "games", "kindle", "tesla", "router", "3ds", "ipod", "kobo", "custom pc", "windows", "tattoo", "recording", "music studio", "abbey road", "hotel", "hotels", "booking.com", "airbnb", "restaurant", "salon", "salons", "hair", "hairdresser", "barber", "nail", "spa", "medical", "dental", "clinic", "doctor", "home affairs", "police", "visa", "flight", "flights", "car", "cars", "solar system"
Funding and own name: "grant", "grants", "loan", "loans", "funding"
Enterprise: "enterprise", "erp", "sap", "salesforce", "accenture", "deloitte", "ibm", "oracle", "fortune 500"

AG Shopify negatives (Shopify campaign, 26)
"app", "apps", "plugin", "plugins", "tool", "tools", "conversion tracking", "tracking", "integration", "tag", "pixel", "credit", "adsense", "partner program", "dropshipping", "dropship", "print on demand", "amazon", "etsy", "ebay", "wordpress", "woocommerce", "wix", "squarespace", "bigcommerce", "shopify plus"

AG software negatives (software campaign, 11)
"app builder", "no code", "nocode", "low code", "game development", "video game", "mobile game", "embedded", "firmware", "medical device", "government"

Note: "grant" also covers searches for Alex's own name, so brand searches stay out of the test's data. "clinic" and "spa" are judgment calls. Wellness businesses are part of Alex's world, so drop those two first if search terms show good prospects being blocked. Review the lists for over-blocking at week 4.

## 4. Responsive search ads

Two per ad group. Ad A pins one keyword headline to position 1. Ad B is unpinned, with shorter headlines in sentence case. Counts were computed by script, and every line is within 30 characters (headlines), 90 (descriptions) and 15 (paths). The checker also rejects em or en dashes, exclamation marks and superlatives.

Figures used, and where they come from (src/app/page.tsx heroTabs and case chapters): Playday replaced a Wix site with bookings, Square payments, invoicing and automated follow-up, 5 studios live, 26,235 people since the August launch. Adventureline: Google and Meta ads, SEO and email taken over, July sales up 69 percent and July orders up 84 percent year on year. Bali Spirit: replaced scheduling software that cost more than $7,000 a year. TRNZK: term bookings with deposits, payment plans and class caps. Features named (waitlists, QR check-in, reminders, one admin for every studio) are from the Playday case chapter. Ad strings keep "$" and "%" as on the site, because they are customer-facing copy.

The call is free (confirmed 2026-11-16), so ad A in each group and callout C4 say so. "free" stays a negative keyword: that blocks searches for free software, not the ad text.

Ad copy deliberately avoids:
- Any price, and any present-tense claim about running Adventureline's ads (the retainer has been parked since 2026-08-19, so the copy says "took over").
- Klaviyo.
- Any studio count above 5.

T4 made-to-measure software, final URL LP-T4

RSA T4-A (headline 1 pinned: Custom small business software)
H1 | Custom small business software | 30
H2 | Software made to measure | 24
H3 | Built around how you work | 25
H4 | One system, not ten tabs | 24
H5 | Replace the spreadsheets | 24
H6 | 5 studios run on one system | 27
H7 | Replaced a $7,000 a year tool | 29
H8 | Replaced a Wix site | 19
H9 | Bookings, invoices, payments | 28
H10 | Talk to the one who builds it | 29
H11 | Small business software | 23
H12 | Staff keep their routine | 24
H13 | Based in New York | 17
H14 | Book a free 15 minute call | 26
D1 | I build one system around how your business already runs, so nobody relearns their job. | 87
D2 | Bookings, payments, invoices and follow-up in one place, instead of Wix and spreadsheets. | 89
D3 | I replaced Playday's Wix site with a booking system 26,235 people have used since August. | 89
D4 | Book a 15 minute call. I will tell you plainly whether custom software is worth it. | 83
Path | custom-software / small-business | 15, 14

RSA T4-B (no pins)
H1 | Custom software | 15
H2 | Made to measure | 15
H3 | Fits how you work | 17
H4 | Leave the spreadsheets | 22
H5 | One system for it all | 21
H6 | Built for small teams | 21
H7 | Talk to the builder | 19
H8 | Bookings and invoicing | 22
H9 | 5 studios on one system | 23
H10 | Replaced a $7,000 a year tool | 29
H11 | Small business software | 23
H12 | Based in New York | 17
H13 | Book a 15 minute call | 21
D1 | Your business already has a way of working. I build the software to fit it. | 75
D2 | Wix, Google Docs, Mailchimp and spreadsheets, replaced by one system built for you. | 83
D3 | Bali Spirit Festival dropped software costing more than $7,000 a year for one I built. | 86
D4 | Start with a 15 minute call. If off-the-shelf software will do, I will say so. | 78
Path | made-to-measure / software | 15, 8

T2 studio booking software, final URL LP-T2

RSA T2-A (headline 1 pinned: Booking system for studios)
H1 | Booking system for studios | 26
H2 | Classes, camps and parties | 26
H3 | Memberships and class packs | 27
H4 | Payments, waitlists, reminders | 30
H5 | 5 studios on one system | 23
H6 | 26,235 users since August | 25
H7 | Replaced a Wix site | 19
H8 | Built around your studio | 24
H9 | One admin for every studio | 26
H10 | Term bookings and deposits | 26
H11 | Custom booking system | 21
H12 | Book a free 15 minute call | 26
D1 | Families book and pay online. Staff run every studio from one admin. | 68
D2 | Classes, camps, parties, class packs and memberships, with waitlists when a class fills. | 88
D3 | I built Playday's booking platform. 5 studios run on it, 26,235 people since August. | 84
D4 | For studios that have outgrown a booking app. Book a 15 minute call with me. | 76
Path | booking-system / studios | 14, 7

RSA T2-B (no pins)
H1 | Studio booking software | 23
H2 | Class booking system | 20
H3 | Party deposits and invoices | 27
H4 | Camps and class packs | 21
H5 | Waitlists when a class fills | 28
H6 | Text and email reminders | 24
H7 | QR check-in at the door | 23
H8 | 5 studios, one system | 21
H9 | 26,235 users since August | 25
H10 | Term bookings with deposits | 27
H11 | Made for your studio | 20
H12 | Book a 15 minute call | 21
D1 | Your booking system, built around how your studio already runs its classes and camps. | 85
D2 | Confirmations with QR check-in, reminders the day before, and review requests after. | 84
D3 | A sewing school takes term bookings with deposits and payment plans on a system I built. | 88
D4 | Tell me how bookings work today. In 15 minutes I will tell you if custom is worth it. | 85
Path | booking-system / classes | 14, 7

T3 Shopify growth, final URL LP-T3 (the same two ads serve the US and Australia)

RSA T3-A (headline 1 pinned: Shopify ads, SEO and email)
H1 | Shopify ads, SEO and email | 26
H2 | July sales up 69% on 2025 | 25
H3 | July orders up 84% on 2025 | 26
H4 | For independent Shopify stores | 30
H5 | Shopify SEO and Google Ads | 26
H6 | Google Ads for Shopify | 22
H7 | One person, ads to email | 24
H8 | A plain monthly report | 22
H9 | Judged by your sales | 20
H10 | Emails that send themselves | 27
H11 | US and Australian shops | 23
H12 | Book a free 15 minute call | 26
D1 | I took over Google and Meta ads, SEO and email for an outdoor apparel store on Shopify. | 87
D2 | Adventureline's July sales rose 69% and orders 84% on July the year before. | 75
D3 | One person runs your ads, search and email, and reports the effect on sales each month. | 87
D4 | Book a 15 minute call. Tell me what you sell and I will tell you what I would fix first. | 88
Path | shopify / ads-seo-email | 7, 13

RSA T3-B (no pins)
H1 | Shopify growth | 14
H2 | Shopify SEO | 11
H3 | Shopify Google Ads | 18
H4 | Shopify email follow-up | 23
H5 | July sales up 69% on 2025 | 25
H6 | July orders up 84% on 2025 | 26
H7 | Monthly sales report | 20
H8 | One person, three jobs | 22
H9 | For independent stores | 22
H10 | Ads judged by sales | 19
H11 | Based in New York | 17
H12 | Book a 15 minute call | 21
H13 | Shopify SEO consultant | 22
D1 | Google Ads, SEO and email for Shopify stores, judged by what shows up in your sales. | 84
D2 | For Adventureline, an outdoor apparel store, July sales rose 69% on the year before. | 84
D3 | You get the same one-page report I read: what we spent, what it brought in, what next. | 86
D4 | Talk to me for 15 minutes about your store. I will say honestly whether I can help. | 83
Path | shopify / growth | 7, 6

Policy note: Shopify, Wix, Squarespace, Mailchimp and Google Docs are trademarks. If a trademark owner has filed with Google, a headline naming it can serve as "approved (limited)" or be held back. Each ad has enough unbranded lines to serve without them. Read the per-line policy status after review.

## 5. Sitelinks, callouts and structured snippets

Campaign-level. Link text up to 25 characters, description lines up to 35, unique text and URL per sitelink. BOOK is https://alexandergrant.app/book and HOME is https://alexandergrant.app/.

AG Software, US (six sitelinks)
SL1 link | Book a 15 minute call | 21
SL1 line 1 | Pick a time that suits you | 26
SL1 line 2 | Talk to the person who builds | 29
SL1 url | BOOK
SL2 link | Software made to measure | 24
SL2 line 1 | Built around how you work | 25
SL2 line 2 | Bookings, invoices, follow-up | 29
SL2 url | LP-T4
SL3 link | Booking systems | 15
SL3 line 1 | Classes, camps and parties | 26
SL3 line 2 | 5 studios run on Playday | 24
SL3 url | LP-T2
SL4 link | Outgrown Wix | 12
SL4 line 1 | When the site builder runs out | 30
SL4 line 2 | One system in its place | 23
SL4 url | LP-T1
SL5 link | Shopify ads and SEO | 19
SL5 line 1 | Google Ads, SEO and email | 25
SL5 line 2 | July sales up 69% on 2025 | 25
SL5 url | LP-T3
SL6 link | How I work | 10
SL6 line 1 | One person for both halves | 26
SL6 line 2 | A monthly report on sales | 25
SL6 url | HOME

AG Shopify growth, US and AU (four sitelinks)
SL1 link | Book a 15 minute call | 21
SL1 line 1 | Pick a time that suits you | 26
SL1 line 2 | Talk to me about your store | 27
SL1 url | BOOK
SL2 link | Adventureline results | 21
SL2 line 1 | July orders up 84% on 2025 | 26
SL2 line 2 | Outdoor apparel on Shopify | 26
SL2 url | HOME
SL3 link | Software made to measure | 24
SL3 line 1 | When apps no longer fit | 23
SL3 line 2 | One system built around you | 27
SL3 url | LP-T4
SL4 link | Booking systems | 15
SL4 line 1 | Classes, camps and parties | 26
SL4 line 2 | 5 studios run on Playday | 24
SL4 url | LP-T2

Callouts (both campaigns)
C1 | Based in New York | 17
C2 | One person, no handoffs | 23
C3 | Monthly report on sales | 23
C4 | Free 15 minute call | 19
C5 | US and Australian clients | 25
C6 | Built around your staff | 23
C7 | Judged by your sales | 20
C8 | Plain English, no jargon | 24

Structured snippets (both campaigns)
Header: Service catalog
SV | Google Ads | 10
SV | SEO | 3
SV | Email follow-up | 15
SV | Booking systems | 15
SV | Online stores | 13
SV | Custom software | 15
SV | Customer portals | 16
Header: Types
SV | Studios | 7
SV | Shops | 5
SV | Shopify stores | 14
SV | Activity businesses | 19
SV | Service businesses | 18

Business name "Alexander Grant" and a logo: add only after advertiser verification. The API refuses a business name asset before that (CUSTOMER_NOT_VERIFIED, seen on Teddy). Image assets can only be added in the UI.

## 6. Budget, bidding and what counts as working

### Budget

Recommended: 25 USD per day for each campaign, 50 USD per day in total, for six weeks from 2027-01-04 to 2027-02-14. Google may spend up to twice the daily budget on a given day, but never more than 30.4 times it in a month. So the ceiling is 1,520 USD a month and about 2,100 USD over the six weeks. The software campaign will probably underspend, because search volume, not money, limits it.

The best-practice floor is 10 clicks a day per campaign. At these prices that would cost 250 to 350 USD per day for software alone. This test cannot meet that floor, and it does not need to: its question is whether qualified owners book calls at all, not which headline wins.

### Expected results (all estimates)

Assumptions: unique monthly searches per ad group (T4 about 500, T2 about 300, T3 about 2,300 US plus 200 AU, from the seodata groups with shared figures counted once). Impression share 50 percent for a new account bidding under the market price. CTR 6.10 percent and conversion rate 4.85 to 8 percent (WordStream 2026 Business Services, with the upper end for a landing page whose single action is booking). CPC 25 to 40 USD for software and 12 to 25 USD for Shopify.

| Campaign | Spend over six weeks | Clicks | Contacts (calls plus messages) |
|---|---|---|---|
| AG Software, US | 650 to 1,050 USD (search volume may cap it near 15 to 25 USD per day) | 26 to 42 | 1 to 3 |
| AG Shopify growth, US and AU | about 1,050 USD (budget-limited) | 42 to 88 | 2 to 7 |
| Total | 1,700 to 2,100 USD | 70 to 130 | 3 to 10 |

At 30 USD a click and 4.85 percent conversion, a contact costs about 620 USD. At 20 USD and 8 percent, about 250 USD. Whether that is cheap depends on what a client is worth, which is open question 3.

### Bidding

Maximize Clicks with a CPC cap for the whole test: 35 USD on software and 25 USD on Shopify. Google's current guidance is to start on Maximize Conversions with no target. The skill's own exception applies here. There is no conversion history, and the test should produce somewhere between 2 and 8 booked calls, far from the roughly 30 a month Smart Bidding needs. A conversion-based strategy with nothing to learn from can buy a few 60 to 100 USD clicks and spend twice the budget on a day.

The caps sit near the middle of the seodata prices, so one click cannot take more than a day and a half of budget. Past accounts showed the risk on the other side. AcuApp at a 1.50 USD cap lost 90 percent of impression share to rank. Teddy at 12 USD lost 68 to 85 percent against 13 to 29 USD top of page bids. One cap change is allowed, at the week 2 review: if search lost impression share to rank is above 80 percent and impressions are under 100 a week, raise the cap once (software 45 USD, Shopify 35 USD).

Switch to Maximize Conversions, once and never back, only when a campaign has 10 or more booked calls in 30 days. At this budget that is unlikely inside the test, so the bidding decision belongs to the week 6 review.

### Working, stop and extend

Working at week 6, judged per campaign:
- At least 3 booked calls with qualified prospects (an owner or manager of an independent business, with a problem in that campaign's themes and a plausible budget), or 1 signed client.
- The cost per qualified call is at or under the allowable figure from open question 3.
- At least 70 percent of clicks in the search terms report are on intent.

Stop earlier:
- Before launch, a test booking or a test WhatsApp message does not record within 24 hours. Do not launch.
- 1,000 USD spent across both campaigns with no qualified conversation of any kind: pause both, then review the landing pages and the offer before spending more.
- An ad group reaches 40 clicks with no contact: pause that ad group.
- Search lost impression share to rank is still above 85 percent after the one cap raise: the market price is above this budget, so stop that campaign rather than chase it.
- More than half of clicks are off intent after two rounds of negatives: stop that ad group.

Extend: if a campaign produces roughly one qualified call every two weeks or better, run it six more weeks. Raise its budget in steps, never more than double in one step, and only after Alex names the new figure. Candidates to add then: Australian software, the "wix developer" test, camp software in T2.

### Review calendar (if launched 2027-01-04)

- 2027-01-05: ads approved and serving, spend registering, conversion tags active. Change nothing.
- 2027-01-07: first search terms read.
- 2027-01-11: first batch of negatives. Read system_serving_status and pause RARELY_SERVED keywords.
- 2027-01-18: second negatives batch. Lost impression share by cause. The one cap decision.
- 2027-02-01: midpoint. Location report (US against Australia), the stop rules, and reconciling conversions against real calls.
- 2027-02-15: verdict against the working criteria. Bidding decision.

Each review compares three numbers side by side: conversions reported in Ads, the matching GA4 events, and calls actually held from the calendar.

## 7. Conversion tracking plan

Current state (checked 2026-11-16): the live site loads GA4 G-WJE4BE4ZLH only (property 478059970), in production only (layout.tsx checks VERCEL_ENV). There is no Google Ads tag. The contact form (src/components/WhatsAppForm.tsx) sends a GA4 generate_lead event with method whatsapp and opens wa.me. GA4 recorded zero generate_lead events on alexandergrant.app between 2026-08-18 and 2026-11-15, so that event has never been seen firing in production.

Booking flow (decided by Alex 2026-11-16, no Calendly or Cal.com): the app gets its own booking flow, ported from Teddy Calls. The visitor books at /book and lands on /book/thanks?b=bookingId. A client component there fires the GA4 event book_call once per booking, through gtag and dataLayer, behind a sessionStorage guard, with no name or email in the event.

Primary bidding signal: Booked call. It is the only primary action.

| Conversion action | Booked call | WhatsApp message |
|---|---|---|
| Role | Primary (the bidding signal) | Secondary (observation only) |
| Category | Book appointment | Contact |
| Source | Google Ads tag on the website, coded event (not a page URL rule) | Google Ads tag on the website, coded event |
| Fires when | /book/thanks, in the same guarded block that already sends book_call | The WhatsApp form is submitted, in the same handler that already sends generate_lead |
| Transaction ID | The bookingId from ?b= | None |
| Count | One per click | One per click |
| Value | Set on the action as a default value that is always used, so the code passes none: Alex's expected value per call (close rate times first-year gross profit per client); see open question 3 | 0 |
| Click-through window | 90 days (consulting buyers come back weeks later) | 30 days |
| View-through window | 1 day | 1 day |
| Attribution | Data driven | Data driven |
| GA4 twin event | book_call (exists in the ported flow), marked as a key event in GA4 for reporting only | generate_lead (exists) |
| Enhanced conversions | Off at launch (reasons below) | Off |

The agent creates both actions by API (type WEBPAGE). The API returns their tag snippets, which give the conversion ID (one per account, AW-XXXXXXXXXX below) and one label per action (BOOKED_CALL_LABEL and WHATSAPP_LABEL below). The real values go into Vercel env vars, never into the code.

What the app must add:
1. Environment variables, production only: NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX, NEXT_PUBLIC_ADS_BOOKED_CALL_LABEL=BOOKED_CALL_LABEL, NEXT_PUBLIC_ADS_WHATSAPP_LABEL=WHATSAPP_LABEL. Same pattern as Teddy (NEXT_PUBLIC_GOOGLE_ADS_ID plus one label variable per action).
2. Site-wide Ads config, in src/app/layout.tsx under the existing VERCEL_ENV production check, after the GA4 component: gtag('config', 'AW-XXXXXXXXXX'). It has to be on every page, not only the thanks page. The visitor lands on an LP with the gclid in the URL; the tag stores it in a first-party cookie there; /book/thanks carries no gclid, so without the tag on the landing page the booking cannot be tied to the ad click.
3. On /book/thanks, inside the existing sessionStorage guard and right next to the book_call call: gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXXX/BOOKED_CALL_LABEL', transaction_id: bookingId }). Use the bookingId from ?b=. No value, no currency, no name or email.
4. In WhatsAppForm.tsx, next to the generate_lead call: gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXXX/WHATSAPP_LABEL' }).
5. Click IDs on the booking record. When a visitor lands with gclid, gbraid or wbraid and utm_source, utm_campaign, utm_content or utm_term in the URL, keep them in sessionStorage. /book then sends them with the booking and the server saves them on the booking row. With 2 to 8 bookings in the test, seeing exactly which keyword produced each call matters more than any dashboard. It also leaves the door open to importing "became a client" later as an offline conversion.
6. Nothing else on the thanks page. If the conversion ID or label env var is missing (local runs, preview deployments), skip the call silently, as the GA4 guard already does.

Why a coded event and not a URL-based action: a "page URL contains /book/thanks" rule counts every load of that page. That includes reloads, the back button, a bookmarked or forwarded link and Alex's own test visits; it ignores the sessionStorage guard and cannot carry the booking ID. On playday, URL-match "Success Page" actions counted about 2.9 conversions per real purchase. The coded event fires inside the guard, and transaction_id lets Google drop a second fire for the same booking, for example when the thanks link is opened in a new tab where sessionStorage is empty.

Why no enhanced conversions at launch:
- Enhanced conversions needs the booker's email or phone on the page that fires the conversion. The event deliberately carries neither.
- /book/thanks is addressed only by ?b=bookingId. Rendering the email there would show it to anyone holding the link, unless the page first checks a session or signed token.
- The gain is small here. There will be 2 to 8 bookings in six weeks, the campaigns bid on clicks during the test so conversions do not steer bids, and the click IDs saved on the booking (point 5) already tie each call to its click.
- Revisit if bookings pass about 15 a month. The options then are enhanced conversions with the email set from the booking form submit (before the redirect, so it never sits on the thanks page), or offline import of the saved gclid with the real outcome. Offline import goes through the Data Manager API, which replaced Google Ads API uploads in June 2026.

Why WhatsApp is secondary: the event fires when WhatsApp opens, not when a message arrives. A desktop visitor with no WhatsApp still counts, and there is no way to tell a sent message from an abandoned one. Reconcile it weekly against the WhatsApp inbox instead.

During the test the campaigns bid on clicks, so neither action steers bids yet. Booked call is set up as primary now, so the bidding switch at week 6 has history to stand on.

Rules for the build:
1. Use the Google Ads tag only. Do not import GA4 events into Ads, because an import plus the tag double counts. Property 478059970 also holds the powerthetribe.com and arthubonline.com web streams (206 sessions from powerthetribe.com in the same 90 days), so any import or audience from it would mix three sites. If Alex links the property, use it for reporting only, filtered by hostname.
2. Optional: when the visitor arrived from an ad, append a short reference such as "(ref T3)" to the WhatsApp prefill text, so the inbox shows the source.
3. When the Contact secondary action is created, Google will create a Contact website goal that is biddable. Nothing is bid on it while the action stays secondary, but promoting it later would take effect at once.
4. Keep /book/thanks out of the sitemap and set it noindex, so nobody arrives there from search.
5. Before launch, with Google Tag Assistant connected, make one real booking from a phone through an LP URL with ?utm_source=google&utm_term=test appended. The conversion must show send_to with the Booked call label and transaction_id equal to the booking ID, and it must fire once: reloading the thanks page must not fire it again. Check that the booking row saved the UTM values. Do the same for one WhatsApp send. Within 24 hours both actions in Goals, Conversions should move off "Unverified". Then cancel the test booking.

## 8. Account setup: what Alex does in the UI, then what the agent does by API

Alex, in this order:
1. Create the account under the manager: sign in to manager 838-154-4517, Accounts, the plus button, Create new account. Name Alexander Grant, currency USD, time zone (GMT-05:00) New York. Currency and time zone cannot be changed later. If the flow pushes you to build a Performance Max campaign or asks for a campaign before it will create the account, stop there and tell the agent rather than building one. The API cannot create the account at Explorer access.
2. Billing: Billing, Settings, add the business card. The API cannot do billing at Explorer access. Once billing is live the account has no spending limit, so the agent builds everything paused.
3. Advertiser verification: start it now under Billing, Advertiser verification. The business name and logo assets wait on it.
4. Turn auto-apply off: Recommendations, Auto-apply, untick every type.
5. Account-level automated assets: Campaigns, Assets, the menu for account-level automated assets, Advanced settings. Turn off dynamic sitelinks, callouts and structured snippets, or review them.
6. Availability in the new /book flow: one free 15 minute call type, plus a couple of evening slots for Australia (5 to 7 pm New York in January is 9 to 11 am in Sydney the next day).
7. Enhanced conversions: leave off for now (section 7). If it is turned on later, the path is Goals, Conversions, Settings, Enhanced conversions, Turn on, Google tag, Save, and Alex accepts the customer data terms himself.
8. Optional: link GA4 under Tools, Data manager, Google Analytics, for reporting only, and decline every conversion import. Or create a separate GA4 property for alexandergrant.app first (open question 7).
9. Tell the agent the account ID, the budget figure and the launch date. Once the agent creates the conversion actions, put the conversion ID and the two labels into Vercel env vars (section 7).

Then the agent, by API, in one atomic request validated first: conversion actions, the three negative lists, both campaigns paused with budgets, geo, ad groups, keywords, RSAs and campaign assets. Then a read-back and a change log in docs/growth. Alex reviews the paused build in the UI and enables it himself on launch day.

Code the site needs before launch (outside this plan, for whoever builds the pages):
- the four landing pages;
- the /book flow with /book/thanks;
- the site-wide Ads config;
- the two conversion calls;
- saving click IDs and UTMs on the booking row.

Section 7 lists exactly what goes where.

## 9. Open questions for Alex

1. Budget: approve 50 USD per day in total (25 software, 25 Shopify) for six weeks, about 2,100 USD at most? Or name a different figure.
2. Launch date: 2027-01-04 (recommended, after Thanksgiving, Black Friday and Christmas), or earlier? Australian businesses are on summer holidays through most of January, so the Australian clicks will start slowly either way.
3. What is a new client worth in first-year gross profit, and how many booked calls do you expect to close? These set the allowable cost per call and the Booked call value. For illustration only: 1 in 4 calls closing on 6,000 USD would allow about 1,500 USD per call to break even in year one.
4. Adventureline: the adventureline memory recorded permission for a case study as pending on 2026-08-19, and the homepage spotlight went live on 2026-08-21. Does Matt's written yes cover paid ads that name the store and its July figures?
5. Playday: are Gregory and Megan fine with the figures appearing in paid ads? The copy uses 5 studios. If studios 6 and 7 are live by launch, should it say 7?
6. Capacity: how many new clients can you take in the first quarter of 2027, and do you want US Shopify stores as well as Australian ones? The T3 ads say "US and Australian shops".
7. GA4: keep alexandergrant.app in property 478059970 next to powerthetribe.com and arthubonline.com, or give it its own property before launch?
8. Would you publish a starting price range on LP-T4? It would let the ads filter out people who cannot afford a custom build, and let the site win "how much does custom software cost" organically.
9. Bali Spirit's "more than $7,000 a year": USD or AUD? The ads show "$7,000" as the site does.

## Appendix A. seodata.dev results, 2026-11-16 (all 20 lookups)

| Seed looked up | Country | Searches per month | CPC in USD | Competition | Similar keywords returned (searches per month, CPC in USD) |
|---|---|---|---|---|---|
| custom software for small business | US | 170 | 37.76 | 0.12 | custom software development for small businesses (140, no CPC in data); small business custom software (170, 37.76); custom software development for small business (140, no CPC in data); small business custom software development (140, 97.13); custom small business software (140, 33.79); small business software development (140, 9.78); software development for small businesses (140, 9.78); software development for small business (140, 14.07); small business software developers (30, 42.79); software development small business (140, 9.78) |
| wix alternative | US | 170 | 11.34 | 0.51 | wix alternatives (1,300, 12.25); best alternative to wix (50, 10.86); best alternatives to wix (50, 8.55); wix competitors (480, 10.38); alternatives to wix (320, 11.76); sites like wix (320, 9.05); website similar to wix (320, 9.05); wix similar sites (320, 9.05); website builders like wix (140, 10.15); similar to wix (70, 5.59) |
| squarespace alternative | US | 210 | 8.64 | 0.43 | squarespace alternatives (1,000, 10.93); best alternative to squarespace (40, 29.02); sites like squarespace (260, 9.91); websites like squarespace (260, 9.91); squarespace alternatives free (70, 19.14); cheaper alternative to squarespace (50, 14.66); free alternative to squarespace (40, 10.17); free alternatives to squarespace (40, 10.17); squarespace similar companies (30, 6.35); alternative squarespace (1,000, 13.41) |
| mindbody alternative | US | 170 | 28.01 | 0.3 | mindbody alternatives (170, 28.01); software similar to mindbody (30, 8.61); alternative to mindbody (50, 41.33); mindbody online alternatives (170, 28.01); software like mindbody (30, 80.32); mindbody competitors (260, 51.50); mindbody online alternative (170, 75.23); alternatives to mindbody (30, 52.41); mind body alternatives (140, 64.57); mindbody online competitors (10, 23.24) |
| class booking software | US | 110 | 47.62 | 0.33 | online class booking system (50, 16.40); online class scheduling software (40, no CPC in data); booking software for classes (110, 47.62); online booking system for classes (50, 16.40); online booking systems for classes (50, 16.40); booking system for classes (90, 25.79); class booking system (90, 25.79); class booking app (50, 6.83); online class booking (30, no CPC in data); class scheduling app (480, 10.11) |
| custom booking system | US | not in database | | | |
| camp registration software | US | 880 | 35.64 | 0.39 | camp software (1,900, 25.09); online camp registration software (90, no CPC in data); camp registration system (70, 49.01); summer camp registration software (210, 48.95); day camp registration software (40, 40.23); summer camp software (170, 25.51); day camp software (50, 52.63); summer camp online registration software (30, 76.41); summer camp management software (110, 52.80); day camp management software (50, 15.53) |
| shopify marketing agency | US | 260 | 40.25 | 0.38 | shopify digital marketing agency (50, 23.50); marketing agency for shopify (30, no CPC in data); shopify marketing companies (50, 53.92); shopify marketing company (50, no CPC in data); shopify advertising agency (40, 28.97); shopify marketing agencies (260, 40.25); shopify ad agency (40, 113.05); shopify ads agency (40, 113.05); shopify marketing agency in usa (10, no CPC in data); shopify marketing services (70, 22.27) |
| google ads for shopify | US | 320 | 29.82 | 0.37 | shopify google ad (320, 29.82); google ads for shopify store (50, 34.74); google ads on shopify (30, 7.01); shopify google shopping ads (50, no CPC in data); how to add google ads to shopify (20, 1.02); google ads shopify (320, 39.15); shopify google ads (320, 40.61); shopify google ads integration (40, no CPC in data); google shopping on shopify (210, 27.66); google shopping ads shopify (50, no CPC in data) |
| shopify seo expert | US | 1,600 | 60.95 | 0.04 | shopify seo services (1,600, 12.76); shopify seo agency (1,600, 12.76); shopify experts seo (880, 30.73); shopify seo consultant (390, no CPC in data); seo expert shopify (880, 30.73); shopify expert seo (880, 55.91); seo experts shopify (880, 30.73); seo shopify expert (880, 30.73); seo shopify experts (880, 30.73); shopify seo experts (880, 30.73) |
| klaviyo agency | US | 170 | 51.79 | 0.56 | klaviyo marketing agency (20, 54.43); klaviyo email marketing agency (210, 46.75); klaviyo agency partners (70, 17.15); klaviyo partner directory (110, 13.64); klaviyo agency partner (70, 36.35); klaviyo partner (480, 19.05); klaviyo partners (480, 14.73); klaviyo partnerships (480, 14.73); klaviyo specialists (50, 88.04); klaviyo professional services (50, no CPC in data) |
| custom software development | US | 3,600 | 67.28 | 0.17 | custom software development company (3,600, 48.57); custom development software (1,900, 56.12); custom software design (170, 14.56); custom software programming (170, no CPC in data); software development custom (90, no CPC in data); custom software services (320, 26.62); custom software programmer (170, no CPC in data); developing custom software (3,600, 48.42); software development services (2,900, 43.81); custom software development solution (590, no CPC in data) |
| marketing agency for small business | US | 2,400 | 20.89 | 0.28 | digital marketing agencies for small businesses (1,900, 34.86); digital marketing agency for small businesses (1,900, 34.86); digital marketing agency small business (1,900, 34.86); marketing agency small business (1,900, 23.28); marketing companies for small businesses (1,900, 30.94); marketing company for small business (1,900, 35.66); marketing firm for small business (1,900, 34.88); small business digital marketing agency (1,900, 25.74); small business marketing agency (1,900, 23.28); small business marketing agencies (1,600, 24.44) |
| custom crm for small business | US | not in database | | | |
| wix bookings alternative | US | not in database | | | |
| wix developer | US | 390 | 39.16 | 0.51 | wix developers (480, 37.90); wix dev (70, 11.14); developer wix (480, 37.90); wix web developer (260, 22.07); wix website developer (260, 18.19); wix website developers (260, 18.19); web developer wix (590, 25.91); wix for developers (390, 39.90); wix web developers (260, 18.19); web development wix (110, 17.77) |
| custom booking software | US | not in database | | | |
| custom app development for small business | US | not in database | | | |
| shopify seo expert | AU | 110 | 9.53 | 0.14 | seo expert shopify (110, 24.25); seo shopify expert (110, 9.53); shopify expert seo (110, 24.25); shopify experts seo (110, 24.25); shopify seo experts (110, 9.53); seo shopify experts (110, 24.25); seo services for shopify (110, no CPC in data); shopify seo companies (70, no CPC in data); shopify seo company (70, 441.18); shopify seo services (110, no CPC in data) |
| custom software development | AU | 260 | 22.78 | 0.31 | custom software developers (70, 99.22); software custom development (260, 19.53); custom software development company (260, 61.82); customized software development services (90, no CPC in data); custom software firm (70, no CPC in data); development software custom (140, 22.20); custom software solution (110, 46.38); custom software development services (90, no CPC in data); custom software development australia (140, 35.99); software development custom (140, 22.20) |

Keyword pages checked after the API quota ran out (https://www.seodata.dev/keyword/ followed by the phrase with hyphens, fetched 9 seconds apart). A page exists only when the keyword is in their database. The control page for "custom software for small business" returned 200 and the same figures as the API (170, 37.76 USD, updated 2026-07-19). These eight returned 404, meaning no record: alternative to wix bookings, wix bookings limitations, move off wix without losing seo, custom booking software for studios, birthday party booking system for art studio, shopify marketing consultant, shopify collection page seo, replace spreadsheets with software.

## Appendix B. Google autocomplete evidence, 2026-11-16

Typed in the US (selected completions):
- "wix booking": wix bookings, wix booking system, wix bookings app, wix booking calendar, wix bookings cost, wix booking system review, wix booking calendar not working.
- "wix bookings alternative": wix bookings alternative, wix alternatives, wix bookings cost.
- "moving from wix to": squarespace, shopify, wordpress, godaddy, hostinger, cloudflare.
- "wix limitations": wix website limitations, wix seo limitations, wix free plan limitations.
- "custom booking": custom booking system, custom booking website, custom booking engine, custom booking app, custom booking software.
- "booking system for kids": booking system for kids classes, booking system for kids clubs.
- "kids class booking": kids class booking system.
- "birthday party booking software": birthday party booking software, birthday party booking system.
- "studio booking system": studio booking software, pilates, yoga, fitness, tattoo and recording studio booking systems, wix studio booking system.
- "custom crm for": custom crm for business, custom crm for small business, how much does a custom crm cost, custom build crm system cost.
- "how much does custom software cost": how much does custom software development cost, how much does custom software development cost in 2026, the same in australia.
- "shopify google ads": conversion tracking, integration, agency, tracking, adsense, app, credit, tag.
- "shopify ads agency": shopify creative agency, shopify google ads agency, shopify meta ads agency.
- "shopify seo": shopify seo agency, shopify seo company, shopify seo services, shopify seo tools, shopify seo apps.
- "shopify email marketing": pricing, vs klaviyo, templates, agency, vs mailchimp, free.

No completions at all for: "outgrown wix", "outgrown squarespace", "outgrown mindbody", "outgrown airtable", "outgrown spreadsheets", "custom booking system for", "mindbody alternative for", "custom database for small business", "squarespace scheduling alternative".

Typed in Australia: "shopify seo" (services, agency, company, specialist), "shopify google ads agency", "custom software development sydney", "google ads agency melbourne" and "google ads agency brisbane", "booking system for small business".

## Sources

- seodata.dev API and MCP documentation: https://www.seodata.dev/llms.txt
- WordStream and LocaliQ, 2026 Google Ads benchmarks: https://www.wordstream.com/blog/2026-google-ads-benchmarks
- Google Ads API access levels (Explorer cannot use planning or account creation services): https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- US Census Bureau, vintage 2024 population estimates: https://census.gov/newsroom/press-releases/2025/vintage-2024-popest.html
- New York metro population 2024: https://usafacts.org/answers/how-many-people-live-in-the-us/metro-area/new-york-ny/
- Bidding, match type, budget floor, learning period and asset guidance: the google-ads skill's references/best-practices.md (researched 2026-10-22, with primary sources inside it)
- Past-account lessons cited (AcuApp and Teddy caps, RARELY_SERVED rates, business name refusal): the google-ads skill's references/lessons.md
