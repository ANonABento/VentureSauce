# Demo script (real data only)

Open `<backend>/demo` in Chrome with the VentureSauce side panel open. Switch apps with the dock. Everything on screen
is real: SEC Form D filings, LinkedIn and Crunchbase via Bright Data (Data's pipeline on OSO), and companies' own
announcements. Nothing is invented.

**Getting things into the panel:** drag a funding headline, a company row or a saved article from the desk straight
into the panel, or copy and press ⌘V in the panel.

| # | Screen | Do | Say |
| --- | --- | --- | --- |
| 1 ★ | **Mail: SEC alerts** | Show the inbox. | "Every morning, new raises from SEC Form D filings land here: 1,000 startups from our pipeline, enriched with LinkedIn and Crunchbase via **Bright Data**." |
| 2 ★ | **Mail → Quartermaster AI** | Drag the *In the news* headline into the panel. | "The press says Quartermaster raised $43M. Their SEC filing shows **$122.65M sold**. The raise is far bigger than the news reported, and that's useful to know before anyone else does." |
| 3 ★ | **Mail → Blitzy** | Drag the headline in. | "Blitzy says $200M. The Form D shows $188.8M sold of a $190M offering, and Business Wire reports $200M. Green across the board, every row linked to its source." |
| 4 | **Mail → Penelope Health** | Drag the headline in. | "$100M in the press, $25M on file. Filings often show only the first close, so we say 'can't confirm' and turn it into a question, not an accusation." |
| 5 ★ | **Saved → Legora** | Drag the article into the panel. | "A judge's company. Legora's own Series D post: the $550M matches its Form D and press, and LinkedIn via Bright Data shows 919 people against the 400 they announced." |
| 6 | **Deal flow → Judges' companies / In the news** | Filter, search, drag a row. | "The whole pipeline is browsable. We only show a LinkedIn or Crunchbase profile when its website matches the company's own; a name match alone once paired Legora with a 2-person company." |
| 7 | **Saved → Daytona** | Drag it in. | "**Daytona**, a sponsor: the $24M Series A matches its February Form D, with a newer August round noted." |
| 8 ★ | **Panel: Digest** | Digest → Week → *Play briefing*. | "At the end of the week, one digest across every company, read out by **Fish Audio**." |

## Where the sponsors show up

| Sponsor | Beat | How |
| --- | --- | --- |
| **Bright Data** | 1, 2, 5, 6 | SERP API, LinkedIn and Crunchbase datasets in the pipeline; Web Unlocker for live press and LinkedIn. Point at "via Bright Data" on the rows. |
| **Daytona** | 7 | Its real Series A press, checked against its real Form D filings. |
| **Fish Audio** | 8 | The spoken digest. |
| **Nebius** | 2 | The open model reading every item. One line is enough. |

**What to expect** (checked live on 2026-10-10): Quartermaster AI: Form D $122.65M sold vs. $43M claimed (flagged as
"filing shows more"). Blitzy: Form D and press match. Penelope Health: press matches $100M, Form D $25M "can't
confirm". Legora: Form D $441.5M sold of $600M, press $550M, LinkedIn 919. If the network fails, saved snapshots in
`backend/fixtures/ground_truth/` and the OSO copy in `fixtures/ground_truth/oso.json` answer instead.

**Before going on stage:** run `uv run python reset_demo.py` for a fresh demo inbox (`?ws=demo`), or use an empty inbox
to drop things live. Run `uv run python export_dealflow.py` to refresh the desk from the pipeline.
