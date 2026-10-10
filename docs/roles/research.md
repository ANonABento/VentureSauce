# Research: users, receipts, demo story

**Your job:** two of the five judging criteria are yours alone (Hidden Problem, User Feedback), and you shape a third (Real Pain). The build follows what you find.

## Hour 0: book people before anything else

- [ ] Sign up at check.testwithsenseai.com with the event code (in the hacker pack) and **book finance tester slots for about hour 2–3 and hour 6–8**. Ask for investment roles: VC associates, angels, analysts.
- [ ] Ask all teammates to message 3 investor contacts each for a 10-minute call.
- [ ] Walk the venue: VCs, angels and sponsors. Ask "Got 5 minutes? I want to hear how you screen decks", not "Can we pitch you?"
- [ ] Create `demo/receipts.md` from the table at the bottom of this page.

## Hour 1–4: discovery interviews (goal: 8)

Use the script in PLAN.md and don't show the product until question 6. For each one:

- [ ] Write down **exact words**, not a summary. The best quote ends up on stage.
- [ ] Tag the quote with the hypothesis it supports or kills (H1–H5 in PLAN.md).
- [ ] Ask permission to quote them by role ("seed VC associate, $150M fund"), and by name if they're OK with it.

What we most need to learn:

1. Do they check Form D? (If almost nobody does, that's our hidden problem.)
2. How many minutes per deck do they spend verifying, and at what stage?
3. What would make them trust or distrust an automated flag? (This shapes confidence levels and wording.)
4. Which single check would they pay for?

## Hour 4: gate 1 (you run it, 15 min)

- [ ] Present: the top 3 quotes, which hypotheses held up or failed, and the one hidden problem we'll lead with.
- [ ] Recommend changes to the must-have list. You can reorder it.

## Hour 3–6: demo assets

- [ ] **Fictional deck** ("Acme AI" or a better name): 8–10 slides, exported as PDF to `demo/`. Plant gaps that line up with Data's `acme_ground_truth.json`:
  - Team slide says "25 engineers"; ground truth LinkedIn shows 9.
  - "Raised $10M seed"; ground truth Form D shows $15M sold (unannounced extension).
  - A board member on Form D who isn't in the deck.
  - A customer logo with no public mention (unverifiable).
- [ ] **Daytona deck:** a short deck using only Daytona's *real public claims* (site, press). Label it "Synthetic deck assembled from public info for demo purposes" on slide 1. It should come back mostly verified, so it's flattering to a sponsor.

## Hour 6–9: tester sessions on the real build (goal: 2–3)

- [ ] Hand them the laptop and say: "You just got this deck. Use this however you'd like." Then stay quiet.
- [ ] Note where they hesitate, what they click first, and what they say out loud. Ask: "Would you trust this row? Why or why not?"
- [ ] Within 15 minutes of each session, post a **change list** to the team: max 3 items, each one tied to a quote.
- [ ] Log every change made because of a tester. That's your before/after slide.

## Hour 9–12: pitch

- [ ] Write the 2-minute script (structure in PLAN.md) with real quotes filled in.
- [ ] Slides for the non-live parts only: problem quote, hidden problem, before/after. Everything else is the live product.
- [ ] Mention Bright Data by name as the engine, and Devin if Kevin used it.
- [ ] Time 3 rehearsals. Cut anything that pushes it past 2:00.

## Receipts log template (`demo/receipts.md`)

| Time | Who (role, fund type) | OK to quote? | Exact quote | Hypothesis | Changed our build? |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Done when

We have a quote for the pain, a quote for the hidden problem, and at least one "tester said X → we changed Y" with screenshots, and the pitch runs under 2:00.
