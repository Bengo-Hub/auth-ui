'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/api/v1/auth/password-reset/request', {
        email,
        tenant_slug: 'codevertex',
      });
      setIsSuccess(true);
    } catch (err: any) {
      // Don't reveal whether the email exists — show success regardless
      // Only show error for network/server failures
      if (err.message?.includes('network') || err.message?.includes('server')) {
        setError('Something went wrong. Please try again.');
      } else {
        setIsSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <img
                src="/images/logo/codevertex.png"
                alt="Codevertex"
                className="h-12 w-12 object-contain"
              />
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Codevertex
                </span>
                <span className="block text-sm font-medium text-primary">
                  Identity Platform
                </span>
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Reset your password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Check your email
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                If an account exists for <strong className="text-slate-700 dark:text-slate-300">{email}</strong>,
                you&apos;ll receive a password reset link shortly.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="w-full h-12 rounded-xl"
                >
                  Try another email
                </Button>
                <Link href="/login">
                  <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
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
                      autoFocus
                    />
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
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  <ArrowLeft className="inline-block mr-1 w-4 h-4" />
                  Back to sign in
                </Link>
              </p>
            </>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              SOC 2
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              GDPR
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              256-bit TLS
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Creative Content */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/10 via-sky-500/5 to-violet-500/10 dark:from-primary/20 dark:via-sky-500/10 dark:to-violet-500/20 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-sky-500/30 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg text-center"
          >
            <motion.div animate={floatingAnimation} className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-150" />
                <div className="relative p-6 bg-gradient-to-br from-primary to-pink-600 rounded-3xl shadow-2xl shadow-primary/30">
                  <KeyRound className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>

            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Don&apos;t worry,{' '}
              <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                it happens
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
              We&apos;ll help you regain access to your account securely and quickly.
            </p>

            <div className="space-y-4 text-left">
              <div className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                      Step 1: Enter your email
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter the email address associated with your account
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                      Step 2: Check your inbox
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click the secure reset link in the email we send you
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                      Step 3: Create new password
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose a strong password and you&apos;re back in
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
