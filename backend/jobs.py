"""In-memory job store and the pipeline runners (fake and real).

A job = one item dropped in. The real pipeline files it under its company and returns the
company's full view (checks across ALL of the company's items, contradictions, questions).
"""

import asyncio
import copy
import json
import uuid
from pathlib import Path

import analysis
import extract
import ingest
import store
import verdicts
from sources import minimal_live
from sources import ground_truth
from sources.ground_truth import get_ground_truth

FIXTURES = Path(__file__).parent / "fixtures"

# Order the panel shows them in. Each check's source decides which step adds it.
STATUSES = ["parsing", "checking_sec", "checking_linkedin", "checking_press", "comparing_sources", "ready"]
STEP_FOR_SOURCE = {"form_d": "checking_sec", "linkedin": "checking_linkedin", "press": "checking_press", "crunchbase": "checking_press",
                   "your_sources": "comparing_sources"}

JOBS: dict[str, dict] = {}


def load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def new_job() -> dict:
    job_id = uuid.uuid4().hex[:12]
    job = {
        "job_id": job_id,
        "status": "parsing",
        "company_id": None,
        "item_id": None,
        "company": None,
        "items": [],
        "checks": [],
        "questions": [],
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
        job["checks"] += [c for c in final["checks"] if STEP_FOR_SOURCE.get(c["source"]) == status]
    job["questions"] = final.get("questions", [])
    job["items"] = final.get("items", [])
    job["status"] = "ready"


def company_view(company_id: str, gt: dict | None = None) -> dict:
    """Recompute checks over every item the company has; snapshot it on the company for GET /companies/{id}."""
    co = store.get_company(company_id)
    items = store.items_for(company_id)
    claims = analysis.all_claims(items)
    checkable = analysis.merged_claims(claims)
    known = minimal_live.KNOWN_DOMAINS.get(minimal_live.slug(co["name"]))
    if not co.get("domain") and known:  # the panel finds a company from the page URL by its domain; never guessed
        co["domain"] = known
        store.update_company(company_id, domain=known)
    gt = gt if gt is not None else get_ground_truth(co["name"], co.get("domain"))
    checks =(verdicts.form_d_checks(checkable, gt.get("form_d"), co["name"])
              + verdicts.headcount_checks(checkable, gt.get("linkedin"))
              + verdicts.press_checks(checkable, gt.get("press") or [])
              + verdicts.crunchbase_checks(checkable, gt.get("crunchbase"))
              + analysis.contradictions(claims))
    checks = _honest_unverifiable(checks, gt)
    view = {"company": _company_header(co, gt), "items": [analysis.item_summary(i) for i in items],
            "checks": checks, "claims": claims}
    return view


# Bump when check logic or wording changes: saved views from older code are recomputed when next read.
CHECKS_VERSION = 11


def checked_marker() -> dict:
    """What a saved view was computed with. A different marker (new code, or Data's live sources replacing the
    stub) means the view is stale."""
    return {"version": CHECKS_VERSION, "sources": "stub" if getattr(ground_truth, "IS_STUB", False) else "live"}


def refresh(company_id: str, questions: bool | None = None) -> dict | None:
    """Recompute a company's saved view from its items. Founder questions are regenerated (an LLM call) when the
    view is stale (new check code or new sources) or when asked; otherwise the old ones are kept. Returns the view."""
    co = store.get_company(company_id)
    if not co:
        return None
    old = co.get("view") or {}
    if not store.items_for(company_id):
        return old or None
    view = company_view(company_id)
    if questions is None:
        questions = old.get("checked") != checked_marker() or not old.get("questions")
    qs = analysis.questions(co["name"], view["checks"], view["claims"]) if questions else old.get("questions", [])
    saved = {"company": view["company"], "items": view["items"], "checks": view["checks"], "questions": qs,
             "checked": checked_marker()}
    store.update_company(company_id, view=saved)
    return saved


def fresh_view(company_id: str) -> dict | None:
    """The saved view, recomputed first if it was computed by older code or against other sources."""
    co = store.get_company(company_id)
    if not co:
        return None
    view = co.get("view") or {}
    if view and view.get("checked") == checked_marker():
        return view
    return refresh(company_id)


def refresh_stale() -> int:
    """Bring every company's saved view up to date (the inbox list, the digest). Returns how many were recomputed."""
    n = 0
    for co in store.list_companies():
        if (co.get("view") or {}).get("checked") != checked_marker() and store.items_for(co["id"]):
            refresh(co["id"])
            n += 1
    return n


NOT_CONNECTED = "Public records aren't connected in this build yet, so this wasn't checked."


def _honest_unverifiable(checks: list[dict], gt: dict) -> list[dict]:
    """While sources/ground_truth is the stub, "No Form D found" would be a false statement about a real company:
    say the lookup didn't run instead. Then drop repeated identical "couldn't verify" rows (e.g. two rounds, no data)."""
    stub = getattr(ground_truth, "IS_STUB", False) and not gt.get("fictional")
    out, seen = [], set()
    for c in checks:
        if c["verdict"] == "unverifiable" and c["source"] != "your_sources":
            if stub:
                c = {**c, "note": NOT_CONNECTED, "confidence": "low", "not_checked": True}
            key = (c["source"], c["claim_type"], c["note"])
            if key in seen:
                continue
            seen.add(key)
        out.append(c)
    return out


def _company_header(co: dict, gt: dict) -> dict:
    header = {"id": co["id"], "name": co["name"], "domain": co.get("domain"), "cik": None}
    if gt.get("fictional"):
        header["fictional"] = True
    if gt.get("form_d"):
        header["cik"] = gt["form_d"].get("cik")
        header["form_d_entity"] = gt["form_d"].get("entity_name")  # show which filer we matched
    return header


async def run_real(job: dict, upload: dict | None, text: str | None, kind: str | None, company_id: str | None) -> None:
    # 1. Any input → text → claims → filed under a company.
    item = await asyncio.to_thread(ingest.to_text, upload and upload["filename"], upload and upload["data"], text, kind)
    extracted = await asyncio.to_thread(extract.extract, item["text"], item["kind"])
    # The name the company goes by ("Daytona"), not its legal one ("Daytona Platforms Inc."), so the inbox reads well
    # and a deck and an email under the two names land on one company.
    name = extracted["company"]["name"]
    co = store.resolve_company(minimal_live.common_name(name) if name else name, extracted["company"]["domain"], company_id)
    saved = store.add_item(co["id"], item["kind"], item["label"], extracted["item_date"], extracted["claims"])
    job.update(company_id=co["id"], item_id=saved["id"], company={"id": co["id"], "name": co["name"], "domain": co.get("domain")})

    # 2. Public records (rows appear step by step for the live UI), then the user's own other sources.
    job["status"] = "checking_sec"
    gt = await asyncio.to_thread(get_ground_truth, co["name"], co.get("domain"))
    view = await asyncio.to_thread(company_view, co["id"], gt)
    job["company"], job["items"] = view["company"], view["items"]
    for status in STATUSES[1:-1]:
        job["status"] = status
        job["checks"] += [c for c in view["checks"] if STEP_FOR_SOURCE[c["source"]] == status]
        await asyncio.sleep(0.15)  # lets the panel show each step land

    # 3. Questions for the founder, from every gap, contradiction and unverifiable metric.
    job["questions"] = await asyncio.to_thread(analysis.questions, co["name"], view["checks"], view["claims"])
    store.update_company(co["id"], view={**{k: job[k] for k in ("company", "items", "checks", "questions")},
                                         "checked": checked_marker()})
    job["status"] = "ready"


async def run(job: dict, upload: dict | None, text: str | None, fake: bool,
              kind: str | None = None, company_id: str | None = None) -> None:
    try:
        if fake:
            await run_fake(job)
        else:
            await run_real(job, upload, text, kind, company_id)
    except Exception as e:  # surface to the panel instead of a silent stuck job
        job["status"] = "error"
        job["error"] = str(e)


def replay(job_id: str, fake: bool = False) -> dict | None:
    """Cached final result for the demo fallback: the job, else its company's saved view. Unknown jobs → None (404);
    only fake mode falls back to the Acme fixture, so real data never gets the fixture's numbers."""
    job = JOBS.get(job_id)
    if job and job["status"] == "ready":
        return job
    if job and job.get("company_id"):
        co = store.get_company(job["company_id"])
        if co and co.get("view"):
            return {**job, **co["view"], "status": "ready", "error": None}
    if fake:
        return {**copy.deepcopy(load_fixture("job_acme.json")), "job_id": job_id}
    return None
