"""Rule tests for verdicts.py. Run: cd backend && uv run --with pytest pytest -q"""

import json
from datetime import date
from pathlib import Path

import pytest

import verdicts as v

TODAY = date(2026, 10, 10)
ACME = json.loads((Path(__file__).parent.parent / "fixtures" / "acme_ground_truth.json").read_text())


def claim(t, value, text="x"):
    return {"claim_type": t, "claim_text": text, "value": value, "page": 1}


def form_d(sold, offering=None, filed="2026-01-01", persons=("Jane Founder",), **kw):
    return {"entity_name": "Acme AI, Inc.", "cik": "1", "filing_date": filed, "total_sold": sold,
            "total_offering": offering or sold, "total_remaining": (offering or sold) - sold,
            "related_persons": list(persons), "url": "u", "history": [], **kw}


def only(checks, t):
    out = [c for c in checks if c["claim_type"] == t]
    assert len(out) == 1, out
    return out[0]


def test_every_check_has_ui_fields():
    claims = [claim("raised", 12_000_000), claim("round_size", 10_000_000), claim("board", "Jane Founder"),
              claim("headcount", 25), claim("customer", "Globex")]
    checks = (v.form_d_checks(claims, ACME["form_d"], today=TODAY) + v.headcount_checks(claims, ACME["linkedin"])
              + v.press_checks(claims, ACME["press"]))
    for c in checks:
        assert c["label"] in v.LABELS.values() and "gap" not in c["label"].lower()
        assert c["confidence"] in ("low", "medium", "high")
        if c["verdict"] != "unverifiable":
            assert c["source_url"] and c["source_date"], c


def test_no_form_d_is_unverifiable_and_names_company():
    c = only(v.form_d_checks([claim("raised", 5_000_000)], None, "Acme AI", TODAY), "raised")
    assert c["verdict"] == "unverifiable" and "'Acme AI'" in c["note"]


def test_lower_form_d_recent_filing_is_not_a_gap():
    c = only(v.form_d_checks([claim("raised", 10_000_000)], form_d(4_000_000, filed="2026-09-01"), today=TODAY), "raised")
    assert c["verdict"] == "unverifiable"


def test_lower_form_d_small_difference_is_not_a_gap():
    c = only(v.form_d_checks([claim("raised", 10_000_000)], form_d(8_000_000, filed="2025-01-01"), today=TODAY), "raised")
    assert c["verdict"] == "unverifiable"


def test_lower_form_d_big_and_old_is_gap():
    c = only(v.form_d_checks([claim("raised", 10_000_000)], form_d(4_000_000, filed="2026-01-01"), today=TODAY), "raised")
    assert c["verdict"] == "gap" and c["confidence"] == "medium"


def test_higher_form_d_is_gap_but_never_high_confidence():
    c = only(v.form_d_checks([claim("raised", 10_000_000), claim("board", "Jane Founder")],
                             form_d(15_000_000), today=TODAY), "raised")
    assert c["verdict"] == "gap" and c["confidence"] == "medium" and "SAFE" in c["note"]


def test_amendments_and_duplicates_are_not_double_counted():
    fd = form_d(10_000_000, accession="a1", history=[
        {"total_sold": 10_000_000, "accession": "a1"},                       # same filing again
        {"total_sold": 9_000_000, "accession": "a0", "is_amendment": True},  # D/A restating
        {"total_sold": 2_000_000, "accession": "p1"},                        # real earlier round
    ])
    c = only(v.form_d_checks([claim("raised", 12_000_000)], fd, today=TODAY), "raised")
    assert c["observed_value"] == 12_000_000 and c["verdict"] == "match"


def test_round_matches_offering_and_reports_still_open():
    # Daytona-shaped: $60M offering, $48.27M sold.
    fd = form_d(48_274_000, offering=60_000_000)
    c = only(v.form_d_checks([claim("round_size", 60_000_000)], fd, today=TODAY), "round_size")
    assert c["verdict"] == "match" and "still open" in c["note"]


def test_weak_entity_match_caps_confidence_and_skips_director_flags():
    fd = form_d(15_000_000, persons=("Someone Else", "Another Person"))
    checks = v.form_d_checks([claim("raised", 10_000_000), claim("board", "Jane Founder")], fd, today=TODAY)
    assert all(c["confidence"] == "low" for c in checks)
    assert not any(c["claim_text"] == "(not named in the deck)" for c in checks)
    assert "different company" in only(checks, "raised")["note"]


def test_unannounced_director_flagged_when_entity_confirmed():
    fd = form_d(10_000_000, persons=("Jane Founder", "Alex Director"))
    checks = v.form_d_checks([claim("board", "Dr. Jane Q. Founder")], fd, today=TODAY)
    extra = [c for c in checks if c["observed_value"] == "Alex Director"]
    assert len(extra) == 1 and extra[0]["verdict"] == "gap"
    assert any(c["verdict"] == "match" for c in checks)


@pytest.mark.parametrize("obs,verdict", [(25, "match"), (18, "match"), (9, "gap")])
def test_headcount_threshold(obs, verdict):
    c = only(v.headcount_checks([claim("headcount", 25)], {"employees": obs, "url": "u", "fetched_at": "2026-10-10T00:00:00Z"}), "headcount")
    assert c["verdict"] == verdict


def test_small_earlier_round_without_press_is_not_flagged():
    claims = [claim("round_size", 2_000_000), claim("round_size", 10_000_000)]
    checks = v.press_checks(claims, ACME["press"])
    assert {c["claimed_value"]: c["verdict"] for c in checks} == {2_000_000: "unverifiable", 10_000_000: "match"}


def test_a_named_round_labelled_as_raised_matches_its_own_offering():
    # "Raised a $50M Series C" is one round; the company's Form Ds together total more.
    fd = form_d(49_999_982, 50_000_000, history=[{"total_sold": 28_999_976, "total_offering": 29_000_000, "url": "u2"},
                                                {"total_sold": 14_859_986, "total_offering": 15_000_000, "url": "u3"}])
    c = only(v.form_d_checks([claim("raised", 50_000_000, "Clerk raised a $50 million Series C")], fd, today=TODAY), "raised")
    assert c["verdict"] == "match"


def test_the_round_being_raised_now_is_not_checked():
    fd = form_d(15_000_000)
    checks = v.form_d_checks([claim("round_size", 25_000_000, "Raising a $25M Series A")], fd, today=TODAY)
    checks += v.press_checks([claim("round_size", 25_000_000, "Series A target: $25M, opening November")],
                             [{"amount_mentioned": 10_000_000, "url": "p", "title": "Acme raises $10M"}])
    assert not [c for c in checks if c["claim_type"] == "round_size"]
