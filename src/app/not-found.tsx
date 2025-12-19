'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-orange-50 dark:bg-orange-500/10 mb-8"
        >
          <ShieldAlert className="h-12 w-12 text-orange-500" />
        </motion.div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-8">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto mb-10">
          The page you are looking for doesn't exist or has been moved to another department.
        </p>
        <Link href="/">
          <Button className="h-14 px-8 rounded-2xl font-bold">
            <Home className="h-5 w-5 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
