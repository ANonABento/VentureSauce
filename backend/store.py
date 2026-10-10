"""Company memory: companies → items → claims. A JSON file for now (survives restarts, works offline on demo day).

Only extracted claims and metadata are stored; raw files and full text are not (legal-and-compliance.md).
"""

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

PATH = Path(os.getenv("STORE_PATH", Path(__file__).parent / "data" / "store.json"))
_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load() -> dict:
    if PATH.exists():
        return json.loads(PATH.read_text())
    return {"companies": {}, "items": {}}


def _save(db: dict) -> None:
    PATH.parent.mkdir(exist_ok=True)
    tmp = PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(db, indent=1))
    tmp.replace(PATH)


def _key(name: str) -> str:
    n = re.sub(r"[^a-z0-9 ]", "", name.lower())
    n = re.sub(r"\b(inc|llc|ltd|corp|co|the|ai|labs|hq)\b", "", n)
    return " ".join(n.split())


def resolve_company(name: str, domain: str | None, company_id: str | None = None) -> dict:
    """The explicit company_id wins; else match on domain, then on normalized name; else create."""
    with _lock:
        db = _load()
        cos = db["companies"]
        co = cos.get(company_id) if company_id else None
        if not co and domain:
            co = next((c for c in cos.values() if c.get("domain") == domain), None)
        if not co and not (name or "").strip() and not domain:
            co = next(iter(sorted(cos.values(), key=lambda c: c.get("updated_at", ""), reverse=True)), None)  # unnamed item: most recent company
        if not co and name and _key(name):
            co = next((c for c in cos.values() if _key(c["name"]) == _key(name)), None)
        if not co:
            co = {"id": uuid.uuid4().hex[:10], "name": name or "Unknown company", "domain": domain, "created_at": _now()}
            cos[co["id"]] = co
        elif domain and not co.get("domain"):
            co["domain"] = domain
        co["updated_at"] = _now()
        _save(db)
        return dict(co)


def add_item(company_id: str, kind: str, label: str, item_date: str | None, claims: list[dict]) -> dict:
    with _lock:
        db = _load()
        item = {"id": uuid.uuid4().hex[:10], "company_id": company_id, "kind": kind, "label": label,
                "item_date": item_date, "received_at": _now(), "claims": claims}
        db["items"][item["id"]] = item
        db["companies"][company_id]["updated_at"] = item["received_at"]
        _save(db)
        return item


def update_company(company_id: str, **fields) -> None:
    with _lock:
        db = _load()
        db["companies"][company_id].update(fields)
        _save(db)


def get_company(company_id: str) -> dict | None:
    return _load()["companies"].get(company_id)


def list_companies() -> list[dict]:
    db = _load()
    counts: dict[str, int] = {}
    for it in db["items"].values():
        counts[it["company_id"]] = counts.get(it["company_id"], 0) + 1
    cos = [{**c, "item_count": counts.get(c["id"], 0)} for c in db["companies"].values()]
    return sorted(cos, key=lambda c: c.get("updated_at", ""), reverse=True)


def items_for(company_id: str) -> list[dict]:
    items = [i for i in _load()["items"].values() if i["company_id"] == company_id]
    return sorted(items, key=lambda i: i["received_at"])


def items_since(since_iso: str) -> list[dict]:
    return sorted((i for i in _load()["items"].values() if i["received_at"] >= since_iso), key=lambda i: i["received_at"])


def delete_company(company_id: str) -> bool:
    with _lock:
        db = _load()
        if not db["companies"].pop(company_id, None):
            return False
        db["items"] = {k: v for k, v in db["items"].items() if v["company_id"] != company_id}
        _save(db)
        return True
