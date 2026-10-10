# Case Studies: "Hot" Founders, Herding, and Thin Diligence

*VentureSauce research. Compiled 2026-10-10. Every claim has a link. **[single source]** means only one outlet was found for that claim, so treat it as unverified. "Insufficient data found" means we looked and found nothing usable.*

---

## Executive summary

- **Instinct (Noah Shinn) is the clearest live example of a round-by-round stampede.** It went from a seed priced at about $50M (some reports say $100M) to a $500M+ Series A (Kleiner, early Aug 2026), then a $2.5B Series B (Index + Benchmark, announced Aug 26), then a $10B Series C ($1B; Sequoia, Benchmark, Coatue, Sep 28). That is roughly 200x in about five months, for an invite-only product that has only been in private beta since Feb 2026.
- **Investors found Shinn through his research and his last employer, not through his X following.** He was first author of *Reflexion* (NeurIPS 2023) and an early research scientist at Sierra (Bret Taylor). He posted on X for the first time on the day of the Series B announcement. His access strategy was to give VCs invites first, so investor group chats did the marketing.
- **Investors competed hard enough to clear the field.** After Shinn complained, Index (which had a signed term sheet) and Conviction reportedly pulled out of rival Town's $1B round (Upstarts Media, via Business Insider).
- **No Form D on EDGAR.** As of 2026-10-10 we found **no Form D** for "Spear Street Technology" (the operating entity) or for any Instinct-named issuer, despite three priced rounds in Aug–Sep 2026. "The filing lands before the press" did **not** hold here.
- **Comparable cases show the same mismatch.** Mercor filed three Form Ds in **Jan–Feb 2026** for rounds first sold in Jun 2024, Nov 2024 and Oct 2025, so each filing came **4 to 19 months after** the round was announced. SPV Form Ds sometimes show up first. An SPV for Thinking Machines Lab filed on 2025-06-27, about 18 days before the $2B seed was officially announced.
- **Fraud cases show what public data can and can't catch.** FTX, Builder.ai, Frank, IRL and Nate all inflated **operating claims** (users, revenue, automation). Form D can't check those. A **press archive** could have flagged Builder.ai (WSJ, 2019) years ahead. **Headcount and geography** signals (LinkedIn) were relevant to Builder.ai and Nate.
- **What this means for VentureSauce:** The user who most needs a 60-second claim check is an associate or angel offered an allocation with a 48–72 hour clock. Our value is the **truth table** (claim vs. evidence vs. gap), not Form D speed. The tool should flag "no filing found" as a neutral but useful fact rather than a red flag.

---

## 1. Lead case: Noah Shinn and Instinct

### 1.1 Who Noah Shinn is (verified)

