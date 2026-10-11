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
