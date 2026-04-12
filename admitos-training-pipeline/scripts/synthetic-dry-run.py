"""
Synthetic dry-run: tests the FULL pipeline without Reddit.

Creates 10 realistic fake posts, runs them through Claude Haiku extraction,
validates via Pydantic, and inserts into Supabase.

Proves: Anthropic extraction -> Pydantic validation -> Supabase insert -> Coverage report

Usage:
  cd admitos-training-pipeline
  python scripts/synthetic-dry-run.py           # live insert
  python scripts/synthetic-dry-run.py --dry-run # extract only, no DB write
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure src is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from src.scraper.base import Anecdote
from src.extractor.profile_extractor import extract_profile
from src.validator import TrainingProfile
from src.db.client import insert_profile, insert_extraction_audit

# 10 synthetic posts — mix of nationalities matching Day 5 targets
SYNTHETIC_POSTS: list[dict[str, str]] = [
    {
        "title": "Chinese international student - accepted to MIT EA!",
        "body": """Stats: SAT 1560, ACT 35, UW GPA 3.97/4.0. 12 APs including BC Calc, Physics C,
        CS A, Chemistry. Major: Computer Science (STEM). ECs: 20 hours/week - founded coding
        club (president 3 years), USACO Gold, research at local university on ML, published
        in conference. 4 leadership roles. From Beijing, China. Applied Early Action.
        Nationality: Chinese international student (CN). Admitted to MIT!""",
        "author": "mit_dream_cn",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "Got into Stanford as Chinese applicant from Shanghai",
        "body": """SAT: 1540, no ACT. GPA: 3.94 unweighted. 10 AP courses. Intended major:
        Electrical Engineering (STEM). ECs about 18 hours/week. President of robotics team,
        captain of math olympiad team, summer research at Tsinghua University. 3 leadership
        positions. Chinese citizen from Shanghai (CN). Research experience: yes, published
        paper. Applied RD. Outcome: ADMITTED to Stanford! So happy.""",
        "author": "stanford_cn",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "Rejected from Harvard - Chinese international perspective",
        "body": """My stats: SAT 1520, GPA 3.88 UW. 8 AP courses. Applied for Biology (STEM).
        ECs: 15 hrs/week - hospital volunteering, biology olympiad, debate team. 2 leadership
        roles. No research experience. From Shenzhen, China (CN nationality).
        International student. Applied Regular Decision. Unfortunately REJECTED.
        Extraction confidence should be high as I listed everything clearly.""",
        "author": "harvard_reject_cn",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "Indian student admitted to Columbia!",
        "body": """SAT: 1550, ACT: 35. Unweighted GPA: 3.95. 11 APs. Major: Economics
        (social science). 22 hours/week ECs - Model UN (Secretary General), debate captain,
        started nonprofit for education in rural India. 5 leadership roles. Research
        experience at IIT Bombay on economic policy. From Mumbai, India (IN).
        International applicant. Applied ED. ADMITTED! Dreams do come true.""",
        "author": "columbia_in",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "Chance me update: Indian applicant waitlisted at Yale",
        "body": """Stats dump: 1490 SAT, 3.85 GPA unweighted. 7 APs. Applying as
        humanities major (English Literature). ECs 12 hours/week: school newspaper
        editor, creative writing awards, theater. 2 leadership roles. No formal research.
        Indian nationality (IN), from New Delhi. Applied RD to Yale.
        Result: WAITLISTED. Still hopeful but preparing for other options.""",
        "author": "yale_wl_in",
        "subreddit": "chanceme",
    },
    {
        "title": "Singapore student - accepted to Princeton!",
        "body": """SAT: 1570. UW GPA: 3.98. 14 AP courses (all 5s). Computer Science major
        (STEM). 25 hours/week on ECs: competitive programming (IOI silver medal), founded
        tech startup, VP of student council. 4 leadership roles. Research at NUS on
        quantum computing. Singaporean citizen (SG). Applied EA to Princeton.
        ADMITTED! First in my school's history!""",
        "author": "princeton_sg",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "Korean student admitted to UPenn Wharton",
        "body": """ACT: 36 (no SAT). GPA: 3.93 unweighted. 9 APs. Business major at Wharton.
        ECs 18 hrs/week: investment club founder, DECA nationals, tutoring business.
        3 leadership positions. Interned at Samsung (counts as research/work experience).
        From Seoul, South Korea (KR). Applied ED to Wharton. ADMITTED!
        So grateful for this opportunity.""",
        "author": "wharton_kr",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "American student - my college results thread",
        "body": """SAT: 1480, GPA: 3.82 UW. 6 APs. Major: Political Science (social science).
        ECs about 10 hours/week: varsity soccer, student government treasurer, community
        service club. 2 leadership roles. No research. US domestic student from
        California (US nationality). Applied RD everywhere.
        Results: Admitted to UCLA, waitlisted at UC Berkeley. Going Bruins!""",
        "author": "ucla_bound_us",
        "subreddit": "ApplyingToCollege",
    },
    {
        "title": "US domestic - rejected from dream school but happy with results",
        "body": """1510 SAT, 34 ACT, 3.90 GPA unweighted. 8 AP classes. STEM major
        (Mechanical Engineering). 15 hours/week ECs: robotics team captain, math league,
        Eagle Scout. 3 leadership roles. Summer research at state university.
        American, from Texas (US). Applied EA to Georgia Tech - ADMITTED!
        Rejected from MIT but that's ok.""",
        "author": "gatech_us",
        "subreddit": "chanceme",
    },
    {
        "title": "UK applicant - got into Oxford PPE!",
        "body": """No SAT/ACT (UK system). Predicted A*A*A* at A-Level. GPA equivalent: 4.0.
        Actually let me convert - SAT equivalent around 1550 for context. 5 AP-equivalent
        courses. Applying for PPE (social science/humanities). ECs: 20 hrs/week - debating
        society president, Model UN, Young Enterprise company director, volunteered at
        local council. 4 leadership roles. Extended essay research on Brexit economics.
        British citizen from London (GB). UK home student. Applied via UCAS.
        ADMITTED to Oxford! Interview went well.""",
        "author": "oxford_gb",
        "subreddit": "6thForm",
    },
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Synthetic pipeline dry-run")
    parser.add_argument("--dry-run", action="store_true", help="Skip DB writes")
    args = parser.parse_args()

    print("=" * 60)
    print("SYNTHETIC DRY-RUN: AdmitOS Training Pipeline")
    print("=" * 60)

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("\nERROR: ANTHROPIC_API_KEY not set. Add it to .env or export it.")
        sys.exit(1)

    if not args.dry_run:
        if not os.environ.get("SUPABASE_URL") or not os.environ.get("SUPABASE_SERVICE_ROLE_KEY"):
            print("\nERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for live insert.")
            print("Use --dry-run to skip DB writes.")
            sys.exit(1)

    extracted = 0
    rejected = 0
    errors = 0
    country_counts: dict[str, int] = {}

    for i, post in enumerate(SYNTHETIC_POSTS, 1):
        anecdote = Anecdote(
            source_url=f"https://reddit.com/r/{post['subreddit']}/comments/synthetic_{i:03d}",
            source_type="reddit",
            title=post["title"],
            body=post["body"],
            author=post["author"],
            created_utc=1712700000.0 + i * 100,
        )

        print(f"\n[{i}/{len(SYNTHETIC_POSTS)}] Processing: {post['title'][:60]}...")

        try:
            profile = extract_profile(anecdote)
            extracted += 1
            country = profile.nationality_country or "null"
            country_counts[country] = country_counts.get(country, 0) + 1

            print(f"  OK Extracted: {profile.nationality_country} | "
                  f"{profile.nationality_region} | "
                  f"SAT={profile.sat_score} GPA={profile.unweighted_gpa} | "
                  f"{profile.admission_outcome} | "
                  f"confidence={profile.extraction_confidence}")

            if not args.dry_run:
                try:
                    insert_profile(profile)
                    insert_extraction_audit(
                        source_uri=anecdote.source_url,
                        status="extracted",
                        reason=None,
                    )
                    print(f"  OK Inserted into Supabase")
                except Exception as db_err:
                    print(f"  FAIL DB insert failed: {db_err}")
                    errors += 1
            else:
                print(f"  [DRY RUN] Would insert into training_profile")

        except Exception as exc:
            rejected += 1
            reason = str(exc)[:200]
            print(f"  FAIL Rejected: {reason}")

            if not args.dry_run:
                try:
                    insert_extraction_audit(
                        source_uri=anecdote.source_url,
                        status="rejected",
                        reason=reason,
                    )
                except Exception:
                    pass

    # Summary
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"  Total posts:  {len(SYNTHETIC_POSTS)}")
    print(f"  Extracted:    {extracted}")
    print(f"  Rejected:     {rejected}")
    print(f"  DB errors:    {errors}")
    print(f"\n  nationality_country distribution:")
    for country, count in sorted(country_counts.items(), key=lambda x: -x[1]):
        print(f"    {country}: {count}")

    if not args.dry_run:
        print(f"\n  Records written to Supabase: {extracted - errors}")
    else:
        print(f"\n  [DRY RUN] No records written to DB")


if __name__ == "__main__":
    main()
