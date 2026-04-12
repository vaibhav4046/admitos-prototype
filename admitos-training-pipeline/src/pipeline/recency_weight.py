"""
Recency-weight computation for training data.

Time-decay schedule:
  2023+    -> 1.0  (full weight)
  2021-22  -> 0.7
  2019-20  -> 0.4
  pre-2019 -> None (excluded)

Also classifies credential_type and test-optional eligibility.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

EXCLUSION_CUTOFF = 2019
TEST_OPTIONAL_START_YEAR = 2020

CredentialType = Literal["sat", "act", "both", "test_optional"]


@dataclass
class RecencyResult:
    weight: Optional[float]
    excluded: bool
    test_optional_eligible: bool


def compute_recency_weight(application_year: int) -> RecencyResult:
    """Compute the recency weight for a training data point."""
    test_optional = application_year >= TEST_OPTIONAL_START_YEAR

    if application_year < EXCLUSION_CUTOFF:
        return RecencyResult(weight=None, excluded=True, test_optional_eligible=False)

    if application_year <= 2020:
        return RecencyResult(weight=0.4, excluded=False, test_optional_eligible=test_optional)

    if application_year <= 2022:
        return RecencyResult(weight=0.7, excluded=False, test_optional_eligible=test_optional)

    return RecencyResult(weight=1.0, excluded=False, test_optional_eligible=test_optional)


def classify_credential_type(
    sat_score: Optional[int],
    act_score: Optional[int],
    test_optional_eligible: bool,
) -> CredentialType:
    """Determine credential_type based on available scores."""
    has_sat = sat_score is not None
    has_act = act_score is not None

    if has_sat and has_act:
        return "both"
    if has_sat:
        return "sat"
    if has_act:
        return "act"

    return "test_optional"
