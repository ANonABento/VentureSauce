"""Claims × ground truth → checks. Deterministic rules only: the LLM never picks a verdict.

Every check: claim_type, claim_text, page, claimed_value, observed_value, unit, source, via,
source_url, source_date, verdict (match | gap | unverifiable), label (UI wording), confidence
(high | medium | low), note.

Form D rules follow Research/Product Research/form-d-data-guide.md: a Form D often reflects only
the first close and isn't required to be amended when more is sold, so a LOWER Form D amount is
only a gap when the difference is large and the filing is old; a HIGHER amount can include
converted SAFEs/notes, so it's never high confidence.
"""

from datetime import date

HEADCOUNT_MATCH_RATIO = 0.7  # LinkedIn undercounts; 70% of the claim counts as a match
MONEY_TOLERANCE = 0.10  # also the SEC threshold below which no Form D/A is required
LOWER_GAP_RATIO = 0.25  # Form D below the claim by more than this...
LOWER_GAP_MIN_AGE_DAYS = 90  # ...and filed longer ago than this → gap

# "gap" stays internal; the UI never shows the bare word (legal-and-compliance.md).
LABELS = {"match": "Matches source", "gap": "Differs from source", "unverifiable": "Couldn't verify"}
_CONF_ORDER = ["low", "medium", "high"]


def usd(n: int | float | None) -> str:
    if n is None:
        return "?"
    if n >= 1e9:
        return f"${n / 1e9:.2f}B".replace(".00B", "B")
    if n >= 1e6:
        return f"${n / 1e6:.2f}M".replace(".00M", "M")
    return f"${n:,.0f}"


def _close(a: float, b: float) -> bool:
    return abs(a - b) <= MONEY_TOLERANCE * max(a, b)


def _norm(name: str) -> str:
    return " ".join(name.lower().replace(".", "").split())


def _same_person(a: str, b: str) -> bool:
    """Match on last name + first initial so 'Dr. Jane Q. Founder' == 'Jane Founder'."""
    titles = {"dr", "mr", "ms", "mrs", "prof"}
    pa = [p for p in _norm(a).split() if p not in titles]
    pb = [p for p in _norm(b).split() if p not in titles]
    return bool(pa and pb) and pa[-1] == pb[-1] and pa[0][0] == pb[0][0]


def _cap(conf: str, ceiling: str) -> str:
    return min(conf, ceiling, key=_CONF_ORDER.index)


def _days_since(iso: str | None, today: date) -> int | None:
    try:
        return (today - date.fromisoformat(iso[:10])).days
    except (TypeError, ValueError):
        return None


def _check(claim: dict | None, **kw) -> dict:
    base = {
        "claim_type": claim["claim_type"] if claim else kw.get("claim_type"),
        "claim_text": claim["claim_text"] if claim else kw.get("claim_text"),
        "page": claim.get("page") if claim else None,
        "claimed_value": claim["value"] if claim else None,
        "observed_value": None,
        "unit": None,
        "source_url": None,
        "source_date": None,
    }
    base.update(kw)
    base["label"] = LABELS[base["verdict"]]
    return base


def headcount_checks(claims: list[dict], linkedin: dict | None) -> list[dict]:
    out = []
    for c in claims:
        if c["claim_type"] != "headcount":
            continue
        common = dict(unit="people", source="linkedin", via="brightdata")
        if not linkedin or linkedin.get("employees") is None:
            out.append(_check(c, **common, verdict="unverifiable", confidence="low",
                              note="No LinkedIn company page data found."))
            continue
        obs, claimed = linkedin["employees"], c["value"]
        ratio = obs / claimed if claimed else 0
        small = obs < 20  # small teams are often missing from LinkedIn
        common.update(observed_value=obs, source_url=linkedin.get("url"), source_date=(linkedin.get("fetched_at") or "")[:10] or None)
        if ratio >= HEADCOUNT_MATCH_RATIO:
            out.append(_check(c, **common, verdict="match", confidence="medium",
                              note=f"LinkedIn lists {obs} employees, consistent with the claim of {claimed}."))
        else:
            out.append(_check(c, **common, verdict="gap", confidence="low" if small and ratio >= 0.4 else "medium",
                              note=f"LinkedIn lists {obs} employees vs. {claimed} claimed ({ratio:.0%}). "
                                   "Ask whether contractors or unannounced hires are included."))
    return out


