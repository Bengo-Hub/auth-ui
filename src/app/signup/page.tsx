'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="bg-[#ea8022] p-2 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              BengoBox <span className="text-[#ea8022]">Accounts</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the BengoBox ecosystem today</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea8022]"></div></div>}>
            <SignupForm />
          </Suspense>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-[#ea8022] font-bold hover:underline">Sign in instead</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

