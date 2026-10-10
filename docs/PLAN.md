# VentureSauce — Hackathon Plan

_As of 2026-10-10 · Kevin Jiang_

## Update (hour ~2): the deal inbox pivot

**VentureSauce becomes a deal inbox.** Investors drop *anything* about a company as it arrives: deck (PDF, scanned PDF, slides), founder emails, screenshots, call notes. Each item is filed under its company. Every claim is checked three ways:

1. **Against public records** (Form D, LinkedIn, press), as before.
2. **Against your other sources** (new). For example, the deck says 25 people, the founder's email says 40 and your call notes say 12. Needs no public data, works for any company, and no competitor does it.
3. **Turned into a question** (new). Every gap, contradiction or unverifiable claim (ARR, growth…) becomes "Ask the founder: …".

At the end of the day or week: **a digest** across companies of what's new, what conflicts and what to ask. Optionally spoken via Fish Audio.

**Build stages (Kevin):** Stage A: company memory, universal input, contradictions, questions (~3h). Stage B: digest (~1.5h), only if Stage A is working at the hour 7 gate.
**Demo story:** drop the deck → drop the founder's email → drop your call notes → contradictions light up → "Generate digest".
**Research:** test the hypothesis "nobody reconciles decks, emails and call notes" in the next Sense Check.
**Extension:** the panel becomes a deal room (company list → company view: items timeline, checks, questions). Keep building the truth table; it's the core of the company view.

The rest of this plan still applies. Where it says "deck", read "any item".

## TL;DR (original)

We build **VentureSauce: drop a pitch deck into a Chrome side panel and get a claim-by-claim truth table with receipts in under 60 seconds.** Each claim the founder makes (headcount, money raised, customers, team) is checked against LinkedIn, SEC Form D and the press, and comes back marked match, gap or unverifiable, with a source link.

