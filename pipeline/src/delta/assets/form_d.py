from dataclasses import asdict
from datetime import UTC, date, datetime

import dagster as dg

from delta import warehouse
from delta.edgar import FormD, IndexEntry
from delta.resources import EdgarResource
from delta.settings import DATABASE

daily = dg.DailyPartitionsDefinition(start_date="2025-01-01", end_offset=1, timezone="America/New_York")

FILINGS = dg.AssetKey([DATABASE, "raw", "form_d_filings"])
PERSONS = dg.AssetKey([DATABASE, "raw", "form_d_related_persons"])


def filing_row(entry: IndexEntry, form: FormD, ingested_at: datetime) -> dict:
    return {
        "accession_number": entry.accession_number,
        "filed_date": entry.filed_date,
        "form_type": entry.form_type,
        "cik": entry.cik,
        "index_company_name": entry.company_name,
        **{key: value for key, value in asdict(form).items() if key != "related_persons"},
        "filing_url": entry.filing_url,
        "primary_doc_url": entry.primary_doc_url,
        "ingested_at": ingested_at,
    }


def person_rows(entry: IndexEntry, form: FormD, ingested_at: datetime) -> list[dict]:
    return [
        {
            "accession_number": entry.accession_number,
            "filed_date": entry.filed_date,
            "cik": entry.cik,
            "person_index": index,
            **asdict(person),
            "ingested_at": ingested_at,
        }
        for index, person in enumerate(form.related_persons)
    ]


@dg.multi_asset(
    specs=[
        dg.AssetSpec(FILINGS, description="Form D and D/A filings as filed", kinds={"duckdb"}),
        dg.AssetSpec(PERSONS, description="Directors, executives and promoters on each filing", kinds={"duckdb"}),
    ],
    partitions_def=daily,
    group_name="edgar",
)
def form_d(context: dg.AssetExecutionContext, edgar: EdgarResource):
    day = date.fromisoformat(context.partition_key)
    ingested_at = datetime.now(UTC).replace(tzinfo=None)

    with edgar.client() as client:
        filed = list(client.form_d_filings(day))

    filings = [filing_row(entry, form, ingested_at) for entry, form in filed]
    persons = [row for entry, form in filed for row in person_rows(entry, form, ingested_at)]

    with warehouse.connect() as con:
        warehouse.replace_day(con, "raw.form_d_filings", day, filings)
        warehouse.replace_day(con, "raw.form_d_related_persons", day, persons)

    yield dg.MaterializeResult(asset_key=FILINGS, metadata={"rows": len(filings)})
    yield dg.MaterializeResult(asset_key=PERSONS, metadata={"rows": len(persons)})
