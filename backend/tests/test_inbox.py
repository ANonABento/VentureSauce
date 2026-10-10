"""Deal inbox: company matching and cross-source contradictions."""

import analysis


def item(iid, kind, claims, day="2026-10-01", label=None):
    return {"id": iid, "kind": kind, "label": label or f"{iid}.pdf", "item_date": day,
            "received_at": f"{day}T00:00:00+00:00", "claims": claims}


def c(t, value, metric=None):
    return {"claim_type": t, "metric": metric, "claim_text": f"{t} {value}", "value": value, "page": 1}


def test_contradiction_across_items():
    items = [item("a", "pdf", [c("headcount", 25)]), item("b", "email", [c("headcount", 40)], day="2026-10-08")]
    out = analysis.contradictions(analysis.all_claims(items))
    assert len(out) == 1
    x = out[0]
    assert x["source"] == "your_sources" and x["label"] == "Your sources disagree"
    assert x["claimed_value"] == 40 and x["observed_value"] == 25 and len(x["values"]) == 2


def test_contradiction_found_across_items_not_within_one():
    items = [item("a", "pdf", [c("metric", 3_100_000, "arr"), c("metric", 1_000_000, "arr")]),
             item("b", "email", [c("metric", 3_000_000, "arr")])]
    # a's 1.0M vs b's 3.0M conflicts across items, even though a's own 1.0M/3.1M spread is the widest.
    out = analysis.contradictions(analysis.all_claims(items))
    assert len(out) == 1
    assert {v["value"] for v in out[0]["values"]} == {3_100_000, 1_000_000, 3_000_000}


def test_different_metrics_do_not_mix():
    items = [item("a", "pdf", [c("metric", 3_000_000, "arr")]), item("b", "notes", [c("metric", 20, "mom growth")])]
    assert analysis.contradictions(analysis.all_claims(items)) == []


def test_merged_claims_keeps_latest_headcount_and_distinct_people():
    items = [item("a", "pdf", [c("headcount", 25), c("board", "Jane Founder")]),
             item("b", "email", [c("headcount", 40), c("board", "jane founder")])]
    merged = analysis.merged_claims(analysis.all_claims(items))
    assert [m["value"] for m in merged if m["claim_type"] == "headcount"] == [40]
    assert len([m for m in merged if m["claim_type"] == "board"]) == 1


def test_company_resolution(tmp_path, monkeypatch):
    import store
    monkeypatch.setattr(store, "PATH", tmp_path / "s.json")
    a = store.resolve_company("Acme AI", "acme-ai.example")
    assert store.resolve_company("Acme AI, Inc.", None)["id"] == a["id"]        # name match
    assert store.resolve_company("Totally Different", "acme-ai.example")["id"] == a["id"]  # domain wins
    b = store.resolve_company("Zentrix Robotics", None)
    assert b["id"] != a["id"]
    assert store.resolve_company("", None)["id"] == b["id"]                       # unnamed → most recent
    assert store.resolve_company("Whatever", None, company_id=a["id"])["id"] == a["id"]  # explicit wins


def test_no_contradiction_within_tolerance():
    items = [item("a", "pdf", [c("metric", 3_100_000, "arr")]), item("b", "email", [c("metric", 3_000_000, "arr")])]
    assert analysis.contradictions(analysis.all_claims(items)) == []


def test_no_contradiction_inside_a_single_item():
    items = [item("a", "pdf", [c("metric", 3_100_000, "arr"), c("metric", 1_000_000, "arr")])]
    assert analysis.contradictions(analysis.all_claims(items)) == []


def test_same_file_twice_is_listed_once():
    items = [item("a", "pdf", [c("headcount", 25)], label="deck.pdf"), item("b", "pdf", [c("headcount", 25)], label="deck.pdf"),
             item("e", "email", [c("headcount", 40)], label="Pasted email")]
    out = analysis.contradictions(analysis.all_claims(items))
    assert len(out) == 1 and len(out[0]["values"]) == 2
