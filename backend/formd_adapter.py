"""Data's Form D rows (flattened SEC Form D data sets, one row per filing) → our `form_d` ground-truth dict.

Data calls this from sources/ground_truth.get_ground_truth(). Suggested lookups (DuckDB-style):

    cos     = SELECT * FROM sec_edgar.startup_companies
              WHERE company_search_name ILIKE '%' || :name || '%' LIMIT 25          # candidates (no funds)
    cik     = formd_adapter.pick_company(company_name, cos, hint_city, hint_state)  # → best CIK or None
    rounds  = SELECT * FROM sec_edgar.startup_rounds WHERE cik = :cik           # preferred: amendments already folded
    rows    = SELECT * FROM sec_edgar.form_d_filings WHERE cik = :cik           # fallback if rounds aren't ready
    persons = SELECT * FROM sec_edgar.form_d_related_persons
              WHERE accession_number IN (<rounds' latest_accession_number, or rows' accession_numbers>)
    people  = SELECT * FROM sec_edgar.startup_people WHERE cik = :cik
    form_d  = formd_adapter.to_form_d(company_name, rows, persons, people=people, rounds=rounds,
                                      company_row=<the chosen startup_companies / startup_universe row>)

`to_form_d` also works with filings alone (it then filters funds and picks the issuer itself).

Rules (Research/Product Research/form-d-data-guide.md):
- Funds are not startups: drop pooled funds, investment funds, real estate, 3(c) exemptions, names with Fund/LP/Partners.
- A D/A amends its original offering (previous_accession_number): it REPLACES those numbers, never adds to them.
- Pick the issuer (CIK) whose name matches best, then the most recently active.
"""

import re
from datetime import date

FUND_WORDS = re.compile(r"\b(fund|funds|lp|l\.p\.|partners|capital partners|spv|series \d+|feeder|master)\b", re.I)
FUND_INDUSTRIES = ("pooled investment fund", "reits", "real estate", "commercial", "residential", "other real estate")
SUFFIXES = re.compile(r"\b(inc|incorporated|llc|ltd|corp|corporation|co|company|holdings|technologies|technology|labs|ai|hq)\b", re.I)


def _norm(name: str) -> str:
    n = re.sub(r"[^a-z0-9 ]", " ", (name or "").lower())
    return " ".join(SUFFIXES.sub(" ", n).split())


def _iso(v) -> str | None:
    if v is None or v == "":
        return None
    if isinstance(v, date):
        return v.isoformat()
    return str(v)[:10]


def _num(v) -> int | None:
    try:
        return None if v is None else int(round(float(v)))
    except (TypeError, ValueError):
        return None


def is_fund(row: dict) -> bool:
    industry = (row.get("industry_group") or "").lower()
    exemptions = (row.get("federal_exemptions") or "").lower()
    return bool(
        row.get("is_pooled_fund_interest")
        or row.get("investment_fund_type")
        or any(w in industry for w in FUND_INDUSTRIES)
        or "3c" in exemptions.replace("(", "").replace(")", "").replace(".", "")
        or FUND_WORDS.search(row.get("entity_name") or "")
    )


def name_score(query: str, entity: str) -> float:
    """1.0 exact (after dropping Inc/LLC/AI…), 0.8 one name starts the other, else word overlap."""
    q, e = _norm(query), _norm(entity)
    if not q or not e:
        return 0.0
    if q == e:
        return 1.0
    if e.startswith(q + " ") or q.startswith(e + " "):
        return 0.8
    qs, es = set(q.split()), set(e.split())
    return 0.6 * len(qs & es) / len(qs | es)


