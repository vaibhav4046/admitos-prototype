#!/bin/bash
# Day 5 go/no-go: scrape 300 records across all subreddits
set -euo pipefail
echo "=== Day 5 Pipeline Run ==="
python -m src.pipeline.batch --dry-run  # test first
read -p "Dry run complete. Continue with live insert? [y/N] " confirm
if [[ "$confirm" == "y" ]]; then
  python -m src.pipeline.batch
  echo "=== Coverage Report ==="
  python -m src.reports.coverage
fi
