import typing as t
from datetime import date

import pandas as pd

from delta import sec_edgar
from sqlmesh import ExecutionContext, model


@model(
    "sec_edgar.form_d_related_persons",
    kind="FULL",
    columns=sec_edgar.FORM_D_RELATED_PERSONS,
    description="One row per executive officer, director or promoter named on a Form D filing.",
)
def execute(context: ExecutionContext, **kwargs: t.Any) -> t.Iterator[pd.DataFrame]:
    yield from sec_edgar.form_d_related_persons(date.today())
