'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthBrandScope, useAuthBrand } from '@/components/auth/AuthBrand';
import { AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { authFlowHref } from '@/lib/auth-context';

function ForgotPasswordCard() {
  const searchParams = useSearchParams();
  const { flow } = useAuthBrand();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const backToSignIn = authFlowHref('/login', searchParams, email ? { login_hint: email } : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // The tenant only brands the email; auth-api falls back to the person's own tenant.
      await apiClient.post('/api/v1/auth/password-reset/request', { email, tenant_slug: flow.tenantSlug || undefined });
      setSent(true);
    } catch (err: any) {
      // Never reveal whether the email exists: only network and server failures are errors.
      const status = err.response?.status;
      if (!err.response || (status && status >= 500)) {
        setError('Something went wrong. Try again.');
      } else {
        setSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={<>If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset link is on its way.</>}>
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">The link works for 30 minutes. Check your spam folder if it does not arrive.</p>
          <Button asChild className="h-12 w-full rounded-full text-base font-semibold"><Link href={backToSignIn}>Back to sign in</Link></Button>
          <Button variant="outline" className="h-12 w-full rounded-full text-base font-semibold" onClick={() => { setSent(false); setEmail(''); }}>Use another email</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link"
      below={<Link href={backToSignIn} className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthNotice>{error}</AuthNotice>}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-card text-base" required autoFocus />
        </div>
        <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/40" />}>
      <AuthBrandScope>
        <ForgotPasswordCard />
      </AuthBrandScope>
    </Suspense>
  );
}
