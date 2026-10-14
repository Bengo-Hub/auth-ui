'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthBrandScope } from '@/components/auth/AuthBrand';
import { AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { authFlowHref } from '@/lib/auth-context';

const MIN_PASSWORD = 8;

function PasswordInput({ id, label, value, onChange, autoFocus }: { id: string; label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? 'text' : 'password'} autoComplete="new-password" value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-xl bg-card pr-12 text-base" required autoFocus={autoFocus} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground" aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ResetPasswordCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const signIn = authFlowHref('/login', searchParams, email ? { login_hint: email } : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirmPassword) return setError('The two passwords do not match.');
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/api/v1/auth/password-reset/confirm', { token, new_password: password });
      setDone(true);
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'invalid_token') setError('This reset link has expired or was already used. Ask for a new one.');
      else if (code === 'weak_password') setError('That password is too weak. Mix letters, numbers and a symbol.');
      else setError(err.response?.data?.error || 'Could not reset your password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Link not valid" subtitle="This reset link is missing its code.">
        <Button asChild className="h-12 w-full rounded-full text-base font-semibold"><Link href={authFlowHref('/forgot-password', searchParams)}>Ask for a new link</Link></Button>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Sign in with your new password.">
        <Button asChild className="h-12 w-full rounded-full text-base font-semibold"><Link href={signIn}>Sign in</Link></Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle={email ? <>for <span className="font-medium text-foreground">{email}</span></> : 'Set the password you will sign in with'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthNotice>{error}</AuthNotice>}
        <PasswordInput id="password" label="New password" value={password} onChange={setPassword} autoFocus />
        <PasswordInput id="confirm" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} />
        <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
        <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save password'}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/40" />}>
      <AuthBrandScope>
        <ResetPasswordCard />
      </AuthBrandScope>
    </Suspense>
  );
}
