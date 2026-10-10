---
target: Figma Screens v2 (panel)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-10-10T22-33-53Z
slug: www-figma-com-design-um60fyb7g4zgtyg3uzs6mt
---
Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent)

Target: Figma "Screens v2" (11 screens, 380px panel). Code evidence: frontend/ (v1 Marginalia implementation).

## Design Health Score: 24/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | The loading log and Filed toast are strong. Dither bars have no labels. |
| 2 | Match System / Real World | 3 | Analyst voice. "Not disclosed" and "unnamed" are unexplained. |
| 3 | User Control and Freedom | 2 | No route from Idle, Detected or Report to Inbox or Digest. |
| 4 | Consistency and Standards | 2 | Tab counts don't match content. Header right slot changes meaning. Report and Checks use two models. |
| 5 | Error Prevention | 3 | "Not this one" and "Filed under… Change" are both good. |
| 6 | Recognition Rather Than Recall | 3 | Collapsed rows show their value inline. |
| 7 | Flexibility and Efficiency | 2 | No search or sort in the Inbox, no keyboard affordances, only Copy all. |
| 8 | Aesthetic and Minimalist Design | 3 | Calm, but the discrepancy count appears three times on Report. |
| 9 | Error Recovery | 2 | Error promises cached results but shows none. "Try another legal name" has no input. |
| 10 | Help and Documentation | 1 | Only the disclaimer and "Likely reasons". |

## Design Specificity Verdict
- **Product-specific:** the contradiction card, Said → Filed and the timed status log.
- **Still interchangeable:** the tray → white card → title/value/chevron row repeats on every screen, a new skin on the round-2 tell. The Digest's 2×2 metric grid is the generic AI-dashboard hero. Art appears only on Idle.

**Detector:**
- CLI: 0 findings across 28 files.
- Browser: 9 findings per page.
  - `line-length` of about 102 characters on the report body is real.
  - `clipped-overflow-container` (collapse.tsx:29) is intentional for animation.
  - `cream-palette` and `overused-font` are v1 Marginalia by design.
  - `cramped-padding` (delta-row.tsx:97) is borderline.

## Priority Issues
- **[P0] The demo data contradicts itself across screens.**
  - Report shows Headcount as Consistent (64 → 91), while Checks shows 25 / 40 / 12 vs LinkedIn 91 with no flag.
  - The tab counts (Checks 6 / Questions 4) don't match the content (5 and 3).
  - Fix: one canonical dataset, with counts derived from the content.
- **[P1] Error and No-filing are dead ends.** Fix: render the cached or partial report under the notice, and make the legal-name retry an inline input.
- **[P1] Tray/card monotony.** Fix: one tray per screen, for the hero only. Use ruled rows on the page background for secondary lists. Bring the art or dither into the Report and Digest headers.
- **[P2] No navigation model.** Fix: a persistent header with Inbox, Digest and drop, and a right slot with one job.
- **[P2] Digest hero grid.** Fix: lead with the prose brief and the player, and turn the totals into one sentence with inline serif numbers.

## Persona Red Flags
- **Alex:** no Inbox search or sort; a long Report scroll; copy icons about 12px; questions only via the tab.
- **Sam:**
  - Green or brick summary text has no icon.
  - Discrepancy and contradiction pills share one icon.
  - Dither bars and the unread dot have no text equivalent.
  - Ghost buttons have no boundary.
  - Slate text on the mist tray is borderline.
- **Associate prepping for a partner meeting:** no one-page export; the story is split between Report and Checks; Digest cards don't link to receipts.

## Minor
- The Idle card's overlap with the art is awkward, and the art bleeds past the card corners.
- Question wording differs between Report and Questions.
- The Inbox "5" has no unit.
- Generic dashed drop zone and skeleton bars.
- The 102-character line length on the report.

## Questions to Consider
- If the contradiction is the product, why does Report open with a count?
- Is Report just Company · Checks before a second item arrives?
- What if trays were banned and only type, space and dither could create hierarchy?
