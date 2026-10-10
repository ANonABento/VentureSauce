# VentureSauce backend

```bash
cd backend
cp .env.example .env          # fill in keys; leave VENTURESAUCE_FAKE=1 until the real pipeline lands
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
- `GET|POST /tts` (`text`, one sentence) → Fish Audio mp3 streamed through; the client voices each sentence as it arrives and stops on interrupt

`POST /analyze` also takes optional `kind` (`email` | `notes`) for pasted text and `company_id` to file the item under a known company. Files: PDF (text or scanned), PPTX, PNG/JPG/WEBP, .eml, .txt/.md.

Fake mode replays `fixtures/job_acme.json` (fictional company) with ~1.5s per step.
`sources/ground_truth.py` is a stub until Data replaces it.
