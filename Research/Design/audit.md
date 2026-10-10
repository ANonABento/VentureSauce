# Impeccable audit: brand kit v0.1 + panel screens (2026-10-10)

**Scope:**
- **Design layer:** the Figma file `uM60fyB7G4ZGtYG3UZS6mT`, covering the Components, Brand Sheet and Screens pages.
- **Implementation layer:** the `frontend/` code that the kit gets applied to.

**Method:**
- A detector run on the code (`detect.mjs`)
- A Figma scan for color values not tied to a token, text overflow and component sizes
- A WCAG contrast check on every text/background pair
- A manual review against `references.md` and `handoff.md`

## Health score: 16/20 (Good)

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | Source chip is 22px tall, under the 24px minimum (WCAG 2.5.8). All text passes AA. |
| 2 | Performance | 4 | Art is 375–588 KB WebP and bundled locally. No heavy effects. |
| 3 | Responsive | 3 | Only designed at 380px, but the Chrome side panel can be resized to roughly 320–500px+ |
| 4 | Theming | 3 | Every Figma color is tied to a token. But `frontend/` has a dark mode the kit doesn't define. |
| 5 | Implementation integrity | 3 | Coherent, product-specific system. Two places break our own rules. |

**Integrity verdict: pass.**
- Every color and border in the components and screens is tied to a variable (0 hard-coded colors found).
- The detector found 0 issues in `frontend/`.
- The system is clearly this product: receipt lines, status vocabulary, misty-valley art.
- The failures are local, not systemic.

## Findings

### P1: fix before the demo
1. **Idle state lost the company input.**
   - **Where:** Screens › 1 Idle.
   - **Problem:** His Idle state has a "Company name" field with a Compare button. Ours replaced it with a plain-text hint, "or type a company name," that you can't type into.
   - **Impact:** A user on a page with no detectable company has no way to start a check.
   - **Fix:** Restore an input field plus a button under the drop card. *(Command: /impeccable onboard)*
2. **Dark mode would show two brands at once.**
   - **Where:** `frontend/app/globals.css`.
   - **Problem:** It flips to Marginalia dark values under `prefers-color-scheme: dark`, and `tokens.css` only covers light mode. A teammate on a dark-mode Mac would see pine-and-amber light screens and old-palette dark screens.
   - **Fix:** Set `color-scheme: light` and remove the dark block for the hackathon, or define dark values later. *(Command: /impeccable harden)*

### P2
3. **Source chip is too small to click reliably.**
   - **Where:** Components › Source chip.
   - **Problem:** It's 22px tall, under the 24px minimum target size.
   - **Fix:** Increase the vertical padding from 2px to 4px.
4. **Error state uses discrepancy red.**
   - **Where:** Status log line › Error, as used in 6 Error.
   - **Problem:** A brick-red ✕ breaks the rule that status colors mean status only. "Couldn't reach SEC" isn't a discrepancy.
   - **Fix:** Use a pine-ink ✕. Keep brick for discrepancies only.
5. **The row toggle is a tiny chevron.**
   - **Where:** Report rows.
   - **Problem:** The chevron is the only visual cue for expanding a row, and it's 8×4px.
   - **Fix:** In the spec, make the whole row header the `<button>` (at least 44px tall, `aria-expanded`), not just the chevron.
6. **Long names aren't handled in the header.**
   - **Problem:** The company name and domain on the right of the header have no truncation rule. A long legal name or domain will collide with the logo.
   - **Fix:** Truncate with an ellipsis, cap the width at 55%, and put the full text in a `title` attribute.

### P3
7. **Status pills aren't all the same height.** Discrepancy and Consistent are 24px, while Not disclosed and Unverified are 26px. The "?" glyph's line height is taller than 12px. Pin the glyph line height so all four are 24px.
8. **Not-disclosed text sits exactly at the limit.** `#66726A` on `#F5F2EC` is 4.50:1, which passes but has no margin. Darken it slightly to `#5F6B63`.
9. **The header logo doesn't match the kit.** The header uses the mark plus a mono "VENTURESAUCE" label, while the kit's lockup sets the wordmark in Geist SemiBold. Either keep the mono version and document it as the compact header variant, or use the lockup.

## What's working
- **Contrast:** every text pair is AA or better (4.5–11.3:1). Steel is correctly kept out of text use.
- **Status signals:** status is never shown by color alone. There's a glyph plus a word on every pill, and a legend under the status bar.
- **Amber discipline:** exactly the 4 sanctioned uses appear across all screens.
- **Layout:** his layout is kept intact. The kit only reskins it, so applying it to code is low-risk.

## Fix status (same day)

| # | Item | Status |
|---|---|---|
| 1 | Idle company input | **Fixed in Figma.** Labeled `Input` plus Check button under the drop card. New `Input` component (Default/Focus). |
| 2 | Dark mode mismatch | **Code fix pending.** `tokens.css` now sets `color-scheme: light`. The dark block in `globals.css` still has to be deleted, which is a teammate's file. |
| 3 | Chip target size | **Fixed.** 26px tall. |
| 4 | Error used brick red | **Fixed.** Pine-ink ✕. |
| 5 | Row toggle | **Fixed in spec.** Figma annotation on the Report row header, plus the pill description and handoff #10. |
| 6 | Header truncation | **Fixed.** Right text is fixed at 187px, right-aligned, ellipsis, one line, on all 6 screens. |
| 7 | Pill heights | **Fixed.** All 4 variants are 24px. |
| 8 | Not-disclosed contrast | **Fixed.** New `stone/700` `#5F6B63`, 4.99:1. |
| 9 | Header logo | **Fixed.** New `Brand/Wordmark compact` style (Geist SemiBold 13) in all headers. |

Expected score after the code applies #2: **19/20**.

## Recommended order
1. [P1] /impeccable onboard: restore the Idle company input
2. [P1] /impeccable harden: make dark mode a deliberate choice
3. [P2] /impeccable polish: chip target size, Error colors, row toggle, header truncation
4. [P3] /impeccable polish: pill heights, not-disclosed contrast, header logo
