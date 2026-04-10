"""
End-to-end pipeline runner.

Scrapes a single subreddit, extracts profiles via Claude Haiku,
validates through Pydantic, and loads into Supabase. Tracks every
attempt in extraction_audit and deduplicates by source_uri.

CLI: python -m src.pipeline.runner --subreddit ApplyingToCollege --limit 100 --dry-run
"""

from __future__ import annotations

import argparse
import logging
import sys
from collections import Counter
from dataclasses import dataclass, field
from typing import Any

from pydantic import ValidationError

from src.db.client import insert_profile, insert_scrape_request, update_scrape_request_status, \
    check_source_uri_exists, insert_extraction_audit
from src.extractor.profile_extractor import extract_profile
from src.scraper.base import Anecdote
from src.scraper.reddit import RedditScraper
from src.validator import TrainingProfile

logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    """Summary of a single pipeline run."""

    total_fetched: int = 0
    duplicates_skipped: int = 0
    extracted: int = 0
    rejected: int = 0
    errors: int = 0
    country_counts: Counter[str] = field(default_factory=Counter)

    @property
    def total_attempted(self) -> int:
        return self.extracted + self.rejected + self.errors

    def summary(self) -> str:
        lines = [
            f"  Fetched:    {self.total_fetched}",
            f"  Duplicates: {self.duplicates_skipped}",
            f"  Extracted:  {self.extracted}",
            f"  Rejected:   {self.rejected}",
            f"  Errors:     {self.errors}",
        ]
        if self.country_counts:
            lines.append("  By nationality_country:")
            for country, count in self.country_counts.most_common():
                lines.append(f"    {country or 'null'}: {count}")
        return "\n".join(lines)


def run_pipeline(
    *,
    subreddit: str = "ApplyingToCollege",
    limit: int = 100,
    dry_run: bool = False,
    scraper: RedditScraper | None = None,
    extractor: Any = None,
) -> PipelineResult:
    """Run the full scrape -> extract -> validate -> load pipeline.

    Args:
        subreddit: Target subreddit name.
        limit: Max posts to fetch.
        dry_run: If True, skip all DB writes.
        scraper: Optional scraper instance (for testing).
        extractor: Optional extraction function (for testing).
    """
    result = PipelineResult()

    if scraper is None:
        scraper = RedditScraper()
    extract_fn = extractor or extract_profile

    # Step 1: Scrape
    logger.info("Scraping r/%s (limit=%d, dry_run=%s)", subreddit, limit, dry_run)
    anecdotes = scraper.scrape(subreddit=subreddit, limit=limit)
    result.total_fetched = len(anecdotes)
    logger.info("Fetched %d posts from r/%s", len(anecdotes), subreddit)

    # Step 2: Process each post
    for anecdote in anecdotes:
        _process_anecdote(
            anecdote=anecdote,
            extract_fn=extract_fn,
            dry_run=dry_run,
            result=result,
            subreddit=subreddit,
        )

    return result


def _process_anecdote(
    *,
    anecdote: Anecdote,
    extract_fn: Any,
    dry_run: bool,
    result: PipelineResult,
    subreddit: str,
) -> None:
    """Process a single anecdote through the pipeline."""
    # Dedup check
    if not dry_run and check_source_uri_exists(anecdote.source_url):
        result.duplicates_skipped += 1
        logger.debug("Skipping duplicate: %s", anecdote.source_url)
        return

    # Insert scrape_request
    scrape_request_id = None
    if not dry_run:
        scrape_request_id = insert_scrape_request(
            source_uri=anecdote.source_url,
            subreddit=subreddit,
            status="scraped",
        )

    # Extract
    try:
        profile: TrainingProfile = extract_fn(anecdote)
    except (ValidationError, Exception) as exc:
        reason = str(exc)
        result.rejected += 1
        logger.warning("Rejected %s: %s", anecdote.source_url, reason[:200])

        if not dry_run:
            if scrape_request_id:
                update_scrape_request_status(scrape_request_id, "rejected")
            insert_extraction_audit(
                source_uri=anecdote.source_url,
                status="rejected",
                reason=reason[:500],
            )
        return

    # Valid profile
    result.extracted += 1
    result.country_counts[profile.nationality_country or "null"] += 1

    if dry_run:
        logger.info(
            "[DRY RUN] Would insert: %s | %s | %s",
            profile.nationality_country,
            profile.nationality_region,
            anecdote.source_url,
        )
    else:
        insert_profile(profile)
        if scrape_request_id:
            update_scrape_request_status(scrape_request_id, "extracted")
        insert_extraction_audit(
            source_uri=anecdote.source_url,
            status="extracted",
            reason=None,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="AdmitOS training data pipeline runner")
    parser.add_argument("--subreddit", default="ApplyingToCollege", help="Target subreddit")
    parser.add_argument("--limit", type=int, default=100, help="Max posts to scrape")
    parser.add_argument("--dry-run", action="store_true", help="Skip DB writes")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    result = run_pipeline(
        subreddit=args.subreddit,
        limit=args.limit,
        dry_run=args.dry_run,
    )

    print(f"\n=== Pipeline Results: r/{args.subreddit} ===")
    print(result.summary())


if __name__ == "__main__":
    main()
