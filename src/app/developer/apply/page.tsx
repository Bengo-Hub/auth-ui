'use client';

import { Suspense, useState, type ComponentType, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { BellRing, Check, Code2, Handshake, KeyRound, Loader2, Receipt, Send } from 'lucide-react';

import api from '@/lib/api-client';
import { AuthBrandScope } from '@/components/auth/AuthBrand';
import { AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { DeveloperPanel } from '@/components/auth/DeveloperPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DEVELOPER_LOGIN_PATH } from '@/lib/developer-access';

// One request is for one service; auth-api maps each value to a single App scope
// (requestableServices).
const SERVICES = [
  { value: 'treasury', label: 'KRA eTIMS and payments', hint: 'Send invoices to KRA, take M-Pesa and card payments', icon: Receipt },
  { value: 'notifications', label: 'Notifications', hint: 'Send SMS, WhatsApp, email and push messages', icon: BellRing },
  { value: 'sso', label: 'Sign in with Codevertex', hint: 'Let people sign in to your app with their Codevertex account', icon: KeyRound },
] as const;

type ServiceValue = (typeof SERVICES)[number]['value'];
type Mode = 'self_serve' | 'assisted';

const MODES: { value: Mode; label: string; hint: string; price: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: 'self_serve', label: 'My own developers', hint: 'You build it against our sandbox and docs.', price: 'No setup fee. You pay only for API usage.', icon: Code2 },
  { value: 'assisted', label: 'The Codevertex team', hint: 'We build and test the integration with you.', price: 'One-time fee from KES 35,000.', icon: Handshake },
];

const ease = [0.22, 1, 0.36, 1] as const;

function SignInLink() {
  return (
    <>
      Already have developer access?{' '}
      <Link href={DEVELOPER_LOGIN_PATH} className="font-medium text-primary underline-offset-4 hover:underline">
        Sign in
      </Link>
    </>
  );
}

/** One numbered part of the request. The rail joins the parts into a single sequence. */
function Step({ n, title, hint, last = false, children }: { n: number; title: string; hint?: string; last?: boolean; children: ReactNode }) {
  return (
    <fieldset className="relative grid min-w-0 grid-cols-[2rem_1fr] gap-x-4 sm:gap-x-5">
      <legend className="sr-only">{title}</legend>
      <div className="relative flex justify-center" aria-hidden>
        <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-card text-sm font-semibold text-primary shadow-soft">
          {n}
        </span>
        {!last && <span className="absolute bottom-[-2.25rem] top-9 w-px bg-border" />}
      </div>
      <div className="min-w-0 pb-1">
        <p className="pt-1 text-base font-semibold text-foreground" aria-hidden>{title}</p>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </fieldset>
  );
}

/** A radio input drawn as a card: the whole card is the label, the native radio keeps keyboard use. */
function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  icon: Icon,
  title,
  body,
  detail,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  detail?: string;
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer gap-3.5 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow,background-color] duration-200',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
        checked ? 'border-primary bg-primary/[0.04] shadow-soft' : 'border-border hover:border-primary/40',
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-200',
          checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 pr-7">
        <span className="block text-[0.95rem] font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{body}</span>
        {detail && <span className="mt-2 block text-xs font-medium text-foreground/80">{detail}</span>}
      </span>
      <span
        className={cn(
          'absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border transition-colors duration-200',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
        )}
        aria-hidden
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span key="tick" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.18, ease }}>
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </label>
  );
}

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-foreground">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = 'h-12 rounded-xl bg-card text-base sm:text-[0.95rem]';

function ApplyForm() {
  const [service, setService] = useState<ServiceValue>(SERVICES[0].value);
  const [mode, setMode] = useState<Mode>('self_serve');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: async () =>
      api.post('/api/v1/integration-requests', {
        request_type: `service_access_${service}`,
        service,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone,
        company_name: companyName,
        integration_mode: mode,
        notes,
      }),
    onSuccess: () => setSubmitted(true),
  });

  const chosen = SERVICES.find((s) => s.value === service) ?? SERVICES[0];

  if (submitted) {
    return (
      <AuthShell
        title="Request sent"
        subtitle={<>We will review your request for {chosen.label} and reply to <span className="font-medium text-foreground">{requesterEmail}</span>.</>}
        below={<SignInLink />}
        aside={<DeveloperPanel />}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
          <ol className="mt-4 space-y-0">
            {[
              'Once approved, you get an email with your consumer key and a link to set your password.',
              'Sign in and set up an authenticator app. Developer accounts always use one.',
              'Open your sandbox app and generate a consumer secret. It is shown once.',
              'Test in the sandbox for free, then request go-live.',
            ].map((line, i, all) => (
              <li key={line} className="relative grid grid-cols-[2rem_1fr] gap-x-4 pb-5 last:pb-0">
                <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-card text-sm font-semibold text-primary" aria-hidden>
                  {i + 1}
                </span>
                {i < all.length - 1 && <span className="absolute bottom-0 left-4 top-8 w-px bg-border" aria-hidden />}
                <p className="pt-1 text-[0.95rem] leading-relaxed text-foreground/90">{line}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title="Request developer access"
      subtitle="Tell us which API you need and who is building with it. You start in a free sandbox and go live after a short review."
      below={<SignInLink />}
      aside={<DeveloperPanel />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-9"
      >
        <Step n={1} title="Which API do you need?" hint="One request covers one API. You can ask for more later from the console.">
          <div className="grid gap-3">
            {SERVICES.map((s) => (
              <ChoiceCard
                key={s.value}
                name="service"
                value={s.value}
                checked={service === s.value}
                onSelect={() => setService(s.value)}
                icon={s.icon}
                title={s.label}
                body={s.hint}
              />
            ))}
          </div>
        </Step>

        <Step n={2} title="Who builds the integration?">
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <ChoiceCard
                key={m.value}
                name="integration_mode"
                value={m.value}
                checked={mode === m.value}
                onSelect={() => setMode(m.value)}
                icon={m.icon}
                title={m.label}
                body={m.hint}
                detail={m.price}
              />
            ))}
          </div>
        </Step>

        <Step n={3} title="Your details" hint="We send your consumer key and sign-in link to this email.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="requester_name" label="Your name">
              <Input id="requester_name" required autoComplete="name" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className={inputClass} />
            </Field>
            <Field id="requester_email" label="Work email">
              <Input id="requester_email" type="email" required autoComplete="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field id="company_name" label="Company" optional>
              <Input id="company_name" autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </Field>
            <Field id="requester_phone" label="Phone" optional>
              <Input id="requester_phone" type="tel" autoComplete="tel" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} className={inputClass} placeholder="0712 345 678" />
            </Field>
          </div>
        </Step>

        <Step n={4} title="What are you building?" last>
          <Field id="notes" label="A few lines about your system" optional>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-brand-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emphasis focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-[0.95rem]"
              placeholder="Your system, number of branches, expected monthly volume"
            />
          </Field>
        </Step>

        <div className="space-y-4 sm:pl-[3.25rem]">
          {submit.isError && (
            <AuthNotice>The request did not go through. Check your connection and send it again.</AuthNotice>
          )}
          <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Send className="mr-2 h-4 w-4" aria-hidden />}
            {submit.isPending ? 'Sending request' : 'Send request'}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function DeveloperApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100dvh-4rem)] bg-paper" />}>
      <AuthBrandScope>
        <MotionConfig reducedMotion="user">
          <ApplyForm />
        </MotionConfig>
      </AuthBrandScope>
    </Suspense>
  );
}
