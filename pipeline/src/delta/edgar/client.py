import time
from collections.abc import Iterator
from datetime import date
from typing import Self

import httpx

from delta.edgar.forms import FormD, parse_form_d
from delta.edgar.index import IndexEntry, index_url, parse_form_index


class EdgarClient:
    def __init__(self, user_agent: str, max_requests_per_second: float = 8, timeout: float = 30):
        if "@" not in user_agent:
            raise ValueError("SEC requires a User-Agent with a contact email, e.g. 'delta you@example.com'")
        self.http = httpx.Client(
            headers={"User-Agent": user_agent, "Accept-Encoding": "gzip, deflate"},
            timeout=timeout,
            follow_redirects=True,
        )
        self.interval = 1 / max_requests_per_second
        self.last_request = 0.0

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *exc) -> None:
        self.http.close()

    def get(self, url: str) -> httpx.Response | None:
        time.sleep(max(0, self.interval - (time.monotonic() - self.last_request)))
        self.last_request = time.monotonic()
        response = self.http.get(url)
        if response.status_code == httpx.codes.NOT_FOUND:
            return None
        return response.raise_for_status()

    def form_d_index(self, day: date) -> list[IndexEntry]:
        response = self.get(index_url(day))
        return parse_form_index(response.text) if response else []

    def form_d(self, entry: IndexEntry) -> FormD | None:
        response = self.get(entry.primary_doc_url)
        return parse_form_d(response.content) if response else None

    def form_d_filings(self, day: date) -> Iterator[tuple[IndexEntry, FormD]]:
        for entry in self.form_d_index(day):
            if form := self.form_d(entry):
                yield entry, form
