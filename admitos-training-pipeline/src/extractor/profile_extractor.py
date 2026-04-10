"""
Claude-based profile extractor.

Takes a raw Anecdote and uses Claude Haiku to extract a structured
TrainingProfile. The prompt slot is `training.extract_profile` — the
same one seeded in the TypeScript app's prompt_version table.

This is a SCAFFOLD — it calls the Anthropic API with a hardcoded
system prompt for now. Once the prompt versioning DB is wired for
Python, this will read from the same prompt_version table the TS app
uses.
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

from src.scraper.base import Anecdote
from src.validator import TrainingProfile


def _build_system_prompt() -> str:
    return (
        "You are a structured data extractor. Given a college admissions anecdote, "
        "extract a JSON object matching the TrainingProfile schema exactly. "
        "Rules:\n"
        "- sat_score must be divisible by 10 (400-1600) or null\n"
        "- act_score must be 1-36 or null\n"
        "- At least one of sat_score / act_score must be non-null\n"
        "- unweighted_gpa: 0.00 to 4.00\n"
        "- nationality_country: ISO 3166-1 alpha-2 or null\n"
        "- admission_outcome: admitted | waitlisted | rejected\n"
        "- extraction_confidence: 0.00 to 1.00 (how confident you are)\n"
        "- Return ONLY valid JSON, no markdown fences, no explanation.\n"
    )


def extract_profile(anecdote: Anecdote) -> TrainingProfile:
    """Extract and validate a TrainingProfile from a raw anecdote."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY must be set")

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=_build_system_prompt(),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Source URL: {anecdote.source_url}\n\n"
                    f"Title: {anecdote.title}\n\n"
                    f"Body:\n{anecdote.body}"
                ),
            }
        ],
    )

    raw_text = message.content[0].text  # type: ignore[union-attr]
    parsed: dict[str, Any] = json.loads(raw_text)

    # Inject source fields the model can't know
    parsed["source_url"] = anecdote.source_url
    parsed["source_type"] = anecdote.source_type

    return TrainingProfile.model_validate(parsed)
