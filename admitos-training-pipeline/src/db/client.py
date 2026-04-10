"""
Supabase client wrapper for the training pipeline.

Connects to the admissions schema to insert validated
TrainingProfile rows into `admissions.training_profile`.

This is a thin wrapper — no ORM, no query builder beyond what
supabase-py gives us. The validator guarantees every row we
insert already satisfies the DDL constraints.
"""

from __future__ import annotations

import os
from typing import Any

from supabase import Client, create_client

from src.validator import TrainingProfile

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise EnvironmentError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

    _client = create_client(url, key)
    return _client


def insert_profile(profile: TrainingProfile) -> dict[str, Any]:
    """Insert a validated training profile into the DB."""
    client = _get_client()
    row = profile.model_dump(mode="json")
    result = (
        client.schema("admissions")
        .table("training_profile")
        .insert(row)
        .execute()
    )
    return result.data[0] if result.data else {}


def count_profiles() -> int:
    """Return the current row count in training_profile."""
    client = _get_client()
    result = (
        client.schema("admissions")
        .table("training_profile")
        .select("id", count="exact")
        .execute()
    )
    return result.count or 0
