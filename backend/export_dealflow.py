"""Export Data's pipeline (OSO) to static/demo/data/dealflow.json for the demo desk: real startups from SEC Form D,
with LinkedIn and Crunchbase only where a high-confidence profile lists the same website (see sources/oso.py).

    uv run python export_dealflow.py

Nothing here is invented: every figure is a column from the pipeline, and every row links to its SEC filing.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(".env")

from sources import minimal_live, oso  # noqa: E402

OUT = Path(__file__).parent / "static" / "demo" / "data" / "dealflow.json"
UNIVERSE = f"""SELECT universe_rank, company_search_name, cik, city, state_or_country, sector, industry_group, year_of_inc,
  website, li_website, li_match_confidence, li_employees_on_linkedin, linkedin_url, cb_website, cb_match_confidence,
  cb_total_funding_usd, crunchbase_url, latest_round_filed_date, latest_round_first_sale_date, latest_round_security_type,
  latest_round_sold_usd, latest_round_target_usd, latest_round_is_open, total_raised_usd, num_offerings, total_investors,
  insiders, latest_filing_url, edgar_company_url, is_under_the_radar, press_result_titles
  FROM {oso.SCHEMA}.startup_companies_enriched"""
JUDGES = f"""SELECT company, domain, li_domain, cb_domain, relation, category, sec_cik, linkedin_url, li_employees_on_linkedin,
  crunchbase_url, cb_disclosed_funding_usd FROM {oso.SCHEMA}.judges_companies"""
RELATION = {"judge company": "judge's company", "proxy": "comparable", "mentor company": "mentor's company", "parent company": "parent company"}


def confirmed_site(r: dict) -> str | None:
    """The website only when a high-confidence LinkedIn or Crunchbase profile lists the same one."""
    site = oso.host(r.get("website"))
    for prefix in ("li", "cb"):
        if site and r.get(f"{prefix}_match_confidence") == "high" and oso.host(r.get(f"{prefix}_website")) == site:
            return site
    return None


NEWS_VERB = __import__("re").compile(r"\b(raises|raised|closes|secures|lands|bags|announces)\b", 2)
# Data-aggregator pages restate the Form D itself ("Raised $4.64M: SEC Form D"); checking them against the SEC is circular.
DATABASE_PAGE = __import__("re").compile(r"form d|revenue|investors & contacts|company profile|\(20\d\d\)|8-k", 2)


def headline(r: dict) -> str | None:
    """The clearest funding headline Bright Data's SERP API found: it must lead with the company's name, use funding
    wording and state an amount raised (the same rule as live press, sources/minimal_live.py)."""
    name = r.get("company_search_name") or ""
    for title in (r.get("press_result_titles") or "").split(" || "):
        title = title.strip()
        if (title.lower().startswith(name.lower()) and NEWS_VERB.search(title) and not DATABASE_PAGE.search(title)
                and minimal_live._amount(title) and not title.endswith("...")):
            return title
    return None


def row(r: dict, judges: dict) -> dict:
    site = confirmed_site(r)
    li_ok = site and r.get("li_match_confidence") == "high" and oso.host(r.get("li_website")) == site
    cb_ok = site and r.get("cb_match_confidence") == "high" and oso.host(r.get("cb_website")) == site
    j = judges.get(str(int(r["cik"]))) if r.get("cik") else None
    if j:  # the judges table was matched by hand-checked website and people: prefer its profiles
        site = oso.host(j.get("domain")) or site
        if site and oso.host(j.get("li_domain")) == site and j.get("li_employees_on_linkedin") is not None:
            li_ok, r = True, {**r, "li_employees_on_linkedin": j["li_employees_on_linkedin"], "linkedin_url": j.get("linkedin_url")}
        if site and oso.host(j.get("cb_domain")) == site and j.get("crunchbase_url"):
            cb_ok, r = True, {**r, "cb_total_funding_usd": j.get("cb_disclosed_funding_usd"), "crunchbase_url": j["crunchbase_url"]}
    return {
        "rank": r["universe_rank"], "name": r["company_search_name"], "cik": str(int(r["cik"])),
        "city": (r.get("city") or "").title(), "state": r.get("state_or_country"), "sector": r.get("industry_group") or r.get("sector"),
        "founded": r.get("year_of_inc"), "site": site,
        "filed": r.get("latest_round_filed_date"), "first_sale": r.get("latest_round_first_sale_date"),
        "security": r.get("latest_round_security_type"), "sold": r.get("latest_round_sold_usd"),
        "target": r.get("latest_round_target_usd"), "open": r.get("latest_round_is_open"),
        "total": r.get("total_raised_usd"), "offerings": r.get("num_offerings"), "investors": r.get("total_investors"),
        "people": r.get("insiders"), "form_d": r.get("latest_filing_url"), "edgar": r.get("edgar_company_url"),
        "li": {"employees": r["li_employees_on_linkedin"], "url": r.get("linkedin_url")} if li_ok and r.get("li_employees_on_linkedin") is not None else None,
        "cb": {"total": r.get("cb_total_funding_usd"), "url": r.get("crunchbase_url")} if cb_ok and r.get("crunchbase_url") else None,
        "quiet": bool(r.get("is_under_the_radar")), "headline": headline(r),
        "judges": j and {"relation": RELATION.get(j["relation"], j["relation"]), "category": j["category"]},
    }


if __name__ == "__main__":
    judges = {str(int(j["sec_cik"])): j for j in oso._query(JUDGES) if j.get("sec_cik")}
    rows = sorted((row(r, judges) for r in oso._query(UNIVERSE)), key=lambda r: r["filed"] or "", reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"fetched_at": datetime.now(timezone.utc).isoformat(), "source": "OSO: " + oso.SCHEMA,
                               "rows": rows}, separators=(",", ":")))
    print(f"{len(rows)} startups → {OUT} ({OUT.stat().st_size // 1024} KB); "
          f"{sum(bool(r['site']) for r in rows)} confirmed websites, {sum(bool(r['li']) for r in rows)} LinkedIn, "
          f"{sum(bool(r['cb']) for r in rows)} Crunchbase, {sum(r['quiet'] for r in rows)} with no press yet, "
          f"{sum(bool(r['judges']) for r in rows)} tied to judges, {sum(bool(r['headline']) for r in rows)} funding headlines")
