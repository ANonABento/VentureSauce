"""Data's Form D row shape → our form_d dict."""

from datetime import date

import formd_adapter as fa
import verdicts


def row(acc, cik="1977563", name="Daytona Platforms Inc.", filed="2026-08-17", sold=48_274_000, offered=60_000_000,
        first_sale="2026-07-31", amendment=False, prev=None, **kw):
    return {"accession_number": acc, "cik": cik, "entity_name": name, "filing_date": date.fromisoformat(filed),
            "is_amendment": amendment, "previous_accession_number": prev, "first_sale_date": date.fromisoformat(first_sale),
            "total_offering_amount_usd": float(offered), "offering_amount_indefinite": False,
            "total_amount_sold_usd": float(sold), "total_remaining_usd": float(offered - sold), "num_investors": 6,
            "city": "SAN FRANCISCO", "state_or_country": "CA", "industry_group": "Other Technology",
            "federal_exemptions": "06b", "is_pooled_fund_interest": False, "investment_fund_type": None,
            "filing_url": f"https://www.sec.gov/Archives/edgar/data/1977563/{acc}.xml", **kw}


DAYTONA = [
    row("A2", filed="2026-08-17"),
    row("A1", filed="2026-02-05", sold=23_259_739, offered=23_797_784, first_sale="2026-01-22"),
    row("F1", cik="999", name="Daytona Ventures Fund I, LP", industry_group="Pooled Investment Fund", is_pooled_fund_interest=True),
    row("R1", cik="555", name="Daytona Rehab, LP", industry_group="Health Care"),
]
PERSONS = [  # sec_edgar.form_d_related_persons shape
    {"accession_number": "A2", "person_seq": 1, "full_name": "IVAN BURAZIN", "is_director": True, "is_executive_officer": True, "title": "CEO"},
    {"accession_number": "A2", "person_seq": 2, "first_name": "Matt", "last_name": "Turck", "is_director": True, "is_executive_officer": False},
    {"accession_number": "A2", "person_seq": 3, "full_name": "Pat Finance", "is_director": False, "is_executive_officer": True, "title": "CFO"},
]


def test_picks_the_startup_not_the_funds():
    fd = fa.to_form_d("Daytona", DAYTONA, PERSONS)
    assert fd["entity_name"] == "Daytona Platforms Inc." and fd["cik"] == "1977563"
    assert fd["total_sold"] == 48_274_000 and fd["total_offering"] == 60_000_000 and fd["total_remaining"] == 11_726_000
    assert fd["related_persons"] == ["Ivan Burazin", "Matt Turck", "Pat Finance"]
    assert [p["director"] for p in fd["related_people"]] == [True, True, False]
    assert [h["total_sold"] for h in fd["history"]] == [23_259_739]


def test_amendment_replaces_its_original():
    rows = [row("O1", filed="2026-03-01", sold=8_000_000, offered=10_000_000),
            row("O1A", filed="2026-05-01", sold=10_000_000, offered=10_000_000, amendment=True, prev="O1")]
    fd = fa.to_form_d("Daytona Platforms", rows)
    assert fd["total_sold"] == 10_000_000 and fd["history"] == []  # not 18M


def test_indefinite_offering_and_no_match():
    rows = [row("X", offering_amount_indefinite=True)]
    assert fa.to_form_d("Daytona", rows)["total_offering"] == "Indefinite"
    assert fa.to_form_d("Completely Different Co", DAYTONA) is None


def test_plugs_into_verdicts():
    fd = fa.to_form_d("Daytona", DAYTONA, PERSONS)
    claims = [{"claim_type": "round_size", "claim_text": "$60M Series B", "value": 60_000_000, "page": 1},
              {"claim_type": "board", "claim_text": "Ivan Burazin, CEO", "value": "Ivan Burazin", "page": 2}]
    checks = verdicts.form_d_checks(claims, fd, "Daytona", today=date(2026, 10, 10))
    rnd = next(c for c in checks if c["claim_type"] == "round_size")
    assert rnd["verdict"] == "match" and "still open" in rnd["note"]
    flagged = [c["observed_value"] for c in checks if c["claim_text"] == "(not named in the deck)"]
    assert flagged == ["Matt Turck"]  # the director is flagged; the CFO (an officer, not a director) is not
    note = next(c["note"] for c in checks if c["observed_value"] == "Matt Turck")
    assert "as a director;" in note


