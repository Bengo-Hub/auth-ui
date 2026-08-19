'use client';

import { AlertTriangle, Building2, Database, Loader2, Users } from 'lucide-react';
import { useMailStats } from '@/hooks/use-mail-stats';
import { StatCard } from './stat-card';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

/** Email Hosting analytics — real stats from mail-ui's Stalwart-backed
 * platform (Phase 15), via /api/mail-stats. New product surface: this app
 * has never shown anything about the email hosting service before.
 *
 * Caller (dashboard/page.tsx) already gates whether this tab renders at all
 * (platform owner, or an active email-hosting subscription on the user's
 * own tenant) — isPlatformOwner here only controls the admin-console link,
 * since that's a genuine Stalwart-admin-credential surface a regular tenant
 * user/admin has no access to, distinct from auth-ui's own tenant-admin role.
 *
 * Known limitation, not fixed by this gating pass: the stats themselves
 * (domain/mailbox/storage counts) are platform-wide aggregates from
 * mail-ui's fetchPlatformStats — Stalwart has no per-tenant account
 * scoping yet (this deployment only hosts Codevertex's own domain/mailboxes
 * today), so there's no per-tenant breakdown to show instead. */
export function EmailHostingTab({ isPlatformOwner }: { isPlatformOwner: boolean }) {
  const { data, isLoading, isError, error } = useMailStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900 dark:text-amber-400 text-sm">Email hosting stats aren't available right now</p>
          <p className="text-amber-700 dark:text-amber-500 text-xs mt-0.5">
            {error instanceof Error ? error.message : 'Could not reach the mail hosting service.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Domains" value={data.domainCount} icon={Building2} color="purple" />
        <StatCard label="Mailboxes" value={data.accountCount} icon={Users} color="blue" />
        <StatCard label="Storage Used" value={formatBytes(data.totalUsedQuotaBytes)} icon={Database} color="green" />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
        {isPlatformOwner ? (
          <>Hosted on Stalwart Mail Server, managed from <a href="https://webmail.codevertexafrica.com/admin" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">webmail.codevertexafrica.com/admin</a>.</>
        ) : (
          <>Hosted on Stalwart Mail Server. Manage your own mailbox at <a href="https://webmail.codevertexafrica.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">webmail.codevertexafrica.com</a>.</>
        )}
      </div>
    </div>
  );
}
