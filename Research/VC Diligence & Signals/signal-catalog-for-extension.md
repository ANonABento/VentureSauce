# Signal catalog for the VentureSauce side panel

_Researched 2026-10-10 for the Data, Extension and Kevin (verdict logic) roles. Research only; nothing here is built yet._

This is a list of public signals VentureSauce could check against deck claims, or show as extra diligence context. It builds on the four checks already in scope (LinkedIn headcount, Form D money raised, press via SERP, Form D related persons). See `docs/PLAN.md`, `Research/Product Research/form-d-data-guide.md` and `Research/User Research/hidden-problem-hypotheses.md`.

**Labels used below**
- **[T]**: tested from curl in this session, with the result noted.
- **[T-fail]**: tested, and it failed or needs a key.
- **[U]**: untested. Treat it as a lead, not a fact.
- Bright Data dataset IDs come from `https://docs.brightdata.com/scrapers.json` **[T]** (1,248 scrapers listed). The IDs are confirmed to exist. **We did not call them**, because we had no API key in this session. Their output fields are **[U]**: the per-scraper `.json` pages returned only the name and ID, with no schema.

---

## TL;DR

- **Top 5 additions, ranked by value ÷ effort:**
  1. Customer-logo check (Bright Data SERP)
  2. Hiring check from public ATS boards (Ashby, Greenhouse, Lever: free JSON)
  3. GitHub, npm and PyPI traction check (free APIs)
  4. Founder-history check (LinkedIn profiles via Bright Data)
  5. Hot-deal flags from Form D SPV filings plus Tranco rank velocity (both free)
- **Most new checks will come back "unverified", not "gap".** That matches hypothesis H7. Each row is worth showing for the *question to ask*, not just the flag.
- **Free endpoints that worked:**
  - GitHub REST
  - npm downloads
  - pypistats
  - Tranco
  - Wayback CDX
  - RDAP (.com via rdap.org; .io via Identity Digital)
  - crt.sh (flaky)
  - Ashby posting API
  - HN Algolia
  - iTunes Search
  - arXiv and Semantic Scholar
  - EDGAR EFTS for SPV names
  - YC OSS API
- **Need a key, or blocked:**
  - OpenCorporates (401, needs a token)
  - USPTO TSDR (401; an API key has been required since 2 Oct 2026)
  - Product Hunt GraphQL (401, needs an OAuth token)
  - GitHub stargazer timestamps and code search (401 without a token)
  - PatentsView (timed out)

---

## 1. Signal catalog (prioritized)

Effort means time to build in the hackathon: **S** is under 1 hour, **M** is 1–3 hours, **L** is more than 3 hours or blocked.

### Tier A: high value, cheap. Build these next.

#### A1. Customer-logo check: does the customer mention the startup?
- **Deck claim verified:** "Customers include Stripe, Walmart…", or a logo wall.
- **Source and access:**
  - **Bright Data SERP API**, the same `POST https://api.brightdata.com/request` call Data already builds. Run two queries per logo:
    - `site:<customer-domain> "<startup>"`
    - `"<customer>" "<startup>" (case study OR partnership OR "powered by" OR customer)`
  - Add the startup's own `/customers` or `/case-studies` page through **Web Unlocker**, and its history through **Wayback CDX** (below).
  - All Bright Data calls here are **[U]** (no key this session).
- **Gap vs. legitimate explanation:**
  - A logo with no public mention is the *normal* case. Enterprise customers rarely let vendors name them, and pilots are under NDA.
  - That makes it "unverified", never a gap.
  - It's a stronger signal when the startup's **own** site doesn't list the customer while the deck does. It's also stronger when Wayback shows the logo was **removed** from the site (a possible churned customer).
- **False-positive risks:**
  - Name collisions ("Clerk" the word, "Daytona" the Dodge car; see HN below).
  - The customer is a subsidiary.
  - The mention is on a partner marketplace rather than in a customer relationship.
- **Effort:** M. Bright Data credits only.
- **Value:** This is the strongest-supported hidden problem (H4). Lemkin called the customers on a deck and found "they were all unpaid pilots with draft contracts" ([SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs)). David Sacks calls customer references the "number one part of diligence" ([Fortune](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/)). Even a "no public mention" row tells the associate which reference call to ask for.

#### A2. Hiring check from public ATS job boards
- **Deck claim verified:** "Hiring 15 engineers this quarter", use of funds, "scaling GTM", team growth plans.
- **Source and access (free, no key):**
  - Ashby: `GET https://api.ashbyhq.com/posting-api/job-board/<slug>` **[T]**. For `clerk` it returned 200 with 2 jobs. Fields include `title`, `department`, `team`, `location`, `isRemote`, `publishedAt` and `jobUrl`.
  - Greenhouse: `GET https://boards-api.greenhouse.io/v1/boards/<token>/jobs` **[T]**. Returned 404 for `daytona`, which means the slug is wrong or they don't use Greenhouse. It does not mean "no jobs".
  - Lever: `GET https://api.lever.co/v0/postings/<slug>?mode=json` **[T]**. Returned 404 for `daytona`, same meaning.
  - Fallback for LinkedIn Jobs: Bright Data dataset `gd_lpfll7v5hcqtkxl6l` (`discover_by_keyword`/`discover_by_url`) **[U]**.
