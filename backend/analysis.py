"""Company view: all of a company's items → merged claims → public-record checks + cross-source contradictions + questions."""

import logging

import verdicts
from llm import chat_json

log = logging.getLogger(__name__)

KIND_NAMES = {"pdf": "Deck", "pdf_scanned": "Deck", "slides": "Slides", "image": "Screenshot",
              "email": "Email", "notes": "Call notes", "text": "Note"}
CONTRADICTION_TOLERANCE = 0.10


def item_name(item: dict) -> str:
    return KIND_NAMES.get(item["kind"], "Item")


def item_day(item: dict) -> str:
    return (item.get("item_date") or item["received_at"])[:10]


def item_label(item: dict) -> str:
    """'Deck · acme.pdf' for files; just 'Email' / 'Call notes' for pasted text."""
    label = item["label"]
    if label.startswith("Pasted") or label in KIND_NAMES.values():
        return item_name(item)
    return f"{item_name(item)} · {label}"


def all_claims(items: list[dict]) -> list[dict]:
    """Every claim, tagged with the item it came from (oldest item first)."""
    out = []
    for it in items:
        for c in it["claims"]:
            out.append({**c, "item_id": it["id"], "item_kind": it["kind"], "item_day": item_day(it),
                        "item_label": item_label(it)})
    return out


def merged_claims(claims: list[dict]) -> list[dict]:
    """What to check against public records: the latest headcount/raised, every distinct round, person and customer."""
    latest: dict[str, dict] = {}
    seen, out = set(), []
    for c in claims:
        if c["claim_type"] in ("headcount", "raised"):
            latest[c["claim_type"]] = c  # items are oldest-first, so the last one wins
        elif c["claim_type"] in ("round_size", "customer", "board"):
            key = (c["claim_type"], str(c["value"]).lower())
            if key not in seen:
                seen.add(key)
                out.append(c)
    return list(latest.values()) + out


def _group_key(c: dict) -> str | None:
    if c["claim_type"] in ("headcount", "raised"):
        return c["claim_type"]
    if c["claim_type"] == "metric" and isinstance(c["value"], (int, float)):
        return f"metric:{c['metric']}"
    return None


def contradictions(claims: list[dict]) -> list[dict]:
    """Same fact, different numbers, in different items the user dropped in."""
    groups: dict[str, list[dict]] = {}
    for c in claims:
        k = _group_key(c)
        if k and isinstance(c["value"], (int, float)):
            groups.setdefault(k, []).append(c)
    out = []
    for key, cs in groups.items():
        if len({c["item_id"] for c in cs}) < 2:
            continue
        # The most different pair of values that come from DIFFERENT items.
        pairs = [(a, b) for a in cs for b in cs if a["item_id"] != b["item_id"] and a["value"] < b["value"]]
        if not pairs:
            continue
        lo, hi = max(pairs, key=lambda p: (p[1]["value"] - p[0]["value"]) / abs(p[1]["value"]))
        if (hi["value"] - lo["value"]) / abs(hi["value"]) <= CONTRADICTION_TOLERANCE:
            continue
        newest = cs[-1]
        other = lo if newest is hi else hi
        unit = "usd" if key in ("raised",) or key.split(":")[-1] in ("arr", "revenue", "mrr", "valuation", "burn") else None
        fmt = (lambda v: verdicts.usd(v)) if unit == "usd" else (lambda v: f"{v:,}" if isinstance(v, int) else f"{v:g}")
        said = "; ".join(f"{c['item_label']} ({c['item_day']}) says {fmt(c['value'])}" for c in cs)
        what = key.split(":")[-1] if key.startswith("metric:") else key
        out.append(verdicts._check(
            newest, claim_type=newest["claim_type"], unit=unit, observed_value=other["value"],
            source="your_sources", via="internal", source_date=newest["item_day"],
            verdict="gap", label="Your sources disagree", confidence="high",
            values=[{"value": c["value"], "item_label": c["item_label"], "item_day": c["item_day"],
                     "claim_text": c["claim_text"], "page": c.get("page")} for c in cs],
            note=f"{what.capitalize()}: {said}. Confirm which is current.",
        ))
    return out


QUESTION_SYSTEM = """You help a VC investor prepare for their next founder call. Given issues found while checking the
founder's claims, write sharp, specific, non-accusatory questions the investor should ask.
- Under 30 words each. Quote the exact numbers and say which source said what, exactly as given; never mix up sources.
- Address the founder directly ("Can you share…", "Which is current…"). Never ask why WE couldn't find something:
  turn a missing public record into a request for the document or reference.
- Refer to people by name, never with he/she pronouns.
- Keep the issues' order (most important first); merge issues about the same fact; at most 8 questions.
- "why": 3 to 8 words naming the issue (e.g. "Sources disagree on ARR")."""

QUESTION_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["questions"],
    "properties": {"questions": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["question", "why"],
        "properties": {"question": {"type": "string"}, "why": {"type": "string"}}}}},
}


def _issues(checks: list[dict], claims: list[dict]) -> list[str]:
    rank = {"your_sources": 0}  # contradictions between the user's own sources first, then gaps, then unverifiable
    flagged = sorted((c for c in checks if c["verdict"] in ("gap", "unverifiable")),
                     key=lambda c: (rank.get(c["source"], 1), c["verdict"] != "gap"))
    issues = [f"[{c['label']}] {c['note']} (claim: \"{c['claim_text']}\", from {c.get('item_label') or 'the deck'})"
              for c in flagged]
    seen = set()
    for c in claims:  # metrics (ARR, growth…) have no public source: always worth a question
        if c["claim_type"] == "metric" and c["metric"] not in seen:
            seen.add(c["metric"])
            issues.append(f"[No public source] {c['metric']}: \"{c['claim_text']}\" ({c['item_label']})")
    return issues


def questions(company: str, checks: list[dict], claims: list[dict]) -> list[dict]:
    issues = _issues(checks, claims)
    if not issues:
        return []
    try:
        out = chat_json(QUESTION_SYSTEM, f"Company: {company}\nIssues:\n" + "\n".join(f"- {i}" for i in issues[:20]),
                        QUESTION_SCHEMA, "questions")
        return out["questions"][:8]
    except Exception as e:  # never lose the view over the questions
        log.warning("question generation failed: %s", e)
        return [{"question": f"Can you walk me through this? {i.split('] ', 1)[-1]}", "why": i.split("]")[0].strip("[")}
                for i in issues[:8]]


def item_summary(item: dict) -> dict:
    return {"id": item["id"], "kind": item["kind"], "kind_name": item_name(item), "label": item["label"],
            "item_date": item.get("item_date"), "received_at": item["received_at"], "claim_count": len(item["claims"])}
