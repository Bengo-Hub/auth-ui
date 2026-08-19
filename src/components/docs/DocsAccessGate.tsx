'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Lock, Clock, XCircle } from 'lucide-react';
import { useDocsAccess } from '@/hooks/useDocsAccess';

interface DocsAccessGateProps {
  /** Short slug identifying which docs page this is, e.g. "notifications-api". */
  resourceKey: string;
  /** Human-readable name shown in the gate copy, e.g. "Notifications API". */
  serviceName: string;
  children: React.ReactNode;
}

export function DocsAccessGate({ resourceKey, serviceName, children }: DocsAccessGateProps) {
  const { isLoggedIn, isLoading, status, requestAccess } = useDocsAccess(resourceKey);
  const [externalForm, setExternalForm] = useState({ name: '', email: '', company: '', notes: '' });
  const [externalSubmitted, setExternalSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (status === 'approved') {
    return <>{children}</>;
  }

  // Not logged in at all — this covers both "hasn't signed up yet" and an external
  // developer with no Codevertex account. Reuses the same anonymous IntegrationRequest
  // path already used for eTIMS integration leads (no login required to submit).
  if (!isLoggedIn) {
    if (externalSubmitted) {
      return <GateShell icon={<Clock className="w-8 h-8 text-amber-500" />} title="Request submitted" body={`We've received your request for ${serviceName} docs access. A platform admin will review it — you'll be notified by email once it's approved.`} />;
    }
    return (
      <div className="min-h-[70vh] max-w-lg mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl"><Lock className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{serviceName} docs are gated</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in if you already have an account, or request access below.</p>
          </div>
        </div>

        <Link href="/auth/login" className="block w-full text-center mb-6 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">
          Sign in
        </Link>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white dark:bg-slate-950 text-slate-400">or, as a new developer</span></div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestAccess.mutate(
              { requesterName: externalForm.name, requesterEmail: externalForm.email, companyName: externalForm.company, notes: externalForm.notes },
              { onSuccess: () => setExternalSubmitted(true) }
            );
          }}
          className="space-y-3"
        >
          <input required placeholder="Full name" value={externalForm.name} onChange={(e) => setExternalForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <input required type="email" placeholder="Email" value={externalForm.email} onChange={(e) => setExternalForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <input placeholder="Company (optional)" value={externalForm.company} onChange={(e) => setExternalForm((f) => ({ ...f, company: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <textarea placeholder="What are you building? (optional)" rows={2} value={externalForm.notes} onChange={(e) => setExternalForm((f) => ({ ...f, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <button type="submit" disabled={requestAccess.isPending} className="w-full px-5 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors disabled:opacity-60">
            {requestAccess.isPending ? 'Submitting…' : `Request ${serviceName} docs access`}
          </button>
        </form>
      </div>
    );
  }

  if (status === 'pending' || status === 'in_review') {
    return <GateShell icon={<Clock className="w-8 h-8 text-amber-500" />} title="Your request is under review" body={`A platform admin needs to approve access to ${serviceName} docs before you can view them. You'll be notified once it's decided.`} />;
  }

  if (status === 'rejected') {
    return (
      <GateShell
        icon={<XCircle className="w-8 h-8 text-rose-500" />}
        title="Request not approved"
        body={`Your request for ${serviceName} docs access wasn't approved. If your needs have changed, you can submit a new request.`}
        action={
          <button
            onClick={() => requestAccess.mutate({})}
            disabled={requestAccess.isPending}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {requestAccess.isPending ? 'Submitting…' : 'Request again'}
          </button>
        }
      />
    );
  }

  // status === 'none' — logged in, never requested this resource.
  return (
    <GateShell
      icon={<Lock className="w-8 h-8 text-primary" />}
      title={`${serviceName} docs require approval`}
      body="Submit a request and a platform admin will review it — you'll get access as soon as it's approved."
      action={
        <button
          onClick={() => requestAccess.mutate({})}
          disabled={requestAccess.isPending}
          className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
        >
          {requestAccess.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Request access
        </button>
      }
    />
  );
}

function GateShell({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">{icon}</div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
        {action}
      </div>
    </div>
  );
}
