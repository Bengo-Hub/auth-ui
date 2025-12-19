'use client';

import { motion } from 'framer-motion';
import { Chrome, Github, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to continue to your BengoBox services</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="space-y-6">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all font-bold text-sm">
                <Chrome className="h-5 w-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all font-bold text-sm">
                <Github className="h-5 w-5" />
                GitHub
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or email</span>
              </div>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea8022]"></div></div>}>
              <LoginForm />
            </Suspense>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account? <Link href="/signup" className="text-[#ea8022] font-bold hover:underline">Create one for free</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
