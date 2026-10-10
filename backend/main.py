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

import jobs

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
async def analyze(request: Request, file: UploadFile | None = File(None), text: str | None = Form(None)):
    """Send FormData with either `file` (PDF) or `text` (pasted deck/email text)."""
    _rate_limit(request)
    if not file and not (text and text.strip()):
        raise HTTPException(400, "send a PDF as `file` or pasted text as `text`")
    pdf_bytes = await file.read() if file else None
    job = jobs.new_job()
    task = asyncio.create_task(jobs.run(job, pdf_bytes, text, FAKE))
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