- **How to find the slug:**
  1. Fetch the company's `/careers` page and regex for `jobs.ashbyhq.com/<slug>`, `boards.greenhouse.io/<slug>` or `jobs.lever.co/<slug>`.
  2. Otherwise try the domain stem on all three ATS APIs.
- **Gap vs. legitimate explanation:**
  - Many open roles plus a claim of "lean, capital-efficient" is a mismatch worth asking about.
  - Zero roles right after "raised $X to scale" could mean a hiring freeze, or that they recruit through networks or agencies.
  - Roles posted in a different country from the deck's "SF team" match H3's offshore point.
- **False-positive risks:**
  - Evergreen "general application" postings.
  - Reposted roles.
  - A second ATS for some teams.
  - Ashby's `isListed=false` roles are hidden.
- **Effort:** S for Ashby, Greenhouse and Lever. M with slug discovery.
- **Value:** Hiring velocity is widely described as a top leading indicator of growth ([Parallel](https://parallel.ai/articles/ai-sourcing-how-to-find-acquisition-targets-programmatically.md); a vendor source). It also gives a second, independent check on the LinkedIn headcount row, which lowers false alarms there.

#### A3. Developer traction: GitHub, npm, PyPI
- **Deck claim verified:** "50k GitHub stars", "2M monthly SDK downloads", "300 contributors", "fastest-growing open-source X".
- **Source and access:**
  - GitHub repo: `GET https://api.github.com/repos/<owner>/<repo>` **[T]**
    - `daytonaio/daytona`: `stargazers_count` 71,575, `forks_count` 5,644, `created_at` 2024-02-06, **`archived: true`**, `pushed_at` 2026-07-24.
  - Contributor count: `GET .../contributors?per_page=1&anon=1`, then read the last page from the `Link` header **[T]**. Daytona has 233.
  - Commit velocity: `GET .../stats/commit_activity`, which gives 52 weekly totals **[T]**.
    - The first call often returns **202 with an empty body** while GitHub computes the stats. Retry after 2–5 seconds. Clerk's repo returned 202 on the first call.
  - Star velocity: `GET .../stargazers` with `Accept: application/vnd.github.star+json` gives a `starred_at` timestamp per star. It returned **401 "Requires authentication"** without a token, so use a GitHub token **[T-fail]**.
  - Org metadata: `GET https://api.github.com/orgs/<org>` **[T]** (repo count, followers, `created_at`).
  - **Rate limit:** 60 requests/hour without a token. We used 52 in this session. Use a personal access token (5,000/hour).
  - npm: `GET https://api.npmjs.org/downloads/point/last-month/<pkg>` **[T]**. `@daytonaio/sdk` had 2,934,685 downloads from 2026-09-09 to 10-08. `/downloads/range/last-year/<pkg>` gives a daily series **[T]** (365 days for `@clerk/nextjs`).
  - PyPI: `GET https://pypistats.org/api/packages/<pkg>/recent` **[T]**. `daytona` had 8,365,992 downloads last month.
- **Gap vs. legitimate explanation:**
  - A deck star count much higher than the API count, or a claimed "monthly downloads" figure that matches the *total* rather than monthly, is a real gap.
  - Downloads are inflated by CI, mirrors and bots. Don't treat downloads as users.
  - **An archived repo is not necessarily a dead project.** Daytona's main repo is archived, yet the org's other repos were pushed on 2026-10-09 **[T]**. Code may have moved, gone closed-source, or been renamed. Show it as context ("main repo archived Jul 2026"), never as a gap.
- **False-positive risks:**
  - Fake stars. CMU and NCSU's StarScout found about 4.5M suspected fake stars, 3.1M after refinement, across 15,835 repos. The effect is short-lived, under 2 months ([arXiv 2412.13459](https://arxiv.org/html/2412.13459v1)).
  - A low ratio of contributors and forks to stars is a cheap fake-star tell. That heuristic is **[U]**.
- **Effort:** S. Free.
- **Value:**
  - Startups that engage with external open source on GitHub were at least 36% more likely to get funding, especially from VCs ([EBSCO abstract of the study](https://www.ebsco.com/articles/biography/4be864f2-0dfb-514f-8ae4-1f1d88a29bed/beefing-it-up-for-your-investor-engagement-with-open-source-communities-innovation-and-startup-funding-evidence-from-github)).
  - Stars correlate with *initial* funding but predict long-term success less well ([summary](https://developerfirst.substack.com/p/issue-124); secondary source).
  - It only applies to dev-tool or open-source decks, but it gives a crisp, exact receipt when it does.

#### A4. Founder history
- **Deck claim verified:** "Ex-Google staff engineer", "2× founder with an exit", "PhD in ML", "published at NeurIPS".
- **Source and access:**
  - LinkedIn profiles via Bright Data `gd_l1viktl72bvl7bjuj0` (`collect_by_url`) **[U]**. Find the profile URL first with SERP: `site:linkedin.com/in "<name>" "<company>"`.
  - Academic claims:
    - arXiv: `GET https://export.arxiv.org/api/query?search_query=au:%22<Last>%22` **[T]**. Use `https`; `http` returns 301. "Burazin" returned 7 results.
    - Semantic Scholar: `GET https://api.semanticscholar.org/graph/v1/author/search?query=<name>&fields=name,hIndex,paperCount` **[T]**. "Ivan Burazin" returned one author: 10 papers, h-index 1. **This is almost certainly a different person**, which shows the name-collision risk.
  - Google Scholar has no API; SERP via Bright Data **[U]**.
  - Prior companies: Crunchbase via Bright Data `gd_l1vijqt9jfj7olije` **[U]** (funding detail is paywalled on Crunchbase itself). Prior Form Ds where the founder was a related person can't be searched by name, because EFTS full-text search doesn't index Form D XML (see `edgar-data-access.md`).
- **Gap vs. legitimate explanation:**
  - Titles are inflated in both directions.
  - "Exit" may mean an acqui-hire.
  - Profiles are often stale or private.
  - Only flag a gap when the claimed employer or degree is **absent** from a profile that clearly matches the person (same photo or company).
- **False-positive risks:** Name collisions are the main risk, as the Semantic Scholar example shows. Always show the matched profile URL so the analyst can confirm it.
- **Effort:** M (matching people is the hard part).
- **Value:** This is the highest-weight factor in VC decisions.
  - More than 55% of 889 VCs named the team as the most important factor ([Gompers, Gornall, Kaplan & Strebulaev, NBER w22587](https://www.nber.org/digest/dec16/how-do-venture-capitalists-make-decisions)).
  - Founders with a prior success have a 30% success rate, vs. 18% for first-time founders ([Gompers, Kovner, Lerner & Scharfstein 2010](https://corpgov.law.harvard.edu/2010/04/16/performance-persistence-in-entrepreneurship-and-venture-capital)).

#### A5. Investor and SPV signals from EDGAR (an extension of the existing Form D client)
- **Deck claim verified:** "Backed by Tier-1 investors", "oversubscribed", round size. Also used as a hot-deal signal (Section 5).
- **Source and access:** `GET https://efts.sec.gov/LATEST/search-index?forms=D&entityName=<Company>` **[T]**.
  - "Anthropic" returned **99 Form D hits, almost all SPVs** ("Anthropic Apr 2026 a Series of CGF2021 LLC", "AUGUREY VENTURES QP FUND, LLC - SERIES ANTHROPIC SP-5", …).
  - "Clerk" returned 3 Clerk, Inc. filings (2025-07-03, 2023-07-03, 2022-12-23) plus one unrelated "Clerk Retail, Inc."
  - The investor *count* is in `totalNumberAlreadyInvested` (already in our parser).
- **Gap vs. legitimate explanation:**
  - SPVs named after a company show **secondary or allocation demand, not a primary round**. Never add their amounts to "raised".
  - Investor names in the deck can't be checked against Form D, which doesn't list investors. Only the count can be compared.
- **False-positive risks:** Common-word names ("Clerk", "Daytona Beach Hotel"). Filter on `3C` items and on "a Series of", "Fund", "SPV" or "LLC" in the name.
- **Effort:** S. Reuses the existing client.
- **Value:** SPV clusters are a known hot-deal tell (Section 5). This turns the "Form D director list" creativity angle into a broader "who's piling in" view.

### Tier B: useful context, cheap, lower verification value

#### B1. Web traffic rank and its trend (Tranco)
- **Deck claim verified:** "Usage growing 3× month over month", "500k monthly visitors". This is directional only.
- **Source and access:** `GET https://tranco-list.eu/api/ranks/domain/<domain>` **[T]**. It returns a daily rank history.
  - clerk.com was **#7,075 on 2026-10-09, up from #10,277 on 2026-09-30**.
  - This is free. Only roughly the top 1M domains are ranked, so most seed startups won't appear at all.
- **Paid alternative:** Similarweb has a paid API **[U]**, and we found no Bright Data Similarweb scraper in `scrapers.json`.
- **Gap vs. legitimate explanation:**
  - Rank is not visitors. B2B and API products get traffic on `api.` subdomains or inside apps.
  - Unranked means unknown.
  - Only flag strong *direction* mismatches ("hypergrowth" while the rank falls for 90 days).
- **Effort:** S. Free.
- **Value:** Positive trends in web traffic and search volume predicted a higher likelihood of next financing and shorter gaps between rounds ([Social feedback paper, arXiv 1301.2196](https://arxiv.org/abs/1301.2196)). Web mentions improved success prediction over structured data alone ([UvA, Web-based Startup Success Prediction](https://dare.uva.nl/id/7454cfe3-e9c4-4a49-8a48-61ee955dad7e)).

#### B2. Domain age and history (RDAP, Wayback, certificate transparency)
- **Deck claim verified:** "Founded 2019", "in market for 3 years", "launched in Q1". It also catches logos removed from the customer page.
- **Source and access:**
  - RDAP for .com: `GET https://rdap.org/domain/<domain>` **[T]**, following redirects. clerk.com shows `registration` 1996-04-10.
  - RDAP for .io: rdap.org returns **404 "No RDAP service"** **[T-fail]**. Instead use `https://rdap.identitydigital.services/rdap/domain/<domain>` **[T]**. daytona.io shows `registration` 2016-07-19 and `transfer` 2024-11-24.
  - Wayback CDX: `GET https://web.archive.org/cdx/search/cdx?url=<domain>&output=json&limit=1&fl=timestamp,original` **[T]**. The first capture of daytona.io is 2021-08-02. It **timed out at 20s on the first try**, so set a 45s timeout.
    - For customer-page history: `url=<domain>/customers*&collapse=timestamp:6` **[T]** returned clerk.com/customers snapshots from 2023-04, 2023-06 and 2023-12.
    - The availability API, `https://archive.org/wayback/available?url=...`, also works **[T]**.
  - Certificate transparency: `GET https://crt.sh/?q=<domain>&output=json&exclude=expired` **[T]**. It returned **502 on the first try** and 200 on retry, with 112 certs and subdomains such as `dashboard.`, `api.` and `customersdash.`.
- **Gap vs. legitimate explanation:**
  - Domain registration dates are **often older than the company**, because domains get bought. clerk.com dates to 1996, which predates Clerk, Inc. by decades. So registration date is evidence only when it is *newer* than the claimed founding date.
  - Wayback's first capture is a lower bound on age.
  - A transfer date can mean a rebrand or a purchased domain.
- **Effort:** S. Free.
- **Value:** Medium. It's mostly a credibility check on the timeline. The Wayback logo-diff is the most interesting part ("logo X was on /customers in 2025, gone in 2026"), and it feeds A1.

#### B3. App and extension store traction
- **Deck claim verified:** "100k downloads", "4.8★", "#3 in Productivity".
- **Source and access:**
  - Apple App Store: `GET https://itunes.apple.com/search?term=<name>&entity=software&limit=5` **[T]**, or `/lookup?id=<appId>`. Notion returned `userRatingCount` 90,357, `averageUserRating` 4.78, `releaseDate`, `currentVersionReleaseDate` and `sellerName`. This is free.
    - Use `sellerName` to confirm the entity matches the legal name.
    - The API gives **no download counts**. Rank needs Bright Data `gd_lsk9ki3u2iishmwrui` **[U]**.
  - Google Play: the public page `play.google.com/store/apps/details?id=<pkg>&hl=en` **[T]**. Notion's page showed "10M+" installs, 4.6★ and about 398K reviews via a fragile regex. The better route is Bright Data `gd_lsk382l8xei8vzm4u` **[U]**.
  - Chrome Web Store: the HTML page `chromewebstore.google.com/detail/<slug>/<id>` **[T]**. React DevTools showed "5,000,000 users", 3.9★ and 1.6K ratings via regex. There is no official API, and we found no Bright Data scraper for it. Install counts are bucketed.
- **Gap vs. legitimate explanation:** Store installs are not active users. Web-first products may have tiny app numbers. Install buckets ("10M+") limit precision.
- **Effort:** S for iTunes. M for the HTML regex.
- **Value:** Medium. It's crisp when a consumer deck quotes store numbers.

#### B4. Community and launch buzz (HN, Product Hunt, Reddit, X)
- **Deck claim verified:** "#1 Product of the Day", "viral launch", "10k waitlist", community size.
- **Source and access:**
  - HN: `GET https://hn.algolia.com/api/v1/search?query=%22<name>%22&tags=story` **[T]**. "daytona" returned 96 hits, including "Show HN: Daytona" (73 points, 2024-03-06) **and Dodge Charger Daytona stories**, a clear name-collision risk.
  - `search_by_date` **[T]** found "Postmortem: Clerk System Outage (February 19, 2026)", which is also useful diligence context.
  - Product Hunt GraphQL `https://api.producthunt.com/v2/api/graphql` needs a developer token **[T-fail: 401]**. The token is free to create **[U]**.
  - Reddit: Bright Data `gd_lvz8ah06191smkebj4` (discover by keyword) **[U]**.
  - X: there's no affordable official API. Bright Data `gd_lwxmeb2u1cniijd7t4` (profiles) **[U]**. Follower *velocity* needs repeated snapshots, so it can't be built in the hackathon.
- **Gap vs. legitimate explanation:** Buzz is not traction, and B2B companies may have none. Only check concrete claims such as "#1 on Product Hunt" and "front page of HN".
- **Effort:** S (HN), M (Product Hunt).
- **Value:** Low to medium for verification. A nice receipt when a deck makes a launch claim.

#### B5. Reviews (G2, Trustpilot, Glassdoor)
- **Deck claim verified:** "Leader in G2 Grid", "4.7★ from 300 customers", culture and retention claims.
- **Source and access (all Bright Data, [U]):**
  - G2 product reviews: `gd_l88xvdka1uao86xvlb`
  - Trustpilot: `gd_lm5zmhwd2sni130p`
  - Glassdoor overview and reviews: `gd_l7j0bx501ockwldaqf` and `gd_l7j1po0921hbu0ri1z`
- **Gap vs. legitimate explanation:**
  - G2 badges are category- and season-specific.
  - Seed companies usually have fewer than 10 reviews, which is unverifiable rather than a gap.
  - Glassdoor ratings for small teams are noise.
- **Effort:** M.
- **Value:** Low to medium at seed, higher at Series A and later.

#### B6. Investor portfolio pages
- **Deck claim verified:** "Backed by a16z / Sequoia / YC".
- **Source and access:**
  - SERP `site:<vc-domain> "<startup>"` via Bright Data **[U]**, or Web Unlocker on the portfolio page **[U]**.
  - For YC: `GET https://yc-oss.github.io/api/companies/all.json` **[T]**. It returned 6,285 companies with `name`, `batch`, `status`, `team_size` and `website`. It's an unofficial community mirror, so cite ycombinator.com/companies as the receipt.
- **Gap vs. legitimate explanation:** Portfolio pages lag by months, angels and scouts are often unlisted, and an "a16z scout check" is not "a16z". Absence means unverified.
- **Effort:** S for YC. M for the SERP route.
- **Value:** Medium. "Backed by" claims are common, and logo-dropping investors is the investor-side version of H4.

### Tier C: high effort, blocked, or low marginal value

| Signal | Claim | Access | Status | Effort | Note |
|---|---|---|---|---|---|
| LinkedIn headcount **growth** | "Grew team 3× this year" | Bright Data LinkedIn company `gd_l1vikfnt1wgvvqz95w`. Whether it outputs a growth history is **[U]** (no schema retrieved). Fallback: snapshot now and compare later. | [U] | M | Already in scope for the point-in-time count. Growth over time needs a stored history or the Owler/ZoomInfo datasets (`gd_l1vilaxi10wutoage7`, `gd_m0ci4a4ivx3j5l6nx`), all **[U]** |
| USPTO patents | "Patented technology", "3 patents pending" | PatentsView PatentSearch API | [T-fail]: timed out. We believe it needs a key; **[U]** | L | Pending applications aren't public for 18 months, so "patent pending" is unverifiable in most cases. Google Patents via SERP is the fallback **[U]** |
| USPTO trademarks | Brand or entity name | TSDR API | [T-fail]: 401. Response: "Beginning October 2, you'll need to register for an API key" | M | Low value |
| Delaware / state incorporation | "Delaware C-corp since 2021" | Delaware ICIS entity search (`icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx`) loads with 200 **[T]**, but has no API; scraping it is **[U]** and it is reported to use CAPTCHA **[U]** | Blocked | L | OpenCorporates `api.opencorporates.com/v0.4/companies/search` returned **401 Invalid Api Token** **[T-fail]**. Form D already gives `jurisdictionOfInc` and `yearOfInc` for free, so use that |
| Crunchbase / PitchBook profile | Round history, investors | Bright Data Crunchbase `gd_l1vijqt9jfj7olije`, PitchBook `gd_m4ijiqfp2n9oe3oluj` | [U] | M | These are aggregators that partly ingest Form D and press, so they aren't independent ground truth. Use them as "does an aggregator list this round yet" |
| X follower velocity | "50k followers" | Bright Data X profiles `gd_lwxmeb2u1cniijd7t4` | [U] | L (needs snapshots over time) | Point-in-time follower counts are easy to check. Velocity isn't |
| Wikidata | Founding date, HQ | `wikidata.org/w/api.php?action=wbsearchentities` | [T]: "Clerk Inc" returned 0 hits | S | Not useful for startups |

---

## 2. Top 5 recommended additions, ranked by value ÷ effort

| Rank | Signal | Why it ranks here | Effort | Cost |
|---|---|---|---|---|
| 1 | **Customer-logo check (A1)** | Answers H4, the best-evidenced hidden problem. Every row produces a concrete "ask for this reference" question. It reuses the SERP client Data is already building, and it's on-theme for the Bright Data grand prize | M | Bright Data credits |
| 2 | **ATS hiring check (A2)** | Free JSON with no scraping and no key. It cross-checks the LinkedIn headcount row, which reduces H3 false alarms, and doubles as a hot-deal signal | S–M | Free |
| 3 | **GitHub / npm / PyPI traction (A3)** | All free, all exact numbers with a clean receipt link. Very strong for dev-tool decks, and both demo companies (Daytona, Clerk) are dev tools | S | Free (use a GitHub token) |
| 4 | **Founder-history check (A4)** | Team is the most important decision factor for VCs (more than 55% in Gompers et al.). Harder because of person matching, so show the matched profile and let the analyst confirm | M | Bright Data credits |
| 5 | **Hot-deal flags: SPV Form Ds + Tranco velocity (A5 + B1)** | Both free, and both reuse or extend existing clients. They show as an "interest is rising" banner, not as a truth-table verdict | S | Free |

If the team has only one hour, do **#3 and the Ashby half of #2**. They're free, exact, and demo well on Daytona and Clerk. If testers at Gate 1 confirm H4, do **#1** before anything else.

---

## 3. Confidence-scoring guidance

### Verdict wording
Keep the three verdicts from `PLAN.md` (`match | gap | unverifiable`). In the UI, show the **gap** pill as "Differs from source" and the **unverifiable** pill as "Unverified". Never use "false", "lie", "fake" or "inflated" anywhere: in the UI, the audio brief, or the questions.

| Situation | Verdict value | Panel wording template |
|---|---|---|
| Within tolerance | `match` | "Consistent with {source} ({value}, as of {date})." |
| Outside tolerance, and the source is strong and recent | `gap` | "Differs from {source}: deck says {claimed}, {source} shows {observed} as of {date}." |
| Source exists but is weak, stale or ambiguous | `gap` with `confidence: low` | "Possible difference: {source} shows {observed}. {common legitimate reason}." |
| No source found | `unverifiable` | "No public record found in {sources checked}. This is common for {stage} companies." |
| Context, not a claim check | `signal` (new; see Section 6) | "{fact} (as of {date})." No judgment. |

### Tolerances (proposed; tune with testers)
- **Counts from exact APIs** (GitHub stars, npm/PyPI downloads, App Store rating count): a match is within ±10% or a round-down ("50k+" covers 50,000–59,999). Deck figures are usually rounded and older than the data, so allow for growth since the deck date.
- **Headcount** (LinkedIn or ATS): a match is within ±30% or ±3 people, whichever is larger. A gap is when the claim is more than 2× what we observe. Below that, use low confidence (because of H3).
- **Money raised** (Form D): use the rules already in `form-d-data-guide.md`. Flag only if the difference is more than 25% **and** the filing is more than 90 days old.

### Confidence per source (starting defaults)

| Source | Default | Raise to high when | Lower to low when |
|---|---|---|---|
| SEC Form D | medium | Exact legal-name match **and** a related person matches the deck | Fuzzy name match only, or filing older than 12 months |
| GitHub, npm, PyPI | high | The repo or package is linked from the company's own site | The deck didn't name the repo or package, so we guessed it |
| ATS boards (Ashby, Greenhouse, Lever) | high for "roles listed now" | — | Slug guessed rather than found on the careers page |
| LinkedIn company (Bright Data) | medium | — | Fewer than 20 employees (undercounting), or a services or agency company (overcounting) |
| LinkedIn person (Bright Data) | medium | Profile linked from the deck or company site | Matched by name search only |
| Press via SERP | medium | Two or more independent outlets agree | A single press release, or an aggregator only |
| Customer-site mention (A1) | high when found | Found on the customer's own domain | Found only on the startup's site, or on a third-party listicle |
| Customer-site mention: **absence** | n/a (always `unverifiable`) | — | — |
| Tranco, Wayback, RDAP, HN | low (context) | — | Always low. These are directional |
| Bright Data aggregators (Crunchbase, PitchBook, G2) | low to medium | — | Not independent of the press |

Rules:
1. **Confidence goes down, never up, when sources disagree with each other.**
2. **A row's confidence is the minimum of its entity-match confidence and its source confidence.** A wrong entity is the top false-positive cause (see Form D's "Daytona" example).
3. **Always show the as-of date.** Most "gaps" are timing differences.

---

## 4. "Questions to ask the founder" templates

Keyed to a `question_key` the backend can attach to each row. Each template is non-accusatory and gives the founder an easy, honest way to explain.

| Gap type (`question_key`) | Question |
|---|---|
| `raised_lower_than_claim` | "Form D from {date} shows ${observed} sold. Did the round have later closes, or include SAFEs or notes filed separately? What's the final amount and close date?" |
| `raised_no_filing` | "We couldn't find a Form D. How was the round structured (SAFE, notes, priced), and who led it?" |
| `offering_larger_than_announced` | "The filing lists a ${offering} offering against ${announced} announced. Is the round still open or being extended?" |
| `unannounced_director` | "{name} is listed as a director on the Form D. What's their role, and are they an investor's board seat?" |
| `headcount_higher_than_linkedin` | "How does the {claimed}-person team break down between full-time, contractors and offshore? Where is engineering based?" |
| `hiring_vs_plan` | "You have {n} open roles, mostly in {dept}. How does that map to use of funds and the next 12 months' hiring plan?" |
| `customer_not_public` | "Could we speak with a contact at {customer}? Is it a paid production contract, a pilot or an LOI, and what's the annual contract value?" |
| `customer_removed_from_site` | "{customer} appeared on your customers page in {old_date} but not today. What changed with that account?" |
| `oss_metric_differs` | "The deck says {claimed} {metric}. Public data shows {observed} as of {date}. Which repo or package and time window does your number cover?" |
| `downloads_vs_users` | "How do downloads translate to weekly active developers or paying accounts?" |
| `founder_history_unconfirmed` | "Can you walk me through your role at {employer}: title, team size, and what you shipped?" |
| `investor_not_listed` | "Is {investor} invested through the fund, a scout check or a partner personally? Could we contact them?" |
| `traffic_vs_growth` | "Which metric best shows the growth on slide {n}? Public traffic rank has been {trend} over 90 days." |
| `timeline_mismatch` | "The domain and site history start in {year}, and the deck says founded in {claimed_year}. Was there an earlier product or entity?" |
| `unverifiable_generic` | "We couldn't find public data for '{claim_text}'. What would you share to support it (dashboard screenshot, contract, reference)?" |

---

## 5. "Hot-deal" early signals

These show interest building before the press covers it. Show them as a separate "Momentum" strip, not as truth-table verdicts.

| Signal | Why it leads the press | How to check | Cost / tested | Notes |
|---|---|---|---|---|
| **SPV Form Ds named after the company** | Syndicates form SPVs to buy into an allocation or a secondary. A cluster of "<Company> … a Series of …" filings means demand | EFTS `forms=D&entityName=<Company>`, filtered to fund-style names [T] (Anthropic: 99 hits, mostly SPVs) | **Free, cheap** [T] | Mostly visible for later-stage hot companies. Rare at seed |
| **New Form D or D/A from the company itself** | Filed within 15 days of first sale; vendors claim 7–14 days before press ([Funding Signals](https://funding-signals-api.onrender.com/guide-sec-form-d), vendor claim, unverified) | Already in our client. For real time: `browse-edgar?action=getcurrent&type=D&output=atom` [T earlier, see `edgar-data-access.md`] | **Free, cheap** | Most VC rounds have no Form D (see H7) |
| **Hiring spike** | Hiring follows money, and sometimes leads the announcement | Ashby, Greenhouse or Lever count over time; `publishedAt` dates show recent postings [T for Ashby] | **Free, cheap** for a snapshot | Needs two snapshots for velocity, but `publishedAt` clustering in the last 30 days works from one call |
| **Tranco rank velocity** | Traffic trend predicts next financing ([arXiv 1301.2196](https://arxiv.org/abs/1301.2196)) | `tranco-list.eu/api/ranks/domain/<d>` returns daily history [T] (clerk.com rose from #10,277 to #7,075 in 9 days) | **Free, cheap** | Top-1M domains only |
| **GitHub star velocity** | Developer adoption usually precedes the round for dev tools | `stargazers` with the `star+json` header [T-fail without a token] | Free with a token, cheap | Discount if the jump is sudden and short-lived (fake-star pattern, under 2 months) |
| **npm/PyPI download acceleration** | Same as above | `/downloads/range/last-year/<pkg>` [T] | **Free, cheap** | CI noise. Compare 4-week moving averages |
| **Top-investor portfolio page update** | Firms sometimes list a company before the press release | Wayback CDX on `<vc>/portfolio` plus a diff, or SERP `site:<vc-domain>` | Cheap to medium; [U] | Many firms list only after the announcement. Weak |
| **Delaware entity formation / new related entity** | A new holdco or subsidiary before a round or restructuring | Delaware ICIS (no API, reportedly CAPTCHA) [U]; OpenCorporates needs a token [T-fail] | **Not cheap** | Skip for the hackathon |
| **New domain or subdomain certificates** | New product (`app.`), new customer instance, launch prep | crt.sh JSON [T, flaky] | Free, cheap | Noisy. Good for "launching X soon" |
| **Founder LinkedIn changes** (stealth to named, hiring posts) | Founders announce hires before the round | Bright Data LinkedIn posts `gd_lyy3tktm25m4avu764` [U] | Credits, medium | — |

**Cheapest three to ship:** the SPV Form D filter, Tranco velocity, and Ashby/Greenhouse/Lever `publishedAt` clustering. All are free, one call each, and tested.

---

## 6. Handoff for Data and Extension

### Suggested JSON for new rows (backward-compatible with `PLAN.md`)
Keep every existing field. Add the new optional fields. The extension already ignores unknown fields, so the current fixture still works.

```json
{
  "claim_type": "headcount | raised | round_size | customer | board | oss_traction | hiring | founder_history | investor | app_traction | traffic | timeline | momentum",
  "claim_text": "Over 70k GitHub stars",
  "claimed_value": 70000,
  "observed_value": 71575,
  "source": "linkedin | form_d | press | github | npm | pypi | ats | customer_site | wayback | tranco | rdap | app_store | hn | yc | bright_data_dataset",
  "source_url": "https://github.com/daytonaio/daytona",
  "verdict": "match | gap | unverifiable | signal",
  "confidence": "high | medium | low",
  "note": "Repo is archived (Jul 2026); org repos still active as of 2026-10-09.",

  "kind": "claim_check | signal",
  "via": "github_api | brightdata_serp | brightdata_dataset:gd_lpfll7v5hcqtkxl6l | edgar | free_api",
  "as_of": "2026-10-10T20:40:00Z",
  "entity_match": { "matched_name": "daytonaio/daytona", "method": "linked_from_site | exact_name | fuzzy", "confidence": "high" },
  "evidence": [
    { "label": "stars", "value": 71575, "url": "https://api.github.com/repos/daytonaio/daytona" },
    { "label": "contributors", "value": 233, "url": "https://github.com/daytonaio/daytona/graphs/contributors" }
  ],
  "question_key": "oss_metric_differs",
  "question": "Which repo and time window does the 70k figure cover?",
  "deck_page": 6
}
```

Notes:
- **`verdict: "signal"`** is for momentum and context rows that make no claim. Show a neutral grey-blue "Context" pill, sort these rows below claim checks, and keep them out of the "N gaps · N verified" header count.
- **`kind`** lets the extension split the truth table from the Momentum strip without parsing `claim_type`.
- **`via`** drives the source chip text ("via Bright Data", for the grand prize) and must be set on every Bright Data row.
- **`question`** is pre-rendered by the backend from the Section 4 templates. The extension only displays it, which also covers the "Questions to ask" stretch goal.
- **`observed_value`** may be a string for non-numeric rows ("not found on customer site", "archived").

### Additions to the Data interface (`get_ground_truth`)
Add optional keys. Partial results stay the rule, so one failure never blocks the others.

```python
"github":   {"repo": str, "stars": int, "forks": int, "contributors": int, "archived": bool, "weekly_commits_52": [int], "url": str} | None,
"packages": [{"registry": "npm|pypi", "name": str, "last_month": int, "url": str}],
"jobs":     {"ats": "ashby|greenhouse|lever", "slug": str, "open_roles": int, "by_dept": {str: int}, "posted_last_30d": int, "url": str} | None,
"traffic":  {"tranco_rank": int | None, "rank_30d_ago": int | None, "url": str},
"domain":   {"registered": "YYYY-MM-DD", "first_wayback": "YYYY-MM-DD", "url": str},
"customers":[{"name": str, "mentions_startup": bool | None, "url": str | None, "query": str}],
"spv_filings": [{"entity_name": str, "cik": str, "file_date": str}],
```

### Practical gotchas (all observed in testing)
- **GitHub:**
  - Without a token you get 60 requests/hour; add `GITHUB_TOKEN` to `backend/.env`.
  - `stats/*` endpoints return **202 with an empty body** on first call. Retry up to 3 times, 2 seconds apart.
- **RDAP:** rdap.org has no .io service. Route `.io` to `rdap.identitydigital.services/rdap/domain/`.
- **Timeouts and flakiness:**
  - Wayback CDX and crt.sh are flaky (a timeout and a 502 on first try). Use a 45s timeout, one retry, and always cache.
  - PatentsView timed out. Don't build on it today.
- **Name collisions:**
  - HN "daytona" returns Dodge car stories.
  - EFTS "Daytona" returns hotels and funds.
  - EFTS "Clerk" returns "Clerk Retail, Inc."
  - Always store and show `entity_match.matched_name`.
- **Bright Data dataset IDs** (verified to exist in `scrapers.json`; calls and output fields are untested):
  - LinkedIn company `gd_l1vikfnt1wgvvqz95w`
  - LinkedIn jobs `gd_lpfll7v5hcqtkxl6l`
  - LinkedIn people `gd_l1viktl72bvl7bjuj0`
  - LinkedIn posts `gd_lyy3tktm25m4avu764`
  - Crunchbase `gd_l1vijqt9jfj7olije`
  - PitchBook `gd_m4ijiqfp2n9oe3oluj`
  - G2 `gd_l88xvdka1uao86xvlb`
  - Glassdoor `gd_l7j0bx501ockwldaqf`
  - Trustpilot `gd_lm5zmhwd2sni130p`
  - GitHub repo `gd_lyrexgxc24b3d4imjt`
  - App Store `gd_lsk9ki3u2iishmwrui`
  - Google Play `gd_lsk382l8xei8vzm4u`
  - Reddit posts `gd_lvz8ah06191smkebj4`
  - X profiles `gd_lwxmeb2u1cniijd7t4`
  - Owler `gd_l1vilaxi10wutoage7`
  - ZoomInfo `gd_m0ci4a4ivx3j5l6nx`
  - Indeed jobs `gd_l4dx9j9sscpvs7no2`
  - **No Bright Data scraper found** for Similarweb, Product Hunt, the Chrome Web Store or Y Combinator.

---

## Sources
- Gompers, Gornall, Kaplan & Strebulaev, "How Do Venture Capitalists Make Decisions?" ([NBER digest](https://www.nber.org/digest/dec16/how-do-venture-capitalists-make-decisions), [SSRN](https://papers.ssrn.com/abstract=2801385))
- Gompers, Kovner, Lerner & Scharfstein, "Performance Persistence in Entrepreneurship" ([HLS Forum](https://corpgov.law.harvard.edu/2010/04/16/performance-persistence-in-entrepreneurship-and-venture-capital))
- "The Role of Social Feedback in Financing of Technology Ventures" ([arXiv 1301.2196](https://arxiv.org/abs/1301.2196))
- "Web-based Startup Success Prediction" ([UvA](https://dare.uva.nl/id/7454cfe3-e9c4-4a49-8a48-61ee955dad7e)); "Predicting Startup Funding From Freely, Publicly Available Web Information" ([arXiv 2204.06479](https://arxiv.org/pdf/2204.06479))
- "4.5 Million (Suspected) Fake Stars in GitHub" ([arXiv 2412.13459](https://arxiv.org/html/2412.13459v1))
- GitHub open-source engagement and startup funding ([EBSCO abstract](https://www.ebsco.com/articles/biography/4be864f2-0dfb-514f-8ae4-1f1d88a29bed/beefing-it-up-for-your-investor-engagement-with-open-source-communities-innovation-and-startup-funding-evidence-from-github)); stars vs. funding summary ([Unicorn CTO #124](https://developerfirst.substack.com/p/issue-124))
- SaaStr on deck "alternative facts" ([SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs)); Fortune on diligence ([Fortune](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/))
- Form D as a pre-press signal ([Funding Signals guide](https://funding-signals-api.onrender.com/guide-sec-form-d), vendor); hiring velocity as an indicator ([Parallel](https://parallel.ai/articles/ai-sourcing-how-to-find-acquisition-targets-programmatically.md), vendor)
- Bright Data scraper index: https://docs.brightdata.com/scrapers.json
- Endpoint tests: curl from this session on 2026-10-10. Results are quoted inline.
