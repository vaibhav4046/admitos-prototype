"""
Multi-subreddit batch runner.

Runs the pipeline across all target subreddits sequentially and
prints a combined coverage report at the end.

CLI: python -m src.pipeline.batch --dry-run
"""

from __future__ import annotations

import argparse
import logging
from collections import Counter
from dataclasses import dataclass, field

from src.pipeline.runner import PipelineResult, run_pipeline

logger = logging.getLogger(__name__)

SUBREDDIT_TARGETS: list[tuple[str, int]] = [
    # US segment
    ("ApplyingToCollege", 150),
    ("chanceme", 100),
    # UK segment
    ("6thForm", 30),
    ("UniUK", 20),
]


@dataclass
class BatchResult:
    """Combined results across all subreddits."""

    subreddit_results: dict[str, PipelineResult] = field(default_factory=dict)

    @property
    def total_fetched(self) -> int:
        return sum(r.total_fetched for r in self.subreddit_results.values())

    @property
    def total_extracted(self) -> int:
        return sum(r.extracted for r in self.subreddit_results.values())

    @property
    def total_rejected(self) -> int:
        return sum(r.rejected for r in self.subreddit_results.values())

    @property
    def total_duplicates(self) -> int:
        return sum(r.duplicates_skipped for r in self.subreddit_results.values())

    @property
    def combined_country_counts(self) -> Counter[str]:
        combined: Counter[str] = Counter()
        for r in self.subreddit_results.values():
            combined.update(r.country_counts)
        return combined

    def summary(self) -> str:
        lines = [
            "=" * 50,
            "BATCH PIPELINE RESULTS",
            "=" * 50,
        ]

        for sub, result in self.subreddit_results.items():
            lines.append(f"\nr/{sub}:")
            lines.append(result.summary())

        lines.append(f"\n{'=' * 50}")
        lines.append("COMBINED TOTALS")
        lines.append(f"  Fetched:    {self.total_fetched}")
        lines.append(f"  Extracted:  {self.total_extracted}")
        lines.append(f"  Rejected:   {self.total_rejected}")
        lines.append(f"  Duplicates: {self.total_duplicates}")

        cc = self.combined_country_counts
        if cc:
            lines.append("\n  nationality_country distribution:")
            for country, count in cc.most_common():
                pct = (count / self.total_extracted * 100) if self.total_extracted else 0
                lines.append(f"    {country or 'null'}: {count} ({pct:.1f}%)")

        return "\n".join(lines)


def run_batch(*, dry_run: bool = False) -> BatchResult:
    """Run the pipeline across all configured subreddits."""
    batch = BatchResult()

    for subreddit, limit in SUBREDDIT_TARGETS:
        logger.info("Starting pipeline for r/%s (limit=%d)", subreddit, limit)
        try:
            result = run_pipeline(subreddit=subreddit, limit=limit, dry_run=dry_run)
            batch.subreddit_results[subreddit] = result
        except Exception:
            logger.exception("Pipeline failed for r/%s", subreddit)
            batch.subreddit_results[subreddit] = PipelineResult()

    return batch


def main() -> None:
    parser = argparse.ArgumentParser(description="AdmitOS batch pipeline runner")
    parser.add_argument("--dry-run", action="store_true", help="Skip DB writes")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    batch = run_batch(dry_run=args.dry_run)
    print(batch.summary())


if __name__ == "__main__":
    main()
