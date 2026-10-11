# Real items

Every file here restates a real company's own published statements, with the source link at the bottom. Nothing is
invented. Drop them in the panel, or drag them from the demo desk's Saved app (`<backend>/demo#saved`).

| File | Source | What it shows (live) |
| --- | --- | --- |
| `10_daytona_public_claims.txt` | VC News Daily | $24M Series A matches the Feb 2026 Form D ($23.26M sold); the newer Aug 2026 offering is noted as context. Press $24M |
| `11_clerk_public_claims.txt` | Clerk's blog | $50M Series C matches its Form D |
| `12_legora_public_claims.txt` | Legora's newsroom | $550M Series D matches the Mar 2026 Form D ($600M offering incl. the extension) and press. LinkedIn 919 vs "400 team members": low-confidence match |
| `13_lovable_public_claims.txt` | Lovable's blog | $400M Series C matches the Aug 2026 Form D ($382.5M sold of $400.2M, still open) and press |
| `14_harvey_public_claims.txt` | Harvey's blog | $550M round matches the Sep 2026 Form D ($550.3M sold) and press |

| Email | Source | What it shows (live) |
| --- | --- | --- |
| `Legora.eml` | Legora due diligence report (10 Oct 2026, Research), full text as a plain-text email | Files under Legora as an email item, alongside `12_legora_public_claims.txt` |
| `BrightData.eml` | Bright Data's About page | No funding round (EMK Capital-owned since 2017): 50,000+ organizations, AR over $300M in 2025, "450+ team members" (2022 figure) |
| `Base44.eml` | Maor Shlomo's and Wix's posts; Wix's acquisition release | $200M ARR, 10M+ users; acquired by Wix for ~$80M plus earn-outs, no VC round or Form D |
| `SenseAI.eml` | testwithsenseai.com | Thin: only "1000+ signed up" and tester pay; no funding, team or revenue published |
| `Clerk.eml` | Clerk's blog | $50M Series C (Menlo, Anthology Fund) vs. its Form D |
| `Cognition.eml` | Cognition's blog | Over $2B Series E at $48B (a16z, Accel); run-rate revenue almost $900M |
| `Daytona.eml` | Daytona's blog, press release, Tech.eu, AlleyWatch | $24M Series A (FirstMark), "20-person team", $31M total; the Aug 2026 Form D is newer |
| `FishAudio.eml` | Fish Audio's blog and press release | $52M seed (Coreline, Capital Today), $21M ARR, 8M+ users, team of 22 |
| `MongoDB.eml` | MongoDB's Q2 FY27 and Q4 FY26 releases, FY26 10-K | Public company: $771.8M quarterly revenue, 65,200+ customers, 5,636 employees |
| `Stripe.eml` | Stripe's newsroom and 2025 annual letter | $159B tender offer (Thrive, Coatue, a16z), $1.9T total volume in 2025 |

More real input: any company in the desk's **Deal flow** (1,000 startups from SEC Form D, via Data's pipeline). Drag a
row with a confirmed website into the panel, and it reads the site and checks it against the filings, LinkedIn and
Crunchbase.

The prebuilt example inbox only picks up new or changed files after `uv run python reset_demo.py`.

| Headline files | Source | What it shows (live) |
| --- | --- | --- |
| `15_quartermaster_ai_headline.txt` | Bright Data SERP API, via Data's pipeline | "$43M" headline vs. **$122.65M sold on the SEC filing**: the raise is bigger than the press reported |
| `16_penelope_health_headline.txt` | same | "$100M" matches press (Axios); the Form D shows $25M, so the filing can't confirm it |
| `17_blitzy_headline.txt` | same | "$200M" matches the Form D ($188.8M sold of $190M) and press (Business Wire) |

| Announcement PDFs | Source | Notes |
| --- | --- | --- |
| `page_legora_announcement.pdf`, `page_lovable_announcement.pdf`, `page_harvey_announcement.pdf`, `page_clerk_announcement.pdf`, `page_daytona_announcement.pdf` | The companies' own pages (VC News Daily for Daytona), printed to PDF with Chrome | Shown in the desk's Files app; drag one into the panel. Forward-looking lines ("we plan to grow to 450") aren't checked |
