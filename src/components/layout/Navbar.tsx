'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { Menu, ShieldCheck, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, hasRole } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-[#ea8022] p-2 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                BengoBox <span className="text-[#ea8022]">Accounts</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm font-bold text-slate-600 hover:text-[#ea8022] transition-colors">Services</Link>
            <Link href="/dashboard/developer" className="text-sm font-bold text-slate-600 hover:text-[#ea8022] transition-colors">Developer Portal</Link>
            <Link href="/support" className="text-sm font-bold text-slate-600 hover:text-[#ea8022] transition-colors">Support</Link>
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 mx-2" />
            
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ea8022] border-t-transparent" />
            ) : user ? (
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <div className="bg-slate-100 p-2 rounded-full">
                  <User className="h-4 w-4" />
                </div>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-[#ea8022] transition-colors">Sign In</Link>
                <Link href="/signup" className="bg-[#ea8022] hover:bg-[#d6701d] text-white px-6 py-2 rounded-full font-bold text-sm transition-all">Create Account</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
          <Link href="/services" className="block text-lg font-bold text-slate-600">Services</Link>
          <Link href="/developers" className="block text-lg font-bold text-slate-600">Developers</Link>
          <Link href="/support" className="block text-lg font-bold text-slate-600">Support</Link>
          <hr className="border-slate-100" />
          <Link href="/login" className="block text-lg font-bold text-slate-600">Sign In</Link>
          <Link href="/signup" className="block btn-primary text-center">Create Account</Link>
        </div>
      )}
    </nav>
  );
}
