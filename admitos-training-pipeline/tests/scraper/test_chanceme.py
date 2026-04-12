"""Tests for the chanceme scraper and post parser."""

from __future__ import annotations

from src.scraper.base import Anecdote
from src.scraper.chanceme import _is_chanceme_post, parse_chanceme_stats


def _make_anecdote(body: str) -> Anecdote:
    return Anecdote(
        source_url="https://reddit.com/r/chanceme/comments/abc123",
        source_type="reddit",
        title="Chance me for T20s",
        body=body,
        author="testuser",
        created_utc=1712700000.0,
    )


class TestIsChancemePost:
    def test_accepts_chance_me_post(self) -> None:
        a = _make_anecdote("Please chance me for MIT, SAT 1520, GPA 3.9")
        assert _is_chanceme_post(a) is True

    def test_accepts_stats_post(self) -> None:
        a = _make_anecdote("My SAT is 1480 and my ACT is 34")
        assert _is_chanceme_post(a) is True

    def test_rejects_irrelevant_post(self) -> None:
        a = _make_anecdote("What is the best dorm at state school?")
        assert _is_chanceme_post(a) is False

    def test_accepts_gpa_mention(self) -> None:
        a = _make_anecdote("UW GPA: 3.92, applying to Ivy League")
        assert _is_chanceme_post(a) is True


class TestParseChancemeStats:
    def test_extracts_sat(self) -> None:
        result = parse_chanceme_stats("SAT: 1520, applying ED to Harvard")
        assert result["sat"] == "1520"

    def test_extracts_sat_reversed(self) -> None:
        result = parse_chanceme_stats("Got a 1480 SAT last month")
        assert result["sat"] == "1480"

    def test_extracts_act(self) -> None:
        result = parse_chanceme_stats("ACT: 34, retaking in December")
        assert result["act"] == "34"

    def test_extracts_gpa(self) -> None:
        result = parse_chanceme_stats("UW GPA: 3.92, W GPA: 4.5")
        assert result["gpa"] == "3.92"

    def test_extracts_gpa_reversed(self) -> None:
        result = parse_chanceme_stats("I have a 3.85 GPA unweighted")
        assert result["gpa"] == "3.85"

    def test_extracts_schools(self) -> None:
        result = parse_chanceme_stats("Applying to Harvard, MIT, Stanford, and Yale")
        assert "harvard" in result["schools"]
        assert "mit" in result["schools"]
        assert "stanford" in result["schools"]
        assert "yale" in result["schools"]

    def test_no_schools_returns_none(self) -> None:
        result = parse_chanceme_stats("SAT 1520, GPA 3.9")
        assert result["schools"] is None

    def test_deduplicates_schools(self) -> None:
        result = parse_chanceme_stats("Harvard ED, and Harvard RD backup")
        assert result["schools"].count("harvard") == 1

    def test_missing_fields_return_none(self) -> None:
        result = parse_chanceme_stats("Just a random post with no stats")
        assert result["sat"] is None
        assert result["act"] is None
        assert result["gpa"] is None
        assert result["schools"] is None
