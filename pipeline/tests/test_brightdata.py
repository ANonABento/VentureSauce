import asyncio
import json
import urllib.parse

import httpx
import pytest

from delta.brightdata import BrightData, Cache, enrich

UNIVERSE = [
    {
        "cik": "0000000001",
        "company_name": "ACME ROBOTICS INC",
        "company_search_name": "ACME ROBOTICS",
        "city": "AUSTIN",
    },
    {"cik": "0000000002", "company_name": "Quiet Bio, Inc.", "company_search_name": "Quiet Bio", "city": "BOSTON"},
]


class FakeBrightData:
    def __init__(self, throttle_first: bool = False):
        self.calls: list[str] = []
        self.snapshots: dict[str, list[dict]] = {}
        self.throttle_first = throttle_first

    def __call__(self, request: httpx.Request) -> httpx.Response:
        path = request.url.path
        self.calls.append(path)
        if path == "/request":
            if self.throttle_first:
                self.throttle_first = False
                return httpx.Response(
                    200, text="", headers={"x-brd-status-code": "429", "x-brd-err-code": "client_10110"}
                )
            query = urllib.parse.parse_qs(urllib.parse.urlparse(json.loads(request.content)["url"]).query)["q"][0]
            if "Quiet Bio" in query:
                return httpx.Response(200, json={"organic": []})
            return httpx.Response(
                200,
                json={
                    "organic": [
                        {"title": "Acme Robotics raises $4M seed round", "link": "https://news.example/acme"},
                        {"title": "Acme | LinkedIn", "link": "https://www.linkedin.com/company/acme-robotics/"},
                        {"title": "Acme - Crunchbase", "link": "https://www.crunchbase.com/organization/acme-robotics"},
                    ]
                },
            )
        if path == "/datasets/filter":
            names = json.loads(request.content)["filter"]["value"]
            records = [
                {
                    "id": "acme-robotics",
                    "name": "Acme Robotics",
                    "url": "https://www.linkedin.com/company/acme-robotics",
                }
            ]
            self.snapshots["s1"] = [r for r in records if r["name"] in names]
            return httpx.Response(200, json={"snapshot_id": "s1"})
        if path == "/datasets/snapshots/s1":
            return httpx.Response(200, json={"status": "ready"})
        if path == "/datasets/snapshots/s1/download":
            return httpx.Response(200, json=self.snapshots["s1"])
        if path == "/datasets/v3/trigger":
            urls = [i["url"] for i in json.loads(request.content)["input"]]
            self.snapshots["t1"] = [
                {"input": {"url": u}, "url": u, "name": "Quiet Bio", "followers": "12"} for u in urls
            ]
            return httpx.Response(200, json={"snapshot_id": "t1"})
        if path == "/datasets/v3/progress/t1":
            return httpx.Response(200, json={"status": "ready"})
        if path == "/datasets/v3/snapshot/t1":
            return httpx.Response(200, json=self.snapshots["t1"])
        return httpx.Response(404)


def client(tmp_path, fake=None, key="test-key") -> BrightData:
    transport = httpx.MockTransport(fake) if fake else None
    bd = BrightData(key, Cache(tmp_path), poll_seconds=0, transport=transport)
    bd.throttle.pause = 0
    return bd


def run(coro):
    return asyncio.run(coro)


def test_serp_retries_throttled_requests_and_caches(tmp_path):
    fake = FakeBrightData(throttle_first=True)

    async def search_twice():
        async with client(tmp_path, fake) as bd:
            first = await enrich.serp_funding(bd, UNIVERSE[:1])
            second = await enrich.serp_funding(bd, UNIVERSE[:1])
        return first, second

    first, second = run(search_twice())

    assert first == [{**second[0], "seconds": first[0]["seconds"]}]
    assert first[0]["error"] is None
    assert first[0]["linkedin_urls"] == "https://www.linkedin.com/company/acme-robotics"
    assert first[0]["crunchbase_urls"] == "https://www.crunchbase.com/organization/acme-robotics"
    assert first[0]["profile_query"] is None
    assert fake.calls.count("/request") == 2


def test_serp_runs_profile_search_when_no_linkedin_found(tmp_path):
    async def search():
        async with client(tmp_path, FakeBrightData()) as bd:
            return await enrich.serp_funding(bd, UNIVERSE[1:])

    (row,) = run(search())

    assert row["profile_query"] == '"Quiet Bio" Boston linkedin company'
    assert row["organic_count"] == 0
    assert row["linkedin_urls"] is None


def test_offline_client_only_returns_cached_results(tmp_path):
    async def search_online():
        async with client(tmp_path, FakeBrightData()) as bd:
            return await enrich.serp_funding(bd, UNIVERSE[:1])

    async def search_offline():
        async with client(tmp_path, key=None) as bd:
            return await enrich.serp_funding(bd, UNIVERSE)

    run(search_online())
    rows = run(search_offline())

    assert [r["cik"] for r in rows] == ["0000000001"]


def test_linkedin_companies_match_by_name_and_scrape_serp_urls(tmp_path):
    fake = FakeBrightData()
    universe = [
        UNIVERSE[0] | {"linkedin_urls": "https://www.linkedin.com/company/acme-robotics"},
        UNIVERSE[1] | {"linkedin_urls": "https://www.linkedin.com/company/quiet-bio"},
    ]

    async def match():
        async with client(tmp_path, fake) as bd:
            return await enrich.linkedin_companies(bd, universe)

    rows = run(match())

    by_cik = {(r["cik"], r["source"], r["match_method"]): r for r in rows}
    assert set(by_cik) == {
        ("0000000001", "dataset", "name"),
        ("0000000001", "dataset", "serp_url"),
        ("0000000002", "scraper", "serp_url"),
    }
    assert by_cik[("0000000002", "scraper", "serp_url")]["li_followers"] == 12

    fake.calls.clear()
    run(match())
    assert fake.calls == []


@pytest.mark.parametrize(
    ("raw", "expected"),
    [("3 days ago", "2026-10-08"), ("Oct 3, 2025", "2025-10-03"), ("2 hours ago", "2026-10-11"), ("soon", None)],
)
def test_news_date(raw, expected):
    assert enrich.news_date(raw, "2026-10-11T12:00:00Z") == expected


def test_company_name_variants():
    assert enrich.variants(UNIVERSE[0]) == ["ACME ROBOTICS", "Acme Robotics", "ACME ROBOTICS INC", "Acme Robotics Inc"]
