'use client';

import { PRODUCTION_DOMAINS } from '@/config/services';
import { useEffect } from 'react';

/**
 * Notification templates and providers are owned by Notifications service.
 * This page redirects platform admins to the notifications-ui experience.
 */
export default function NotificationsRedirectPage() {
  useEffect(() => {
    window.location.href = PRODUCTION_DOMAINS.notifications || 'https://notifications.codevertexitsolutions.com';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6">
      <p className="text-slate-600 dark:text-slate-400">Redirecting to Notifications service…</p>
      <a
        href={PRODUCTION_DOMAINS.notifications || 'https://notifications.codevertexitsolutions.com'}
        className="text-primary font-medium underline"
      >
        Open Codevertex Notifications
      </a>
    </div>
  );
}
