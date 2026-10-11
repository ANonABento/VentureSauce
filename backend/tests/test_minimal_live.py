"""Backup public records: snapshot fallback when offline, and the press headline filter."""

import httpx

from sources import minimal_live


def _offline(*a, **k):
    raise httpx.ConnectError("offline")


def test_offline_falls_back_to_the_saved_snapshot(monkeypatch, tmp_path):
    monkeypatch.setattr(minimal_live, "CACHE", tmp_path)  # no fresh cache
    monkeypatch.setattr(httpx, "get", _offline)
    monkeypatch.setattr(httpx, "post", _offline)
    monkeypatch.setenv("BRIGHTDATA_API_TOKEN", "x")
    monkeypatch.setenv("BRIGHTDATA_ZONE", "z")
    found = minimal_live.lookup("Daytona", use_cache=False)
    assert found["form_d"]["entity_name"] == "Daytona Platforms Inc."
    assert set(found["from_snapshot"]) == {"form_d", "linkedin", "press"}
    assert found["linkedin"]["url"] == "https://www.linkedin.com/company/daytonaio/"
    assert not list(tmp_path.iterdir())  # a snapshot answer is never cached as if it were live


RSS = """<rss><channel>
<item><title>Clerk raises $50M Series C for authentication - SiliconANGLE</title><link>https://x.example/1</link><pubDate>Wed, 02 Jul 2025 10:00:00 GMT</pubDate></item>
<item><title>Mclean County Clerk raises concerns - WFTV</title><link>https://x.example/2</link></item>
<item><title>Clerk Raises $30M Series B to disrupt brick-and-mortar retail - PR</title><link>https://x.example/3</link></item>
</channel></rss>"""


def test_press_keeps_only_the_companys_funding_headlines(monkeypatch):
    class R:
        content = RSS.encode()

        def raise_for_status(self):
            pass

    monkeypatch.setenv("BRIGHTDATA_API_TOKEN", "x")
    monkeypatch.setenv("BRIGHTDATA_ZONE", "z")
    monkeypatch.setattr(httpx, "post", lambda *a, **k: R())
    press = minimal_live.press("Clerk")
    assert [p["url"] for p in press] == ["https://x.example/1"]
    assert press[0]["amount_mentioned"] == 50_000_000 and press[0]["via"] == "brightdata"
    assert press[0]["date"] == "2025-07-02"


def test_linkedin_needs_a_link_from_the_homepage(monkeypatch):
    monkeypatch.setenv("BRIGHTDATA_API_TOKEN", "x")
    monkeypatch.setenv("BRIGHTDATA_ZONE", "x")
    monkeypatch.setattr(minimal_live, "linkedin_slug", lambda domain: None)
    monkeypatch.setattr(minimal_live, "_unlocker", lambda url: (_ for _ in ()).throw(AssertionError("guessed a page")))
    assert minimal_live.linkedin("Legora", "legora.com") is None


def test_linkedin_reads_the_member_count(monkeypatch):
    monkeypatch.setenv("BRIGHTDATA_API_TOKEN", "x")
    monkeypatch.setenv("BRIGHTDATA_ZONE", "x")
    monkeypatch.setattr(minimal_live, "linkedin_slug", lambda domain: "wearelegora")
    page = ('<script type="application/ld+json">{"@graph":[{"@type":"Organization","name":"Legora","sameAs":"legora.com",'
            '"numberOfEmployees":{"value":919}}]}</script><dt>Company size </dt><dd class="x">501-1,000 employees</dd>')
    monkeypatch.setattr(minimal_live, "_unlocker", lambda url: page)
    li = minimal_live.linkedin("Legora", "legora.com")
    assert li["employees"] == 919 and li["company_size"] == "501-1,000 employees"
    assert li["url"] == "https://www.linkedin.com/company/wearelegora/"
