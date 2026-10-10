# SignalEngine AI — Original Concept (pre-review)

> Kept for reference. The current plan is [PLAN.md](PLAN.md). Changes since this draft: the anonymized paid signal feed was cut to a stretch goal (reframed as aggregate benchmarks), the separate dashboard, page grabber and Stripe paywall were cut, and user research now runs from hour 0.

## 1. Executive Summary & Core Concept

**SignalEngine** is a Chrome Extension and web intelligence dashboard built for VC investors and angels.

* **The Problem:** Investors spend hours processing confidential decks, emails, and notes. Critical discrepancies between pitch claims and web/SEC reality are missed, and passive deal insights remain locked in private inboxes.
* **The Solution:** A side-panel extension where investors drag and drop decks/emails during daily workflow. The engine extracts claims, runs background cross-checks against live web data and SEC filings via Bright Data, and delivers two key outputs:
  1. **Private Diligence Brief:** Real-time discrepancy detection, red flags, and predictive trajectory.
  2. **Anonymized Signal Feed:** Auto-sanitized, NDA-compliant market predictions that top-tier investors can publish or monetize for smaller funds/angels.

## 2. System Architecture & Data Flow

```
[User Drop: PDF / Email / Page]
           │
           ▼
┌─────────────────────────┐
│ Chrome Side-Panel UI    │ ── (Captures file/text & sends payload)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ FastAPI Backend Engine  │
├─────────────────────────┤
│ 1. Claim Extractor      │ ── (Parses company, claims, team, funding)
│ 2. Scraper Trigger      │ ── (Fires Bright Data APIs & SEC EDGAR)
│ 3. Cross-Check Engine   │ ── (Compares claims vs. live web ground truth)
│ 4. NDA Sanitizer        │ ── (Strips PII & confidential specs)
└────────────┬────────────┘
             │
             ├───> MongoDB Atlas (Stores signals & company records)
             │
             ▼
┌─────────────────────────┐
│ User Output Dashboard   │
├─────────────────────────┤
│ • Private Radar Deck    │
│ • Monetizable Feed      │
│ • Fish Audio Briefing   │
└─────────────────────────┘
```

## 3. Detailed Component Specifications

### Component A: Chrome Extension (Manifest V3)

* **UI Location:** Chrome SidePanel API (`chrome.sidePanel`).
* **Input Modes:**
  * Drag-and-drop file uploader (PDF pitch decks, founder memos).
  * Highlight-and-right-click context menu ("Send to SignalEngine").
  * Active browser page grabber (LinkedIn profiles, founder emails in Gmail).
* **UI Features:**
  * Status indicator: `Parsing claims...` → `Running Bright Data Web Check...` → `Signal Ready`.
  * Quick view cards displaying verified metrics and discrepancy alerts.

### Component B: Backend Extraction & Cross-Reference Engine

* **Technology:** Python (FastAPI) + MongoDB Atlas.
* **Pipeline Step 1: Document Parsing & Entity Extraction**
  * Input: PDF binary or raw email text.
  * Extracted Fields: Company Name, Domain, Team Headcount Claim, Funding Amount Claim, Customer Logos/Claims, Product Metrics.
* **Pipeline Step 2: Live Ground-Truth Web Retrieval**
  * **Bright Data SERP API:** Query company domain, press releases, news articles.
  * **Bright Data Web Scraper / Unlocker:** Scrape target LinkedIn page for employee headcount trajectory and open roles.
  * **SEC EDGAR API:** Query Form D / Form C filings by company name / CIK number.
* **Pipeline Step 3: Delta Scoring & Predictive Intelligence**
  * Compute delta score:
    * `Headcount Growth Match` = (Scraped LinkedIn Headcount) vs. (Claimed Team Size)
    * `Funding Discrepancy` = (SEC Form D Amount Sold) vs. (Press/Deck Amount)
  * Categorize Gaps: *Ahead of Press*, *Stealth Bridge Round*, *Unannounced Director*, *Hiring Freeze Alert*.

