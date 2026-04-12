"""
Raw data JSONL snapshot writer.

Per ADR-002, every scraped post is written as a JSON line to a
date-partitioned file before extraction. This preserves the raw data
for re-extraction with improved prompts.

Layer 1 = raw JSONL snapshots (this module)
Layer 2 = clean Supabase profiles (db/client.py)

Output: data/raw/{source}/{YYYY-MM-DD}.jsonl
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from src.scraper.base import Anecdote

logger = logging.getLogger(__name__)

# Default output root relative to the repo root
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def write_snapshot(
    anecdote: Anecdote,
    *,
    data_dir: Path | None = None,
    source: str = "reddit",
) -> Path:
    """Append a single anecdote as a JSON line to the daily snapshot file.

    Returns the path to the JSONL file written to.
    """
    root = data_dir or DEFAULT_DATA_DIR
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_dir = root / "raw" / source
    out_dir.mkdir(parents=True, exist_ok=True)

    out_file = out_dir / f"{today}.jsonl"

    record: dict[str, Any] = {
        "source_url": anecdote.source_url,
        "source_type": anecdote.source_type,
        "title": anecdote.title,
        "body": anecdote.body,
        "author": anecdote.author,
        "created_utc": anecdote.created_utc,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(out_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    logger.debug("Snapshot written to %s", out_file)
    return out_file
