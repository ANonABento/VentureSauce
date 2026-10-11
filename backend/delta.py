"""Company view → the frontend's DeltaReport (frontend/lib/types.ts), so the Next.js UI can render real data.

Our checks become rows: "filed" = what a source shows (Form D, LinkedIn, press, or another of the user's items),
"said" = what the founder claimed. Board members collapse into one Leadership row and customers into one
Customers row, as the UI designs them. Extra fields (questions, items, company.id) ride along for the deal inbox.
"""

from datetime import datetime, timezone

import analysis
from verdicts import usd

STATUS = {"gap": "discrepancy", "match": "consistent", "unverifiable": "unverified"}
SOURCE_LABEL = {"form_d": "SEC Form D", "linkedin": "LinkedIn via Bright Data", "press": "Press via Bright Data",
                "crunchbase": "Crunchbase via Bright Data"}
FIELD = {"headcount": "headcount", "raised": "latest_raise", "round_size": "latest_raise", "board": "leadership",
         "customer": "investors", "metric": "revenue"}
STATUS_RANK = {"discrepancy": 0, "unverified": 1, "not_disclosed": 2, "consistent": 3}


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _fmt(value, unit) -> str:
    if value is None:
        return "—"
    if unit == "usd" and isinstance(value, (int, float)):
        return usd(value)
    return f"{value:,}" if isinstance(value, int) else str(value)


def _claim(field: str, value: str, label: str, url: str, checked: str | None) -> dict:
    return {"field": field, "value": value, "source": {"label": label, "url": url, "checkedAt": checked or _today()}}


def _said(c: dict, field: str) -> dict | None:
    if c.get("claimed_value") is None:
        return None
    label = c.get("item_label") or "Deck"
    quote = f" (“{c['claim_text']}”)" if c.get("claim_text") and len(c["claim_text"]) <= 80 else ""
    # The user's own items have no public URL; "#item" tells the UI to render a plain chip.
    return _claim(field, _fmt(c["claimed_value"], c.get("unit")) + quote, label, "#item", c.get("source_date"))


def _filed(c: dict, field: str) -> dict | None:
    if c.get("observed_value") is None or not c.get("source_url"):
        return None
    return _claim(field, _fmt(c["observed_value"], c.get("unit")), SOURCE_LABEL.get(c["source"], c["source"]),
                  c["source_url"], c.get("source_date"))


def _signal(c: dict) -> str:
    t = c["claim_type"]
    if t == "metric":
        return analysis.metric_name(c.get("metric") or "metric")
    if t == "round_size" and isinstance(c.get("claimed_value"), (int, float)):
        # The same round is checked against Form D and press: say which, so the two rows don't read as duplicates.
        against = {"form_d": " vs. Form D", "press": " vs. press"}.get(c["source"], "")
        return f"Round ({usd(c['claimed_value'])}){against}"
    return {"headcount": "Headcount", "raised": "Total raised"}.get(t, t.capitalize())


def _short(c: dict) -> str:
    """The delta in five words or fewer."""
    if c["source"] == "your_sources":
        return f"{len(c.get('values', []))} sources disagree"
    if c["verdict"] == "unverifiable":
        return {"form_d": "No Form D found", "press": "No public mention", "linkedin": "No LinkedIn data",
                "crunchbase": "Crunchbase differs"}.get(c["source"], "Couldn't verify")
    a, b = c.get("claimed_value"), c.get("observed_value")
    if c["verdict"] == "gap" and isinstance(a, (int, float)) and isinstance(b, (int, float)):
        diff = b - a
        sign = "+" if diff > 0 else "−"
        amount = usd(abs(diff)) if c.get("unit") == "usd" else f"{abs(diff):,}"
        return f"{sign}{amount} vs. claim"
    return {"form_d": "Matches Form D", "linkedin": "Matches LinkedIn", "press": "Matches press",
            "crunchbase": "Matches Crunchbase"}.get(c["source"], "Matches")


def _visual(c: dict) -> dict | None:
    if c["source"] == "form_d" and c["claim_type"] in ("raised", "round_size") and isinstance(c.get("observed_value"), (int, float)):
        return {"kind": "raise", "offered": c.get("offered") or c["observed_value"], "sold": c["observed_value"],
                "said": c["claimed_value"]}
    if c["source"] == "your_sources" and c["claim_type"] == "headcount":
        return {"kind": "headcount", "series": [{"date": v["item_day"], "value": v["value"]}
                                                for v in sorted(c["values"], key=lambda v: v["item_day"])]}
    return None


