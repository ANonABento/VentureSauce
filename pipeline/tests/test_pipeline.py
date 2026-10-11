from datetime import date
from unittest.mock import patch

import dagster as dg
import pytest

from delta import settings, warehouse
from delta.assets import form_d
from delta.edgar import parse_form_d, parse_form_index
from delta.resources import EdgarResource


@pytest.fixture
def isolated_settings(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "DATA_DIR", tmp_path)
    monkeypatch.setattr(settings, "LOCAL_DATABASE_PATH", tmp_path / "delta.duckdb")
    monkeypatch.setattr(settings, "MOTHERDUCK_TOKEN", None)
    return settings


def test_form_d_lands_in_raw(isolated_settings, form_index, primary_doc):
    entry = parse_form_index(form_index)[0]
    filed = [(entry, parse_form_d(primary_doc))]

    with patch("delta.edgar.EdgarClient.form_d_filings", return_value=iter(filed)):
        result = dg.materialize([form_d], partition_key="2026-07-09", resources={"edgar": EdgarResource()})

    assert result.success

    with warehouse.connect() as con:
        filings = con.sql("SELECT entity_name, filed_date, federal_exemptions FROM raw.form_d_filings").fetchall()
        persons = con.sql("SELECT relationships FROM raw.form_d_related_persons ORDER BY person_index").fetchall()

    assert filings == [("Example Robotics, Inc.", date(2026, 7, 9), ["06b"])]
    assert persons == [(["Executive Officer", "Director"],), (["Director"],)]
