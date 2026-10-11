"""Data's enriched tables on OSO (pipeline/ builds them): LinkedIn and Crunchbase profiles that Bright Data's datasets
matched to SEC Form D filers, for a 1,000-startup universe plus the judges' and mentors' companies.

Both tables are small, so they're downloaded whole (OSO's async SQL API, OSO_API_KEY), cached for a day in
data/gt_cache/oso.json, and snapshotted in fixtures/ground_truth/oso.json as the offline backup.

A profile is only used when its own website is the company's domain: a name match alone put Legora next to a
2-person Chilean company (legora.cl). Universe rows must also be high-confidence matches.
"""

import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import httpx

log = logging.getLogger(__name__)
HERE = Path(__file__).parent.parent
CACHE = HERE / "data" / "gt_cache" / "oso.json"
SNAPSHOT = HERE / "fixtures" / "ground_truth" / "oso.json"
CACHE_HOURS = 24
URL = "https://api.oso.xyz/v1/async-sql"
SCHEMA = "javier_rs_organization_51391593.sec_edgar"
JUDGES = f"""SELECT company, domain, li_domain, cb_domain, sec_cik, linkedin_url, li_employees_on_linkedin, li_company_size,
  crunchbase_url, cb_disclosed_funding_usd, cb_largest_round_usd, cb_last_funding_type, cb_num_funding_rounds
  FROM {SCHEMA}.judges_companies"""
UNIVERSE = f"""SELECT company_name AS company, cik AS sec_cik, linkedin_url, li_website, li_match_confidence,
  li_employees_on_linkedin, li_company_size, crunchbase_url, cb_website, cb_match_confidence,
  cb_total_funding_usd AS cb_disclosed_funding_usd, cb_largest_round_usd, cb_last_funding_type, cb_num_funding_rounds
  FROM {SCHEMA}.startup_companies_enriched"""


def _query(sql: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {os.environ['OSO_API_KEY']}"}
    job = httpx.post(URL, headers=headers, json={"query": sql}, timeout=30).raise_for_status().json()
    deadline = time.time() + 60
    while job.get("status") not in ("completed", "failed", "canceled"):
        if time.time() > deadline:
            raise TimeoutError("OSO query took over 60s")
        time.sleep(1)
        job = httpx.get(URL, params={"id": job["id"]}, headers=headers, timeout=30).raise_for_status().json()
    if job["status"] != "completed":
        raise RuntimeError(f"OSO query {job['status']}")
    lines = [json.loads(line) for line in httpx.get(job["url"], timeout=60).text.splitlines() if line.strip()]
    cols, rows = lines[0], lines[1:]  # first line is the header
    return [dict(zip(cols, r)) for r in rows]


def _read(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def tables(refresh: bool = False) -> dict:
    """{"judges": [...], "universe": [...], "fetched_at"}: fresh cache → OSO → snapshot → empty."""
    cached = _read(CACHE)
    if cached and not refresh:
        age = datetime.now(timezone.utc) - datetime.fromisoformat(cached["fetched_at"])
        if age.total_seconds() < CACHE_HOURS * 3600:
            return cached
    if os.environ.get("OSO_API_KEY"):
        try:
            data = {"judges": _query(JUDGES), "universe": _query(UNIVERSE), "fetched_at": datetime.now(timezone.utc).isoformat()}
            CACHE.parent.mkdir(parents=True, exist_ok=True)
            CACHE.write_text(json.dumps(data))
            return data
        except Exception as e:  # OSO down must never break a lookup
            log.warning("OSO fetch failed: %s", e)
    return cached or _read(SNAPSHOT) or {"judges": [], "universe": [], "fetched_at": None}


def host(url_or_domain: str | None) -> str | None:
    if not url_or_domain:
        return None
    u = url_or_domain if "://" in url_or_domain else f"https://{url_or_domain}"
    h = (urlparse(u).hostname or "").lower()
    return h[4:] if h.startswith("www.") else h or None


def _cik(v) -> str | None:
    return str(int(v)) if v not in (None, "") and str(v).strip().isdigit() else None


def profiles(domain: str | None, cik: str | None = None) -> dict:
    """→ {"linkedin": {...} | None, "crunchbase": {...} | None} for a company, only where the profile's website is
    the company's domain. No domain → nothing (there's no way to confirm it's the same company)."""
    want = host(domain)
    out = {"linkedin": None, "crunchbase": None}
    if not want:
        return out
    data = tables()
    when = data.get("fetched_at")
    rows = [(r, "judges") for r in data["judges"]] + [(r, "universe") for r in data["universe"]]
    rows = [(r, t) for r, t in rows if host(r.get("domain") or r.get("li_website") or r.get("cb_website")) == want
            or (cik and _cik(r.get("sec_cik")) == _cik(cik))]
    for r, table in rows:
        li_site = r.get("li_domain") if table == "judges" else r.get("li_website")
        li_ok = host(li_site) == want and (table == "judges" or r.get("li_match_confidence") == "high")
        if li_ok and not out["linkedin"] and isinstance(r.get("li_employees_on_linkedin"), (int, float)):
            out["linkedin"] = {"employees": int(r["li_employees_on_linkedin"]), "company_size": r.get("li_company_size"),
                               "url": r.get("linkedin_url"), "fetched_at": when, "via": "brightdata", "through": "oso"}
        cb_site = r.get("cb_domain") if table == "judges" else r.get("cb_website")
        cb_ok = host(cb_site) == want and (table == "judges" or r.get("cb_match_confidence") == "high")
        if cb_ok and not out["crunchbase"] and r.get("crunchbase_url"):
            out["crunchbase"] = {"total_funding_usd": r.get("cb_disclosed_funding_usd"), "largest_round_usd": r.get("cb_largest_round_usd"),
                                 "last_funding_type": r.get("cb_last_funding_type"), "num_rounds": r.get("cb_num_funding_rounds"),
                                 "url": r["crunchbase_url"], "fetched_at": when, "via": "brightdata", "through": "oso"}
    return out
