'use client';

import { PRODUCTION_DOMAINS } from '@/config/services';
import { useEffect } from 'react';

/**
 * Payment gateways are owned by Treasury (Codevertex Books).
 * This page redirects platform admins to the treasury-ui gateways experience.
 */
export default function GatewaysRedirectPage() {
  const booksUrl = PRODUCTION_DOMAINS.books || 'https://books.codevertexitsolutions.com';
  useEffect(() => {
    window.location.href = booksUrl;
  }, [booksUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6">
      <p className="text-slate-600 dark:text-slate-400">Redirecting to Treasury (Books) for payment gateways…</p>
      <a
        href={booksUrl}
        className="text-primary font-medium underline"
      >
        Open Codevertex Books (Treasury)
      </a>
    </div>
  );
}
