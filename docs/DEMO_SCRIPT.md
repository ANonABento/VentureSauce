# Demo script (demo desk)

Open `<backend>/demo` in Chrome with the VentureSauce side panel open and an empty inbox. Press **N** on the desk to open the presenter notes in a second window; put it on your laptop screen and share only the desk window.

**Moving between screens:** a clicker or **PageDown / PageUp** (or **]** / **[**) moves the desk to the next or previous step. The presenter window has Prev/Next buttons, a timer and a **2-minute version** toggle that skips the steps not marked ★. Clicking the dock or links also works; the step follows whatever screen you are on.

The steps live in `backend/static/demo/script.js`. Edit them there and update this page to match.

| # | Screen | Do | Say |
| --- | --- | --- | --- |
| 1 ★ | **Monday morning inbox** (`#mail`) | Side panel open on the right, inbox empty. | This is an investor's Monday: a deck, a founder update, call notes, intros. Every one of them makes claims, and nobody checks them against each other. |
| 2 ★ | **Drop the deck** (`#mail/acme-deck`) | Drag the Acme AI deck.pdf attachment into the side panel. | I drop the deck. It's filed under Acme AI, and every claim is checked against SEC Form D, LinkedIn and press. |
| 3 | **Deck vs. Form D** (`#decks/acme/2`) | Point at '$12M raised to date'. In the panel, click the Form D source link on that row. | The deck says $12M raised. The Form D says $15M sold, and names a director the deck doesn't. Every row links to its receipt. |
| 4 ★ | **Founder email disagrees** (`#mail/acme-update`) | ⋮ → Copy message text, then ⌘V in the panel (or drag the .eml). | Then the founder's update arrives. Same company, different numbers: ARR $3.1M in the deck vs $2.4M here, 25 people vs 18. Your sources disagree. |
| 5 ★ | **Call notes** (`#notes/acme-call`) | ••• → Copy page text, then ⌘V in the panel. | My own call notes: on the call she said $15M raised, the deck said $12M. And 'Alex Director helps out', who is on the Form D. |
| 6 | **A note with no company** (`#notes/hallway`) | ••• → Copy page text, then ⌘V. | A hallway note doesn't even name the company. It's filed under the one I'm working on, and '30 employees' joins the spread. |
| 7 | **Dashboard screenshot** (`#portal`) | ⌘⌃⇧4 to screenshot the dashboard to the clipboard, then ⌘V in the panel. | Even a screenshot works. The dashboard says 8% month-over-month; the deck said 20%. |
| 8 | **A brand-new company** (`#mail/northwind`) | Drag the email or Copy message text → ⌘V. Open the Questions tab. | A new intro with no public footprint: nothing to verify yet, so every claim becomes a question to ask the founder. |
| 9 | **A real company** (`#saved/daytona`) | Copy text → ⌘V. Click a Form D link. | This works on real companies too. Daytona's reported Series A, checked against its actual SEC filings. |
| 10 ★ | **The digest** (`#mail`) | In the panel: Digest → Week → Play briefing. | At the end of the week, one digest: what's new, what conflicts, what to ask. Instead of re-reading everything, I walk into Thursday's meeting with the questions. |

**Before going on stage:** reset the inbox, warm the cache for Acme and Daytona, and click through once with the presenter window so the sample files are cached. If the panel is slow, the 2-minute version still lands the story: deck, email, notes, digest.
