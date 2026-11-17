'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTenants } from '@/hooks/use-dashboard-api';
import { Cpu, Loader2, X } from 'lucide-react';
import { INTERNAL_SERVICE_KEY_SCOPE } from './apps-columns';

const SCOPE_PRESETS = ['s2s:*', INTERNAL_SERVICE_KEY_SCOPE, 'etims:read', 'etims:write', 'treasury:read'];

// Scopes a tenant app can hold (auth-api allowedTenantScopePrefixes), one service per app.
const TENANT_SCOPE_PRESETS = [
  'etims:read', 'etims:write', 'notifications:read', 'notifications:write', 'sso:read', 'subscriptions:read',
];

function isPlatformOnlyScope(s: string) {
  return s === INTERNAL_SERVICE_KEY_SCOPE || s === 'admin' || s === 'auth.admin' || s === 's2s' || s.startsWith('s2s:') || s.startsWith('s2s.');
}

// Services a tenant app can be scoped to, one per app (auth-api validateTenantAppScopes).
// "Treasury API" submits etims:* because the external eTIMS routes check those scopes.
const TENANT_SERVICES = [
  { value: 'etims', label: 'Treasury API', hint: 'Invoicing, payments, KRA eTIMS' },
  { value: 'notifications', label: 'Notifications API', hint: 'Email, SMS, push, WhatsApp' },
  { value: 'sso', label: 'SSO / Auth API', hint: 'Identity, tenant, user lookups' },
  { value: 'subscriptions', label: 'Subscriptions API', hint: 'Plans, pricing, entitlements' },
] as const;

export interface CreateAppPayload {
  name: string;
  description?: string;
  app_type: string;
  tenant_id?: string;
  scopes: string[];
  allowed_ips?: string[];
  expires_in?: number;
}

// The same services in the words a developer-only account sees on its request form and docs.
const DEVELOPER_SERVICE_LABELS: Record<string, { label: string; hint: string }> = {
  etims: { label: 'KRA eTIMS and payments', hint: 'Send invoices to KRA, take M-Pesa and card payments' },
  notifications: { label: 'Notifications', hint: 'SMS, WhatsApp, email and push messages' },
  sso: { label: 'Sign in with Codevertex', hint: 'People sign in to your app with their Codevertex account' },
  subscriptions: { label: 'Plans and pricing', hint: 'Read Codevertex plans and what each one includes' },
};

export interface CreateAppFormProps {
  isPlatformOwner: boolean;
  /** Account holds only developer roles: plain service names and integration-shaped examples. */
  developerOnly?: boolean;
  creating: boolean;
  onCreate: (payload: CreateAppPayload) => Promise<void>;
  onCancel: () => void;
}

/** Platform owners get the full form; tenant developers pick a service and access level. */
export function CreateAppForm({ isPlatformOwner, developerOnly = false, creating, onCreate, onCancel }: CreateAppFormProps) {
  return isPlatformOwner ? (
    <PlatformCreateForm creating={creating} onCreate={onCreate} onCancel={onCancel} />
  ) : (
    <TenantCreateForm developerOnly={developerOnly} creating={creating} onCreate={onCreate} onCancel={onCancel} />
  );
}

