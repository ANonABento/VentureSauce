"""Daily / weekly digest across the deal inbox, plus a short two-host audio briefing (Fish Audio).

"What came in since X, what conflicts, what to ask": built from each touched company's saved view.
"""

import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

import analysis
import delta
import store
from llm import chat_json

log = logging.getLogger(__name__)
AUDIO_DIR = Path(__file__).parent / "data" / "audio"


def since_for(period: str) -> str:
    days = {"day": 1, "week": 7}.get(period, 1)
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def build(period: str = "day", since: str | None = None) -> dict:
    since = since or since_for(period)
    new_items = store.items_since(since)
    by_company: dict[str, list[dict]] = {}
    for it in new_items:
        by_company.setdefault(it["company_id"], []).append(it)

    companies = []
    for cid, items in by_company.items():
        co = store.get_company(cid)
        if not co:
            continue
        view = co.get("view") or {}
        report = delta.to_report(view) if view else {"rows": [], "headline": ""}
        flagged = [r for r in report["rows"] if r["status"] == "discrepancy"]
        companies.append({
            "id": cid,
            "name": co["name"],
            "fictional": (view.get("company") or {}).get("fictional", False),
            "new_items": [analysis.item_summary(i) for i in items],
            "headline": report["headline"],
            "discrepancies": [{"signal": r["signal"], "short": r.get("summaryShort"), "summary": r["summary"]} for r in flagged],
            "contradictions": sum("across your sources" in r["signal"] for r in flagged),
            "questions": (view.get("questions") or [])[:3],
        })
    companies.sort(key=lambda c: (-len(c["discrepancies"]), c["name"]))
    digest = {
        "period": period,
        "since": since,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "totals": {"companies": len(companies), "items": len(new_items),
                   "discrepancies": sum(len(c["discrepancies"]) for c in companies),
                   "contradictions": sum(c["contradictions"] for c in companies)},
        "companies": companies,
    }
    digest.update(write_script(digest))
    return digest


SCRIPT_SYSTEM = """You write a short audio briefing for a VC investor to hear on the walk to the office, like a
two-host podcast. Hosts: Sam (speaker 0) and Riley (speaker 1). Warm, brisk, specific; no hype, no filler.
- 60 to 90 seconds when read aloud (150 to 220 words total).
- Open with one line on what came in. Then the companies with the most discrepancies first: the one or two most
  important discrepancies each (say exact numbers and which source said what), then the single best question to ask.
- Contradictions between the investor's own sources are the most interesting thing; lead with them.
- Use ONLY numbers that appear in the input. Never calculate new numbers, differences or percentages.
- Never say a founder lied and avoid "red flag"; say numbers "don't line up" or "differ". Mention it if a company is fictional.
- Write numbers the way they're spoken ("three point six million dollars"). No markdown, no stage directions.
- script: alternating turns, each line starting with "S:" (Sam) or "R:" (Riley).
- summary: 2 to 3 plain sentences for the screen."""

SCRIPT_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["summary", "script"],
                 "properties": {"summary": {"type": "string"}, "script": {"type": "string"}}}


def write_script(digest: dict) -> dict:
    if not digest["companies"]:
        return {"summary": "Nothing new came in during this period.",
                "script": "S: Quiet one today. Nothing new landed in your inbox, so enjoy the walk."}
    lines = [f"Period: last {digest['period']}. Totals: {digest['totals']}"]
    for c in digest["companies"]:
        lines.append(f"\nCompany: {c['name']}{' (FICTIONAL demo company)' if c['fictional'] else ''}")
        lines.append("New items: " + ", ".join(f"{i['kind_name']} ({i['label']})" for i in c["new_items"]))
        lines += [f"- {d['signal']}: {d['summary']}" for d in c["discrepancies"][:4]]
        lines += [f"? {q['question']}" for q in c["questions"][:2]]
    try:
        return chat_json(SCRIPT_SYSTEM, "\n".join(lines), SCRIPT_SCHEMA, "briefing")
    except Exception as e:
        log.warning("digest script failed: %s", e)
        parts = [f"S: {len(digest['companies'])} companies had new material."]
        for c in digest["companies"][:3]:
            parts.append(f"R: {c['name']}: {c['headline']}")
            if c["questions"]:
                parts.append(f"S: Ask them: {c['questions'][0]['question']}")
        return {"summary": " ".join(p[3:] for p in parts), "script": "\n".join(parts)}


def _fish_text(script: str, voices: list[str]) -> tuple[str, str | list[str] | None]:
    """Two voices → Fish multi-speaker tags; one or none → plain narration."""
    turns = [(m.group(1), m.group(2).strip()) for m in re.finditer(r"^([SR]):\s*(.+)$", script, re.M)]
    if not turns:
        return script, voices[0] if voices else None
    if len(voices) >= 2:
        return "".join(f"<|speaker:{0 if who == 'S' else 1}|>{text}" for who, text in turns), voices[:2]
    return " ".join(text for _, text in turns), voices[0] if voices else None


def synthesize(script: str) -> str:
    """Script → mp3 under data/audio; returns its file name. Raises if Fish Audio isn't configured or fails."""
    key = os.getenv("FISH_API_KEY")
    if not key:
        raise RuntimeError("FISH_API_KEY is not set")
    voices = [v.strip() for v in os.getenv("FISH_VOICE_IDS", "").split(",") if v.strip()]
    text, reference = _fish_text(script, voices)
    body = {"text": text, "format": "mp3", "mp3_bitrate": 128, "latency": "normal", "normalize": True}
    if reference:
        body["reference_id"] = reference
    r = httpx.post("https://api.fish.audio/v1/tts", json=body, timeout=180,
                   headers={"Authorization": f"Bearer {key}", "model": os.getenv("FISH_MODEL", "s2.1-pro")})
    if r.status_code != 200:
        raise RuntimeError(f"Fish Audio {r.status_code}: {r.text[:200]}")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    name = f"digest-{uuid.uuid4().hex[:10]}.mp3"
    (AUDIO_DIR / name).write_bytes(r.content)
    return name
