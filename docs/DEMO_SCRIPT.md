# Demo script (about 3 minutes, real data only)

Everything on screen is real: SEC Form D filings, LinkedIn, Crunchbase and press via **Bright Data** (Data's pipeline
on OSO), and companies' own announcements. Nothing is invented.

## Setup (before going on stage)

- Chrome with the extension loaded (`extension/`, reloaded after `git pull`), side panel open on the right.
- One tab: the demo desk, `<backend>/demo`. Switch apps with the dock at the bottom.
- **Empty inbox in the panel**, so every drop is live. A fresh Chrome profile gets its own empty inbox.
- Backup: if anything is slow, open the prefilled inbox, `<frontend>/panel?ws=demo` (same companies, already checked).
- Warm the cache: drag every item below in once, the night before.

## The run

| # | Desk | Drag into the panel | What the panel shows | Say |
| --- | --- | --- | --- | --- |
| 0 | Mail | (nothing) | Empty inbox | "Investors hear funding numbers all day. VentureSauce checks every one against SEC filings and Bright Data, with a source on every row." |
| 1 | **Mail** (SEC alerts) | (show the inbox) | | "Every morning, new raises from SEC Form D land here: 1,000 startups from our Bright Data pipeline." |
| 2 ★ | Mail → **Quartermaster AI** | The blue **In the news** box ("raises $43M") | Loading steps, then **1 discrepancy: Round ($43M) vs. Form D, +$79.65M**. Founder question underneath. | "The press says $43M. Their SEC filing shows **$122.65M sold**. They raised far more than the news knows." Click the Form D link on the row to open the real filing. |
| 3 | Mail → **Blitzy** | The **In the news** box ("raises $200M") | Green: Form D $188.8M sold of $190M; press (Business Wire) $200M | "When it checks out, you see that too, every row linked to its source." |
| 4 ★ | **Files** → Legora PDF | The **Legora** card (a judge's company) | Form D $441.5M sold of a $600M round (still open), press $550M, **LinkedIn 919 vs. 400** (low-confidence match, with the reason) | "Legora's own Series D post. Filing and press match. LinkedIn, via Bright Data, shows 919 people against the 400 they announced: LinkedIn counts more, so we say so instead of flagging it." |
| 5 | **Deal flow** → *Judges' companies* or *In the news* | (click a row) | Record opens on the right: funding on file, people, LinkedIn, Crunchbase | "The whole pipeline is browsable. We only trust a LinkedIn or Crunchbase profile whose website matches the company's own; a name match once paired Legora with a 2-person company in Chile." |
| 6 | **Saved** → Daytona | The article | Matches the Feb 2026 Form D ($23.26M of $23.8M), newer Aug round noted; Matt Turck on the filing; press $24M | "**Daytona**, a sponsor: their Series A press checks out against their real filings." |
| 7 ★ | Panel home | **Daily report → headphones** (D / W toggle for the week) | Spoken briefing across the companies | "At the end of the day, one briefing across every deal, read out by **Fish Audio**." |
| 8 | | | | Close: "Real SEC data, **Bright Data** for LinkedIn, Crunchbase and press, an open model on **Nebius** reading every item. Every number has a source." |

**Optional if there's time:** drag an email row from Mail (any company; it files as an email), open **Notes** →
Quartermaster AI for the research page, or Mail → **Penelope Health** ("$100M" in the press, $25M on file: "the
filing can't confirm it", worded as a question, not an accusation).

## Where the sponsors show up

| Sponsor | Beats | How |
| --- | --- | --- |
| **Bright Data** | 1, 2, 4, 5 | SERP API, LinkedIn and Crunchbase datasets in the pipeline; Web Unlocker for live press and LinkedIn. Point at "via Bright Data" on the rows. |
| **Daytona** | 6 | Its real Series A press, checked against its real Form D filings. |
| **Fish Audio** | 7 | The spoken briefing. |
| **Nebius** | 2, 8 | The open model reading every item. |

## If something goes wrong

- A drop is slow: keep talking over the loading steps (Checking SEC, LinkedIn, press); it finishes in a few seconds.
- Network down: lookups fall back to saved snapshots (`backend/fixtures/ground_truth/`, `oso.json`).
- Panel won't load: switch to the prefilled inbox (`?ws=demo`) and walk through the same companies.
- Refresh the desk data: `uv run python export_dealflow.py`; rebuild the prefilled inbox: `uv run python reset_demo.py`.