function TenantCreateForm({ developerOnly = false, creating, onCreate, onCancel }: Omit<CreateAppFormProps, 'isPlatformOwner'>) {
  const [name, setName] = useState('');
  const [service, setService] = useState<string>(TENANT_SERVICES[0].value);
  const [readWrite, setReadWrite] = useState<'read' | 'write'>('read');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Every route needs read; write adds mutations on top, so a write app carries both.
    const scopes = readWrite === 'write' ? [`${service}:read`, `${service}:write`] : [`${service}:read`];
    await onCreate({ name, app_type: 'tenant', scopes });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
      <FormHeader
        title={developerOnly ? 'New app' : 'Create App'}
        subtitle={
          developerOnly
            ? 'You get a consumer key now and generate the secret from the app list. Each app talks to one API and starts in the sandbox.'
            : 'Issues a consumer key and secret (OAuth client credentials) plus a legacy API key, scoped to one service.'
        }
        onCancel={onCancel}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tenant-app-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">{developerOnly ? 'App name' : 'App Name *'}</Label>
            <Input
              id="tenant-app-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={developerOnly ? 'Main branch POS to eTIMS' : 'My Integration App'}
              className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            {developerOnly && <p className="text-xs text-slate-500 dark:text-slate-400">Name it after the system or site that will use it, so you can tell apps apart later.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-app-service" className="text-sm font-bold text-slate-700 dark:text-slate-300">{developerOnly ? 'API' : 'Service'}</Label>
            <select id="tenant-app-service" value={service} onChange={(e) => setService(e.target.value)} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              {TENANT_SERVICES.map((s) => {
                const shown = developerOnly ? DEVELOPER_SERVICE_LABELS[s.value] ?? s : s;
                return <option key={s.value} value={s.value}>{shown.label}: {shown.hint}</option>;
              })}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Access</Label>
            <div className="flex gap-2">
              {(['read', 'write'] as const).map((rw) => (
                <button key={rw} type="button" onClick={() => setReadWrite(rw)} className={`px-4 py-2.5 rounded-full text-xs font-mono font-bold border transition-colors capitalize ${readWrite === rw ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {rw}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              {developerOnly
                ? 'Read lets your app look things up. Write also lets it create records, such as sending an invoice to KRA. Request go-live from the app list when your sandbox tests pass.'
                : 'Each app works with one service. New apps start in sandbox; request go-live when you are ready.'}
            </p>
          </div>
        </div>
        <FormActions creating={creating} onCancel={onCancel} label="Create App" />
      </form>
    </motion.div>
  );
}

function PlatformCreateForm({ creating, onCreate, onCancel }: Omit<CreateAppFormProps, 'isPlatformOwner'>) {
  const { data: tenants } = useTenants();
  const [form, setForm] = useState({
    name: '', description: '', app_type: 'platform', tenant_id: '', scopes: 's2s:*', allowed_ips: '', expires_in: '',
  });

  const activeScopes = form.scopes.split(',').map((s) => s.trim()).filter(Boolean);
  const toggleScope = (scope: string) => {
    const next = activeScopes.includes(scope) ? activeScopes.filter((s) => s !== scope) : [...activeScopes, scope];
    setForm((f) => ({ ...f, scopes: next.join(', ') }));
  };
  const scopePresets = form.app_type === 'tenant' ? TENANT_SCOPE_PRESETS : SCOPE_PRESETS;
  // Switching to "Tenant (scoped)" drops platform-only scopes already in the field (the default
  // is s2s:*), which the server would otherwise reject with a 400.
  const setAppType = (appType: string) =>
    setForm((f) => ({
      ...f,
      app_type: appType,
      scopes: appType === 'tenant'
        ? f.scopes.split(',').map((s) => s.trim()).filter((s) => s && !isPlatformOnlyScope(s)).join(', ')
        : f.scopes,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      name: form.name,
      description: form.description || undefined,
      app_type: form.app_type,
      tenant_id: form.app_type === 'tenant' && form.tenant_id ? form.tenant_id : undefined,
      scopes: activeScopes,
      allowed_ips: form.allowed_ips.trim() ? form.allowed_ips.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      expires_in: form.expires_in.trim() ? parseInt(form.expires_in, 10) : undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
      <FormHeader title="Create App" subtitle="Platform apps get an API key. Tenant apps also get a consumer key and secret. Every secret is shown once; tenant apps start in sandbox." onCancel={onCancel} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">App Name *</Label>
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Codevertex Platform Services" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Type</Label>
            <select value={form.app_type} onChange={(e) => setAppType(e.target.value)} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              <option value="platform">Platform (cross-tenant S2S)</option>
              <option value="tenant">Tenant (scoped)</option>
            </select>
          </div>
          {form.app_type === 'tenant' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tenant <span className="font-normal text-slate-400">(optional, defaults to your own)</span>
              </Label>
              <select value={form.tenant_id} onChange={(e) => setForm((f) => ({ ...f, tenant_id: e.target.value }))} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                <option value="">My own tenant</option>
                {(tenants ?? []).map((t: { id: string; name: string; slug: string }) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Scopes <span className="font-normal text-slate-400">(comma-separated)</span></Label>
            <Input value={form.scopes} onChange={(e) => setForm((f) => ({ ...f, scopes: e.target.value }))} placeholder="s2s:*, treasury:read" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
            <div className="flex gap-2 flex-wrap pt-1">
              {scopePresets.map((s) => (
                <button key={s} type="button" onClick={() => toggleScope(s)} className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${activeScopes.includes(s) ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Allowed IPs <span className="font-normal text-slate-400">(optional)</span></Label>
            <Input value={form.allowed_ips} onChange={(e) => setForm((f) => ({ ...f, allowed_ips: e.target.value }))} placeholder="41.90.12.0/24, 102.68.1.5" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expires In <span className="font-normal text-slate-400">(days, 0 = never)</span></Label>
            <Input type="number" min="0" value={form.expires_in} onChange={(e) => setForm((f) => ({ ...f, expires_in: e.target.value }))} placeholder="0" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description <span className="font-normal text-slate-400">(optional)</span></Label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What is this app for?" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
        </div>
        <FormActions creating={creating} onCancel={onCancel} label="Create App" />
      </form>
    </motion.div>
  );
}

function FormHeader({ title, subtitle, onCancel }: { title: string; subtitle: string; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Cpu className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-xl">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}

function FormActions({ creating, onCancel, label }: { creating: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <Button type="submit" disabled={creating} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
        {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : label}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white">
        Cancel
      </Button>
    </div>
  );
}
