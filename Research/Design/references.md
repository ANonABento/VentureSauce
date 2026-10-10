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

## Feedback round 2: "it looks vibe-designed" (Surya, 2026-10-10)

Surya's verdict: the tabs, contradiction card and question card feel generic and AI-made, close to the Claude look rather than studio work. A redesign of the components is planned once more studio and fintech references arrive.

### Anti-references: patterns we drop

- Uppercase mono micro-labels on every section ("ASK THE FOUNDER", "PUBLIC RECORDS"). Mono is an accent, not a default.
- Hairline rules and bordered boxes doing all the layout work, with every card built as the same label → text → grey footer stack.
- One type size (Geist 12–13px) everywhere, with no scale contrast.
- Glyphs typed as characters (✕ ✓ –), default chevrons, and generic data marks such as a row of circles or a plain line.
- The safest version of every component.

### Mobbin pass 2: patterns worth taking

- **[QuickBooks reconcile](https://mobbin.com/screens/869dfa1d-8c53-4dac-96a1-6fd98999d1b8):** numbers laid out as an equation, with big figures, small captions and the operators between them. This is the model for the contradiction card: `25 · 40 · 12` → spread.
- **[Mercury](https://mobbin.com/screens/2a9877cf-2b59-42c1-b143-ae4ee6e27841):** superscript cents, a tiny bordered status tag inline with the name, an underline for the active tab, and lots of space with no boxes.
- **[Lightfield](https://mobbin.com/screens/a77b052b-5612-4588-895a-6cc553d5b18d)** and **[Fireflies](https://mobbin.com/screens/2047129f-d283-45ef-81bb-09aa79a32ffe):** questions as plain ruled rows or numbered bold quotes rather than cards. This is the model for Questions.
- **[Monarch budget](https://mobbin.com/screens/4b4fd393-259f-4382-84d3-2246a5702984):** a tinted hero card with one huge figure. This is the model for the glance count and the digest totals.
- Most of Mobbin is competent but generic. Studio references (Outpace, Metalab, Instrument) are needed for the step up in craft.

## Round 3: Lasso-led redesign (grill session, 2026-10-10)

**Primary reference: [lassocommerce.com](https://lassocommerce.com/).** Measured on the live site:
- Bespoke Serif headlines (75px, −3px tracking) in two tones, with inline line icons
- Inter 15–16px UI text at −0.3px tracking
- Serif numerals (7.35%, 1,432, 65.43%) in its single blue accent
- Bento trays (pale blue, about 16px radius, no border) holding white "UI fragment" cards with soft shadows
- Item rows with an outlined, red "Blocked" problem row
- Dithered progress bars over a misty mountain photo

**Rejected sources:**
- **The Ramp "skill"** (mcpmarket zip and `zeoel-framework`, which are the same file). It was scraped by a bot and its values are wrong: body text `#B8B8B8` at about 2:1 contrast, chartreuse cards, a 1920px layout. Only its generic interaction rules hold up.
- **The "Mercury" Figma community file.** It's a generic template with purple and mint gradients, not Mercury's real brand.

**Decisions** (these override earlier ones where they conflict):

| # | Topic | Decision |
|---|---|---|
| 15 | Serif | **Bespoke Serif** (Fontshare, free) for display and key numbers: company name, the glance count, claimed → observed values, digest totals. Geist for all UI text. Geist Mono only for receipts, the status log and timestamps. *Reverses decision 12's "Geist only".* |
| 16 | Surfaces | Lasso two-layer construction. Sections sit on a **tray** (12px radius, no border). Content goes in white **fragment** cards (8px radius, one soft shadow). Hairlines are mostly removed, and pills are fully rounded. *Replaces the 4/6/8px hairline system.* |
| 17 | Tray tint | **Mist `#EEF3F4`**, derived from the art's `#B4CCD4` |
| 18 | Number color | **Deep mist blue `#3F6E7C`** for neutral data figures and source links. Brick for discrepancy figures. Amber keeps its 4 uses. |
| 19 | Section headers | **Geist sentence case** (Medium 13px, with counts). The uppercase mono labels are retired. |
| 20 | Icons | **Phosphor**: Light for UI, Duotone with a mist tint for emphasis. Bundled as local SVGs. They replace the typed ✕ ✓ – ? and the default chevrons. |
| 21 | Contradiction card | Big serif numbers up top (`25 · 40 · 12`, then "spread of 28 people" in brick). Below them, white fragment cards per source item, each quoting its line. |
| 22 | Questions | One fragment card holding a ruled list: serif index in mist blue, the question in Geist 14 ink, a slate "why" line, and a copy icon on hover or focus |
| 23 | Tabs | A segmented pill on a tray track, with the active tab as a white fragment. Counts in mist blue. |
| 24 | Data marks | **Dithered dot-grid bars** for proportions: status bar, raise bar, progress, digest. Mist blue for neutral, brick for discrepancy. Sparklines and lines stay solid. |

## Pending

- **Layout is parked.** A teammate is building the panel layout mockup. Once it's committed, pull it and apply the kit on top. Row layout, screen structure and density decisions wait for it, and parts of that layout may change afterward. The draft recommendation for the truth-table row is a three-line stack (pill and page, quote, then a big CLAIMED → OBSERVED line with confidence, then the source).
- Surya's inspiration has been received: 10 images (the EVM trading UI, cloud and grass glass cards, AAPL/NVDA gradient cards, a watercolor checkout page, and Ramp/Stripe/Mercury heroes). Takeaway: crisp white data cards over a scenic backdrop, which became decision 1.
- Further passes on Ramp, Brex, Linear and Attio for side panels and detail drawers.
