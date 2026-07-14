'use client';

import { AlertTriangle, ArrowRight, Building2, Loader2, LogOut, X } from 'lucide-react';

export interface TenantSuggestion {
  id: string;
  name: string;
  slug: string;
}

interface WrongOrganisationDialogProps {
  requestedTenant: string;
  tenants: TenantSuggestion[];
  /** Called with the chosen slug. The caller continues the sign-in without losing state. */
  onSelect: (slug: string) => void;
  onClose?: () => void;
  /** Shown while a selection is being processed (e.g. login resubmitting). */
  busySlug?: string | null;
  /** Optional "sign in with a different account" action (session-based picker). */
  onUseDifferentAccount?: () => void;
  /** Footer hint under the org list. */
  hint?: string;
}

/**
 * The shared "Wrong Organisation" picker used by both the login form (credential
 * mismatch) and the /select-organisation page (session mismatch during an SSO
 * authorize flow). Selecting an organisation must NEVER restart the flow from
 * scratch — the caller keeps its state (credentials / authorize URL) and simply
 * re-targets the chosen organisation.
 */
export function WrongOrganisationDialog({
  requestedTenant,
  tenants,
  onSelect,
  onClose,
  busySlug,
  onUseDifferentAccount,
  hint,
}: WrongOrganisationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Wrong Organisation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your account does not belong to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {requestedTenant}
              </span>
              . Continue with one of your organisations below — no need to sign in again.
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {tenants.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Your account has no active organisations. Contact your administrator or sign in
              with a different account.
            </p>
          ) : (
            tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => onSelect(tenant.slug)}
                disabled={!!busySlug}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group text-left disabled:opacity-60 disabled:cursor-wait"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {tenant.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{tenant.slug}</p>
                </div>
                {busySlug === tenant.slug ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                )}
              </button>
            ))
          )}
        </div>

        {onUseDifferentAccount && (
          <button
            onClick={onUseDifferentAccount}
            disabled={!!busySlug}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Use a different account
          </button>
        )}

        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          {hint ?? "We'll take you straight into the organisation you select."}
        </p>
      </div>
    </div>
  );
}