def _row(c: dict) -> dict:
    field = FIELD.get(c["claim_type"], "revenue")
    status = STATUS[c["verdict"]]
    if c["verdict"] == "unverifiable" and c["source"] == "form_d" and c.get("observed_value") is None:
        status = "not_disclosed"
    if c["source"] == "your_sources":
        # Two of the user's own items, newest vs. the one that differs most.
        values = c.get("values", [])
        other = next((v for v in values if v["value"] == c["observed_value"]), None)
        filed = (_claim(field, _fmt(other["value"], c.get("unit")), other["item_label"], "#item", other["item_day"])
                 if other else None)
    else:
        filed = _filed(c, field)
    row = {"signal": _signal(c) + (" across your sources" if c["source"] == "your_sources" else ""),
           "filed": filed, "said": _said(c, field), "status": status, "summary": c["note"],
           "summaryShort": _short(c), "likelyReasons": [], "confidence": c.get("confidence")}
    visual = _visual(c)
    if visual:
        row["visual"] = visual
    return row


def _leadership(checks: list[dict]) -> dict | None:
    board = [c for c in checks if c["claim_type"] == "board"]
    if not board:
        return None
    people = []
    for c in board:
        name = c["claimed_value"] or c["observed_value"]
        people.append({"name": name, "role": "on Form D" if c["observed_value"] else "deck only",
                       "onSite": c["claimed_value"] is not None})
    extra = [c for c in board if c["verdict"] == "gap"]
    status = "discrepancy" if extra else ("consistent" if any(c["verdict"] == "match" for c in board) else "unverified")
    src = next((c for c in board if c.get("source_url")), board[0])
    filed_names = [c["observed_value"] for c in board if c["observed_value"]]
    said_names = [c["claimed_value"] for c in board if c["claimed_value"]]
    return {
        "signal": "Leadership",
        "filed": _claim("leadership", ", ".join(filed_names), "SEC Form D", src.get("source_url") or "#item",
                        src.get("source_date")) if filed_names else None,
        "said": _claim("leadership", ", ".join(said_names), board[0].get("item_label") or "Deck", "#item", None)
        if said_names else None,
        "status": status,
        "summary": " ".join(c["note"] for c in extra) or "Everyone named in the deck is on the Form D.",
        "summaryShort": f"{len(extra)} not in deck" if extra else ("Matches Form D" if status == "consistent" else "Couldn't verify"),
        "likelyReasons": ["Unannounced director", "Officer who isn't on the board"] if extra else [],
        "visual": {"kind": "leadership", "people": people},
    }


def _customers(checks: list[dict]) -> dict | None:
    cs = [c for c in checks if c["claim_type"] == "customer"]
    if not cs:
        return None
    found = [c for c in cs if c["verdict"] == "match"]
    missing = [c for c in cs if c["verdict"] != "match"]
    return {
        "signal": "Customers",
        "filed": _claim("investors", ", ".join(str(c["claimed_value"]) for c in found), "Press via Bright Data",
                        found[0]["source_url"], found[0].get("source_date")) if found else None,
        "said": _claim("investors", ", ".join(str(c["claimed_value"]) for c in cs), cs[0].get("item_label") or "Deck", "#item", None),
        "status": "unverified" if missing else "consistent",
        "summary": (f"No public mention of {', '.join(str(c['claimed_value']) for c in missing)} as a customer. "
                    "Could be pilots or LOIs; ask for references.") if missing else "Every named customer has a public mention.",
        "summaryShort": f"{len(missing)} of {len(cs)} unconfirmed" if missing else "All confirmed",
        "likelyReasons": ["Pilot or LOI shown as a customer", "Customer prefers not to be named"] if missing else [],
    }


def to_report(view: dict) -> dict:
    checks = view.get("checks", [])
    rows = [_row(c) for c in checks if c["claim_type"] not in ("board", "customer")]
    rows += [r for r in (_leadership(checks), _customers(checks)) if r]
    rows.sort(key=lambda r: STATUS_RANK[r["status"]])
    n = sum(r["status"] == "discrepancy" for r in rows)
    contradictions = sum(c["source"] == "your_sources" for c in checks)
    co = view.get("company") or {}
    headline = (f"{n} discrepanc{'y' if n == 1 else 'ies'}"
                + (f", including {contradictions} between your own sources" if contradictions else "")
                + "." if n else "No discrepancies found in what we could check.")
    return {
        "company": {"name": co.get("name"), "domain": co.get("domain") or "", "cik": co.get("cik") or None,
                    "id": co.get("id"), "fictional": co.get("fictional", False), "formDEntity": co.get("form_d_entity")},
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "headline": headline,
        "rows": rows,
        # Deal inbox extras (not in DeltaReport yet):
        "questions": view.get("questions", []),
        "items": view.get("items", []),
    }
