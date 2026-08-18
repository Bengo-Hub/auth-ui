'use client';

import { useState } from 'react';
import { Mail, Phone, Plus, Star, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useMyEmails,
  useAddMyEmail,
  useSetPrimaryMyEmail,
  useDeleteMyEmail,
  useMyPhones,
  useAddMyPhone,
  useSetPrimaryMyPhone,
  useDeleteMyPhone,
} from '@/hooks/useProfile';

const rowCls = 'flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3';
const smallBtn = 'shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors';

/**
 * "My Email Addresses" — additional, individually-verified addresses beyond
 * the single primary User.email column (managed by EmailVerificationCard
 * above this one). Mirrors Zoho Accounts' Profile > Email Address page.
 */
export function MyEmailAddressesCard() {
  const { toast } = useToast();
  const { data: emails = [], isLoading } = useMyEmails();
  const { sendCode, verifyCode } = useAddMyEmail();
  const setPrimary = useSetPrimaryMyEmail();
  const remove = useDeleteMyEmail();

  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  function reset() {
    setAdding(false);
    setStep('email');
    setEmail('');
    setCode('');
  }

  async function handleSendCode() {
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Error', description: 'Enter a valid email address.', variant: 'destructive' });
      return;
    }
    try {
      await sendCode.mutateAsync(email.trim());
      setStep('code');
      toast({ title: 'Code sent', description: `Check ${email.trim()} for a 6-digit code.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Failed to send code.', variant: 'destructive' });
    }
  }

  async function handleVerify() {
    if (!code.trim()) return;
    try {
      await verifyCode.mutateAsync({ email: email.trim(), code: code.trim() });
      toast({ title: 'Email added' });
      reset();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Invalid or expired code.', variant: 'destructive' });
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">My Email Addresses</p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add email address
          </button>
        )}
      </div>

      <div className="space-y-2">
        {!isLoading && emails.length === 0 && !adding && (
          <p className="text-xs text-slate-400">No additional email addresses yet.</p>
        )}
        {emails.map((e) => (
          <div key={e.id} className={rowCls}>
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-900 dark:text-white">{e.email}</span>
            {e.is_primary ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <Star className="h-3 w-3 fill-current" /> Primary
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPrimary.mutate(e.id)}
                disabled={setPrimary.isPending}
                className={`${smallBtn} border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800`}
              >
                Make primary
              </button>
            )}
            <button
              type="button"
              onClick={() => remove.mutate(e.id)}
              disabled={remove.isPending}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              aria-label="Remove email address"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {adding && (
          <div className={`${rowCls} flex-col items-stretch gap-2`}>
            {step === 'email' ? (
              <>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button type="button" onClick={reset} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendCode.isPending}
                  className="w-fit rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {sendCode.isPending ? 'Sending…' : 'Send code'}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter the 6-digit code sent to {email}.</p>
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(ev) => setCode(ev.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifyCode.isPending || code.length !== 6}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {verifyCode.isPending ? 'Verifying…' : 'Verify & add'}
                  </button>
                  <button type="button" onClick={reset} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * "My Mobile Numbers" — no verification step: this platform has no SMS-OTP
 * provider wired anywhere, so numbers are unverified contact info only.
 */
export function MyMobileNumbersCard() {
  const { toast } = useToast();
  const { data: phones = [], isLoading } = useMyPhones();
  const addPhone = useAddMyPhone();
  const setPrimary = useSetPrimaryMyPhone();
  const remove = useDeleteMyPhone();

  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState('');

  async function handleAdd() {
    if (!phone.trim()) return;
    try {
      await addPhone.mutateAsync(phone.trim());
      toast({ title: 'Mobile number added' });
      setAdding(false);
      setPhone('');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Failed to add number.', variant: 'destructive' });
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">My Mobile Numbers</p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add mobile number
          </button>
        )}
      </div>

      <div className="space-y-2">
        {!isLoading && phones.length === 0 && !adding && (
          <p className="text-xs text-slate-400">No mobile numbers on file.</p>
        )}
        {phones.map((p) => (
          <div key={p.id} className={rowCls}>
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-900 dark:text-white">{p.phone}</span>
            {p.is_primary ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <Star className="h-3 w-3 fill-current" /> Primary
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPrimary.mutate(p.id)}
                disabled={setPrimary.isPending}
                className={`${smallBtn} border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800`}
              >
                Make primary
              </button>
            )}
            <button
              type="button"
              onClick={() => remove.mutate(p.id)}
              disabled={remove.isPending}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              aria-label="Remove mobile number"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {adding && (
          <div className={rowCls}>
            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="tel"
              autoFocus
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              placeholder="+254 700 000 000"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={addPhone.isPending || !phone.trim()}
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {addPhone.isPending ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setPhone('');
              }}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
