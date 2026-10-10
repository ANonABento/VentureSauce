# Pitch Claims Verification

Checked 2026-10-10 against SEC EDGAR primary filings, Morningstar's FY2025 10-K and company announcements. Each claim is numbered as in `Hackathon Context/pitch-summary.md`.

## Executive summary

| # | Claim | Verdict | Correct figure |
|---|---|---|---|
| 1 | 34,553 Form D offerings in 2025 | **Verified**, with a caveat | 34,553 new Reg D offerings (SEC DERA). About **51% are pooled funds** and only about **16% (~5,500)** are tech, health or business-services companies |
| 2 | $2.39T raised | **Verified**, with a caveat | $2,391.5B, but **89% ($2,118B) went to pooled funds**. Operating companies raised $273B |
| 3 | Clerk Series C: filed Jul 3, announced Oct 15 (104 days) | **Verified** | Form D filed 2025-07-03 and blog post dated 2025-10-15 = 104 days. First sale was 2025-06-17, 120 days before the announcement |
| 4 | Daytona Series A: 6 days from filing to announcement | **WRONG** | Form D filed **2026-02-05** and press release went out **2026-02-05**, so **0 days** (same day). First sale (2026-01-22) to announcement was 14 days |
| 5 | Daytona mid-2026 raise: filed, never announced | **Partly true** | Form D filed 2026-08-17. We found no company press release or blog post. However, AlleyWatch and Dealroom reported it from the filing the same day |
| 6 | Daytona filing showed $11.7M still unsold | **Verified** (as of 2026-08-17) | $60,000,000 offered, $48,274,000 sold, **$11,726,000 remaining** |
| 7 | PitchBook revenue of $672M in 2025 | **Verified** | $671.8M (Morningstar FY2025 10-K, up 8.6% from $618.4M) |
| 8 | About $30K per seat per year | **Partly true / overstated** | Reported PitchBook list seats run about $12K–$40K/user/yr (estimates). PitchBook's actual blended revenue is about **$5.9K per licensed user** ($671.8M ÷ 113,451 users). Crunchbase Pro costs **$49/mo** |

**Must fix before the next Sense Check:** claim 4 (Daytona was same-day, not 6 days). Also soften claim 5 ("no company announcement" rather than "never announced") and claim 8.

**Better story the data supports:** among our two examples, filing-to-press lag ranges from **0 days (Daytona Series A) to 104 days (Clerk Series C)**, and one round (Daytona, Aug 2026) has **no company announcement at all**. That variance is the product's value: you can't know which rounds the press will miss, so you watch EDGAR.

---

## 1. "34,553 Form D offerings filed in 2025"

