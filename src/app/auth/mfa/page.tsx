'use client';

/**
 * Second step of a social sign-in for an account with an authenticator app. The provider step has
 * already proved who the person is, but no session exists yet: the API hands us a short-lived signed
 * challenge, and the session cookie is set only once the 6-digit code checks out.
 */

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthBrandScope } from '@/components/auth/AuthBrand';
import { AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl } from '@/lib/utils';

function MfaCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challenge = searchParams.get('challenge') ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/[\s-]/g, '');
    if (digits.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/api/v1/auth/oauth/mfa/verify', { challenge, totp_code: digits });
      const returnTo = getSafeReturnUrl(data?.return_to || searchParams.get('return_to'), '/dashboard');
      // The cookie is set now; the callback page loads the profile and follows return_to.
      router.replace(`/auth/callback?return_to=${encodeURIComponent(returnTo)}`);
    } catch (err) {
      const res = (err as { response?: { status?: number; data?: { code?: string } } }).response;
      if (res?.data?.code === 'invalid_totp') setError('That code is not right. Try again.');
      else if (res?.status === 429) setError('Too many wrong codes. Start the sign-in again.');
      else setError('This sign-in has expired. Start again.');
      setBusy(false);
    }
  };

  if (!challenge) {
    return (
      <AuthShell title="Sign-in expired" subtitle="Start the sign-in again to continue.">
        <Button asChild className="h-12 w-full rounded-full text-base font-semibold">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Confirm it is you" subtitle="Enter the 6-digit code from your authenticator app to finish signing in.">
      <form onSubmit={submit} className="space-y-5">
        {error && <AuthNotice>{error}</AuthNotice>}
        <div className="space-y-1.5">
          <Label htmlFor="totp_code">Verification code</Label>
          <Input
            id="totp_code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000 000"
            maxLength={7}
            value={code}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              setCode(raw.length > 3 ? raw.slice(0, 3) + ' ' + raw.slice(3, 6) : raw);
            }}
            className="h-14 rounded-xl bg-card text-center font-mono text-2xl tracking-[0.3em]"
            autoFocus
          />
        </div>
        <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify and sign in'}
        </Button>
        <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          Use a different account
        </Link>
      </form>
    </AuthShell>
  );
}

export default function SocialMfaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <AuthBrandScope>
        <MfaCard />
      </AuthBrandScope>
    </Suspense>
  );
}
