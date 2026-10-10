"""STUB owned by Data: replace with the real EDGAR + Bright Data + Mongo version (see docs/roles/data.md).

Kevin's code only calls get_ground_truth(); keep the signature and return shape.
"""

import json
from pathlib import Path

_FIXTURES = Path(__file__).parent.parent / "fixtures"


def get_ground_truth(company: str, domain: str | None = None, use_cache: bool = True) -> dict:
    if company.strip().lower() in {"acme ai", "acme"}:
        return json.loads((_FIXTURES / "acme_ground_truth.json").read_text())
    return {"form_d": None, "linkedin": None, "press": []}
