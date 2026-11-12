'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { MFA_COPY, signInAfterEnrollment } from '@/lib/mfa-enrollment';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Loader2,
  Shield,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type SetupStep = 'scan' | 'verify' | 'backup' | 'complete';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isPlatformOwner, isLoading: authLoading } = useAuth();
  // The shared public demo tenant's credentials are used by every visitor —
  // enrolling 2FA here would lock everyone else out. Server-side enforced too
  // (demoSelfServiceBlocked in auth-api), this just avoids showing the wizard.
  const demoRestricted = !!user?.is_demo && !isPlatformOwner;
  const clearAuth = useAuthStore((s) => s.logout);
  // Required mode: the organisation's MFA policy sent the person here from sign-in. Read from the
  // address bar once mounted (no Suspense boundary needed for search params).
  const [requiredParams, setRequiredParams] = useState<{ required: boolean; next: string | null }>({ required: false, next: null });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequiredParams({ required: params.get('required') === '1', next: params.get('next') });
  }, []);
  const enrollmentRequired = requiredParams.required || !!user?.mfa_enrollment_required;
  const [finishing, setFinishing] = useState(false);
  const [step, setStep] = useState<SetupStep>('scan');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: TOTP data
  const [secret, setSecret] = useState('');
  const [provisioningUrl, setProvisioningUrl] = useState('');

  // Step 2: Verification
  const [verificationCode, setVerificationCode] = useState('');

  // Step 3: Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  // Shown on the last step when no new backup codes were made (the account keeps earlier ones).
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // An authenticator is already set up: replacing it needs its current code (auth-api answers 409
  // authenticator_exists without one, and always for an enrolment-only session).
  const [replacing, setReplacing] = useState(false);
  const [currentCode, setCurrentCode] = useState('');

  // Step 1: Start TOTP enrollment
  const startSetup = useCallback(async (current?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/v1/auth/mfa/totp/start', current ? { current_code: current } : undefined);
      setSecret(response.data.Secret || response.data.secret);
      setProvisioningUrl(response.data.Provisioning || response.data.provisioning);
      setReplacing(false);
      setStep('scan');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setReplacing(true);
      } else if (status === 401 && current) {
        setError('That code is not right. Enter the current code from your authenticator app.');
      } else {
        setError(err.message || 'Failed to start 2FA setup');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount, unless this session belongs to the restricted demo account. Once only:
  // every start makes a new secret on the server, so a second start (a token refresh flipping the
  // loading flag) would silently invalidate the QR code already scanned.
  const started = useRef(false);
  useEffect(() => {
    if (authLoading || demoRestricted || started.current) return;
    started.current = true;
    startSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, demoRestricted]);

  // Step 2: Confirm TOTP code
  const confirmCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setIsLoading(true);
    setError(null);
    // Two calls with their own failures: only a refused confirm is a wrong code. Reporting every
    // failure as "Invalid verification code" made a successful setup look rejected (2026-11-12:
    // the authenticator was on, but the backup code step answered 409 backup_codes_exist).
    try {
      await apiClient.post('/api/v1/auth/mfa/totp/confirm', {
        code: verificationCode,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      setError(
        status === 401 || status === 400
          ? 'That code is not right. Use the newest code for this account in your authenticator app.'
          : 'We could not check the code right now. Please try again in a moment.',
      );
      setIsLoading(false);
      return;
    }
    // The authenticator is on from here, whatever happens to the backup codes.
    queryClient.invalidateQueries({ queryKey: ['me'] });
    try {
      const backupResponse = await apiClient.post('/api/v1/auth/mfa/backup-codes/regenerate', {
        count: 10,
      });
      setBackupCodes(backupResponse.data.backup_codes);
    } catch (err: any) {
      // The account already holds unused backup codes from an earlier setup, which a setup-only
      // sign-in may not replace: keep them, and say so instead of reporting a failure.
      setBackupCodes([]);
      setBackupNotice(
        err?.response?.status === 409
          ? 'Your authenticator app is set up. You already have backup codes from an earlier setup; they still work. You can replace them after you sign in again.'
          : 'Your authenticator app is set up, but we could not make backup codes. You can make them after you sign in again.',
      );
    }
    setStep('backup');
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
    } catch {
      // Clipboard API not available
    }
  };

  // After a required setup the session is still enrolment-only: sign out and go back to sign-in,
  // where the new code gives a full session.
  const finishRequiredSetup = async () => {
    setFinishing(true);
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Signing in again replaces the session either way.
    }
    queryClient.clear();
    clearAuth();
    window.location.href = signInAfterEnrollment(requiredParams.next, MFA_COPY.enrolledMessage);
  };

  const downloadBackupCodes = () => {
    const content = [
      'Codevertex Identity Platform - Backup Recovery Codes',
      '=====================================================',
      '',
      'Save these codes in a safe place. Each code can only be used once.',
      '',
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codevertex-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (demoRestricted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/profile?tab=security"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Security
        </Link>
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <Shield className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2FA setup is disabled for this account</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            This is a shared public demo login. Enrolling 2FA here would lock out every other visitor
            using the same credentials. A platform administrator can enforce 2FA on it from the Users admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {!enrollmentRequired && (
          <Link
            href="/dashboard/security"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Security
          </Link>
        )}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          {enrollmentRequired ? MFA_COPY.enrollTitle : 'Set Up Two-Factor Authentication'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Protect your account with an authenticator app like Google Authenticator, Authy, or 1Password.
        </p>
        {enrollmentRequired && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{MFA_COPY.enrollBody}</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-10">
        {(['scan', 'verify', 'backup'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s
                  ? 'bg-primary text-white'
                  : ['verify', 'backup', 'complete'].indexOf(step) > ['scan', 'verify', 'backup'].indexOf(s)
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {['verify', 'backup', 'complete'].indexOf(step) > ['scan', 'verify', 'backup'].indexOf(s) ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${
              step === s ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
            }`}>
              {s === 'scan' ? 'Scan QR Code' : s === 'verify' ? 'Verify Code' : 'Backup Codes'}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
          {error}
        </div>
      )}

      {/* An authenticator is already set up: prove it before replacing it. */}
      {step === 'scan' && replacing && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">An authenticator app is already set up</h2>
          {enrollmentRequired ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in again with your password and the code from that app. If you lost the phone it was on, ask your
              platform administrator to reset your authenticator.
            </p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (currentCode.trim().length === 6) void startSetup(currentCode.trim());
              }}
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                To replace it, enter the current 6-digit code from that app. Lost the phone? Ask your platform
                administrator to reset your authenticator.
              </p>
              <div className="space-y-2">
                <Label htmlFor="current-totp">Current code</Label>
                <Input
                  id="current-totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button type="submit" disabled={isLoading || currentCode.trim().length !== 6}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Step 1: Scan QR Code */}
      {step === 'scan' && !replacing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Scan with your authenticator app
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Open your authenticator app and scan this QR code
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : provisioningUrl ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <QRCodeSVG
                    value={provisioningUrl}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>

                <div className="w-full">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Can&apos;t scan? Enter this key manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 rounded-xl h-11 w-11"
                      onClick={() => copyToClipboard(secret, 'secret')}
                    >
                      {copiedSecret ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClipboardCopy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Failed to generate QR code.{' '}
                <button onClick={() => void startSetup()} className="text-primary font-medium hover:underline">
                  Try again
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep('verify')}
              disabled={!provisioningUrl}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              I&apos;ve scanned the code
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Verify Code */}
      {step === 'verify' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enter verification code
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>

            <div className="max-w-xs mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  6-Digit Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setVerificationCode(val);
                  }}
                  className="h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && verificationCode.length === 6) {
                      confirmCode();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setStep('scan');
                setError(null);
              }}
              className="h-12 px-6 rounded-xl font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={confirmCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Enable
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'backup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Two-factor authentication enabled!
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {backupCodes.length > 0 ? 'Save these backup codes in a safe place' : 'Sign in again with the code from your authenticator app'}
                </p>
              </div>
            </div>

            {backupNotice && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300">{backupNotice}</p>
              </div>
            )}

            {backupCodes.length > 0 && (
            <>
            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/30">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                Each backup code can only be used once. Store them securely, you won&apos;t be able to see them again.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                className="flex-1 h-11 rounded-xl font-medium"
              >
                {copiedBackup ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1 h-11 rounded-xl font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            </>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => (enrollmentRequired ? finishRequiredSetup() : router.push('/dashboard/security'))}
              disabled={finishing}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {finishing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {enrollmentRequired ? MFA_COPY.enrollDone : 'Done'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