def _filings(form_d: dict) -> list[dict]:
    """Latest filing + distinct older offerings. A D/A restates its original, so amendments never add up."""
    seen, out = set(), []
    for f in [form_d, *form_d.get("history", [])]:
        key = f.get("accession") or f.get("url")
        if f is not form_d and (f.get("is_amendment") or (key and key in seen)):
            continue
        seen.add(key)
        out.append(f)
    return out


def _lower_than_claim(claimed: int, sold: int, filed: str | None, today: date) -> tuple[str, str, str]:
    """(verdict, confidence, note) when the Form D shows less than the deck."""
    age = _days_since(filed, today)
    if (claimed - sold) / claimed > LOWER_GAP_RATIO and age is not None and age > LOWER_GAP_MIN_AGE_DAYS:
        return "gap", "medium", (f"Form D shows {usd(sold)} sold vs. {usd(claimed)} claimed, and the filing is {age} days old. "
                                 "SAFEs and notes are not always filed, so ask what's missing.")
    return "unverifiable", "low", (f"Form D shows {usd(sold)} sold as of {filed}. Filings often reflect only the first close "
                                   "and aren't required to be updated, so this can't confirm or contradict the claim.")


def _higher_than_claim(claimed: int, sold: int) -> tuple[str, str, str]:
    return "gap", "medium", (f"Form D shows {usd(sold)} sold, {usd(sold - claimed)} more than claimed. Could be an unannounced "
                             "extension, or converted SAFEs/notes counted in this round.")


def form_d_checks(claims: list[dict], form_d: dict | None, company: str | None = None, today: date | None = None) -> list[dict]:
    today = today or date.today()
    out = []
    money = [c for c in claims if c["claim_type"] in ("raised", "round_size")]
    common = dict(unit="usd", source="form_d", via="sec_edgar")
    if not form_d:
        who = f" under '{company}'" if company else ""
        for c in money:
            out.append(_check(c, **common, verdict="unverifiable", confidence="low",
                              note=f"No Form D found{who}. Many startups don't file, and SAFEs often aren't filed."))
        return out

    url, filed = form_d.get("url"), form_d.get("filing_date")
    common.update(source_url=url, source_date=filed)
    persons = form_d.get("related_persons") or []
    board = [c for c in claims if c["claim_type"] == "board"]

    # Entity check: searching "Daytona" returns 27 filers. If the deck names people and none of them are on
    # this Form D, it's probably a different company: cap everything at low and say which filer we matched.
    entity = f"{form_d.get('entity_name', 'filer')} (CIK {form_d.get('cik')})"
    confirmed = any(_same_person(c["value"], p) for c in board for p in persons)
    weak = bool(board and persons) and not confirmed
    ceiling = "low" if weak else ("high" if confirmed else "medium")
    caveat = f" Matched filer {entity}, but none of its listed people are in the deck, so it may be a different company." if weak else ""

    def add(c, verdict, conf, note, observed):
        out.append(_check(c, **common, observed_value=observed, verdict=verdict, confidence=_cap(conf, ceiling), note=note + caveat))

    # Total raised to date vs. all distinct Form D offerings.
    all_sold = sum(f.get("total_sold") or 0 for f in _filings(form_d))
    for c in (c for c in money if c["claim_type"] == "raised"):
        claimed = c["value"]
        if _close(claimed, all_sold):
            add(c, "match", "high", f"Form D filings total {usd(all_sold)} sold, consistent with {usd(claimed)} claimed.", all_sold)
        elif all_sold > claimed:
            add(c, *_higher_than_claim(claimed, all_sold), all_sold)
        else:
            add(c, *_lower_than_claim(claimed, all_sold, filed, today), all_sold)

    # The largest claimed round vs. the latest Form D (offering size first, then amount sold).
    rounds = [c for c in money if c["claim_type"] == "round_size"]
    if rounds:
        c = max(rounds, key=lambda r: r["value"])
        claimed, sold = c["value"], form_d.get("total_sold") or 0
        offering = form_d.get("total_offering") if isinstance(form_d.get("total_offering"), (int, float)) else None
        remaining = form_d.get("total_remaining") or 0
        still_open = (f" Round still open: {usd(remaining)} of {usd(offering)} unsold as of {filed}."
                      if remaining > 0 and offering else "")
        if (offering and _close(claimed, offering)) or _close(claimed, sold):
            add(c, "match", "high", f"Latest Form D: {usd(offering)} offering, {usd(sold)} sold." + still_open, sold)
        elif sold > claimed:
            add(c, *_higher_than_claim(claimed, sold), sold)
        else:
            verdict, conf, note = _lower_than_claim(claimed, sold, filed, today)
            add(c, verdict, conf, note + still_open, sold)

    # Board: deck names vs. Form D related persons (executive officers, directors, promoters).
    if board and persons:
        for c in board:
            found = any(_same_person(c["value"], p) for p in persons)
            out.append(_check(c, unit="person", source="form_d", via="sec_edgar", source_url=url, source_date=filed,
                              observed_value=c["value"] if found else None,
                              verdict="match" if found else "unverifiable", confidence=_cap("high" if found else "low", ceiling),
                              note="Listed as a related person on Form D." if found
                              else "Not listed on Form D (the filing may predate their appointment)." + caveat))
        if not weak:
            for p in persons:
                if not any(_same_person(c["value"], p) for c in board):
                    out.append(_check(None, claim_type="board", claim_text="(not named in the deck)", unit="person",
                                      source="form_d", via="sec_edgar", observed_value=p, source_url=url, source_date=filed,
                                      verdict="gap", confidence="medium",
                                      note=f"Form D lists {p} as a director or executive officer; not on the deck's board slide. "
                                           "Possibly an unannounced director, or an officer who isn't on the board."))
    return out


