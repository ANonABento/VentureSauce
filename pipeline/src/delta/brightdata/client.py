import asyncio
import json
import time
from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Self

import httpx

from delta.brightdata.cache import Cache

API = "https://api.brightdata.com"
THROTTLE_CODES = ("client_10110", "sr_rate_limit")
SERP_ATTEMPTS = 6


class BrightDataError(RuntimeError):
    pass


@dataclass(frozen=True)
class SerpResult:
    status: int
    doc: dict[str, Any] | None
    error: str | None
    fetched_at: str | None


class Throttle:
    def __init__(self, limit: int):
        self.max = float(limit)
        self.limit = float(limit)
        self.in_flight = 0
        self.resume_at = 0.0
        self.pause = 5.0

    async def acquire(self) -> None:
        while self.in_flight >= int(self.limit) or time.monotonic() < self.resume_at:
            await asyncio.sleep(0.5)
        self.in_flight += 1

    def release(self, throttled: bool) -> None:
        self.in_flight -= 1
        if throttled:
            self.limit = max(1.0, self.limit / 2)
            self.resume_at = max(self.resume_at, time.monotonic() + self.pause)
            self.pause = min(60.0, self.pause * 1.5)
        else:
            self.limit = min(self.max, self.limit + 0.25)
            self.pause = max(5.0, self.pause * 0.9)


def now() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def error_of(record: dict[str, Any]) -> str | None:
    error = record.get("error") or record.get("error_code")
    return str(error)[:300] if error else None


def chunks(items: list[str], size: int) -> list[list[str]]:
    return [items[i : i + size] for i in range(0, len(items), size)]


def record_key(record: dict[str, Any]) -> str:
    return str(record.get("id") or record.get("url") or json.dumps(record, sort_keys=True))


