"""The DeltaReport adapter must always produce shapes the Next.js UI can render."""

import json
from pathlib import Path

import delta

JOB = json.loads((Path(__file__).parent.parent / "fixtures" / "job_acme.json").read_text())


def test_report_shape_matches_frontend_contract():
    r = delta.to_report(JOB)
    assert r["company"]["name"] and isinstance(r["headline"], str)
    assert {row["status"] for row in r["rows"]} <= {"discrepancy", "consistent", "not_disclosed", "unverified"}
    for row in r["rows"]:
        for side in ("filed", "said"):
            claim = row[side]
            assert claim is None or isinstance(claim, dict), (side, claim)  # never [] (truthy in JS)
            if claim:
                assert claim["source"]["url"] and claim["source"]["checkedAt"][:4].isdigit()
        assert isinstance(row["likelyReasons"], list) and row["summary"]
    statuses = [row["status"] for row in r["rows"]]
    assert statuses == sorted(statuses, key=delta.STATUS_RANK.get)  # discrepancies first


def test_board_and_customers_collapse_into_one_row_each():
    r = delta.to_report(JOB)
    signals = [row["signal"] for row in r["rows"]]
    assert signals.count("Leadership") == 1 and signals.count("Customers") == 1
