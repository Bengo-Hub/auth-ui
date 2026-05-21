'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

const VERA_WIDGET_URL = 'https://marketflow.codevertexitsolutions.com/widget/chat.js';
const VERA_API_URL = 'https://marketflowai.codevertexitsolutions.com';
const PLATFORM_TENANT_SLUG = 'codevertex';
// OTP endpoint used by Vera before creating a support ticket
const OTP_SEND_ENDPOINT = '/api/v1/auth/otp/send';
const OTP_VERIFY_ENDPOINT = '/api/v1/auth/otp/verify';

// VeraWidget embeds the Vera AI chat widget in the dashboard.
// Platform owners get platform-mode (routes to platform helpdesk).
// Tenant members get tenant-mode (routes to their tenant's helpdesk).
// OTP endpoints are passed so the widget can verify the user's email
// before creating a helpdesk ticket.
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
      : (user.tenant?.slug ?? (user as any).primary_tenant ?? PLATFORM_TENANT_SLUG);

    // Derive display name and role for the widget context
    const userProfile = (user as any)?.profile as Record<string, any> ?? {};
    const displayName = userProfile.name ?? user.name ?? '';
    const userRole = user.roles?.[0] ?? 'member';

    const script = document.createElement('script');
    script.src = VERA_WIDGET_URL;
    script.async = true;
    script.setAttribute('data-tenant', tenantSlug);
    script.setAttribute('data-mode', mode);
    script.setAttribute('data-api-url', VERA_API_URL);
    script.setAttribute('data-widget-title', 'Vera');
    // User context — lets the widget pre-fill ticket details
    script.setAttribute('data-user-id', user.id);
    script.setAttribute('data-user-email', user.email);
    script.setAttribute('data-user-name', displayName);
    script.setAttribute('data-user-role', userRole);
    // OTP verification endpoints — widget must call send, collect code from user,
    // then verify before forwarding messages to the helpdesk.
    script.setAttribute('data-otp-send-endpoint', OTP_SEND_ENDPOINT);
    script.setAttribute('data-otp-verify-endpoint', OTP_VERIFY_ENDPOINT);

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
