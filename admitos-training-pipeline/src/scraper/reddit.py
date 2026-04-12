"""
Reddit scraper using PRAW.

Pulls posts from r/ApplyingToCollege and similar subreddits. The
scraper is gated behind REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET env
vars — if they're missing, `scrape()` raises early with a clear
message rather than failing deep inside PRAW.
"""

from __future__ import annotations

import os

import praw

from .base import Anecdote, BaseScraper


class RedditScraper(BaseScraper):
    """Scrape admissions anecdotes from Reddit via PRAW."""

    def __init__(self, requests_per_minute: int = 30) -> None:
        super().__init__(requests_per_minute=requests_per_minute)

        client_id = os.environ.get("REDDIT_CLIENT_ID")
        client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
        user_agent = os.environ.get("REDDIT_USER_AGENT", "admitos-training-pipeline:v0.1")

        if not client_id or not client_secret:
            raise EnvironmentError(
                "REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set. "
                "Create an app at https://www.reddit.com/prefs/apps/"
            )

        self._reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )

    def _fetch_posts(self, *, subreddit: str, limit: int) -> list[Anecdote]:
        sub = self._reddit.subreddit(subreddit)
        posts: list[Anecdote] = []
        for submission in sub.hot(limit=limit):
            if submission.selftext and len(submission.selftext) > 200:
                posts.append(
                    Anecdote(
                        source_url=f"https://reddit.com{submission.permalink}",
                        source_type="reddit",
                        title=submission.title,
                        body=submission.selftext,
                        author=str(submission.author) if submission.author else "[deleted]",
                        created_utc=submission.created_utc,
                    )
                )
        return posts
