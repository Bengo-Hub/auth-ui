'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Relocated to /dashboard/developer/apps, unified with the tenant-scoped
// apps view (Phase 11 — Developer Portal consolidation). Kept as a redirect
// for any existing bookmarks/links.
export default function LegacyPlatformAppsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/developer/apps'); }, [router]);
  return null;
}