- **Verdict:** Verified.
- **Figure:** SEC DERA reports 34,553 new Reg D offerings in 2025, up from 32,554 in 2024 ([SEC press release 2026-29, as cited by AIN](https://angelinvestorsnetwork.com/market-analysis/sec-form-d-private-placements-2026-data); [SEC Reg D statistics page](https://www.sec.gov/data-research/statistics-data-visualizations/regulation-d-offerings)).
  - The SEC page returned HTTP 403 to our fetcher, so this figure comes through the secondary source.
  - Our own independent count from the [SEC DERA Form D data sets](https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets) (2025 Q1–Q4, original `D` submissions only) is **34,717**. That is within 0.5% of the official figure; the gap comes from quarter-assignment and revision methodology. Treat the claim as confirmed by two independent sources.
- **Caveat: what the 34,553 actually contains.** Our tally of the DERA 2025 data sets by Form D "industry group":

| Bucket | New Form Ds | Share |
|---|---|---|
| Pooled investment funds (hedge, PE, VC, other funds) | 17,735 | 51.1% |
| Other financial (investing, banking, insurance) | ~1,490 | ~4% |
| Real estate (commercial, residential, other RE, REITs, construction) | ~4,695 | ~13.5% |
| "Other" (unclassified, plus energy, retail, restaurants, manufacturing, etc.) | ~5,250 | ~15% |
| **Tech, health, biotech, pharma, telecom, business services (startup-like)** | **~5,550** | **~16%** |
| of which reported ≥ $1M sold | ~3,200 | |
| of which reported ≥ $5M sold | ~1,670 | |

  - **Estimate:** about **3,000–5,500 operating-startup Form Ds a year** are relevant to VC buyers.
  - The ≥$1M count (~3,200) is the better "real venture round" proxy.
  - The SEC-commissioned McCann analysis of 2009–2022 filings found a similar mix: funds were about 37% of deals, tech about 15%, real estate about 15% ([SEC presentation](https://www.sec.gov/files/craig-mccann-presentation-092123.pdf)).
- **Suggested wording:** "Over 34,000 private offerings hit the SEC in 2025. About 5,000 of them are startups in tech and health, and most never get a press release on filing day."

## 2. "$2.39T raised through those offerings"

- **Verdict:** Verified.
- **Figure:** $2,391.5B in 2025 per the SEC DERA statistics page ([AIN summary of SEC data](https://angelinvestorsnetwork.com/market-analysis/sec-form-d-private-placements-2026-data)). This is the same chain of sources as claim 1.
- **Caveats:**
  - **$2,118.3B (89%) went to pooled investment funds.** Operating companies and other non-fund issuers raised $273.2B.
  - Median amount sold was $2.5M versus a $62.3M mean.
  - The SEC notes that its totals may undercount, because some issuers never file.
- **Suggested wording:** Drop $2.39T from the startup story, because it's mostly fund money. If you keep it, say "$2.4T in private placements, $273B of it into operating companies."

## 3. "Clerk Series C: filed Jul 3, announced Oct 15 (104 days)"

- **Verdict:** Verified.
- **EDGAR record:**

| Field | Value |
|---|---|
| Issuer | CLERK, INC. (San Francisco, CA) |
| CIK | **0001959758** |
| Accession | 0001959758-25-000004 |
| Filed / signed | **2025-07-03** |
| Date of first sale | **2025-06-17** |
| Total offering amount | **$50,000,000** |
| Total amount sold | **$49,999,982** |
| Remaining | **$18** (the round was closed by the time it was filed) |
| Investors | 8, all accredited |
| Securities | Equity, options, securities to be acquired on exercise |
| Exemption | Rule 506(b) |

- **Announcement:** "Clerk raises $50m Series C from Menlo and Anthropic's Anthology Fund." The `datePublished` on the post is **2025-10-15** ([clerk.com/blog/series-c](https://clerk.com/blog/series-c)). The $50M amount is corroborated by [traded.co](https://traded.co/vc/deal/clerk-raises-50-million-in-series-c-round-led-by-menlo-and-anthropic/).
- **Math:** Jul 3 → Oct 15, 2025 = **104 days**. First sale → announcement = 120 days.
- **Caveats:**
  - The round was fully sold when filed ($18 left), so the "while pro-rata is still open" framing doesn't fit Clerk. The value here is the 104-day information lead, not access to an open round.
  - The filing came 16 days after first sale, one day past the 15-day deadline (see the Form D timing section below).
- **Suggested wording:** "Clerk's $50M Series C was on EDGAR on July 3, 2025. The announcement came October 15, 104 days later."

## 4. "Daytona Series A: 6 days from filing to announcement"

- **Verdict:** **WRONG.**
- **EDGAR record:**

| Field | Value |
|---|---|
| Issuer | Daytona Platforms Inc. (San Francisco, CA) |
| CIK | **0001977563** |
| Accession | 0001977563-26-000001 |
| Filed / signed | **2026-02-05** |
| Date of first sale | 2026-01-22 |
| Total offering amount | $23,797,784 |
| Total amount sold | $23,259,739 |
| Remaining | $538,045 |
| Investors | 9 |
| Exemption | Rule 506(b) |

- **Announcement:** "Daytona Raises $24M Series A to Give Every Agent a Computer" went out on PR Newswire dated **Thursday, February 5, 2026** ([VCA Online repost](https://www.vcaonline.com/news/2026020508/daytona-raises-24m-series-a-to-give-every-agent-a-computer/), [StreetInsider/PRNewswire](https://www.streetinsider.com/PRNewswire/Daytona+Raises+%2424M+Series+A+to+Give+Every+Agent+a+Computer/25955285.html)). [tech.eu](https://tech.eu/2026/02/06/daytona-raises-24m-series-a-to-build-agent-native-compute-infrastructure/) covered it on Feb 6.
- **Correct figure:** **0 days** from filing to announcement (same day). First sale to announcement was 14 days. The "6 days" figure has no supporting source that we could find.
- **Suggested wording:** "Daytona announced its Series A the same day it filed. Clerk waited 104 days. You can't predict which kind of round you're looking at, so watch the filings."

## 5. "Daytona mid-2026 raise: filed, never announced"

- **Verdict:** Partly true.
- **EDGAR record:**

| Field | Value |
|---|---|
| Accession | 0001977563-26-000002 (new filing, not an amendment) |
| Filed / signed | **2026-08-17** |
| Date of first sale | 2026-07-31 |
| Offering / sold / remaining | $60,000,000 / $48,274,000 / $11,726,000 |
| Investors | 6 |
| Exemption | Rule 506(b) |

- **Company announcement:** We found none. Daytona's blog ([daytona.io/dotfiles](https://www.daytona.io/dotfiles)) still shows the Series A post as its latest funding news, and searches turned up no press release.
- **Third-party coverage:** The round *was* reported from the filing, by [AlleyWatch on 2026-08-17](https://alleywatch.com/2026/08/the-alleywatch-startup-daily-funding-report-8-17-2026/) ("according to a recent SEC filing") and by [Dealroom](https://dealroom.co/news/145417-daytona-lands-48-3m-series-b-for-ai-agent-sandbox-platform/), which labels it a $48.3M Series B. "Series B" is a tracker's label: the Form D doesn't name the series.
- **Suggested wording:** "Daytona's $48M August round has no company announcement. The only coverage came from trackers that read the Form D." Don't say "never announced", and don't call it a "Series B" as fact.

## 6. "Daytona's filing showed $11.7M still unsold"

- **Verdict:** Verified, as of the filing date.
- **Figure:** `totalRemaining` = $11,726,000 on the 2026-08-17 Form D ([EDGAR filing index](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001977563&type=D)).
- **Caveat:** This is a snapshot from Aug 17. Rule 503 doesn't require an amendment just because more securities are sold, so the remaining $11.7M may have been filled since without any new filing. As of today, no Form D/A has been filed.
- **Suggested wording:** "When Daytona filed in August, $11.7M of its $60M round was still unsold."

## 7. "PitchBook revenue of $672M in 2025"

- **Verdict:** Verified.
- **Figure:** PitchBook segment revenue was **$671.8M** in 2025, up from $618.4M (+8.6%), with $664.5M of it license-based. Adjusted operating income was $210.1M, a 31.3% margin. PitchBook had about 10,200 client accounts and **113,451 licensed users** at 2025-12-31.
- **Sources:** [Morningstar FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1289419/000128941926000013/morn-20251231.htm) and the [Q4/FY2025 press release](https://newsroom.morningstar.com/news/news-details/2026/Morningstar-Inc--Reports-Fourth-Quarter-Full-Year-2025-Financial-Results/default.aspx).
- **Caveat:** The press release states $172.6M for **Q4 only**; don't confuse the two figures.
- **Suggested wording:** Keep "PitchBook made $672M in 2025."

## 8. "About $30K per seat per year for incumbent databases"

- **Verdict:** Partly true. The figure is overstated as an average and fair only for top-tier list prices.
- **Evidence:**
  - PitchBook reported plan pricing runs about **$12K / $24K / $40K per user per year** for Core, Pro and Pro Plus ([costbench](https://costbench.com/software/financial-data-terminals/pitchbook)). Team contracts run $25K–$40K per year ([multiples.vc](https://multiples.vc/compare/pricing)). Both are aggregator estimates; PitchBook doesn't publish prices.
  - PitchBook's blended **revenue per licensed user is about $5,900** ($671.8M ÷ 113,451, from the 10-K). That's an upper bound, since it includes direct-data revenue.
  - CB Insights contracts reportedly run $40K–$100K per year; Harmonic $10K–$30K per year ([multiples.vc](https://multiples.vc/compare/pricing)).
  - **Crunchbase Pro is $49/mo annual or $99/mo monthly** ([ZoomInfo pricing breakdown](https://pipeline.zoominfo.com/sales/crunchbase-pricing)). That's the same price as our Alerts tier, so the "incumbents are expensive" line is false at the low end.
- **Suggested wording:** "PitchBook seats list at roughly $12K–$40K a year. The $49 tools, like Crunchbase Pro, update after the press release."

---

## Form D timing: the 15-day rule and what it means for "same-day alerts"

- **The rule:** Form D is due **within 15 calendar days after the first sale** of securities. If the deadline falls on a weekend or holiday, it moves to the next business day ([17 CFR 230.503](https://www.ecfr.gov/current/title-17/section-230.503); the 15-day deadline is also stated in [AIN's summary](https://angelinvestorsnetwork.com/market-analysis/sec-form-d-private-placements-2026-data)).
- **Filing late doesn't cost the exemption.** Rule 507 lets a court bar an issuer from using Reg D if it has been enjoined for failing to file. That's why some issuers file late, and some never file.
- **Our three examples:**

| Round | First sale | Filed | Days after first sale |
|---|---|---|---|
| Clerk C | 2025-06-17 | 2025-07-03 | 16 (1 day past the deadline) |
| Daytona A | 2026-01-22 | 2026-02-05 | 14 |
| Daytona Aug-26 | 2026-07-31 | 2026-08-17 (Mon) | 17 (the deadline fell on Fri Aug 15) |

- **What this means for the product:** "The day the Form D is filed" is typically **about 2 weeks after money starts moving**. Rounds are often fully sold by then (Clerk had $18 left). Pitch it as "before the press" and not as "before the round closes." Use the `totalRemaining` field to flag the rounds that are actually still open.
- **Selection bias:** Some startups file only once a round is fully closed, and some never file (SAFE-only pre-seeds often don't). Coverage won't be 100%.

## Sources

**Primary: SEC EDGAR**
- [Clerk, Inc. EDGAR filings (CIK 0001959758)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001959758&type=D)
- [Clerk Form D, 2025-07-03 (accession 0001959758-25-000004)](https://www.sec.gov/Archives/edgar/data/1959758/000195975825000004/primary_doc.xml)
- [Daytona Platforms Inc. EDGAR filings (CIK 0001977563)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001977563&type=D)
- [Daytona Form D, 2026-02-05 (accession 0001977563-26-000001)](https://www.sec.gov/Archives/edgar/data/1977563/000197756326000001/primary_doc.xml)
- [Daytona Form D, 2026-08-17 (accession 0001977563-26-000002)](https://www.sec.gov/Archives/edgar/data/1977563/000197756326000002/primary_doc.xml)
- [SEC DERA Form D data sets](https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets): 2025 Q1–Q4, our own tally
- [SEC Regulation D Offerings statistics page](https://www.sec.gov/data-research/statistics-data-visualizations/regulation-d-offerings)
- [SEC "Regulation D: Issuers, Investors and Intermediaries" (McCann presentation)](https://www.sec.gov/files/craig-mccann-presentation-092123.pdf)
- [17 CFR 230.503: Form D filing requirement](https://www.ecfr.gov/current/title-17/section-230.503)
- [17 CFR 230.507: disqualification for failing to file Form D](https://www.ecfr.gov/current/title-17/section-230.507)
- [Morningstar FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1289419/000128941926000013/morn-20251231.htm)

**Company announcements**
- [Clerk blog: Series C (dated 2025-10-15)](https://clerk.com/blog/series-c)
- [Daytona Series A press release via VCA Online (2026-02-05)](https://www.vcaonline.com/news/2026020508/daytona-raises-24m-series-a-to-give-every-agent-a-computer/)
- [Daytona Series A press release via StreetInsider/PRNewswire](https://www.streetinsider.com/PRNewswire/Daytona+Raises+%2424M+Series+A+to+Give+Every+Agent+a+Computer/25955285.html)
- [Daytona blog (Dotfiles Insider)](https://www.daytona.io/dotfiles)
- [Morningstar Q4/FY2025 results press release](https://newsroom.morningstar.com/news/news-details/2026/Morningstar-Inc--Reports-Fourth-Quarter-Full-Year-2025-Financial-Results/default.aspx)

**Secondary**
- [Angel Investors Network: SEC Form D data, 2025](https://angelinvestorsnetwork.com/market-analysis/sec-form-d-private-placements-2026-data)
- [tech.eu: Daytona Series A coverage (2026-02-06)](https://tech.eu/2026/02/06/daytona-raises-24m-series-a-to-build-agent-native-compute-infrastructure/)
- [AlleyWatch daily funding report, 2026-08-17](https://alleywatch.com/2026/08/the-alleywatch-startup-daily-funding-report-8-17-2026/)
- [Dealroom news: Daytona $48.3M](https://dealroom.co/news/145417-daytona-lands-48-3m-series-b-for-ai-agent-sandbox-platform/)
- [traded.co: Clerk $50M Series C](https://traded.co/vc/deal/clerk-raises-50-million-in-series-c-round-led-by-menlo-and-anthropic/)
- [costbench: PitchBook pricing](https://costbench.com/software/financial-data-terminals/pitchbook) (estimate; unverified)
- [multiples.vc: platform pricing comparison](https://multiples.vc/compare/pricing) (estimate; unverified)
- [ZoomInfo: Crunchbase pricing breakdown](https://pipeline.zoominfo.com/sales/crunchbase-pricing)
