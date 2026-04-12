"""
Base scraper with rate-limiting and common interface.

Every concrete scraper (Reddit, CollegeConfidential, etc.) subclasses
BaseScraper and implements `_fetch_posts`. The base class handles
rate limiting and converts raw posts into a uniform Anecdote shape
for downstream extraction.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Anecdote:
    """A single user-authored admissions anecdote scraped from the web."""

    source_url: str
    source_type: str
    title: str
    body: str
    author: str
    created_utc: float


@dataclass
class BaseScraper(ABC):
    """Rate-limited scraper base class."""

    requests_per_minute: int = 30
    _last_request_time: float = field(default=0.0, init=False, repr=False)

    def _rate_limit(self) -> None:
        interval = 60.0 / self.requests_per_minute
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < interval:
            time.sleep(interval - elapsed)
        self._last_request_time = time.monotonic()

    @abstractmethod
    def _fetch_posts(self, *, subreddit: str, limit: int) -> list[Anecdote]:
        ...

    def scrape(self, *, subreddit: str, limit: int = 100) -> list[Anecdote]:
        self._rate_limit()
        return self._fetch_posts(subreddit=subreddit, limit=limit)
