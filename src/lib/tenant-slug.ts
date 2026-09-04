/**
 * Shared tenant-slug generation, used by both the public signup form and the
 * platform admin's create-tenant dialog so the two never drift apart.
 */

const STOPWORDS = new Set(['the', 'of', 'and', 'for', 'a', 'an', 'ltd', 'limited', 'inc', 'llc']);

// Above this length a plain slugified name reads as an unwieldy URL/login
// identifier (e.g. "migori-county-community-library") — an initials-based
// short form ("mccl") reads far better and is what a real org would actually
// choose for itself.
const LONG_SLUG_THRESHOLD = 24;

/** Sanitizes a slug field's raw input as the user types (not name-derived). */
export function sanitizeSlugInput(text: string): string {
  return basicSlugify(text);
}

function basicSlugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 64);
}

/**
 * Builds an initials-based short slug from an organisation name, e.g.
 * "Migori County Community Library" -> "mccl". Skips common stopwords so
 * "Bank of Africa" -> "ba", not "boa"'s awkward cousin "boaf". Falls back to
 * the plain slugified name (truncated) when fewer than 2 significant words
 * exist -- a 1-letter slug is useless, not "shorter."
 */
function initialsSlug(name: string): string | null {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
  if (words.length < 2) return null;
  const initials = words.map((w) => w[0]).join('');
  return initials.length >= 2 ? initials : null;
}

/**
 * Generates the slug a signup/create-tenant form should suggest by default:
 * the plain slugified name normally, or an initials-based short form once
 * the plain version gets long enough to be unwieldy as a URL/login handle.
 * Always overridable by the user/admin afterward -- this only picks the
 * starting suggestion.
 */
export function suggestTenantSlug(name: string): string {
  const plain = basicSlugify(name);
  if (plain.length <= LONG_SLUG_THRESHOLD) return plain;
  return initialsSlug(name) || plain.substring(0, LONG_SLUG_THRESHOLD);
}
