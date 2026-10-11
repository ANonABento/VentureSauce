"""Ground truth for a company: {form_d, linkedin, press, crunchbase}.

Data's pipeline tables on OSO first (sources/oso.py), then live SEC EDGAR and Bright Data lookups
(sources/minimal_live.py), cached, with saved snapshots as the offline backup.
"""

from sources import minimal_live

IS_STUB = False  # lookups are live (minimal); research.py and /health read this


def get_ground_truth(company: str, domain: str | None = None, use_cache: bool = True) -> dict:
    found = minimal_live.lookup(company, domain, use_cache)
    return {"form_d": found.get("form_d"), "linkedin": found.get("linkedin"), "press": found.get("press") or [],
            "crunchbase": found.get("crunchbase")}
