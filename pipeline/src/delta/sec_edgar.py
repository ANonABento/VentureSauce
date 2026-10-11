import asyncio
from collections.abc import Callable, Coroutine, Iterator
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from typing import Any

import pandas as pd

from delta import settings
from delta.brightdata import BrightData, Cache, enrich
from delta.edgar import datasets

FORM_D_FILINGS = {
    "accession_number": "text",
    "data_set_quarter": "text",
    "cik": "text",
    "entity_name": "text",
    "filing_date": "date",
    "submission_type": "text",
    "file_number": "text",
    "street1": "text",
    "city": "text",
    "state_or_country": "text",
    "state_or_country_desc": "text",
    "zipcode": "text",
    "phone": "text",
    "jurisdiction_of_inc": "text",
    "entity_type": "text",
    "year_of_inc_choice": "text",
    "year_of_inc": "bigint",
    "previous_names": "text",
    "industry_group": "text",
    "investment_fund_type": "text",
    "revenue_range": "text",
    "federal_exemptions": "text",
    "is_amendment": "boolean",
    "previous_accession_number": "text",
    "first_sale_date": "date",
    "first_sale_yet_to_occur": "boolean",
    "more_than_one_year": "boolean",
    "is_equity": "boolean",
    "is_debt": "boolean",
    "is_option_warrant": "boolean",
    "is_security_to_be_acquired": "boolean",
    "is_pooled_fund_interest": "boolean",
    "is_other_security": "boolean",
    "other_security_desc": "text",
    "is_business_combination": "boolean",
    "minimum_investment_usd": "double",
    "total_offering_amount_usd": "double",
    "offering_amount_indefinite": "boolean",
    "total_amount_sold_usd": "double",
    "total_remaining_usd": "double",
    "has_non_accredited_investors": "boolean",
    "num_non_accredited_investors": "bigint",
    "num_investors": "bigint",
    "sales_commission_usd": "double",
    "finders_fee_usd": "double",
    "proceeds_to_insiders_usd": "double",
    "proceeds_to_insiders_note": "text",
    "filing_url": "text",
}

FORM_D_RELATED_PERSONS = {
    "accession_number": "text",
    "data_set_quarter": "text",
    "person_seq": "bigint",
    "first_name": "text",
    "middle_name": "text",
    "last_name": "text",
    "full_name": "text",
    "city": "text",
    "state_or_country": "text",
    "relationships": "text",
    "is_executive_officer": "boolean",
    "is_director": "boolean",
    "is_promoter": "boolean",
    "title": "text",
}

BD_SERP_FUNDING = {
    "cik": "text",
    "company_search_name": "text",
    "query": "text",
    "status": "bigint",
    "error": "text",
    "seconds": "double",
    "organic_count": "bigint",
    "result_titles": "text",
    "snippets": "text",
    "top_stories": "text",
    "organic_json": "text",
    "linkedin_urls": "text",
    "crunchbase_urls": "text",
    "profile_query": "text",
    "profile_status": "bigint",
    "profile_error": "text",
    "searched_at": "text",
}

MATCH_COLUMNS = {"cik": "text", "source": "text", "match_method": "text", "input_url": "text", "error": "text"}

BD_LINKEDIN_COMPANIES = MATCH_COLUMNS | {
    "li_id": "text",
    "li_name": "text",
    "li_url": "text",
    "li_followers": "bigint",
    "li_employees_on_linkedin": "bigint",
    "li_company_size": "text",
    "li_organization_type": "text",
    "li_industries": "text",
    "li_website": "text",
    "li_founded": "bigint",
    "li_headquarters": "text",
    "li_country_code": "text",
    "li_slogan": "text",
    "li_about": "text",
    "li_specialties": "text",
    "li_crunchbase_url": "text",
    "li_funding_json": "text",
    "li_investors_json": "text",
    "li_locations_json": "text",
}

