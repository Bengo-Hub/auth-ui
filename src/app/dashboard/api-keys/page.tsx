'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// API Keys management has been consolidated into the Developer page.
// This page redirects for backward compatibility.
export default function APIKeysPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/developer');
  }, [router]);
  return null;
}
