/**
 * Word counting utility.
 *
 * Used by:
 *   - the CEF wizard step 6 (personal statement)
 *   - the essay upload form
 *   - the eval framework's per-suite stats
 *
 * "Words" are defined as runs of non-whitespace characters. We
 * deliberately count "isn't" as one word, not two — matches what
 * Microsoft Word does. Empty strings count as zero. Strings with
 * only whitespace count as zero.
 *
 * The implementation uses `.match()` instead of `.split()` because
 * `split` returns a `[""]` array on empty input which trips up
 * the length check.
 */

const WORD_RE = /\S+/g;

export function wordCount(text: string): number {
  if (!text) return 0;
  const matches = text.match(WORD_RE);
  return matches ? matches.length : 0;
}

/**
 * Approximate character count, ignoring trailing whitespace.
 * Useful for surfaces that have a hard byte limit (e.g. SMS, Slack
 * preview) where word count would be misleading.
 */
export function trimmedCharCount(text: string): number {
  return text.trimEnd().length;
}
