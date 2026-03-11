'use client';

import { motion } from 'framer-motion';
import { Shield, UserPlus, Users, ArrowLeft, Rocket, Star, Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SignupForm } from '@/components/auth/SignupForm';
import apiClient from '@/lib/api-client';
import { getSafeReturnUrl } from '@/lib/utils';
import { SSOConnectionsSVG } from '@/components/ui/SSOConnectionsSVG';

// Official OAuth Provider Logos (SVG)
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor"/>
    </svg>
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h11.377v11.372H0V0z" fill="#F25022"/>
      <path d="M12.623 0H24v11.372H12.623V0z" fill="#7FBA00"/>
      <path d="M0 12.623h11.377V24H0V12.623z" fill="#00A4EF"/>
      <path d="M12.623 12.623H24V24H12.623V12.623z" fill="#FFB900"/>
    </svg>
  );
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

// OAuth button component with loading state
function OAuthButton({
  provider,
  icon: Icon,
  label,
  fullWidth = false,
}: {
  provider: 'google' | 'github' | 'microsoft';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  fullWidth?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get return_to from URL params, validated to prevent open redirect
      const returnTo = getSafeReturnUrl(searchParams.get('return_to'), '/dashboard');
      const tenantSlug = searchParams.get('tenant') || 'codevertex';

      // Call the OAuth start endpoint
      const response = await apiClient.post(`/api/v1/auth/oauth/${provider}/start`, {
        return_to: returnTo,
        tenant_slug: tenantSlug,
      });

      // The backend returns an authorization URL to redirect to
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err: any) {
      console.error(`OAuth ${provider} error:`, err);
      setError(err.message || `Failed to start ${provider} login`);
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
        <Icon className="w-5 h-5" />
      )}
      {fullWidth ? `Continue with ${label}` : label}
    </button>
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

          {/* OAuth Buttons */}
          <Suspense fallback={<div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />}>
            <div className="space-y-3 mb-6">
              <OAuthButton provider="google" icon={GoogleLogo} label="Google" fullWidth />
              <div className="grid grid-cols-2 gap-3">
                <OAuthButton provider="github" icon={GitHubLogo} label="GitHub" />
                <OAuthButton provider="microsoft" icon={MicrosoftLogo} label="Microsoft" />
              </div>
            </div>
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
