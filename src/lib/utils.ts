import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** SSO base URL for return_to validation (same as api-client). Must be set so service-originated login return_to (sso authorize URL) is allowed. */
const SSO_ISSUER_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexitsolutions.com').replace(/\/$/, '');

/** Allowed origins for return_to (absolute URLs). Enables redirect to service landing after login from auth-ui. */
const ALLOWED_REDIRECT_ORIGINS = [
  'https://sso.codevertexitsolutions.com',
  'https://accounts.codevertexitsolutions.com',
  'https://ordersapp.codevertexitsolutions.com',
  'https://books.codevertexitsolutions.com',
  'https://pos.codevertexitsolutions.com',
  'https://inventory.codevertexitsolutions.com',
  'https://logistics.codevertexitsolutions.com',
  'https://notifications.codevertexitsolutions.com',
  'https://pricing.codevertexitsolutions.com',
  'https://riderapp.codevertexitsolutions.com',
  'https://theurbanloftcafe.com',
  'http://localhost:3000',
  'http://localhost:3010',
  'http://localhost:3011',
  'http://localhost:3012',
  'http://localhost:3013',
];

/**
 * Validates that a return URL is safe to redirect to (prevents open redirect attacks).
 * Allows relative paths and absolute URLs that start with SSO issuer or an allowed app origin.
 * Rejects protocol-relative URLs and javascript: URIs.
 */
export function isValidReturnUrl(url: string | null | undefined): boolean {
  if (!url) return false;

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

  // Allow absolute URLs that start with our SSO issuer (for OIDC / service-originated login return_to)
  if (SSO_ISSUER_BASE && (url === SSO_ISSUER_BASE || url.startsWith(SSO_ISSUER_BASE + '/'))) {
    return true;
  }

  // Fallback: sso authorize URL (avoids redirect loop when env or encoding differs on some browsers)
  if (url.includes('/api/v1/authorize') && url.includes('codevertexitsolutions.com')) {
    return true;
  }

  // Allow redirect to known app origins (e.g. after login from landing, go to ordersapp / books)
  try {
    const parsed = new URL(url);
    if (ALLOWED_REDIRECT_ORIGINS.includes(parsed.origin)) {
      return true;
    }
  } catch {
    // invalid URL
  }

  return false;
}

/**
 * Returns a sanitized return URL, falling back to the default if invalid.
 */
export function getSafeReturnUrl(url: string | null | undefined, defaultUrl = '/'): string {
  return isValidReturnUrl(url) ? url! : defaultUrl;
}