def pick_issuer(company: str, rows: list[dict], hint_city: str | None = None, hint_state: str | None = None) -> str | None:
    """CIK of the most plausible startup issuer for `company`, or None."""
    best: dict[str, tuple] = {}
    for r in rows:
        if is_fund(r):
            continue
        score = name_score(company, r.get("entity_name", ""))
        if score < 0.5:
            continue
        if hint_city and (r.get("city") or "").lower() == hint_city.lower():
            score += 0.1
        if hint_state and (r.get("state_or_country") or "").upper() == hint_state.upper():
            score += 0.05
        key = (score, _iso(r.get("filing_date")) or "")
        if r["cik"] not in best or key > best[r["cik"]]:
            best[r["cik"]] = key
    return max(best, key=best.get) if best else None


def pick_company(company: str, startup_rows: list[dict], hint_city: str | None = None,
                 hint_state: str | None = None) -> str | None:
    """Best CIK from sec_edgar.startup_companies candidates (already startups, so no fund filtering needed)."""
    best, best_key = None, None
    for r in startup_rows:
        score = max(name_score(company, r.get("company_name", "")), name_score(company, r.get("company_search_name", "")))
        if score < 0.5:
            continue
        if hint_city and (r.get("city") or "").lower() == hint_city.lower():
            score += 0.1
        if hint_state and (r.get("state_or_country") or "").upper() == hint_state.upper():
            score += 0.05
        key = (score, _iso(r.get("latest_filing_date")) or "")
        if best_key is None or key > best_key:
            best, best_key = r["cik"], key
    return best


def offerings(rows: list[dict]) -> list[dict]:
    """One entry per offering, using the latest amendment's numbers. Newest offering first."""
    by_acc = {r["accession_number"]: r for r in rows}

    def root(r: dict) -> str:
        seen = set()
        while r.get("is_amendment") and r.get("previous_accession_number") in by_acc and r["accession_number"] not in seen:
            seen.add(r["accession_number"])
            r = by_acc[r["previous_accession_number"]]
        return r.get("previous_accession_number") if r.get("is_amendment") and r.get("previous_accession_number") else r["accession_number"]

    latest: dict[str, dict] = {}
    for r in rows:
        k = root(r)
        if k not in latest or (_iso(r.get("filing_date")) or "") > (_iso(latest[k].get("filing_date")) or ""):
            latest[k] = {**r, "_root": k}
    return sorted(latest.values(), key=lambda r: (_iso(r.get("first_sale_date")) or _iso(r.get("filing_date")) or ""), reverse=True)


def _people(persons: list[dict], accession: str) -> list[dict]:
    """sec_edgar.form_d_related_persons rows for one filing → [{name, director, officer, promoter, title}], in filing order."""
    out, seen = [], set()
    for p in sorted((p for p in persons if p.get("accession_number") == accession), key=lambda p: p.get("person_seq") or 0):
        name = (p.get("full_name") or " ".join(x for x in (p.get("first_name"), p.get("middle_name"), p.get("last_name")) if x)).strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        rel = (p.get("relationships") or "").lower()
        out.append({
            "name": name.title() if name.isupper() else name,
            "director": bool(p.get("is_director")) or "director" in rel,
            "officer": bool(p.get("is_executive_officer")) or "executive" in rel,
            "promoter": bool(p.get("is_promoter")) or "promoter" in rel,
            "title": p.get("title") or None,
        })
    return out


def _enrich(people: list[dict], startup_people: list[dict]) -> list[dict]:
    """Add founder/CTO roles and how many startups' Form Ds each person is named on (repeat insiders are often
    investors taking board seats: context that explains a flag rather than raising one)."""
    by_name = {(p.get("full_name") or "").strip().lower(): p for p in startup_people}
    for person in people:
        sp = by_name.get(person["name"].lower())
        if not sp:
            continue
        person["founder"] = bool(sp.get("is_ceo_or_founder"))
        person["cto"] = bool(sp.get("is_cto"))
        person["title"] = person.get("title") or sp.get("latest_title")
        person["startups_named_on"] = sp.get("startups_named_on")
        person["repeat_insider"] = bool(sp.get("is_repeat_insider"))
    return people


