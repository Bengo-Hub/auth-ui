'use client';

import { MessageCircle } from 'lucide-react';

// ── Support ───────────────────────────────────────────────────────────────────

export function SupportTab({ tenant }: { tenant: { slug: string; name: string } }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vera AI Support</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The Vera AI widget is available on this page. Click the chat icon to get instant answers
          or escalate to the {tenant.name} helpdesk team.
        </p>
        <p className="text-xs text-slate-400">
          Powered by Vera AI · Routed to <span className="font-mono">{tenant.slug}</span> helpdesk
        </p>
      </div>
    </div>
  );
}