| Claim | Status | Sources |
|---|---|---|
| First author of *Reflexion: Language Agents with Verbal Reinforcement Learning* (arXiv Mar 2023, NeurIPS 2023). Co-authors: Cassano, Berman, Gopinath, Narasimhan, Yao | **Verified** (multiple) | [Fortune](https://fortune.com/2026/09/30/noah-shinn-instinct-ai-assistant-meta-muse-alexandr-wang-tech-series-c-ai-agent-mark-zuckerberg/), [Business Insider](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9), [Layer3 Labs explainer](https://www.layer3labs.io/guides/who-is-noah-shinn) |
| Joined the Reflexion project as a Northeastern undergrad by answering a LinkedIn post from then-MIT professor Ashwin Gopinath | Verified (BI, VnExpress) | [BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9), [VnExpress](https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html) |
| Dropped out of Northeastern in 2023 and became one of Sierra's first employees (AI research across core products). Co-authored τ-bench | Verified | [BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9), [VnExpress](https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html), [Layer3](https://www.layer3labs.io/guides/who-is-noah-shinn) |
| Left Sierra Sep 2025 and started Instinct (LinkedIn says Oct 2025). The entity, **Spear Street Technology**, was registered in California in **April 2026** | Verified (BI and VnExpress for the dates; TFN and IBTimes/WSJ for the entity) | [TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/), [IBTimes AU](https://www.ibtimes.com.au/instinct-ai-startup-valuation-ai-boom-1874654) |
| Age 23 | Verified (multiple) | [Fortune](https://fortune.com/2026/09/30/noah-shinn-instinct-ai-assistant-meta-muse-alexandr-wang-tech-series-c-ai-agent-mark-zuckerberg/), [TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/) |

**What Instinct is:** an invite-only personal AI agent that you text or call. It uses its own phone number and computer to act across your apps: bookings, purchases, bills, cancelling subscriptions, and phone calls to businesses that don't take online bookings. Private beta started Feb 2026, and invite-only availability opened Aug 2026 ([TechCrunch](https://techcrunch.com/2026/09/28/viral-ai-agent-instinct-raises-1b-series-c-at-a-10b-valuation/), [VnExpress](https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html)). Reported privacy concerns: TechCrunch called the first privacy policy "particularly worrisome" ([TechCrunch](https://techcrunch.com/2026/09/28/viral-ai-agent-instinct-raises-1b-series-c-at-a-10b-valuation/)).

### 1.2 Funding timeline

| Date | Round | Amount | Post-money | Lead / investors | Sources and notes |
|---|---|---|---|---|---|
| Before Aug 2026 (exact date unknown) | Seed / early | Not disclosed | **~$50M** (TFN) *or* the earlier money was described as "$100M" raised (WSJ via SiliconANGLE and BI) | Conviction (Pranav Reddy), Greenoaks (Neil Mehta) | [TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/). **Conflicting reports**: Layer3 Labs notes the $50M-valuation and $100M-raised versions. Partner names are **[single source: TFN]** |
| Early Aug 2026 | Series A | $75M | >$500M | Kleiner Perkins (Mamoon Hamid) | [TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/), [IBTimes AU citing Forbes](https://www.ibtimes.com.au/instinct-ai-startup-valuation-ai-boom-1874654) |
| Announced **Aug 26, 2026** | Series B | $250M | $2.5B (PYMNTS said $2.25B) | Co-led by Index Ventures and Benchmark. Conviction, Greenoaks and Kleiner also listed | [TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/), [QZ](https://qz.com/instinct-ai-assistant-series-b-funding-valuation-082726), [AIPressRoom](https://aipressroom.com/instinct-250m-personal-ai-agents/). Total raised: $350M |
| Reported early Sep 2026 | (talks) | $1B | $10B | Not stated | [The Information](https://www.theinformation.com/articles/ai-agent-startup-instinct-talks-10-billion-valuation) (paywalled; cited by TC and BI). Reported user base above 100k (PYMNTS citing The Information, via [Layer3](https://www.layer3labs.io/guides/who-is-noah-shinn)): **[single source chain]** |
| Announced **Sep 28, 2026** | Series C | $1B | $10B | "Investors including Sequoia Capital, Benchmark Capital, and Coatue." No lead named | [TechCrunch](https://techcrunch.com/2026/09/28/viral-ai-agent-instinct-raises-1b-series-c-at-a-10b-valuation/), [Fortune](https://fortune.com/2026/09/30/noah-shinn-instinct-ai-assistant-meta-muse-alexandr-wang-tech-series-c-ai-agent-mark-zuckerberg/), [VnExpress citing Reuters](https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html) |

- **Speed:** Series A to Series B took about 3 weeks at 5x. Series B to Series C took about 1 month at 4x. Seed to Series C was about 200x in about 5 months ([TFN](https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/), [VnExpress](https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html)).
- **Headcount:** "$10 billion with just 14 employees" comes from [OfficeChai](https://officechai.com/ai/ai-agent-startup-instinct-is-now-worth-10-billion-with-just-14-employees/) **[single source, unverified]**. This is exactly the kind of claim a LinkedIn headcount check can confirm or refute.

### 1.3 How investors found him

- **Research reputation (strong evidence).** He was first author of Reflexion as an undergrad. Professor Arjun Guha told BI: *"Many people have since reinvented it, but the basic technique is in a paper that a second-year college student wrote in 2023, before GPT-4,"* and *"Virtually zero students can write research papers as undergrads. Even fewer can do it without any assistance."* ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9))
- **Lab / employer halo (strong evidence).** He was an early Sierra researcher. Bret Taylor told BI: *"Noah is an incredible engineer and entrepreneur, and I am so grateful I had the opportunity to work with him."* ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9)) How specific investors were introduced (for example, whether through the Sierra network): **insufficient data found**.
- **X/Twitter following: not the channel.** BI reports that on Aug 26 Shinn **posted on X for the first time**, on the same day he announced the Series B ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9)).
- **Product-led access to VCs (strong evidence).** *"He made it invite-only to venture capitalists early — a 'brilliant' idea, says Trace Cohen, the cofounder of Six Point Ventures. VCs began bragging on social media about the cool new AI agent doing their work for them."* Cohen: *"In all the group chats you see people saying, 'I just used this new technology — OMG,'"* and *"Everyone is just hounding each other for access."* ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9))
- **Accelerator ties:** none found. **Insufficient data found.**

