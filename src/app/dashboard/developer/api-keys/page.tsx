'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import apiClient from '@/lib/api-client';
import { AlertTriangle, Check, ClipboardCopy, Key, Loader2, Plus } from 'lucide-react';
import { buildAPIKeyColumns, type APIKey } from './api-keys-columns';

/** Extracted from developer/page.tsx's inline APIKeySection (Phase 11) into
 * its own route, rebuilt on DataTable. CRUD logic unchanged. */
export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdKeyCopied, setCreatedKeyCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState('');
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState('');
  const [newKeyAllowedIPs, setNewKeyAllowedIPs] = useState('');

  const fetchKeys = useCallback(async () => {
    try {
      const response = await apiClient.get<APIKey[]>('/api/v1/admin/api-keys');
      setKeys(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload: Record<string, unknown> = { name: newKeyName };
      if (newKeyScopes.trim()) payload.scopes = newKeyScopes.split(',').map((s) => s.trim()).filter(Boolean);
      if (newKeyExpiresIn.trim()) payload.expires_in = parseInt(newKeyExpiresIn, 10);
      if (newKeyAllowedIPs.trim()) payload.allowed_ips = newKeyAllowedIPs.split(',').map((s) => s.trim()).filter(Boolean);

      const response = await apiClient.post<{ key: string }>('/api/v1/admin/api-keys', payload);
      setCreatedKey(response.data.key);
      setNewKeyName(''); setNewKeyScopes(''); setNewKeyExpiresIn(''); setNewKeyAllowedIPs('');
      setShowCreateForm(false);
      fetchKeys();
    } catch (err) {
      console.error('Failed to create API key', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setIsRevoking(true);
    try {
      await apiClient.delete(`/api/v1/admin/api-keys/${id}`);
      setRevokeTarget(null);
      fetchKeys();
    } catch (err) {
      console.error('Failed to revoke API key', err);
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = useMemo(
    () => buildAPIKeyColumns({ copiedId, revokeTarget, isRevoking, onCopy: copyToClipboard, onSetRevokeTarget: setRevokeTarget, onRevoke: handleRevokeKey }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [copiedId, revokeTarget, isRevoking],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">API Keys</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate keys for service-to-service authentication.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 shrink-0">
          <Plus className="h-5 w-5 mr-2" /> Create API Key
        </Button>
      </header>

      {createdKey && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">Save your API key now</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">This is the only time your full API key will be shown.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono break-all border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-200">{createdKey}</code>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-amber-300 dark:border-amber-700" onClick={() => { navigator.clipboard.writeText(createdKey); setCreatedKeyCopied(true); setTimeout(() => setCreatedKeyCopied(false), 2000); }}>
              {createdKeyCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCreatedKey(null)} className="mt-3 text-amber-600 dark:text-amber-400">I&apos;ve saved my key</Button>
        </motion.div>
      )}

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create API Key</h2>
              <p className="text-slate-500 dark:text-slate-400">Generate a key for service-to-service authentication.</p>
            </div>
          </div>
          <form onSubmit={handleCreateKey} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="key-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Key Name *</Label>
                <Input id="key-name" placeholder="e.g., Production API" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-scopes" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Scopes <span className="font-normal text-slate-400">(comma-separated)</span></Label>
                <Input id="key-scopes" placeholder="e.g., read:users, write:orders" value={newKeyScopes} onChange={(e) => setNewKeyScopes(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-expires" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Expires In <span className="font-normal text-slate-400">(days, 0 = never)</span></Label>
                <Input id="key-expires" type="number" min="0" placeholder="e.g., 90" value={newKeyExpiresIn} onChange={(e) => setNewKeyExpiresIn(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-ips" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Allowed IPs <span className="font-normal text-slate-400">(comma-separated)</span></Label>
                <Input id="key-ips" placeholder="e.g., 10.0.0.1, 192.168.1.0/24" value={newKeyAllowedIPs} onChange={(e) => setNewKeyAllowedIPs(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isCreating} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                {isCreating ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generating...</> : 'Generate API Key'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white">Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <DataTable<APIKey>
        columns={columns}
        rows={keys}
        rowKey={(k) => k.id}
        loading={isLoading}
        error={false}
        onRetry={fetchKeys}
        emptyText="No API keys created yet."
        storageKey="developer-api-keys-col-prefs"
      />
    </div>
  );
}
