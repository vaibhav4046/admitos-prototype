"""
tests/test_validator.py

Exercises every DDL constraint in the Pydantic validator to ensure
parity with admissions.training_profile CHECK constraints.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.validator import TrainingProfile


class TestSyntheticSeedValid:
    """The golden-path synthetic seed must always validate."""

    def test_synthetic_seed_validates(self, synthetic_seed: dict) -> None:
        profile = TrainingProfile.model_validate(synthetic_seed)
        assert profile.sat_score == 1520
        assert profile.nationality_country == "US"

    def test_roundtrip_json(self, synthetic_profile: TrainingProfile) -> None:
        dumped = synthetic_profile.model_dump(mode="json")
        roundtripped = TrainingProfile.model_validate(dumped)
        assert roundtripped == synthetic_profile


class TestSATConstraints:
    def test_sat_below_400_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["sat_score"] = 390
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_sat_above_1600_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["sat_score"] = 1610
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_sat_not_divisible_by_10_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["sat_score"] = 1455
        with pytest.raises(ValidationError, match="divisible by 10"):
            TrainingProfile.model_validate(synthetic_seed)

    def test_sat_at_boundaries(self, synthetic_seed: dict) -> None:
        for score in (400, 1600):
            synthetic_seed["sat_score"] = score
            p = TrainingProfile.model_validate(synthetic_seed)
            assert p.sat_score == score


class TestACTConstraints:
    def test_act_below_1_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["act_score"] = 0
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_act_above_36_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["act_score"] = 37
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestSATOrACTRequired:
    def test_both_null_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["sat_score"] = None
        synthetic_seed["act_score"] = None
        with pytest.raises(ValidationError, match="at least one"):
            TrainingProfile.model_validate(synthetic_seed)

    def test_sat_only(self, synthetic_seed: dict) -> None:
        synthetic_seed["act_score"] = None
        p = TrainingProfile.model_validate(synthetic_seed)
        assert p.sat_score is not None
        assert p.act_score is None

    def test_act_only(self, synthetic_seed: dict) -> None:
        synthetic_seed["sat_score"] = None
        p = TrainingProfile.model_validate(synthetic_seed)
        assert p.act_score is not None
        assert p.sat_score is None


class TestGPAConstraints:
    def test_gpa_below_0_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["unweighted_gpa"] = -0.01
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_gpa_above_4_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["unweighted_gpa"] = 4.01
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestAPConstraints:
    def test_ap_above_20_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["ap_course_count"] = 21
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestECConstraints:
    def test_ec_above_60_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["ec_hours_per_week"] = 61
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestLeadershipConstraints:
    def test_leadership_above_12_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["leadership_roles_count"] = 13
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestExtractionConfidence:
    def test_confidence_above_1_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["extraction_confidence"] = 1.01
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_confidence_below_0_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["extraction_confidence"] = -0.01
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)


class TestEnums:
    def test_invalid_major_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["major_category"] = "basket_weaving"
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_invalid_region_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["nationality_region"] = "mars"
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_invalid_outcome_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["admission_outcome"] = "deferred"
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_all_major_categories(self, synthetic_seed: dict) -> None:
        for cat in ("stem", "humanities", "social_science", "arts", "business", "undecided"):
            synthetic_seed["major_category"] = cat
            p = TrainingProfile.model_validate(synthetic_seed)
            assert p.major_category == cat

    def test_all_nationality_regions(self, synthetic_seed: dict) -> None:
        for region in (
            "us_domestic", "us_international", "uk_home", "uk_international",
            "asia", "middle_east", "europe", "africa", "latam", "oceania", "other",
        ):
            synthetic_seed["nationality_region"] = region
            p = TrainingProfile.model_validate(synthetic_seed)
            assert p.nationality_region == region


class TestNationalityCountry:
    def test_valid_iso_alpha2(self, synthetic_seed: dict) -> None:
        for code in ("US", "GB", "IN", "CN"):
            synthetic_seed["nationality_country"] = code
            p = TrainingProfile.model_validate(synthetic_seed)
            assert p.nationality_country == code

    def test_lowercase_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["nationality_country"] = "us"
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_three_letter_fails(self, synthetic_seed: dict) -> None:
        synthetic_seed["nationality_country"] = "USA"
        with pytest.raises(ValidationError):
            TrainingProfile.model_validate(synthetic_seed)

    def test_null_allowed(self, synthetic_seed: dict) -> None:
        synthetic_seed["nationality_country"] = None
        p = TrainingProfile.model_validate(synthetic_seed)
        assert p.nationality_country is None
