'use client';

/**
 * Sign-up for a tenant's customers: someone ordering from Urban Loft, a Digitika learner, a
 * rider applying to deliver. One short form, an email code, done. auth-api adds the person to
 * the tenant with the app's own role (customer, student, driver) because the request carries the
 * app's client_id. Organisations are created by the separate wizard (SignupForm), never here.
 */

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useAuthBrand } from '@/components/auth/AuthBrand';
import { AuthNotice } from '@/components/auth/AuthShell';
import { StepVerifyEmail } from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { authFlowHref } from '@/lib/auth-context';
import { getSafeReturnUrl, isValidReturnUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const MIN_PASSWORD = 8;

export function CustomerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = useAuthBrand();
  const { flow } = brand;
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('login_hint') ?? '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [busy, setBusy] = useState(false);

  const signInHref = authFlowHref('/login', searchParams, email ? { login_hint: email } : undefined);

  const sendCode = async (): Promise<boolean> => {
    setError(null);
    setEmailTaken(false);
    setBusy(true);
    try {
      await apiClient.post('/api/v1/auth/email/send-code', { email, tenant_slug: flow.tenantSlug || undefined });
      return true;
    } catch (err: any) {
      if (err.response?.data?.code === 'email_exists') {
        setEmailTaken(true);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Could not send the code. Try again.');
      }
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Enter your name.');
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
    if (!termsAccepted) return setError('Accept the terms to create your account.');
    if (await sendCode()) setStep('verify');
  };

  const continueFlow = () => {
    const returnTo = searchParams.get('return_to');
    if (returnTo && returnTo.startsWith('http') && isValidReturnUrl(returnTo)) {
      window.location.href = returnTo;
      return;
    }
    router.push(getSafeReturnUrl(returnTo, '/dashboard'));
  };

  // After the code is confirmed: create the account, then sign in with the same details so the
  // person lands back in the app instead of on a second login form.
  const createAccount = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiClient.post('/api/v1/auth/register', {
        email,
        password,
        tenant_slug: flow.tenantSlug,
        org_action: 'join_existing',
        client_id: flow.clientId || undefined,
        terms_accepted: true,
        profile: { name: name.trim(), ...(phone.trim() ? { phone: phone.trim() } : {}) },
      });
    } catch (err: any) {
      setBusy(false);
      setStep('details');
      if (err.response?.data?.code === 'email_exists') {
        setEmailTaken(true);
        return;
      }
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not create your account.');
      return;
    }
    try {
      const { data } = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
        tenant_slug: flow.tenantSlug,
        client_id: flow.clientId || undefined,
      });
      if (data?.user) {
        setUser({ ...data.user, roles: data.user.roles ?? data.roles ?? [], permissions: data.user.permissions ?? data.permissions ?? [], tenants: data.user.tenants ?? [] });
      }
      continueFlow();
    } catch {
      // Account exists; let them sign in normally.
      router.push(authFlowHref('/login', searchParams, { login_hint: email, message: 'Your account is ready. Sign in to continue.' }));
    }
  };

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        {error && <AuthNotice>{error}</AuthNotice>}
        <StepVerifyEmail
          email={email}
          codeSending={busy}
          verifyEmailCode={async (code) => { await apiClient.post('/api/v1/auth/email/verify-code', { email, code }); }}
          resend={sendCode}
          onVerified={createAccount}
        />
        {busy && <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Creating your account</p>}
        <button type="button" onClick={() => setStep('details')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onDetails} className="space-y-4" noValidate>
      {emailTaken && (
        <AuthNotice tone="info">
          You already have an account with this email.{' '}
          <Link href={signInHref} className="font-medium text-primary hover:underline">Sign in</Link>
          {' '}and we will add you to {brand.name}.
        </AuthNotice>
      )}
      {error && <AuthNotice>{error}</AuthNotice>}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailTaken(false); }} className="h-11" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+254 712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
        <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
        <span>
          I agree to the{' '}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Terms</a>{' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Privacy Policy</a>.
        </span>
      </label>

      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
      </Button>
    </form>
  );
}
