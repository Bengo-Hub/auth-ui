'use client';

import { Suspense, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

import api from '@/lib/api-client';
import { AuthBrandScope } from '@/components/auth/AuthBrand';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DEVELOPER_LOGIN_PATH } from '@/lib/developer-access';

// One request is for one service; auth-api maps each value to a single App scope
// (requestableServices).
const SERVICES = [
  { value: 'treasury', label: 'KRA eTIMS and payments', hint: 'Send invoices to KRA, take M-Pesa and card payments' },
  { value: 'notifications', label: 'Notifications', hint: 'Send SMS, WhatsApp, email and push messages' },
  { value: 'sso', label: 'Sign in with Codevertex', hint: 'Let people sign in to your app with their Codevertex account' },
] as const;

const optionClass = (selected: boolean) =>
  `text-left p-4 rounded-xl border-2 transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`;

function SignInLink() {
  return (
    <>
      Already have developer access?{' '}
      <Link href={DEVELOPER_LOGIN_PATH} className="font-medium text-primary hover:underline">
        Sign in
      </Link>
    </>
  );
}

function ApplyForm() {
  const { toast } = useToast();
  const [service, setService] = useState<(typeof SERVICES)[number]['value']>(SERVICES[0].value);
  const [mode, setMode] = useState<'self_serve' | 'assisted'>('self_serve');
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
    onError: () =>
      toast({ title: 'Request failed', description: 'Please try again in a moment.', variant: 'destructive' }),
  });

  if (submitted) {
    return (
      <AuthShell title="Request sent" below={<SignInLink />}>
        <div className="space-y-4 text-sm">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <p>
            We&apos;ll review it and reply to <span className="font-medium">{requesterEmail}</span>.
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Once approved, you get an email with your consumer key and a link to set your password.</li>
            <li>Sign in and set up an authenticator app. Developer accounts always use one.</li>
            <li>Open your sandbox app and generate a consumer secret. It is shown once.</li>
            <li>Test in the sandbox for free, then request go-live.</li>
          </ol>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title="Request developer access"
      subtitle="Pick the API you want. You start in a free sandbox and go live after a quick review."
      below={<SignInLink />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label>Which API?</Label>
          <div className="grid gap-3">
            {SERVICES.map((s) => (
              <button key={s.value} type="button" onClick={() => setService(s.value)} className={optionClass(service === s.value)}>
                <div className="font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requester_name">Your name</Label>
            <Input id="requester_name" required autoComplete="name" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requester_email">Work email</Label>
            <Input id="requester_email" type="email" required autoComplete="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company (optional)</Label>
            <Input id="company_name" autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requester_phone">Phone (optional)</Label>
            <Input id="requester_phone" type="tel" autoComplete="tel" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Who builds the integration?</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode('self_serve')} className={optionClass(mode === 'self_serve')}>
              <div className="font-semibold">My developers</div>
              <div className="text-xs text-muted-foreground">No setup fee. You pay only for API usage.</div>
            </button>
            <button type="button" onClick={() => setMode('assisted')} className={optionClass(mode === 'assisted')}>
              <div className="font-semibold">Your team</div>
              <div className="text-xs text-muted-foreground">We set it up for you. One-time fee from KES 35,000.</div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">What are you building? (optional)</Label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Your system, number of branches, expected monthly volume"
          />
        </div>

        <Button type="submit" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Send request
        </Button>
      </form>
    </AuthShell>
  );
}

export default function DeveloperApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/40" />}>
      <AuthBrandScope>
        <ApplyForm />
      </AuthBrandScope>
    </Suspense>
  );
}
