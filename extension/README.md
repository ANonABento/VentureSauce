# VentureSauce Chrome extension

A thin Manifest V3 shell. Chrome's side panel shows `sidepanel.html`, which holds one full-size iframe on
`APP_URL/panel?url=<active tab URL>`. All product UI lives in `frontend/`; nothing here renders the inbox,
the checks or the digest. Plain JS, no build step, no remote scripts.

| File | What it does |
| --- | --- |
| `manifest.json` | MV3 manifest. Permissions: `sidePanel`, `tabs`. No host permissions: the iframe does the fetching. |
| `config.js` | `APP_URL`, `FOLLOW_TABS`, `LOAD_TIMEOUT_MS`. |
| `background.js` | Makes the toolbar icon open the side panel. |
| `sidepanel.html` / `.css` / `.js` | The iframe, the loading view and the can't-reach view with Retry. |
| `permissions.html` / `.css` / `.js` | Optional page that grants the microphone to the extension (see "Voice analyst"). |
| `icons/`, `scripts/make_icons.py` | Placeholder icons and their generator. |

## Load it

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder (in the worktree, or in the main checkout after merge).
4. Pin VentureSauce from the puzzle-piece menu in the toolbar.
5. Click the icon. The side panel opens.

Needs Chrome 114 or newer (side panel API).

## Run it locally

Start these in order, then click the icon:

```bash
cd backend && uv run uvicorn main:app --reload --port 8000    # VENTURESAUCE_FAKE=1 is fine
```

```bash
cd frontend && NEXT_PUBLIC_API=http://localhost:8000 npm run dev    # serves http://localhost:3000
```

The panel inside the iframe calls the backend directly. The backend's CORS allows `chrome-extension://*`,
`http://localhost` and `http://127.0.0.1` (`backend/main.py`), which covers this setup.

## Settings (`config.js`)

- **`APP_URL`**: where the panel is served. Local is `http://localhost:3000`. For production, comment that line out
  and use the line marked `// DEMO:` with the Vercel URL.
- **`FOLLOW_TABS`**: `true` makes the panel follow the active tab. It reloads when you switch to a tab on a different
  site, or navigate to one. It does not reload for navigation within a site, or between internal pages
  (`chrome://`, new tab, the Web Store…), which all show the inbox. Set it to `false` to load once and stay put:
  a reload wipes a drop or upload that is still in progress.
- **`LOAD_TIMEOUT_MS`**: how long to wait before showing "Can't reach VentureSauce".

## When to reload the extension

Click the reload arrow on the VentureSauce card in `chrome://extensions` **only after changing files in
`extension/`** (including `config.js`), then close and reopen the side panel. Changes in `frontend/` hot-reload
inside the iframe on their own.

## Voice analyst (microphone): unverified

The iframe is given `allow="clipboard-write; microphone; autoplay"` so Copy, the voice analyst and the audio brief
can work inside the frame. Whether Chrome shows the microphone prompt for a frame inside a side panel has **not been
tested**; side panels often can't show permission prompts. If "Talk to your briefing" does nothing or reports an
error:

1. Right-click the VentureSauce toolbar icon and choose **Options** (or `chrome://extensions` → Details →
   Extension options). This opens `permissions.html` in a normal tab.
2. Press **Allow microphone** and accept Chrome's prompt.
3. Close the tab and reopen the side panel.

This grants the microphone to the extension's origin, which the framed panel is expected to inherit. That is
also untested. The digest works without it: the transcript is always shown and questions can be typed.

## Icons

`icons/` holds a generated placeholder of the sunrise mark (amber sun over a pine horizon on paper).
**Replace these with the Figma "App icon" exports (16, 32, 48, 128) when Surya exports them**, keeping the file
names. To regenerate the placeholder: `python3 extension/scripts/make_icons.py` (needs Pillow).

## Known limits

- The panel's `localStorage` (seen marks, asked questions) is partitioned under the extension, so it is separate
  from `localhost:3000` opened in a normal tab. If Chrome is set to block third-party cookies, storage inside the
  frame may be unavailable; the panel already tolerates that.
- If the frontend goes down while the panel is open, the error view appears on the next reload (site change or
  Retry), not immediately.
- A refused connection shows the error view at once. The `LOAD_TIMEOUT_MS` wait only applies when the server
  accepts the connection but doesn't answer.

## Demo checklist

- [ ] **Decide where the demo runs.** Recommended: frontend and backend both on localhost. It survives bad wifi
      (PRODUCT.md principle 5) and the backend CORS already allows it.
- [ ] If you use Vercel instead:
  - [ ] production URL in `config.js`, extension reloaded
  - [ ] Vercel deployment protection off (a login wall can't be shown usefully in the frame)
  - [ ] `NEXT_PUBLIC_API` pointing to a backend the browser can reach over HTTPS (a public page calling
        `localhost:8000` can be blocked by Chrome)
  - [ ] backend CORS extended to the Vercel origin (owned by Kevin, `backend/main.py`)
- [ ] `FOLLOW_TABS = false` if the demo is drag-and-drop.
- [ ] Separate Chrome profile with only this extension loaded.
- [ ] Demo desk tabs open (Mail SEC alerts, Saved: Legora, Daytona).
- [ ] Side panel dragged to about 380–420px.
- [ ] Demo desk open at `<backend>/demo` (real SEC alerts and announcements to drag in).
- [ ] Cache warm: run the demo flow once beforehand.
- [ ] Backup screen recording of the full flow.
- [ ] Mic permission tested once if the voice analyst is shown (see "Voice analyst").
