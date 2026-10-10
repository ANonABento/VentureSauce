# VentureSauce design handoff (v0.1)

- **Figma:** [VentureSauce — Brand & Design Kit](https://www.figma.com/design/uM60fyB7G4ZGtYG3UZS6mT)
- **Tokens:** [`tokens.css`](tokens.css)
- **Why it looks this way:** [`references.md`](references.md)

This applies the brand to the panel that's already in `frontend/`. It keeps that layout and its six states, and changes how they look.

## Figma file map

| Page | What's there |
|---|---|
| Cover | Title card on the 16:9 art |
| Logo & Icon | `Logo/Mark` (sunrise), `Logo/Lockup`, `App icon/16·32·48`, `App icon/128 (dithered)` |
| Components | `Status pill` (4), `Source chip` (3), `Confidence label` (3), `Status log line` (4 states), `Receipt line`, `Button` (Primary/Secondary × Default/Hover/Disabled), `Drop zone` (Idle/Hover/Uploading), `Icon/*` |
| Brand Sheet | Hero slide, palette, type specimen, status, art crops and usage |
| Screens · panel states | 1 Idle · 2 Detected · 3 Loading · 4 Report · 5 No filing found · 6 Error, at 380px |

Variables live in the Primitives, Color and Dimension collections. The WEB code syntax is `var(--vs-…)`.

## Changes to `frontend/`, in priority order

1. **Rename** "Filing Delta" to **VentureSauce**: header label, `<title>` and manifest. Put `Logo/Mark` before the header label.
2. **Tokens:** paste the first block of `tokens.css` over the `:root` in `globals.css`. The variable names don't change, so no component edits are needed.
3. **Drop the serif.** Change `font-serif` in `verdict.tsx` (the big count) and in the company-name heading to Geist SemiBold. Newsreader can be removed from `layout.tsx`.
4. **Corners:** pills and chips get 4px, buttons, inputs and cards 6px, and the panel and drop card 8px. Buttons are currently square.
5. **Status pill:** glyph plus word. Use ✕ discrepancy, ✓ consistent, – not disclosed, ? unverified. Unverified gets a dashed border. The order stays the same as `STATUS_ORDER`.
6. **Loading** becomes the **mono status log** (Geist Mono 12/18):
   - Done is a slate ✓ with the elapsed time.
   - Running is an **amber** arc spinning over 800ms.
   - Pending is a hollow steel dot.
   - Error is a pine-ink ✕. Brick red is reserved for discrepancies.
   - Example copy: `Form D · 2 filings · 0.8s`.
7. **Expanded row** adds four things:
   - SAID → FILED as Number/L, with the observed value in brick on discrepancy rows
   - Likely reasons
   - A source chip and the confidence label
   - A mono receipt line (`SEC · Form D · item 13 · checked 2026-10-10`)
8. **Ask the founder** (from the pivot): a subtle-bg block under an expanded discrepancy, holding one quoted question.
9. **Header:**
   - Use `Logo/Mark` plus "VentureSauce" in Geist SemiBold 13, not the mono label.
   - The company name or domain on the right truncates with an ellipsis, capped at 55% of the width, with the full text in `title`.
10. **Rows:** the whole row header is the `<button aria-expanded>`, at least 44px tall. The chevron is only a visual cue.
11. **Source chip:** 4px vertical padding, so it's 26px tall. That's above the 24px minimum target size.
12. **Idle and drop:** a 2:3 art band, with the drop card overlapping it and the one allowed shadow. Copy: "Drop anything about a company". Use `assets/landscape-2x3.webp` (375 KB) **bundled locally**, never loaded from a URL.
    Below the drop card, keep the teammate's company lookup: a labeled "Or look up a company" input with a **Check** button (Figma `Input`).
13. **Motion:**
    - Rows fade in and rise 4px over 180ms.
    - The glance count and each observed value **scramble-resolve** from random ASCII (`#@%&*0-9`) to the real value over 400ms, once.
    - All of it is skipped under `prefers-reduced-motion`.

## Rules that are easy to break

- **Amber appears in exactly four places:** the logo sun, the running log step, the drop-zone drag-over, and `::selection`. Never on buttons or statuses.
- **Status colors mean status only.** On a discrepancy row, the only colored things are the edge bar, the summary text and the observed number.
- **Steel `#768C8D` isn't a text color** (3.6:1). Use `--graphite` for the smallest text.
- **Copy is plain and factual.** No "AI-powered," no exclamation marks, no "Oops." "Discrepancies are differences between sources, not findings of wrongdoing."
- **The art never sits behind data.** It appears on brand surfaces only.

## Not designed yet (deal inbox pivot)

The company list, the per-company item timeline (deck, email and notes), the contradictions view across items, and the digest.
