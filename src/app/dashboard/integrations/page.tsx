'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Integrations moved under the consolidated Developer folder/layout.
// This page redirects for backward compatibility (old bookmarks/docs).
export default function IntegrationsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/developer/integrations');
  }, [router]);
  return null;
}
