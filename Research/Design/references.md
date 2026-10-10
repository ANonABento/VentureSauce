# Design References (Phase 0 moodboard)

Brand and design kit for the VentureSauce Chrome side panel (360–400px, light mode only).
The Figma file is the source of truth. This note records why it looks the way it does.

## Direction

**Three words:** exact, calm, receipted.

The panel should feel like a fintech ledger, not an AI toy. Numbers carry the weight. Chrome (the UI around them) stays quiet. Every verdict has a source you can click.

**Not doing:** purple/blue AI gradients, glassmorphism, sparkle icons, emoji, illustrated empty states, percentage confidence scores, colored table backgrounds.

## What we're taking from each reference

| Pattern | Reference | What we take |
|---|---|---|
| Ledger table | [Mercury transactions](https://mobbin.com/screens/d83e2ef6-913d-4ffb-a91d-06568a3d769b) | Hairline row dividers, small grey column labels, right-aligned tabular amounts, tiny bordered status tag ("Pending", "Failed") next to the name |
| Status pills | [Stripe payments](https://mobbin.com/screens/80054ec0-bb9d-4438-9a66-4f7bcd8f103f) | Tinted pill with a glyph (✓ ✕ ◷), so the color isn't the only signal. Summary count tiles above the table ("Succeeded 1 · Failed 3") become our "3 gaps · 2 verified · 1 unverifiable" header |
| Summary strip | [Origin spending](https://mobbin.com/screens/c1ebe916-c8fc-4678-a9df-50ec757a5034) | One-line inline stats bar ("Total transactions **1,192**") with bold values on grey labels |
| Dense rows | [Copilot Money](https://mobbin.com/screens/293239c5-afa1-41d4-89b4-7b9a961e9afd) | 32–36px rows, a muted secondary text on the same line, a detail pane for the expanded note |
| Empty drop state | [Grok files](https://mobbin.com/screens/4c0bbc8f-c16b-4980-ad57-0c10e2406aab) | A single document icon in a soft square, one line of copy, a primary and a secondary button. No illustration |
| Live progress list | [Grok upload toast](https://mobbin.com/screens/4c0bbc8f-c16b-4980-ad57-0c10e2406aab), [Fabric](https://mobbin.com/screens/ef28b27d-8cd0-45ad-b790-55d9b590402a) | A vertical list with a spinner, then a check, per step. This becomes Parsing → SEC → LinkedIn → Press → Ready |
| Compact dropzone | [Deputy documents](https://mobbin.com/screens/96821200-475d-4e5c-8e21-5e33d673d7ff) | Small inline dropzone: icon, "Drop files here, or browse", a format hint underneath |

## Implications for the kit

- **Color:** neutral greys do 90% of the work. There is one ink-dark brand color for primary actions. Verdict colors are reserved for verdicts only (green Match, red Gap, grey Unverifiable) and are never used decoratively.
- **Type:** a UI sans plus tabular numerals for claimed vs. observed values. Big numbers (20–24px) sit against 12–13px everything else.
- **Pills:** tinted background, a darker text in the same hue, and a leading glyph.
- **Width:** every pattern above is desktop-wide. Each one gets compressed into a single 380px column, with no horizontal scroll.

## Locked decisions (grill session, 2026-10-10)

1. **Split:** the product UI is a crisp white ledger in the style of Mercury and Stripe. The scenery only appears on brand surfaces: the empty/drop state, the store tile, pitch slides and the landing page. No glass-style UI.
2. **Art:** an ASCII-dithered mist-lifting valley at sunrise, generated in ChatGPT. Source PNGs are in `assets/source/` (2:3, 16:9, 1:1). In the panel it's shown cropped at 2× density, never as the full scene squeezed to 380px. *Metaphor: the fog lifts and you see what's really there.*
3. **ASCII in the UI:** only as a mono accent: the live status log, the receipt lines under sources, and small labels. Type is **Geist + Geist Mono**, both under a free license and bundled locally for wifi-off demos.
4. **Color roles:**
   - Primary buttons are pine ink `#333D34`.
   - The brand accent is sunrise amber `#D9822B`. It's used only on the logo, the running status step, the drop-zone hover outline and text selection, and never on verdicts.
   - Colors pulled from the art: `#333D34` pine, `#536055` slate sage, `#768C8D` steel, `#B4CCD4` mist, `#F8E5CA`/`#E9D8C5` parchment, `#FBD6A8` peach.
5. **Verdicts:**

   | Verdict | Background | Text | Glyph |
   |---|---|---|---|
   | Gap | `#FBE9E5` | `#A3321F` | ✕ |
   | Match | `#E6F1EA` | `#1F6B43` | ✓ |
   | Unverifiable | `#EEF0EC`, dashed border | `#536055` | ? |

   Gap rows get a 2px brick-red bar on their left edge, and the observed value on Gap rows is set in brick red. Match and Unverifiable rows stay quiet.

6. **Logo:** the sunrise mark is a half-disc sun on a horizon line in amber on pine. It's ASCII-dithered at 128px and up, and a flat shape at 16–48px. The wordmark is "VentureSauce" in Geist Semibold.
7. **Shape:**
   - Radius is 4px on pills and chips, 6px on cards and inputs, and 8px on the outer panel card.
   - Borders are 1px hairlines in warm grey `#E6E1D8`.
   - No shadows, except one soft shadow on the drop card where it sits over the art.
8. **Voice:**
   - Plain and factual, like an analyst's notes. Say what was checked and where.
   - Never write "AI-powered," exclamation marks or "Oops."
   - Verdicts don't accuse anyone: say "Gap," not "Lie," and "Unverifiable," not "Suspicious."
   - Errors say what failed, what we're showing instead and when that data is from, followed by a Retry button.
9. **Motion:**
   - New rows fade in and rise 4px over 180ms. Status steps change from a spinner to a ✓.
   - **The signature moment:** each observed value resolves from scrambled ASCII to the real number (about 400ms, once per value). It's off under `prefers-reduced-motion` and never runs on scroll or hover.
   - No ambient shimmer, no animated art, no count-ups.

## Reconciled with the teammate's frontend (`frontend/`, pulled 2026-10-10)

The teammate built a full Next.js panel ("Filing Delta", "Marginalia" tokens, six states at `/panel/states`).

10. **His layout is the screen structure.** That covers:
    - The header bar with the company name
    - The glance summary: the big count, the segmented status bar and the legend
    - Rows grouped by status, each with an edge bar and a mini visual (raise bar, investor dots, headcount sparkline, filing timeline)
    - All six states

    The kit gets applied on top of it.
11. **Status vocabulary follows the backend `DeltaStatus`:** discrepancy / consistent / not disclosed / unverified, replacing Gap / Match / Unverifiable. The Figma `Status pill` has 4 variants, with glyphs ✕ / ✓ / – / ?. Tokens are renamed to `color/status/*`.
12. **Surya's calls:**
    - **Geist only.** His Newsreader serif headings become Geist SemiBold.
    - **Our corners (4/6/8px)** replace his square 0px.
13. **Merge rule for code:** keep his CSS variable names (`--paper`, `--ink`, `--signal`, `--steady`, …) and swap in our values. Then add the amber accent, the mono status log, ASCII art on the empty state, and the scramble effect.

    | His variable | Our value |
    |---|---|
    | `--ink` | `#333D34` |
    | `--paper` | `#FBFAF7` |
    | `--rule` | `#E6E1D8` |
    | `--signal` | `#A3321F` |
    | `--signal-wash` | `#FBE9E5` |
    | `--steady` | `#1F6B43` |
    | `--graphite` | `#66726A` |

    Rename "Filing Delta" to "VentureSauce".
14. **The deal inbox pivot (PLAN.md) isn't designed yet.** The company list, item timeline, contradictions and founder questions screens still need kit coverage.

## Pending

- **Layout is parked.** A teammate is building the panel layout mockup. Once it's committed, pull it and apply the kit on top. Row layout, screen structure and density decisions wait for it, and parts of that layout may change afterward. The draft recommendation for the truth-table row is a three-line stack (pill and page, quote, then a big CLAIMED → OBSERVED line with confidence, then the source).
- Surya's inspiration has been received: 10 images (the EVM trading UI, cloud and grass glass cards, AAPL/NVDA gradient cards, a watercolor checkout page, and Ramp/Stripe/Mercury heroes). Takeaway: crisp white data cards over a scenic backdrop, which became decision 1.
- Further passes on Ramp, Brex, Linear and Attio for side panels and detail drawers.
