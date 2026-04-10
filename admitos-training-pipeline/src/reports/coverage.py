"""
Coverage report for Day 5 go/no-go.

Connects to Supabase and queries training_profile to generate the
nationality_country distribution table Andy will review.

CLI: python -m src.reports.coverage
"""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from typing import Any

from src.db.client import _get_client

logger = logging.getLogger(__name__)

# Day 5 targets from the plan (Week 0 training data spec)
COUNTRY_TARGETS: dict[str, int] = {
    "CN": 800,
    "IN": 600,
    "KR": 400,
    "HK": 400,
    "TW": 400,
    "SG": 400,
    "US": 200,
    "GB": 200,
}


@dataclass
class CoverageRow:
    country: str
    count: int
    pct: float
    target: int
    gap: int


@dataclass
class CoverageReport:
    total_records: int
    rows: list[CoverageRow]
    source_counts: dict[str, int]
    rejection_rate: float

    def format_table(self) -> str:
        lines = [
            "=" * 65,
            "TRAINING DATA COVERAGE REPORT",
            "=" * 65,
            f"\nTotal records: {self.total_records}",
            f"Rejection rate: {self.rejection_rate:.1f}%",
            "",
            f"{'Country':<10} {'Count':>6} {'% Total':>8} {'Target':>7} {'Gap':>6}",
            "-" * 45,
        ]

        for row in self.rows:
            gap_str = f"{row.gap}" if row.gap > 0 else "OK"
            lines.append(
                f"{row.country:<10} {row.count:>6} {row.pct:>7.1f}% {row.target:>7} {gap_str:>6}"
            )

        lines.append(f"\n{'Source':>20} {'Count':>6}")
        lines.append("-" * 30)
        for source, count in sorted(self.source_counts.items(), key=lambda x: -x[1]):
            lines.append(f"{source:>20} {count:>6}")

        return "\n".join(lines)


def generate_coverage_report(
    *,
    profiles: list[dict[str, Any]] | None = None,
    audit_stats: dict[str, int] | None = None,
) -> CoverageReport:
    """Generate the coverage report.

    Args:
        profiles: Optional pre-fetched profile data (for testing).
        audit_stats: Optional pre-fetched audit stats (for testing).
    """
    if profiles is None:
        profiles = _fetch_profiles()
    if audit_stats is None:
        audit_stats = _fetch_audit_stats()

    total = len(profiles)

    # Count by country
    country_counts: dict[str, int] = {}
    source_counts: dict[str, int] = {}
    for p in profiles:
        country = p.get("nationality_country") or "null"
        country_counts[country] = country_counts.get(country, 0) + 1
        source = p.get("source_type", "unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    # Build rows for target countries + any extras
    rows: list[CoverageRow] = []
    seen = set()
    for country, target in COUNTRY_TARGETS.items():
        count = country_counts.get(country, 0)
        pct = (count / total * 100) if total else 0
        rows.append(CoverageRow(country=country, count=count, pct=pct, target=target, gap=max(0, target - count)))
        seen.add(country)

    # Add non-target countries with counts
    for country, count in sorted(country_counts.items(), key=lambda x: -x[1]):
        if country not in seen:
            pct = (count / total * 100) if total else 0
            rows.append(CoverageRow(country=country, count=count, pct=pct, target=0, gap=0))

    # Rejection rate
    total_attempted = audit_stats.get("total", 0)
    total_rejected = audit_stats.get("rejected", 0)
    rejection_rate = (total_rejected / total_attempted * 100) if total_attempted else 0

    return CoverageReport(
        total_records=total,
        rows=rows,
        source_counts=source_counts,
        rejection_rate=rejection_rate,
    )


def _fetch_profiles() -> list[dict[str, Any]]:
    """Fetch all training profiles from Supabase."""
    client = _get_client()
    result = (
        client.schema("admissions")
        .table("training_profile")
        .select("nationality_country,source_type")
        .execute()
    )
    return result.data or []


def _fetch_audit_stats() -> dict[str, int]:
    """Fetch extraction audit stats from Supabase."""
    client = _get_client()
    result = (
        client.schema("admissions")
        .table("extraction_audit")
        .select("status", count="exact")
        .execute()
    )
    total = result.count or 0

    rejected_result = (
        client.schema("admissions")
        .table("extraction_audit")
        .select("status", count="exact")
        .eq("status", "rejected")
        .execute()
    )
    rejected = rejected_result.count or 0

    return {"total": total, "rejected": rejected}


def main() -> None:
    parser = argparse.ArgumentParser(description="AdmitOS training data coverage report")
    parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    report = generate_coverage_report()
    print(report.format_table())


if __name__ == "__main__":
    main()
