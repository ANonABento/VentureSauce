# AGENTS.md: read this first

Hackathon project **SignalEngine**: drop a pitch deck into a Chrome side panel and get a claim-by-claim truth table (match / gap / unverifiable) checked against SEC Form D, LinkedIn and press, with a source link on every row. 4-person team, ~12 hours. Speed matters, but **every number shown must be traceable to a source.**

- Plan: [docs/PLAN.md](docs/PLAN.md) (job contract, timeline, scope)
- Your human's role brief: [docs/roles/](docs/roles/) (`kevin.md`, `data.md`, `extension.md`, `research.md`)

## Ownership: stay in your lane

| Path | Owner | Others may |
| --- | --- | --- |
| `backend/main.py`, `jobs.py`, `extract.py`, `verdicts.py`, `llm.py` | Kevin | read only |
| `demo/acme_ai_deck_FICTIONAL.pdf` | Kevin (test deck; Research may replace) | |
| `backend/sources/*` (`edgar.py`, `brightdata.py`, `cache.py`, `ground_truth.py`) | Data | read only |
| `backend/fixtures/` | Kevin (`job_*.json`), Data (`*_ground_truth.json`) | read only |
| `extension/` | Extension | read only |
| `demo/` | Research | read only |
| `docs/` | anyone (keep edits small) | |

Need a change in someone else's file? Ask in the team chat. Don't edit it.

## Contracts (don't change without telling the team)

- **API:** `POST /analyze` (FormData: `file` = PDF, or `text`) → `{job_id}`. `GET /jobs/{id}` → job. `GET /jobs/{id}?replay=1` → cached final. Statuses: `parsing → checking_sec → checking_linkedin → checking_press → ready | error`.
- **Job/check shape:** see `backend/fixtures/job_acme.json` (the reference fixture).
- **Ground truth:** `sources/ground_truth.get_ground_truth(company, domain, use_cache=True) -> {form_d, linkedin, press}`. Shape in `backend/fixtures/acme_ground_truth.json` and `docs/roles/data.md`. Return partial results; one source failing must not break the rest.

## Rules

- **Secrets:** never commit keys or promo codes (the repo is public). Use `backend/.env` (gitignored); add new variable names to `backend/.env.example`.
- **Verdicts and notes are computed in code (`verdicts.py`), never by the LLM.** The LLM only extracts claims (`extract.py`).
- **No invented data about real companies.** Fictional demo data uses "Acme AI" and `example.com` URLs, with `"fictional": true`.
- **LLM:** OpenAI-compatible client configured from `.env` (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`). Default: Nebius `openai/gpt-oss-120b`; fallback `deepseek-ai/DeepSeek-V4.1-Flash`. Use strict `json_schema` output.
- **SEC EDGAR:** send `User-Agent` from `SEC_USER_AGENT`; stay under 10 requests/sec.
- **Chrome MV3:** no remote scripts or CDNs, no inline `<script>`.
- **Git:** commit small and often to `main`; `git pull --rebase` before pushing. Never force-push. Commit with your personal GitHub identity (`git config user.email <id>+<login>@users.noreply.github.com`), not a work email.

## Running the backend

```bash
cd backend && cp .env.example .env   # fill keys
uv sync --python 3.12
uv run uvicorn main:app --reload --port 8000
```

`SIGNALENGINE_FAKE=1` replays the Acme fixture with realistic timing, so you can build the UI without keys.
