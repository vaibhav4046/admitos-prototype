"""Tests for the coverage report generator."""

from __future__ import annotations

from src.reports.coverage import CoverageReport, CoverageRow, generate_coverage_report


def _make_profiles(countries: list[str | None]) -> list[dict[str, str | None]]:
    """Generate synthetic profile dicts for testing."""
    return [
        {"nationality_country": c, "source_type": "reddit"}
        for c in countries
    ]


class TestGenerateCoverageReport:
    def test_basic_report(self) -> None:
        profiles = _make_profiles(["US", "US", "CN", "CN", "CN", "IN"])
        report = generate_coverage_report(
            profiles=profiles,
            audit_stats={"total": 10, "rejected": 2},
        )

        assert report.total_records == 6
        assert report.rejection_rate == 20.0
        assert report.source_counts["reddit"] == 6

    def test_country_targets(self) -> None:
        profiles = _make_profiles(["CN"] * 500 + ["IN"] * 300)
        report = generate_coverage_report(
            profiles=profiles,
            audit_stats={"total": 800, "rejected": 0},
        )

        cn_row = next(r for r in report.rows if r.country == "CN")
        assert cn_row.count == 500
        assert cn_row.target == 800
        assert cn_row.gap == 300

        in_row = next(r for r in report.rows if r.country == "IN")
        assert in_row.count == 300
        assert in_row.target == 600
        assert in_row.gap == 300

    def test_non_target_countries_included(self) -> None:
        profiles = _make_profiles(["JP", "JP", "US"])
        report = generate_coverage_report(
            profiles=profiles,
            audit_stats={"total": 3, "rejected": 0},
        )

        jp_row = next(r for r in report.rows if r.country == "JP")
        assert jp_row.count == 2
        assert jp_row.target == 0
        assert jp_row.gap == 0

    def test_null_country_handling(self) -> None:
        profiles = _make_profiles([None, None, "US"])
        report = generate_coverage_report(
            profiles=profiles,
            audit_stats={"total": 3, "rejected": 0},
        )

        null_row = next(r for r in report.rows if r.country == "null")
        assert null_row.count == 2

    def test_empty_data(self) -> None:
        report = generate_coverage_report(
            profiles=[],
            audit_stats={"total": 0, "rejected": 0},
        )

        assert report.total_records == 0
        assert report.rejection_rate == 0


class TestFormatTable:
    def test_format_contains_header(self) -> None:
        report = CoverageReport(
            total_records=10,
            rows=[CoverageRow(country="US", count=5, pct=50.0, target=200, gap=195)],
            source_counts={"reddit": 10},
            rejection_rate=5.0,
        )
        table = report.format_table()

        assert "TRAINING DATA COVERAGE REPORT" in table
        assert "Total records: 10" in table
        assert "US" in table
        assert "reddit" in table