BD_CRUNCHBASE_COMPANIES = MATCH_COLUMNS | {
    "cb_id": "text",
    "cb_name": "text",
    "cb_legal_name": "text",
    "cb_url": "text",
    "cb_rank": "double",
    "cb_about": "text",
    "cb_full_description": "text",
    "cb_industries": "text",
    "cb_operating_status": "text",
    "cb_company_type": "text",
    "cb_ipo_status": "text",
    "cb_founded_date": "text",
    "cb_num_employees": "text",
    "cb_country_code": "text",
    "cb_region": "text",
    "cb_location": "text",
    "cb_website": "text",
    "cb_linkedin_url": "text",
    "cb_contact_email": "text",
    "cb_monthly_visits": "double",
    "cb_monthly_visits_growth": "double",
    "cb_num_investors": "double",
    "cb_num_news": "double",
    "cb_heat_score": "double",
    "cb_heat_trend": "text",
    "cb_growth_score": "double",
    "cb_growth_trend": "text",
    "cb_activity_level": "text",
    "cb_investors_json": "text",
    "cb_founders_json": "text",
    "cb_funds_total_json": "text",
    "cb_funding_rounds_json": "text",
    "cb_funding_rounds_list_json": "text",
    "cb_financials_json": "text",
}

JUDGES_BD_RAW = {"source": "text", "name": "text", "url": "text", "record_json": "text"}

JUDGES_BD_SCRAPE = {
    "source": "text",
    "name": "text",
    "url": "text",
    "input_url": "text",
    "error": "text",
    "record_json": "text",
}

JUDGES_BD_ENRICH = {
    "source": "text",
    "query": "text",
    "name": "text",
    "url": "text",
    "event_date": "text",
    "error": "text",
    "record_json": "text",
}


def frames(rows: list[dict[str, Any]], columns: dict[str, str]) -> Iterator[pd.DataFrame]:
    if rows:
        yield pd.DataFrame(rows, columns=list(columns))


def run(work: Callable[[BrightData], Coroutine[Any, Any, list[dict[str, Any]]]]) -> list[dict[str, Any]]:
    async def main() -> list[dict[str, Any]]:
        cache = Cache(settings.CACHE_DIR / "brightdata")
        async with BrightData(settings.BRIGHT_DATA_API_KEY, cache, zone=settings.BRIGHT_DATA_SERP_ZONE) as bd:
            return await work(bd)

    with ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, main()).result()


def form_d_filings(today: date) -> Iterator[pd.DataFrame]:
    for quarter, zf in datasets.available(
        settings.FORM_D_FIRST_QUARTER, today, settings.CACHE_DIR / "sec", settings.SEC_USER_AGENT
    ):
        yield datasets.filings(zf, quarter).to_pandas()


def form_d_related_persons(today: date) -> Iterator[pd.DataFrame]:
    for quarter, zf in datasets.available(
        settings.FORM_D_FIRST_QUARTER, today, settings.CACHE_DIR / "sec", settings.SEC_USER_AGENT
    ):
        yield datasets.related_persons(zf, quarter).to_pandas()


def bd_serp_funding(universe: list[dict[str, Any]]) -> Iterator[pd.DataFrame]:
    yield from frames(run(lambda bd: enrich.serp_funding(bd, universe)), BD_SERP_FUNDING)


def bd_linkedin_companies(universe: list[dict[str, Any]]) -> Iterator[pd.DataFrame]:
    yield from frames(run(lambda bd: enrich.linkedin_companies(bd, universe)), BD_LINKEDIN_COMPANIES)


def bd_crunchbase_companies(universe: list[dict[str, Any]]) -> Iterator[pd.DataFrame]:
    yield from frames(run(lambda bd: enrich.crunchbase_companies(bd, universe)), BD_CRUNCHBASE_COMPANIES)


def judges_bd_raw() -> Iterator[pd.DataFrame]:
    yield from frames(run(enrich.judges_raw), JUDGES_BD_RAW)


def judges_bd_scrape() -> Iterator[pd.DataFrame]:
    yield from frames(run(enrich.judges_scrape), JUDGES_BD_SCRAPE)


def judges_bd_enrich() -> Iterator[pd.DataFrame]:
    yield from frames(run(enrich.judges_enrich), JUDGES_BD_ENRICH)