### Component C: NDA Sanitization & Monetization Module

* **Public Feed Transformer:** Converts private deal insights into NDA-compliant public signals.
  * *Raw Input:* "Startup Acme AI claims $3M ARR with 10 headcount, but Form D shows $1.2M sold and only 3 employees."
  * *Sanitized Output:* "Market Intelligence Signal: Early-stage AI Infrastructure segment showing a 40% discrepancy between deck headcount targets and active hiring velocity across Q3."
* **Monetization Layer:** Generates a shareable, paywalled link (Stripe integration mock) allowing tier-1 VCs to sell access to their anonymized signal feed.
* **Audio Intelligence Briefing:** Uses **Fish Audio API** to generate a 30-second audio snippet summarizing the daily signal report for subscribers on the go.

## 4. API & Integration Setup

Promo codes are in the hacker pack (kept out of this public repo).

| Service | Role in Project |
| --- | --- |
| **Bright Data** | Scrape LinkedIn company pages, G2, live web news, and SERP data. |
| **MongoDB Atlas** | Cloud database to cache scraped results, storing private decks & public signals. |
| **Fish Audio** | Generate dynamic voice summaries of daily investor signal reports. |
| **Stripe** | Mock paywall infrastructure for monetizing investor signal feeds. |

## 5. MVP Build Roadmap (12-Hour Hackathon Timeline)

### Hours 1–3: Core Environment Setup & Schema

1. Setup FastAPI backend with endpoints `/upload`, `/parse`, and `/verify`.
2. Connect MongoDB Atlas database.
3. Initialize Manifest V3 Chrome Extension with a basic HTML drag-and-drop side panel.

### Hours 4–7: Data Ingestion & Scraper Integration

1. Implement PDF text extraction using `pypdf` or `pdfplumber`.
2. Configure **Bright Data SERP/Web Unlocker API** calls to query LinkedIn headcount and SEC EDGAR Form D records.
3. Build the cross-referencing prompt logic to evaluate discrepancies between extracted claims and Bright Data output.

### Hours 8–10: Monetization, Audio, and UI Polish

1. Implement the LLM NDA-sanitization routine to produce public signal cards.
2. Integrate **Fish Audio API** to auto-generate daily 30-second audio debriefs.
3. Style Chrome SidePanel and web dashboard using Tailwind CSS for a sleek tier-1 VC feel.

### Hours 11–12: Pitch Demo Setup & "Receipts"

1. Prepare sample startup deck and email thread containing deliberate discrepancies (e.g., $35M raised vs. $20M announced, team of 20 vs. 6 on LinkedIn).
2. Record/test live 2-minute demo flow.

## 6. Live Pitch Demo Script (2 Minutes)

* **0:00 - 0:25 (The Problem):** "Investors review dozens of decks and emails weekly. They miss hidden gaps between deck claims and real-world data, while valuable market context sits locked in private inboxes."
* **0:25 - 0:50 (The Drag & Drop):** Open browser, pull up Chrome SidePanel, and drag in a pitch deck + founder email.
* **0:50 - 1:20 (The Instant Cross-Check):** "Watch SignalEngine work. It extracts claims and instantly uses Bright Data to scrape SEC EDGAR and LinkedIn in real time." Show the Discrepancy Table:
  * *Deck Claim:* "25 AI Engineers in SF" → *Bright Data Live:* "9 LinkedIn Profiles total."
  * *Form D Filed:* "$15M Sold" → *Press:* "$10M Announced" (Unannounced $5M extension detected).
* **1:20 - 1:45 (The Monetizable Feed):** Click **"Publish Anonymized Market Signal"**. Show how the AI strips NDA data and creates a paid signal brief that lower-tier angels can subscribe to.
* **1:45 - 2:00 (The Closing Receipt):** Play a 5-second snippet of the **Fish Audio** daily voice briefing and highlight tester feedback from a VC user.
