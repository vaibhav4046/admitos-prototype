"""Tests for the end-to-end pipeline runner."""

from __future__ import annotations

from collections import Counter
from unittest.mock import MagicMock, patch

import pytest
from pydantic import ValidationError

from src.pipeline.runner import PipelineResult, run_pipeline
from src.scraper.base import Anecdote
from src.validator import TrainingProfile


def _make_anecdote(idx: int = 1) -> Anecdote:
    return Anecdote(
        source_url=f"https://reddit.com/r/test/comments/post{idx}",
        source_type="reddit",
        title=f"Test Post {idx}",
        body="I got a 1520 SAT, 3.95 GPA, 8 APs, admitted to Harvard as a STEM major.",
        author="testuser",
        created_utc=1712700000.0,
    )


def _make_profile(anecdote: Anecdote) -> TrainingProfile:
    return TrainingProfile(
        sat_score=1520,
        act_score=34,
        unweighted_gpa=3.95,
        ap_course_count=8,
        major_category="stem",
        ec_hours_per_week=15,
        leadership_roles_count=3,
        research_experience=True,
        nationality_region="us_domestic",
        nationality_country="US",
        admission_outcome="admitted",
        extraction_confidence=0.9,
        source_url=anecdote.source_url,
        source_type="reddit",
    )


class TestPipelineResult:
    def test_summary_format(self) -> None:
        r = PipelineResult(
            total_fetched=10,
            extracted=7,
            rejected=2,
            errors=1,
            country_counts=Counter({"US": 5, "CN": 2}),
        )
        s = r.summary()
        assert "Fetched:    10" in s
        assert "Extracted:  7" in s
        assert "US: 5" in s
        assert "CN: 2" in s

    def test_total_attempted(self) -> None:
        r = PipelineResult(extracted=5, rejected=3, errors=1)
        assert r.total_attempted == 9


class TestRunPipelineDryRun:
    def test_dry_run_no_db_writes(self) -> None:
        anecdotes = [_make_anecdote(1), _make_anecdote(2)]
        mock_scraper = MagicMock()
        mock_scraper.scrape.return_value = anecdotes

        mock_extractor = MagicMock(side_effect=lambda a: _make_profile(a))

        result = run_pipeline(
            subreddit="test",
            limit=10,
            dry_run=True,
            scraper=mock_scraper,
            extractor=mock_extractor,
        )

        assert result.total_fetched == 2
        assert result.extracted == 2
        assert result.rejected == 0
        assert result.country_counts["US"] == 2

    def test_dry_run_with_extraction_failure(self) -> None:
        anecdotes = [_make_anecdote(1)]
        mock_scraper = MagicMock()
        mock_scraper.scrape.return_value = anecdotes

        mock_extractor = MagicMock(
            side_effect=ValidationError.from_exception_data(
                title="TrainingProfile",
                line_errors=[
                    {
                        "type": "missing",
                        "loc": ("unweighted_gpa",),
                        "msg": "Field required",
                        "input": {},
                    }
                ],
            )
        )

        result = run_pipeline(
            subreddit="test",
            limit=10,
            dry_run=True,
            scraper=mock_scraper,
            extractor=mock_extractor,
        )

        assert result.total_fetched == 1
        assert result.extracted == 0
        assert result.rejected == 1


class TestRunPipelineLive:
    @patch("src.pipeline.runner.insert_extraction_audit")
    @patch("src.pipeline.runner.update_scrape_request_status")
    @patch("src.pipeline.runner.insert_scrape_request", return_value="req_1")
    @patch("src.pipeline.runner.check_source_uri_exists", return_value=False)
    @patch("src.pipeline.runner.insert_profile")
    def test_live_inserts_profile(
        self,
        mock_insert_profile: MagicMock,
        mock_check_dup: MagicMock,
        mock_insert_scrape: MagicMock,
        mock_update_scrape: MagicMock,
        mock_insert_audit: MagicMock,
    ) -> None:
        anecdotes = [_make_anecdote(1)]
        mock_scraper = MagicMock()
        mock_scraper.scrape.return_value = anecdotes

        mock_extractor = MagicMock(side_effect=lambda a: _make_profile(a))

        result = run_pipeline(
            subreddit="test",
            limit=10,
            dry_run=False,
            scraper=mock_scraper,
            extractor=mock_extractor,
        )

        assert result.extracted == 1
        mock_insert_profile.assert_called_once()
        mock_update_scrape.assert_called_once_with("req_1", "extracted")
        mock_insert_audit.assert_called_once()

    @patch("src.pipeline.runner.insert_extraction_audit")
    @patch("src.pipeline.runner.update_scrape_request_status")
    @patch("src.pipeline.runner.insert_scrape_request", return_value="req_1")
    @patch("src.pipeline.runner.check_source_uri_exists", return_value=True)
    @patch("src.pipeline.runner.insert_profile")
    def test_skips_duplicates(
        self,
        mock_insert_profile: MagicMock,
        mock_check_dup: MagicMock,
        mock_insert_scrape: MagicMock,
        mock_update_scrape: MagicMock,
        mock_insert_audit: MagicMock,
    ) -> None:
        anecdotes = [_make_anecdote(1)]
        mock_scraper = MagicMock()
        mock_scraper.scrape.return_value = anecdotes

        result = run_pipeline(
            subreddit="test",
            limit=10,
            dry_run=False,
            scraper=mock_scraper,
        )

        assert result.duplicates_skipped == 1
        assert result.extracted == 0
        mock_insert_profile.assert_not_called()
