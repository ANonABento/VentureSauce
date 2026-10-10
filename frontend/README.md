# VentureSauce panel (Next.js)

```bash
cd frontend
npm ci
NEXT_PUBLIC_API=http://localhost:8000 npm run dev   # backend: see backend/README.md
```

Open http://localhost:3000/panel (380–420px wide, like the Chrome side panel). `/panel?url=<page>` jumps to that
company if it's already in the inbox.

Screens (Research/Design/handoff.md, "Deal inbox (pivot)"):
- **Inbox**: drop strip (file or pasted email/notes), company list from `GET /companies`, link to the digest.
- **Company**: Filed toast with Change (`POST /items/{id}/move`), tabs Checks (contradiction cards + public-record
  rows from `/api/delta`) · Items (timeline + drop another) · Questions (Copy, Mark asked, Copy all).
- **Digest**: totals, brief player (`POST /digest/audio`), summary, per-company blocks, and the voice analyst
  ("Talk to your briefing": `/chat/stream` + `/tts`).

Data access lives in `lib/api.ts`. The old mocks in `lib/mock/` still back `/report/[slug]` and `/panel/states`.
