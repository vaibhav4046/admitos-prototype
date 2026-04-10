"""
Pydantic v2 validator for admissions.training_profile rows.

Every field, constraint, and enum mirrors the SQL DDL in
supabase/migrations/DRAFTS.md §7 exactly. The one addition is
`nationality_country` (Optional ISO 3166-1 alpha-2) which the DDL
doesn't have yet but the product spec requires — it will be added
to the DDL before the migration lands.

Constraint parity with the DDL CHECK constraints:
  - sat_score: 400–1600, divisible by 10
  - act_score: 1–36
  - unweighted_gpa: 0.00–4.00  (numeric(3,2))
  - extraction_confidence: 0.00–1.00  (numeric(3,2))
  - ap_course_count: 0–20
  - ec_hours_per_week: 0–60
  - leadership_roles_count: 0–12
  - at least one of sat_score / act_score must be non-null
"""

from __future__ import annotations

import re
from enum import StrEnum
from typing import Annotated, Optional

from pydantic import BaseModel, Field, model_validator


class MajorCategory(StrEnum):
    STEM = "stem"
    HUMANITIES = "humanities"
    SOCIAL_SCIENCE = "social_science"
    ARTS = "arts"
    BUSINESS = "business"
    UNDECIDED = "undecided"


class NationalityRegion(StrEnum):
    US_DOMESTIC = "us_domestic"
    US_INTERNATIONAL = "us_international"
    UK_HOME = "uk_home"
    UK_INTERNATIONAL = "uk_international"
    ASIA = "asia"
    MIDDLE_EAST = "middle_east"
    EUROPE = "europe"
    AFRICA = "africa"
    LATAM = "latam"
    OCEANIA = "oceania"
    OTHER = "other"


class AdmissionOutcome(StrEnum):
    ADMITTED = "admitted"
    WAITLISTED = "waitlisted"
    REJECTED = "rejected"


# ISO 3166-1 alpha-2 pattern: exactly two uppercase ASCII letters.
_ISO_ALPHA2 = re.compile(r"^[A-Z]{2}$")


class TrainingProfile(BaseModel):
    """Validated training profile matching admissions.training_profile DDL."""

    # --- scores (at least one of sat/act required) ---
    sat_score: Annotated[
        Optional[int], Field(ge=400, le=1600)
    ] = None
    act_score: Annotated[
        Optional[int], Field(ge=1, le=36)
    ] = None

    unweighted_gpa: Annotated[
        float, Field(ge=0, le=4)
    ]

    # --- academic context ---
    ap_course_count: Annotated[
        int, Field(ge=0, le=20)
    ]
    major_category: MajorCategory

    # --- extracurriculars ---
    ec_hours_per_week: Annotated[
        int, Field(ge=0, le=60)
    ]
    leadership_roles_count: Annotated[
        int, Field(ge=0, le=12)
    ]
    research_experience: bool

    # --- nationality ---
    nationality_region: NationalityRegion
    nationality_country: Annotated[
        Optional[str], Field(pattern=r"^[A-Z]{2}$", max_length=2)
    ] = None

    # --- outcome + confidence ---
    admission_outcome: AdmissionOutcome
    extraction_confidence: Annotated[
        float, Field(ge=0, le=1)
    ]

    # --- source tracking ---
    source_url: str
    source_type: str = "reddit"

    @model_validator(mode="after")
    def _sat_or_act_required(self) -> "TrainingProfile":
        if self.sat_score is None and self.act_score is None:
            raise ValueError("at least one of sat_score or act_score must be provided")
        return self

    @model_validator(mode="after")
    def _sat_divisible_by_10(self) -> "TrainingProfile":
        if self.sat_score is not None and self.sat_score % 10 != 0:
            raise ValueError("sat_score must be divisible by 10")
        return self
