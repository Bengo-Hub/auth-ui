'use client';

import { createContext, useContext } from 'react';

/** Which audience the public header and footer speak to. */
export type SiteVariant = 'business' | 'developer';

export interface SiteChrome {
  /** True when the public site header (with the Codevertex logo and theme toggle) is on the page. */
  present: boolean;
  variant: SiteVariant;
}

const SiteChromeContext = createContext<SiteChrome>({ present: false, variant: 'business' });

export const SiteChromeProvider = SiteChromeContext.Provider;

export function useSiteChrome(): SiteChrome {
  return useContext(SiteChromeContext);
}

/** The developer sign-in and access request pages get the developer header and footer. */
export function siteVariantFor(pathname: string | null | undefined): SiteVariant {
  return pathname === '/developer' || pathname?.startsWith('/developer/') ? 'developer' : 'business';
}
