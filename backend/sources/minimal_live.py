"""Minimal live public records (Kevin's backup until Data's EDGAR + Bright Data + Mongo version lands).

- Form D: straight from SEC EDGAR (no key; SEC_USER_AGENT; under 10 requests/sec). Raw primary_doc.xml filings are
  turned into the row shape formd_adapter.to_form_d already understands, so amendments, fund filtering and people
  roles work the same as with Data's tables.
- Press: Google News search fetched through Bright Data's Web Unlocker (BRIGHTDATA_API_TOKEN, BRIGHTDATA_ZONE).
  Every row says `"via": "brightdata"`.
- LinkedIn: the company page its own homepage links to (never a guessed slug: linkedin.com/company/legora is a
  different 2-person page), fetched through the same Web Unlocker. Headcount is LinkedIn's member count
  (numberOfEmployees); company_size is the range the company picked. No homepage link → None.

Results are cached in data/gt_cache/ and, for the demo companies, snapshotted in fixtures/ground_truth/ by
prewarm_sources.py. Lookup order: fresh cache → live → snapshot, and each source fails on its own.
"""

import json
import logging
import os
import re
import threading
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote_plus

import httpx

import formd_adapter
from sources import oso

log = logging.getLogger(__name__)
HERE = Path(__file__).parent.parent
CACHE = HERE / "data" / "gt_cache"
SNAPSHOTS = HERE / "fixtures" / "ground_truth"
CACHE_DAYS = 3
# CIKs checked by hand against EDGAR (docs/PLAN.md); name search can't tell them from same-named filers.
KNOWN_CIKS = {"daytona": "1977563", "clerk": "1959758",
              # From Data's judges table (pipeline/), which matched them by website and people.
              "lovable": "2055162", "harvey": "1974654", "gc-ai": "2036281"}
# Names shared by many unrelated companies: no Form D unless pinned above, and press must mention their field.
AMBIGUOUS = {
    "athena": re.compile(r"\b(legal|law|lawyers?|attorneys?)\b", re.I),
    "clerk": re.compile(r"\b(auth|authentication|identity|developers?|user management|anthology|menlo)\b", re.I),
}
MAX_FILINGS = 20  # frequent small filers (monthly crowdfunding-style) need more than a handful to add up
# Homepages for the demo companies, for lookups that arrive without a domain (prewarm, a name typed in).
KNOWN_DOMAINS = {"daytona": "daytona.io", "clerk": "clerk.com", "legora": "legora.com", "tailor-brands": "tailorbrands.com",
                 "base44": "base44.com", "pavoot": "pavoot.com", "athena": "athena.law",
                 "lovable": "lovable.dev", "harvey": "harvey.ai", "gc-ai": "gc.ai"}

_sec_lock = threading.Lock()
_sec_last = [0.0]


# Legal names extracted from documents → the name the company goes by (cache, snapshots and news search use it).
ALIASES = {"daytona-platforms": "Daytona", "legora-inc": "Legora", "clerk-inc": "Clerk",
           "lovable-labs": "Lovable", "harvey-ai": "Harvey", "general-counsel-ai": "GC AI"}
LEGAL = re.compile(r"[,.]?\s+(inc|incorporated|llc|ltd|limited|corp|corporation|co|gmbh|ab|sa)\.?$", re.I)


