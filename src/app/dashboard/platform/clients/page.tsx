'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Relocated to /dashboard/developer/oauth-clients (Phase 11 — Developer
// Portal consolidation). Kept as a redirect for any existing bookmarks/links.
export default function LegacyOAuthClientsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/developer/oauth-clients'); }, [router]);
  return null;
}
