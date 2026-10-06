'use client';

import { openCookieSettings } from '@bengo-hub/shared-ui-lib/legal';

/** Reopens the shared cookie notice so the visitor can change their choice. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="not-prose inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      Change cookie settings
    </button>
  );
}
