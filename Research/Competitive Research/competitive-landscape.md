# VentureSauce Competitive Landscape

*Researched 2026-10-10 under hackathon time limits (about 20 minutes). Every claim links to a source. **[single-source]** means only one source was found, so treat the claim as unverified. Most pricing for enterprise tools comes from third-party estimates because vendors don't publish it.*

---

## Executive summary

- **Same-day Form D alerts are not new and are not a moat.** At least three products already sell them cheaply:
  - **FilingFlow** has a free tier, Pro at $99/mo and Team at $249/mo. It claims filings appear "within hours of EDGAR publication" and offers alerts, webhooks and risk scoring ([FilingFlow blog](https://blog.filingflow.app/2026/03/15/introducing-filingflow-form-d-intelligence-for-dealmakers/)).
  - **Fundz** costs $29–$149/mo and claims a median of 9 minutes from filing to alert ([Fundz pricing](https://www.fundz.net/pricing)).
  - **FormDs.com** processes filings "on a real-time basis" ([formds.com](https://formds.com/)).
  - Apify scrapers sell the same feed for a few dollars per 1,000 filings ([Apify](https://apify.com/jdepablos/startup-funding-feed)).

  VentureSauce's $49 "Alerts" tier sits next to these at the same price.
- **"Databases update weeks late" is only half true in 2026.** Each part of the claim checks out differently:
  - **After a round is announced, incumbents are fast.** In an independent August 2026 benchmark, Crunchbase got the latest round right for 95.1% of rounds announced in the previous 30 days ([Firecrawl / Openbenchmarks](https://www.firecrawl.dev/blog/best-company-funding-data-api)).
  - **The lag figures are weak evidence.** The only numbers found come from a vendor's marketing page: an 11-day median lag from round close to listing for Crunchbase and 14 days for PitchBook **[single-source, vendor claim]** ([NextGen Nexus](https://thenextgennexus.com/fresh-funded/)).
  - **The real gap is filing vs. announcement.** Some rounds file months before the press release, and many are never announced. The pitch already makes this case with the Clerk (104 days) and Daytona examples.
  - **Recommendation:** reword "late" to "**before the announcement, and including rounds that are never announced.**"
- **Price is a weak wedge on its own.** Crunchbase Pro costs $49/mo ([ZoomInfo pipeline](https://pipeline.zoominfo.com/sales/crunchbase-pricing)), Tracxn starts at about $999/yr ([multiples.vc](https://multiples.vc/compare/cb-insights-alternatives)), and Visible costs $0–$129/mo. The "$30K a seat" comparison only holds against PitchBook and CB Insights.
- **The most defensible wedge is the scored-scout network:** deal notes whose calls are timestamped and then graded against later SEC filings.
  - No database or Form D tracker found does this.
  - The closest analog is Chapter One's **Scout Program** (Feb 2026). It runs a public scout leaderboard, but scores scouts on portfolio performance, not on verified pre-filing calls ([Feedbagel](https://feedbagel.com/post/scout-program-platform-for-early-stage-investors-to-build-public-track-records-w)) **[single-source]**.
- **The second wedge is filing-vs-web delta reports** that cite both sources, such as "the filing shows $11.7M unsold but the press says the round closed." FilingFlow scores filings for risk, but no competitor found compares the filing against live web claims.

---

## 1. Incumbent private-market databases

| Product | Price per seat (est.) | Form D ingestion | Target users |
|---|---|---|---|
| **PitchBook** | No public pricing. Single seat roughly $12K–$30K/yr; median about $30K/yr across 125 Vendr deals; API $70K+ ([multiples.vc](https://multiples.vc/compare/pitchbook-alternatives), via search summary) | Yes. Says its 650K+ web crawlers capture "regulatory filings," then data teams verify ([PitchBook research process](https://pitchbook.com/research-process)). An academic paper matches PitchBook issuers to Form D filings ([Cambridge JFQA supplement](https://static.cambridge.org/content/id/urn%3Acambridge.org%3Aid%3Aarticle%3AS0022109023001412/resource/name/S0022109023001412sup001.pdf)). **Speed: insufficient data found.** A vendor claims a 14-day median lag **[single-source]** ([NextGen Nexus](https://thenextgennexus.com/fresh-funded/)) | VC, PE, investment banks, LPs, corporate development |
| **Crunchbase** | Pro $49/mo annual ($99 monthly); Business from about $199/mo ([ZoomInfo pipeline](https://pipeline.zoominfo.com/sales/crunchbase-pricing)) | Third parties say it pulls Form D data ([NextGen Nexus](https://thenextgennexus.com/2026/05/15/funding-02-crunchbase-pro-alternative-real-time/)) **[single-source, not confirmed by Crunchbase]**. Freshness on rounds announced in the last 30 days was 95.1% ([Firecrawl benchmark](https://www.firecrawl.dev/blog/best-company-funding-data-api)). A vendor claims an 11-day median lag **[single-source]** | Sales/GTM teams, founders, smaller investors |
| **CB Insights** | Sources conflict: "$40K–$100K/yr annual contracts" vs "$2,483–$8,333/yr" ([multiples.vc](https://multiples.vc/compare/cb-insights-alternatives), [costbench](https://costbench.com/compare/cb-insights-vs-preqin/)). **Unverified** | Insufficient data found | Corporate strategy, enterprise market intelligence |
| **Tracxn** | Starter about $999/yr; Professional $3K–$5K; Enterprise $10K+ ([multiples.vc](https://multiples.vc/compare/cb-insights-alternatives) via search summary) **[single-source]** | Insufficient data found | VC, corporate development, emerging markets |
| **Dealroom** | Starter €12K/yr for 3 seats; Team €20K for 6; Corporate €40K for 20 ([Ellty](https://www.ellty.com/blog/dealroom-pricing), [Dealroom pricing page](https://dealroom.co/pricing-usd)) | Insufficient data found (EU focus) | European VCs, governments, ecosystems |
| **Preqin** (BlackRock) | costbench lists $2,083–$6,667/yr ([costbench](https://costbench.com/compare/cb-insights-vs-preqin/)). That looks low for an institutional product: **unverified** | Insufficient data found | LPs, fund managers, fund-level data rather than startup rounds |

**Takeaway:** incumbents do use regulatory filings, but none found markets same-day Form D alerting as a product feature. They sell breadth, history and verified rounds, not speed.

## 2. Signal and deal-sourcing tools for VCs

| Product | Price | What it detects | Notes |
|---|---|---|---|
| **Harmonic** | No public pricing. Third parties estimate a $15K/yr minimum, or about $1K–$3K+/mo ([GTM Directory](https://thegtmdirectory.com/tools/harmonic), [vcbacked](https://www.vcbacked.co/blog/best-vc-deal-sourcing-platforms)) | Talent moves, hiring and headcount changes, stealth companies. Earlybird benchmark: tracked 98% of signals vs 75% for legacy tools ([GTM Directory](https://thegtmdirectory.com/tools/harmonic)) **[single-source]** | Markets "real-time" funding alerts including "stealth raises" ([search summary](https://innolope.com/pulse/funding/6a33ebf8ad395cc135add21a)). **Closest well-funded threat.** Benchmark freshness was 81.5% ([Firecrawl](https://www.firecrawl.dev/blog/best-company-funding-data-api)) |
| **Specter** | Custom enterprise pricing ([vcbacked](https://www.vcbacked.co/blog/best-vc-deal-sourcing-platforms)) | Real-time signals on 50M+ companies and 500M+ people ([Specter vs Harmonic](https://www.tryspecter.com/features/vs-harmonic)) | Serves 300+ firms |
| **Affinity** | About $2,000–$2,700 per user per year ([Dropcowboy](https://www.dropcowboy.com/blog/affinity-crm-pricing-is-it-the-right-fit-for-you)) | Relationship-intelligence CRM, not a signal source | A natural **integration target**, not a rival |
| **Grata** | Custom enterprise pricing ([costbench](https://costbench.com/software/financial-data-terminals/grata/)) | Search across lower-middle-market private companies | PE-focused |
| **Sourcescrub** | Pricing not public ([Capterra](https://www.capterra.co.uk/software/1010831/sourcescrub)) | Lower-middle-market company data, conferences, lists | PE and investment banks |
| **Signal by NFX** | Free ([NFX FAQ](https://products.nfx.com/en/articles/4809043-is-signal-free)) | Investor database and founder-investor matching | Not a deal-alert tool |
| **Visible** | $0 / $59 / $129 per month ([Capterra](https://www.capterra.co.uk/software/147240/visible), via search summary) | Investor updates, pipeline, portfolio reporting | Adjacent. Proves small funds will pay $50–$130/mo |

**Takeaway:** signal tools find companies before they raise. VentureSauce finds the raise itself, from an official record. These are complementary: a Harmonic user would still want filing-verified alerts.

## 3. Form D–specific trackers (the direct competitors)

| Product | Price | Latency | Filtering and enrichment |
|---|---|---|---|
| **FilingFlow** | Free / Pro $99/mo / Team $249/mo (+$35 per seat) ([FilingFlow blog](https://blog.filingflow.app/2026/03/15/introducing-filingflow-form-d-intelligence-for-dealmakers/)) | "Within hours of EDGAR publication" (same source). Its live site showed filings from 2026-10-09 with a snapshot cached up to 5 minutes ([filingflow.app](https://filingflow.app/)) | Filters by industry, state, size and exemption; operating-company vs fund classifier; 10 risk flags; Founder Watch; Syndicate Map; Runway Tracker; email, webhook and Slack alerts; API. **The most direct competitor. Launched March 2026** |
| **Fundz** | Starter $29–$39/mo; Pro $49/mo annual ($79 monthly); Strategic $99–$149/mo ([Fundz pricing](https://www.fundz.net/pricing)) | Claims a 9-minute median from filing or wire to alert, 90% within the hour, and 145 funding events a day **[vendor claim, single-source]** | Pulls rounds from SEC filings plus 18 signals (hires, M&A, permits), with decision-makers attached. **Targets sales reps, not investors** |
| **FormDs.com** | Insufficient data found (appears free) | "Real-time basis" ([formds.com](https://formds.com/)) | Search by person, company, industry or region. Adding Form ADV. No visible enrichment |
| **Apify actors** (NexGenData, Source Sauce and others) | About $2–$250 per 1,000 records ([Startup Funding Feed](https://apify.com/jdepablos/startup-funding-feed), [Source Sauce](https://apify.com/sourcesauce/sec-form-d-funding), [Deal-Flow Tracker](https://apify.com/deadwood_data_solutions/sec-form-d-dealflow-tracker)) | "Near-real time" to daily. NexGenData claims 24–72 hours ([NextGen Nexus](https://thenextgennexus.com/fresh-funded/)) | Some filter by ICP; one joins TechCrunch and YC data. Do-it-yourself feeds that make the raw alert a commodity |
| **Audit Analytics Private Placements** | Subscription (price not found) | Data feeds (Feed37/38) | Academic and institutional; available through WRDS ([Audit Analytics](https://auditanalytics.help.ideagen.com/hc/en-gb/articles/24150521096338-Understanding-the-Private-Placements-database)) |
| **n8n / DIY workflows** | Free templates | Polls EDGAR every 10 minutes ([n8n workflow](https://n8n.io/workflows/12851-track-sec-form-d-filings-and-send-issuer-and-investor-data-to-google-sheets/)) | Anyone technical can build the base feed in an afternoon |
| **PrivateRaise** (The Deal) | Subscription (price not found) | Insufficient data found | **Covers PIPEs, SPACs and 144As, not startup Form Ds.** Serves bankers and placement agents ([The Deal](https://thedeal.com/solutions/privateraise)) |
| **Axios Pro Deals** | $599/yr per newsletter, $1,799–$2,499 for all ([Nieman Lab](https://niemanlab.org/reading/axios-pro-deal-newsletters-launch-at-599-annually)) | Daily editorial | Human-curated deal news. Insufficient data on Form D usage |
| **Fortune Term Sheet, StartupFundings, Fintel Form D, Form D bots on X** | Insufficient data found | Insufficient data found | Searches returned nothing usable in the time available. Verify manually before claiming no one does this |

## 4. Scout and track-record platforms

| Product | What it does | Public scoring? |
|---|---|---|
| **Scout Program** (Chapter One, launched Feb 2026) | 10 scouts per season, $100K each, publish their theses, with real-time public standings on portfolio value and outcomes ([Feedbagel](https://feedbagel.com/post/scout-program-platform-for-early-stage-investors-to-build-public-track-records-w)) **[single-source]** | **Yes**, but scored on portfolio performance over years, not on early calls checked against filings. **The closest analog to VentureSauce's scout layer** |
| **AngelList** scouts and syndicates | AngelList has written about a "new kind of scout program" ([AngelList blog](https://angellist.com/blog/a-new-kind-of-scout-program)), and syndicates show lead deals. Specifics on public scoring: **insufficient data found** | Insufficient data found |
| **VC scout programs** (Sequoia, a16z and others) | Scouts invest fund money privately; the practice is spreading ([Bain Capital Ventures](https://baincapitalventures.com/insight/scout-programs-spread-in-silicon-valley/)) | No. Track records stay private |
| **Odin** | Syndicate and SPV administration for 7,000+ VCs, angels and founders (UK) ([search summary, Dealroom/Preqin profiles](https://app.dealroom.co/companies/odin_3)) | No public scoring found |
| **Stonks** | Short live founder pitches to angels and VCs ([Founders Pack](https://founderspack.substack.com/p/stonkscom-expediting-seed-investments)) | No public scoring found |

**Takeaway:** none of the platforms found grades a scout's call ("X is raising a Series A") against the later SEC filing. That check is objective, cheap to automate and timestamped, so it is VentureSauce's clearest gap in the market.

## 5. Competitive matrix

| | Speed to signal | Price | Verification / citations | Scout layer | Target buyer |
|---|---|---|---|---|---|
| **PitchBook** | Post-announcement; lag unverified | ~$12K–$30K+/seat/yr | Analyst-verified; no per-claim filing links found | No | VC, PE, banks |
| **Crunchbase** | Post-announcement; 95% fresh within 30 days of announcement | $49–$199+/mo | Mixed sources | No | GTM, founders, angels |
| **CB Insights / Dealroom / Tracxn / Preqin** | Insufficient data | ~$1K–$100K/yr | Proprietary | No | Enterprise, EU, LPs |
| **Harmonic / Specter** | Pre-raise (headcount and hiring signals) | ~$15K+/yr (est.) | Proprietary signals | No | VC |
| **FilingFlow** | Hours after EDGAR | $0–$249/mo | Links each filing to SEC; risk flags | No | Dealmakers, diligence |
| **Fundz** | Minutes (vendor claim) | $29–$149/mo | SEC-sourced | No | Sales reps |
| **Apify / DIY** | Minutes to daily | Cents per filing | Raw SEC link | No | Builders |
| **Scout Program** | n/a | Free (invite-only) | Public portfolio standings | **Yes (portfolio-based)** | Aspiring VCs |
| **VentureSauce** | Same day as filing | $49–$499/mo | **Filing plus live web, both cited, with delta reports** | **Yes: calls scored against filings** | Small funds, angels, scouts |

## 6. Honest assessment

**Is "databases update weeks late" true in 2026?** Partly.
- **Weak version (don't use it):** "PitchBook and Crunchbase are weeks behind the press." Crunchbase's 95.1% freshness on rounds announced in the last 30 days argues against it ([Firecrawl](https://www.firecrawl.dev/blog/best-company-funding-data-api)). The only hard lag numbers (11 and 14 days) come from a competitor's marketing page **[single-source]**.
- **Strong version (use it):** "Form D can precede the announcement by weeks or months, and many filed rounds are never announced." This is supported by the pitch's own Clerk and Daytona examples (verify in `Market Research/claims-verification.md`) and by NextGen Nexus's observation that "many Form D filers never get coverage" ([NextGen Nexus](https://thenextgennexus.com/2026/05/15/funding-02-crunchbase-pro-alternative-real-time/)).

**Where VentureSauce is not differentiated:**
- **Same-day Form D alerts.** FilingFlow, Fundz, FormDs.com, Apify and n8n all offer them, at $0–$249/mo.
- **"Cheaper than PitchBook."** True, but Crunchbase, Tracxn, FilingFlow and Fundz are all cheaper than PitchBook too.
- **Basic filtering and enrichment.** FilingFlow already has an operating-company vs fund classifier, risk flags and founder tracking.

**Where VentureSauce is differentiated:**
1. **Scored-scout network (most defensible).** Its moat comes from network effects and data that build over time: each scout's hit rate is a proprietary record that grows with every filing, and competitors can't copy history. No one else found grades calls against filings.
2. **Filing-vs-web delta reports with dual citations.** These show the gap between what the company told the SEC and what it told the world, such as unsold amounts, never-announced raises and amount mismatches. Bright Data makes this practical. Competitors could copy it, but none has yet.
3. **Small-fund price point.** Useful only as a wrapper around 1 and 2, not as a wedge by itself.

**Risks:**
- FilingFlow (launched March 2026, $99–$249/mo) could add a community layer.
- Harmonic could add Form D alerts. Its "stealth raises" alerts suggest it may already be close.
- Scout-network cold start: scores mean nothing until enough filings arrive to grade the calls.

## 7. Recommended positioning line

> **"Form D tells you who raised. VentureSauce tells you who called it first, and what the filing says that the press release doesn't."**

Shorter alternative: *"The only deal feed where every tip is graded against the SEC record."*

---

## Sources
- https://multiples.vc/compare/pitchbook-alternatives
- https://costbench.com/software/financial-data-terminals/pitchbook/calculator/
- https://pitchbook.com/research-process
- https://static.cambridge.org/content/id/urn%3Acambridge.org%3Aid%3Aarticle%3AS0022109023001412/resource/name/S0022109023001412sup001.pdf
- https://pipeline.zoominfo.com/sales/crunchbase-pricing
- https://multiples.vc/compare/cb-insights-alternatives
- https://costbench.com/compare/cb-insights-vs-preqin/
- https://www.ellty.com/blog/dealroom-pricing
- https://dealroom.co/pricing-usd
- https://thegtmdirectory.com/tools/harmonic
- https://www.vcbacked.co/blog/best-vc-deal-sourcing-platforms
- https://innolope.com/pulse/funding/6a33ebf8ad395cc135add21a
- https://www.tryspecter.com/features/vs-harmonic
- https://www.dropcowboy.com/blog/affinity-crm-pricing-is-it-the-right-fit-for-you
- https://costbench.com/software/financial-data-terminals/grata/
- https://www.capterra.co.uk/software/1010831/sourcescrub
- https://products.nfx.com/en/articles/4809043-is-signal-free
- https://www.capterra.co.uk/software/147240/visible
- https://filingflow.app/
- https://blog.filingflow.app/2026/03/15/introducing-filingflow-form-d-intelligence-for-dealmakers/
- https://www.fundz.net/pricing
- https://formds.com/
- https://apify.com/jdepablos/startup-funding-feed
- https://apify.com/sourcesauce/sec-form-d-funding
- https://apify.com/deadwood_data_solutions/sec-form-d-dealflow-tracker
- https://auditanalytics.help.ideagen.com/hc/en-gb/articles/24150521096338-Understanding-the-Private-Placements-database
- https://n8n.io/workflows/12851-track-sec-form-d-filings-and-send-issuer-and-investor-data-to-google-sheets/
- https://thedeal.com/solutions/privateraise
- https://niemanlab.org/reading/axios-pro-deal-newsletters-launch-at-599-annually
- https://thenextgennexus.com/fresh-funded/
- https://thenextgennexus.com/2026/05/15/funding-02-crunchbase-pro-alternative-real-time/
- https://www.firecrawl.dev/blog/best-company-funding-data-api
- https://feedbagel.com/post/scout-program-platform-for-early-stage-investors-to-build-public-track-records-w
- https://angellist.com/blog/a-new-kind-of-scout-program
- https://baincapitalventures.com/insight/scout-programs-spread-in-silicon-valley/
- https://app.dealroom.co/companies/odin_3
- https://founderspack.substack.com/p/stonkscom-expediting-seed-investments