- **Theme:** Catch what humans miss (primary), Build trust (secondary: every verdict links to its source, so the analyst doesn't have to re-check).
- **Finance user:** Investment. Specifically seed-to-Series-A VC associates and angels doing first-pass screening.
- **What we cut from the original plan:** the paid anonymized signal feed becomes a stretch goal, reframed as aggregate benchmarks. Selling insights drawn from confidential decks is the first objection any VC judge will raise.
- **Biggest lever:** judges score Hidden Problem and User Feedback directly, so user research starts at hour 0 and runs all day. Whatever testers tell us decides which checks we build.

## How we score on each judging criterion

The original plan was strong on Real Pain and Works Live and weak on Hidden Problem and User Feedback. Those two need receipts we don't have yet.

| Criterion | Our play | Proof we show on stage | Owner |
| --- | --- | --- | --- |
| 01 Creativity | Check what the *founder told you*, not just company data (the gap that Harmonic, PitchBook and Crunchbase leave). Form D director list vs. announced board is a signal few people know about. | Truth table with an "Unannounced director" or "Stealth extension" flag | Kevin |
| 02 Real pain | Analysts screen 20+ decks a week and can't verify claims by hand | 2–3 tester quotes in their own words, with time spent per deck | Research |
| 03 Hidden problem | To be found in interviews. Candidate hypotheses are below | The one quote that changed what we built | Research |
| 04 User feedback | At least 2 build-test loops with real testers | Before/after slide: "Tester said X → we changed Y" | Research + all |
| 05 Works live | The real extension on a real deck, with a cached fallback | Live drag-and-drop on stage, no slides for the demo part | Extension + Data |

## User research plan

Goal: 8+ conversations by hour 4 and 3+ hands-on tests of the build by hour 10. Every quote is logged with the person's role and a timestamp.

**Where to find testers**

- Sense tester pool at check.testwithsenseai.com (event code in hacker pack). Book slots at hour 0, since they fill up.
- VCs, angels and judges at the venue. Tech Week means investors are in the room.
- Each of us messages 3 investor or associate contacts for a 10-minute call.

**Interview script (10 min, don't pitch first)**

1. Walk me through the last deck you screened. What did you do between opening it and deciding?
2. Which claims do you actually check? How, and how long does it take?
3. Tell me about a time a founder's claim turned out wrong. When did you find out, and what did it cost?
4. What do you *never* check because it isn't worth the time?
5. If a tool flagged a gap, what would you need to see before you trusted it?
6. (Only now) Show the mockup or build. What's missing? What would you never use?

**Hidden-problem hypotheses to test (not facts yet)**

- **H1:** Analysts check headcount on LinkedIn but almost never pull Form D, so gaps in money raised and stealth extensions get missed.
- **H2:** The real cost isn't one bad deal. It's the 30+ minutes per deck spent on manual checks that pushes verification to *after* the first partner meeting.
- **H3:** Founders count contractors and offshore staff as "team", so a raw LinkedIn count produces false alarms. Testers will distrust a tool that cries wolf.
- **H4:** Inflated customer logos (pilot or LOI shown as customer) are the most common lie and the hardest to catch.
- **H5:** Associates can't forward decks to outside tools because of fund policy, so data handling decides whether they adopt it.

**Receipts log (fill in live)**

| Time | Who (role, fund type) | Quote | Hypothesis | Changed our build? |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Product scope

One flow, done well: deck in, truth table out. Everything else is optional.

**Must-have (demo fails without it)**

- [ ] Side panel accepts a PDF by drag-and-drop or pasted text
- [ ] Pull the company name, domain and 4 claim types out of the deck: headcount, total raised / round size, named customers, key team and board
- [ ] Form D lookup on EDGAR: amount sold, date of first sale, directors and executives
- [ ] LinkedIn company headcount via Bright Data
- [ ] Press/search results via Bright Data SERP: announced round size, announcement date
- [ ] Truth table: claim · claimed value · observed value · verdict (match / gap / unverifiable) · confidence · source link
- [ ] Live status steps in the panel (Parsing → Checking SEC → Checking LinkedIn → Ready)
- [ ] Every result cached in MongoDB so the demo can replay without the network

**Stretch (only after must-haves pass a tester)**

- [ ] 20-second Fish Audio spoken brief of the top 3 gaps
- [ ] Customer-logo check: does the named customer mention the startup anywhere public?
- [ ] "Questions to ask the founder" generated from the gaps (testers may value this more than the flags)
- [ ] Aggregate benchmark card ("seed decks overstate headcount by a median of X×"), shown only when built from many decks

**Cut**

- Separate web dashboard (the side panel is the product)
- Gmail/LinkedIn page grabber and right-click menu
- Paid anonymized signal feed and Stripe paywall
- Predicting a company's trajectory

## Architecture

```
 Chrome side panel (MV3)                       FastAPI backend
 ┌──────────────────────┐  POST /analyze   ┌──────────────────────────────┐
 │ drop PDF / paste text│ ───────────────▶ │ 1. extract text (pdfplumber) │
 │ status steps         │                  │ 2. LLM → company + claims    │
 │ truth table          │ ◀─────────────── │ 3. fan out ground truth ─────┼──▶ SEC EDGAR (Form D)
 │ audio player (stretch)│ GET /jobs/{id}  │ 4. compare → verdicts        │──▶ Bright Data LinkedIn
 └──────────────────────┘  (poll 1s)       │ 5. (stretch) Fish Audio brief│──▶ Bright Data SERP
                                           └──────────────┬───────────────┘
                                                          ▼
                                                   MongoDB Atlas
                                       (decks, claims, raw sources, verdicts)
```

**Endpoints**

- `POST /analyze` (FormData with `file` = PDF, or `text` = pasted text) → `{job_id}`
- `GET /jobs/{job_id}` → the job object below, with `status` advancing as each step finishes
- `GET /jobs/{job_id}?replay=1` → served purely from cache (demo fallback)

**Job contract (Extension builds against this fixture from hour 1)**

```json
{
  "job_id": "abc123",
  "status": "parsing | checking_sec | checking_linkedin | checking_press | ready | error",
  "company": { "name": "Acme AI", "domain": "acme.ai", "cik": "0001234567" },
  "checks": [
    {
      "claim_type": "headcount | raised | round_size | customer | board",
      "claim_text": "25 AI engineers in SF",
      "claimed_value": 25,
      "observed_value": 9,
      "source": "linkedin | form_d | press",
      "source_url": "https://...",
      "verdict": "match | gap | unverifiable",
      "confidence": "high | medium | low",
      "note": "LinkedIn lists 9 employees; early-stage teams are often undercounted"
    }
  ],
  "brief_audio_url": null
}
```

**Data notes**

- EDGAR: free, no key. Send a descriptive `User-Agent` with a contact email; stay under 10 requests/sec. Use company search → CIK → Form D filings. Form D gives total amount sold, date of first sale, and related persons (directors/executives).
- Bright Data LinkedIn company data runs as an async job (can take minutes) → always pre-warm the cache for demo companies.
- Ask the LLM for structured JSON for extraction and verdicts so the table never breaks.

## Team split

Each person owns one piece end to end. The shared JSON contract above lets all four work in parallel from hour 1.

| Person | Owns | Delivers by hour 3 | Delivers by hour 8 | Final hours |
| --- | --- | --- | --- | --- |
| Kevin (lead, backend + AI) | FastAPI service, claim extraction with the LLM, cross-check and verdict logic, pulling the pieces together | `/analyze` returns fixture JSON; extraction works on 1 real deck | Real verdicts from real data for 3 decks | Demo driver, pitch, final merge |
| Data | EDGAR Form D client, Bright Data LinkedIn + SERP calls, MongoDB cache, demo ground truth | Form D lookup by company name returns amount, date and directors | All 3 sources cached for every demo company; cache-replay mode | Fallback data, verifies every number shown on stage |
| Extension | Manifest V3 side panel, drop zone, status steps, truth table, audio player | Panel renders the fixture JSON as a truth table | Wired to the live backend; tester-driven UI fixes | Polish, recording a backup video |
| Research | Interviews, receipts log, tester sessions, demo deck, pitch story | 8 interviews logged; top hidden problem picked | 2 tester sessions on the real build; change list handed to the team | Before/after slide, quotes, pitch rehearsal |

**Handoffs that block other people**

- Kevin → Extension: fixture JSON at hour 1 (the contract above).
- Research → everyone: at the hour 4 gate, which checks testers care about most. This may reorder the must-haves.
- Data → Kevin: a function `get_ground_truth(company, domain)` that returns all sources or a cached copy.
- Research → Data: the list of demo companies (real ones with a public Form D) by hour 3.

## 12-hour timeline

| Hour | Kevin | Data | Extension | Research |
| --- | --- | --- | --- | --- |
| 0–1 | Repo scaffold, fixture JSON, claim all credits | Claim Bright Data + Atlas, EDGAR hello-world | MV3 skeleton, side panel opens | Book Sense slots, start outreach |
| 1–3 | PDF → text → LLM claim extraction | Form D client (amount, date, directors) | Drop zone + truth table on the fixture | Interviews 1–5 |
| 3–4 | `/analyze` + `/jobs` with real extraction | Bright Data LinkedIn + SERP calls | Status steps, polling | Interviews 6–8, pick demo companies |
| **4** | **Gate 1 (15 min): what did users say? Re-rank must-haves. Pivot the checks if needed.** | | | |
| 4–7 | Verdict logic + confidence | Mongo cache, pre-warm demo companies | Wire to the live backend | Tester session 1 on the rough build |
| **7** | **Gate 2 (15 min): end to end on 1 real deck? If not, cut stretch goals entirely.** | | | |
| 7–9 | Apply tester changes, "questions to ask" (stretch) | Replay mode, verify every demo number | Tester-driven UI fixes, audio (stretch) | Tester session 2, write the before/after |
| 9–10 | Fish Audio brief (stretch) | Fallback data for wifi failure | Polish | Demo deck + pitch story |
| **10** | **Code freeze for features. Bug fixes only from here.** | | | |
| 10–12 | Rehearse demo ×3 | On-call for data issues | Record backup video | Run the pitch, timekeeper |

## Demo script (2 min)

Lead with a user's voice, not ours. The bracketed quotes get replaced with real receipts.

| Time | Beat | On screen |
| --- | --- | --- |
| 0:00–0:20 | Pain in the user's words: "[tester quote about time per deck or a claim that burned them]" | Photo or name card of the tester, quote |
| 0:20–0:35 | Hidden problem: "[what we found that nobody checks, e.g. Form D]" | One line of text |
| 0:35–1:15 | Live: drag the deck into the side panel. Status steps run. Truth table fills in. | The real extension, real deck |
| 1:15–1:35 | Click a gap's source link to show the receipt, e.g. the Form D page with the real amount and director names | EDGAR filing opens |
| 1:35–1:50 | "Testers told us X, so we changed Y" | Before/after screenshot |
| 1:50–2:00 | Optional 5-second Fish Audio brief, then close | Panel |

**Demo deck rule:** use a real company with a public Form D and press coverage. Our deck says it's a synthetic deck written for the demo, and we say so on stage. We never present a real company as having lied.

## Risks and fallbacks

| Risk | Likelihood | Fallback | Owner |
| --- | --- | --- | --- |
| Bright Data LinkedIn scrape is slow (runs as an async job and can take minutes) | High | Pre-warm the cache for demo companies; the live call runs in the background and the cached result shows first | Data |
| Demo-day wifi fails | Medium | Backend on localhost plus cache-replay mode; backup screen recording | Extension |
| No Form D for a company, or it was filed late | High | Verdict "unverifiable" with the reason shown. Pick demo companies that have one | Data |
| LinkedIn undercounts early-stage teams, which causes false alarms | High | Show confidence and a range; label gaps "possible", not "lie" | Kevin |
| LLM misreads claims from image-heavy PDFs | Medium | Paste-text input as a backup; test the demo deck early | Kevin |
| Interviews don't happen in time | Medium | Book Sense slots at hour 0; everyone does one call before hour 3 | Research |
| Judges raise privacy or confidentiality concerns | Medium | Decks never leave our backend, nothing is published, cached data is deleted on request | Kevin |

## Demo companies and prize strategy

Pulled from EDGAR on 2026-10-10. Data re-verifies these before anything goes on a slide.

| Company | Role in demo | Latest Form D | Notes |
| --- | --- | --- | --- |
| **Daytona** (Daytona Platforms Inc., CIK 1977563) | Primary | Filed 2026-08-17: $60M offering, **$48.27M sold, $11.73M remaining**, first sale 2026-07-31, 6 investors. Earlier: filed 2026-02-05, $23.80M offering, $23.26M sold | Related persons: Ivan Burazin, Vedran Jukic, Kevin Zhang, Matt Turck. "Round still open" is a neutral, interesting finding. **Not yet checked against Daytona's press numbers** |
| **Clerk** (Clerk, Inc., CIK 1959758) | Backup | Filed 2025-07-03: $50M offering, ~$50M sold, first sale 2025-06-17, 8 investors | Related persons: Braden Sidoti, Colin Sidoti, Shvetank Jain, Karan Mehandru |
| Fictional company (e.g. "Acme AI") | The dramatic gaps | Pre-loaded ground truth in Mongo, clearly labeled fictional | Shows the full set of red flags without accusing a real company |

No usable Form D was found for Cognition, Bright Data, Base44 or Fish Audio under those names.

**Rules for using sponsors:** we only check a sponsor's *real public claims* (website, press), so their results come back mostly verified. We never put invented claims under a sponsor's name.

**Prize plays**

- **Bright Data (grand prize):** Bright Data is visibly the engine. Every LinkedIn or press row is labeled "via Bright Data", and the pitch says it out loud.
- **Cognition:** use Devin for real work (EDGAR parser, tests) and mention it in the pitch.
- **Base44 track:** skip unless someone has spare time for a landing page.

## Sponsor credits

Claim everything we use in the first 30 minutes so nobody gets stuck waiting for billing mid-build. Codes are kept out of this public repo; see the hacker pack.

| Sponsor | Credit | Code / link | Use | Claimed by |
| --- | --- | --- | --- | --- |
| Bright Data | $300 per hacker | Hacker pack (sign-up or Billing) | LinkedIn company headcount, SERP for press | Data (everyone redeems their own) |
| MongoDB Atlas | $100 | Hacker pack (Billing → Apply Code) | Cache for decks, claims and sources | Data |
| Sense | Tester access | check.testwithsenseai.com, event code in hacker pack | Recruit finance testers | Research |
| Fish Audio | $5 API + free S2.1 Pro | fish.audio/claim/talk-to-users-hackathon | Spoken brief (stretch) | Extension |
| Cognition | 1 month Devin Max | trydevin.ai/talk-to-users-hackathon | Hand off boilerplate tasks (EDGAR parser, tests) | Kevin |
| Daytona | $100 | Hacker pack (Billing → Wallet) | Optional hosted backend if localhost isn't enough | Kevin |
| Base44 | Builder plan per team | 10:00 AM talk | Skip unless we need a landing page | — |
| Stripe | Atlas + up to $3,000 | stripe.com/startup-benefits/tech-week-2026 | Not in MVP. Claim the perks anyway | Kevin |

## Open decisions for the team

- [x] LLM: Nebius `openai/gpt-oss-120b` (2.7s, 8/8 on our extraction test), fallback `deepseek-ai/DeepSeek-V4.1-Flash`, Claude as last resort.
- [ ] Is the hackathon really 12 hours, and when is the submission deadline? Adjust the timeline gates.
- [x] Demo companies: Daytona (primary), Clerk (backup), plus one fictional company. See Demo companies above.
- Each person's brief is in [`docs/roles/`](roles/).
- [ ] Keep Fish Audio at all? Only if there's a sponsor prize for it.
- [ ] Backend on localhost or Daytona for the live demo?
- [ ] Final product name: VentureSauce, or something about "receipts"/"truth table"?
