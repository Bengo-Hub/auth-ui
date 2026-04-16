'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Fingerprint, Globe, Loader2, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoginForm } from '@/components/auth/LoginForm';
import { SSOConnectionsSVG } from '@/components/ui/SSOConnectionsSVG';
import { ProviderLogo } from '@/components/oauth/provider-logo';
import { oauthProviders, type OAuthProviderDef } from '@/lib/oauth/catalog';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl } from '@/lib/utils';

type ActiveIntegration = {
  name: string;
  display_name: string;
  category?: string;
  logo_slug?: string;
  brand_color?: string;
};

function useActiveOAuthProviders(tenantSlug: string): OAuthProviderDef[] {
  const { data } = useQuery<ActiveIntegration[]>({
    queryKey: ['active_integrations', 'oauth', tenantSlug],
    queryFn: async () => {
      const qs = new URLSearchParams({ category: 'oauth' });
      if (tenantSlug) qs.set('tenant_slug', tenantSlug);
      const { data } = await apiClient.get(`/api/v1/auth/integrations/active?${qs}`);
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
  // Only expose providers that are both (a) in the catalog and (b) active in auth-api.
  const enabledNames = new Set((data ?? []).map((i) => i.name));
  return oauthProviders.filter((p) => enabledNames.has(p.id));
}

// Animated feature cards for the right side
const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption with SOC 2 compliance',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Auth',
    description: 'TOTP, SMS, and hardware key support',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Single Sign-On',
    description: 'One account for all Codevertex services',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-second authentication globally',
    color: 'from-amber-500 to-orange-500',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// OAuth button driven by catalog entry. Loading state is local.
function OAuthButton({
  provider,
  fullWidth = false,
}: {
  provider: OAuthProviderDef;
  fullWidth?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    try {
      const returnTo = getSafeReturnUrl(searchParams.get('return_to'), '/dashboard');
      const tenantSlug = searchParams.get('tenant') ?? '';

      const response = await apiClient.post(`/api/v1/auth/oauth/${provider.id}/start`, {
        return_to: returnTo,
        tenant_slug: tenantSlug,
      });

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err: any) {
      console.error(`OAuth ${provider.id} error:`, err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleOAuthLogin}
      disabled={isLoading}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-medium text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <ProviderLogo
          providerId={provider.id}
          slug={provider.logoSlug}
          color={provider.logoColor}
          brandColor={provider.brandColor}
          name={provider.name}
          size={20}
          className="!p-0 !ring-0 !bg-transparent"
        />
      )}
      {fullWidth ? `Continue with ${provider.name}` : provider.name}
    </button>
  );
}

function OAuthButtonGroup() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') ?? '';
  const providers = useActiveOAuthProviders(tenantSlug);

  if (providers.length === 0) return null;
  if (providers.length === 1) {
    return (
      <div className="space-y-3 mb-6">
        <OAuthButton provider={providers[0]} fullWidth />
      </div>
    );
  }
  const [primary, ...rest] = providers;
  return (
    <div className="space-y-3 mb-6">
      <OAuthButton provider={primary} fullWidth />
      {rest.length > 0 && (
        <div className={`grid gap-3 ${rest.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {rest.map((p) => (
            <OAuthButton key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Side - Visual Content */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/5 via-sky-500/5 to-violet-500/5 dark:from-primary/10 dark:via-sky-500/5 dark:to-violet-500/10 border-r border-slate-200/50 dark:border-slate-800/50 items-center justify-center p-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-sky-500/10 to-transparent rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Unified <span className="text-primary italic">Access</span> Control
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Securely connect to all Codevertex services with a single identity.
              </p>
            </div>
            
            <SSOConnectionsSVG />

            <div className="mt-12 grid grid-cols-3 gap-8 w-full border-t border-slate-200/50 dark:border-slate-800/50 pt-12">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">12+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Microservices</p>
              </div>
              <div className="text-center border-x border-slate-200/50 dark:border-slate-800/50 px-4">
                <p className="text-2xl font-black text-slate-900 dark:text-white">99.9%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reliability</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">SO2</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="absolute top-8 left-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tighter">Codevertex</span>
            </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Sign in to your enterprise account
            </p>
          </div>

          {/* OAuth Buttons — only the providers configured in auth-api render */}
          <Suspense fallback={<div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />}>
            <OAuthButtonGroup />
          </Suspense>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
              <span className="bg-slate-50 dark:bg-slate-900 px-4 text-slate-400">
                Authorized Credentials Only
              </span>
            </div>
          </div>

          {/* Login Form */}
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          {/* Sign Up Link */}
          <div className="mt-8 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                New to the platform?{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline transition-all">
                  Create Organization account
                  <ArrowRight className="inline-block ml-1 w-4 h-4" />
                </Link>
            </p>
          </div>

          {/* Footer Info */}
          <p className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[280px] mx-auto font-medium">
            Protected by Codevertex Shield. Usage is monitored and subject to our Security Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
