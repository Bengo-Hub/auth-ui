'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl, isValidReturnUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, Chrome, Cpu, Eye, EyeOff, Github, Loader2, Lock, Mail, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

interface TenantSuggestion {
  id: string;
  name: string;
  slug: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const { data: activeIntegrations } = useQuery({
    queryKey: ['active_integrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/auth/integrations/active');
      return data as Array<{ name: string; display_name: string }>;
    },
  });

  const socialProviders = activeIntegrations?.filter(i =>
    ['google_oauth', 'github_oauth', 'microsoft_oauth'].includes(i.name)
  ) || [];

  // OIDC / Redirect parameters
  const returnTo = searchParams.get('return_to');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const stateParam = searchParams.get('state');
  const scope = searchParams.get('scope');
  // When no tenant in URL, send empty string so auth-api resolves tenant from user's primary_tenant_id (tenant users can log in directly).
  const tenantSlug = searchParams.get('tenant') ?? '';

  // Demo credentials for easy testing (view-only access)
  const [email, setEmail] = useState('demo@bengobox.dev');
  const [password, setPassword] = useState('DemoUser2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA challenge state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const totpInputRef = useRef<HTMLInputElement>(null);

  // Tenant mismatch state
  const [mismatch, setMismatch] = useState<{
    requestedTenant: string;
    userTenants: TenantSuggestion[];
  } | null>(null);

  const switchToTenant = (slug: string) => {
    // Rebuild the current URL with the new tenant slug and reload
    const url = new URL(window.location.href);
    url.searchParams.set('tenant', slug);

    // Also update the return_to URL's tenant if it's an SSO authorize flow
    const currentReturnTo = url.searchParams.get('return_to');
    if (currentReturnTo) {
      try {
        const returnUrl = new URL(currentReturnTo);
        // No need to modify return_to — the service will use the session's tenant
      } catch {
        // return_to is not a URL, ignore
      }
    }

    window.location.href = url.toString();
  };

  const doLogin = async (otpCode?: string) => {
    setIsLoading(true);
    setError(null);
    setMfaError(null);
    setMismatch(null);

    try {
      const payload: Record<string, string> = {
        email,
        password,
        tenant_slug: tenantSlug,
      };
      if (otpCode) payload.totp_code = otpCode;

      const response = await apiClient.post('/api/v1/auth/login', payload);

      const data = response.data as {
        mfa_required?: boolean;
        mfa_method?: string;
        user_id?: string;
        user?: { id: string; email: string; name?: string; roles?: string[]; permissions?: string[]; tenants?: Array<{ id: string; name: string; slug: string; roles: string[] }> };
        roles?: string[];
        permissions?: string[];
      };

      // MFA challenge: backend needs a TOTP code
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

      // Prefer return_to when it's an absolute URL: full page redirect so the browser sends
      // the session cookie (required for service-originated login and for redirecting to another app).
      if (returnTo && returnTo.startsWith('http') && isValidReturnUrl(returnTo)) {
        window.location.href = returnTo;
        return;
      }

      // If we have OIDC params but no return_to, build the SSO authorize URL and redirect there
      // (must use SSO origin so the browser hits auth-api and sends the session cookie).
      if (clientId && redirectUri) {
        const ssoBase = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexitsolutions.com';
        const authorizeUrl = new URL('/api/v1/authorize', ssoBase.replace(/\/$/, ''));
        authorizeUrl.searchParams.set('client_id', clientId);
        authorizeUrl.searchParams.set('redirect_uri', redirectUri);
        if (stateParam) authorizeUrl.searchParams.set('state', stateParam);
        if (scope) authorizeUrl.searchParams.set('scope', scope);

        window.location.href = authorizeUrl.toString();
        return;
      }

      // Relative return_to or default: client-side navigation
      router.push(getSafeReturnUrl(returnTo));
    } catch (err: any) {
      const code = err.response?.data?.code;
      const details = err.response?.data?.details;

      if (code === 'tenant_mismatch' && details?.user_tenants?.length > 0) {
        setMismatch({
          requestedTenant: details.requested_tenant || tenantSlug,
          userTenants: details.user_tenants,
        });
      } else if (code === 'invalid_totp') {
        setMfaError('Invalid verification code. Please try again.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    doLogin();
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = totpCode.replace(/\s/g, '').replace(/-/g, '');
    if (code.length < 6) {
      setMfaError('Please enter a 6-digit code.');
      return;
    }
    doLogin(code);
  };

  const handleMfaBack = () => {
    setMfaRequired(false);
    setTotpCode('');
    setMfaError(null);
  };

  // MFA challenge screen
  if (mfaRequired) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the 6-digit code from your authenticator app to complete sign in.
          </p>
        </div>

        {mfaError && (
          <div className="p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
            {mfaError}
          </div>
        )}

        <form onSubmit={handleMfaSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="totp_code" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Verification Code
            </Label>
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
                // Format as "123 456"
                setTotpCode(raw.length > 3 ? raw.slice(0, 3) + ' ' + raw.slice(3, 6) : raw);
              }}
              className="h-14 text-center text-2xl font-mono tracking-[0.3em] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify & Sign In'
            )}
          </Button>

          <button
            type="button"
            onClick={handleMfaBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      {/* Tenant mismatch modal */}
      {mismatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMismatch(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setMismatch(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wrong Organisation
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your account does not belong to{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {mismatch.requestedTenant}
                  </span>.
                  Switch to one of your organisations below.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {mismatch.userTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => switchToTenant(tenant.slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {tenant.slug}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              Selecting an organisation will reload the page with the correct context.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Sign In'
          )}
        </Button>

        {socialProviders.length > 0 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {socialProviders.map((provider) => {
                const providerKey = provider.name.replace('_oauth', '');
                const Icon = providerKey === 'google' ? Chrome : providerKey === 'github' ? Github : Cpu;

                const handleSocialLogin = () => {
                  const startUrl = new URL(`/api/v1/auth/${providerKey}/start`, window.location.origin);
                  if (tenantSlug) startUrl.searchParams.set('tenant_slug', tenantSlug);
                  if (returnTo) startUrl.searchParams.set('return_to', returnTo);

                  // Add OIDC/Redirect params if present
                  if (clientId) startUrl.searchParams.set('client_id', clientId);
                  if (redirectUri) startUrl.searchParams.set('redirect_uri', redirectUri);
                  if (stateParam) startUrl.searchParams.set('state', stateParam);
                  if (scope) startUrl.searchParams.set('scope', scope);

                  window.location.href = startUrl.toString();
                };

                return (
                  <Button
                    key={provider.name}
                    type="button"
                    variant="outline"
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold"
                    onClick={handleSocialLogin}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {provider.display_name}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </form>
    </>
  );
}
