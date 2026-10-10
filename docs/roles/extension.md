# Extension: Chrome MV3 side panel

**Your job:** the thing judges see. Drop a deck, watch it work, trust the table.

## Hour 0–1: skeleton

- [ ] `extension/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "SignalEngine",
  "version": "0.1.0",
  "action": { "default_title": "SignalEngine" },
  "side_panel": { "default_path": "panel.html" },
  "background": { "service_worker": "background.js" },
  "permissions": ["sidePanel", "storage"],
  "host_permissions": ["http://localhost:8000/*"]
}
```

- [ ] `background.js`: `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });`
- [ ] Load it unpacked from `chrome://extensions`. Clicking the icon should open the panel.
- [ ] **MV3 gotcha:** no remote scripts, so no Tailwind CDN. Either write plain CSS or run the Tailwind CLI to build a static `panel.css`. No inline `<script>` either; use `panel.js`.

## Hour 1–3: build against the fixture (don't wait for the backend)

- [ ] Run the backend in fake mode (see `backend/README.md`): `/analyze` then `/jobs/{id}` steps through `fixtures/job_acme.json` with real timing, so you can build the live UI right away.
- [ ] **Drop zone:** accepts a PDF (drag-and-drop plus a file picker) and has a "paste text instead" toggle.
- [ ] **Status steps:** Parsing → Checking SEC → Checking LinkedIn → Checking press → Ready. Each one ticks when `status` passes it.
- [ ] **Truth table** (one row per check):
  - Claim (deck quote, small grey page number)
  - Claimed vs. observed (big numbers side by side)
  - Verdict pill showing the check's `label` field ("Matches source" / "Differs from source" / "Couldn't verify"). **Never show the word "gap"** (legal: Research/Product Research/legal-and-compliance.md). Use amber, not alarm red, for "Differs from source"
  - Confidence (high/med/low as a small label, not a percentage)
  - Source chip: `SEC Form D`, `LinkedIn via Bright Data`, `Press via Bright Data` → opens `source_url` in a new tab
  - `note` shown on expand
  - `source_date` next to the source chip ("Form D · filed 2026-08-17")
  - Header: show `company.form_d_entity` when present ("Matched SEC filer: Daytona Platforms Inc.")
- [ ] Sort `gap` rows to the top. Header shows the company name and "3 differ · 2 match · 1 couldn't verify".
- [ ] Footer, always visible: "Automated comparison of public records. May be incomplete or out of date. Not investment advice. Only company names are sent to public data sources."

## Hour 3–7: go live

- [ ] `POST http://localhost:8000/analyze` with `FormData` (`file` for a PDF, or `text` for pasted text), then poll `GET /jobs/{id}` every 1s until `ready` or `error`.
- [ ] Rows appear as checks arrive (partial results). That's what makes it feel live on stage.
- [ ] Error state: a friendly message plus a "Retry from cache" button that calls `?replay=1`.
- [ ] Sit in on Research's first tester session and take notes on where they hesitate or squint.

## Hour 7–10: tester fixes + polish

- [ ] Apply UI changes from the tester sessions first. Screenshot before and after each change for Research's slide.
- [ ] Stretch: Fish Audio brief. Claim the credit, then add a play button that fetches `brief_audio_url`. Hide it if the URL is null.
- [ ] Panel width is about 360–400px. Test at that width; the table must not scroll sideways.
- [ ] Style: calm and dense, like a Bloomberg terminal crossed with Linear. Make numbers big and everything else quiet.

## Hour 10–12

- [ ] Record a backup screen video of the full flow with the cache warm.
- [ ] Make sure the demo laptop has the extension loaded, the backend running and the demo deck on the desktop.

## Done when

On the demo laptop, dropping the Daytona deck shows every status step and a fully filled truth table with working source links, with wifi on and with wifi off (replay).
