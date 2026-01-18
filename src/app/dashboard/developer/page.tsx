'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Check,
    Code2,
    Copy,
    ExternalLink,
    Globe,
    Package,
    Plus,
    ShieldAlert,
    Terminal,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface OAuthClient {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  redirect_uris: string[];
}

export default function DeveloperPortal() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/api/v1/developer/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setIsLoading(false);
    }
  };

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
                    <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl">
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

        {/* Resources & Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Resources & Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Documentation */}
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

            {/* Auth API Repository */}
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

            {/* Go SDK */}
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

            {/* RBAC Guide */}
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

            {/* Swagger UI */}
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

            {/* Quick Start Guide */}
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
      </div>
    </div>
  );
}
