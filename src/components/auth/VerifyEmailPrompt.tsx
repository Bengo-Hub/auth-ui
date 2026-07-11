'use client';

import { VerifyEmailBanner, type EmailVerificationState } from '@bengo-hub/shared-ui-lib/auth';
import { useVerifyMyEmail } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth-store';

/**
 * Thin app wrapper around the shared VerifyEmailBanner: it feeds the banner the
 * `email_verification` block that auth-api computes on /me (verified, is_placeholder,
 * strict, stage, days_until_disable, wait_seconds) and wires the send/verify actions to
 * the authenticated OTP endpoints.
 *
 * auth-api owns the escalation policy, so this renders the same way in every app.
 */
export function VerifyEmailPrompt() {
  const { user } = useAuthStore();
  const { sendCode, verifyCode } = useVerifyMyEmail();

  const state = (user as unknown as { email_verification?: EmailVerificationState } | null)
    ?.email_verification;

  if (!state || state.verified) return null;

  return (
    <VerifyEmailBanner
      state={state}
      onSendCode={async (email) => {
        await sendCode.mutateAsync(email);
      }}
      onVerifyCode={async (email, code) => {
        await verifyCode.mutateAsync({ email, code });
      }}
    />
  );
}