def press_checks(claims: list[dict], press: list[dict]) -> list[dict]:
    out = []
    common = dict(source="press", via="brightdata")
    amounts = [p for p in press if p.get("amount_mentioned")]
    rounds = [c for c in claims if c["claim_type"] == "round_size"]
    largest = max((c["value"] for c in rounds), default=None)
    for c in rounds:
        hit = next((p for p in amounts if _close(p["amount_mentioned"], c["value"])), None)
        if hit:
            out.append(_check(c, **common, unit="usd", observed_value=hit["amount_mentioned"], source_url=hit["url"],
                              source_date=hit.get("date"), verdict="match", confidence="high",
                              note=f"Press reports {usd(hit['amount_mentioned'])}: \"{hit['title']}\"."))
        elif amounts and c["value"] == largest:  # smaller/earlier rounds often get no press; don't flag them
            p = min(amounts, key=lambda p: abs(p["amount_mentioned"] - c["value"]))
            out.append(_check(c, **common, unit="usd", observed_value=p["amount_mentioned"], source_url=p["url"],
                              source_date=p.get("date"), verdict="gap", confidence="medium",
                              note=f"Closest press figure is {usd(p['amount_mentioned'])} vs. {usd(c['value'])} in the deck."))
        else:
            out.append(_check(c, **common, unit="usd", verdict="unverifiable", confidence="low",
                              note="No press coverage of this round found."))
    for c in (c for c in claims if c["claim_type"] == "customer"):
        name = _norm(str(c["value"]))
        hit = next((p for p in press if name in _norm(f"{p.get('title', '')} {p.get('snippet', '')}")), None)
        if hit:
            out.append(_check(c, **common, observed_value=c["value"], source_url=hit["url"], source_date=hit.get("date"),
                              verdict="match", confidence="medium", note=f"Public mention found: \"{hit['title']}\"."))
        else:
            out.append(_check(c, **common, verdict="unverifiable", confidence="low",
                              note=f"No public mention of {c['value']} as a customer found. It may be a pilot or LOI; ask for a reference."))
    return out
