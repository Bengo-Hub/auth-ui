'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

const VERA_WIDGET_URL = 'https://marketflow.codevertexitsolutions.com/widget/chat.js';
const VERA_API_URL = 'https://marketflowai.codevertexitsolutions.com';
const PLATFORM_TENANT_SLUG = 'codevertex';

// VeraWidget embeds the Vera AI chat widget in the dashboard.
// Platform owners get platform-mode (routes to platform helpdesk).
// Tenant members get tenant-mode (routes to their tenant's helpdesk).
export function VeraWidget() {
  const { user, isPlatformOwner, isAuthenticated, isLoading } = useAuth();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Only load after auth is resolved and user is authenticated
    if (isLoading || !isAuthenticated || !user) return;
    // Avoid double-loading
    if ((window as unknown as Record<string, unknown>).__veraLoaded) return;

    const mode = isPlatformOwner ? 'platform' : 'tenant';
    const tenantSlug = isPlatformOwner
      ? PLATFORM_TENANT_SLUG
      : (user.tenant?.slug ?? user.primary_tenant ?? PLATFORM_TENANT_SLUG);

    const script = document.createElement('script');
    script.src = VERA_WIDGET_URL;
    script.async = true;
    script.setAttribute('data-tenant', tenantSlug);
    script.setAttribute('data-mode', mode);
    script.setAttribute('data-api-url', VERA_API_URL);
    script.setAttribute('data-widget-title', 'Vera');

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Remove on unmount — e.g. if user logs out without page reload
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
      delete (window as unknown as Record<string, unknown>).__veraLoaded;
    };
  }, [isAuthenticated, isLoading, isPlatformOwner, user]);

  return null;
}
