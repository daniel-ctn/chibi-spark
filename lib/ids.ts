import { createId } from "@paralleldrive/cuid2";

/**
 * Primary key generator. Cuid2 is URL-safe, collision-resistant, and
 * sortable-enough for our needs without exposing sequential IDs.
 */
export const newId = (): string => createId();

/**
 * Convert a free-text title into a URL-safe slug.
 *
 *  - lowercases
 *  - strips diacritics (é -> e, ñ -> n, etc.)
 *  - collapses non-alphanumerics into single hyphens
 *  - trims leading/trailing hyphens
 *  - caps length to keep URLs short
 *
 * Falls back to "chibi" if the input has no usable characters.
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "chibi"
  );
}

/**
 * Build a unique slug from a title. The suffix uses a short slice of
 * a cuid2 to avoid collisions while keeping the URL readable.
 */
export function newSlug(title: string, suffixLength = 6): string {
  const base = slugify(title);
  const suffix = createId()
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, suffixLength);
  return `${base}-${suffix}`;
}

/**
 * Date-based batch ID like `2026-06-01-a8f3k2` — useful for log grouping
 * and for human-friendly `generationDate` lookups.
 */
export function newBatchId(date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10);
  const suffix = createId()
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, 6);
  return `${ymd}-${suffix}`;
}
