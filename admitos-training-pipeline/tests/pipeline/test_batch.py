"""Tests for the multi-subreddit batch runner."""

from __future__ import annotations

from collections import Counter
from unittest.mock import MagicMock, patch

from src.pipeline.batch import SUBREDDIT_TARGETS, BatchResult, run_batch
from src.pipeline.runner import PipelineResult


class TestSubredditTargets:
    def test_has_us_and_uk_segments(self) -> None:
        subs = [s for s, _ in SUBREDDIT_TARGETS]
        assert "ApplyingToCollege" in subs
        assert "chanceme" in subs
        assert "6thForm" in subs
        assert "UniUK" in subs

    def test_total_limit_at_least_300(self) -> None:
        total = sum(limit for _, limit in SUBREDDIT_TARGETS)
        assert total >= 300


class TestBatchResult:
    def test_combined_totals(self) -> None:
        batch = BatchResult(
            subreddit_results={
                "sub1": PipelineResult(total_fetched=50, extracted=40, rejected=5),
                "sub2": PipelineResult(total_fetched=30, extracted=25, rejected=3),
            }
        )
        assert batch.total_fetched == 80
        assert batch.total_extracted == 65
        assert batch.total_rejected == 8

    def test_combined_country_counts(self) -> None:
        batch = BatchResult(
            subreddit_results={
                "sub1": PipelineResult(country_counts=Counter({"US": 10, "CN": 5})),
                "sub2": PipelineResult(country_counts=Counter({"US": 3, "IN": 7})),
            }
        )
        cc = batch.combined_country_counts
        assert cc["US"] == 13
        assert cc["CN"] == 5
        assert cc["IN"] == 7

    def test_summary_format(self) -> None:
        batch = BatchResult(
            subreddit_results={
                "test": PipelineResult(
                    total_fetched=10,
                    extracted=8,
                    rejected=2,
                    country_counts=Counter({"US": 8}),
                ),
            }
        )
        s = batch.summary()
        assert "BATCH PIPELINE RESULTS" in s
        assert "COMBINED TOTALS" in s
        assert "r/test" in s


class TestRunBatch:
    @patch("src.pipeline.batch.run_pipeline")
    def test_runs_all_subreddits(self, mock_run: MagicMock) -> None:
        mock_run.return_value = PipelineResult(
            total_fetched=10, extracted=8, rejected=2
        )

        batch = run_batch(dry_run=True)

        assert mock_run.call_count == len(SUBREDDIT_TARGETS)
        assert len(batch.subreddit_results) == len(SUBREDDIT_TARGETS)

        # Verify each subreddit was called with correct limit
        for sub, limit in SUBREDDIT_TARGETS:
            mock_run.assert_any_call(subreddit=sub, limit=limit, dry_run=True)

    @patch("src.pipeline.batch.run_pipeline")
    def test_handles_subreddit_failure(self, mock_run: MagicMock) -> None:
        def side_effect(*, subreddit: str, limit: int, dry_run: bool) -> PipelineResult:
            if subreddit == "chanceme":
                raise RuntimeError("PRAW error")
            return PipelineResult(total_fetched=10, extracted=8)

        mock_run.side_effect = side_effect

        batch = run_batch(dry_run=True)

        # Should still have results for all subs (failed ones get empty result)
        assert len(batch.subreddit_results) == len(SUBREDDIT_TARGETS)
        assert batch.subreddit_results["chanceme"].extracted == 0
