import asyncio
import json
import re
import time
import urllib.parse
from datetime import datetime, timedelta
from typing import Any

from delta.brightdata import judges
from delta.brightdata.client import BrightData, error_of

LINKEDIN_COMPANY = "gd_l1vikfnt1wgvvqz95w"
LINKEDIN_PEOPLE = "gd_l1viktl72bvl7bjuj0"
CRUNCHBASE = "gd_l1vijqt9jfj7olije"

PROFILE_PATTERNS = {
    "linkedin": (
        r"https?://(?:[a-z]{2,3}\.)?linkedin\.com/company/([A-Za-z0-9\-_%.]+)",
        "https://www.linkedin.com/company/",
    ),
    "crunchbase": (
        r"https?://(?:www\.)?crunchbase\.com/organization/([A-Za-z0-9\-_%]+)",
        "https://www.crunchbase.com/organization/",
    ),
}


def norm(name: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name or "").lower())


def strip_suffix(name: str) -> str:
    return re.sub(r"[,.]?\s+(inc|corp|corporation|llc|ltd|co|company|pbc)\.?$", "", name.strip(), flags=re.I).strip()


def variants(row: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for raw in (row.get("company_search_name"), row.get("company_name")):
        if not raw:
            continue
        for value in (str(raw), strip_suffix(str(raw))):
            for candidate in (value, value.title() if value.isupper() else value):
                if candidate and candidate not in out:
                    out.append(candidate)
    return out


def linkedin_slug(url: Any) -> str:
    match = re.search(r"linkedin\.com/company/([^/?#]+)", str(url or ""))
    return match.group(1).lower() if match else ""


def crunchbase_slug(url: Any) -> str:
    match = re.search(r"crunchbase\.com/organization/([^/?#]+)", str(url or ""))
    return match.group(1).lower() if match else ""


def split_urls(value: Any) -> list[str]:
    return [u.strip() for u in str(value or "").split(";") if u.strip()]


def to_int(value: Any) -> int | None:
    try:
        return int(float(value)) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def to_float(value: Any) -> float | None:
    try:
        return float(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def dumps(value: Any) -> str | None:
    return json.dumps(value) if value not in (None, [], {}) else None


def text(value: Any) -> str | None:
    if value in (None, ""):
        return None
    return value if isinstance(value, str) else json.dumps(value)


def google_url(query: str, news: bool = False) -> str:
    vertical = "&tbm=nws" if news else ""
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}{vertical}&gl=us&hl=en&brd_json=1"


def profile_urls(links: list[str], kind: str) -> list[str]:
    pattern, base = PROFILE_PATTERNS[kind]
    out: list[str] = []
    for link in links:
        if match := re.match(pattern, link or ""):
            url = base + match.group(1).strip(".").lower()
            if url not in out:
                out.append(url)
    return out[:5]


def all_links(doc: dict[str, Any] | None) -> list[str]:
    if not doc:
        return []
    links = [o.get("link") for o in doc.get("organic") or []]
    links += [i.get("link") for i in (doc.get("top_stories") or {}).get("items") or []]
    return [str(link) for link in links if link]


def news_date(value: Any, fetched_at: str | None) -> str | None:
    raw = str(value or "").strip()
    reference = datetime.fromisoformat((fetched_at or "").replace("Z", "+00:00")) if fetched_at else datetime.now()
    if match := re.match(r"(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago", raw, re.I):
        n, unit = int(match.group(1)), match.group(2).lower()
        days = {"minute": 0, "hour": 0, "day": n, "week": 7 * n, "month": 30 * n, "year": 365 * n}[unit]
        return (reference - timedelta(days=days)).date().isoformat()
    for fmt in ("%b %d, %Y", "%B %d, %Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw[:20], fmt).date().isoformat()
        except ValueError:
            continue
    return None


def flatten_linkedin(record: dict[str, Any]) -> dict[str, Any]:
    industries = record.get("industries")
    return {
        "li_id": text(record.get("id")),
        "li_name": record.get("name"),
        "li_url": record.get("url"),
        "li_followers": to_int(record.get("followers")),
        "li_employees_on_linkedin": to_int(record.get("employees_in_linkedin")),
        "li_company_size": text(record.get("company_size")),
        "li_organization_type": text(record.get("organization_type")),
        "li_industries": industries if isinstance(industries, str) else dumps(industries),
        "li_website": record.get("website"),
        "li_founded": to_int(record.get("founded")),
        "li_headquarters": text(record.get("headquarters")),
        "li_country_code": text(record.get("country_code")),
        "li_slogan": text(record.get("slogan")),
        "li_about": text(record.get("about")),
        "li_specialties": text(record.get("specialties")),
        "li_crunchbase_url": record.get("crunchbase_url"),
        "li_funding_json": dumps(record.get("funding")),
        "li_investors_json": dumps(record.get("investors")),
        "li_locations_json": dumps(record.get("locations")),
    }


def crunchbase_linkedin(record: dict[str, Any]) -> str | None:
    return next(
        (str(link) for link in record.get("social_media_links") or [] if "linkedin.com/company" in str(link)), None
    )


def flatten_crunchbase(record: dict[str, Any]) -> dict[str, Any]:
    industries = record.get("industries") or []
    names = [str(i.get("value")) for i in industries if isinstance(i, dict) and i.get("value")]
    return {
        "cb_id": text(record.get("id")),
        "cb_name": record.get("name"),
        "cb_legal_name": text(record.get("legal_name")),
        "cb_url": record.get("url"),
        "cb_rank": to_float(record.get("cb_rank")),
        "cb_about": text(record.get("about")),
        "cb_full_description": text(record.get("full_description")),
        "cb_industries": "; ".join(names) or text(industries or None),
        "cb_operating_status": text(record.get("operating_status")),
        "cb_company_type": text(record.get("company_type")),
        "cb_ipo_status": text(record.get("ipo_status")),
        "cb_founded_date": text(record.get("founded_date")),
        "cb_num_employees": text(record.get("num_employees")),
        "cb_country_code": text(record.get("country_code")),
        "cb_region": text(record.get("region")),
        "cb_location": text(record.get("address") or record.get("location")),
        "cb_website": record.get("website"),
        "cb_linkedin_url": crunchbase_linkedin(record),
        "cb_contact_email": text(record.get("contact_email")),
        "cb_monthly_visits": to_float(record.get("monthly_visits")),
        "cb_monthly_visits_growth": to_float(record.get("monthly_visits_growth")),
        "cb_num_investors": to_float(record.get("num_investors")),
        "cb_num_news": to_float(record.get("num_news")),
        "cb_heat_score": to_float(record.get("heat_score")),
        "cb_heat_trend": text(record.get("heat_trend")),
        "cb_growth_score": to_float(record.get("growth_score")),
        "cb_growth_trend": text(record.get("growth_trend")),
        "cb_activity_level": text(record.get("company_activity_level")),
        "cb_investors_json": dumps(record.get("investors")),
        "cb_founders_json": dumps(record.get("founders")),
        "cb_funds_total_json": dumps(record.get("funds_total")),
        "cb_funding_rounds_json": dumps(record.get("funding_rounds")),
        "cb_funding_rounds_list_json": dumps(record.get("funding_rounds_list")),
        "cb_financials_json": dumps(record.get("financials_highlights")),
    }


async def search_company(bd: BrightData, row: dict[str, Any]) -> dict[str, Any] | None:
    name = str(row["company_search_name"])
    query = f'"{name}" funding round raises'
    started = time.monotonic()
    result = await bd.serp(google_url(query))
    if result is None:
        return None
    doc = result.doc or {}
    organic = doc.get("organic") or []
    stories = (doc.get("top_stories") or {}).get("items") or []
    links = all_links(doc)
    linkedin, crunchbase = profile_urls(links, "linkedin"), profile_urls(links, "crunchbase")
    out: dict[str, Any] = {
        "cik": str(row["cik"]),
        "company_search_name": name,
        "query": query,
        "status": int(result.status),
        "error": result.error,
        "organic_count": len(organic),
        "result_titles": " || ".join(str(o["title"]) for o in organic if o.get("title")) or None,
        "snippets": " || ".join(str(o["description"]) for o in organic if o.get("description")) or None,
        "top_stories": " || ".join(str(s["title"]) for s in stories if s.get("title")) or None,
        "organic_json": json.dumps(
            [{k: o.get(k) for k in ("global_rank", "title", "link", "description")} for o in organic]
        )
        if organic
        else None,
        "profile_query": None,
        "profile_status": None,
        "profile_error": None,
    }
    if not linkedin:
        city = str(row.get("city") or "").title()
        profile_query = " ".join(f'"{name}" {city} linkedin company'.split())
        profile = await bd.serp(google_url(profile_query))
        if profile is not None:
            profile_links = all_links(profile.doc)
            linkedin = profile_urls(profile_links, "linkedin")
            crunchbase = crunchbase or profile_urls(profile_links, "crunchbase")
            out |= {
                "profile_query": profile_query,
                "profile_status": int(profile.status),
                "profile_error": profile.error,
            }
    return out | {
        "linkedin_urls": "; ".join(linkedin) or None,
        "crunchbase_urls": "; ".join(crunchbase) or None,
        "seconds": round(time.monotonic() - started, 2),
        "searched_at": result.fetched_at,
    }


async def serp_funding(bd: BrightData, universe: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = await asyncio.gather(*(search_company(bd, row) for row in universe))
    return [row for row in rows if row is not None]


def name_index(universe: list[dict[str, Any]], url_columns: list[str], slug) -> tuple[dict, dict, list[str]]:
    by_name: dict[str, set[str]] = {}
    by_slug: dict[str, set[str]] = {}
    names: list[str] = []
    for row in universe:
        for variant in variants(row):
            by_name.setdefault(norm(variant), set()).add(row["cik"])
            if variant not in names:
                names.append(variant)
        for column in url_columns:
            for url in split_urls(row.get(column)):
                if slug(url):
                    by_slug.setdefault(slug(url), set()).add(row["cik"])
    return by_name, by_slug, names


async def linkedin_companies(
    bd: BrightData, universe: list[dict[str, Any]], max_scrape_urls: int = 700
) -> list[dict[str, Any]]:
    by_name, by_slug, names = name_index(universe, ["linkedin_urls"], linkedin_slug)
    rows: list[dict[str, Any]] = []
    covered: set[str] = set()
    for record in await bd.filter_names(LINKEDIN_COMPANY, names):
        slug = linkedin_slug(record.get("url")) or str(record.get("id") or "").lower()
        covered.add(slug)
        hits = {(cik, "name") for cik in by_name.get(norm(record.get("name")), set())}
        hits |= {(cik, "serp_url") for cik in by_slug.get(slug, set())}
        for cik, method in sorted(hits):
            rows.append(
                {"cik": cik, "source": "dataset", "match_method": method, "input_url": None, "error": None}
                | flatten_linkedin(record)
            )
    todo: list[str] = []
    for row in universe:
        first = next((u for u in split_urls(row.get("linkedin_urls")) if linkedin_slug(u)), None)
        if first and linkedin_slug(first) not in covered and first not in todo:
            todo.append(first)
    scraped = await bd.scrape_urls(LINKEDIN_COMPANY, todo[:max_scrape_urls])
    for input_url, record in scraped.items():
        ciks = by_slug.get(linkedin_slug(input_url), set()) | by_slug.get(linkedin_slug(record.get("url")), set())
        for cik in sorted(ciks):
            rows.append(
                {"cik": cik, "source": "scraper", "match_method": "serp_url", "input_url": input_url}
                | {"error": error_of(record)}
                | flatten_linkedin(record)
            )
    return rows


async def crunchbase_companies(
    bd: BrightData, universe: list[dict[str, Any]], max_scrape_urls: int = 500
) -> list[dict[str, Any]]:
    by_name, by_slug, names = name_index(universe, ["crunchbase_urls", "li_crunchbase_urls"], crunchbase_slug)
    rows: list[dict[str, Any]] = []
    covered: set[str] = set()
    for record in await bd.filter_names(CRUNCHBASE, names):
        slug = crunchbase_slug(record.get("url")) or str(record.get("id") or "").lower()
        covered.add(slug)
        hits = {(cik, "name") for cik in by_name.get(norm(record.get("name")), set())}
        hits |= {(cik, "profile_url") for cik in by_slug.get(slug, set())}
        for cik, method in sorted(hits):
            rows.append(
                {"cik": cik, "source": "dataset", "match_method": method, "input_url": None, "error": None}
                | flatten_crunchbase(record)
            )
    todo = [f"https://www.crunchbase.com/organization/{s}" for s in by_slug if s not in covered][:max_scrape_urls]
    for input_url, record in (await bd.scrape_urls(CRUNCHBASE, todo)).items():
        ciks = by_slug.get(crunchbase_slug(input_url), set()) | by_slug.get(crunchbase_slug(record.get("url")), set())
        for cik in sorted(ciks):
            rows.append(
                {"cik": cik, "source": "scraper", "match_method": "profile_url", "input_url": input_url}
                | {"error": error_of(record)}
                | flatten_crunchbase(record)
            )
    return rows


def raw_row(source: str, record: dict[str, Any], **extra: Any) -> dict[str, Any]:
    return {
        "source": source,
        "name": record.get("name"),
        "url": record.get("url"),
        "record_json": json.dumps(record),
    } | extra


async def judges_raw(bd: BrightData) -> list[dict[str, Any]]:
    linkedin_urls = judges.LINKEDIN_URLS + [u + "/" for u in judges.LINKEDIN_URLS]
    jobs = {
        "linkedin_person": bd.filter_cached(
            LINKEDIN_PEOPLE, {"name": "name", "operator": "in", "value": judges.JUDGES + judges.MENTORS}, 150
        ),
        "linkedin_company": bd.filter_cached(
            LINKEDIN_COMPANY,
            {
                "operator": "or",
                "filters": [
                    {"name": "name", "operator": "in", "value": judges.COMPANY_NAMES},
                    {"name": "url", "operator": "in", "value": linkedin_urls},
                ],
            },
            400,
        ),
        "crunchbase": bd.filter_cached(
            CRUNCHBASE, {"name": "name", "operator": "in", "value": judges.COMPANY_NAMES}, 300
        ),
    }
    results = await asyncio.gather(*jobs.values())
    return [raw_row(source, record) for source, records in zip(jobs, results, strict=True) for record in records or []]


async def judges_scrape(bd: BrightData) -> list[dict[str, Any]]:
    linkedin, crunchbase = await asyncio.gather(
        bd.scrape_urls(LINKEDIN_COMPANY, judges.SCRAPE_LINKEDIN_URLS),
        bd.scrape_urls(CRUNCHBASE, judges.SCRAPE_CRUNCHBASE_URLS),
    )
    return [
        raw_row(source, record, input_url=input_url, error=error_of(record))
        for source, scraped in (("linkedin_company", linkedin), ("crunchbase", crunchbase))
        for input_url, record in scraped.items()
    ]


async def company_news(bd: BrightData, company: str) -> list[dict[str, Any]]:
    result = await bd.serp(google_url(f'"{company}" funding OR raises OR investment', news=True))
    if result is None:
        return []
    if result.doc is None:
        return [
            {"source": "news", "query": company, "name": None, "url": None, "event_date": None}
            | {"error": result.error, "record_json": None}
        ]
    items = result.doc.get("news") or result.doc.get("organic") or []
    return [
        {
            "source": "news",
            "query": company,
            "name": item.get("title"),
            "url": item.get("link"),
            "event_date": news_date(item.get("date"), result.fetched_at),
            "error": None,
            "record_json": json.dumps({k: item.get(k) for k in ("title", "link", "source", "date", "description")}),
        }
        for item in items[:10]
    ]


async def judges_enrich(bd: BrightData) -> list[dict[str, Any]]:
    discovered, founders, *news = await asyncio.gather(
        bd.discover(CRUNCHBASE, judges.CRUNCHBASE_KEYWORDS, limit_per_input=3),
        bd.filter_cached(LINKEDIN_PEOPLE, {"name": "name", "operator": "in", "value": judges.FOUNDERS}, 400),
        *(company_news(bd, company) for company in judges.NEWS_COMPANIES),
    )
    rows = [
        raw_row("crunchbase_discover", record, query=keyword, event_date=None, error=error_of(record))
        for keyword, record in discovered
    ]
    rows += [
        raw_row("linkedin_person", record, query=None, event_date=None, error=error_of(record))
        for record in founders or []
    ]
    return rows + [row for company_rows in news for row in company_rows]
