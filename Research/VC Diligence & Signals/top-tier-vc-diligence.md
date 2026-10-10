# How Top-Tier VCs Run Diligence (and where VentureSauce fits)

*Research note, 2026-10-10. Owner: Research role. Product: **VentureSauce**, a Chrome side panel that checks pitch-deck claims against SEC Form D, LinkedIn and the press.*

*Companion to [`../Investor Networks/how-investor-networks-work.md`](../Investor%20Networks/how-investor-networks-work.md), which covers deal-flow sourcing, herding, and the FTX, Builder.ai and Theranos case summaries. This note does not repeat that material. It covers what happens **after** a deal arrives.*

**Legend.** **[FACT]** = sourced data, a documented event, or a primary document. **[OPINION]** = a practitioner's view or our own inference. **[SINGLE SOURCE, UNVERIFIED]** = only one source found, or only an aggregator, vendor or search-summary source. "Insufficient data found" means we looked and found nothing reliable.

**Source-quality caveat.** Exa search hit its rate limit early, so most discovery used a general web search. Where we could open the page, we checked the claim against it. Claims we saw only in a search-result summary (page blocked: HTTP 403 or 429, or paywalled) are flagged.

---

## Executive summary

1. **The funnel is about 100 to 1, and most of the cut happens before any real diligence.** The median VC firm considers about **101 opportunities per closed deal**. It meets management on 28, takes 10 to a partner meeting, runs formal diligence on about 5, offers 1.7 term sheets, and closes 1 ([Gompers, Gornall, Kaplan & Strebulaev, NBER w22587](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf), Table 6). [FACT] So roughly **72% of companies are rejected on the deck and the founder's story alone**, before a meeting. That is where unverified claims do the most work.
2. **"Full" diligence is smaller than people think, and it is mostly about people.** Average deal: **83 days to close, 118 hours of diligence, 10 references called**. Early stage: 73 days, 81 hours, 8 references. Late stage: 106 days, 184 hours, 13 references (same paper, Table 9). [FACT] The team is the most important selection factor for 47% of VCs and an important one for 95% (same paper). [FACT]
3. **Memos follow one recognisable template.** Sequoia's public business-plan outline (purpose, problem, solution, why now, market, competition, business model, team, financials) ([Sequoia](https://sequoiacap.com/article/writing-a-business-plan)) closely matches the structure of real memos released through litigation or by firms themselves: Sequoia's YouTube memo (2005) and Bessemer's Shopify and Pinterest memos. All of them add a **Deal / terms** section and a **Key risks** section. [FACT]
4. **Firms differ most in who can say yes.** About half of VC funds need a unanimous partner vote, 20% use consensus with vetoes, and 15% use a majority vote (Gompers et al., Table 32). [FACT] a16z is widely described as a "single trigger-puller" firm, Benchmark as an equal-partner consensus firm with no associates, and Founders Fund as tiering approvals by check size. [All three SINGLE SOURCE, UNVERIFIED: aggregator profiles only]
5. **Speed kills diligence, and it is documented.** Pre-emptive term sheets skip formal diligence by design (Gompers et al., footnote 8). [FACT] In 2021, Tiger Global outsourced research to Bain (paying it **over $100M a year**), and **Bain flagged SBF's web of FTX-linked entities as a risk. Tiger invested anyway** ([Bloomberg Law](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence)). [FACT] Correlation Ventures openly relies on the lead investor's vetting plus a 30-minute call ([MIT Technology Review](https://www.technologyreview.com/2012/07/09/185027/an-algorithm-to-pick-startup-winners/)). [FACT]
6. **Big firms' in-house tooling points at sourcing, not claim verification.** EQT's Motherbrain, SignalFire's Beacon, a16z's Applied Software Group, Correlation's model and Harmonic all track **who to talk to**: hiring, talent moves, web traffic, funding events. None of the public descriptions mentions automatically checking **what a founder told you** against filings. [FACT for the descriptions; OPINION that this is a gap]
7. **For VentureSauce:** the best slot is **between deck receipt and the first meeting** (decks get about 3–4 minutes each), with a second use **before a pre-emptive or fast-close term sheet**. Lead with things the extension can actually check (raise history, investors, directors, headcount, dates). It can also produce **backchannel targets and founder questions**. It should not try to replace reference calls, customer calls, data-room cohort work, technical diligence or the IC judgment. [OPINION]

---

## 1. The diligence process, step by step

### 1.1 The generic funnel (best data we have)

**[FACT]** From the survey of 885 institutional VCs (82% of them partners) ([NBER w22587 PDF](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf); [NBER Digest](https://www.nber.org/digest/dec16/w22587.html); [HLS Forum summary](https://corpgov.law.harvard.edu/2019/08/20/how-do-venture-capitalists-make-decisions)):

| Stage | Who does it (per paper) | Deals reaching stage per 1 closed deal |
|---|---|---|
| Considered | "Individual originator (senior partner, junior partner, associate, or venture partner)" | 101 (IT VCs: 151; healthcare: 78) |
| Met management | Originator meets founders "at least once" | 28 |
| Reviewed at partners meeting | Originator brings it "to other members of the VC firm" | 10 |
| Formal due diligence | "Calling more references, conducting industry analysis and peer comparison" | ~5 (median 12 per year, vs. 4 closes) |
| Term sheet offered | — | 1.7 (about 60% close rate, so many deals are competitive) |
| Closed | Legal docs, commitment letter | 1 (median firm closes about 4 deals a year) |

- **[FACT]** Footnote 8 of the paper: "VC firms occasionally provide 'preemptive' term sheets even before formal due diligence, in an attempt to lock-up a deal."
- **[FACT]** Larger and more successful firms meet more companies and start diligence on more firms per closed deal, "consistent with larger VC firms employing more junior partners in sourcing and evaluating deals." The average firm has **14 people, 5 senior partners, and about one junior deal person for every two partners** (Table 28).
- **[FACT]** Decision rules for initial investments: unanimous 49%, unanimous minus one 7%, consensus with veto 20%, majority 15%, independent decisions 4% (Table 32).

### 1.2 Sequoia

| Step | What we found | Status |
|---|---|---|
| Sourcing | Scouts (covered in the networks note), partners, and the **Arc** seed program. Arc has an open application and a "sourced track" where founders are invited after a term sheet ([Causo guide](https://hub.causo.ai/how-to-apply-to-sequoia-arc-2026); [TechCrunch 2022](https://techcrunch.com/2022/07/07/sequoia-wants-to-invest-1-million-in-your-idea-then-teach-you-how-to-really-sell-it)) | [FACT for Arc's existence; "sourced track": SINGLE SOURCE, UNVERIFIED] |
| Long courtship | Sequoia says it met Thumbtack's founders 3 years before investing, and Jack Dorsey 18 months before Square ([Sequoia, "Sequoia and Seed Investing"](https://sequoiacap.com/article/sequoia-and-seed-investing)) | [FACT, firm's own account via search summary] |
| First meetings → memo | Roelof Botha's sworn testimony: after "at least two separate meetings" with YouTube's founders, he "prepared an investment memorandum for the Sequoia partnership… providing a recommendation" ([Botha declaration and memo, Viacom v. YouTube exhibits, via Jarvis](https://www.alexanderjarvis.com/the-confidential-youtube-investment-memo-by-sequoia-you-were-never-meant-to-see/); [PDF](https://thevcfactory.com/wp-content/uploads/2023/12/Sequoia-Capital-YouTube-Investor-Memo-1.pdf)) | [FACT, court exhibit] |
| Partnership decision | The memo is addressed to the partnership ("To: Investors") and asks the partners to approve the deal. Founders also presented to "certain partners" | [FACT] |
| Partner-meeting culture | Don Valentine reportedly told newcomers they could attend partner meetings, but "we don't want to hear you unless we ask you a question" ([Confluence VC Weekly](https://confluencevcweekly.beehiiv.com/p/lessons-from-don-valentine)) | [SINGLE SOURCE, UNVERIFIED] |
| Term sheet / structure | YouTube: two-stage, milestone-based deal ($1M seed, then a $4M Series A once milestones were hit, including "sign up at least five advertisers" and handling "one million video views per day"). Target ownership about 30% | [FACT, memo] |
| Timeline | Botha met the founders in August–September 2005, the memo is dated 2 September 2005, and the investment closed in Q4 2005 (same exhibit) | [FACT] |

### 1.3 a16z (Andreessen Horowitz)

| Step | What we found | Status |
|---|---|---|
| Who | General partners and "deal partners" run vertical funds (an a16z deal-partner job listing exists: [NVCA careers](https://nvca.org/careers/deal-partner-growth-health-andreessen-horowitz/)) | [FACT that the role exists] |
| Decision rule | "Single trigger-puller": the lead partner decides after the weekly partnership meeting, where colleagues give feedback rather than permission ([vcbeast](https://vcbeast.com/how-vc-firms-are-structured); [ZeroG Talent](https://zerogtalent.com/blog/company-culture-at-andreessen-horowitz); [Walturn](https://walturn.com/insights/decision-making-in-venture-capital-firms-who-holds-the-power-and-how-deals-get-approved)) | [SINGLE SOURCE, UNVERIFIED: aggregator blogs only. We did not find a primary a16z document stating this] |
| Scaling | Each vertical fund reportedly runs like a small VC with at most about 5 GPs ([The VC Corner on Ben Horowitz](https://www.thevccorner.com/p/a16z-15b-raise-ben-horowitz-venture-scaling?r=1krivi)) | [SINGLE SOURCE, UNVERIFIED] |
| Judging founders | Ben Horowitz: invest in "strength over lack of weakness" (quoted in [VentureBeat interview](https://venturebeat.com/business/ben-horowitz-on-how-to-be-an-uber-investor-and-breed-technical-ceos/); [Hackernoon annotation](https://hackernoon.com/cowen-andreessen-and-horowitz-annotated-e0e30b55cfe6)) | [OPINION of the firm; quote text from search summary, not opened] |
| Memo / thesis format | Insufficient data found. a16z publishes market theses (e.g. the "Big Ideas" series) but we did not find a published a16z investment memo | — |
| Timeline | Insufficient data found for a16z-specific timelines | — |

### 1.4 General Catalyst

| Step | What we found | Status |
|---|---|---|
| Thesis lens | "Transformation" at scale: GC runs a "Transformation Flywheel" and owns operating vehicles such as **HATCo** (the Health Assurance Transformation Company) that partner with health systems ([GC Transformations](https://www.generalcatalyst.com/transformations)) | [FACT, firm site via search summary] |
| Diligence lens | Hemant Taneja's "responsible innovation": an inputs-focused view of founders' mindset, business model and second-order effects ([Goldman Sachs podcast transcript](https://www.goldmansachs.com/intelligence/podcasts/episodes/10-06-2023-hemant-taneja-f/transcript.pdf); [Hustle Fund profile](https://www.hustlefund.vc/post/angel-squad-hemant-taneja-investments-the-general-catalyst-ceo-who-wants-to-transform-healthcare-defense-and-ai-simultaneously)) | [OPINION of the firm; SINGLE SOURCE for how it is applied in diligence] |
| Steps, roles, IC, timelines | **Insufficient data found.** We found no primary description of GC's memo template, IC mechanics or timelines | — |

### 1.5 Brief: Benchmark, Founders Fund, Thrive, Bessemer, Tiger

- **Benchmark:** equal partnership with equal economics and **no associates, analysts or junior investors**. Decisions are made by partner consensus ([altss profile](https://altss.com/profile/benchmark.md); [f4.fund](https://f4.fund/firms/benchmark); background: [TechCrunch](https://techcrunch.com/?p=883261)). [SINGLE SOURCE, UNVERIFIED for the decision rule; the equal-partnership structure is widely reported]
- **Founders Fund:** approvals reportedly tier by check size (under $1.5M: any two team members; over $10M: two partners plus all GPs), and GPs must meet founders before large checks ([f4.fund](https://f4.fund/firms/founders-fund)). [SINGLE SOURCE, UNVERIFIED. We opened the [TechCrunch 2015 interview](https://techcrunch.com/2015/11/27/founders-fund-on-its-processes-deal-flow-and-newest-big-bets/) and did not see these thresholds in the retrieved text] The firm has a **chief scientist** (Aaron VanDevender), which shows an in-house technical-diligence function (same TechCrunch piece). [FACT]
- **Thrive:** about 12 new investments a year with concentrated positions, and decisions reportedly take 2–4 weeks at early stage ([Angel Investors Network](https://angelinvestorsnetwork.com/venture-capital/thrive-capital-josh-kushner-50b-conviction-investing)). [SINGLE SOURCE, UNVERIFIED]
- **Bessemer:** publishes real memos ([BVP memos via Atlas](https://www.bvp.com/atlas?type=memo)). The Shopify memo opens "We seek approval for BVP to invest up to $7mm…" ([Shopify memo, 2010](https://www.bvp.com/memos/shopify)). The Pinterest memo shows **the term sheet was signed before the full-partnership founder presentation**, under competition ("they have received several term sheets… We have signed a term sheet to lead a $10m Series A") ([Pinterest memo, 2011](https://www.bvp.com/memos/pinterest)). [FACT] This is a primary example of process compressing in a hot deal.
- **Tiger Global (2021):** got to term sheets in about 48 hours ("deals done in a weekend") and outsourced diligence to Bain ([Bloomberg Law](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence); [Business Insider NL](https://www.businessinsider.nl/how-tiger-global-threw-out-the-venture-capital-rulebook-and-bulldozed-the-competition-in-2021/)). [FACT; the 48-hour figure appears across multiple secondary reports]

### 1.6 The investment memo template

**[FACT]** Sections compared across public sources:

| Section | Sequoia business-plan guide ([link](https://sequoiacap.com/article/writing-a-business-plan)) | Sequoia YouTube memo, 2005 ([link](https://www.alexanderjarvis.com/the-confidential-youtube-investment-memo-by-sequoia-you-were-never-meant-to-see/)) | BVP Shopify / Pinterest memos ([Shopify](https://www.bvp.com/memos/shopify), [Pinterest](https://www.bvp.com/memos/pinterest)) | Academic: Kaplan & Strömberg (cited in [NBER w22587](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf)) |
|---|---|---|---|---|
| Purpose / thesis | Company purpose | Introduction ("primary outlet of user-generated video") | Summary + "We seek approval…" | — |
| Problem / solution | Yes | Company presentation | Product description | Product / technology |
| Why now | Yes | Implicit (growth drivers) | Implicit | — |
| Market | Market potential | Market / competition | Market + comparables (e.g. Shopping.com revenue) | Market / industry |
| Competition | Yes | Competitive analysis | Yes | Competition |
| Business model | Yes | Business / metrics | Monetisation (Pinterest: "not yet developed a business model") | Business model |
| Team | Yes | Team bios + hiring plan | Founders | Management team |
| Financials / metrics | "If you have any" | Company metrics | Run-rate (Shopify: about $5.5M), growth | — |
| **Deal / terms** | Not in the founder guide | $1M seed + $4M A, ~30% ownership, milestones | Pre-money, ownership, board seats, option pool, liquidation preference | Deal terms |
| **Key risks** | Not in the founder guide | Yes | Yes (e.g. "one of the biggest risks") | Yes |
| Recommendation | — | Yes | "We recommend this investment" | — |

- **[OPINION]** The founder-facing Sequoia template lacks the two sections the IC cares most about: **deal terms** and **risks**. The partner writes those. Claims in the deck feed straight into the "Team", "Metrics" and "Deal" rows, so an unchecked deck claim gets copied into the memo.

### 1.7 Timelines and compression

| Context | Timeline | Source | Status |
|---|---|---|---|
| Average VC deal (2015–16 survey) | 83 days to close (early stage 73, late stage 106) | [NBER w22587](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf) | [FACT] |
| Sequoia–YouTube 2005 | About 1–3 months from first meeting to investment | [Botha exhibit](https://www.alexanderjarvis.com/the-confidential-youtube-investment-memo-by-sequoia-you-were-never-meant-to-see/) | [FACT] |
| Correlation Ventures (co-investor) | Under 2 weeks, with rejections in as little as 2 days. The lead investor said the decision "would have normally taken a minimum of three months" | [MIT TR](https://www.technologyreview.com/2012/07/09/185027/an-algorithm-to-pick-startup-winners/) | [FACT] |
| Tiger Global, 2021 | About 48 hours to a term sheet | [Bloomberg Law](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence); [Business Insider NL](https://www.businessinsider.nl/how-tiger-global-threw-out-the-venture-capital-rulebook-and-bulldozed-the-competition-in-2021/) | [FACT, multiple secondary sources] |
| 2021 broadly | "VCs began prioritizing speed and cutting corners… The assumption was often that someone else had already done the diligence" (TDK Ventures' Nicolas Sauvage) | [Crunchbase News](https://news.crunchbase.com/venture/vc-due-diligence-startup-funding-sauvage-tdk/) | [OPINION, practitioner] |
| Pre-emptive term sheets | Short expiry windows, "sometimes just a few days" | [vcbeast](https://vcbeast.com/venture-capital-glossary/preemptive-investment) | [SINGLE SOURCE, UNVERIFIED] |

---

## 2. What gets verified and what gets taken on trust, by stage

### 2.1 Hard numbers

- **[FACT]** Hours of diligence: early stage 81, late stage 184. References called: early 8, late 13 ([NBER w22587, Table 9](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf)).
- **[FACT]** 9% of VCs use no quantitative deal-evaluation metric, and 20% don't forecast cash flows ([HLS Forum](https://corpgov.law.harvard.edu/2019/08/20/how-do-venture-capitalists-make-decisions)). The figure for early-stage VCs who don't forecast is 31% ([Crunchbase News citing HBR](https://news.crunchbase.com/venture/vc-due-diligence-startup-funding-sauvage-tdk/)). [FACT, secondary for the 31%]
- **[OPINION, practitioner]** "Thorough diligence might involve dozens of calls with customers, supplemented with conversations with employees and analysts" (Sauvage, [Crunchbase News](https://news.crunchbase.com/venture/vc-due-diligence-startup-funding-sauvage-tdk/)).

### 2.2 Verification matrix

Cells are **[OPINION, our synthesis]** unless a source is given. A tick means the step is commonly done at that stage. "Trust" means it is usually taken at the founder's or lead's word.

| Diligence step | Seed | Series A | Series B | Growth | Notes / sources |
|---|---|---|---|---|---|
| Founder references (given by founder) | ✓ (few) | ✓ | ✓ | ✓ | 8 at early stage, 13 at late stage ([NBER](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf)) [FACT] |
| Backchannel references (not given by founder) | ✓ (top funds) | ✓ | ✓ | ✓ | "Top VCs do 'back-channel' reference checks" ([GoingVC](https://www.goingvc.com/post/how-to-reference-check-a-founder)); question bank from [CRV](https://www.crv.com/content/reference-check-questions-for-founders); a claim that off-list calls are standard at seed since 2025 ([Causo](https://hub.causo.ai/guides/vc-reference-calls)) [SINGLE SOURCE, UNVERIFIED for the "standard at seed" claim] |
| Customer calls | Trust / 1–3 friendly | ✓ (handful) | ✓ (many) | ✓ (dozens + expert networks) | "Dozens of calls" in thorough diligence ([Crunchbase News](https://news.crunchbase.com/venture/vc-due-diligence-startup-funding-sauvage-tdk/)); exact counts by stage: insufficient data found |
| Data room: financials, cohorts, contracts | Trust (little to check) | Partial (MRR, early cohorts) | ✓ | ✓ + QoE / audits | Builder.ai: critics say investors "fail to interrogate customer contracts or pricing" ([TechInformed](https://techinformed.com/unicorn-builder-ai-collapses-fomo-investing/)) [OPINION] |
| Cap table / prior rounds | Trust (deck) | Partial | ✓ (legal) | ✓ (legal) | Public cross-check: Form D (covered in the networks note) |
| Headcount / team claims | Trust (LinkedIn glance) | Trust + references | Partial | ✓ | Insufficient data found for a systematic study |
| Technical diligence | Founder-CTO conversation | Advisor / portfolio CTO call | Lighter review focused on scale and security | ✓ (third party) | Mostly vendor sources ([Euvic](https://www.euvic.com/us/post/technical-due-diligence-to-understand-investment-risk-3); [Codacy](https://blog.codacy.com/technical-due-diligence-for-startups)) [SINGLE SOURCE, vendor, UNVERIFIED]; Founders Fund employs a chief scientist ([TechCrunch](https://techcrunch.com/2015/11/27/founders-fund-on-its-processes-deal-flow-and-newest-big-bets/)) [FACT] |
| Third-party data (see 2.3) | Harmonic / PitchBook for context | + Similarweb / app data | + card panels (consumer) | + YipitData, Bain-style outsourcing | See below |

### 2.3 Third-party data providers

| Provider | What it gives | Used for | Source / status |
|---|---|---|---|
| **PitchBook / Crunchbase** | Rounds, investors, valuations | Comparables, prior-round context | Widely used; Harmonic positions itself against PitchBook ([Harmonic](https://harmonic.ai/blog/harmonic-vs-pitchbook)) [FACT that the product exists] |
| **Harmonic** | 35M+ companies, 195M+ people, departmental headcount across 100+ categories, stealth-founder detection | Sourcing, market maps, "IC preparation" via its Scout agent | [Harmonic blog](https://harmonic.ai/blog/how-harmonic-serves-venture-capital-firms). Customer count (150+ firms) and the Earlybird benchmark (98% vs. 75% signal coverage) are vendor claims [SINGLE SOURCE, UNVERIFIED] |
| **Similarweb** | Web and app traffic for 80M+ sites and 3M apps | Traction proxy | [TechCrunch](https://techcrunch.com/2014/11/25/alexa-competitor-similarweb-raises-15m-to-expand-into-mobile-analytics-app-engagement-insights) [FACT, older figures] |
| **Sensor Tower / app-store data** | Downloads, ranks, reviews | Consumer and mobile traction | [TechCrunch](https://techcrunch.com/2020/05/04/sensor-tower-raises-45m-as-demand-for-app-data-grows/embed/) [FACT] |
| **Second Measure (Bloomberg), YipitData** | Credit-card panels (more than 1% of US consumer spend), alt-data research | Consumer revenue checks for public **and private** companies; customers include hedge funds, PE and banks | [TechCrunch](https://techcrunch.com/?p=1193676); [Fortune 2019](https://fortune.com/2019/02/12/goldman-sachs-citi-second-measure-alternative-data); [YipitData](https://www.yipitdata.com/public-investors) [FACT]. How much **early-stage** VCs use them: insufficient data found |
| **Consultants (Bain)** | Commercial diligence | Tiger paid Bain over $100M a year | [Bloomberg Law](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence) [FACT] |

### 2.4 Where diligence was famously skipped or overruled

*(Case basics are in the networks note §5.2. This only adds the diligence-process angle.)*

- **FTX / Sequoia:** Sequoia told LPs it had run "a rigorous diligence process". Staff reviewed financial statements and **asked repeatedly about the FTX–Alameda relationship** and were assured as recently as May 2022 that FTX funds did not finance Alameda. Sequoia says it was misled ([The Block](https://www.theblock.co/post/185136/sequoia-says-its-investment-in-ftx-is-now-worthless); [Crain Currency](https://www.craincurrency.com/investing/ftx-founder-and-ceo-sam-bankman-fried-misled-and-deceived-sequoia-capital-firm-says)). [FACT for what Sequoia said; both pages returned HTTP 403, so the text is from search summaries] **Why it was skipped [OPINION]:** the key fact was relationship-level (who controls what) and the investors relied on management's answer. Nobody with a board seat could verify it.
- **FTX / Temasek:** about 8 months of diligence that included FTX's **audited** financial statements. Temasek's roughly 1% stake carried **no board seat** ([Temasek statement](https://www.temasek.com.sg/en/news-and-resources/news-room/statements/2022/statement-FTX), HTTP 403, text via [Asia News Network](https://asianews.network/temasek-to-write-down-us275-million-in-ftx-says-belief-in-bankman-fried-appears-to-be-misplaced/)). [FACT, multiple outlets] **Lesson [OPINION]:** an audit plus a long timeline still missed it. Diligence depth was not the failure. Verification of related-party control was.
- **FTX / Tiger:** Bain's diligence **flagged the risk** of SBF's web of entities, and Tiger invested $38M anyway ([Bloomberg Law](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence)). [FACT] **Lesson [OPINION]:** flags get overruled when conviction and FOMO are high. A tool has to make a flag hard to ignore, not just find it.
- **Builder.ai:** revenue was restated by about 75% (2024: about $220M to $55M). Critics say investors failed to "interrogate customer contracts or pricing structures", and the founder's earlier company (Nivio) had governance allegations that were reportedly under-examined ([TechInformed](https://techinformed.com/unicorn-builder-ai-collapses-fomo-investing/); [Intelligo](https://intelligo.ai/blog/when-hype-outpaces-scrutiny)). [FACT for the restatement; the Nivio point is SINGLE SOURCE, UNVERIFIED, from a diligence vendor's blog]
- **Structural skip:** co-investor models such as Correlation's explicitly "rel[y] on some vetting by the primary investor" ([MIT TR](https://www.technologyreview.com/2012/07/09/185027/an-algorithm-to-pick-startup-winners/)). [FACT] Followers inherit the lead's diligence by design.

---

## 3. Internal data and tooling at top firms

| Firm / tool | What it is | Signals tracked (as publicly described) | Source / status |
|---|---|---|---|
| **EQT Ventures – Motherbrain** | Launched 2016. Covers "sourcing, through due diligence, and into portfolio value creation" | Web traffic, predictive trajectory models, and (more recently) LLM analysis of internal notes and unstructured text. "Data-driven methods can especially generate alpha in sourcing" (EQT's Fred-Ojala) | [tech.eu 2025](https://tech.eu/2025/11/20/how-eqt-uses-ai-to-see-the-startup-world-differently/) [FACT]. "Monitors 10M+ companies" and "7 of ~50 investments directly identified by the platform" come from a VentureBeat article we could not open (HTTP 429) ([VentureBeat](https://venturebeat.com/ai/how-eqt-ventures-motherbrain-uses-ai-to-find-promising-startups)) [SINGLE SOURCE, UNVERIFIED] |
| **SignalFire – Beacon** | In-house AI data platform built since 2013 | Talent data on about 495M employees and 80M companies (2023 figures). Spots "high-potential founders and companies hiring the best talent". Also powers recruiting for portfolio companies. "AI can't tell you who to fund, but it can absolutely tell you who to talk to." | [SignalFire blog, 2023](https://www.signalfire.com/blog/signalfire-900m-fundraise-xirs) [FACT]; a 2025 release says 650M+ people ([BusinessWire](https://www.businesswire.com/news/home/20250407594969/en)) [FACT, via search summary] |
| **a16z – Applied Software Group (ASG)** | Internal engineering team that "operates in the mode of an internal startup" for investing and operations teams | "Identifying, acquiring, and normalizing alternative data sources" | [a16z job listing](https://jobs.a16z.com/jobs/andreessen-horowitz/7619570003--software-engineer-backend-partner-16-partner-18) [FACT, job posting]. Specific signals: insufficient data found |
| **Sequoia** | "A small group of senior technologists… whose mission is to use data and software to invest" | Not described | Job posts via [HN Hiring](https://hnhiring.com/locations/menlo-park/months/november-2019) [SINGLE SOURCE, UNVERIFIED]; no other details found |
| **Correlation Ventures** | Predictive model built on a database of nearly every US VC deal over about 20 years (100k+ rounds per later reports) | Takes 5 basic planning, financial and legal documents and scores them like credit software. A board-composition finding: more than two VCs on the board predicts worse outcomes | [MIT TR 2012](https://www.technologyreview.com/2012/07/09/185027/an-algorithm-to-pick-startup-winners/) [FACT]; "100k rounds" from an [AI Expert Network](https://aiexpert.network/ai-at-correlation-ventures/) profile [SINGLE SOURCE, UNVERIFIED] |
| **General Catalyst** | — | — | **Insufficient data found.** GC job boards list portfolio roles, not internal data roles ([GC jobs](https://jobs.generalcatalyst.com/companies/chalk-2/jobs/44618831-technical-sourcer-remote-ok)) |
| **Industry pattern** | Firms such as M13 are hiring for "AI-native internal tools that enhance sourcing and diligence" | — | [M13 listing](https://careers.wassonenterprise.com/companies/m13/jobs/68304740-investment-summer-associate-ai-tooling) [FACT, job posting] |

**[OPINION]** Across every description we found, the automatic signals are **outside-in traction and talent signals** (hiring, departures, web and app traffic, funding events, founder formation). None describes automatically reconciling **a specific deck's claims** against filings. That is VentureSauce's lane, and it complements these tools rather than competing with them.

---

## 4. How associates work day to day

### 4.1 What the data says

| Item | Finding | Source / status |
|---|---|---|
| Time per deck | **3 min 44 s** on average (2015 DocSend study of 200 decks) | [TechCrunch 2015](https://techcrunch.com/2015/06/08/lessons-from-a-study-of-perfect-pitch-decks-vcs-spend-an-average-of-3-minutes-44-seconds-on-them) [FACT] |
| Time per deck, hot market | **2 min 44 s** in Q3 2021 | DocSend via [Nasdaq press release](https://www.nasdaq.com/press-release/docsend-pitch-deck-interest-q3-2021-data-shows-consistent-highs-for-vc-interest) [FACT, figure seen via search summary] |
| Deck volume | About 100 opportunities considered per closed deal; median firm considers 200 a year (IT: 275) | [NBER w22587, Table 6](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf) [FACT]. Per-associate weekly deck counts: **insufficient data found** |
| Time on sourcing | Sourcing is the 2nd-largest activity at **15 hours a week**, and networking adds 7 hours a week (all respondents, mostly partners) | [NBER w22587](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf) [FACT] |
| Junior staffing | About 1 junior deal person per 2 partners; late-stage firms have more associates because they "deal with companies that require more due diligence" | Same [FACT] |
| Sourcing quotas | Few firms run sourcing like a sales funnel; "few use CRM as the system of record for whether or not a 'rep' gets paid" | [Danielle Morrill, TechCrunch 2015](https://techcrunch.com/2015/03/08/what-ive-learned-about-deal-sourcing/) [OPINION, practitioner]. Specific numeric quotas: **insufficient data found** |
| Tools | CRMs (Salesforce, Affinity, Pipedrive), data platforms (PitchBook, Harmonic), DocSend | Morrill (above); vendor pages ([Affinity](https://www.affinity.co/guide/deal-sourcing-guide-for-venture-capital)) [FACT that the tools exist; usage shares: insufficient data found] |
| Career odds | "The vast majority of VC associates will not make partner"; usual exits after 2–3 years | [Fortune / Quora, 2015](https://fortune.com/2015/06/02/how-demanding-is-an-associate-position-at-a-venture-capital-firm/) [OPINION, anonymous associate] |

### 4.2 What makes an associate look good or bad

All points below are **[OPINION]**, from practitioners:
- **Good:** being *seen* sourcing; bringing in deals early; championing a deal the partners missed. Aaron Levie (Box): "Every partner we pitched passed, but one associate fought to push the deal through, saving us" ([Fortune 2024](https://fortune.com/2024/04/17/should-startup-founders-talk-to-vc-associates/)).
- **Bad:** missing a deal that later raises from a competitor ("'Why didn't we see this deal?'"); slow scheduling; being a dead end for founders. Brett Adcock (Figure AI): "For the record, I've been pitching associates for well over a decade. Here's the number of times i've found it helpful: ZERO" (same source).

### 4.3 Pain points in their own words (verbatim, sourced)

From an anonymous VC associate's Quora answer, republished by [Fortune (2015)](https://fortune.com/2015/06/02/how-demanding-is-an-associate-position-at-a-venture-capital-firm/) [SINGLE SOURCE; author not named]:
- "You're not only expected to source but importantly, *be seen* *sourcing* consistently and frequently."
- "You were swamped on diligence for a partner's deal and supporting a portfolio company project? Don't imagine yourself immune from being asked, 'Why didn't we see this deal?'"
- "Every associate knows the frustration of seeing a fundraising announcement from a company that he/she jotted down on a 'to-do' list but never made the time to contact."
- "Meetings get done during the day, 'actual' work gets done at night and on weekends."
- "Scheduling a pitch two weeks from now might mean that you have no shot at the deal… As such, deal diligence, investment memos and my own market research primarily get done at night and often on weekends."

From others:
- Danielle Morrill (Mattermark founder, describing associates she sold to): "I am surprised how often these people lament things have been too 'crazy' to source proactively, because they've got 15 calls lined up this week" ([TechCrunch 2015](https://techcrunch.com/2015/03/08/what-ive-learned-about-deal-sourcing/)).
- Steph Mui (former NEA associate): "There's politics within every firm and usually you need buy-in from multiple people—maybe the partner championing your deal is really excited but, like, there's a lot of hesitation from the partnership about other things" ([Fortune 2024](https://fortune.com/2024/04/17/should-startup-founders-talk-to-vc-associates/)).

**Gap:** we found **no sourced quote from an associate specifically about verifying deck claims** (Form D, headcount, customer logos). This is the most important thing to collect in today's interviews.

---

## 5. Implications for VentureSauce

All of section 5 is **[OPINION]**, built from the facts above.

### 5.1 Where it slots in the workflow

| Workflow stage | Funnel share (per 1 close) | Time pressure | VentureSauce fit |
|---|---|---|---|
| **Deck received, before first meeting** | 101 → 28 | ~3–4 min per deck | **Primary slot.** About 72% of companies die here on unverified claims. A 60-second truth table moves verification earlier than the partner meeting |
| **First meeting → partner meeting** | 28 → 10 | Days | **Secondary slot.** Turn gaps into "questions to ask the founder" and pre-fill the memo's Team and Deal rows with sourced facts |
| **Pre-emptive / fast-close term sheet** | Skips formal diligence (Gompers fn. 8) | Hours to 48 h | **High-value slot.** The only diligence that may happen at all. Matches the "faster than the FOMO window" finding in the networks note |
| Formal diligence → IC | 5 → 1.7 | Weeks | **Supporting role only.** Hand the deal team a list of backchannel targets and a raise-history timeline |
| Post-close / monitoring | — | Low | Out of scope for the hackathon (could watch for new Form Ds later) |

### 5.2 What it can automate or shortcut

1. **Raise-history and "Deal" section checks:** compare claimed amount raised, round size and timing with Form D (amount sold, first-sale date, offering still open). This feeds the memo's **Deal** section, which every memo we read has.
2. **Investor and board claims:** compare named investors and board members with Form D related persons. The Bessemer and Sequoia memos all specify board seats, so the IC cares about board composition.
3. **Headcount and team claims:** a LinkedIn count with a confidence range. This is a shortcut, not proof.
4. **Press-claim consistency:** announced round vs. deck vs. Form D.
5. **A backchannel target list (new idea):** Form D related persons plus LinkedIn ex-employees are exactly the "people the founder did not name" that backchannel checks need ([GoingVC](https://www.goingvc.com/post/how-to-reference-check-a-founder)). It lists names; it doesn't make calls.
6. **"Questions for the founder":** generated from gaps, as seed-stage due diligence.
7. **A flag that's hard to ignore:** the Tiger/Bain case shows flags get overruled. Every gap should sit next to its source link in one view, so it survives into the memo.

### 5.3 What it should not touch

- **Reference and customer calls themselves.** These are judgment and relationship work, and the team is the #1 factor (95% of VCs). We help pick *who* to call, not *what they think*.
- **Data-room financials, cohorts and revenue quality.** The Builder.ai and FTX failures sat here (revenue recognition, related-party control). Form D and LinkedIn cannot see them, and claiming otherwise would destroy trust.
- **Technical diligence** (code, architecture, security).
- **Valuation, the investment decision, and IC voting.** Firms' decision rules (unanimous, single trigger-puller, consensus) are cultural. Stay advisory.
- **Sourcing / discovery.** Motherbrain, Beacon, Harmonic and ASG already own "who to talk to". Competing there dilutes the "check what the founder told you" wedge.
- **Labeling founders as liars.** Use "gap" and "possible", per the risk table in PLAN.md.

### 5.4 Questions to add to today's interviews

- "When a deck lands, what do you check in the first five minutes? Anything outside the deck?"
- "Who writes the Deal and Team sections of your memo, and where do those numbers come from?"
- "Have you ever been in a pre-emptive or 48-hour round? What diligence actually happened?"
- "Have you ever raised a flag that the partnership overruled? What would have made it stick?"
- "Do you build backchannel lists by hand? How long does it take?"
- "Is your work measured by deals sourced, memos written, or something else?"

---

## Sources

**Academic / survey**
- Gompers, Gornall, Kaplan & Strebulaev, "How Do Venture Capitalists Make Decisions?" [NBER w22587 PDF](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf) · [NBER Digest](https://www.nber.org/digest/dec16/w22587.html) · [HLS Forum](https://corpgov.law.harvard.edu/2019/08/20/how-do-venture-capitalists-make-decisions) · [HBR 2021 (paywalled)](https://hbr.org/2021/03/how-venture-capitalists-make-decisions)

**Firm primary documents**
- Sequoia: [Writing a Business Plan](https://sequoiacap.com/article/writing-a-business-plan) · [Sequoia and Seed Investing](https://sequoiacap.com/article/sequoia-and-seed-investing) · YouTube memo and Botha declaration ([Jarvis transcription](https://www.alexanderjarvis.com/the-confidential-youtube-investment-memo-by-sequoia-you-were-never-meant-to-see/); [PDF](https://thevcfactory.com/wp-content/uploads/2023/12/Sequoia-Capital-YouTube-Investor-Memo-1.pdf); [Visible.vc analysis](https://visible.vc/blog/this-youtube-investment-memo-shows-you-the-path-to-the-perfect-pitch/))
- Bessemer: [Memos (Atlas)](https://www.bvp.com/atlas?type=memo) · [Shopify memo](https://www.bvp.com/memos/shopify) · [Pinterest memo](https://www.bvp.com/memos/pinterest)
- General Catalyst: [Transformations](https://www.generalcatalyst.com/transformations) · [Taneja, Goldman Sachs podcast](https://www.goldmansachs.com/intelligence/podcasts/episodes/10-06-2023-hemant-taneja-f/transcript.pdf)
- a16z: [ASG job listing](https://jobs.a16z.com/jobs/andreessen-horowitz/7619570003--software-engineer-backend-partner-16-partner-18) · [Deal Partner listing (NVCA)](https://nvca.org/careers/deal-partner-growth-health-andreessen-horowitz/)
- SignalFire: [Beacon / $900M fundraise](https://www.signalfire.com/blog/signalfire-900m-fundraise-xirs) · [BusinessWire 2025](https://www.businesswire.com/news/home/20250407594969/en)
- CRV: [Reference check questions](https://www.crv.com/content/reference-check-questions-for-founders)
- Temasek: [FTX statement](https://www.temasek.com.sg/en/news-and-resources/news-room/statements/2022/statement-FTX) (403; via [Asia News Network](https://asianews.network/temasek-to-write-down-us275-million-in-ftx-says-belief-in-bankman-fried-appears-to-be-misplaced/))

**Press**
- [Bloomberg Law: Tiger/Bain/FTX](https://news.bloomberglaw.com/crypto/tiger-globals-now-worthless-ftx-bet-had-bains-due-diligence) · [Business Insider NL: Tiger 2021](https://www.businessinsider.nl/how-tiger-global-threw-out-the-venture-capital-rulebook-and-bulldozed-the-competition-in-2021/)
- [The Block: Sequoia FTX letter](https://www.theblock.co/post/185136/sequoia-says-its-investment-in-ftx-is-now-worthless) · [Crain Currency: Sequoia misled](https://www.craincurrency.com/investing/ftx-founder-and-ceo-sam-bankman-fried-misled-and-deceived-sequoia-capital-firm-says)
- [TechInformed: Builder.ai FOMO](https://techinformed.com/unicorn-builder-ai-collapses-fomo-investing/) · [Intelligo: Builder.ai](https://intelligo.ai/blog/when-hype-outpaces-scrutiny)
- [MIT Technology Review: Correlation Ventures](https://www.technologyreview.com/2012/07/09/185027/an-algorithm-to-pick-startup-winners/)
- [tech.eu: EQT Motherbrain](https://tech.eu/2025/11/20/how-eqt-uses-ai-to-see-the-startup-world-differently/) · [VentureBeat: Motherbrain (not opened, 429)](https://venturebeat.com/ai/how-eqt-ventures-motherbrain-uses-ai-to-find-promising-startups)
- [Crunchbase News: Sauvage on diligence](https://news.crunchbase.com/venture/vc-due-diligence-startup-funding-sauvage-tdk/)
- [TechCrunch: DocSend 3:44 per deck](https://techcrunch.com/2015/06/08/lessons-from-a-study-of-perfect-pitch-decks-vcs-spend-an-average-of-3-minutes-44-seconds-on-them) · [Nasdaq: DocSend Q3 2021](https://www.nasdaq.com/press-release/docsend-pitch-deck-interest-q3-2021-data-shows-consistent-highs-for-vc-interest)
- [TechCrunch: Morrill on deal sourcing](https://techcrunch.com/2015/03/08/what-ive-learned-about-deal-sourcing/) · [Fortune 2015: associate demands (Quora)](https://fortune.com/2015/06/02/how-demanding-is-an-associate-position-at-a-venture-capital-firm/) · [Fortune 2024: associates debate](https://fortune.com/2024/04/17/should-startup-founders-talk-to-vc-associates/)
- [TechCrunch: Founders Fund process (2015)](https://techcrunch.com/2015/11/27/founders-fund-on-its-processes-deal-flow-and-newest-big-bets/) · [TechCrunch: Benchmark lean](https://techcrunch.com/?p=883261) · [TechCrunch: Sequoia Arc](https://techcrunch.com/2022/07/07/sequoia-wants-to-invest-1-million-in-your-idea-then-teach-you-how-to-really-sell-it)
- [TechCrunch: Second Measure](https://techcrunch.com/?p=1193676) · [Fortune: Second Measure / card data](https://fortune.com/2019/02/12/goldman-sachs-citi-second-measure-alternative-data) · [YipitData](https://www.yipitdata.com/public-investors) · [TechCrunch: Similarweb](https://techcrunch.com/2014/11/25/alexa-competitor-similarweb-raises-15m-to-expand-into-mobile-analytics-app-engagement-insights) · [TechCrunch: Sensor Tower](https://techcrunch.com/2020/05/04/sensor-tower-raises-45m-as-demand-for-app-data-grows/embed/)

**Aggregators and vendors (lower confidence; claims flagged in the text)**
- [vcbeast: firm structure](https://vcbeast.com/how-vc-firms-are-structured) · [vcbeast: pre-emptive](https://vcbeast.com/venture-capital-glossary/preemptive-investment) · [ZeroG Talent: a16z culture](https://zerogtalent.com/blog/company-culture-at-andreessen-horowitz) · [Walturn](https://walturn.com/insights/decision-making-in-venture-capital-firms-who-holds-the-power-and-how-deals-get-approved) · [The VC Corner: a16z scaling](https://www.thevccorner.com/p/a16z-15b-raise-ben-horowitz-venture-scaling?r=1krivi)
- [altss: Benchmark](https://altss.com/profile/benchmark.md) · [f4.fund: Benchmark](https://f4.fund/firms/benchmark) · [f4.fund: Founders Fund](https://f4.fund/firms/founders-fund) · [Angel Investors Network: Thrive](https://angelinvestorsnetwork.com/venture-capital/thrive-capital-josh-kushner-50b-conviction-investing) · [Hustle Fund: Taneja](https://www.hustlefund.vc/post/angel-squad-hemant-taneja-investments-the-general-catalyst-ceo-who-wants-to-transform-healthcare-defense-and-ai-simultaneously)
- [Harmonic: VC firms](https://harmonic.ai/blog/how-harmonic-serves-venture-capital-firms) · [Harmonic vs PitchBook](https://harmonic.ai/blog/harmonic-vs-pitchbook) · [AI Expert Network: Correlation](https://aiexpert.network/ai-at-correlation-ventures/) · [GoingVC: reference checks](https://www.goingvc.com/post/how-to-reference-check-a-founder) · [Causo: reference calls](https://hub.causo.ai/guides/vc-reference-calls) · [Causo: Arc](https://hub.causo.ai/how-to-apply-to-sequoia-arc-2026) · [Euvic: tech DD](https://www.euvic.com/us/post/technical-due-diligence-to-understand-investment-risk-3) · [Codacy: tech DD](https://blog.codacy.com/technical-due-diligence-for-startups) · [Affinity: sourcing guide](https://www.affinity.co/guide/deal-sourcing-guide-for-venture-capital) · [Confluence VC: Don Valentine](https://confluencevcweekly.beehiiv.com/p/lessons-from-don-valentine) · [HN Hiring: Sequoia data roles](https://hnhiring.com/locations/menlo-park/months/november-2019) · [M13 AI tooling listing](https://careers.wassonenterprise.com/companies/m13/jobs/68304740-investment-summer-associate-ai-tooling) · [GC jobs board](https://jobs.generalcatalyst.com/companies/chalk-2/jobs/44618831-technical-sourcer-remote-ok)

**Gaps / not found:** a primary a16z description of its decision process; any GC memo template, IC process, timeline or internal tooling; Sequoia's Airbnb or WhatsApp memos (we found no public copy); partner podcasts (Acquired, 20VC, Invest Like the Best, Crucible Moments), not reviewed in the time box; per-associate deck counts and sourcing quotas; stage-by-stage customer-call counts; how much early-stage VCs use card-panel data; and any associate quote about verifying deck claims specifically.
