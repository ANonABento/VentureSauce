# Test items

Drop these in order (tester app at `/`, or the panel at `localhost:3000/panel`). Also downloadable from `<backend>/samples/`.

| File | Kind | What it should show |
| --- | --- | --- |
| `00_acme_deck_FICTIONAL.pdf` | Deck (13 slides) | Creates **Acme AI**. Form D, LinkedIn and press checks (fictional ground truth). Also unverifiable extras (market size, the $25M Series A ask) that become founder questions |
| `01_acme_founder_email.eml` | Email | Filed under Acme. **Your sources disagree**: ARR $3.1M vs $2.4M, headcount 25 vs 18 |
| `02_acme_call_notes.txt` | Call notes | Raised $12M vs $15M joins the disagreements; Alex Director flagged |
| `03_unnamed_quick_note.txt` | Note | No company named: filed under the most recent (Acme). Headcount 30 joins the spread |
| `04_northwind_intro_email.eml` | Email | New company **Northwind Robotics**: everything "Couldn't verify" (no records) |
| `05_acme_dashboard_screenshot.png` | Screenshot | Read by the vision model. MoM growth 20% vs 8% |
| `06_acme_board_update.pptx` | Slides (7, native chart, speaker notes) | Headcount 22; ARR $2.6M is only in the speaker notes. Built by `src/make_board_update.py` |
| `07_northwind_deck_FICTIONAL.pdf` | Deck (8 slides) | Northwind's deck says an **8-person team**; Priya's email says 7. Same ARR, customers and rounds as the email |
| `08_acme_cap_table_scan_FICTIONAL.pdf` | Scanned PDF (image only) | Read by the vision model. **$15.0M total raised** (incl. an August SAFE) vs the deck's $12M, matching the call notes and the Form D |
| `10_daytona_public_claims.txt` | Note (real) | Daytona's reported $24M Series A, quoted from press. Live Form D: matches the Feb 2026 filing ($23.26M sold), with the newer Aug 2026 offering noted as context |
| `11_clerk_public_claims.txt` | Note (real) | Clerk's $50M Series C, from Clerk's own blog |
| `12_legora_public_claims.txt` | Note (real) | Legora's $550M Series D and "40 to 400 team members", from Legora's own release. Live: matches the Mar 2026 Form D ($600.08M offering incl. the extension) and press; LinkedIn's 919 is above the 400 claimed, so a low-confidence match |

Acme and Northwind are fictional. The Daytona and Clerk items only restate what was publicly reported, with the source link.
The fictional files carry the marker in their file name and document metadata, not on the slides, so they look real on screen.
Sources for the designed files are in `src/` (decks and the cap table are HTML rendered with Chrome; the scan is aged by `src/make_scan.py`).

The prebuilt example inbox only picks up new or changed files after `uv run python reset_demo.py` (calls the LLM and records the briefing).

Then try: **Change** on the filed toast (move an item), the **Questions** tab, the **digest** (day/week, Play briefing), and **Talk**: "what's going on with Acme?", "check Acme's Form D", interrupt mid-answer.
