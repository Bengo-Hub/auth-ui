'use client';

import { useQuery } from '@tanstack/react-query';

// Kept as its own small file rather than growing use-dashboard-api.ts
// (already 880+ lines, over the fleet's 300-400-line convention).

export interface MailStats {
  domainCount: number;
  accountCount: number;
  totalUsedQuotaBytes: number;
}

/** Backs the dashboard's "Email Hosting" analytics tab — calls this app's
 * own /api/mail-stats proxy, which S2S-calls mail-ui's internal stats
 * endpoint. Not `enabled` gating on anything: every signed-in user can see
 * platform-wide hosting stats are available, same as the Platform tab. */
export function useMailStats() {
  return useQuery<MailStats>({
    queryKey: ['mail-stats'],
    queryFn: async () => {
      const res = await fetch('/api/mail-stats');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to load email hosting stats');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
