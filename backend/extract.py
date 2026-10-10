"""Item text → company + claims (via the LLM)."""

import re

from llm import chat_json

MAX_CHARS = 40_000  # plenty for a 20-slide deck; keeps latency predictable

SYSTEM = """You read material an investor received about a startup: a pitch deck, founder email, slide screenshot or the
investor's own call notes. Extract the factual claims about the company.
claim_type:
  headcount (full-time team size), raised (total raised to date), round_size (a single round),
  customer (a named customer), board (a named board member),
  metric (any other number the company states about itself: ARR, revenue, MRR, growth rate, burn, runway, valuation,
  number of customers, retention, etc.).
metric: for claim_type=metric, a short lowercase name ("arr", "revenue", "mom growth", "valuation", "customers", "runway");
  null otherwise. Use the same name for the same concept every time.
claim_text: the EXACT words from the input, copied verbatim, not paraphrased.
value: integer USD for money, integer for counts, a number for percentages (20 for 20%), integer months for runway,
  the person/company name for customer and board.
page: the [page N] or [slide N] marker the claim appears under, or null.
Rules: one claim per customer and per board member. An LOI or pilot is NOT a customer: skip it. Advisors are not board.
Headcount = full-time employees only; do not add contractors. Skip vague claims with no number or name ("hiring aggressively").
company.name: the startup being discussed (not the investor's firm), or "" if the input doesn't name it. Ignore
  footers, watermarks and template text ("Confidential", "Synthetic demo deck"). company.domain: bare domain or null.
item_date: the date this material was written or sent (YYYY-MM-DD) if stated, else null."""

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["company", "item_date", "claims"],
    "properties": {
        "company": {
            "type": "object",
            "additionalProperties": False,
            "required": ["name", "domain"],
            "properties": {"name": {"type": "string"}, "domain": {"type": ["string", "null"]}},
        },
        "item_date": {"type": ["string", "null"]},
        "claims": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["claim_type", "metric", "claim_text", "value", "page"],
                "properties": {
                    "claim_type": {"type": "string",
                                   "enum": ["headcount", "raised", "round_size", "customer", "board", "metric"]},
                    "metric": {"type": ["string", "null"]},
                    "claim_text": {"type": "string"},
                    "value": {"type": ["number", "string", "null"]},
                    "page": {"type": ["integer", "null"]},
                },
            },
        },
    },
}

NUMERIC = ("headcount", "raised", "round_size")


def clean_domain(domain: str | None) -> str | None:
    if not domain:
        return None
    d = re.sub(r"^https?://", "", domain.strip().lower())
    d = d.removeprefix("www.").split("/")[0]
    return d or None


def extract(text: str, kind: str = "text") -> dict:
    """Returns {"company": {name, domain}, "item_date", "claims": [{claim_type, metric, claim_text, value, page}]}."""
    out = chat_json(SYSTEM, f"Input type: {kind}\n\n{text[:MAX_CHARS]}", SCHEMA, "claims")
    out["company"]["domain"] = clean_domain(out["company"]["domain"])
    claims = []
    for c in out["claims"]:
        if c["claim_type"] in NUMERIC and isinstance(c["value"], str):
            digits = re.sub(r"[^\d]", "", c["value"])
            c["value"] = int(digits) if digits else None
        if isinstance(c["value"], float) and c["value"].is_integer():
            c["value"] = int(c["value"])
        if c["claim_type"] == "metric":
            c["metric"] = (c["metric"] or "other").strip().lower()
        if c["value"] not in (None, ""):
            claims.append(c)
    # "We closed our $10M seed" often comes back as both raised and round_size; keep the round only.
    rounds = {(c["value"], c["claim_text"]) for c in claims if c["claim_type"] == "round_size"}
    out["claims"] = [c for c in claims if not (c["claim_type"] == "raised" and (c["value"], c["claim_text"]) in rounds)]
    return out