class BrightData:
    def __init__(
        self,
        key: str | None,
        cache: Cache,
        zone: str = "oso_serp",
        serp_concurrency: int = 6,
        poll_seconds: float = 10,
        max_polls: int = 120,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self.key = key
        self.cache = cache
        self.zone = zone
        self.throttle = Throttle(serp_concurrency)
        self.poll_seconds = poll_seconds
        self.max_polls = max_polls
        self.http = httpx.AsyncClient(
            base_url=API,
            timeout=60,
            transport=transport,
            headers={"Authorization": f"Bearer {key}"} if key else {},
        )

    @property
    def online(self) -> bool:
        return self.key is not None

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, *exc) -> None:
        await self.http.aclose()

    async def call(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        for attempt in range(4):
            try:
                response = await self.http.request(method, path, **kwargs)
            except httpx.TransportError:
                if attempt == 3:
                    raise
            else:
                if response.status_code != httpx.codes.TOO_MANY_REQUESTS or attempt == 3:
                    return response
            await asyncio.sleep(self.poll_seconds * (attempt + 1) / 2)
        raise BrightDataError(f"{method} {path} failed")

    async def poll(self, path: str) -> None:
        for _ in range(self.max_polls):
            response = await self.call("GET", path)
            status = response.json().get("status") if response.status_code == httpx.codes.OK else None
            if status == "ready":
                return
            if status == "failed":
                raise BrightDataError(f"{path} failed: {response.text[:300]}")
            await asyncio.sleep(self.poll_seconds)
        raise BrightDataError(f"{path} timed out")

    async def download(self, path: str) -> list[dict[str, Any]]:
        for _ in range(self.max_polls):
            response = await self.call("GET", path, params={"format": "json"})
            if response.status_code == httpx.codes.OK:
                return response.json()
            if response.status_code != httpx.codes.ACCEPTED:
                raise BrightDataError(f"{path} download failed: HTTP {response.status_code}: {response.text[:300]}")
            await asyncio.sleep(self.poll_seconds)
        raise BrightDataError(f"{path} never became ready")

    async def filter(self, dataset_id: str, flt: dict[str, Any], limit: int) -> list[dict[str, Any]]:
        response = await self.call(
            "POST", "/datasets/filter", json={"dataset_id": dataset_id, "records_limit": limit, "filter": flt}
        )
        if response.status_code == httpx.codes.UNPROCESSABLE_ENTITY:
            return []
        if response.status_code != httpx.codes.OK:
            raise BrightDataError(f"dataset filter failed: HTTP {response.status_code}: {response.text[:300]}")
        snapshot = response.json()["snapshot_id"]
        await self.poll(f"/datasets/snapshots/{snapshot}")
        return await self.download(f"/datasets/snapshots/{snapshot}/download")

    async def trigger(self, dataset_id: str, inputs: list[dict[str, Any]], **params: Any) -> list[dict[str, Any]]:
        response = await self.call(
            "POST",
            "/datasets/v3/trigger",
            params={"dataset_id": dataset_id, "include_errors": "true", **params},
            json={"input": inputs},
        )
        if response.status_code != httpx.codes.OK:
            raise BrightDataError(f"scraper trigger failed: HTTP {response.status_code}: {response.text[:300]}")
        snapshot = response.json()["snapshot_id"]
        await self.poll(f"/datasets/v3/progress/{snapshot}")
        return await self.download(f"/datasets/v3/snapshot/{snapshot}")

    async def serp(self, url: str) -> SerpResult | None:
        key = f"serp:{self.zone}:{url}"
        if (hit := self.cache.get(key)) is not None:
            return SerpResult(httpx.codes.OK, hit["doc"], None, hit["fetched_at"])
        if not self.online:
            return None
        status, error = -1, None
        for _ in range(SERP_ATTEMPTS):
            await self.throttle.acquire()
            throttled = False
            try:
                response = await self.http.post(
                    "/request", json={"zone": self.zone, "url": url, "format": "raw"}, timeout=25
                )
                status, body = response.status_code, response.text
                if status == httpx.codes.OK and body.startswith("{"):
                    self.throttle.release(False)
                    hit = {"doc": json.loads(body), "fetched_at": now()}
                    self.cache.put(key, hit)
                    return SerpResult(status, hit["doc"], None, hit["fetched_at"])
                headers = response.headers
                code = headers.get("x-brd-err-code") or headers.get("x-brd-error-code") or ""
                message = headers.get("x-brd-error") or body[:150]
                throttled = (
                    headers.get("x-brd-status-code") == "429"
                    or status == httpx.codes.TOO_MANY_REQUESTS
                    or code in THROTTLE_CODES
                    or "rate limit" in message.lower()
                )
                error = f"{headers.get('x-brd-status-code', status)} {code}: {message}"[:300]
            except httpx.HTTPError as exc:
                status, error = -1, f"{type(exc).__name__}: {exc}"[:300]
            self.throttle.release(throttled)
            if not throttled:
                await asyncio.sleep(self.poll_seconds / 10)
        return SerpResult(status, None, error, None)

    async def filter_cached(self, dataset_id: str, flt: dict[str, Any], limit: int) -> list[dict[str, Any]] | None:
        key = f"filter:{dataset_id}:{limit}:{json.dumps(flt, sort_keys=True)}"
        if (hit := self.cache.get(key)) is not None:
            return hit
        if not self.online:
            return None
        records = await self.filter(dataset_id, flt, limit)
        self.cache.put(key, records)
        return records

    async def filter_names(self, dataset_id: str, names: list[str], batch_size: int = 1000) -> list[dict[str, Any]]:
        def key(name: str) -> str:
            return f"filter-name:{dataset_id}:{name}"

        missing = [n for n in names if self.cache.get(key(n)) is None]
        if missing and self.online:
            for batch in chunks(missing, batch_size):
                records = await self.filter(
                    dataset_id, {"name": "name", "operator": "in", "value": batch}, 5 * len(batch)
                )
                by_name = defaultdict(list)
                for record in records:
                    by_name[str(record.get("name") or "").casefold()].append(record)
                for name in batch:
                    self.cache.put(key(name), by_name.get(name.casefold(), []))
        seen: dict[str, dict[str, Any]] = {}
        for name in names:
            for record in self.cache.get(key(name)) or []:
                seen.setdefault(record_key(record), record)
        return list(seen.values())

    async def scrape_urls(self, dataset_id: str, urls: list[str]) -> dict[str, dict[str, Any]]:
        def key(url: str) -> str:
            return f"scrape:{dataset_id}:{url}"

        results: dict[str, dict[str, Any]] = {}
        missing = []
        for url in dict.fromkeys(urls):
            if (hit := self.cache.get(key(url))) is not None:
                results[url] = hit
            else:
                missing.append(url)
        if missing and self.online:
            for record in await self.trigger(dataset_id, [{"url": u} for u in missing]):
                url = (record.get("input") or {}).get("url") or record.get("url")
                if not url:
                    continue
                results[url] = record
                if not error_of(record):
                    self.cache.put(key(url), record)
        return results

    async def discover(self, dataset_id: str, keywords: list[str], limit_per_input: int) -> list[tuple[str, dict]]:
        def key(keyword: str) -> str:
            return f"discover:{dataset_id}:{limit_per_input}:{keyword}"

        results: list[tuple[str, dict]] = []
        missing = []
        for keyword in keywords:
            if (hit := self.cache.get(key(keyword))) is not None:
                results += [(keyword, record) for record in hit]
            else:
                missing.append(keyword)
        if missing and self.online:
            records = await self.trigger(
                dataset_id,
                [{"keyword": k} for k in missing],
                type="discover_new",
                discover_by="keyword",
                limit_per_input=limit_per_input,
            )
            by_keyword = defaultdict(list)
            for record in records:
                by_keyword[str((record.get("input") or {}).get("keyword") or "")].append(record)
            for keyword in missing:
                found = by_keyword.get(keyword, [])
                results += [(keyword, record) for record in found]
                good = [r for r in found if not error_of(r)]
                if good:
                    self.cache.put(key(keyword), good)
        return results
