'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-rose-50 dark:bg-rose-500/10 mb-8"
        >
          <AlertTriangle className="h-12 w-12 text-rose-500" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Something went wrong</h1>
        <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto mb-10">
          An unexpected error occurred. Our security team has been notified.
        </p>
        <Button 
          onClick={() => reset()}
          className="h-14 px-8 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white border-none"
        >
          <RefreshCcw className="h-5 w-5 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
}
