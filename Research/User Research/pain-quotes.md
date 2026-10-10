# Pain Quotes: Unverified Deck Claims, in Investors' Own Words

**Product (per `docs/PLAN.md`):** a Chrome side panel. Drop in a deck and get a claim-by-claim truth table that checks headcount against LinkedIn, money raised and board against SEC Form D, and customers against the press.

Gathered 2026-10-10. **Every line in quotation marks is verbatim from the linked page.** **[excerpt]** means we saw the text through a search index but could not open the page itself (Reddit blocks fetches), so re-open it before putting it on a slide. "Unverified" means a single source.

---

## Theme 1: Founders overstate claims, and investors only catch it by checking by hand

| # | Quote | Speaker / role | Source |
|---|---|---|---|
| 1.1 | "There's nothing that kills a financing faster than something in the pitch that is outright wrong" | Jason Lemkin, SaaStr founder and VC | [SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs) |
| 1.2 | "the founders said they had closed $X0,000 in revenue with their first few customers ... I called these customers and … well … it turned out they weren't actually customers. Not yet, at least. In one case, they were all unpaid pilots with draft contracts" | Jason Lemkin | same |
| 1.3 | "Other examples include claiming management team and/or key team members … that aren't actually signed up yet. Or are really just advisors, or part-timers." | Jason Lemkin | same. This supports both the **team/board** and the **headcount** checks |
| 1.4 | "My 'favorite' are fake and pseudo metrics like 'QRR' where founders combine three months of revenue into one Quarterly Recurring Revenue number" | Jason Lemkin | same |
| 1.5 | "That BigCo logo on your traction slide might be hurting more than helping. ... most LOIs are just expensive lies founders tell themselves" | JDM and Cameron Law, *Traction Lab* podcast | [zerototraction.substack.com](https://zerototraction.substack.com/p/loi-or-just-a-lie) |
| 1.6 | "Signal is found in specificity ... Leave them all vague, and all you have is noise." | Same podcast | same |
| 1.7 | "Companies have been known to list '1000+ employees' that include every contractor who ever touched a project." / LinkedIn data is "unverified self-published marketing copy ... with an obvious incentive to round up." | Lilach Bullock, marketing consultant. **Single source, unverified.** | [lilachbullock.com](https://www.lilachbullock.com/is-linkedin-reliable-source-business-research/) [excerpt] |

## Theme 2: Verifying claims is the job, and "trust but verify" is the norm

| # | Quote | Speaker / role | Source |
|---|---|---|---|
| 2.1 | "You can trust the founders, but you have to verify that the data you have is correct." | Jason Calacanis, angel investor (on IRL's fake users) | [Fortune, Jul 2023](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/) |
| 2.2 | "The number one part of diligence ... is the off-sheet references: talking to customers from a list that you figured out yourself, not from the company itself." | David Sacks, GP, Craft Ventures | same |
| 2.3 | Big funds' diligence "is perfunctory, and it becomes a theatrical exposé…this sort of thin fig leaf you can point to LPs" | Chamath Palihapitiya | same |
| 2.4 | "You move on once you spot Alternative Facts." | Jason Lemkin | [SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs) |

## Theme 3: Deck fatigue (high volume, minutes per deck)

| # | Quote / data | Speaker / role | Source |
|---|---|---|---|
| 3.1 | "I see thousands of pitch decks a year." | Kathryn O'Day, investor | [The O'Daily, Sep 2025](https://kathrynoday.substack.com/p/3-red-flags-vcs-look-for-in-your) |
| 3.2 | "Investors ~don't know how to read~ are moving quickly." | Kathryn O'Day | same |
| 3.3 | VCs spend an average of **3 min 44 s** on a deck (DocSend study) | TechCrunch on DocSend data (2015). A 2026 restatement claims the same number and that only 58% of decks get read to the last slide, which is **unverified** | [TechCrunch](https://techcrunch.com/?p=1167693), [presentations.ai](https://www.presentations.ai/blog/pitch-deck-statistics) |
| 3.4 | Investors spent "24% less time looking at pitch decks in 2022 compared to 2021", and decks that fail get about 2 min 13 s | DocSend data via aggregator. **Unverified.** | [presentations.ai](https://www.presentations.ai/blog/pitch-deck-statistics) |
| 3.5 | Analysts "scan 5 to 15 inbound pitch decks per day" | VC Beast. **Unverified** (the page returned 429 when we tried to open it) | [VC Beast](https://vcbeast.com/vc-analyst-day-in-the-life) [excerpt] |
| 3.6 | "a typical VC analyst reviews around 3,000 decks annually and invests in roughly 9" | HackerNoon author who built an AI screener. **Unverified.** | [HackerNoon mirror](https://thenote.app/post/en/how-i-built-an-ai-vc-associate-to-screen-3-000-pitch-decks-6hrdvqqmhl) [excerpt] |

**Implication:** with about 4 minutes per deck, nobody verifies anything at first screen. Verification happens after the first meeting (PLAN H2). That is our window.

## Theme 4: Getting burned. Fraud cases where the claims went unchecked

| Case | What was claimed vs. what was true | Which truth-table check would have flagged it | Source |
|---|---|---|---|
| **Frank** (Charlie Javice) | Claimed **4.25M customers**, actually about **300,000**. JPMorgan paid $175M. In a later test email, "Only 28% of the emails were delivered, and just 1.1% were opened." Convicted Mar 2025 | Customer and user claims (we cannot check this directly. It shows that users and customers are the most-faked numbers) | [NPR](https://www.npr.org/2025/03/29/nx-s1-5344434/charlie-javice-convicted-defrauding-jpmorgan), [Fortune](https://fortune.com/2025/03/28/charlie-javice-guilty-jp-morgan-fraud) |
| **Theranos** | Claimed >$100M in 2014 revenue, including from the DoD. Actual was about $100,000, and the technology "was never deployed by the U.S. Department of Defense" (SEC) | **Customer logo vs. public evidence** check | [Fortune 2018](https://fortune.com/2018/03/14/theranos-elizabeth-holmes-fraud-sec), [Institutional Investor](https://www.institutionalinvestor.com/article/2bsxms6flv3x0d641qy2o/corner-office/sec-charges-theranos-holmes-and-balwani-with-massive-fraud) |
| **Nate** (Albert Saniger) | Claimed AI checkout "without human intervention". In fact it used hundreds of contractors in the Philippines, and "actual automation rate was effectively 0%" (DOJ). Raised >$50M | **Headcount and team composition** (a LinkedIn and offshore staff mismatch is the kind of signal that could have hinted) | [TechCrunch, Apr 2025](https://techcrunch.com/2025/04/10/fintech-founder-charged-with-fraud-after-ai-shopping-app-found-to-be-powered-by-humans-in-the-philippines) |
| **Builder.ai** | Told investors 2024 revenue was $220M. The actual figure was about $50M ("overstated ... by 300 per cent"). Bankrupt Jun 2025 | Revenue (we cannot check this) and **headcount vs. "AI"** (about 700 engineers in India, per secondary reports, **unverified**) | [Mobile World Live](https://www.mobileworldlive.com/ai-cloud/builder-ai-files-for-bankruptcy-following-sales-scandal), [AGBI](https://www.agbi.com/tech/2025/05/qatar-backed-builder-ai-collapses-with-sales-in-doubt) |
| **IRL** | Admitted that **95% of its users were fake**, after raising >$200M including a SoftBank-led $170M Series C | User claims | [Fortune, Jul 2023](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/) |

**Honest caveat for the pitch:** none of these frauds would have been fully caught by LinkedIn plus Form D plus press. The defensible story is narrower: claims that can be checked publicly (team, raise, board, logos) go unchecked at screening, and these cases show what unchecked claims can cost. Don't claim the tool would have stopped Theranos.

## Theme 5: Data handling (is uploading a deck allowed?)

| # | Quote | Speaker / role | Source |
|---|---|---|---|
| 5.1 | "That single paste can breach the NDA governing the data room, expose material nonpublic information, and contradict the data controls the firm attested to on its cyber insurance application." | Founder of a finance AI tool (vendor post). **Unverified.** | [Indie Hackers](https://www.indiehackers.com/post/every-deal-team-has-a-chatgpt-tab-open-nobody-wants-to-talk-about-whats-in-it-41c07af252) |
| 5.2 | "Policy without infrastructure does not change behavior under deadline pressure." | Same | same |

Note: this is about PE CIMs, not seed decks. Pitch decks are usually sent unsolicited and without an NDA, so the risk may be lower. That makes it a good question for a Sense Check (PLAN H5).

## Theme 6: Form D is useful but incomplete (kept from earlier research)

| # | Quote | Speaker / role | Source |
|---|---|---|---|
| 6.1 | "We document that the majority of venture-capital backed financing rounds are not accompanied by a Form D filing." | Academic study (SSRN 4363027) | [TheCorporateCounsel.net](https://www.thecorporatecounsel.net/blog/2023/03/form-d-why-dont-issuers-file.html) |
| 6.2 | "When we see a PR announcement about a venture financing, it often happened months and sometimes even years (!) ago." | Danny Crichton, TechCrunch | [TechCrunch 2019](https://techcrunch.com/2019/03/28/how-to-delay-your-form-ds) |
| 6.3 | "Form D is an imperfect record—some startups never rely on Reg D exemptions and therefore don't file" | Factually.co. **Unverified.** | [factually.co](https://factually.co/fact-checks/business/verify-startup-funding-rounds-sec-edgar-form-d-ef7632) [excerpt] |
| 6.4 | "you get a legal entity name, not a domain or contact" | Funding Signals (vendor) | [fundingsignals.net](https://fundingsignals.net/guide-sec-form-d) |
| 6.5 | "When you accept a board seat ... this fact may be disclosed on the Form D ... many media outlets watch these filings" | Holloway *Guide to Angel Investing* | [Holloway](https://holloway.com/g/angel-investing/sections/disclosure-of-investment) [excerpt] |

---

## Gaps (insufficient data found)
- **No public first-person quote from a VC associate saying they do or don't pull Form D.** This is the most important question for Sense Checks.
- No first-person quotes from venture-debt or bank credit analysts about verifying startup claims.
- No sourced minutes-per-deck figure for *verification*, as opposed to reading.

## Top 3 for the pitch
1. **Claims are wrong, and only manual calls catch them:** Lemkin 1.2 ("they weren't actually customers").
2. **Verification is the job:** Calacanis 2.1 ("You can trust the founders, but you have to verify").
3. **No time to verify at screening:** 3 min 44 s per deck (3.3) and "thousands of pitch decks a year" (3.1).
