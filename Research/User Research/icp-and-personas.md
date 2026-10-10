# ICP and Personas (VentureSauce truth table)

**Product:** a Chrome side panel. Drop in a pitch deck and get a claim-by-claim truth table (headcount vs. LinkedIn, money raised and board vs. SEC Form D, customers vs. press), with each claim marked match, gap, or unverifiable, plus a source link. **Theme:** catch what humans miss (primary), build trust (secondary). See `docs/PLAN.md`.

Personas are composites built from sourced evidence, not real people. "Unverified" means a single source. **Insufficient data found** is stated wherever it applies.

## Primary ICP: first-pass deck screeners at seed to Series A

| Attribute | Definition | Evidence |
|---|---|---|
| Who | VC analysts and associates, platform and diligence staff, solo GPs and emerging managers, angels and syndicate leads | PLAN ICP. Associates "are the ones tasked with selecting which start-ups get to pitch" ([andybudd.com](https://andybudd.com/archives/2022/08/crafting-the-perfect-pitch-deck-from-a-vcs-point-of-view), excerpt, unverified) |
| Deck volume | **5–15 decks a day** for analysts (VC Beast, unverified). **About 3,000 a year** for a typical analyst (HackerNoon, unverified). "thousands of pitch decks a year" (investor Kathryn O'Day) | [VC Beast](https://vcbeast.com/vc-analyst-day-in-the-life) [excerpt], [HackerNoon mirror](https://thenote.app/post/en/how-i-built-an-ai-vc-associate-to-screen-3-000-pitch-decks-6hrdvqqmhl) [excerpt], [The O'Daily](https://kathrynoday.substack.com/p/3-red-flags-vcs-look-for-in-your) |
| Time per deck | **3 min 44 s** on average (DocSend). About 2 min 13 s for decks that fail to raise (aggregator, unverified) | [TechCrunch](https://techcrunch.com/?p=1167693), [presentations.ai](https://www.presentations.ai/blog/pitch-deck-statistics) |
| What they verify today | Founder backgrounds against LinkedIn, references, customer calls ("off-sheet references"), and metrics. Diligence takes days, after the first screen | [Fortune (Sacks, Calacanis)](https://fortune.com/2023/07/02/venture-capitalists-on-irl-social-app-startup-failture-fake-users-softbank-funding/), [SaaStr (Lemkin calls customers)](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs), [causo.ai checklist](https://hub.causo.ai/vc-due-diligence-checklist-seed-2026) (unverified) |
| Tools today | PitchBook, Crunchbase, Harmonic, LinkedIn, Attio or Affinity CRM, DocSend, Notion or Airtable, and ChatGPT (often unsanctioned) | [r/venturecapital, emerging manager tech stack](https://www.reddit.com/r/venturecapital/comments/1n7k8oj/emerging_manager_tech_stack/) [excerpt], [r/venturecapital, 2026](https://www.reddit.com/r/venturecapital/comments/1vbre35/pitchbook_vs_cb_insights_vs_harmonics/) [excerpt], [Indie Hackers](https://www.indiehackers.com/post/every-deal-team-has-a-chatgpt-tab-open-nobody-wants-to-talk-about-whats-in-it-41c07af252) |
| Do they pull Form D? | **Insufficient data found.** This is the top Sense Check question (H1) | — |
| Budget | Small funds balk at PitchBook ($12K–$70K/year, aggregator, unverified). Individual associates likely have no tool budget of their own, so the buyer is the fund | [costbench](https://www.costbench.com/compare/preqin-vs-pitchbook/) |

## Secondary ICPs, mapped to the six hackathon tester categories

| Tester category | Who would use a truth table | Which claims they'd check, and why | Evidence |
|---|---|---|---|
| **Investment, markets & trading** | VC associates (primary), angels, secondaries analysts, family-office direct investors | Raise size, board, and customers before taking a meeting | Primary ICP above |
| **Banking, lending & compliance** | Venture-debt underwriters, bank credit analysts at startup banks, KYC/AML analysts onboarding startups | Lenders "underwrite the investors as much as the business", so they need to confirm who funded the company and how much (Form D related persons and amount sold). KYC teams confirm directors and officers | [Mercury](https://mercury.com/blog/venture-debt-101). First-person quotes: **insufficient data found** |
| **Wealth & financial advisors** | Advisors vetting private deals that clients are offered (angel rounds, SPVs), and advisors to founders | Is the round real, and are the named investors and directors on file? This is about client suitability and fraud protection | Inference. Frank, Theranos, and Nate show losses at retail and institutional scale ([NPR](https://www.npr.org/2025/03/29/nx-s1-5344434/charlie-javice-convicted-defrauding-jpmorgan), [TechCrunch](https://techcrunch.com/2025/04/10/fintech-founder-charged-with-fraud-after-ai-shopping-app-found-to-be-powered-by-humans-in-the-philippines)). **Insufficient first-person data** |
| **Financial analysts & FP&A** | Corp-dev and M&A analysts screening acquisition targets, competitive intelligence | Headcount and customer claims from a target's deck. JPMorgan's diligence on Frank failed exactly here | [Fortune](https://fortune.com/2025/03/28/charlie-javice-guilty-jp-morgan-fraud) |
| **Accountants / CPAs** | Auditors and fractional CFOs onboarding startup clients, and 409A valuation providers | Confirm the raise amounts and dates a client states (Form D date of first sale and amount sold) | Inference (Low) |
| **Finance ops & bookkeeping** | Less natural fit | Possibly vendor and customer due diligence on startups | Inference (Low) |

---

## Personas

### P1. "Alex", associate at a $150M seed/Series A fund (primary)
- **Job:** Screens inbound and referral decks, writes first-pass notes, and decides what reaches Monday's partner meeting.
- **Volume:** Dozens of decks a week (5–15 a day for analysts, unverified), with about 4 minutes of reading per deck.
- **Verifies today:** Founder LinkedIn profiles, a quick Crunchbase or PitchBook lookup, sometimes Harmonic. Customer calls happen only after a partner is interested (H2).
- **Never checks at screening (hypothesis):** Form D, whether board members match the deck, and whether customer logos are real.
- **What "getting it wrong" costs:** Credibility with partners if a deal they championed has an "alternative fact" (H8). Lemkin: "You move on once you spot Alternative Facts" ([SaaStr](https://www.saastr.com/can-i-use-alternative-facts-in-a-pitch-deck-to-vcs)).
- **Adoption blocker:** Fund policy on uploading decks (H5), and false alarms (H3).

### P2. "Maya", solo GP of a $25M pre-seed fund (primary)
- **Job:** Does everything herself: sourcing, screening, diligence, and LP reporting.
- **Tools:** Attio, LinkedIn, no PitchBook (too expensive).
- **Pain:** No analyst, so every check is her time. A truth table replaces work she would otherwise skip.
- **Pull:** "Questions to ask the founder", generated from the gaps (H7).

### P3. "Priya", angel and syndicate lead (primary)
- **Job:** Runs a syndicate with about 300 LPs. Her LPs trust her memo.
- **Pain:** She writes the memo fast in competitive rounds and has no time for references. A wrong number in her memo damages trust with her LPs.
- **Pull:** A shareable "receipts" view with source links for her LP memo (build trust).

### P4. "Jordan", platform and diligence lead at a multi-stage fund (primary-adjacent)
- **Job:** Runs the diligence checklists and the data stack, and sets the policy on AI tools.
- **What they care about:** Data handling, audit trail, and whether verdicts are reproducible. This person is the gatekeeper for H5.
- **Pull:** "Decks never leave our backend, and every verdict links to a public source."

### P5. "Marcus", venture-debt underwriter (secondary: banking and lending)
- **Job:** Underwrites $2M–$20M loans to VC-backed companies.
- **Checks:** Who led the last round and how much was actually sold. Form D amount sold vs. offered and related persons are directly relevant ([Mercury](https://mercury.com/blog/venture-debt-101)).
- **Evidence gap:** **Insufficient first-person data.** Use Sense Check variant B.

### P6. "Elena", wealth advisor vetting a client's private deal (secondary: wealth)
- **Job:** A client was offered a stake in a "hot" startup round or SPV. She has to say whether it's real.
- **Checks:** Does the round exist on file? Are the named directors and investors real? Is the team real?
- **Pull:** Plain-English verdicts she can show the client. **Insufficient first-person data.**
