# VentureSauce backend

```bash
cd backend
cp .env.example .env          # fill in keys; with LLM_API_KEY set the real pipeline runs (VENTURESAUCE_FAKE=1 forces the Acme replay)
uv sync --python 3.12
uv run uvicorn main:app --reload --port 8000
```

- `GET /health` → `{ok, fake}`
- `POST /analyze` with FormData: `file` (PDF) or `text` → `{job_id}`
- `GET /jobs/{job_id}` → job (poll every 1s; `status` goes parsing → checking_sec → checking_linkedin → checking_press → ready, or `error`)
- `GET /jobs/{job_id}?replay=1` → cached final result (demo fallback)
- `GET /companies` → deal inbox list · `GET /companies/{id}` → company view (items, checks, questions) · `DELETE /companies/{id}`
- `GET /api/delta?company_id=…|url=…|company=…` → the Next.js frontend's `DeltaReport` (`frontend/lib/types.ts`) plus `questions`, `items`, `company.id`. 404 until something about that company has been dropped in.

- `GET /digest?period=day|week` → roll-up + on-screen summary + podcast script · `POST /digest/audio {script}` → `{audio_url}` (Fish Audio)
- `POST /chat/stream {messages:[{role,content}]}` → SSE `{"text"}…{"done":true}`: the voice analyst, grounded only in the inbox
- The analyst can call `research_company` mid-conversation ("check if Acme filed a new Form D", "look up Zentrix"): fresh `get_ground_truth(..., use_cache=False)`, recomputed checks saved to the company, and a spoken summary of what changed (`research.py`). Until Data's sources land it says lookups aren't live (`sources/ground_truth.IS_STUB`).
- `GET|POST /tts` (`text`, one sentence; optional `speed` 0.7–1.8, default `FISH_SPEED`=1.2) → Fish Audio mp3 streamed through; the client voices each sentence as it arrives and stops on interrupt
- `POST /asr` (FormData `audio`: WAV or M4A, not WebM) → `{text}` via Fish Audio speech-to-text. Voice input for browsers without built-in speech recognition (Safari, Firefox)

`POST /analyze` also takes optional `kind` (`email` | `notes`) for pasted text and `company_id` to file the item under a known company. Files: PDF (text or scanned), PPTX, PNG/JPG/WEBP, .eml, .txt/.md.

Fake mode replays `fixtures/job_acme.json` (fictional company) with ~1.5s per step.
`sources/ground_truth.py` is a stub until Data replaces it.

## Demo reset

```bash
uv run python reset_demo.py            # back up the inbox, wipe, file samples/ through the real pipeline, pre-record briefings
uv run python reset_demo.py --empty    # back up and wipe only
```

Backups go to `data/backups/`. The running server sees the new inbox immediately. Briefings are cached by content
(`data/digest_scripts.json`, `data/audio/digest-<hash>.mp3`), so Play starts instantly after a reset.

Saved company views carry a `checked` marker (code version + stub/live sources). Views made by older code, or before
Data's live sources landed, are recomputed when next read; `POST /companies/refresh` recomputes everything now.

## Demo desk

`/demo` mimics the apps an investor lives in (a mail inbox, a shared-deck viewer, a notes workspace, a CRM pipeline,
a founder's investor portal, a read-later list), switched from an auto-hiding dock at the bottom, so the extension can be
demoed next to something that feels real. Every downloadable item is a file in `samples/`, and email and note bodies are
read from those same files (the "(FICTIONAL ...)" markers are hidden on screen only). Familiar layouts, but no real
product names or logos. Fictional data, except the quoted public claims, which link to their source. The deck's source is `samples/src/acme_deck.html`.

**Running the demo:** PageDown/PageUp (or a clicker, or `]`/`[`) steps through the script in `static/demo/script.js`, and `N` opens
presenter notes in a second window (do/say per step, timer, 2-minute toggle). The printable copy is `docs/DEMO_SCRIPT.md`.
