# Demo script (demo desk)

Open `<backend>/demo` in Chrome with the VentureSauce side panel open and an empty inbox. Switch apps with the dock along the bottom.

**Getting things into the panel:** drag an attachment or file card from the desk straight into the panel (the panel downloads the link), or ⌘V anywhere in the panel: copied email or note text, a screenshot, a copied file, a link (a press article is read as text) or a company name (opens it if it's in the inbox). Mind the screen you're on: on a company's screen, whatever you paste or drop is filed under that company, so go back to the inbox before adding a different company.

The story: an investor's week is a pile of decks, emails, call notes and press. Drop it all in; VentureSauce files it by company, checks every claim against public records and against your other sources, and hands you the questions to ask.

| # | Screen | Do | Say |
| --- | --- | --- | --- |
| 1 ★ | **Mail inbox** | Panel open, inbox empty. | "This is an investor's week: a deck, a founder update, call notes, a partner forwarding press. Every one of them makes claims, and nobody checks them against each other." |
| 2 ★ | **Mail → "Deck for Thursday"** | Drag the *Acme AI deck.pdf* attachment into the panel. | "I drop the deck. It's read by an open model on **Nebius**, filed under Acme AI, and every claim is checked against SEC Form D, plus LinkedIn and press via **Bright Data**." Point at a "via Bright Data" label. |
| 3 | **Files → Acme AI deck, page 13 (the ask)** (or the panel row) | Click the Form D source link on the "raised" row. | "The deck says $12M raised. The Form D says $15M sold, and lists a director the board slide leaves out. Every row links to its receipt." |
| 4 ★ | **Mail → "Acme AI - September update"** | ⋮ → *Copy message text*, then ⌘V in the panel (or ⋮ → *Download message* and drop the .eml). | "The founder's update says ARR is $2.4M; the deck said $3.1M. 18 people vs 25. Your own sources disagree, and no public database would catch that." |
| 5 ★ | **Notes → "Acme AI: call with Jane"** | ••• → *Copy page text*, ⌘V. | "My call notes: '$15M total', not $12M. And 'Alex Director helps out', who is on the Form D." |
| 5b | **Mail → "Re: cap table"** | Drag the scanned PDF attachment into the panel. | "Jane sent the cap table, as a scan. VentureSauce reads it anyway: $15M raised, including an August SAFE the deck leaves out. That's the paper trail for the $15M on the Form D." |
| 6 | **Acme AI portal** | ⌘⌃⇧4 a screenshot of the dashboard to the clipboard, ⌘V. | "Even a screenshot: 8% month-over-month here, 20% in the deck." |
| 7 ★ | **Mail → "Daytona" (from Morgan)** | ⋮ → *Copy message text*, ⌘V. Open the Form D link in the panel. | "Now a real company, and one of tonight's sponsors. My partner forwarded **Daytona**'s Series A press: $24M. VentureSauce pulls their real Form D filings from SEC EDGAR, and LinkedIn headcount through Bright Data." Then say what the panel shows (see below). |
| 8 | **Mail → "Intro - Northwind Robotics"** | From the inbox screen: copy message text and ⌘V, then drag the attached deck in. Open *Questions*. | "A cold intro with no public footprint, so every claim becomes a question for the founder. And the deck already disagrees with the email: 8 people vs 7." |
| 9 ★ | **Panel: Digest** | Digest → Week → *Play briefing*. | "At the end of the week, one digest across companies, read out by **Fish Audio**: what's new, what conflicts, what to ask before Thursday's meeting." |

## Where the sponsors show up

| Sponsor | Beat | How |
| --- | --- | --- |
| **Daytona** | Step 7 | The real-company check. Their Series A press piece arrives the way deals really do (a partner forwards it), and the panel checks it against Daytona's actual Form D filings. Also on the CRM board under *Sourced*. |
| **Bright Data** | Steps 2 and 7 | LinkedIn headcount and press search. Say "via Bright Data" out loud and point at the label on the rows. |
| **Fish Audio** | Step 9 | The spoken digest. |
| **Nebius** | Step 2 | The open model reading decks, emails and screenshots. One line is enough. |
| **Cognition** | Close | How we built it: say what Devin did for us (EDGAR parser, tests). Not on screen. |

**Daytona, what to expect** (checked live on 2026-10-10): the $24M Series A **matches** the Form D filed 2026-02-05 ($23.26M sold of $23.80M); the panel adds that a newer Form D filed 2026-08-17 shows $48.27M sold of a $60M offering, still open ($11.73M unsold), a later round the article doesn't cover. Matt Turck is listed on the filing, and press via Bright Data reports $24M. Say it neutrally ("a newer round still open"). If the network fails, the saved snapshot in `backend/fixtures/ground_truth/` answers instead. LinkedIn headcount isn't fetched yet, so don't promise it.

**Rules:** Acme and Northwind are fictional; say so if asked. Daytona content is only its real reported claims, with the source link. We never put invented claims under a sponsor's name.

**Before going on stage:** reset the inbox, warm the cache for Acme and Daytona, and click through once so the sample files and lookups are cached. If the panel is slow, the 2-minute version still lands the story: deck, email, notes, Daytona, digest.
