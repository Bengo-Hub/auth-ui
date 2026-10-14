'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { AuthBrandScope, useAuthBrand } from '@/components/auth/AuthBrand';
import { AuthDivider, AuthShell } from '@/components/auth/AuthShell';
import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';
import { OAuthButtonGroup } from '@/components/auth/OAuthButtons';
import { SignupForm } from '@/components/auth/SignupForm';
import { authFlowHref } from '@/lib/auth-context';

function SignInPrompt() {
  const searchParams = useSearchParams();
  return (
    <>
      Already have an account?{' '}
      <Link href={authFlowHref('/login', searchParams)} className="font-medium text-primary hover:underline">
        Sign in
      </Link>
    </>
  );
}

function SignupCard() {
  const brand = useAuthBrand();
  const searchParams = useSearchParams();
  const { flow } = brand;
  // A tenant's own app (ordering, rider, Digitika) signs people up as that tenant's customers,
  // riders or students. Only the platform itself, or a staff app, offers "create an organisation".
  const customerMode = flow.isCustomerApp && !!flow.tenantSlug;
  // An OAuth sign-up hand-off (new Google user) already has a verified email: finish it in the
  // wizard, which knows how to consume the oauth_token.
  const oauthHandOff = !!searchParams.get('oauth_token');

  if (customerMode && !oauthHandOff) {
    const person = flow.customerApp?.person ?? 'customer';
    return (
      <AuthShell
        title="Create your account"
        subtitle={<>as a {person} of <span className="font-medium text-foreground">{brand.isPlatform && brand.appName ? brand.appName : brand.name}</span></>}
        below={<SignInPrompt />}
      >
        <OAuthButtonGroup label="Sign up with" after={<AuthDivider />} />
        <CustomerSignupForm />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title={flow.loginTenant && !brand.isPlatform ? `Join ${brand.name}` : 'Create your organisation'}
      subtitle={flow.loginTenant && !brand.isPlatform ? 'Create an account in this organisation' : 'One account for every Codevertex app your team uses'}
      below={<SignInPrompt />}
    >
      {!oauthHandOff && <OAuthButtonGroup label="Sign up with" after={<AuthDivider />} />}
      <SignupForm />
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/40" />}>
      <AuthBrandScope>
        <SignupCard />
      </AuthBrandScope>
    </Suspense>
  );
}
