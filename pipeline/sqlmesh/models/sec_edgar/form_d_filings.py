import typing as t
from datetime import date

import pandas as pd

from delta import sec_edgar
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.form_d_filings",
    kind="FULL",
    grain="accession_number",
    columns=sec_edgar.FORM_D_FILINGS,
    description="One row per SEC Form D filing from the EDGAR quarterly Form D data sets.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    yield from sec_edgar.form_d_filings(date.today())
