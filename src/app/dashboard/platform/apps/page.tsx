'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Check,
    ClipboardCopy,
    Cpu,
    Loader2,
    Plus,
    RefreshCw,
    ShieldOff,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface App {
  id: string;
  name: string;
  description?: string;
  app_type: string;
  client_id: string;
  key_prefix: string;
  scopes?: string[];
  allowed_ips?: string[];
  status: string;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PlatformAppsPage() {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    app_type: 'platform',
    scopes: 's2s:*',
    allowed_ips: '',
    expires_in: '',
  });

  const fetchApps = useCallback(async () => {
    try {
      const res = await apiClient.get<App[]>('/api/v1/admin/apps');
      setApps(Array.isArray(res.data) ? res.data : []);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        app_type: form.app_type,
        scopes: form.scopes.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (form.allowed_ips.trim()) {
        payload.allowed_ips = form.allowed_ips.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (form.expires_in.trim()) {
        payload.expires_in = parseInt(form.expires_in, 10);
      }
      const res = await apiClient.post<{ token: string }>('/api/v1/admin/apps', payload);
      setNewToken(res.data.token);
      setShowCreate(false);
      setForm({ name: '', description: '', app_type: 'platform', scopes: 's2s:*', allowed_ips: '', expires_in: '' });
      fetchApps();
      toast({ title: 'App created', description: 'Save the token — it will not be shown again.' });
    } catch {
      toast({ title: 'Create failed', description: 'Could not create app.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleRotate = async (id: string, name: string) => {
    if (!confirm(`Rotate token for "${name}"? The current token will stop working immediately.`)) return;
    try {
      const res = await apiClient.post<{ token: string }>(`/api/v1/admin/apps/${id}/rotate`);
      setNewToken(res.data.token);
      fetchApps();
      toast({ title: 'Token rotated', description: 'Save the new token — it will not be shown again.' });
    } catch {
      toast({ title: 'Rotate failed', variant: 'destructive' });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiClient.post(`/api/v1/admin/apps/${id}/revoke`);
      setRevokeTarget(null);
      fetchApps();
      toast({ title: 'App revoked' });
    } catch {
      toast({ title: 'Revoke failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/admin/apps/${id}`);
      fetchApps();
      toast({ title: 'App deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const copyToken = () => {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Apps & S2S Keys</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            GitHub-style service-to-service app tokens for platform integrations.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          New App
        </Button>
      </header>

      {/* One-time token banner */}
      {newToken && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">Save this token now — it won&apos;t be shown again</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Copy it and store it securely (e.g. K8s secret, vault). After closing this banner you will only see the prefix.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono break-all border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-200">
              {newToken}
            </code>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-amber-300 shrink-0" onClick={copyToken}>
              {tokenCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setNewToken(null)} className="mt-3 text-amber-600 dark:text-amber-400">
            I&apos;ve saved the token
          </Button>
        </motion.div>
      )}

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create App</h2>
                <p className="text-slate-500 text-sm">Generates a bng_app_* token shown once.</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">App Name *</Label>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Codevertex Platform Services"
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Type</Label>
                <select
                  value={form.app_type}
                  onChange={(e) => setForm((f) => ({ ...f, app_type: e.target.value }))}
                  className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="platform">Platform (cross-tenant S2S)</option>
                  <option value="tenant">Tenant (scoped)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Scopes <span className="font-normal text-slate-400">(comma-separated)</span></Label>
                <Input value={form.scopes} onChange={(e) => setForm((f) => ({ ...f, scopes: e.target.value }))}
                  placeholder="s2s:*, treasury:read"
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Allowed IPs <span className="font-normal text-slate-400">(optional)</span></Label>
                <Input value={form.allowed_ips} onChange={(e) => setForm((f) => ({ ...f, allowed_ips: e.target.value }))}
                  placeholder="10.0.0.0/8, 192.168.1.1"
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expires In <span className="font-normal text-slate-400">(days, 0 = never)</span></Label>
                <Input type="number" min="0" value={form.expires_in} onChange={(e) => setForm((f) => ({ ...f, expires_in: e.target.value }))}
                  placeholder="0"
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description <span className="font-normal text-slate-400">(optional)</span></Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this app for?"
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={creating}
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create App'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}
                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white">
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Apps list */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Platform Apps</h2>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : apps.length === 0 ? (
          <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Cpu className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No apps yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create a platform app to generate a bng_app_* S2S token.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                      app.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Cpu className={`h-5 w-5 ${app.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{app.name}</h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                          app.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                        }`}>
                          {app.status}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                          {app.app_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                        <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{app.key_prefix}...</code>
                        <span>Created {formatDate(app.created_at)}</span>
                        {app.last_used_at && <span>Last used {formatRelative(app.last_used_at)}</span>}
                      </div>
                      {app.scopes && app.scopes.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {app.scopes.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleRotate(app.id, app.name)}
                          className="rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs dark:text-white">
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          Rotate
                        </Button>
                        {revokeTarget === app.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="destructive" size="sm" className="rounded-xl text-xs font-bold"
                              onClick={() => handleRevoke(app.id)}>Confirm</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl text-xs"
                              onClick={() => setRevokeTarget(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon"
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl"
                            onClick={() => setRevokeTarget(app.id)}>
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    <Button variant="ghost" size="icon"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                      onClick={() => handleDelete(app.id, app.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
