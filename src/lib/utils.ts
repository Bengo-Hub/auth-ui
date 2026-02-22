import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a return URL is safe to redirect to (prevents open redirect attacks).
 * Only allows relative paths on the same origin. Rejects absolute URLs,
 * protocol-relative URLs, and javascript: URIs.
 */
export function isValidReturnUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Allow relative paths
  if (url.startsWith('/')) {
    // Reject protocol-relative URLs (//evil.com)
    if (url.startsWith('//')) return false;

    // Reject backslash tricks (/\evil.com gets normalized to //evil.com in some browsers)
    if (url.startsWith('/\\')) return false;

    // Reject any URL with a colon before the first slash (e.g., javascript:, data:, etc.)
    const colonIndex = url.indexOf(':');
    const slashIndex = url.indexOf('/', 1);
    if (colonIndex !== -1 && (slashIndex === -1 || colonIndex < slashIndex)) return false;

    return true;
  }

  // Allow absolute URLs that start with our API URL (for OIDC flows)
  if (apiUrl && url.startsWith(apiUrl)) {
    return true;
  }

  return false;
}

/**
 * Returns a sanitized return URL, falling back to the default if invalid.
 */
export function getSafeReturnUrl(url: string | null | undefined, defaultUrl = '/'): string {
  return isValidReturnUrl(url) ? url! : defaultUrl;
}
