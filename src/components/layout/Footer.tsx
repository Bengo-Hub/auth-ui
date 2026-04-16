'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export default function Footer() {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const currentYear = new Date().getFullYear();
  const tenantName = activeTenant?.name || 'Codevertex IT Solutions';

  return (
    <footer className="w-full mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      {/* Legal + navigation links — required by Google OAuth branding guidelines:
          home, privacy, and terms must be reachable from the homepage without sign-in. */}
      <div className="border-b border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
                <img
                  src="/images/logo/codevertex.png"
                  alt="Codevertex"
                  className="h-5 w-auto dark:brightness-0 dark:invert"
                />
                <span className="text-sm font-black uppercase tracking-tight">
                  Codevertex SSO
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Unified identity for the Codevertex ecosystem. Sign in once to access every
                service in your organisation.
              </p>
            </div>

            <nav
              aria-label="Legal"
              className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs font-semibold sm:grid-cols-3"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Service
                </span>
                <Link
                  href="/"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Pricing
                </Link>
                <Link
                  href="/status"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Status
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Legal
                </span>
                <Link
                  href="/privacy"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Terms of Service
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Contact
                </span>
                <a
                  href="mailto:support@codevertexitsolutions.com"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Support
                </a>
                <a
                  href="mailto:privacy@codevertexitsolutions.com"
                  className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Privacy inquiries
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright & powered-by */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center md:text-left">
              All Rights Reserved.{' '}
              <span className="text-slate-900 dark:text-white font-bold">{tenantName}</span>
              &nbsp;&copy; {currentYear}.
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://codevertexitsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all hover:ring-4 hover:ring-primary/20"
              >
                <img
                  src="/images/logo/codevertex.png"
                  alt="Codevertex"
                  className="h-4 w-auto brightness-0 invert dark:brightness-100 dark:invert-0"
                />
                <span className="text-xs font-black tracking-tight uppercase">
                  Powered by <span className="text-primary">Codevertex IT Solutions</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
