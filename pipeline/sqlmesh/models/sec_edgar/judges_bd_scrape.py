import typing as t

import pandas as pd

from delta import sec_edgar
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.judges_bd_scrape",
    kind="FULL",
    columns=sec_edgar.JUDGES_BD_SCRAPE,
    description="Bright Data Scraper API gap fill (LinkedIn and Crunchbase by exact URL) for judges_companies.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    yield from sec_edgar.judges_bd_scrape()
