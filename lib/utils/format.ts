/**
 * Tiny formatting helpers.
 *
 * These are deliberately not Intl-locale-aware yet — we ship en-GB
 * everywhere for the MVP and will revisit i18n once Andy decides on
 * the second target market. The goal is "stop reinventing
 * `${count} ${count === 1 ? 'item' : 'items'}` in 14 places".
 */

/** Returns "4 items", "1 item", "0 items". */
export function pluralise(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  return `${count} ${word}`;
}

/**
 * Format a Date / ISO string as `Apr 9, 2026, 13:42`. Always en-GB,
 * always 24h. Returns the empty string for invalid input rather than
 * throwing — we never want a missing-data render to crash a page.
 */
export function formatDateTime(input: Date | string | null | undefined): string {
  if (input == null) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Format a byte count as "1.4 KB", "23 MB", etc. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(exp === 0 ? 0 : decimals)} ${units[exp]}`;
}

/**
 * Compute two-letter initials from a display name or email address.
 *
 * Examples:
 *   initialsFor("Vaibhav Lalwani")        // "VL"
 *   initialsFor("alice@example.com")      // "A"
 *   initialsFor("mary-ann.smith")         // "MS"
 *   initialsFor(null)                     // "?"
 *
 * Rules:
 *   - Strip everything after the first `@` (email handling).
 *   - Split on whitespace, `.`, `-`, `_`.
 *   - Take the first letter of the first and last non-empty token.
 *   - Upper-case the result; fall back to "?" if nothing usable.
 *
 * We return at most 2 characters so the avatar circle never
 * overflows. Single-name users get a single-letter avatar.
 */
export function initialsFor(input: string | null | undefined): string {
  if (input == null) return "?";
  const cleaned = input.split("@")[0] ?? "";
  const tokens = cleaned
    .split(/[\s._\-]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return "?";
  const first = tokens[0]![0] ?? "";
  const last = tokens.length > 1 ? tokens[tokens.length - 1]![0] ?? "" : "";
  const joined = `${first}${last}`.toUpperCase();
  return joined || "?";
}

/**
 * Turn an email address into a best-guess human-readable display name.
 *
 * Used by the admissions layout to seed the header avatar / menu before
 * a real profile row exists (e.g. magic-link signups where we never
 * captured a full name). The output is deliberately conservative:
 *
 *   displayNameFromEmail("vaibhav.lalwani@adrop.com")    // "Vaibhav Lalwani"
 *   displayNameFromEmail("mary-ann@adrop.com")           // "Mary-Ann"
 *   displayNameFromEmail("alice@x.com")                  // "Alice"
 *   displayNameFromEmail("VAIBHAV@x.com")                // "Vaibhav"
 *   displayNameFromEmail("user+tag@x.com")               // "User"
 *   displayNameFromEmail("")                             // ""
 *   displayNameFromEmail(null)                           // ""
 *
 * Rules:
 *   - Strip everything after the first `@` (so the domain is never
 *     exposed in the UI).
 *   - Strip everything from the first `+` (Gmail-style plus-addressing).
 *   - Split on `.`, `_`, whitespace (these get space-joined in output).
 *   - Preserve `-` inside a token (so "Mary-Ann" stays hyphenated).
 *   - Title-case each token (first letter upper, rest lower). For
 *     hyphenated tokens we title-case each sub-segment too, so
 *     "mary-ann" → "Mary-Ann" not "Mary-ann".
 *
 * This is NOT an identity claim — the value is only ever used as a
 * friendly display label in the signed-in header. Anywhere we need to
 * identify a user for auth or audit purposes, use `user.id` /
 * `user.email`, never this value.
 */
export function displayNameFromEmail(
  input: string | null | undefined
): string {
  if (input == null) return "";
  const beforeAt = input.split("@")[0] ?? "";
  const beforePlus = beforeAt.split("+")[0] ?? "";
  const trimmed = beforePlus.trim();
  if (trimmed.length === 0) return "";

  const titleCaseToken = (token: string): string => {
    if (token.length === 0) return "";
    // Preserve internal hyphens: "mary-ann" → "Mary-Ann"
    return token
      .split("-")
      .map((seg) =>
        seg.length === 0
          ? ""
          : seg[0]!.toUpperCase() + seg.slice(1).toLowerCase()
      )
      .join("-");
  };

  return trimmed
    .split(/[\s._]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(titleCaseToken)
    .join(" ");
}

/**
 * "5 minutes ago" / "in 3 hours" / "yesterday". Coarse buckets only —
 * we don't need second precision for an admissions UI.
 */
export function formatRelative(
  input: Date | string,
  now: Date = new Date()
): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const deltaMs = d.getTime() - now.getTime();
  const past = deltaMs < 0;
  const abs = Math.abs(deltaMs);

  const seconds = Math.round(abs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  let phrase: string;
  if (seconds < 45) phrase = "moments";
  else if (minutes < 60) phrase = pluralise(minutes, "minute");
  else if (hours < 24) phrase = pluralise(hours, "hour");
  else if (days < 7) phrase = pluralise(days, "day");
  else if (days < 30) phrase = pluralise(Math.round(days / 7), "week");
  else if (days < 365) phrase = pluralise(Math.round(days / 30), "month");
  else phrase = pluralise(Math.round(days / 365), "year");

  return past ? `${phrase} ago` : `in ${phrase}`;
}
