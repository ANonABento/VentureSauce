"""In-memory job store and the pipeline runners (fake and real)."""

import asyncio
import copy
import json
import uuid
from pathlib import Path

import extract
import verdicts
from sources.ground_truth import get_ground_truth

FIXTURES = Path(__file__).parent / "fixtures"

# Order the panel shows them in. Each check's source decides which step adds it.
STATUSES = ["parsing", "checking_sec", "checking_linkedin", "checking_press", "ready"]
STEP_FOR_SOURCE = {"form_d": "checking_sec", "linkedin": "checking_linkedin", "press": "checking_press"}

JOBS: dict[str, dict] = {}


def load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def new_job() -> dict:
    job_id = uuid.uuid4().hex[:12]
    job = {
        "job_id": job_id,
        "status": "parsing",
        "company": None,
        "checks": [],
        "brief_audio_url": None,
        "error": None,
    }
    JOBS[job_id] = job
    return job


async def run_fake(job: dict, step_seconds: float = 1.5) -> None:
    """Replays fixtures/job_acme.json step by step so the UI can be built before the real pipeline exists."""
    final = load_fixture("job_acme.json")
    await asyncio.sleep(step_seconds)
    job["company"] = final["company"]
    for status in STATUSES[1:-1]:
        job["status"] = status
        await asyncio.sleep(step_seconds)
        job["checks"] += [c for c in final["checks"] if STEP_FOR_SOURCE[c["source"]] == status]
    job["status"] = "ready"


async def run_real(job: dict, pdf_bytes: bytes | None, text: str | None) -> None:
    extracted = await asyncio.to_thread(extract.extract, pdf_bytes, text)
    company, claims = extracted["company"], extracted["claims"]
    job["company"] = {**company, "cik": None}

    job["status"] = "checking_sec"
    gt = await asyncio.to_thread(get_ground_truth, company["name"], company["domain"])
    if gt.get("fictional"):
        job["company"]["fictional"] = True
    if gt.get("form_d"):
        job["company"]["cik"] = gt["form_d"].get("cik")
        job["company"]["form_d_entity"] = gt["form_d"].get("entity_name")  # show which filer we matched
    job["checks"] += verdicts.form_d_checks(claims, gt.get("form_d"), company["name"])

    job["status"] = "checking_linkedin"
    job["checks"] += verdicts.headcount_checks(claims, gt.get("linkedin"))

    job["status"] = "checking_press"
    job["checks"] += verdicts.press_checks(claims, gt.get("press") or [])

    job["status"] = "ready"


async def run(job: dict, pdf_bytes: bytes | None, text: str | None, fake: bool) -> None:
    try:
        if fake:
            await run_fake(job)
        else:
            await run_real(job, pdf_bytes, text)
    except Exception as e:  # surface to the panel instead of a silent stuck job
        job["status"] = "error"
        job["error"] = str(e)


def replay(job_id: str) -> dict | None:
    """Cached final result for the demo fallback. Mongo-backed once Data's cache lands."""
    if job_id in JOBS and JOBS[job_id]["status"] == "ready":
        return JOBS[job_id]
    return {**copy.deepcopy(load_fixture("job_acme.json")), "job_id": job_id}
