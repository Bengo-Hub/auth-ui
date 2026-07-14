/**
 * Rewrites every occurrence of a tenant slug inside a URL so an SSO flow that
 * started against the wrong organisation can be re-targeted at the right one.
 *
 * Handles the three places a slug can appear:
 *  1. the `tenant` query parameter (`?tenant=old-slug`)
 *  2. nested URL parameters (`redirect_uri`, `return_to`,
 *     `post_logout_redirect_uri`) — rewritten recursively, since e.g. an SSO
 *     authorize URL carries `redirect_uri=https://pos.../old-slug/auth/callback`
 *  3. path segments equal to the old slug (`/old-slug/auth/callback`)
 *
 * When `oldSlug` is not supplied it is taken from the URL's own `tenant`
 * parameter. Returns the input unchanged when it is not an absolute URL.
 */
export function rewriteTenantInUrl(rawUrl: string, newSlug: string, oldSlug?: string): string {
  if (!rawUrl || !newSlug) return rawUrl;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const prevSlug = oldSlug || url.searchParams.get('tenant') || undefined;

  // 1. tenant query param
  if (url.searchParams.has('tenant')) {
    url.searchParams.set('tenant', newSlug);
  }

  // 2. nested URL params (rewritten with the same old→new slug mapping)
  for (const key of ['redirect_uri', 'return_to', 'post_logout_redirect_uri']) {
    const val = url.searchParams.get(key);
    if (val && /^https?:\/\//i.test(val)) {
      url.searchParams.set(key, rewriteTenantInUrl(val, newSlug, prevSlug));
    }
  }

  // 3. path segments equal to the old slug
  if (prevSlug) {
    const segments = url.pathname.split('/');
    let changed = false;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === prevSlug) {
        segments[i] = newSlug;
        changed = true;
      }
    }
    if (changed) {
      url.pathname = segments.join('/');
    }
  }

  return url.toString();
}
