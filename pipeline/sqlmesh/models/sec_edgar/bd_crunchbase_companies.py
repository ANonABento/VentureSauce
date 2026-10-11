import typing as t

import pandas as pd

from delta import sec_edgar, settings
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.bd_crunchbase_companies",
    kind="FULL",
    depends_on=["sec_edgar.startup_universe", "sec_edgar.bd_serp_funding", "sec_edgar.bd_linkedin_companies"],
    columns=sec_edgar.BD_CRUNCHBASE_COMPANIES,
    description="Bright Data Crunchbase candidates per startup_universe company (Dataset Filter + Scraper API).",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    universe = context.fetchdf(
        f"""
        SELECT
          u.cik,
          u.company_name,
          u.company_search_name,
          s.crunchbase_urls,
          (
            SELECT STRING_AGG(DISTINCT l.li_crunchbase_url, '; ')
            FROM {context.resolve_table("sec_edgar.bd_linkedin_companies")} AS l
            WHERE l.cik = u.cik AND l.li_crunchbase_url IS NOT NULL
          ) AS li_crunchbase_urls
        FROM {context.resolve_table("sec_edgar.startup_universe")} AS u
        LEFT JOIN {context.resolve_table("sec_edgar.bd_serp_funding")} AS s ON s.cik = u.cik
        WHERE u.company_search_name IS NOT NULL
        ORDER BY u.universe_rank
        LIMIT {settings.BRIGHT_DATA_MAX_COMPANIES}
        """
    )
    yield from sec_edgar.bd_crunchbase_companies(universe.to_dict("records"))
