'use client';

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isError, refetch } = useAuth(true);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      const returnTo = searchParams.get('return_to') || '/dashboard';
      router.replace(returnTo);
      return;
    }

    if (isError) {
      refetch();
    }
  }, [user, isLoading, isError, router, searchParams, refetch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Completing sign-in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
