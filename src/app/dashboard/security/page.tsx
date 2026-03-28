'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Security settings have been consolidated into the Profile page.
// This page redirects to /dashboard/profile?tab=security for backward compatibility.
export default function SecurityPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/profile?tab=security');
  }, [router]);
  return null;
}
