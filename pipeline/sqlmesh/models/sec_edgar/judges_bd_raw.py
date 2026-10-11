import typing as t

import pandas as pd

from delta import sec_edgar
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.judges_bd_raw",
    kind="FULL",
    columns=sec_edgar.JUDGES_BD_RAW,
    description="Bright Data Dataset Filter: judges and mentors, their companies and proxy companies.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    yield from sec_edgar.judges_bd_raw()
