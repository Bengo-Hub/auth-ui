'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

// The Security tab used to duplicate the /dashboard/security page (password change + sessions).
// Now it links to the dedicated security page to avoid duplicate code and stale implementations.
export function SecurityTab() {
  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="h-8 w-8 text-indigo-500" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Security Settings</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
        Manage your password, two-factor authentication, and active sessions from the dedicated security page.
      </p>
      <Link href="/dashboard/security">
        <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
          Go to Security Settings <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}
