# Market Sizing: VentureSauce

Prepared 2026-10-10. **Everything marked (est.) is our estimate, not a sourced figure.** If a number has only one source, it is marked *single-source / unverified*.

## Executive summary

- **Buyer counts (sourced):**
  - **2,984 US VC firms** at the end of 2025. This was the first-ever decline, down from 3,054. Median firm AUM is **$37.85M** ([NVCA 2026 Yearbook](https://nvca.org/wp-content/uploads/2026/04/NVCA-2026-Yearbook-4.9.26.pdf)).
  - **445,535 active US angel investors** in 2024 ([UNH Center for Venture Research](https://paulcollege.unh.edu/sites/default/files/media/2025-12/FY%202024%20Analysis%20Report%20Final.pdf); *single-source*).
- **Emerging funds under $100M AUM: about 2,000 firms (est.).** The median firm AUM is $37.85M, so more than half of firms are well under $100M. We assume 65–70%.
- **Supply side:** about **5,550** new Form Ds in 2025 came from tech, health and business-services issuers, and about 3,200 of those reported at least $1M sold. That's roughly 15–25 relevant filings per business day (our tally of SEC DERA data; see `claims-verification.md`).
- **Incumbent pricing is bimodal:**
  - PitchBook, CB Insights and Harmonic charge **$10K–$100K/yr**.
  - Crunchbase Pro is **$49/mo**, the same price as our Alerts tier.
  - PitchBook's actual blended revenue per licensed user is about **$5.9K/yr**.
  - VentureSauce's $199/$499 tiers sit in the empty middle. The $49 tier competes head-on with Crunchbase Pro.
- **Market size (all est.):**

| | Size | Basis |
|---|---|---|
| TAM | **~$350M/yr** | US, all buyer types at list prices |
| SAM | **~$40M/yr** | Emerging funds, active tech angels, scouts, venture lenders |
| SOM | **~$2.5–3M ARR by year 3** | ~1,500 individual and ~425 professional subscriptions |
| Year 1 | **~$0.3M ARR** | |

- **Reality check:** PitchBook alone made $671.8M in 2025 from 113,451 licensed users, so the category supports real spend. Our TAM is smaller because we price 10–100× lower.

---

## 1. Primary buyers

| Segment | Count | Source / basis | Confidence |
|---|---|---|---|
| US VC firms (raised a fund in the last 8 vintages) | **2,984** (2025), down from 3,054 | [NVCA 2026 Yearbook](https://nvca.org/wp-content/uploads/2026/04/NVCA-2026-Yearbook-4.9.26.pdf), PitchBook data | High |
| US VC funds raised in 2025 | 585 funds, $67B. The top 10 funds took 32.9% | [NVCA 2026 Yearbook press release](https://nvca.org/press_releases/nvca-releases-2026-yearbook-charts-a-venture-industry-in-transition/) | High |
| First-time funds in 2025 | 101, the lowest since the 2000s | Same | High |
| Median VC firm AUM / median fund size (2025) | $37.85M / $25.95M | NVCA 2026 Yearbook, AUM table | High |
| **Emerging / small funds (< $100M AUM)** | **~1,900–2,100 (est.)** | 65–70% of 2,984 firms, inferred from the $37.85M median. The exact distribution wasn't published: insufficient data | Est. |
| VC investment professionals (seats) | **~9,000–12,000 (est.)** | 2,984 firms × 3–4 investing seats. No direct count found: insufficient data | Est. |
| **Active angel investors** | **445,535** (2024), up 5.5% from 422,350 | [UNH CVR FY2024 report](https://paulcollege.unh.edu/sites/default/files/media/2025-12/FY%202024%20Analysis%20Report%20Final.pdf) | *Single-source* |
| Angels active in tech deals who pay for data (target subset) | **~45,000 (est.)** | Our assumption: 10% of active angels | Est. |
| **VC scouts** | **Insufficient data found** | No public census exists. Scout programs at large firms are typically tens of scouts each. Working guess: 2,000–5,000 in the US (est., unverified) | Low |

## 2. Secondary buyers (people who want to know "who just raised")

| Segment | Count | Source / basis | Confidence |
|---|---|---|---|
| Venture debt market | **$68.8B** across about 1,000 deals in 2025 (a record). Median deal $5.5M | [Runway Growth / PitchBook Venture Debt Review 2025–26](https://runwaygrowth.com/runway-growth-capital-and-pitchbook-release-2025-2026-venture-debt-review-venture-debt-hits-record-68-8-billion/) | Medium (one report, widely re-cited) |
| Venture debt lenders and startup bankers (seats) | **~1,500–2,500 seats (est.)** | Lender count: insufficient data. Assumes ~100 active lenders and bank tech groups × 15–25 bankers | Est. |
| Startup / technical recruiters (agency and in-house) | **Insufficient data** for a startup-specific count. Assume a ~20,000 reachable seat subset (est.) | No reliable census found | Low |
| B2B sales teams prospecting newly funded startups | Large but overlapping with Crunchbase and Apollo. Assume a ~30,000 reachable seat subset (est.) | Crunchbase's core market | Low |
| Wealth advisors targeting newly liquid founders | Not sized | Out of scope for now | n/a |

## 3. Incumbent pricing benchmarks

| Product | Price | Source | Notes |
|---|---|---|---|
| **PitchBook** | ~$12K (Core) / ~$24K (Pro) / ~$40K (Pro Plus) per user/yr. Teams $25K–$40K/yr; $70K+ with API | [costbench](https://costbench.com/software/financial-data-terminals/pitchbook), [multiples.vc](https://multiples.vc/compare/pricing) | Aggregator estimates; PitchBook doesn't publish prices |
| PitchBook actual revenue per licensed user | **~$5,920/yr** ($671.8M ÷ 113,451) | [Morningstar FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1289419/000128941926000013/morn-20251231.htm) | Upper bound; includes direct-data revenue |
| **Crunchbase Pro** | **$49/user/mo** billed annually ($588/yr), or $99 monthly | [ZoomInfo pricing breakdown](https://pipeline.zoominfo.com/sales/crunchbase-pricing), [multiples.vc](https://multiples.vc/compare/pricing) | Published price |
| Crunchbase Business | From ~$199/user/mo | Same | Sales-assisted |
| **CB Insights** | $40K–$100K/yr. Median contract about $47K | [multiples.vc](https://multiples.vc/compare/pricing), [rfp.wiki](https://www.rfp.wiki/enterprise-software-enterprise-application-software-eas-enterprise-service-management-esm/market-competitive-intelligence-platforms/cb-insights/similarweb) | Estimates |
| **Harmonic** | $10K–$30K/yr, enterprise only | [multiples.vc](https://multiples.vc/compare/pricing) | Estimate |
| **Tracxn** | ~$550/mo for a single user; teams $6.5K–$15K/yr | [multiples.vc](https://multiples.vc/compare/pricing) | Estimate |
| **Dealroom** | Premium €12,500/yr (US$14,500); Premium Plus €17,000/yr; 3-seat minimum | [dealroom.co/pricing-usd](https://dealroom.co/pricing-usd), [ellty summary](https://www.ellty.com/blog/dealroom-pricing) | Published |

**What the pricing tells us:**
- The market splits into **$588/yr self-serve** (Crunchbase Pro) and **$10K–$100K/yr enterprise** (everyone else).
- VentureSauce's **$199 tier ($2,388/yr)** and **$499 tier ($5,988/yr)** sit in the gap. At $499, a solo GP pays about the same as PitchBook's average revenue per user, but with no annual contract or demo.
- The **$49 tier needs a reason to beat Crunchbase Pro** at the same price. Same-day Form D alerts with a "remaining unsold" flag is that reason.

## 4. TAM / SAM / SOM (bottom-up, all estimates)

Annual prices used: Alerts $49/mo = **$588/yr**; Delta reports $199/mo = **$2,388/yr**; Scout network $499/mo = **$5,988/yr**.

### TAM: every US buyer at list price (est.)

| Segment | Units | Tier mix | Annual $ |
|---|---|---|---|
| Active angels | 445,535 | $49 | $262M |
| VC firm seats | ~11,900 (2,984 × 4) | 50% $199 / 50% $499 | $50M |
| VC scouts | ~3,000 (est.) | $49 | $1.8M |
| Venture lenders and startup bankers | ~2,000 seats | $199 | $4.8M |
| Recruiters plus B2B sales (reachable subset) | ~50,000 seats | $49 | $29M |
| **TAM** | | | **~$350M/yr** |

Angels are 75% of the TAM by dollars but the hardest to convert. Treat the angel line as a ceiling.

### SAM: who we can reach and serve in the first 2–3 years (est.)

| Segment | Units | Tier | Annual $ |
|---|---|---|---|
| Emerging funds < $100M | ~2,000 firms × 2 seats | 75% $199 / 25% $499 | $14.1M |
| Tech-active angels who pay for data | ~45,000 (10% of angels) | $49 | $26.5M |
| Scouts | ~2,000 | $49 | $1.2M |
| Venture lenders and startup bankers | ~1,000 seats | $199 | $2.4M |
| **SAM** | | | **~$44M/yr** |

### SOM: realistic capture (est.)

| | Year 1 | Year 3 |
|---|---|---|
| Angels and scouts on $49 | 300 → $176K | 1,500 → $882K |
| Fund seats on $199 | 40 → $96K | 400 (≈200 funds × 2) → $955K |
| Fund seats on $499 | 10 → $60K | 75 → $449K |
| Lender and banker seats on $199 | 0 | 150 → $358K |
| **ARR** | **~$0.33M** | **~$2.6M** |

- **Market share:** Year 3 is about 6% of SAM. Fund penetration is about 10% of emerging funds, which is aggressive but plausible for a niche tool.
- **Payback logic for a fund:** one extra allocation in an open round (Daytona had $11.7M unsold on filing day) pays for years of the $499 tier.
- **Sensitivity:** The SOM moves most with fund conversion. Every 100 extra fund seats on $199 adds about $0.24M ARR. Every 1,000 extra angels on $49 adds about $0.59M ARR.

## 5. Caveats

- **Pricing data:** Incumbent prices other than Crunchbase and Dealroom are aggregator or procurement estimates (costbench, multiples.vc, Vendr-style data). Treat them as directional.
- **Angel count:** UNH CVR is the only systematic US angel census, and its counts are survey-based extrapolations. We found no 2025 figure.
- **Scouts and lenders:** No census exists for either group. Both counts are labeled guesses.
- **US-only scope:** Form D is US-only, and global incumbents sell worldwide. Non-US buyers investing in US startups are upside not counted here.
- **Shrinking base:** The VC firm count is falling (3,054 → 2,984) and first-time funds are at a multi-decade low. Emerging managers are cost-sensitive, which helps the low-price pitch, but there are fewer of them.

## Sources

- [NVCA 2026 Yearbook (PDF), data by PitchBook](https://nvca.org/wp-content/uploads/2026/04/NVCA-2026-Yearbook-4.9.26.pdf)
- [NVCA 2026 Yearbook press release](https://nvca.org/press_releases/nvca-releases-2026-yearbook-charts-a-venture-industry-in-transition/)
- [UNH Center for Venture Research FY2024 angel market report](https://paulcollege.unh.edu/sites/default/files/media/2025-12/FY%202024%20Analysis%20Report%20Final.pdf) (single source)
- [Runway Growth Capital / PitchBook 2025–2026 Venture Debt Review](https://runwaygrowth.com/runway-growth-capital-and-pitchbook-release-2025-2026-venture-debt-review-venture-debt-hits-record-68-8-billion/)
- [Morningstar FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1289419/000128941926000013/morn-20251231.htm): PitchBook revenue, licensed users, client accounts
- [SEC DERA Form D data sets](https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets): 2025 issuer mix, our tally
- [multiples.vc: financial data platform pricing (verified Aug 2026)](https://multiples.vc/compare/pricing)
- [costbench: PitchBook pricing](https://costbench.com/software/financial-data-terminals/pitchbook)
- [ZoomInfo: Crunchbase pricing breakdown 2026](https://pipeline.zoominfo.com/sales/crunchbase-pricing)
- [Dealroom USD pricing](https://dealroom.co/pricing-usd)
- [ellty: Dealroom pricing summary](https://www.ellty.com/blog/dealroom-pricing)
- [rfp.wiki: CB Insights pricing](https://www.rfp.wiki/enterprise-software-enterprise-application-software-eas-enterprise-service-management-esm/market-competitive-intelligence-platforms/cb-insights/similarweb)
