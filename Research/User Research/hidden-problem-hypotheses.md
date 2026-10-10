# Hidden-Problem Hypotheses (VentureSauce truth table)

These test H1–H5 from `docs/PLAN.md` against public evidence, and add new hypotheses (H6+). Confidence: **High** means several independent sources, **Med** means one strong source or vendor-only sources, **Low** means inference. "Insufficient data found" means exactly that.

---

## H1 (PLAN): Associates check LinkedIn but almost never pull Form D

**The question we most need answered: do associates ever pull Form D?**
- **Direct evidence: insufficient data found.** We found no first-person statement from a VC associate, for or against, about pulling Form D during deck screening.
- **Indirect, for H1:**
  - Form D tools are marketed almost entirely to **sales reps and recruiters**, not to diligence teams ([FlareSight](https://flaresight.org/blog/how-to-use-sec-form-d-for-sales-prospecting), [MarketPrior](https://marketprior.com/guides/find-companies-that-just-raised-funding)). That suggests VCs aren't a known buyer for Form D data.
  - EDGAR is painful to use: "a wall of results with no structure" ([FilingFlow](https://blog.filingflow.app/2026/03/28/beyond-edgar-how-to-source-deals-before-press-releases/)), and filings use legal entity names, not brands ([Funding Signals](https://fundingsignals.net/guide-sec-form-d)).
  - The investor diligence we found focuses on references and customer calls ("off-sheet references", David Sacks, [Fortune](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/)), not on filings.
- **Indirect, against H1:**
  - PitchBook and Crunchbase reportedly ingest Form D ([Apify listing](https://apify.com/nexgendata/startup-funding-tracker?fpr=data), vendor claim, **unverified**). Associates may see Form D data *through PitchBook* without ever opening EDGAR. The real gap may be that the deck is never **compared against** the filing, rather than that nobody can access it.
  - Researchers *can* verify rounds through Form D ([factually.co](https://factually.co/fact-checks/business/verify-startup-funding-rounds-sec-edgar-form-d-ef7632), unverified). The method is known, just not routine.
- **Big caveat:** "the majority of venture-capital backed financing rounds are not accompanied by a Form D filing" ([SSRN via TheCorporateCounsel.net](https://www.thecorporatecounsel.net/blog/2023/03/form-d-why-dont-issuers-file.html)). Many "raised" claims will come back **unverifiable**, not as a gap. The UI has to make "no filing" neutral, never suspicious.
- **Confidence:** Low to Med. The top thing to test.
- **Sense Check probe:** "The last time a founder told you how much they'd raised, how did you check it, if at all?" Then: "Have you ever looked up a company's SEC filing? When, and why?"

## H2 (PLAN): The real cost is 30+ minutes per deck of manual checks, which pushes verification to after the first partner meeting
- **For:** Decks get about **3 min 44 s** ([TechCrunch on DocSend](https://techcrunch.com/?p=1167693)), and attention is falling ("24% less time" in 2022, [aggregator](https://www.presentations.ai/blog/pitch-deck-statistics), unverified). Investors see "thousands of pitch decks a year" ([Kathryn O'Day](https://kathrynoday.substack.com/p/3-red-flags-vcs-look-for-in-your)). Seed diligence checklists put team and market checks at "days 4-7" ([causo.ai](https://hub.causo.ai/vc-due-diligence-checklist-seed-2026), unverified), well after first screen.
- **Against or unknown:** There is **no sourced figure for minutes spent verifying** per deck. The "30+ minutes" number is our assumption.
- **Confidence:** Med that verification comes late. The minutes figure is **unverified**.
- **Probe:** "Walk me through the last deck you screened. At what point did you first check anything the founder claimed?"

## H3 (PLAN): Founders count contractors and offshore staff as "team", so raw LinkedIn counts cause false alarms and testers distrust a tool that cries wolf
- **For:** LinkedIn "does not verify job titles or company sizes", and companies count "every contractor who ever touched a project" ([Lilach Bullock](https://www.lilachbullock.com/is-linkedin-reliable-source-business-research/), unverified). Lemkin flags "advisors, or part-timers" counted as team ([SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs)). Nate (contractors in the Philippines) and Builder.ai (engineers in India) show that headcount composition can be the actual story ([TechCrunch](https://techcrunch.com/2025/04/10/fintech-founder-charged-with-fraud-after-ai-shopping-app-found-to-be-powered-by-humans-in-the-philippines)).
- **The twist:** LinkedIn errs in **both** directions. Early-stage teams are undercounted (people in stealth, no profile yet), and agencies are overcounted. A single number can't be trusted either way.
- **What it means for the product:** Show ranges, a "possible gap" label, and a breakdown by location and role. Never write "lie".
- **Confidence:** Med.
- **Probe:** Show a row "Deck: 25 engineers · LinkedIn: 9 · gap". Ask: "What's your first reaction? What would you need to see before you believed it?"

## H4 (PLAN): Inflated customer logos (pilot or LOI shown as a customer) are the most common lie and the hardest to catch
- **For:** This is the strongest-supported hypothesis. Lemkin called the customers and found "they were all unpaid pilots with draft contracts" ([SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs)). "Most LOIs are just expensive lies founders tell themselves" ([Traction Lab](https://zerototraction.substack.com/p/loi-or-just-a-lie)). Sacks says customer references from your *own* list are the "number one part of diligence" ([Fortune](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/)). Theranos claimed a DoD deployment that never happened ([Fortune 2018](https://fortune.com/2018/03/14/theranos-elizabeth-holmes-fraud-sec)).
- **"Most common" is unverified.** We found no frequency data.
- **What it means for the product:** The customer-logo check (a stretch goal in PLAN) may be worth more than the Form D check. Consider promoting it to must-have at Gate 1 if testers confirm. Its output ("no public mention, ask for a reference") feeds directly into "questions to ask the founder".
- **Confidence:** High that it happens. Low on whether it's the *most* common.
- **Probe:** "Tell me about a time a customer on a slide turned out to be something less. How did you find out?"

## H5 (PLAN): Associates can't forward decks to outside tools because of fund policy, so data handling decides adoption
- **For:** In PE, uploading confidential material "can breach the NDA ... and contradict the data controls the firm attested to on its cyber insurance application" ([Indie Hackers](https://www.indiehackers.com/post/every-deal-team-has-a-chatgpt-tab-open-nobody-wants-to-talk-about-whats-in-it-41c07af252), vendor, unverified). VDR terms "increasingly prohibit uploading confidential material into AI tools" ([V7 Labs](https://www.v7labs.com/blog/chatgpt-data-privacy-pe-firms), vendor).
- **Against:** Seed decks usually arrive unsolicited and without an NDA. The same post admits that people paste anyway: "Policy without infrastructure does not change behavior under deadline pressure."
- **Confidence:** Med for PE and growth. **Low for seed**, so test it.
- **Probe:** "If you dropped a founder's deck into a browser tool, who at your firm would care, and what would they ask?"

---

## New hypotheses

### H6: Form D's director list is the sleeper check. It shows board members and investors the deck leaves out.
- **Evidence:** Form D lists directors, executive officers, and promoters ([Plain Signal](https://dev.to/plain_signal/how-to-find-startups-that-just-raised-money-with-python-sec-form-d-data-29db)). Accepting a board seat "may be disclosed on the Form D" ([Holloway](https://holloway.com/g/angel-investing/sections/disclosure-of-investment)). PLAN's Daytona example lists Matt Turck (FirstMark) as a related person.
- **Why it's hidden:** Associates know Form D shows *amounts*, but they may not know it names directors.
- **Confidence:** Med (mechanics confirmed, whether users care is untested).
- **Probe:** "If a filing showed a board member who isn't in the deck, what would that tell you?"

### H7: "No filing" or "no LinkedIn" is the most common result, so the tool is mostly "unverifiable". The value is in listing what's unverifiable plus the questions to ask, not in catching lies.
- **Evidence:** The majority of VC rounds don't file a Form D (SSRN, above). Stealth founders delay filing on purpose ([TechCrunch 2019](https://techcrunch.com/2019/03/28/how-to-delay-your-form-ds)). Early teams are thin on LinkedIn (H3).
- **What it means for the product:** Reframe the output from a "lie detector" to "**here's what you can't verify, and here's what to ask**". This matches PLAN's stretch goal of "questions to ask the founder", which should be promoted.
- **Confidence:** Med to High.
- **Probe:** "If half the rows said 'couldn't verify', would this still be useful? What would you do with that?"

### H8: The cost of a false claim isn't the bad deal. It's credibility with partners and LPs.
- **Evidence:** "There has to be conflict ... with the CEO" and diligence as a "thin fig leaf you can point to LPs" (Chamath, [Fortune](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/)). Lemkin says outright: "You move on once you spot Alternative Facts."
- **Confidence:** Low (inference).
- **Probe:** "What happens to the associate who brought in a deal where the numbers turned out wrong?"

### H9: Non-VC finance testers (credit and bank analysts, wealth advisors) verify the same claims for different reasons, such as KYC, lending, or client suitability.
- **Evidence:** Venture lenders "underwrite the investors as much as the business" ([Mercury](https://mercury.com/blog/venture-debt-101)). Verifying who the investors and directors are is exactly what Form D related persons provides. First-person quotes: **insufficient data found**.
- **Confidence:** Low. Test it if the Sense Check pool is not made up of VCs.

---

## Recommended lead for Gate 1 (pending tester confirmation)
**H7 + H4:** Most deck claims can't be checked in the 4 minutes a deck gets, and the most dangerous ones (customer logos) are exactly the ones nobody checks until after the partner meeting. Keep **H1** as the live question. If testers say "I've never pulled a Form D", that quote is the hidden problem.