STARTUP_PEOPLE = [{"cik": "1977563", "full_name": "Matt Turck", "latest_title": "Director", "is_ceo_or_founder": False,
                   "is_director": True, "startups_named_on": 14, "is_repeat_insider": True},
                  {"cik": "1977563", "full_name": "Ivan Burazin", "latest_title": "CEO", "is_ceo_or_founder": True,
                   "startups_named_on": 1, "is_repeat_insider": False}]


def test_startup_companies_pins_cik_and_people_explain_repeat_insiders():
    cos = [{"cik": "999", "company_name": "Daytona Ventures", "company_search_name": "daytona ventures", "latest_filing_date": date(2026, 9, 1)},
           {"cik": "1977563", "company_name": "Daytona Platforms Inc.", "company_search_name": "daytona platforms",
            "latest_filing_date": date(2026, 8, 17), "edgar_company_url": "https://www.sec.gov/cgi-bin/browse-edgar?CIK=1977563"}]
    cik = fa.pick_company("Daytona Platforms", cos)
    assert cik == "1977563"
    fd = fa.to_form_d("Daytona", DAYTONA, PERSONS, people=STARTUP_PEOPLE, company_row=cos[1])
    turck = next(p for p in fd["related_people"] if p["name"] == "Matt Turck")
    assert turck["startups_named_on"] == 14 and turck["repeat_insider"]
    assert next(p for p in fd["related_people"] if p["name"] == "Ivan Burazin")["founder"]
    claims = [{"claim_type": "board", "claim_text": "Ivan Burazin, CEO", "value": "Ivan Burazin", "page": 2}]
    note = next(c["note"] for c in verdicts.form_d_checks(claims, fd, "Daytona", today=date(2026, 10, 10))
                if c["observed_value"] == "Matt Turck")
    assert "named on 14 startups" in note and "investor" in note


def test_startup_rounds_preferred_and_late_filing_noted():
    rounds = [{"offering_id": "o2", "cik": "1977563", "company_name": "Daytona Platforms Inc.", "latest_accession_number": "A2",
               "latest_filing_date": date(2026, 8, 17), "original_filing_date": date(2026, 8, 17), "first_sale_date": date(2026, 7, 1),
               "days_first_sale_to_filing": 47, "total_offering_amount_usd": 60e6, "offering_amount_indefinite": False,
               "total_amount_sold_usd": 48_274_000.0, "total_remaining_usd": 11_726_000.0, "num_investors": 6,
               "security_type": "Equity", "is_open_round": True, "filing_url": "u2"},
              {"offering_id": "o1", "cik": "1977563", "company_name": "Daytona Platforms Inc.", "latest_accession_number": "A1",
               "latest_filing_date": date(2026, 2, 5), "first_sale_date": date(2026, 1, 22), "days_first_sale_to_filing": 14,
               "total_offering_amount_usd": 23_797_784.0, "total_amount_sold_usd": 23_259_739.0, "filing_url": "u1"}]
    fd = fa.to_form_d("Daytona", [], PERSONS, rounds=rounds, company_row={"cik": "1977563"})
    assert fd["entity_name"] == "Daytona Platforms Inc." and fd["total_sold"] == 48_274_000 and fd["security_type"] == "Equity"
    assert fd["related_persons"][0] == "Ivan Burazin" and [h["total_sold"] for h in fd["history"]] == [23_259_739]
    claims = [{"claim_type": "round_size", "claim_text": "$60M", "value": 60_000_000, "page": 1}]
    note = verdicts.form_d_checks(claims, fd, "Daytona", today=date(2026, 10, 10))[0]["note"]
    assert "47 days after the first sale" in note
