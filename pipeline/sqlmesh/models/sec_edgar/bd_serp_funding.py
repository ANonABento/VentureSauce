import typing as t

import pandas as pd

from delta import sec_edgar, settings
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.bd_serp_funding",
    kind="FULL",
    depends_on=["sec_edgar.startup_universe"],
    columns=sec_edgar.BD_SERP_FUNDING,
    description="Bright Data SERP API: funding press and profile URLs per startup_universe company.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    universe = context.fetchdf(
        f"""
        SELECT cik, company_search_name, city
        FROM {context.resolve_table("sec_edgar.startup_universe")}
        WHERE company_search_name IS NOT NULL
        ORDER BY universe_rank
        LIMIT {settings.BRIGHT_DATA_MAX_COMPANIES}
        """
    )
    yield from sec_edgar.bd_serp_funding(universe.to_dict("records"))
