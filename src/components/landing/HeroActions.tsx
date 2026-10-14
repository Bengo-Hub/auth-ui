'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function HeroActions() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-12 w-72 animate-pulse rounded-full bg-muted" aria-hidden />;
  if (user) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold"><Link href="/dashboard">Go to my account</Link></Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base font-semibold"><a href="#apps">See the apps</a></Button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold"><Link href="/login">Sign in</Link></Button>
      <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base font-semibold"><Link href="/signup">Create an organisation</Link></Button>
    </div>
  );
}
