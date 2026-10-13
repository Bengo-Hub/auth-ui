'use client';

import { AuthNotice } from '@/components/auth/AuthShell';
import { useAuthBrand } from '@/components/auth/AuthBrand';
import { PasskeySetupNudge, wasDismissedRecently } from '@/components/auth/PasskeySetupNudge';
import { WrongOrganisationDialog, type TenantSuggestion } from '@/components/auth/WrongOrganisationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBiometric } from '@/hooks/use-biometric';
import apiClient from '@/lib/api-client';
import { changePassword } from '@/lib/api/profile';
import { authFlowHref } from '@/lib/auth-context';
import { rewriteTenantInUrl } from '@/lib/tenant-url';
import { getSafeReturnUrl, isValidReturnUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

type LoginUser = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  terms_accepted?: boolean;
  profile?: Record<string, unknown>;
  tenants?: Array<{ id: string; name: string; slug: string; roles: string[] }>;
};

const MIN_PASSWORD = 8;

function PasswordField({
  id, label, value, onChange, autoComplete, autoFocus, trailing,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  autoComplete: string; autoFocus?: boolean; trailing?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {trailing}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="h-11 pr-11"
          required
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const { flow } = useAuthBrand();

  // OIDC / redirect parameters
  const returnTo = searchParams.get('return_to');
  const redirectUri = searchParams.get('redirect_uri');
  const stateParam = searchParams.get('state');
  const scope = searchParams.get('scope');
  // client_id may only live inside return_to (the authorize URL); the server needs it to
  // know a customer-facing app is asking, so it can make the person that tenant's customer.
  const clientId = flow.clientId;
  // Empty when no tenant is in the flow: auth-api then resolves the user's primary tenant.
  const tenantSlug = flow.tenantSlug;
  const notice = searchParams.get('message');

  const [email, setEmail] = useState(searchParams.get('login_hint') ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const buildAuthorizeUrl = (tenant: string, rewrite: (u: string) => string) => {
    const ssoBase = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexafrica.com';
    const authorizeUrl = new URL('/api/v1/authorize', ssoBase.replace(/\/$/, ''));
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', rewrite(redirectUri!));
    if (stateParam) authorizeUrl.searchParams.set('state', stateParam);
    if (scope) authorizeUrl.searchParams.set('scope', scope);
    if (tenant) authorizeUrl.searchParams.set('tenant', tenant);
    return authorizeUrl.toString();
  };

  const { authenticate: biometricAuth, isSupported: biometricSupported, hasRegisteredCredential, isLoading: biometricLoading } = useBiometric({
    onAuthSuccess: async (_tokens, raw) => {
      // The WebAuthn finish response carries user/roles/permissions like password login.
      const user = (raw?.user ?? {}) as Record<string, unknown>;
      if (user?.id) {
        setUser({
          ...user,
          roles: (raw?.roles as string[]) ?? [],
          permissions: (raw?.permissions as string[]) ?? [],
          tenants: (user.tenants as unknown[]) ?? [],
        } as Parameters<typeof setUser>[0]);
      }
      if (returnTo && returnTo.startsWith('http') && isValidReturnUrl(returnTo)) {
        window.location.href = returnTo;
      } else if (clientId && redirectUri) {
        window.location.href = buildAuthorizeUrl(tenantSlug, (u) => u);
      } else {
        router.push(getSafeReturnUrl(returnTo, '/dashboard'));
      }
    },
    onError: (err) => setBiometricError(err),
  });

  // MFA challenge
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const totpInputRef = useRef<HTMLInputElement>(null);

  // Wrong organisation: keep the typed credentials and resubmit against the picked org.
  const [mismatch, setMismatch] = useState<{ requestedTenant: string; userTenants: TenantSuggestion[] } | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null);

  // Temporary password (admin-added staff, Digitika students and parents): set a new one
  // before leaving, otherwise a service redirect would skip the dashboard's own gate.
  const [newPasswordStep, setNewPasswordStep] = useState<(() => void) | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [newPasswordSaving, setNewPasswordSaving] = useState(false);

  // One-time terms acceptance for existing users
  const [termsRequired, setTermsRequired] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<(() => void) | null>(null);

  // Passkey nudge after password login when no passkey is registered
  const [passkeyNudgeOpen, setPasskeyNudgeOpen] = useState(false);
  const [passkeyNudgeToken, setPasskeyNudgeToken] = useState('');

  const switchToTenant = (slug: string) => {
    setSelectedTenant(slug);
    setSwitchingSlug(slug);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tenant', slug);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Address-bar cosmetics only.
    }
    doLogin(undefined, slug).finally(() => setSwitchingSlug(null));
  };

  // Terms, then the passkey nudge, then the redirect.
  const finishLogin = async (user: LoginUser | undefined, accessToken: string, executeRedirect: () => void) => {
    if (user && user.terms_accepted === false) {
      setPendingRedirect(() => executeRedirect);
      setTermsRequired(true);
      return;
    }
    if (biometricSupported && accessToken && !wasDismissedRecently()) {
      try {
        const credsRes = await apiClient.get('/api/v1/auth/webauthn/credentials', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const hasServerCredentials = ((credsRes.data as { credentials?: unknown[] })?.credentials?.length ?? 0) > 0;
        if (!hasServerCredentials) {
          setPasskeyNudgeToken(accessToken);
          setPendingRedirect(() => executeRedirect);
          setPasskeyNudgeOpen(true);
          return;
        }
      } catch {
        // Credentials check failed: just continue.
      }
    }
    executeRedirect();
  };

  const doLogin = async (otpCode?: string, tenantOverride?: string) => {
    setIsLoading(true);
    setError(null);
    setMfaError(null);
    setMismatch(null);

    // Organisation actually signed in to: just picked > picked earlier (MFA resubmit) > flow.
    const effectiveTenant = tenantOverride ?? selectedTenant ?? tenantSlug;

    try {
      const payload: Record<string, string> = { email, password, tenant_slug: effectiveTenant };
      if (clientId) payload.client_id = clientId;
      if (otpCode) payload.totp_code = otpCode;

      const response = await apiClient.post('/api/v1/auth/login', payload);
      const data = response.data as {
        mfa_required?: boolean;
        access_token?: string;
        user?: LoginUser;
        roles?: string[];
        permissions?: string[];
      };

      if (data.mfa_required) {
        setMfaRequired(true);
        setIsLoading(false);
        setTimeout(() => totpInputRef.current?.focus(), 100);
        return;
      }

      const user = data?.user;
      if (user) {
        setUser({
          ...user,
          roles: user.roles ?? data.roles ?? [],
          permissions: user.permissions ?? data.permissions ?? [],
          tenants: user.tenants ?? [],
        });
      }

      // After an organisation switch every slug baked into the flow must follow, or the
      // authorize hop re-targets the wrong tenant and dies at the service callback.
      const switched = effectiveTenant && tenantSlug && effectiveTenant !== tenantSlug;
      const rewrite = (u: string) => (switched ? rewriteTenantInUrl(u, effectiveTenant, tenantSlug) : u);
      const executeRedirect = () => {
        if (returnTo && returnTo.startsWith('http') && isValidReturnUrl(returnTo)) {
          window.location.href = rewrite(returnTo);
          return;
        }
        if (clientId && redirectUri) {
          window.location.href = buildAuthorizeUrl(effectiveTenant, rewrite);
          return;
        }
        router.push(getSafeReturnUrl(returnTo, '/dashboard'));
      };

      const accessToken = data.access_token ?? '';
      if (user?.profile?.must_change_password === true) {
        setNewPasswordStep(() => () => finishLogin(user, accessToken, executeRedirect));
        return;
      }
      await finishLogin(user, accessToken, executeRedirect);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const details = err.response?.data?.details;
      if (code === 'tenant_mismatch' && details?.user_tenants?.length > 0) {
        setMismatch({ requestedTenant: details.requested_tenant || effectiveTenant, userTenants: details.user_tenants });
      } else if (code === 'invalid_totp') {
        setMfaError('That code is not right. Try again.');
      } else if (code === 'invalid_credentials') {
        setError('Wrong email or password.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Could not sign you in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin();
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = totpCode.replace(/[\s-]/g, '');
    if (code.length < 6) {
      setMfaError('Enter the 6-digit code.');
      return;
    }
    doLogin(code);
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError(null);
    if (newPassword.length < MIN_PASSWORD) {
      setNewPasswordError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setNewPasswordError('The two passwords do not match.');
      return;
    }
    if (newPassword === password) {
      setNewPasswordError('Choose a password different from the temporary one.');
      return;
    }
    setNewPasswordSaving(true);
    try {
      await changePassword(password, newPassword);
      const next = newPasswordStep;
      setNewPasswordStep(null);
      setPassword(newPassword);
      next?.();
    } catch (err: any) {
      const code = err.response?.data?.code;
      setNewPasswordError(
        code === 'weak_password'
          ? 'That password is too weak. Mix letters, numbers and a symbol.'
          : err.response?.data?.message || err.response?.data?.error || 'Could not save the new password.',
      );
    } finally {
      setNewPasswordSaving(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setTermsError('Tick the box to accept the terms.');
      return;
    }
    setTermsLoading(true);
    setTermsError(null);
    try {
      await apiClient.post('/api/v1/auth/me/accept-terms', {});
      pendingRedirect?.();
    } catch {
      setTermsError('Could not save that. Try again.');
    } finally {
      setTermsLoading(false);
    }
  };

  if (newPasswordStep) {
    return (
      <form onSubmit={handleNewPassword} className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted px-3.5 py-3 text-sm">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>You signed in with a temporary password. Set your own to continue.</p>
        </div>
        {newPasswordError && <AuthNotice>{newPasswordError}</AuthNotice>}
        <PasswordField id="new_password" label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" autoFocus />
        <PasswordField id="confirm_password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        <Button type="submit" className="h-11 w-full" disabled={newPasswordSaving}>
          {newPasswordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save and continue'}
        </Button>
      </form>
    );
  }

  if (termsRequired) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted px-3.5 py-3 text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>We have updated our Terms of Service and Privacy Policy. Please review and accept them to continue.</p>
        </div>
        {termsError && <AuthNotice>{termsError}</AuthNotice>}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5 text-sm">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span className="text-muted-foreground">
            I agree to the{' '}
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Privacy Policy</a>.
          </span>
        </label>
        <Button type="button" className="h-11 w-full" disabled={termsLoading} onClick={handleAcceptTerms}>
          {termsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept and continue'}
        </Button>
      </div>
    );
  }

  if (mfaRequired) {
    return (
      <form onSubmit={handleMfaSubmit} className="space-y-5">
        <p className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
        {mfaError && <AuthNotice>{mfaError}</AuthNotice>}
        <div className="space-y-1.5">
          <Label htmlFor="totp_code">Verification code</Label>
          <Input
            ref={totpInputRef}
            id="totp_code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000 000"
            maxLength={7}
            value={totpCode}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              setTotpCode(raw.length > 3 ? raw.slice(0, 3) + ' ' + raw.slice(3, 6) : raw);
            }}
            className="h-12 text-center font-mono text-xl tracking-[0.3em]"
            autoFocus
          />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
        </Button>
        <button
          type="button"
          onClick={() => { setMfaRequired(false); setTotpCode(''); setMfaError(null); }}
          className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </form>
    );
  }

  return (
    <>
      {mismatch && (
        <WrongOrganisationDialog
          requestedTenant={mismatch.requestedTenant}
          tenants={mismatch.userTenants}
          onSelect={switchToTenant}
          onClose={() => setMismatch(null)}
          busySlug={switchingSlug}
          hint="We'll sign you in to the organisation you pick. No need to type your password again."
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {notice && <AuthNotice tone="success">{notice}</AuthNotice>}
        {error && <AuthNotice>{error}</AuthNotice>}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
            autoFocus={!email}
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          autoFocus={!!email}
          trailing={
            <Link href={authFlowHref('/forgot-password', searchParams, email ? { email } : undefined)} className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </Button>

        {biometricSupported && (
          <div className="space-y-1.5">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => biometricAuth(hasRegisteredCredential ? email : '', tenantSlug || undefined)}
              disabled={biometricLoading}
            >
              {biometricLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 1C6.48 1 2 5.48 2 11c0 3.27 1.5 6.18 3.84 8.12M12 1c5.52 0 10 4.48 10 10 0 3.27-1.5 6.18-3.84 8.12M12 1v1m0 21v-1" />
                  <path d="M8 11c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.5-.82 2.8-2 3.54M8 11c0 2.21 1.79 4 4 4" />
                </svg>
              )}
              Sign in with a passkey
            </Button>
            {biometricError && <p className="text-center text-xs text-red-600 dark:text-red-400">{biometricError}</p>}
          </div>
        )}
      </form>

      <PasskeySetupNudge
        open={passkeyNudgeOpen}
        accessToken={passkeyNudgeToken}
        onClose={() => {
          setPasskeyNudgeOpen(false);
          pendingRedirect?.();
          setPendingRedirect(null);
        }}
      />
    </>
  );
}
