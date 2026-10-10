"""Claims × ground truth → checks. Deterministic rules only: the LLM never picks a verdict.

Every check: claim_type, claim_text, page, claimed_value, observed_value, unit, source, via,
source_url, verdict (match | gap | unverifiable), confidence (high | medium | low), note.
"""

HEADCOUNT_MATCH_RATIO = 0.7  # LinkedIn undercounts; 70% of the claim counts as a match
MONEY_TOLERANCE = 0.10


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
    pa, pb = _norm(a).split(), _norm(b).split()
    pa = [p for p in pa if p not in {"dr", "mr", "ms", "mrs", "prof"}]
    pb = [p for p in pb if p not in {"dr", "mr", "ms", "mrs", "prof"}]
    return bool(pa and pb) and pa[-1] == pb[-1] and pa[0][0] == pb[0][0]


def _check(claim: dict | None, **kw) -> dict:
    base = {
        "claim_type": claim["claim_type"] if claim else kw.get("claim_type"),
        "claim_text": claim["claim_text"] if claim else kw.get("claim_text"),
        "page": claim.get("page") if claim else None,
        "claimed_value": claim["value"] if claim else None,
        "observed_value": None,
        "unit": None,
        "source_url": None,
    }
    base.update(kw)
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
        if ratio >= HEADCOUNT_MATCH_RATIO:
            out.append(_check(c, **common, observed_value=obs, source_url=linkedin.get("url"), verdict="match",
                              confidence="medium", note=f"LinkedIn lists {obs} employees, consistent with the claim of {claimed}."))
        else:
            out.append(_check(c, **common, observed_value=obs, source_url=linkedin.get("url"), verdict="gap",
                              confidence="low" if small and ratio >= 0.4 else "medium",
                              note=f"LinkedIn lists {obs} employees vs. {claimed} claimed ({ratio:.0%}). "
                                   "Ask whether contractors or unannounced hires are included."))
    return out


def form_d_checks(claims: list[dict], form_d: dict | None) -> list[dict]:
    out = []
    money = [c for c in claims if c["claim_type"] in ("raised", "round_size")]
    common = dict(unit="usd", source="form_d", via="sec_edgar")
    if not form_d:
        for c in money:
            out.append(_check(c, **common, verdict="unverifiable", confidence="low",
                              note="No Form D found. Not every round is filed (or filed on time)."))
        return out

    url = form_d.get("url")
    latest = form_d["total_sold"]
    all_sold = latest + sum(h.get("total_sold") or 0 for h in form_d.get("history", []))

    # Total raised to date vs. the sum of all Form Ds.
    for c in (c for c in money if c["claim_type"] == "raised"):
        claimed = c["value"]
        if _close(claimed, all_sold):
            out.append(_check(c, **common, observed_value=all_sold, source_url=url, verdict="match", confidence="high",
                              note=f"Form D filings total {usd(all_sold)} sold, consistent with {usd(claimed)} claimed."))
        elif all_sold > claimed:
            out.append(_check(c, **common, observed_value=all_sold, source_url=url, verdict="gap", confidence="high",
                              note=f"Form D filings show {usd(all_sold)} sold, {usd(all_sold - claimed)} more than claimed. "
                                   "Possible unannounced extension."))
        else:
            out.append(_check(c, **common, observed_value=all_sold, source_url=url, verdict="gap", confidence="low",
                              note=f"Form D filings show {usd(all_sold)} sold vs. {usd(claimed)} claimed. "
                                   "SAFEs and notes are not always filed, so this may be incomplete."))

    # The largest claimed round vs. the latest Form D.
    rounds = [c for c in money if c["claim_type"] == "round_size"]
    if rounds:
        c = max(rounds, key=lambda r: r["value"])
        claimed = c["value"]
        if _close(claimed, latest):
            verdict, conf, note = "match", "high", f"Latest Form D shows {usd(latest)} sold, consistent with the {usd(claimed)} round."
        elif latest > claimed:
            verdict, conf, note = "gap", "high", (f"Latest Form D shows {usd(latest)} sold vs. a {usd(claimed)} round. "
                                                  "Possible unannounced extension.")
        else:
            verdict, conf, note = "gap", "medium", f"Latest Form D shows only {usd(latest)} sold vs. a {usd(claimed)} round."
        remaining = form_d.get("total_remaining") or 0
        if remaining > 0:
            note += f" Round still open: {usd(remaining)} of {usd(form_d.get('total_offering'))} unsold as of {form_d.get('filing_date')}."
        out.append(_check(c, **common, observed_value=latest, source_url=url, verdict=verdict, confidence=conf, note=note))

    # Board: named members vs. Form D related persons.
    board = [c for c in claims if c["claim_type"] == "board"]
    persons = form_d.get("related_persons") or []
    if board and persons:
        for c in board:
            found = any(_same_person(c["value"], p) for p in persons)
            out.append(_check(c, unit="person", source="form_d", via="sec_edgar", observed_value=c["value"] if found else None,
                              source_url=url, verdict="match" if found else "unverifiable",
                              confidence="high" if found else "low",
                              note="Listed as a related person on Form D." if found
                              else "Not listed on Form D (it may predate their appointment)."))
        for p in persons:
            if not any(_same_person(c["value"], p) for c in board):
                out.append(_check(None, claim_type="board", claim_text="(not named in the deck)", unit="person",
                                  source="form_d", via="sec_edgar", observed_value=p, source_url=url,
                                  verdict="gap", confidence="medium",
                                  note=f"{p} is listed on Form D as a director or executive but isn't named in the deck. "
                                       "Possible unannounced director."))
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
                              verdict="match", confidence="high", note=f"Press reports {usd(hit['amount_mentioned'])}: \"{hit['title']}\"."))
        elif amounts and c["value"] == largest:  # smaller/earlier rounds often get no press; don't flag them
            p = min(amounts, key=lambda p: abs(p["amount_mentioned"] - c["value"]))
            out.append(_check(c, **common, unit="usd", observed_value=p["amount_mentioned"], source_url=p["url"],
                              verdict="gap", confidence="medium",
                              note=f"Closest press figure is {usd(p['amount_mentioned'])} vs. {usd(c['value'])} in the deck."))
        else:
            out.append(_check(c, **common, unit="usd", verdict="unverifiable", confidence="low",
                              note="No press coverage of this round found."))
    for c in (c for c in claims if c["claim_type"] == "customer"):
        name = _norm(str(c["value"]))
        hit = next((p for p in press if name in _norm(f"{p.get('title', '')} {p.get('snippet', '')}")), None)
        if hit:
            out.append(_check(c, **common, observed_value=c["value"], source_url=hit["url"], verdict="match",
                              confidence="medium", note=f"Public mention found: \"{hit['title']}\"."))
        else:
            out.append(_check(c, **common, verdict="unverifiable", confidence="low",
                              note=f"No public mention of {c['value']} as a customer found. It may be a pilot or LOI; ask for a reference."))
    return out
