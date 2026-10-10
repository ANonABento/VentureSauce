import research


def chk(source, t, claimed, observed, verdict, text="x", label=None):
    return {"source": source, "claim_type": t, "claimed_value": claimed, "observed_value": observed, "claim_text": text,
            "verdict": verdict, "label": label or verdict, "note": f"{t} {claimed}->{observed} {verdict}"}


def test_diff_reports_new_changed_and_resolved():
    old = [chk("form_d", "raised", 12, 15, "gap"), chk("linkedin", "headcount", 25, 9, "gap"), chk("press", "customer", "Globex", None, "unverifiable")]
    new = [chk("form_d", "raised", 12, 18, "gap"), chk("linkedin", "headcount", 25, 25, "match"),
           chk("press", "customer", "Globex", None, "unverifiable"), chk("form_d", "board", None, "Morgan", "gap", text="(not named)")]
    out = research.diff(old, new)
    assert any(x.startswith("Changed") and "18" in x for x in out)        # Form D amount moved
    assert any(x.startswith("Changed") and "match" in x for x in out)     # headcount now matches
    assert any(x.startswith("New") and "Morgan" in x for x in out)        # new director
    assert not any("Globex" in x for x in out)                            # unchanged rows stay quiet


def test_research_never_raises(monkeypatch):
    from sources import ground_truth
    monkeypatch.setattr(ground_truth, "get_ground_truth", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("boom")))
    out = research.research_company("Nobody Inc")
    assert "failed" in out["summary"]
