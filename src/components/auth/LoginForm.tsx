'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Lock, Eye, EyeOff, Github, Chrome, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
        tenant_slug: tenantSlug,
      });

      const data = response.data as {
        user?: { id: string; email: string; name?: string; roles?: string[]; permissions?: string[]; tenants?: Array<{ id: string; name: string; slug: string; roles: string[] }> };
        roles?: string[];
        permissions?: string[];
      };
      const user = data?.user;
      if (user) {
        setUser({
          ...user,
          roles: user.roles ?? data.roles ?? [],
          permissions: user.permissions ?? data.permissions ?? [],
          tenants: user.tenants ?? [],
        });
      }

      // If we have OIDC parameters, redirect back to the authorize endpoint
      // The authorize endpoint will now see the session cookie and complete the flow
      if (clientId && redirectUri) {
        const authorizeUrl = new URL('/api/v1/auth/oidc/authorize', window.location.origin);
        authorizeUrl.searchParams.set('client_id', clientId);
        authorizeUrl.searchParams.set('redirect_uri', redirectUri);
        if (stateParam) authorizeUrl.searchParams.set('state', stateParam);
        if (scope) authorizeUrl.searchParams.set('scope', scope);

        window.location.href = authorizeUrl.toString();
        return;
      }

      // Otherwise redirect to returnTo or dashboard (validated to prevent open redirect)
      router.push(getSafeReturnUrl(returnTo));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
