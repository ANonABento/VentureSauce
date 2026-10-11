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
| `06_acme_board_update.pptx` | Slides | Slides plus speaker notes. Headcount 22 |
| `10_daytona_public_claims.txt` | Note (real) | Daytona's reported $24M Series A, quoted from press. Real Form D rows fill in once Data's tables land |
| `11_clerk_public_claims.txt` | Note (real) | Clerk's $50M Series C, from Clerk's own blog |

Acme and Northwind are fictional. The Daytona and Clerk items only restate what was publicly reported, with the source link.

Then try: **Change** on the filed toast (move an item), the **Questions** tab, the **digest** (day/week, Play briefing), and **Talk**: "what's going on with Acme?", "check Acme's Form D", interrupt mid-answer.
