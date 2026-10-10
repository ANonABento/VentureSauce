import asyncio
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import jobs

load_dotenv()
FAKE = os.getenv("VENTURESAUCE_FAKE", "1") == "1"

app = FastAPI(title="VentureSauce")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(chrome-extension://.*|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?)$",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep references so background tasks aren't garbage-collected mid-run.
_tasks: set[asyncio.Task] = set()


@app.get("/health")
def health():
    return {"ok": True, "fake": FAKE}


@app.post("/analyze")
async def analyze(file: UploadFile | None = File(None), text: str | None = Form(None)):
    """Send FormData with either `file` (PDF) or `text` (pasted deck/email text)."""
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
