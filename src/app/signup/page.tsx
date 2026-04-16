'use client';

import { motion } from 'framer-motion';
import { Shield, UserPlus, Users, ArrowLeft, Rocket, Star, Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { SignupForm } from '@/components/auth/SignupForm';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl } from '@/lib/utils';
import { SSOConnectionsSVG } from '@/components/ui/SSOConnectionsSVG';
import { ProviderLogo } from '@/components/oauth/provider-logo';
import { oauthProviders, type OAuthProviderDef } from '@/lib/oauth/catalog';

type ActiveIntegration = {
  name: string;
  display_name: string;
  category?: string;
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
  const enabledNames = new Set((data ?? []).map((i) => i.name));
  return oauthProviders.filter((p) => enabledNames.has(p.id));
}

// Benefits for the right side
const benefits = [
  {
    icon: Rocket,
    title: 'Get Started Instantly',
    description: 'Create your account in seconds and access all services immediately',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your data is protected with bank-grade encryption and compliance',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Gift,
    title: 'Free Forever Tier',
    description: 'Access essential features at no cost, upgrade when you need more',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite your team and manage access with powerful controls',
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

export default function SignupPage() {
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
                Scale Your <span className="text-primary">Ecosystem</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Join 10,000+ businesses running on Codevertex infrastructure.
              </p>
            </div>
            
            <SSOConnectionsSVG />

            <div className="mt-12 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 shadow-sm max-w-md mx-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 italic text-center mb-4">
                "Codevertex SSO simplified our entire authentication flow. Setup took minutes and our team loves it."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                  JM
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">John Mwangi</p>
                  <p className="text-[10px] text-slate-500">CTO, TechStartup Kenya</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
              Create Organization
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Join the Codevertex ecosystem today
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
                Setup Official Profile
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <SignupForm />
          </Suspense>

          {/* Sign In Link */}
          <div className="mt-8 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                  <ArrowLeft className="inline-block mr-1 w-4 h-4" />
                  Sign in to console
                </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
