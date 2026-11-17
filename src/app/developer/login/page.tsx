'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { AuthBrandScope } from '@/components/auth/AuthBrand';
import { AuthShell } from '@/components/auth/AuthShell';
import { DeveloperPanel } from '@/components/auth/DeveloperPanel';
import { LoginForm } from '@/components/auth/LoginForm';
import { DEVELOPER_APPLY_PATH, DEVELOPER_HOME_PATH, DEVELOPER_LOGIN_PATH } from '@/lib/developer-access';

/**
 * Developer sign-in. It reuses the account sign-in form (password, passkey and the authenticator
 * step that developer accounts always need) without the business sign-up link or social sign-in,
 * and sends people to the developer console afterwards.
 */
function DeveloperLoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('return_to');

  // The form reads return_to from the URL; default it to the developer console.
  useEffect(() => {
    if (returnTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('return_to', DEVELOPER_HOME_PATH);
    router.replace(`${DEVELOPER_LOGIN_PATH}?${params.toString()}`);
  }, [returnTo, router, searchParams]);

  return (
    <AuthShell
      title="Developer sign in"
      subtitle="Manage your apps, keys and sandbox for the Codevertex APIs."
      aside={<DeveloperPanel />}
      below={
        <>
          No developer access yet?{' '}
          <Link href={DEVELOPER_APPLY_PATH} className="font-medium text-primary hover:underline">
            Request access
          </Link>
        </>
      }
    >
      {returnTo ? <LoginForm /> : <div className="h-40" aria-busy="true" />}
    </AuthShell>
  );
}

export default function DeveloperLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100dvh-4rem)] bg-paper" />}>
      <AuthBrandScope>
        <DeveloperLoginCard />
      </AuthBrandScope>
    </Suspense>
  );
}
