import typing as t

import pandas as pd

from delta import sec_edgar
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.judges_bd_enrich",
    kind="FULL",
    columns=sec_edgar.JUDGES_BD_ENRICH,
    description="Bright Data: Crunchbase keyword discovery, Google News funding headlines, founder profiles.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    yield from sec_edgar.judges_bd_enrich()
