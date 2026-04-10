"""
r/chanceme scraper.

Posts on r/chanceme follow a predictable format:
  - Stats block: SAT/ACT, GPA, class rank
  - School list: target schools
  - "Chance me" prompt
  - Extracurriculars and awards

This scraper reuses the base RedditScraper but applies chanceme-specific
post parsing to extract structured fields before sending to Claude.
"""

from __future__ import annotations

import re

from src.scraper.reddit import RedditScraper
from src.scraper.base import Anecdote


class ChancemeScraper(RedditScraper):
    """Scrape r/chanceme posts with format-aware parsing."""

    def _fetch_posts(self, *, subreddit: str, limit: int) -> list[Anecdote]:
        """Fetch posts, applying chanceme-specific filtering."""
        raw = super()._fetch_posts(subreddit=subreddit, limit=limit)
        return [a for a in raw if _is_chanceme_post(a)]


def _is_chanceme_post(anecdote: Anecdote) -> bool:
    """Filter for posts that look like actual chance-me requests."""
    text = anecdote.body.lower()
    return any(marker in text for marker in ("chance me", "gpa", "sat", "act"))


def parse_chanceme_stats(body: str) -> dict[str, str | None]:
    """Extract stats from a chanceme post body.

    Returns a dict with keys: sat, act, gpa, schools.
    Values are raw strings or None if not found.
    This is a best-effort pre-parser — Claude does the real extraction.
    """
    result: dict[str, str | None] = {
        "sat": None,
        "act": None,
        "gpa": None,
        "schools": None,
    }

    # SAT: look for "SAT: 1520" or "1520 SAT" patterns
    sat_match = re.search(r"sat[:\s]*(\d{3,4})", body, re.IGNORECASE)
    if not sat_match:
        sat_match = re.search(r"(\d{3,4})\s*sat", body, re.IGNORECASE)
    if sat_match:
        result["sat"] = sat_match.group(1)

    # ACT: look for "ACT: 34" or "34 ACT" patterns
    act_match = re.search(r"act[:\s]*(\d{1,2})", body, re.IGNORECASE)
    if not act_match:
        act_match = re.search(r"(\d{1,2})\s*act", body, re.IGNORECASE)
    if act_match:
        result["act"] = act_match.group(1)

    # GPA: look for "GPA: 3.92" or "3.92 GPA" or "UW GPA: 3.92"
    gpa_match = re.search(r"(?:uw\s*)?gpa[:\s]*(\d\.\d+)", body, re.IGNORECASE)
    if not gpa_match:
        gpa_match = re.search(r"(\d\.\d+)\s*(?:uw\s*)?gpa", body, re.IGNORECASE)
    if gpa_match:
        result["gpa"] = gpa_match.group(1)

    # Schools: look for lines with known school names
    school_pattern = (
        r"(?:harvard|mit|stanford|yale|princeton|columbia|upenn|brown|dartmouth|cornell"
        r"|caltech|duke|northwestern|uchicago|johns hopkins|rice|vanderbilt|notre dame"
        r"|emory|georgetown|berkeley|ucla|nyu|umich|cmu|georgia tech|uva|oxford|cambridge"
        r"|imperial|lse|ucl|edinburgh|warwick|bristol|durham|st andrews|kcl)"
    )
    schools_found = re.findall(school_pattern, body, re.IGNORECASE)
    if schools_found:
        result["schools"] = ", ".join(dict.fromkeys(s.lower() for s in schools_found))

    return result
