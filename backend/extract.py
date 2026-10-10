"""Deck → page texts → company + verifiable claims (via the LLM)."""

import io
import re

import pdfplumber

from llm import chat_json

MAX_CHARS = 40_000  # plenty for a 20-slide deck; keeps latency predictable

SYSTEM = """Extract verifiable claims from a startup pitch deck or founder email.
claim_type: headcount | raised (total raised to date) | round_size (a single round) | customer | board.
claim_text: the EXACT words from the deck, copied verbatim, not paraphrased.
value: integer USD for money, integer for headcount, the person/company name for customer and board.
page: the [page N] the claim appears on, or null if there are no page markers.
Rules: one claim per customer and per board member. An LOI or pilot is NOT a customer: skip it. Advisors are not board.
Headcount = full-time employees only; do not add contractors. Skip vague or unverifiable claims (growth rates, ARR, 'hiring aggressively').
company.domain: the bare domain (e.g. acme.com), no protocol or www; null if not stated."""

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["company", "claims"],
    "properties": {
        "company": {
            "type": "object",
            "additionalProperties": False,
            "required": ["name", "domain"],
            "properties": {"name": {"type": "string"}, "domain": {"type": ["string", "null"]}},
        },
        "claims": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["claim_type", "claim_text", "value", "page"],
                "properties": {
                    "claim_type": {"type": "string", "enum": ["headcount", "raised", "round_size", "customer", "board"]},
                    "claim_text": {"type": "string"},
                    "value": {"type": ["integer", "string", "null"]},
                    "page": {"type": ["integer", "null"]},
                },
            },
        },
    },
}


def pdf_pages(pdf_bytes: bytes) -> list[str]:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        return [(p.extract_text() or "").strip() for p in pdf.pages]


def deck_text(pdf_bytes: bytes | None, text: str | None) -> str:
    if pdf_bytes:
        pages = pdf_pages(pdf_bytes)
        if not any(pages):
            raise ValueError("no text found in the PDF (image-only slides?); paste the text instead")
        body = "\n".join(f"[page {i}] {t}" for i, t in enumerate(pages, 1) if t)
    else:
        body = (text or "").strip()
    return body[:MAX_CHARS]


def clean_domain(domain: str | None) -> str | None:
    if not domain:
        return None
    d = re.sub(r"^https?://", "", domain.strip().lower())
    d = d.removeprefix("www.").split("/")[0]
    return d or None


def extract(pdf_bytes: bytes | None, text: str | None) -> dict:
    """Returns {"company": {name, domain}, "claims": [{claim_type, claim_text, value, page}]}."""
    out = chat_json(SYSTEM, deck_text(pdf_bytes, text), SCHEMA, "claims")
    out["company"]["domain"] = clean_domain(out["company"]["domain"])
    for c in out["claims"]:
        if c["claim_type"] in ("headcount", "raised", "round_size") and isinstance(c["value"], str):
            digits = re.sub(r"[^\d]", "", c["value"])
            c["value"] = int(digits) if digits else None
    claims = [c for c in out["claims"] if c["value"] not in (None, "")]
    # "We closed our $10M seed" often comes back as both raised and round_size; keep the round only.
    rounds = {(c["value"], c["claim_text"]) for c in claims if c["claim_type"] == "round_size"}
    out["claims"] = [c for c in claims if not (c["claim_type"] == "raised" and (c["value"], c["claim_text"]) in rounds)]
    return out