def _round(r: dict) -> dict:
    """sec_edgar.startup_rounds row (one offering, amendments folded) → our filing dict."""
    offered = None if r.get("offering_amount_indefinite") else _num(r.get("total_offering_amount_usd"))
    return {
        "accession": r.get("latest_accession_number") or r.get("offering_id"),
        "filing_date": _iso(r.get("latest_filing_date")),
        "original_filing_date": _iso(r.get("original_filing_date")),
        "date_of_first_sale": _iso(r.get("first_sale_date")),
        "days_first_sale_to_filing": _num(r.get("days_first_sale_to_filing")),
        "total_offering": offered if offered is not None else "Indefinite",
        "total_sold": _num(r.get("total_amount_sold_usd")) or 0,
        "total_remaining": _num(r.get("total_remaining_usd")),
        "num_investors": _num(r.get("num_investors")),
        "security_type": r.get("security_type"),
        "is_open": r.get("is_open_round"),
        "url": r.get("filing_url"),
        "is_amendment": False,
    }


def _filing(r: dict) -> dict:
    offered = None if r.get("offering_amount_indefinite") else _num(r.get("total_offering_amount_usd"))
    return {
        "accession": r["accession_number"],
        "filing_date": _iso(r.get("filing_date")),
        "date_of_first_sale": _iso(r.get("first_sale_date")),
        "total_offering": offered if offered is not None else "Indefinite",
        "total_sold": _num(r.get("total_amount_sold_usd")) or 0,
        "total_remaining": _num(r.get("total_remaining_usd")),
        "num_investors": _num(r.get("num_investors")),
        "url": r.get("filing_url"),
        "is_amendment": False,  # amendments are already folded into their offering
    }


def to_form_d(company: str, rows: list[dict], persons: list[dict] | None = None,
              hint_city: str | None = None, hint_state: str | None = None,
              people: list[dict] | None = None, company_row: dict | None = None,
              rounds: list[dict] | None = None) -> dict | None:
    """Our ground-truth `form_d` (see fixtures/acme_ground_truth.json), or None if no plausible issuer.
    `company_row` (sec_edgar.startup_companies) pins the CIK; `people` (sec_edgar.startup_people) enriches roles."""
    cik = company_row["cik"] if company_row else pick_issuer(company, rows or rounds or [], hint_city, hint_state)
    if not cik:
        return None
    persons = persons or []
    my_rounds = [r for r in rounds or [] if r.get("cik") == cik]
    if my_rounds:  # Data already folded amendments into offerings: newest offering first
        my_rounds.sort(key=lambda r: (_iso(r.get("first_sale_date")) or _iso(r.get("latest_filing_date")) or ""), reverse=True)
        head_row, latest, rest = my_rounds[0], _round(my_rounds[0]), [_round(r) for r in my_rounds[1:]]
        accessions = [head_row.get("latest_accession_number")]
    else:
        mine = offerings([r for r in rows if r.get("cik") == cik])
        if not mine:
            return None
        head_row, latest, rest = mine[0], _filing(mine[0]), [_filing(r) for r in mine[1:]]
        accessions = [head_row["accession_number"], head_row["_root"]]
    head = {**head_row, "entity_name": head_row.get("entity_name") or head_row.get("company_name")}
    # Related persons: from the latest filing of the newest offering, falling back to its original filing.
    found = next((p for a in accessions if a for p in [_people(persons, a)] if p), [])
    people_ = _enrich(found, people or [])
    return {
        "entity_name": head.get("entity_name"),
        "cik": str(cik).lstrip("0") or str(cik),
        **latest,
        "related_persons": [p["name"] for p in people_],
        "related_people": people_,  # roles (director / officer / founder / CTO), title, startups_named_on
        "city": head.get("city"),
        "state": head.get("state_or_country"),
        "year_of_inc": head.get("year_of_inc"),
        "industry_group": head.get("industry_group"),
        "history": rest,
        "edgar_company_url": (company_row or {}).get("edgar_company_url"),
        "first_filing_date": _iso((company_row or {}).get("first_filing_date")),
    }
