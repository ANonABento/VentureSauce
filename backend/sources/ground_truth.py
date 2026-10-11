"""Ground truth for a company: {form_d, linkedin, press}.

Data's real EDGAR + Bright Data + Mongo version replaces this file (see docs/roles/data.md); keep the signature and
return shape. Until then the fictional Acme AI comes from its fixture and every other company from
sources/minimal_live.py (live SEC EDGAR Form D + press via Bright Data, cached, with saved snapshots as a backup).
"""

import json
from pathlib import Path

from sources import minimal_live

_FIXTURES = Path(__file__).parent.parent / "fixtures"
IS_STUB = False  # lookups are live (minimal); research.py and /health read this


def get_ground_truth(company: str, domain: str | None = None, use_cache: bool = True) -> dict:
    if company.strip().lower() in {"acme ai", "acme"}:
        return json.loads((_FIXTURES / "acme_ground_truth.json").read_text())
    found = minimal_live.lookup(company, domain, use_cache)
    return {"form_d": found.get("form_d"), "linkedin": found.get("linkedin"), "press": found.get("press") or [],
            "crunchbase": found.get("crunchbase")}
