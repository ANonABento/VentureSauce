# Role briefs

One page per person. Read yours plus [PLAN.md](../PLAN.md) (especially the job contract and timeline).

| Brief | Owns | First deliverable |
| --- | --- | --- |
| [kevin.md](kevin.md) | Backend, LLM extraction, verdicts, integration, demo | Fixture JSON pushed by hour 1 |
| [data.md](data.md) | EDGAR, Bright Data, MongoDB cache, demo ground truth | Form D lookup working by hour 3 |
| [extension.md](extension.md) | Chrome MV3 side panel | Truth table rendering the fixture by hour 3 |
| [research.md](research.md) | Interviews, testers, receipts, demo deck, pitch | 8 interviews logged by hour 4 |

## Repo layout (everyone sticks to this so merges don't collide)

```
backend/
  main.py              # Kevin: FastAPI app, /analyze, /jobs
  extract.py           # Kevin: PDF → text → LLM claims
  verdicts.py          # Kevin: claims × ground truth → checks
  sources/
    edgar.py           # Data
    brightdata.py      # Data
    cache.py           # Data: MongoDB
    ground_truth.py    # Data: get_ground_truth(company, domain)
  fixtures/
    job_acme.json   # Kevin (hour 1), Extension builds against it
    acme_ground_truth.json  # Data: fictional company
extension/             # Extension
demo/                  # Research: decks, receipts, pitch assets
docs/
```

## Shared rules

- Commit small and often to `main`; pull before you push. Only touch your own folders without asking.
- No API keys or promo codes in the repo (it's public). Use `backend/.env` (gitignored).
- Post blockers in the team chat immediately. Don't sit on one for more than 15 minutes.
- Everyone attends the hour 4 and hour 7 gates (15 minutes each).