def common_name(company: str) -> str:
    """'Daytona Platforms Inc.' → 'Daytona'; 'Legora, Inc.' → 'Legora'."""
    name = LEGAL.sub("", company.strip())
    return ALIASES.get(re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"), name)


def slug(company: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", common_name(company).lower()).strip("-")


# ── SEC EDGAR ────────────────────────────────────────────────────────────────

def _sec(url: str, **params) -> httpx.Response:
    with _sec_lock:  # stay well under SEC's 10 requests/sec
        wait = 0.15 - (time.time() - _sec_last[0])
        if wait > 0:
            time.sleep(wait)
        _sec_last[0] = time.time()
    r = httpx.get(url, params=params or None, timeout=20,
                  headers={"User-Agent": os.environ.get("SEC_USER_AGENT", "VentureSauce research@example.com")})
    r.raise_for_status()
    return r


def _submissions(cik: str) -> dict:
    return _sec(f"https://data.sec.gov/submissions/CIK{int(cik):010d}.json").json()


def find_cik(company: str) -> tuple[str, dict] | None:
    """(cik, submissions) of the best-matching Form D issuer, skipping funds; None if nothing plausible."""
    known = KNOWN_CIKS.get(slug(company))
    if known:
        return known, _submissions(known)
    if slug(company) in AMBIGUOUS:
        return None
    feed = _sec("https://www.sec.gov/cgi-bin/browse-edgar", company=company, type="D", owner="include",
                count=20, action="getcompany", output="atom").text
    best = None
    for cik in list(dict.fromkeys(re.findall(r"<cik>(\d+)</cik>", feed)))[:10]:
        subs = _submissions(cik)
        name = subs.get("name") or ""
        score = formd_adapter.name_score(company, name)
        has_d = any(f in ("D", "D/A") for f in subs.get("filings", {}).get("recent", {}).get("form", []))
        if score < 0.8 or not has_d or formd_adapter.FUND_WORDS.search(name):
            continue
        if not best or score > best[0]:
            best = (score, cik, subs)
    return (best[1], best[2]) if best else None


def _t(node, path: str) -> str | None:
    el = node.find(path)
    return el.text.strip() if el is not None and el.text else None


def _filing_rows(cik: str, acc: str, filed: str) -> tuple[dict, list[dict]]:
    """One Form D (raw XML) → (filing row, related-person rows) in formd_adapter's shape."""
    nodash = acc.replace("-", "")
    doc = ET.fromstring(_sec(f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{nodash}/primary_doc.xml").content)
    issuer, offering = doc.find("primaryIssuer"), doc.find("offeringData")
    amounts = offering.find("offeringSalesAmounts")
    offered = _t(amounts, "totalOfferingAmount")
    exemptions = " ".join(e.text or "" for e in offering.findall("federalExemptionsExclusions/item"))
    row = {
        "accession_number": acc, "cik": cik, "entity_name": _t(issuer, "entityName"), "filing_date": filed,
        "is_amendment": _t(offering, "typeOfFiling/newOrAmendment/isAmendment") == "true",
        "previous_accession_number": _t(offering, "typeOfFiling/newOrAmendment/previousAccessionNumber"),
        "first_sale_date": _t(offering, "typeOfFiling/dateOfFirstSale/value"),
        "total_offering_amount_usd": float(offered) if offered and offered.replace(".", "").isdigit() else None,
        "offering_amount_indefinite": not (offered and offered.replace(".", "").isdigit()),
        "total_amount_sold_usd": float(_t(amounts, "totalAmountSold") or 0),
        "total_remaining_usd": float(r) if (r := _t(amounts, "totalRemaining")) and r.replace(".", "").isdigit() else None,
        "num_investors": int(_t(offering, "investors/totalNumberAlreadyInvested") or 0) or None,
        "industry_group": _t(offering, "industryGroup/industryGroupType"),
        "investment_fund_type": _t(offering, "industryGroup/investmentFundInfo/investmentFundType"),
        "federal_exemptions": exemptions,
        "city": _t(issuer, "issuerAddress/city"), "state_or_country": _t(issuer, "issuerAddress/stateOrCountry"),
        "year_of_inc": _t(issuer, "yearOfInc/value"),
        "filing_url": f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{nodash}/xslFormDX01/primary_doc.xml",
    }
    persons = []
    for i, p in enumerate(doc.findall("relatedPersonsList/relatedPersonInfo"), 1):
        rels = " ".join(r.text or "" for r in p.findall("relatedPersonRelationshipList/relationship"))
        persons.append({
            "accession_number": acc, "person_seq": i,
            "first_name": _t(p, "relatedPersonName/firstName"), "middle_name": _t(p, "relatedPersonName/middleName"),
            "last_name": _t(p, "relatedPersonName/lastName"), "relationships": rels,
            "is_director": "Director" in rels, "is_executive_officer": "Executive" in rels, "is_promoter": "Promoter" in rels,
        })
    return row, persons


def form_d(company: str) -> dict | None:
    found = find_cik(company)
    if not found:
        return None
    cik, subs = found
    recent = subs.get("filings", {}).get("recent", {})
    picks = [(acc, filed) for form, acc, filed in zip(recent.get("form", []), recent.get("accessionNumber", []),
                                                      recent.get("filingDate", [])) if form in ("D", "D/A")][:MAX_FILINGS]
    rows, persons = [], []
    for acc, filed in picks:
        try:
            row, ppl = _filing_rows(cik, acc, filed)
        except Exception as e:  # one unreadable filing shouldn't lose the rest
            log.warning("Form D %s unreadable: %s", acc, e)
            continue
        rows.append(row)
        persons += ppl
    if not rows:
        return None
    out = formd_adapter.to_form_d(company, rows, persons, company_row={
        "cik": cik, "edgar_company_url": f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=D"})
    if out:
        out["entity_name"] = out.get("entity_name") or subs.get("name")
        out["via"] = "sec_edgar"
    return out


# ── Press via Bright Data ────────────────────────────────────────────────────

FUNDING = re.compile(r"\b(raise[sd]?|raising|funding|series [a-f]|seed round|pre-seed|valuation|investment|backed)\b", re.I)
# Words that tell the company apart from same-named things in the news ("Daytona" Beach, a county "clerk").
PRESS_CONTEXT = {
    "daytona": "AI OR agents OR sandbox OR developer",
    "clerk": "Menlo OR authentication OR \"Series C\" OR \"Series B\"",
    "athena": "legal OR law OR lawyers",
    "legora": "legal OR law OR AI",
    "base44": "AI OR app OR Wix",
    "tailor-brands": "branding OR logo OR small business",
    "pavoot": "startup OR app",
}
AMOUNT = re.compile(r"\$\s?(\d+(?:\.\d+)?)\s?(m|mn|million|b|bn|billion)\b", re.I)


VALUATION = re.compile(r"^\s*(pre-money\s+|post-money\s+)?valu(e|ation)\b", re.I)


def _amount(text: str) -> int | None:
    """The money raised in a headline; a valuation ("$5.55 billion valuation", "at a $8.5B value") is skipped, and a
    headline about a valuation with no funding wording ("hits $15.5B valuation, months after reaching $11B") has none."""
    if re.search(r"valu", text or "", re.I) and not re.search(r"\b(rais|extend|secur|clos|land|bag)|\b(funding|round|series)\b", text or "", re.I):
        return None
    for m in AMOUNT.finditer(text or ""):
        before, after = text[max(0, m.start() - 12):m.start()], text[m.end():m.end() + 12]
        if VALUATION.search(after) or re.search(r"\b(at|valued at|valuing \w+ at)\s+(a\s+)?(roughly\s+)?$", before, re.I):
            continue
        return int(float(m.group(1)) * (1e9 if m.group(2).lower().startswith("b") else 1e6))
    return None


def press(company: str) -> list[dict]:
    token = os.environ.get("BRIGHTDATA_API_TOKEN")
    zone = os.environ.get("BRIGHTDATA_ZONE")
    if not token or not zone:
        return []
    context = PRESS_CONTEXT.get(slug(company))
    q = quote_plus(f'"{company}" (raises OR funding OR "Series A" OR "Series B" OR "Series C" OR seed)' + (f" ({context})" if context else ""))
    r = httpx.post("https://api.brightdata.com/request", timeout=45, headers={"Authorization": f"Bearer {token}"},
                   json={"zone": zone, "format": "raw",
                         "url": f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"})
    r.raise_for_status()
    out = []
    for item in ET.fromstring(r.content).iter("item"):
        title = (item.findtext("title") or "").strip()
        headline = title.rsplit(" - ", 1)[0]
        # The company has to lead the headline ("Clerk raises…", not "County Clerk raises…") and name an amount.
        field = AMBIGUOUS.get(slug(company))
        if (not re.match(rf"\W*{re.escape(company)}\b", headline, re.I) or not FUNDING.search(headline) or not _amount(headline)
                or (field and not field.search(headline)) or any(o["snippet"] == headline for o in out)):
            continue
        try:
            date = parsedate_to_datetime(item.findtext("pubDate") or "").date().isoformat()
        except (TypeError, ValueError):
            date = None
        out.append({"title": title, "url": item.findtext("link"), "date": date,
                    "source": item.findtext("source"), "snippet": headline,
                    "amount_mentioned": _amount(headline), "via": "brightdata"})
        if len(out) == 6:
            break
    return out


# ── LinkedIn via the company's own homepage ──────────────────────────────────

LI_LINK = re.compile(r"linkedin\.com/company/([A-Za-z0-9_\-]+)", re.I)
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def _unlocker(url: str) -> str:
    r = httpx.post("https://api.brightdata.com/request", timeout=60,
                   headers={"Authorization": f"Bearer {os.environ['BRIGHTDATA_API_TOKEN']}"},
                   json={"zone": os.environ["BRIGHTDATA_ZONE"], "format": "raw", "url": url})
    r.raise_for_status()
    return r.text


def linkedin_slug(domain: str) -> str | None:
    """The LinkedIn company page the homepage links to (the most-linked one if there are several)."""
    import fetch_url  # the network guard for user-supplied hosts
    host = re.sub(r"^https?://", "", domain).split("/")[0].lower()
    fetch_url._public(host)
    r = httpx.get(f"https://{host}/", follow_redirects=True, timeout=15, headers={"User-Agent": BROWSER_UA})
    slugs = [m.lower() for m in LI_LINK.findall(r.text)]
    return max(set(slugs), key=slugs.count) if slugs else None


def linkedin(company: str, domain: str | None) -> dict | None:
    domain = domain or KNOWN_DOMAINS.get(slug(company))
    if not domain or not os.environ.get("BRIGHTDATA_API_TOKEN") or not os.environ.get("BRIGHTDATA_ZONE"):
        return None
    page = linkedin_slug(domain)
    if not page:
        return None
    html = _unlocker(f"https://www.linkedin.com/company/{page}/")
    org = None
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        org = next((o for o in (data.get("@graph") or [data]) if o.get("@type") == "Organization"), None) or org
    employees = ((org or {}).get("numberOfEmployees") or {}).get("value")
    if not isinstance(employees, int):
        return None
    size = re.search(r"Company size\s*</dt>\s*<dd[^>]*>\s*([^<]+)", html)
    return {"employees": employees, "company_size": size.group(1).strip() if size else None,
            "name": org.get("name"), "website": org.get("sameAs"),
            "url": f"https://www.linkedin.com/company/{page}/", "linked_from": f"https://{domain}/",
            "fetched_at": datetime.now(timezone.utc).isoformat(), "via": "brightdata"}


# ── Lookup with cache and snapshot ───────────────────────────────────────────

def _read(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def lookup(company: str, domain: str | None = None, use_cache: bool = True) -> dict:
    company = common_name(company)
    key = slug(company)
    cached = _read(CACHE / f"{key}.json")
    # A lookup cached without a domain had no way to find LinkedIn/Crunchbase; redo it once the domain is known.
    if use_cache and cached and (cached.get("domain") or not (domain or KNOWN_DOMAINS.get(key))):
        age = datetime.now(timezone.utc) - datetime.fromisoformat(cached["fetched_at"])
        if age.days < CACHE_DAYS:
            return cached
    snap = _read(SNAPSHOTS / f"{key}.json") or {}
    domain = domain or KNOWN_DOMAINS.get(key)
    result = {"company": company, "domain": domain}
    # Data's OSO tables first (LinkedIn/Crunchbase profiles confirmed by website); live fetches fill the gaps.
    try:
        found = oso.profiles(domain)
    except Exception as e:
        log.warning("OSO profiles failed for %s: %s", company, e)
        found = {"linkedin": None, "crunchbase": None}
    result["crunchbase"] = found["crunchbase"]
    for name, fetch in (("form_d", lambda: form_d(company)),
                        ("linkedin", lambda: found["linkedin"] or linkedin(company, domain)),
                        ("press", lambda: press(company))):
        try:
            result[name] = fetch()
        except Exception as e:  # partial results: one source failing must not break the rest
            log.warning("%s lookup failed for %s: %s", name, company, e)
            result[name] = snap.get(name, (cached or {}).get(name, [] if name == "press" else None))
            result.setdefault("from_snapshot", []).append(name)
    result["fetched_at"] = datetime.now(timezone.utc).isoformat()
    if "from_snapshot" not in result:
        CACHE.mkdir(parents=True, exist_ok=True)
        (CACHE / f"{key}.json").write_text(json.dumps(result, indent=1))
    return result
