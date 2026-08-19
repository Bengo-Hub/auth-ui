'use client';

import { useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useVerifyMyEmail } from '@/hooks/useProfile';
import { VerifyEmailDialog, type EmailVerificationState } from '@bengo-hub/shared-ui-lib/auth';
import { MyEmailAddressesCard } from '@/components/profile/contact-cards';
import { FieldCard } from './field-card';

/**
 * Email Addresses sub-tab — the single primary User.email (verify/replace a
 * placeholder) plus any additional, individually-verified addresses. Split
 * out of the old combined Profile tab into its own sub-tab (Phase 10),
 * mirroring Zoho Accounts' Profile > Email Address page.
 */
export function EmailAddressesTab() {
  const { user } = useAuthStore();
  const { sendCode, verifyCode } = useVerifyMyEmail();
  const [open, setOpen] = useState(false);

  const ev = (user as any)?.email_verification as EmailVerificationState | undefined;
  const email = ev?.email ?? (user as any)?.email ?? '';
  const verified = ev?.verified ?? false;
  const isPlaceholder = ev?.is_placeholder ?? false;

  return (
    <div className="space-y-6 max-w-3xl">
      <FieldCard>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Primary Email Address
              </p>
              <p className="truncate text-sm text-slate-900 dark:text-white">
                {isPlaceholder ? 'No real email on file' : email}
              </p>
            </div>
            {verified ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
              >
                {isPlaceholder ? 'Add email' : 'Verify'}
              </button>
            )}
          </div>

          {open && ev && (
            <VerifyEmailDialog
              state={ev}
              onSendCode={async (e) => { await sendCode.mutateAsync(e); }}
              onVerifyCode={async (e, code) => { await verifyCode.mutateAsync({ email: e, code }); }}
              onVerified={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </FieldCard>

      <FieldCard>
        <MyEmailAddressesCard />
      </FieldCard>
    </div>
  );
}