### 1.4 Evidence of flocking and competition

- **Valuation stepped up 5x in about 3 weeks** between the Kleiner-led A and the Index/Benchmark-led B. IBTimes, citing Forbes, described it as "a VC feeding frenzy" ([IBTimes AU](https://www.ibtimes.com.au/instinct-ai-startup-valuation-ai-boom-1874654)).
- **Investors were cleared out of a rival's round.** Upstarts Media reported that Index, despite "reaching a signed term sheet," exited rival Town's $90M Series B at $1B after Instinct "complained to the investor about potential conflict of interest." Conviction also withdrew ([Upstarts Media, Sep 3 2026](https://www.upstartsmedia.com/p/scoop-town-fundraise-vc-reshuffle)). BI repeated the report and added that an Instinct spokesperson said the company is "unable to confirm the opinions of others" ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9)). Search snippets say Town denied that account, but **we could not verify the denial's wording.**
- **Competitive response from big tech:** Meta launched Muse weeks later. Alexandr Wang mockingly called the startup "Insect," and Shinn replied with a smiley ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9)).
- **Oversubscription / pre-emptive term sheets:** no explicit reports of oversubscription multiples or pre-emption. **Insufficient data found.**

### 1.5 Form D / EDGAR check (run 2026-10-10)

| Query | Result |
|---|---|
| EDGAR full-text search, forms=D, `"Spear Street Technology"` | **0 hits** |
| EDGAR company search, `Spear Street` | **No matching issuer** (the phrase "Spear Street" only matches SF street addresses of other filers, e.g., Databricks) |
| EDGAR company search, `Instinct` | Only unrelated issuers (Instinct Bio Technical, Instinct Science, etc.) |
| Full-text forms=D `"Noah Shinn"` (Sep 2025–Oct 2026) | **0 hits** |

**Bottom line:** There is no Form D for Instinct or Spear Street Technology on EDGAR **as of 2026-10-10**, even though there were three priced rounds. We can't compute a filing-vs-announcement gap. Possible explanations, none verified: (a) filing under a different legal name, (b) a late filing (common; see Mercor below), (c) no filing at all (Form D is a condition of the Rule 506 safe harbor rather than strictly enforced), or (d) EDGAR full-text indexing lag. **Do not tell users "Instinct filed a Form D."**

### 1.6 Quotes

- Shinn (statement, Series C): *"This funding helps us bring Instinct to more people and continue building the future of personal AI. It's an exciting, creative time, and we're just getting started."* ([TechCrunch](https://techcrunch.com/2026/09/28/viral-ai-agent-instinct-raises-1b-series-c-at-a-10b-valuation/))
- Shinn (X, Aug 26, as quoted): *"I'm thrilled with everything our early users are doing with Instinct."* ([IBTimes AU citing TechCrunch](https://www.ibtimes.com.au/instinct-ai-startup-valuation-ai-boom-1874654))
- Trace Cohen (Six Point Ventures): *"Everyone is just hounding each other for access."* ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9))
- Lead investors (Hamid, Index, Benchmark, Sequoia): **no on-record quotes found.**

---

## 2. Comparable "blew up fast" cases (2023–2026)

| Company / founder | Speed and size | Lead and allocation | Herding signals | Form D vs. announcement |
|---|---|---|---|---|
| **Thinking Machines Lab** (Mira Murati, ex-OpenAI CTO) | Founded Feb 2025. **$2B seed at $12B** closed and announced Jul 15 2025. In June, reports had it at $10B, so the price rose about 20% in a month | Led by a16z, with Nvidia, Accel, ServiceNow, Cisco, AMD and Jane Street ([TechCrunch](https://techcrunch.com/2025/07/15/mira-muratis-thinking-machines-lab-is-worth-12b-in-seed-round/), [Yahoo/Reuters-sourced](https://finance.yahoo.com/news/a16z-eyes-leading-mega-round-221636525.html)). A concentrated, strategic-heavy syndicate | Pre-product "largest seed ever." An investor quoted in Diginomica: *"When someone's been instrumental in developing transformative tech like GPT-4, investors tend to throw traditional due diligence out the window"* ([Diginomica](https://diginomica.com/ai-fomo-investing-even-focusing-right-place)) | **An SPV filed first.** "Thinking Machines Lab Jun 2025 a Series of CGF2021 LLC" (CIK 2074935) filed a Form D on **2025-06-27**: first sale 2025-06-11, $595,030 from 14 investors ([EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002074935)). That is about 18 days before the official announcement. No issuer-level Form D found |
| **Safe Superintelligence** (Ilya Sutskever) | $1B at about $5B (Sep 2024), then about $2B at $32B (Apr 2025). No product | Round 1: a16z, Sequoia, DST, SV Angel, NFDG ([Axios](https://www.axios.com/2024/09/05/ilya-sutskevers-ai-startup-raise), [Bloomberg](https://www.bloomberg.com/news/articles/2024-09-04/openai-co-founder-raises-1-billion-to-build-safe-powerful-ai)). Round 2: Greenoaks led ([TechCrunch](https://techcrunch.com/2025/04/12/openai-co-founder-ilya-sutskevers-safe-superintelligence-reportedly-valued-at-32b)). NFDG was co-founder Daniel Gross's own fund, a clear insider allocation | The valuation rose about 6x in 7 months with no product or revenue | **No Form D found** for "Safe Superintelligence" on EDGAR (full-text or company search) |
| **Cognition** (Devin) | Founded Nov 2023. Devin demo Mar 2024 (its launch tweet reportedly got about 30M views). $21M Series A, then **$175M at $2B about one month later** (Apr 2024) | **Founders Fund led both rounds and was the sole investor in the $175M** ([Maginative](https://www.maginative.com/article/cognition-ai-raises-175m-at-2b-valuation-one-month-after-series-a/), [AI Business](https://aibusiness.com/nlp/six-month-old-ai-startup-behind-devin-now-valued-at-2b)). A single-firm allocation | A viral demo drove the round. Devin scored 13.86% on SWE-Bench, and its claims drew skeptics ([AI Business](https://aibusiness.com/nlp/six-month-old-ai-startup-behind-devin-now-valued-at-2b)) | **No Form D found** for "Cognition AI" or "Cognition Labs" |
| **Mercor** (Foody, Hiremath, Midha) | Series A $32M at $250M (Sep 2024), Series B $100M at $2B (Feb 2025), Series C **$350M at $10B** (Oct 27 2025). 40x in about 13 months | Benchmark early. Felicis led B and C, with General Catalyst and Robinhood Ventures ([TechCrunch](https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/), [Multiples](https://multiples.vc/private-comps/mercor)) | A wave of SPVs: EDGAR shows Form Ds from Emergence, Spina, Argo, Soma, HII and other "Mercor" SPVs (full-text search, forms=D) | **Issuer Form Ds filed late, after announcement.** Mercor.io Corp (CIK 2103986) filed on 2026-01-23 ($34.7M, first sale 2024-06-13, 70 investors), 2026-02-04 ($103.6M, first sale 2024-11-22) and 2026-02-18 ($330.4M, first sale 2025-10-10, 21 investors) ([EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002103986&type=D)). Matching these to Series A/B/C is **our inference** from the amounts and dates. The gaps run from about 4 to 19 months **after** announcement |
| **Reflection AI** (Laskin, Antonoglou; ex-DeepMind) | Out of stealth Mar 2025 with $130M at $545M. **$2B at $8B** (Oct 2025), about 15x in 7 months | Nvidia led, with DST, Lightspeed, B Capital, 1789, Citi, Eric Schmidt and Eric Yuan ([AI Business](https://aibusiness.com/foundation-models/reflection-ai-raises-2b-nvidia-leads-open-source-push)) | A lab-pedigree premium on a thesis (an "open frontier lab") | SPV Form Ds only (e.g., "Reflection AI T1V NOVEMBER 25", filed 2025-12-08, $137k, 6 investors). **No issuer Form D found** |

*Cursor/Anysphere and Physical Intelligence: EDGAR shows SPV Form Ds only (for example, "25Madison Anysphere SPV Mar 2026", filed 2026-04-13). We didn't research their round histories in this pass. Insufficient data collected.*

**Pattern:** Hot-company issuers often **don't file promptly, or at all**. SPV series LLCs (for example, CGF2021 LLC series) file reliably and sometimes **before** the press. VentureSauce should search SPV names that contain the target's name, not only the issuer.

---

## 3. Counter-examples: herding plus thin diligence

| Case | Claims made | Who herded in | What public data could have flagged | What it couldn't |
|---|---|---|---|---|
| **FTX** (SBF), collapsed Nov 2022 | A safe, compliant exchange and "super-app." Customer funds were separate from Alameda | Sequoia ($213.5M across FTX and FTX US, marked to $0), Tiger, SoftBank, Temasek and others ([The Block](https://www.theblock.co/post/185136/sequoia-says-its-investment-in-ftx-is-now-worthless)) | **Press and governance gaps:** no real board, and a founder-controlled related trading firm (Alameda). The TDK/6Pages report notes that flaws could have been exposed with "minimally adequate" diligence and that one investor admitted FOMO was a factor ([TDK Ventures report](https://tdk-ventures.com/wp-content/uploads/2024/04/6Pages-Report-for-TDK-Ventures-Apr-2024-Doing-Diligence-Well-in-Venture-Investing.pdf)) | Commingling of customer funds was only visible in internal books |
| **Builder.ai** (Sachin Dev Duggal), insolvent May–Jun 2025 | "Natasha" AI builds apps. 2024 revenue projected at about $220M | Microsoft (equity plus partnership), QIA (led the $250M Series D), Insight, Iconiq, Jungle, SoftBank. More than $450M raised in total ([Inc42](https://inc42.com/?p=399773), [Verdict](https://www.verdict.co.uk/builder-ai-raises-250m/)) | **Press:** in **Aug 2019** the WSJ reported that Engineer.ai relied on human engineers rather than AI ([summary via Wikipedia/Analytics India](https://en.wikipedia.org/wiki/Builder.ai), [AIM](https://analyticsindiamag.com/ai-features/should-engineer-ai-be-blamed-for-exaggerated-claims)). That was **six years before the collapse.** **LinkedIn:** a large India-based engineering headcount (reported at about 700) didn't fit an "AI does the coding" claim ([eWEEK](https://www.eweek.com/news/builderai-bankruptcy-ai-developers-coding/)) | Revenue overstatement (actual about $55M vs. $220M projected) and alleged round-tripping with VerSe ([Mobile World Live citing Bloomberg](https://www.mobileworldlive.com/ai-cloud/builder-ai-files-for-bankruptcy-following-sales-scandal)) |
| **Frank** (Charlie Javice), acquired by JPMorgan for $175M in 2021 | 4.25M users | JPMorgan as acquirer, after earlier VC rounds | **LinkedIn and web traffic:** a team of a few dozen people and web-traffic data would have struggled to support 4.25M users. *Our inference, not proven in court* | The user list was fabricated with synthetic data. Real users numbered about 300k. Javice was sentenced to 85 months ([DOJ SDNY](https://www.justice.gov/usao-sdny/pr/startup-ceo-charlie-javice-sentenced-85-months-prison-175-million-fraud)) |
| **IRL** (Abraham Shafi), shut down Jun 2023 | 12M+ users via "viral popularity and organic growth" | SoftBank Vision Fund 2 led the $170M Series C at $1.17B ([TechCrunch](https://techcrunch.com/2024/07/31/founder-behind-social-media-app-irl-charged-with-fraud)) | **Press, app-store and engagement data** could have tested "organic" growth. The board later found 95% of users were "automated or from bots" ([Silicon UK](https://silicon.co.uk/e-regulation/legal/irl-founder-fraud-sec-574236)) | Hidden ad spend of about $6M was routed through third parties (SEC complaint), so it wasn't visible publicly |
| **Nate** (Albert Saniger), assets sold Jan 2023 | AI checkout "without human intervention" | Coatue, Forerunner. $38M Series A led by Renegade (2021). More than $50M raised in total ([TechCrunch](https://techcrunch.com/2025/04/10/fintech-founder-charged-with-fraud-after-ai-shopping-app-found-to-be-powered-by-humans-in-the-philippines)) | **LinkedIn and geography:** hundreds of contractors at a call center in the Philippines (DOJ allegation). The Information reported on this in 2022 (per TechCrunch) | The real automation rate was "effectively 0%," and that was only provable internally |

**Takeaway for VentureSauce:** Form D verifies **raise amounts, dates, investor counts and named executives**. It **cannot** verify users, revenue or "AI" claims. Our scope should match that. The strongest public-data catches in these cases came from **old press**, mapped to the pitch-deck claim (Builder.ai 2019), and from **headcount or location mismatches** (Builder.ai, Nate).

---

## 4. Founder and VC quotes on herd mentality

- **Paul Graham (YC), "Investor Herd Dynamics" (2013):** *"The biggest component in most investors' opinion of you is the opinion of other investors."* And: *"when mediocre investors see that lots of other people want to invest in you, they assume there must be a reason. This leads to the phenomenon known in the Valley as the 'hot deal.'"* ([paulgraham.com](https://www.paulgraham.com/herd.html))
- **Jonathan Ross (Groq founder), on David Senra's show:** *"Typical West Coast VCs are more like lemmings… if one VC puts money in, all the others want to put money in… if one VC passes, they're going to go tell every other VC, and like lemmings, they're all going to pass as well."* (via an [aggregated clip](https://bittide.aicompass.dev/article/f3636bc7-5555-401d-8835-cf36c9661918?cache=1)) **[single source: aggregator of a tweet. Verify against the original podcast before quoting publicly.]**
- **Tyler Denk (beehiiv founder), the "ignored then swarmed" story:** *"Just a little over a year prior, more than 40 investors passed on the opportunity to participate in our seed round."* Once one term sheet landed, he had three partner calls on Monday and two term sheets by Friday, and one valuation went up 20% *"over a single text."* ([Big Desk Energy](https://mail.bigdeskenergy.com/p/series-a-story))
- **Jason Lemkin (SaaStr), on hot AI seeds in 2025–26:** *"In the hot deal environment, investors moved fast. FOMO was real… Everyone assumed someone else had done the diligence. Spoiler alert: No one had."* ([SaaStr](https://www.saastr.com/the-dark-side-of-hot-seed-rounds-in-the-age-of-ai-when-founders-just-keep-the-money/))
- **Deedy Das (Menlo Ventures):** *"When you see almost 20 companies I can think of that have a billion-dollar post-money valuation that make no revenue, I don't think it takes a genius to know that not all of them can work."* ([BI, Dec 2025](https://www.businessinsider.com/vc-fomo-a-reckoning-might-be-coming-in-2026-2025-12))
- **Sequoia on FTX (Nov 2022 LP letter):** *"We are in the business of taking risk. Some investments will surprise to the upside, and some will surprise to the downside."* ([The Block](https://www.theblock.co/post/185136/sequoia-says-its-investment-in-ftx-is-now-worthless)) Sequoia's own deleted profile of SBF records a partner typing *"I LOVE THIS FOUNDER"* in the Zoom chat during the pitch (as quoted in [Landon Thomas's recap](https://landonthomas.substack.com/p/sam-bankman-fried-and-those-who-believed)). **[secondary source; the original Sequoia post was deleted]**
- **Harrison Tang (Spokeo CEO), on SVB:** *"When someone invests in clean energy or AI, everyone else would pile on the proverbial bandwagon."* ([Pasadena Now](https://pasadenanow.com/main/guest-commentary-harrison-tang-how-the-vc-herd-mentality-triggered-svbs-collapse))

---

## 5. Synthesis

### 5.1 What makes a founder "hot"
1. **Lab or employer pedigree:** OpenAI (Murati, Sutskever), DeepMind (Reflection), Sierra (Shinn).
2. **A visible artifact before the company exists:** a famous paper (Reflexion) or a viral demo (Devin's launch video, about 30M views).
3. **A top-tier lead as the signal:** Founders Fund on Cognition, Kleiner then Benchmark/Index on Instinct, a16z on TML. Every later investor prices off the lead (see [PG](https://www.paulgraham.com/herd.html)).
4. **Scarcity engineered for investors:** Instinct gave VCs invites first, and the group chats did the rest ([BI](https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9)).

### 5.2 How long the window lasts
- About **3–5 weeks per step-up** in the hottest cases: Instinct A to B was about 3 weeks, B to C about 4.5 weeks. Cognition went from Series A to $2B in about 1 month. TML's valuation rose about 20% in the month between first reports and the close.
- Practically, an associate gets **days, not weeks**, to decide on an allocation. Diginomica quotes an operator who saw *"a $25 million round close in 72 hours"* ([Diginomica](https://diginomica.com/ai-fomo-investing-even-focusing-right-place)).

### 5.3 Who gets access vs. who's locked out
- **Inside:** prior employers' networks, the founder's own fund (NFDG at SSI), mega-funds and strategics (Nvidia, AMD, Cisco), and existing investors exercising pro-rata.
- **Gatekept:** founders can **remove** investors who back rivals (Index and Conviction leaving Town).
- **Outside:** angels and smaller funds who get in **via SPVs** (CGF2021, HII and similar series). These are often several layers removed and have high fees, and BI warns "some may be scams" ([BI, Aug 2025](https://www.businessinsider.com/fomo-fueling-a-risky-bubble-in-ais-hottest-companies-2025-8)). These buyers have the **least diligence access and the least time**, which makes them a natural fit for VentureSauce.

### 5.4 What this means for VentureSauce
- **Who the target user is:** An associate or angel facing a "close Friday" deadline on a hot deal or SPV allocation. They can't run a two-week process, but they can paste a deck into a side panel.
- **Reframe "Form D first" as "Form D as evidence":** For hot deals, issuer Form Ds are often **missing or late** (Instinct: none; Mercor: 4–19 months late). The truth table should say "no Form D found as of date X" neutrally. Missing is common and does not by itself mean fraud. The check should also search **SPV names** that contain the company's name.
- **Highest-value checks:** (a) deck "raised $X from Y" vs. Form D or SPV filings and the press; (b) team and headcount claims vs. LinkedIn (Builder.ai, Nate, and the "14 employees" claim at Instinct); (c) a press archive scan for **contradicting old reporting** (Builder.ai's 2019 WSJ story).
- **Be honest about scope:** We **can't** verify users or revenue (Frank, IRL). The product should say so instead of implying it can.

### 5.5 Sense Check and interview questions this raises
1. "Think about the last hot round you were offered. How much time did you have between the first email and the wire deadline, and what did you actually check?"
2. "When a deck says 'backed by [top-tier fund]', how do you verify that today? Have you ever found that it wasn't true or was overstated?"
3. "If our check showed 'no Form D on file' for a company that claims a $250M round, would you read that as a red flag, as noise, or as a question to ask the founder?"
4. "Have you bought into a hot company through an SPV? How many layers removed were you, and what information did you get?"
5. "Which claim in a deck have you seen turn out false most often: headcount, investors, revenue, or customers? Which of those would you pay to have checked instantly?"

---

## Sources

**Instinct / Noah Shinn**
- TechCrunch: Instinct $1B Series C at $10B (2026-09-28): https://techcrunch.com/2026/09/28/viral-ai-agent-instinct-raises-1b-series-c-at-a-10b-valuation/
- Business Insider: "Mark Zuckerberg's new AI nemesis" (2026-09-22): https://www.businessinsider.com/noah-shinn-instinct-ai-competes-meta-muse-2026-9
- Fortune (2026-09-30): https://fortune.com/2026/09/30/noah-shinn-instinct-ai-assistant-meta-muse-alexandr-wang-tech-series-c-ai-agent-mark-zuckerberg/
- Tech Funding News (2026-08-27): https://techfundingnews.com/noah-shinns-instinct-goes-from-100m-to-2-5b-in-weeks-23-year-olds-ai-assistant-just-raised-250m-series-b/
- IBTimes AU (citing WSJ, Forbes): https://www.ibtimes.com.au/instinct-ai-startup-valuation-ai-boom-1874654
- Upstarts Media, Town/Index scoop (2026-09-03): https://www.upstartsmedia.com/p/scoop-town-fundraise-vc-reshuffle
- VnExpress (citing Reuters): https://e.vnexpress.net/news/tech/personalities/23-year-old-college-dropout-builds-10b-ai-startup-in-less-than-a-year-5127225.html
- Layer3 Labs explainer: https://www.layer3labs.io/guides/who-is-noah-shinn
- QZ: https://qz.com/instinct-ai-assistant-series-b-funding-valuation-082726
- AIPressRoom: https://aipressroom.com/instinct-250m-personal-ai-agents/
- OfficeChai (14 employees, unverified): https://officechai.com/ai/ai-agent-startup-instinct-is-now-worth-10-billion-with-just-14-employees/
- The Information (paywalled): https://www.theinformation.com/articles/ai-agent-startup-instinct-talks-10-billion-valuation

**SEC EDGAR (queried 2026-10-10)**
- Full-text search API: https://efts.sec.gov/LATEST/search-index?q=%22Spear%20Street%20Technology%22&forms=D
- Mercor.io Corp filings: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002103986&type=D (submissions JSON: https://data.sec.gov/submissions/CIK0002103986.json)
- Thinking Machines Lab Jun 2025 SPV: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002074935
- Reflection AI T1V SPV: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002099791

**Comparables**
- TechCrunch, Thinking Machines $2B seed: https://techcrunch.com/2025/07/15/mira-muratis-thinking-machines-lab-is-worth-12b-in-seed-round/
- Yahoo Finance, a16z leading TML: https://finance.yahoo.com/news/a16z-eyes-leading-mega-round-221636525.html
- Axios, SSI $1B: https://www.axios.com/2024/09/05/ilya-sutskevers-ai-startup-raise
- Bloomberg, SSI $1B: https://www.bloomberg.com/news/articles/2024-09-04/openai-co-founder-raises-1-billion-to-build-safe-powerful-ai
- TechCrunch, SSI $32B: https://techcrunch.com/2025/04/12/openai-co-founder-ilya-sutskevers-safe-superintelligence-reportedly-valued-at-32b
- Maginative, Cognition $175M: https://www.maginative.com/article/cognition-ai-raises-175m-at-2b-valuation-one-month-after-series-a/
- AI Business, Cognition $2B: https://aibusiness.com/nlp/six-month-old-ai-startup-behind-devin-now-valued-at-2b
- TechCrunch, Mercor $10B: https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/
- Multiples, Mercor: https://multiples.vc/private-comps/mercor
- AI Business, Reflection AI $2B: https://aibusiness.com/foundation-models/reflection-ai-raises-2b-nvidia-leads-open-source-push

**Counter-examples**
- The Block, Sequoia FTX write-down: https://www.theblock.co/post/185136/sequoia-says-its-investment-in-ftx-is-now-worthless
- Landon Thomas, SBF recap: https://landonthomas.substack.com/p/sam-bankman-fried-and-those-who-believed
- TDK Ventures / 6Pages diligence report: https://tdk-ventures.com/wp-content/uploads/2024/04/6Pages-Report-for-TDK-Ventures-Apr-2024-Doing-Diligence-Well-in-Venture-Investing.pdf
- Mobile World Live, Builder.ai bankruptcy (Bloomberg revenue): https://www.mobileworldlive.com/ai-cloud/builder-ai-files-for-bankruptcy-following-sales-scandal
- eWEEK, Builder.ai engineers: https://www.eweek.com/news/builderai-bankruptcy-ai-developers-coding/
- Inc42, Builder.ai Series D: https://inc42.com/?p=399773
- Verdict, Builder.ai $250M: https://www.verdict.co.uk/builder-ai-raises-250m/
- Wikipedia, Builder.ai (2019 WSJ summary): https://en.wikipedia.org/wiki/Builder.ai
- Analytics India Mag, Engineer.ai 2019: https://analyticsindiamag.com/ai-features/should-engineer-ai-be-blamed-for-exaggerated-claims
- DOJ SDNY, Javice sentencing: https://www.justice.gov/usao-sdny/pr/startup-ceo-charlie-javice-sentenced-85-months-prison-175-million-fraud
- TechCrunch, IRL founder charged: https://techcrunch.com/2024/07/31/founder-behind-social-media-app-irl-charged-with-fraud
- Silicon UK, IRL SEC charges: https://silicon.co.uk/e-regulation/legal/irl-founder-fraud-sec-574236
- TechCrunch, Nate founder charged: https://techcrunch.com/2025/04/10/fintech-founder-charged-with-fraud-after-ai-shopping-app-found-to-be-powered-by-humans-in-the-philippines

**Herd-mentality commentary**
- Paul Graham, Investor Herd Dynamics: https://www.paulgraham.com/herd.html
- Jonathan Ross clip (aggregator): https://bittide.aicompass.dev/article/f3636bc7-5555-401d-8835-cf36c9661918?cache=1
- Tyler Denk, Series A story: https://mail.bigdeskenergy.com/p/series-a-story
- SaaStr, hot seed rounds: https://www.saastr.com/the-dark-side-of-hot-seed-rounds-in-the-age-of-ai-when-founders-just-keep-the-money/
- Business Insider, 2025 VC FOMO: https://www.businessinsider.com/vc-fomo-a-reckoning-might-be-coming-in-2026-2025-12
- Business Insider, AI FOMO and SPVs: https://www.businessinsider.com/fomo-fueling-a-risky-bubble-in-ais-hottest-companies-2025-8
- Diginomica, AI FOMO: https://diginomica.com/ai-fomo-investing-even-focusing-right-place
- Pasadena Now, Harrison Tang: https://pasadenanow.com/main/guest-commentary-harrison-tang-how-the-vc-herd-mentality-triggered-svbs-collapse
