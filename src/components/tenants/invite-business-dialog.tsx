'use client';

import { useState } from 'react';
import { Copy, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';

/** The apps a business can be invited to (auth-api BUSINESS_INVITE_APP_URLS). */
const APPS = [{ id: 'marketflow', label: 'MarketFlow', useCases: [{ id: 'fbo', label: 'Forever Business Owner' }, { id: '', label: 'Any other business' }] }];

/**
 * Platform owners invite a NEW business to an app (auth-api POST /admin/business-invites). The
 * business gets an email with a 7-day link; signing up with it creates the organisation active at
 * once (no review), then the app's onboarding and dashboard.
 */
export function InviteBusinessDialog() {
  const { toast } = useToast();
  const isPlatformOwner = !!useAuthStore((s) => s.user?.is_platform_owner);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [app, setApp] = useState(APPS[0].id);
  const [useCase, setUseCase] = useState(APPS[0].useCases[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  if (!isPlatformOwner) return null;

  const reset = () => {
    setEmail('');
    setName('');
    setOrgName('');
    setLink(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/api/v1/admin/business-invites', { email, name, org_name: orgName, app, use_case: useCase || undefined });
      setLink(data.link);
      toast({ title: 'Invitation sent', description: `${data.email} has a link to set up ${data.org_name}.` });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not send the invitation');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link copied' });
    } catch {
      toast({ title: 'Copy the link from the box', variant: 'destructive' });
    }
  };

  const appDef = APPS.find((a) => a.id === app) ?? APPS[0];
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold">
          <Send className="h-5 w-5 mr-2" /> Invite a business
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invite a business</DialogTitle>
          <DialogDescription>They create their own account with this email, and their organisation is ready without review.</DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm">The invitation email is on its way. You can also share this link; it works for 7 days and only for that email.</p>
            <div className="flex gap-2">
              <Input id="invite-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              <Button type="button" variant="outline" onClick={copy} aria-label="Copy the invitation link"><Copy className="h-4 w-4" /></Button>
            </div>
            <Button type="button" className="w-full" onClick={reset}>Invite another business</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 pt-2">
            {error && <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="invite-email">Owner's email *</Label>
              <Input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@business.co.ke" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Owner's name</Label>
              <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wanjiru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-org">Business name *</Label>
              <Input id="invite-org" required maxLength={120} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Shea Glow" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-app">App</Label>
                <select id="invite-app" value={app} onChange={(e) => setApp(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                  {APPS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-type">Business type</Label>
                <select id="invite-type" value={useCase} onChange={(e) => setUseCase(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                  {appDef.useCases.map((u) => <option key={u.id || 'any'} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={busy || !email || !orgName} className="w-full h-12 rounded-xl text-white font-bold">
              {busy ? <Loader2 className="animate-spin" /> : 'Send invitation'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
