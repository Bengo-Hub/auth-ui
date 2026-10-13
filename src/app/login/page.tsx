'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { AuthBrandScope, useAuthBrand } from '@/components/auth/AuthBrand';
import { AuthDivider, AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtonGroup } from '@/components/auth/OAuthButtons';
import { authFlowHref } from '@/lib/auth-context';

function OAuthErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('oauth_error');
  if (!error) return null;
  return (
    <div className="mb-5">
      <AuthNotice>{error === 'access_denied' ? 'Sign-in was cancelled.' : `Sign-in failed: ${decodeURIComponent(error)}`}</AuthNotice>
    </div>
  );
}

/** Customers, riders and students create their own account; everyone else creates an organisation. */
function SignUpPrompt() {
  const searchParams = useSearchParams();
  const brand = useAuthBrand();
  const { flow } = brand;
  if (flow.isCustomerApp || (!brand.isPlatform && flow.tenantSlug)) {
    return (
      <>
        New to {brand.name}?{' '}
        <Link href={authFlowHref('/signup', searchParams)} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </>
    );
  }
  return (
    <>
      No account yet?{' '}
      <Link href={authFlowHref('/signup', searchParams)} className="font-medium text-primary hover:underline">
        Create one
      </Link>
    </>
  );
}

function LoginCard() {
  return (
    <AuthShell title="Sign in" below={<SignUpPrompt />}>
      <OAuthErrorBanner />
      <OAuthButtonGroup after={<AuthDivider />} />
      <LoginForm />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/40" />}>
      <AuthBrandScope>
        <LoginCard />
      </AuthBrandScope>
    </Suspense>
  );
}
