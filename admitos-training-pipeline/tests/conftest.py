"""Shared fixtures for training pipeline tests."""

from __future__ import annotations

import pytest

from src.validator import TrainingProfile


@pytest.fixture()
def synthetic_seed() -> dict:
    """A fully valid synthetic training profile matching all DDL constraints."""
    return {
        "sat_score": 1520,
        "act_score": 34,
        "unweighted_gpa": 3.92,
        "ap_course_count": 8,
        "major_category": "stem",
        "ec_hours_per_week": 15,
        "leadership_roles_count": 3,
        "research_experience": True,
        "nationality_region": "us_domestic",
        "nationality_country": "US",
        "admission_outcome": "admitted",
        "extraction_confidence": 0.87,
        "source_url": "https://reddit.com/r/ApplyingToCollege/comments/abc123",
        "source_type": "reddit",
    }


@pytest.fixture()
def synthetic_profile(synthetic_seed: dict) -> TrainingProfile:
    """A pre-validated TrainingProfile from the synthetic seed."""
    return TrainingProfile.model_validate(synthetic_seed)
