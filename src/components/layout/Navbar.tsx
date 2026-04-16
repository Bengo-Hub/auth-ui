'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Code2, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group gap-3">
              <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-primary/10 to-transparent group-hover:from-primary/20 transition-all duration-500">
                <img src="/images/logo/codevertex.png" alt="Codevertex" className="h-8 w-auto object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-md dark:brightness-110" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  <span className="text-primary">SSO</span>
                </span>
                <span className="hidden sm:block text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Identity Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-6">
            <Link
              href="/#services"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Services
            </Link>
            <Link
              href="/dashboard/developer"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4" />
              Developers
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Docs
            </Link>
            <Link
              href="/status"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Status
            </Link>
            <Link
              href="/privacy"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Terms
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <ThemeToggle />

            {!mounted ? (
              <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : !isLoading ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Start Free
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
                <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/#services"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/dashboard/developer"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Developers
            </Link>
            <Link
              href="/docs"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Documentation
            </Link>
            <Link
              href="/pricing"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/status"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              System Status
            </Link>
            <Link
              href="/privacy"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Terms of Service
            </Link>

            <hr className="border-slate-200 dark:border-slate-800 my-3" />
 
            {!mounted ? (
              <div className="flex flex-col gap-2">
                <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
              </div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            ) : !isLoading ? (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 text-center bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
