"""Data's OSO profiles: only used when the profile's own website is the company's domain."""

from sources import oso
import verdicts as v

TABLES = {"fetched_at": "2026-10-10T00:00:00+00:00", "judges": [
    {"company": "Legora", "domain": "legora.com", "li_domain": "legora.com", "cb_domain": None, "linkedin_url": "https://www.linkedin.com/company/wearelegora",
     "li_employees_on_linkedin": 919, "crunchbase_url": "https://www.crunchbase.com/organization/leya-876d"},
    {"company": "Lovable", "domain": "lovable.dev", "li_domain": "lovable.dev", "cb_domain": "lovable.app", "linkedin_url": "x",
     "li_employees_on_linkedin": 1170, "crunchbase_url": "https://www.crunchbase.com/organization/lovable-cba3", "cb_disclosed_funding_usd": 1}],
    "universe": [
    {"company": "Legora, Inc.", "sec_cik": "0002071663", "li_website": "https://legora.cl/", "li_match_confidence": "medium",
     "linkedin_url": "https://www.linkedin.com/company/legora", "li_employees_on_linkedin": 2},
    {"company": "GC AI", "sec_cik": "0002036281", "li_website": "https://gc.ai", "li_match_confidence": "high", "li_employees_on_linkedin": 155,
     "linkedin_url": "https://www.linkedin.com/company/gc-ai", "cb_website": "https://gc.ai", "cb_match_confidence": "high",
     "crunchbase_url": "https://www.crunchbase.com/organization/general-counsel-ai", "cb_disclosed_funding_usd": 71646596}]}


def test_profiles_need_the_company_website(monkeypatch):
    monkeypatch.setattr(oso, "tables", lambda refresh=False: TABLES)
    legora = oso.profiles("https://www.legora.com")
    assert legora["linkedin"]["employees"] == 919  # the legora.cl lookalike is never picked
    assert legora["crunchbase"] is None  # Crunchbase row lists no website
    lovable = oso.profiles("lovable.dev")
    assert lovable["linkedin"]["employees"] == 1170 and lovable["crunchbase"] is None  # lovable.app ≠ lovable.dev
    gc = oso.profiles("gc.ai")
    assert gc["linkedin"]["employees"] == 155 and gc["crunchbase"]["total_funding_usd"] == 71646596
    assert oso.profiles(None) == {"linkedin": None, "crunchbase": None}


def test_crunchbase_total_matches_or_is_context_never_a_flag():
    cb = {"total_funding_usd": 71_646_596, "url": "https://example.com/cb"}
    claim = lambda value: {"claim_type": "raised", "value": value, "claim_text": "x"}
    [ok] = v.crunchbase_checks([claim(72_000_000)], cb)
    assert ok["verdict"] == "match" and ok["source"] == "crunchbase"
    [other] = v.crunchbase_checks([claim(150_000_000)], cb)
    assert other["verdict"] == "unverifiable"
    assert v.crunchbase_checks([claim(1)], None) == []
