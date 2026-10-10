# Sense Check Question Bank: VentureSauce Truth Table (Blocks 2 and 3)

The 10-minute discovery interview script is in `docs/PLAN.md` under "Interview script", and it is not duplicated here. This file holds the ready-to-paste **Sense Check setups**. Testers hear the **product description word for word**, so it is written as a description, not as instructions. Testers never see the team name, so don't say "VentureSauce" in the read-aloud text.

Hypothesis tags (H1–H9) refer to `hidden-problem-hypotheses.md`.

---

## Block 2 (3–4 PM): show what you built (20% research / 80% product)

**Screenshots (1–3):** (1) the side panel with a deck dropped in and status steps running; (2) the full truth table for the fictional "Acme AI" deck showing match, gap, and unverifiable rows; (3) one gap row expanded, with its Form D source link. Use the **fictional** deck only. Never show a real company as a "gap", and blur any API keys or tokens.

### 2A. VC / angel variant (default: Investment, markets & trading)
- **One-liner:** Drop in a pitch deck and see which of the founder's claims match public records, with a link to each source.
- **Product description (verbatim):**
  "This is a browser side panel for investors who screen startup pitch decks. You drop a deck into it, and within about a minute it lists the factual claims the founder makes: team size, how much money they've raised, who sits on the board, and which customers they name. It then checks each claim against public sources: LinkedIn for headcount, the company's SEC Form D filing for money raised and directors, and news coverage for customers and announced rounds. Each claim is marked as a match, a gap, or unverifiable, with a confidence level and a link to the source it was checked against."
- **Who it's for:** Venture associates, analysts and angels doing first-pass screening of seed to Series A decks.
- **Theme:** Catch what humans miss.
- **Open questions:**
  1. Looking at this table, which row would you act on first, and what would you do? *(H4, H6)*
  2. Which row would you not trust? What would it take for you to trust it? *(H3)*
  3. What would stop you from using this on the next deck you get?
  4. Have you ever looked up a company's SEC Form D? Tell me about the last time, or why you never have. *(H1)*
  5. Half of these rows say "unverifiable". Is that useful, or noise? What would you do with it? *(H7)*
  6. Who at your firm would need to approve putting a founder's deck into a tool like this? *(H5)*
  7. What's missing from this table that you check by hand today?

### 2B. Banking, lending & credit variant
- **Product description (verbatim):**
  "This is a browser side panel that checks what a startup says about itself against public records. You drop in a company's pitch deck or investor presentation, and it lists the company's claims about team size, money raised, investors and directors, and named customers. Each claim is compared against the company's SEC Form D filing, LinkedIn and news coverage, and marked as a match, a gap, or unverifiable, with a link to the source."
- **Who it's for:** Venture-debt underwriters, bank credit analysts and KYC teams evaluating venture-backed startups.
- **Theme:** Build trust.
- **Open questions:**
  1. When a startup tells you who funded them and how much, how do you confirm it today? *(H9)*
  2. Which of these rows would matter to a credit or KYC decision, and which wouldn't?
  3. What would stop your team from relying on this?
  4. If a director in the SEC filing wasn't in the company's materials, what would you do? *(H6)*
  5. What would you need documented for an audit or credit file?

### 2C. Wealth advisor variant
- **Product description (verbatim):**
  "This is a browser side panel that checks a private company's claims against public records. When someone shares a startup's pitch deck, it lists what the company claims about its team, money raised, investors and customers, and compares each claim with the company's SEC filing, LinkedIn and news coverage. Each claim comes back as a match, a gap, or unverifiable, with a link to the source."
- **Who it's for:** Advisors whose clients are offered stakes in private startups or deal syndicates.
- **Theme:** Catch what humans miss.
- **Open questions:**
  1. Tell me about the last time a client asked you about a private deal. What did you check?
  2. Which of these rows would you show a client, and which would you leave out?
  3. What would stop you from using this?
  4. What wording would make a client panic unnecessarily? *(H3)*

### 2D. Analyst / FP&A / corp-dev / accounting variant
- **Product description (verbatim):**
  "This is a browser side panel that reads a private company's pitch deck or presentation and checks its factual claims (headcount, funding raised, directors, and named customers) against LinkedIn, the company's SEC Form D filing, and news coverage. Each claim is marked as a match, a gap, or unverifiable, with a confidence level and a link to the source."
- **Who it's for:** Analysts evaluating private companies as acquisition targets, competitors or clients.
- **Theme:** Build trust.
- **Open questions:**
  1. When you get numbers from a private company, which ones do you check, and how long does it take?
  2. Tell me about a time a private company's number turned out wrong. How did you find out?
  3. What would stop you from using this?
  4. Which row would you double-check yourself before putting it in a memo or model?

---

## Block 3 (6–7 PM): your own question (20% research / 80% product)

Pick one based on what Blocks 1–2 showed. Each version reflects a build change, so the results also give us a "tester said X, we changed Y" slide.

### 3A. "Questions to ask the founder" (tests H7 and the reframe away from lie detection)
- **Product description (verbatim):**
  "This is a browser side panel for investors who screen startup pitch decks. It checks the founder's claims about team size, money raised, board members and customers against LinkedIn, SEC filings and news coverage. For every claim it can't confirm, it writes a specific question to ask the founder in the first meeting, with the reason and the source it checked."
- **Who it's for:** Venture associates and angels before a first founder meeting.
- **Theme:** Catch what humans miss.
- **Open questions:**
  1. Which of these questions would you actually ask? Which would you never ask?
  2. How is this different from what you'd write yourself after reading the deck?
  3. What would stop you from bringing this into a founder meeting?
  4. Is a question more useful to you than a red flag? Why?

### 3B. Customer-logo check (tests H4)
- **Product description (verbatim):**
  "This is a browser side panel that checks the customer logos and names in a startup's pitch deck. For each named customer it searches news, press releases, case studies and the customer's own website for any public mention of the startup, and marks the customer as publicly confirmed, mentioned only by the startup, or not found, with links."
- **Who it's for:** Investors screening seed to Series A decks.
- **Theme:** Catch what humans miss.
- **Open questions:**
  1. Tell me about a time a customer on a slide turned out to be a pilot, a trial or a letter of intent.
  2. If a logo came back "not found", what would you do next?
  3. What would stop you from trusting this check?

### 3C. Trust and data handling (tests H5 and H3)
- **Product description (verbatim):**
  "This is a browser side panel that checks a startup pitch deck's claims against public records. The deck is processed on a private server, is never shared or used to train models, and is deleted on request. Every result shows the exact public source it was compared against, a confidence level, and a note on why it may be wrong, such as early teams being undercounted on LinkedIn."
- **Who it's for:** Venture funds and the people who approve their tools.
- **Theme:** Build trust.
- **Open questions:**
  1. What would your firm need to know before anyone used this on a real deck?
  2. Which row would you trust without clicking the source? Which would you always click?
  3. What would stop you from using this?

---

## Launch checklist
- [ ] The description is written as a description ("This is..."), never as instructions.
- [ ] There is no team name in the read-aloud text.
- [ ] The screenshots use the fictional deck only, with no keys and no real people labeled "gap".
- [ ] Every question is open, and at least two ask for a story about a real past event.
- [ ] H1 (Form D) is asked in every block until we have 3 or more answers.
- [ ] Log quotes in `demo/receipts.md` (format in `docs/roles/research.md`) and in `Research/Sense Check Log/`.
