"""Company memory: companies → items → claims. A JSON file for now (survives restarts, works offline on demo day).

Only extracted claims and metadata are stored; raw files and full text are not (legal-and-compliance.md).
"""

import contextvars
import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

PATH = Path(os.getenv("STORE_PATH", Path(__file__).parent / "data" / "store.json"))
_lock = threading.Lock()

# Workspaces: one inbox per tester (their browser sends X-Workspace). "default" is the original single inbox
# (STORE_PATH); any other workspace is its own file next to it under ws/. Set per request by main.py.
WORKSPACE: contextvars.ContextVar[str] = contextvars.ContextVar("workspace", default="default")
WS_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")


def path_for(ws: str) -> Path:
    return PATH if ws == "default" else PATH.parent / "ws" / f"{ws}.json"


def current_path() -> Path:
    return path_for(WORKSPACE.get())


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load() -> dict:
    path = current_path()
    if path.exists():
        return json.loads(path.read_text())
    return {"companies": {}, "items": {}}


def _save(db: dict) -> None:
    path = current_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(f".{threading.get_ident()}.tmp")
    tmp.write_text(json.dumps(db, indent=1))
    tmp.replace(path)


def copy_workspace(src: str, dest: str) -> bool:
    """Seed `dest` with a copy of `src` (the example inbox), timestamps moved to now so the digest's "today" shows it.
    Returns False if `src` doesn't exist."""
    sp = path_for(src)
    if not sp.exists():
        return False
    db = json.loads(sp.read_text())
    stamps = [i["received_at"] for i in db["items"].values()] + [c.get("updated_at", "") for c in db["companies"].values()]
    latest = max((t for t in stamps if t), default=None)
    if latest:
        shift = datetime.now(timezone.utc) - datetime.fromisoformat(latest)
        move = lambda t: (datetime.fromisoformat(t) + shift).isoformat() if t else t  # noqa: E731
        for i in db["items"].values():
            i["received_at"] = move(i["received_at"])
        for c in db["companies"].values():
            c["updated_at"] = move(c.get("updated_at"))
            if c.get("created_at"):
                c["created_at"] = move(c["created_at"])
            for i in (c.get("view") or {}).get("items", []):
                i["received_at"] = move(i.get("received_at"))
    token = WORKSPACE.set(dest)
    try:
        with _lock:
            _save(db)
    finally:
        WORKSPACE.reset(token)
    return True


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


def find_company(company_id: str | None = None, name: str | None = None, url: str | None = None) -> dict | None:
    """Lookup without creating: by id, by the domain of a page URL, then by name."""
    cos = _load()["companies"]
    if company_id:
        return cos.get(company_id)
    if url:
        host = re.sub(r"^https?://", "", url.lower()).split("/")[0].removeprefix("www.")
        co = next((c for c in cos.values() if c.get("domain") and (host == c["domain"] or host.endswith("." + c["domain"]))), None)
        if co:
            return co
    if name and _key(name):
        return next((c for c in cos.values() if _key(c["name"]) == _key(name)), None)
    return None


def get_company(company_id: str) -> dict | None:
    return _load()["companies"].get(company_id)


def list_companies() -> list[dict]:
    db = _load()
    items: dict[str, list[dict]] = {}
    for it in db["items"].values():
        items.setdefault(it["company_id"], []).append(it)
    cos = []
    for c in db["companies"].values():
        mine = sorted(items.get(c["id"], []), key=lambda i: i["received_at"])
        checks = (c.get("view") or {}).get("checks", [])
        cos.append({**c, "item_count": len(mine), "item_kinds": list(dict.fromkeys(i["kind"] for i in mine)),
                    "discrepancies": sum(x["verdict"] == "gap" and x["source"] != "your_sources" for x in checks),
                    "contradictions": sum(x["source"] == "your_sources" for x in checks),
                    "last_item_at": mine[-1]["received_at"] if mine else None})
    return sorted(cos, key=lambda c: c.get("updated_at", ""), reverse=True)


def move_item(item_id: str, company_id: str) -> tuple[str, str] | None:
    """Refile an item under another company. Returns (from_company_id, to_company_id)."""
    with _lock:
        db = _load()
        it = db["items"].get(item_id)
        if not it or company_id not in db["companies"]:
            return None
        src = it["company_id"]
        it["company_id"] = company_id
        db["companies"][company_id]["updated_at"] = _now()
        if not any(i["company_id"] == src for i in db["items"].values()):
            db["companies"].pop(src, None)  # don't leave an empty company behind
        _save(db)
        return src, company_id


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
