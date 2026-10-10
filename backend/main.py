import asyncio
import json
import os
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import delta
import jobs
import store

load_dotenv()
FAKE = os.getenv("VENTURESAUCE_FAKE", "1") == "1"
HERE = Path(__file__).parent
SAMPLE_DECK = HERE.parent / "demo" / "acme_ai_deck_FICTIONAL.pdf"
FEEDBACK_LOG = HERE / "data" / "feedback.jsonl"

app = FastAPI(title="VentureSauce")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(chrome-extension://.*|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?)$",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=HERE / "static"), name="static")

# Keep references so background tasks aren't garbage-collected mid-run.
_tasks: set[asyncio.Task] = set()


@app.get("/health")
def health():
    return {"ok": True, "fake": FAKE}


# Public tester links run on our LLM credits: cap decks per client IP.
RATE_LIMIT = int(os.getenv("ANALYZE_PER_HOUR", "20"))
_hits: dict[str, deque] = defaultdict(deque)


def _rate_limit(request: Request) -> None:
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    now, q = time.time(), _hits[ip]
    while q and now - q[0] > 3600:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        raise HTTPException(429, "Too many decks from this address; try again in an hour.")
    q.append(now)


@app.post("/analyze")
async def analyze(request: Request, file: UploadFile | None = File(None), text: str | None = Form(None),
                  kind: str | None = Form(None), company_id: str | None = Form(None)):
    """FormData: `file` (PDF, scanned PDF, PPTX, image, .eml, .txt) or `text` (pasted email/notes/deck text).
    Optional `kind` for pasted text (`email` | `notes`) and `company_id` to file it under a known company."""
    _rate_limit(request)
    if not file and not (text and text.strip()):
        raise HTTPException(400, "send a file as `file` or pasted text as `text`")
    upload = {"filename": file.filename, "data": await file.read()} if file else None
    if kind not in (None, "", "email", "notes", "text"):
        raise HTTPException(400, "kind must be email, notes or text")
    job = jobs.new_job()
    task = asyncio.create_task(jobs.run(job, upload, text, FAKE, kind or None, company_id or None))
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)
    return {"job_id": job["job_id"]}


@app.get("/jobs/{job_id}")
def get_job(job_id: str, replay: bool = False):
    if replay:
        return jobs.replay(job_id)
    job = jobs.JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "unknown job")
    return job


@app.get("/companies")
def companies():
    """Deal inbox: every company with its item count, most recently updated first."""
    return [{k: c.get(k) for k in ("id", "name", "domain", "updated_at", "item_count")} for c in store.list_companies()]


@app.get("/companies/{company_id}")
def company(company_id: str):
    """The company's latest view: items, checks across all items, contradictions, questions."""
    co = store.get_company(company_id)
    if not co:
        raise HTTPException(404, "unknown company")
    return co.get("view") or {"company": {k: co.get(k) for k in ("id", "name", "domain")}, "items": [], "checks": [], "questions": []}


@app.get("/api/delta")
def delta_report(company_id: str | None = None, company: str | None = None, url: str | None = None):
    """The frontend's DeltaReport (frontend/lib/types.ts) for a company in the inbox, found by id, page URL or name.
    Extra fields: questions, items, company.id. 404 = not in the inbox yet (drop something about it first)."""
    co = store.find_company(company_id=company_id, name=company, url=url)
    if not co or not co.get("view"):
        raise HTTPException(404, "No items for this company yet. Drop a deck, email or notes about it first.")
    return delta.to_report(co["view"])


@app.delete("/companies/{company_id}")
def delete_company(company_id: str):
    """Privacy: forget a company and everything filed under it."""
    if not store.delete_company(company_id):
        raise HTTPException(404, "unknown company")
    return {"ok": True}


# Tester page: same API the extension uses, served at / so remote testers need only a URL.
@app.get("/", include_in_schema=False)
def tester_page():
    return FileResponse(HERE / "static" / "index.html")


@app.get("/sample/acme.pdf", include_in_schema=False)
def sample_deck():
    return FileResponse(SAMPLE_DECK, media_type="application/pdf")


class Feedback(BaseModel):
    job_id: str | None = None
    role: str = Field("", max_length=120)
    text: str = Field(..., min_length=1, max_length=4000)


@app.post("/feedback")
def feedback(fb: Feedback):
    """Tester comments for Research's receipts log (backend/data/feedback.jsonl, gitignored)."""
    FEEDBACK_LOG.parent.mkdir(exist_ok=True)
    job = jobs.JOBS.get(fb.job_id or "")
    entry = {**fb.model_dump(), "at": datetime.now(timezone.utc).isoformat(),
             "company": ((job or {}).get("company") or {}).get("name")}
    with FEEDBACK_LOG.open("a") as f:
        f.write(json.dumps(entry) + "\n")
    return {"ok": True}
