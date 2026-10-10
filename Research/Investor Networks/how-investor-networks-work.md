# How Investor Networks Work (and why it matters for VentureSauce)

*Research note, 2026-10-10. Owner: Research role. Product: **VentureSauce**, a Chrome side panel that checks pitch-deck claims against SEC Form D, LinkedIn and the press.*

**Legend.** **[FACT]** = sourced data or a documented event. **[OPINION]** = a practitioner's view or our own inference. **[SINGLE SOURCE, UNVERIFIED]** = we found only one source, or only a secondary or aggregator source. "Insufficient data found" means we looked and found nothing reliable.

---

## Executive summary

1. **Deal flow runs on networks, not inbound.** In the largest survey of VCs (885 respondents), about 30%+ of deals came from professional networks, 20% from other investors' referrals and 8% from portfolio companies. Only about 10% came from cold inbound by founders. [FACT] ([NBER Digest](https://www.nber.org/digest/dec16/w22587.html))
2. **Access is the product.** About 6% of deals produce about 60% of venture returns (Horsley Bridge data, cited by Mallaby). [FACT, secondary sources] VC performance persists across funds, and the evidence says that is largely because early success buys **access to deal flow**, not persistent picking skill. [FACT] ([Nanda, Samila & Sorenson, JFE](https://www.nber.org/papers/w24887); [Harris et al.](https://www.nber.org/papers/w28109)) This is why both founders and investors keep the circle small.
3. **Herding is real and documented.** Better-networked VCs perform better ([Hochberg, Ljungqvist & Lu 2007](https://ideas.repec.org/a/bla/jfinan/v62y2007i1p251-301.html)). Syndicates formed on affinity rather than ability do worse ([Gompers, Mukharlyamov & Xuan 2016](https://www.nber.org/papers/w18141)). Cycles are extreme: $329.9B of US VC in 2021 ([NVCA](https://nvca.org/press_releases/u-s-venture-capital-soars-to-new-highs-in-2021/)), and AI took over 50% of global VC in 2025 ([The Decoder citing PitchBook](https://the-decoder.com/more-than-half-of-all-venture-capital-money-will-flow-into-ai-start-ups-in-2025/)). [FACT]
4. **Mixed signal.** In a randomized AngelList experiment, investors on average responded to *team* information, **not** to news of a lead investor ([Bernstein, Korteweg & Laws, JF 2017](https://www.gsb.stanford.edu/insights/shai-bernstein-what-really-matters-early-stage-investors)). So "copy the lead" is weaker in cold email than the folklore says. Herding seems to work mostly through **trusted private channels** and hot-round FOMO. [FACT + our inference]
5. **Networks exclude outsiders.** All-female teams got about 2% of US VC dollars in 2024 ([PitchBook via Paperjam](https://en.paperjam.lu/article/pitchbook-women-vc-report-10bn-deal-value-in-2024)). Black founders got about 0.4% ([Crunchbase via POCIT](https://peopleofcolorintech.com/articles/black-founders-received-just-0-4-of-all-startup-funding-in-2024/)). California took about 49% of capital raised on Carta ([Carta](https://carta.com/data/VC-funding-geography-2024/)). Networking frictions causally explain part of the gender gap ([Howell & Nanda, NBER](https://www.nber.org/papers/w26449)). [FACT]
6. **For VentureSauce:** Fraud and inflation cases (FTX, Builder.ai, Theranos) share one pattern: investors **leaned on other investors' signals instead of checking primary facts**, often under time pressure. [FACT for the events; OPINION for the pattern] That fits a fast, cheap **claim check that runs where diligence gets skipped**, such as the angel or scout in a hot round with 48 hours to decide. It is not a replacement for institutional diligence. The hidden problem may be less "I can't find data" and more **"I don't have time or social permission to doubt a deal my network already blessed."** [OPINION, to be tested with users]

---

## 1. How deal flow actually moves

### 1.1 The data: referrals dominate
- **[FACT]** Gompers, Gornall, Kaplan & Strebulaev surveyed 885 institutional VCs (Nov 2015 to Mar 2016). Deal sources: **over 30% professional networks, 30% proactively self-generated, 20% referred by other investors, 8% referred by portfolio companies, about 10% cold inbound from management.** ([NBER Digest](https://www.nber.org/digest/dec16/w22587.html); paper: [SSRN](https://papers.ssrn.com/abstract=2801385); published in the *Journal of Financial Economics*)
- **[FACT]** The same survey: VCs rate **deal selection** as more important than sourcing or post-investment value-add. ([SSRN abstract](https://papers.ssrn.com/abstract=2801385))
- Note: "proactively self-generated" includes outbound by the VC (conferences, cold outreach to founders). So roughly **60% of deals arrive through a person who vouches**, about 30% through the VC's own hunting, and about 10% through a founder's cold email. [Our arithmetic from the figures above]

### 1.2 The mechanisms
| Mechanism | What it is | Evidence |
|---|---|---|
| **Warm intros** | A trusted person (founder, LP, co-investor) forwards the deal. The intro is itself a filter. | Survey data above. [FACT] |
| **Syndicate networks** | VCs co-invest repeatedly with the same firms, forming durable networks. | Hochberg, Ljungqvist & Lu ([JF 2007](https://ideas.repec.org/a/bla/jfinan/v62y2007i1p251-301.html)): better-networked VCs show higher exit rates, and their portfolio companies are likelier to survive to later rounds. [FACT] |
| **Scout programs** | Operators or founders get small checks to invest on a fund's behalf. | Sequoia launched its scout program in 2009. By its 10th anniversary it was widely copied ([TechCrunch 2019](https://techcrunch.com/2019/06/07/a-peek-inside-sequoia-capitals-low-flying-wide-reaching-scout-program)). The story that scout Jason Calacanis wrote an early Uber check through it appears in aggregator posts ([Superscout](https://superscout.co/post/sequoia-capital-scout-program-transforming-the-venture-capital-landscape)). [SINGLE SOURCE, UNVERIFIED as to the Uber detail] |
| **Angel syndicates (AngelList)** | A lead angel sources and diligences a deal, and "backers" follow into an SPV. The lead takes carry (typically 15–25%). | Launched in 2013 ([StrictlyVC on Naval's syndicates](https://strictlyvc.com/2013/11/page/2/); [TechCrunch](https://techcrunch.com/?p=885618)). Carry range from [Launchrock](https://www.launchrock.com/library/expert-advice/syndicate). [Carry range: SINGLE SOURCE, UNVERIFIED] Backers are explicitly **betting on the lead's judgment**, which is a built-in follow-the-leader structure. [OPINION] |
| **SPVs** | Single-deal vehicles that aggregate small checks into one cap-table line. | Same sources as above. They let many people "get in" without the founder managing dozens of investors. [FACT] |
| **Insider rounds** | Existing investors fund the next round with no new lead. | PitchBook: about 13% of capital raised came from insiders in 2023, the highest in over a decade (via search summary of PitchBook, [Carta data hub context](https://carta.com/data/linkedin-bridge-round-percentage-still-high/)). Carta: about 35% of 2023 rounds on its platform were bridges or extensions. [Carta bridge figure: FACT. PitchBook 13%: SINGLE SOURCE, UNVERIFIED, original PitchBook page not retrieved] |
| **Pre-emptive rounds** | An investor offers a term sheet before the founder runs a process. | Insufficient data found on prevalence. Mechanically it rewards whoever has the earliest private signal. [OPINION] |
| **Party rounds** | Many small checks, often with no lead taking a board seat. | Insufficient data found for a clean primary source on prevalence or origin of the term. |
| **Trusted co-investors** | "If Fund X is in, I'm in." | See section 3. Survey and network evidence support reliance on co-investors. Experimental evidence (Bernstein et al.) shows the *cold* lead-investor signal is weak. [FACT] |

---

## 2. Why deals stay exclusive and investor pools stay small

### 2.1 Founder side
- **Signaling and avoiding a "shopped" deal.** A deal seen by everyone and passed on by many carries negative information. Founders keep processes tight so a "no" doesn't spread. [OPINION, widely held. Insufficient data found for a quantitative study]
- **Speed.** Hot rounds close in days. In 2021, Tiger Global often issued term sheets within about 48 hours and outsourced much diligence to Bain ([Crunchbase News](https://news.crunchbase.com/venture/tiger-global-management-strategy-investing-2021); [The Generalist](https://generalist.com/briefing/tiger-global)). [FACT, multiple secondary reports]
- **Confidentiality.** Fewer recipients means less leakage of metrics and strategy. [OPINION]
- **Cap table control.** SPVs and syndicates exist partly so founders get one line instead of many ([vcbeast glossary](https://vcbeast.com/venture-capital-glossary/angel-syndicate)). [FACT about structure]
- **Pro-rata dynamics.** Every new investor takes pro-rata rights that crowd future rounds, so founders favor fewer, larger, higher-signal investors. [OPINION. Insufficient data found for a quantitative study]

### 2.2 Investor side
- **Power law means access is everything.** Horsley Bridge data (about 30 years, $28B+ across VC funds): **about 6% of investments, using about 4.5% of dollars, produced about 60% of returns** ([Marginal Utility summary](https://marginalfutility.substack.com/p/the-power-law-in-venture-capital); also reported in Mallaby, *The Power Law*). [FACT, secondary sources. Original Horsley deck not retrieved]
- **Persistence comes from access, not skill.** Each extra IPO among a VC's first 10 investments predicts up to about 8% higher IPO rates later. About half of that persistence is explained by *where and when* the firm invested. The effect works through **better access to later, larger syndicates** ([Nanda, Samila & Sorenson, NBER w24887 / JFE](https://www.nber.org/papers/w24887); [HLS Forum summary](https://corpgov.law.harvard.edu/?p=127075)). [FACT]
- **LPs pay for access.** VC fund performance stays persistent across a GP's successive funds, unlike buyout performance ([Harris, Jenkinson, Kaplan & Stucke, NBER w28109](https://www.nber.org/system/files/working_papers/w28109/w28109.pdf)). Because access compounds, LPs crowd into proven managers. In 2024 the top 30 US funds took about 75% of VC fundraising, and emerging managers raised about 20% ([Juniper Square citing PitchBook](https://junipersquare.com/blog/vc-q4-2024); [Axios Pro](https://www.axios.com/pro/all-deals/2025/07/03/emerging-vc-managers-capital)). [FACT]
- **Indexing counterpoint.** AngelList's Abe Othman found that at seed, investing in *every credible deal* beats 90–95% of selective investors over ten years ([Kauffman Fellows interview](https://www.kauffmanfellows.org/journal/venture-returns-with-abe-othman-of-angellist); [AngelList](https://www.angellist.com/blog/angellist-access-fund)). That suggests **getting into the deal matters more than picking**, which reinforces the access economy. [FACT for the finding; OPINION for the implication]
- **Information rents and reciprocity.** Repeat syndication builds networks ([Hochberg et al.](https://ideas.repec.org/a/bla/jfinan/v62y2007i1p251-301.html)). Co-investment ties form on shared ethnicity, school and employer, and those **affinity-based** syndicates have *lower* success ([Gompers, Mukharlyamov & Xuan, JFE 2016](https://www.nber.org/papers/w18141); [HBS Working Knowledge](https://www.library.hbs.edu/working-knowledge/in-venture-capital-birds-of-a-feather-lose-money-together)). The norm "you bring me into yours, I bring you into mine" is folk wisdom. Insufficient data found for a direct measure of quid-pro-quo deal sharing. [FACT for homophily; reciprocity norm: OPINION]

---

## 3. "VCs are sheep" and herd behavior

### 3.1 Origin and quotes
- **Origin:** Insufficient data found for a definitive first use. The earliest instance we found is an entrepreneur writing "VCs are sheep" on the *Interesting People* mailing list in **September 2001** ([seclists archive](https://seclists.org/interesting-people/2001/Sep/7)). [SINGLE SOURCE, UNVERIFIED as "origin"]
- **Techdirt (2002):** "'venture capitalists are sheep' is a pretty common refrain," with VCs themselves admitting it ([Techdirt](https://www.techdirt.com/2002/12/05/venture-capitalists-forecast-is-pessimistic/)). [FACT that this was said]
- **Fred Wilson (USV):** "So many folks in the venture capital business are sheep that just want to follow the herd" ([BrainyQuote](https://www.brainyquote.com/quotes/fred_wilson_546413)). [SINGLE SOURCE, UNVERIFIED. We could not find the original AVC post]
- **Trae Stephens (Founders Fund)** argues VCs should back companies that *create* hype cycles rather than follow them ([Pirate Wires](https://piratewires.com/p/venture-capital-space-for-sheep); page returned HTTP 429, so we relied on the search snippet). On 20VC he said "the most competitive deals are the worst" ([episode listing](https://www.thetrustedinsight.com/investment-news/the-twenty-minute-vc-20vc-venture-capital-startup-funding-the-pitch-20vc-founders-funds-trae-stephens-on-why-the-most-competitive-deals-are-the-worst-why-no-company-is-successful-because-of-their-vc-why-we-are-making-zirp-mistakes-again-today-why-loss-r-20240403946)). [OPINION; SINGLE SOURCE each]
- **Paul Graham** ("How to Raise Money", 2013) describes investors as torn between fear of backing a loser and fear of missing a winner, and says founders should exploit this ([summary](https://www.getabstract.com/en/summary/how-to-raise-money/25800?af=briefly); original at paulgraham.com/fr.html). [OPINION; exact quote not retrieved]

### 3.2 Academic evidence
- **Networks shape outcomes:** [Hochberg, Ljungqvist & Lu (JF 2007)](https://ideas.repec.org/a/bla/jfinan/v62y2007i1p251-301.html). [FACT]
- **Affinity herding destroys value:** [Gompers, Mukharlyamov & Xuan (JFE 2016)](https://www.nber.org/papers/w18141). The cost shows up as worse decisions *after* investing, and it is largest at early stage. [FACT]
- **Belief cascades:** Academic models describe "Get Big Fast" cascades that over-concentrated dot-com investment in too few startups ([AEA 2007 paper](https://www.aeaweb.org/annual_mtg_papers/2007/0107_1300_0904.pdf)). [FACT that the model exists; empirical strength: SINGLE SOURCE]
- **Counter-evidence on the lead signal:** In an AngelList field experiment (4,500 investors, about 17,000 emails), the average investor responded strongly to **team** information and *not* to traction or **existing lead investors**. Experienced investors responded only to team ([Stanford GSB](https://www.gsb.stanford.edu/insights/shai-bernstein-what-really-matters-early-stage-investors); [IDEAS](https://ideas.repec.org/p/ecl/stabus/3006.html)). [FACT] Our reading is that **public, cold** lead signals are weak, while **private, trusted** signals ("Elad's in, closing Friday") are what drive herding. The experiment did not test the second kind. [OPINION]
- **Momentum and FOMO numbers:**
  - 2021: **$329.9B** invested across about 17,054 US deals, roughly double the prior high ([NVCA / PitchBook](https://nvca.org/press_releases/u-s-venture-capital-soars-to-new-highs-in-2021/)). [FACT]
  - 2025: AI took **53.2% of global and 62.7% of US VC** (PitchBook via [The Decoder](https://the-decoder.com/more-than-half-of-all-venture-capital-money-will-flow-into-ai-start-ups-in-2025/)). Crunchbase puts AI at about $212B, nearly half of global funding ([Crunchbase](https://news.crunchbase.com/sections/ai/)). [FACT, two sources agree]
  - Thinking Machines Lab (Mira Murati) raised a **$2B seed at $12B** before shipping a product, led by a16z. Reports say the valuation rose from $10B to $12B within weeks and the minimum check was $50M ([Maginative](https://www.maginative.com/article/mira-muratis-thinking-machines-lab-raises-2b-seed-round/); [Pulse 2.0](https://pulse2.com/thinking-machines-lab-2-billion-raised-at-12-billion-valuation-for-ai-technology)). [FACT for raise; $50M minimum: SINGLE SOURCE, UNVERIFIED]

### 3.3 How private networks amplify it
- **[OPINION, mechanism]** One commit from a top fund or a known angel gets forwarded through group chats, syndicate deal memos and scout networks. Each follower uses the earlier commit as a stand-in for diligence. The AngelList syndicate model formalizes this, since backers are "betting on the lead's judgment" ([Launchrock](https://www.launchrock.com/library/expert-advice/syndicate)).
- **Insufficient data found** for a quantitative study of group-chat or WhatsApp deal cascades.

---

## 4. Information asymmetry: who wins, who loses

### 4.1 Losers: outsiders
| Group | Data | Source |
|---|---|---|
| Women | All-female teams got about **2%** of US VC in 2024 ($3.7B vs. $154B for all-male) | [Paperjam citing PitchBook](https://en.paperjam.lu/article/pitchbook-women-vc-report-10bn-deal-value-in-2024) [FACT] |
| Women (causal) | More VC judges at HBS's competition raised **men's** odds of founding a VC-backed startup much more than women's, partly because men followed up more | [Howell & Nanda, NBER w26449 / JFQA 2024](https://www.nber.org/papers/w26449) [FACT] |
| Women (bias) | On AngelList, male investors show less interest in female-led startups. The male-led startups they prefer **underperform** the female-led startups they show interest in | [Ewens & Townsend, JFE 2020](https://business.columbia.edu/faculty/research/are-early-stage-investors-biased-against-women) [FACT] |
| Black founders | About **0.4%** of US funding (about $730M) in 2024, down from about 1.3% in 2021 | [POCIT citing Crunchbase](https://peopleofcolorintech.com/articles/black-founders-received-just-0-4-of-all-startup-funding-in-2024/) [FACT] |
| Labor pool | 1990–2016: women under 10% of VCs and founders, Hispanics about 2%, African Americans under 1%. Consistent with homophily-based hiring | [Gompers & Wang, NBER w23082](https://nber.org/papers/w23082) [FACT] |
| Geography | California startups got **48.79%** of US capital raised on Carta in 2024. Four states got over 72% | [Carta](https://carta.com/data/VC-funding-geography-2024/) [FACT] |
| Emerging managers | Funds under $250M AUM raised $6B in 2024, down 74%, vs. $23.1B in 2021 | [Juniper Square citing PitchBook](https://junipersquare.com/blog/vc-q4-2024) [FACT] |
| Non-pedigree founders | Insufficient data found for a clean, recent quantitative measure. | — |

### 4.2 Public signals partially democratize access
- **Form D:** It must be filed within 15 days of first sale. It often appears on EDGAR before (or instead of) press coverage. One vendor claims over 38,000 Form D filings in 2025, with only a small fraction covered in the press ([FilingFlow](https://blog.filingflow.app/2026/03/09/what-is-a-form-d-filing/); see also [Apify tracker](https://apify.com/datasignalslab/startup-funding-form-d-monitor)). [15-day rule: FACT (Reg D). 38,000 count: SINGLE SOURCE, UNVERIFIED, from a vendor blog. Cross-check with our `Product Research/` Form D notes]
- **Hiring, GitHub, web traffic:** These are used as public traction proxies by data vendors (see `Competitive Research/`: Harmonic and others). Insufficient data found for academic evidence that they reduce funding gaps.
- **Limit [OPINION]:** Public signals let outsiders *see* rounds. They do not give outsiders *allocation*. They democratize **information**, not **access**.

---

## 5. Implications for VentureSauce

### 5.1 Where a verification and public-signal layer fits
- **[OPINION]** The system runs on *trust transferred through people*. VentureSauce can sit at the **moment a trusted signal arrives** (deck forwarded, "X is leading, you in?") and turn the deck's claims into checkable facts in minutes. It complements the network rather than replacing it.
- **[OPINION]** Best fit: **followers**, not leads. That means syndicate backers, scouts, angels and associates who get a deck second-hand and have hours, not weeks. Leads with weeks of diligence and data rooms need it less.

### 5.2 Does herding make verification MORE valuable?
Evidence that diligence gets skipped when social proof and FOMO hit:
- **FTX:** Sequoia wrote down its full **$214M**, and Temasek wrote off **$275M** ([TechCrunch](https://techcrunch.com/2022/11/16/singapores-temasek-writes-down-275m-investment-in-ftx); [Advisorpedia](https://www.advisorpedia.com/alternatives/the-ftx-collapse-should-create-a-reckoning-for-private-market-due-diligence/)). Both claimed rigorous diligence. Temasek's ran about 8 months. Yet Alameda, 90% owned by SBF, was missing from the org chart given to Sequoia (same sources). A Sequoia partner typed "I LOVE THIS FOUNDER" during the pitch, and Sequoia later deleted its SBF profile ([PYMNTS](https://www.pymnts.com/cryptocurrency/2023/investment-firms-sued-for-adding-legitimacy-to-ftx/)). A class action alleged investors **lent legitimacy** to FTX (same source). [FACT for events and filings; the lawsuit claims are allegations]
- **Builder.ai:** Valued at about $1.5B, backed by Microsoft (reported $455M) and Qatar. It entered insolvency in May 2025 after lender Viola Credit seized $37M. 2024 revenue was restated from about **$220M to about $55M** and 2023 from about $180M to about $45M. The WSJ had questioned its AI claims in **2019**, yet funding continued for about six more years ([Silicon UK](https://www.silicon.co.uk/cloud/ai/builder-ai-sales-collapse-615436); [Intelligo](https://intelligo.ai/blog/when-hype-outpaces-scrutiny); [eDiscovery Today](https://ediscoverytoday.com/2025/06/05/the-biggest-ai-fraud-in-startup-history-artificial-intelligence-trends/)). [FACT across multiple secondary reports; "700 engineers pretending to be AI" is a press characterization, so treat as contested]
- **Theranos:** Investors relied on each other and on Walgreens. TPG's David Trujillo said people were "taking what a management team says at face value" ([Fortune](https://fortune.com/2018/05/04/theranos-investment-lost); [NPR / Carreyrou](https://www.npr.org/transcripts/622795416)). [FACT]
- **Tiger-era speed:** term sheets in about 48 hours, with diligence outsourced ([Crunchbase News](https://news.crunchbase.com/venture/tiger-global-management-strategy-investing-2021)). [FACT]

**Verdict [OPINION]:** Yes, conditionally. Herding raises the *value* of a fast independent check, because the follower's private information is near zero. It also lowers the *willingness* to check, because doubting a blessed deal is socially costly and slow. VentureSauce wins only if the check is **faster than the FOMO window** (minutes) and **discreet**, so nobody sees you doubting. Caveat: none of these frauds would have been caught by Form D alone. Builder.ai's revenue claims and FTX's Alameda link needed financial and relationship diligence. Form D, LinkedIn and the press can catch **raise-size, investor-list, headcount and timeline** mismatches, which is a narrower but real class of claims. [OPINION]

### 5.3 What this suggests about the hidden problem
Hypotheses to test [OPINION]:
1. The pain is not missing data. It is **no time and no social cover to doubt** a deal the network has already blessed.
2. Followers (angels, scouts, syndicate backers) bear the most risk and do the least diligence.
3. People want **"what does the deck say vs. what's public"** more than they want new deal discovery. Discovery is the network's job, and they may not want a tool there.
4. Outsiders (emerging managers, non-Bay angels) may value a public-signal layer more, because they lack the back-channel reference call.

### 5.4 Questions to ask testers
- "Walk me through the last deck you got forwarded. Who sent it, and how long did you have to decide?"
- "What did you actually check before committing? What did you skip, and why?"
- "When a fund you respect is leading, how much of your own diligence do you still do?"
- "Have you ever found out after investing that a deck claim (raise size, investors, team, revenue) was wrong? How did you find out?"
- "Would you be comfortable if the founder or lead knew you ran a check like this?" (tests the discretion need)
- "If this took 2 minutes vs. 20, would you use it in a hot round?" (tests the FOMO window)
- "Who in your network do you call for a back-channel reference? What if you had no one to call?" (tests the outsider angle)
- "Do you track Form D filings today? What do you do with them?"

---

## Sources
**Academic**
- Gompers, Gornall, Kaplan & Strebulaev, "How Do Venture Capitalists Make Decisions?" JFE. [SSRN](https://papers.ssrn.com/abstract=2801385) · [NBER Digest](https://www.nber.org/digest/dec16/w22587.html) · [HLS Forum](https://corpgov.law.harvard.edu/2019/08/20/how-do-venture-capitalists-make-decisions)
- Hochberg, Ljungqvist & Lu, "Whom You Know Matters," JF 2007. [IDEAS](https://ideas.repec.org/a/bla/jfinan/v62y2007i1p251-301.html) · [PDF](https://www.stat.berkeley.edu/~aldous/Networks/hochberg.pdf)
- Gompers, Mukharlyamov & Xuan, "The Cost of Friendship," JFE 2016. [NBER](https://www.nber.org/papers/w18141)
- Nanda, Samila & Sorenson, "The Persistent Effect of Initial Success," JFE. [NBER](https://www.nber.org/papers/w24887)
- Harris, Jenkinson, Kaplan & Stucke, "Has Persistence Persisted in Private Equity?" [NBER](https://www.nber.org/system/files/working_papers/w28109/w28109.pdf)
- Bernstein, Korteweg & Laws, "Attracting Early-Stage Investors," JF 2017. [Stanford GSB](https://www.gsb.stanford.edu/insights/shai-bernstein-what-really-matters-early-stage-investors) · [IDEAS](https://ideas.repec.org/p/ecl/stabus/3006.html)
- Howell & Nanda, "Networking Frictions in Venture Capital, and the Gender Gap," JFQA 2024. [NBER](https://www.nber.org/papers/w26449)
- Ewens & Townsend, "Are Early Stage Investors Biased Against Women?" JFE 2020. [Columbia](https://business.columbia.edu/faculty/research/are-early-stage-investors-biased-against-women)
- Gompers & Wang, "Diversity in Innovation." [NBER](https://nber.org/papers/w23082)
- Herding / "Get Big Fast" cascade model. [AEA 2007](https://www.aeaweb.org/annual_mtg_papers/2007/0107_1300_0904.pdf)

**Industry data and VC writing**
- [NVCA/PitchBook 2021 record](https://nvca.org/press_releases/u-s-venture-capital-soars-to-new-highs-in-2021/)
- [The Decoder: AI over 50% of VC, citing PitchBook](https://the-decoder.com/more-than-half-of-all-venture-capital-money-will-flow-into-ai-start-ups-in-2025/) · [Crunchbase AI](https://news.crunchbase.com/sections/ai/)
- [Carta bridge rounds](https://carta.com/data/linkedin-bridge-round-percentage-still-high/) · [Carta geography 2024](https://carta.com/data/VC-funding-geography-2024/)
- [Juniper Square / PitchBook Q4 2024](https://junipersquare.com/blog/vc-q4-2024) · [Axios Pro emerging managers](https://www.axios.com/pro/all-deals/2025/07/03/emerging-vc-managers-capital)
- [Power law / Horsley Bridge summary](https://marginalfutility.substack.com/p/the-power-law-in-venture-capital)
- [Abe Othman, Kauffman Fellows](https://www.kauffmanfellows.org/journal/venture-returns-with-abe-othman-of-angellist) · [AngelList Access Fund](https://www.angellist.com/blog/angellist-access-fund)
- [TechCrunch: Sequoia scouts](https://techcrunch.com/2019/06/07/a-peek-inside-sequoia-capitals-low-flying-wide-reaching-scout-program) · [Superscout](https://superscout.co/post/sequoia-capital-scout-program-transforming-the-venture-capital-landscape)
- [StrictlyVC: AngelList syndicates](https://strictlyvc.com/2013/11/page/2/) · [TechCrunch syndicates](https://techcrunch.com/?p=885618) · [Launchrock](https://www.launchrock.com/library/expert-advice/syndicate) · [vcbeast](https://vcbeast.com/venture-capital-glossary/angel-syndicate)
- [Crunchbase: Tiger Global 2021](https://news.crunchbase.com/venture/tiger-global-management-strategy-investing-2021) · [The Generalist: Tiger](https://generalist.com/briefing/tiger-global)
- [PitchBook women report via Paperjam](https://en.paperjam.lu/article/pitchbook-women-vc-report-10bn-deal-value-in-2024) · [POCIT / Crunchbase Black founders](https://peopleofcolorintech.com/articles/black-founders-received-just-0-4-of-all-startup-funding-in-2024/)
- [FilingFlow: Form D](https://blog.filingflow.app/2026/03/09/what-is-a-form-d-filing/) · [Apify Form D monitor](https://apify.com/datasignalslab/startup-funding-form-d-monitor)

**"Sheep" quotes and opinion**
- [Interesting People list, 2001](https://seclists.org/interesting-people/2001/Sep/7) · [Techdirt 2002](https://www.techdirt.com/2002/12/05/venture-capitalists-forecast-is-pessimistic/) · [Fred Wilson via BrainyQuote](https://www.brainyquote.com/quotes/fred_wilson_546413) · [Pirate Wires](https://piratewires.com/p/venture-capital-space-for-sheep) · [Trae Stephens on 20VC](https://www.thetrustedinsight.com/investment-news/the-twenty-minute-vc-20vc-venture-capital-startup-funding-the-pitch-20vc-founders-funds-trae-stephens-on-why-the-most-competitive-deals-are-the-worst-why-no-company-is-successful-because-of-their-vc-why-we-are-making-zirp-mistakes-again-today-why-loss-r-20240403946) · [Paul Graham "How to Raise Money" summary](https://www.getabstract.com/en/summary/how-to-raise-money/25800?af=briefly)

**Case studies**
- FTX: [TechCrunch (Temasek)](https://techcrunch.com/2022/11/16/singapores-temasek-writes-down-275m-investment-in-ftx) · [Advisorpedia](https://www.advisorpedia.com/alternatives/the-ftx-collapse-should-create-a-reckoning-for-private-market-due-diligence/) · [PYMNTS lawsuit](https://www.pymnts.com/cryptocurrency/2023/investment-firms-sued-for-adding-legitimacy-to-ftx/)
- Builder.ai: [Silicon UK](https://www.silicon.co.uk/cloud/ai/builder-ai-sales-collapse-615436) · [Intelligo](https://intelligo.ai/blog/when-hype-outpaces-scrutiny) · [eDiscovery Today](https://ediscoverytoday.com/2025/06/05/the-biggest-ai-fraud-in-startup-history-artificial-intelligence-trends/)
- Theranos: [Fortune](https://fortune.com/2018/05/04/theranos-investment-lost) · [NPR](https://www.npr.org/transcripts/622795416)
- Thinking Machines: [Maginative](https://www.maginative.com/article/mira-muratis-thinking-machines-lab-raises-2b-seed-round/) · [Pulse 2.0](https://pulse2.com/thinking-machines-lab-2-billion-raised-at-12-billion-valuation-for-ai-technology)

**Gaps / not retrieved:** primary Bloomberg, FT and WSJ articles on Builder.ai and FTX (paywalled; we relied on secondary coverage), the original Horsley Bridge deck, the original Fred Wilson "sheep" post, the full Pirate Wires text (HTTP 429), the PitchBook insider-round page, and quantitative data on party rounds, pre-emptive rounds and group-chat cascades.
