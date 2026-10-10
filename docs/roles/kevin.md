# Kevin: Lead, backend + AI

**Your job:** turn a deck into trustworthy verdicts, keep the other three unblocked, and drive the demo.

## Hour 0–1: unblock everyone

- [ ] Claim credits: Cognition (Devin), Daytona, Stripe perks. Make sure everyone has redeemed their Bright Data code.
- [ ] Scaffold `backend/` (FastAPI, uvicorn, pdfplumber, anthropic, motor/pymongo, python-dotenv), plus `.gitignore` with `.env`.
- [ ] Write `backend/fixtures/job_daytona.json` matching the job contract in PLAN.md: 5 to 6 checks covering every verdict type (match, gap, unverifiable) and every source (form_d, linkedin, press). **Push it. Extension is blocked on this.**
- [ ] `GET /jobs/{id}` returns the fixture, and `POST /analyze` returns `{job_id}`. Enable CORS for `chrome-extension://*` and `http://localhost:*`.

## Hour 1–4: extraction

- [ ] `extract.py`: PDF → text with pdfplumber (one string per page, keep the page numbers for citations).
- [ ] LLM call with **structured output** (a tool/JSON schema) → `{company: {name, domain}, claims: [{claim_type, claim_text, value, unit, page}]}`.
  - Claim types: `headcount`, `raised`, `round_size`, `customer`, `board`.
  - Normalize money to USD integers and headcount to integers. When something is vague ("growing team"), skip it rather than guess.
- [ ] Test on 3 decks early: Research's fictional deck, a text-heavy deck and an image-heavy one. Use paste-text input as the fallback for image-only slides.
- [ ] Jobs run as a background task. `status` advances `parsing → checking_sec → checking_linkedin → checking_press → ready`, and `GET /jobs/{id}` returns partial checks as they land.

## Hour 4–7: verdicts

- [ ] `verdicts.py` takes the claims plus `get_ground_truth(company, domain)` (from Data) and returns the checks.
- [ ] **Compute the verdicts in code, not with the LLM.** Deterministic rules are what make the "Build trust" theme hold up:
  - headcount: observed/claimed ≥ 0.7 → match; < 0.7 → gap; LinkedIn missing → unverifiable. Confidence drops to `low` when the company is under 2 years old or under 20 people (LinkedIn undercounts).
  - raised / round_size: within 10% of Form D `totalAmountSold` → match. Form D > press → gap ("unannounced extension?"). Form D still open (`totalRemaining > 0`) → note "round still open".
  - board: a person in Form D related persons who isn't in the deck or press → gap ("unannounced director?").
  - customer: unverifiable unless the SERP finds a public mention (stretch).
- [ ] The LLM writes only the one-line `note` per check, given the numbers. It never chooses the verdict.
- [ ] Every check has a `source_url`. No receipt, no row.

## Hour 7–10: tester changes + stretch

- [ ] Apply the change list from Research's tester sessions first, before any stretch work.
- [ ] Stretch: "Questions to ask the founder" (LLM, from the gaps). Fish Audio brief, if Extension hasn't picked it up.
- [ ] Use Devin for anything boilerplate (tests, parsers) and keep a note of what it did for the Cognition prize.

## Hour 10–12: demo

- [ ] Code freeze at hour 10. Bug fixes only after that.
- [ ] Rehearse the 2-minute script 3 times with Research timing you. Know the exact click path.
- [ ] Keep `?replay=1` ready if the network dies.

## Done when

A deck dropped into the panel produces a truth table where every row has a verdict, a confidence, a note and a working source link, in under 60 seconds with a warm cache.
