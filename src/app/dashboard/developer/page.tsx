'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    Check,
    ClipboardCopy,
    Code2,
    Copy,
    ExternalLink,
    Globe,
    Key,
    Loader2,
    Package,
    Plus,
    ShieldAlert,
    Terminal,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface OAuthClient {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  redirect_uris: string[];
}

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  service?: string;
  scopes?: string[];
  status: string;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

type ActiveTab = 'oauth' | 'api-keys';

// ── Main Component ───────────────────────────────────────────────────────────

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('oauth');

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Developer Portal</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            Manage your OAuth2 applications, API keys, and webhooks.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white">
            <Terminal className="h-5 w-5 mr-2" /> API Docs
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('oauth')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'oauth'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Globe className="h-4 w-4 inline-block mr-2" />
          OAuth Clients
        </button>
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'api-keys'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Key className="h-4 w-4 inline-block mr-2" />
          API Keys
        </button>
      </div>

      {activeTab === 'oauth' ? <OAuthSection /> : <APIKeySection />}

      {/* Resources & Documentation */}
      <ResourcesSection />
    </div>
  );
}

// ── OAuth Clients Section ────────────────────────────────────────────────────

function OAuthSection() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/developer/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await apiClient.post('/api/v1/developer/clients', {
        name: newName,
        redirect_uris: [newRedirectUri],
      });
      setNewName('');
      setNewRedirectUri('');
      fetchClients();
    } catch (err) {
      console.error('Failed to create client', err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-12">
      {/* Create New Client */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <Plus className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register New Application</h2>
            <p className="text-slate-500 dark:text-slate-400">Create a new OAuth client to integrate with Codevertex SSO.</p>
          </div>
        </div>

        <form onSubmit={handleCreateClient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Application Name</Label>
              <Input
                id="name"
                placeholder="My Awesome App"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="redirect" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Redirect URI</Label>
              <Input
                id="redirect"
                placeholder="https://myapp.com/api/auth/callback"
                value={newRedirectUri}
                onChange={(e) => setNewRedirectUri(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isCreating}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
          >
            {isCreating ? 'Creating...' : 'Create OAuth Client'}
          </Button>
        </form>
      </motion.div>

      {/* List of Clients */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Applications</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Globe className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No applications registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {clients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <Globe className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{client.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">ID: {client.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                    onClick={async () => {
                      if (!confirm(`Delete OAuth client "${client.name}"? This cannot be undone.`)) return;
                      try {
                        await apiClient.delete(`/api/v1/developer/clients/${client.id}`);
                        fetchClients();
                      } catch (err) {
                        console.error('Failed to delete client', err);
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Client ID</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-mono break-all border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-300">
                        {client.client_id}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-700 dark:text-white"
                        onClick={() => copyToClipboard(client.client_id, `${client.id}-id`)}
                      >
                        {copiedId === `${client.id}-id` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Client Secret</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-mono break-all border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-300">
                        {client.client_secret ? '••••••••••••••••••••••••••••••••' : 'Not available'}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-700 dark:text-white"
                        onClick={() => copyToClipboard(client.client_secret, `${client.id}-secret`)}
                      >
                        {copiedId === `${client.id}-secret` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Never share your client secret.
                  </div>
                  <Button variant="link" className="text-primary font-bold p-0 h-auto">
                    Manage Redirect URIs <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── API Key Section ──────────────────────────────────────────────────────────

function APIKeySection() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState('');
  const [newKeyExpiresIn, setNewKeyExpiresIn] = useState('');
  const [newKeyAllowedIPs, setNewKeyAllowedIPs] = useState('');

  // Newly created key (shown once)
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdKeyCopied, setCreatedKeyCopied] = useState(false);

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/api-keys');
      setKeys(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload: Record<string, unknown> = { name: newKeyName };
      if (newKeyScopes.trim()) {
        payload.scopes = newKeyScopes.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (newKeyExpiresIn.trim()) {
        payload.expires_in = parseInt(newKeyExpiresIn, 10);
      }
      if (newKeyAllowedIPs.trim()) {
        payload.allowed_ips = newKeyAllowedIPs.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const response = await apiClient.post('/api/v1/admin/api-keys', payload);
      setCreatedKey(response.data.key);
      setNewKeyName('');
      setNewKeyScopes('');
      setNewKeyExpiresIn('');
      setNewKeyAllowedIPs('');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Newly Created Key Banner */}
      {createdKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">
                Save your API key now
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                This is the only time your full API key will be shown. Copy it now and store it securely.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono break-all border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-200">
              {createdKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-amber-300 dark:border-amber-700"
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
                setCreatedKeyCopied(true);
                setTimeout(() => setCreatedKeyCopied(false), 2000);
              }}
            >
              {createdKeyCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreatedKey(null)}
            className="mt-3 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            I&apos;ve saved my key
          </Button>
        </motion.div>
      )}

      {/* Create Key Form / Button */}
      {showCreateForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
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
                <Label htmlFor="key-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Key Name *
                </Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-scopes" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Scopes <span className="font-normal text-slate-400">(comma-separated)</span>
                </Label>
                <Input
                  id="key-scopes"
                  placeholder="e.g., read:users, write:orders"
                  value={newKeyScopes}
                  onChange={(e) => setNewKeyScopes(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-expires" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Expires In <span className="font-normal text-slate-400">(days, 0 = never)</span>
                </Label>
                <Input
                  id="key-expires"
                  type="number"
                  min="0"
                  placeholder="e.g., 90"
                  value={newKeyExpiresIn}
                  onChange={(e) => setNewKeyExpiresIn(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="key-ips" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Allowed IPs <span className="font-normal text-slate-400">(comma-separated)</span>
                </Label>
                <Input
                  id="key-ips"
                  placeholder="e.g., 10.0.0.1, 192.168.1.0/24"
                  value={newKeyAllowedIPs}
                  onChange={(e) => setNewKeyAllowedIPs(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isCreating}
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
              >
                {isCreating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generating...</>
                ) : (
                  'Generate API Key'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="flex justify-start">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create API Key
          </Button>
        </div>
      )}

      {/* List of API Keys */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your API Keys</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Key className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No API keys created yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Create an API key for service-to-service authentication.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((apiKey) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      apiKey.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Key className={`h-5 w-5 ${
                        apiKey.status === 'active'
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                          {apiKey.name}
                        </h3>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          apiKey.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {apiKey.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{apiKey.key_prefix}...</span>
                        <span>Created {formatDate(apiKey.created_at)}</span>
                        {apiKey.last_used_at && (
                          <span>Last used {formatRelativeDate(apiKey.last_used_at)}</span>
                        )}
                        {apiKey.expires_at && (
                          <span className={
                            new Date(apiKey.expires_at) < new Date()
                              ? 'text-rose-500 dark:text-rose-400 font-medium'
                              : ''
                          }>
                            Expires {formatDate(apiKey.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {apiKey.scopes && apiKey.scopes.length > 0 && (
                      <div className="hidden lg:flex items-center gap-1.5">
                        {apiKey.scopes.slice(0, 3).map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400"
                          >
                            {scope}
                          </span>
                        ))}
                        {apiKey.scopes.length > 3 && (
                          <span className="text-xs text-slate-400">+{apiKey.scopes.length - 3}</span>
                        )}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => copyToClipboard(apiKey.key_prefix, apiKey.id)}
                    >
                      {copiedId === apiKey.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>

                    {apiKey.status === 'active' && (
                      revokeTarget === apiKey.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl text-xs font-bold"
                            disabled={isRevoking}
                            onClick={() => handleRevokeKey(apiKey.id)}
                          >
                            {isRevoking ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-xs"
                            onClick={() => setRevokeTarget(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                          onClick={() => setRevokeTarget(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )
                    )}
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

// ── Resources & Documentation ────────────────────────────────────────────────

function ResourcesSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Resources & Documentation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.a
          href="/docs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">API Documentation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Complete API reference with endpoints, authentication, and code examples.
          </p>
        </motion.a>

        <motion.a
          href="https://github.com/Bengo-Hub/auth-api"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Auth API</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Backend authentication service source code and implementation details.
          </p>
        </motion.a>

        <motion.a
          href="https://github.com/Bengo-Hub/shared-auth-client"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Go SDK</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Shared Auth Client for Go services. JWT validation, middleware, and JWKS support.
          </p>
        </motion.a>

        <motion.a
          href="https://github.com/Bengo-Hub/bengobox/blob/main/docs/RBAC_IMPLEMENTATION_GUIDE.md"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">RBAC Guide</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Role-based access control patterns and permission enforcement implementation.
          </p>
        </motion.a>

        <motion.a
          href="https://sso.codevertexitsolutions.com/v1/docs/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Swagger UI</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Interactive API explorer with try-it-out functionality for all endpoints.
          </p>
        </motion.a>

        <motion.a
          href="/docs#quick-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="group p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Quick Start</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Get started with example requests, authentication, and SDK integration.
          </p>
        </motion.a>
      </div>
    </section>
  );
}
