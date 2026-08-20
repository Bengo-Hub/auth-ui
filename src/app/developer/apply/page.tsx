'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { CheckCircle2, Code2, Loader2, Send } from 'lucide-react';

import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Every requestable service maps to exactly one App scope prefix on the backend
// (see auth-api's requestableServices) — a request is always for ONE service, never a
// platform-wide grant, matching the same one-service-per-app rule the self-serve Apps page
// already enforces for logged-in tenant developers.
const SERVICES = [
  { value: 'treasury', label: 'Treasury API', hint: 'Invoicing, payments, KRA eTIMS fiscalization' },
  { value: 'notifications', label: 'Notifications API', hint: 'Email, SMS, push, WhatsApp messaging' },
  { value: 'sso', label: 'SSO / Auth API', hint: '"Sign in with Codevertex" for your own app' },
] as const;

export default function DeveloperApplyPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Request sent</h1>
          <p className="text-muted-foreground">
            Our team will review your request and follow up by email at{' '}
            <span className="font-medium">{requesterEmail}</span>. A self-serve request typically
            gets a sandbox credential provisioned automatically once approved.
          </p>
          <Link href="/" className="inline-block">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Code2 className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Apply for API access</h1>
          <p className="text-muted-foreground">
            Pick one service below to get started. Every credential is scoped to that one service
            only — never a platform-wide grant.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
          className="space-y-6 bg-card border rounded-2xl p-8 shadow-sm"
        >
          <div className="space-y-2">
            <Label>Which service do you want access to?</Label>
            <div className="grid gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setService(s.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    service === s.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requester_name">Your name</Label>
              <Input
                id="requester_name"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester_email">Email</Label>
              <Input
                id="requester_email"
                type="email"
                required
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester_phone">Phone (optional)</Label>
              <Input
                id="requester_phone"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company (optional)</Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>How would you like to integrate?</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('self_serve')}
                className={`text-left p-4 rounded-xl border-2 transition-colors ${
                  mode === 'self_serve' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="font-semibold">Self-serve</div>
                <div className="text-xs text-muted-foreground">
                  You have your own developers. No integration fee.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('assisted')}
                className={`text-left p-4 rounded-xl border-2 transition-colors ${
                  mode === 'assisted' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="font-semibold">Assisted</div>
                <div className="text-xs text-muted-foreground">
                  Codevertex&apos;s team sets it up for you. A one-time fee applies.
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anything else we should know? (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What are you building, expected volume, timeline, etc."
            />
          </div>

          <Button type="submit" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit request
          </Button>
        </form>
      </div>
    </div>
  );
}
