from datetime import date

from delta.edgar import parse_form_d, parse_form_index
from delta.edgar.index import index_url


def test_index_keeps_only_form_d(form_index):
    entries = parse_form_index(form_index)

    assert [(e.form_type, e.company_name) for e in entries] == [
        ("D", "Example Robotics, Inc."),
        ("D/A", "Sample Bio Therapeutics Inc"),
    ]


def test_index_entry_urls(form_index):
    entry = parse_form_index(form_index)[0]

    assert entry.accession_number == "0001999001-26-000001"
    assert entry.filed_date == date(2026, 7, 9)
    assert entry.primary_doc_url.endswith("/edgar/data/1999001/000199900126000001/primary_doc.xml")


def test_index_url_uses_quarter():
    assert index_url(date(2026, 10, 9)).endswith("/daily-index/2026/QTR4/form.20261009.idx")


def test_parse_form_d(primary_doc):
    form = parse_form_d(primary_doc)

    assert form.entity_name == "Example Robotics, Inc."
    assert form.industry_group == "Other Technology"
    assert form.date_of_first_sale == "2026-06-02"
    assert (form.total_offering_amount, form.total_amount_sold, form.total_remaining) == (
        "24000000",
        "12300000",
        "11700000",
    )
    assert form.is_amendment is False
    assert form.is_equity is True
    assert form.is_debt is None
    assert form.federal_exemptions == ["06b"]


def test_parse_related_persons(primary_doc):
    ada, grace = parse_form_d(primary_doc).related_persons

    assert ada.relationships == ["Executive Officer", "Director"]
    assert ada.middle_name is None
    assert grace.middle_name == "B"
    assert grace.relationships == ["Director"]
