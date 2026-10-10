# SignalEngine backend

```bash
cd backend
cp .env.example .env          # fill in keys; leave SIGNALENGINE_FAKE=1 until the real pipeline lands
uv sync --python 3.12
uv run uvicorn main:app --reload --port 8000
```

- `GET /health` → `{ok, fake}`
- `POST /analyze` with FormData: `file` (PDF) or `text` → `{job_id}`
- `GET /jobs/{job_id}` → job (poll every 1s; `status` goes parsing → checking_sec → checking_linkedin → checking_press → ready, or `error`)
- `GET /jobs/{job_id}?replay=1` → cached final result (demo fallback)

Fake mode replays `fixtures/job_acme.json` (fictional company) with ~1.5s per step.
`sources/ground_truth.py` is a stub until Data replaces it.
