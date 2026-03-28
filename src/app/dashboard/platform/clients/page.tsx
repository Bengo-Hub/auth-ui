'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  useOAuthClients,
  useCreateOAuthClient,
  useUpdateOAuthClient,
  useDeleteOAuthClient,
  OAuthClient,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

function CreateClientDialog() {
  const { toast } = useToast();
  const createClient = useCreateOAuthClient();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [redirectInput, setRedirectInput] = useState('');
  const [redirectUris, setRedirectUris] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addRedirectUri = () => {
    const uri = redirectInput.trim();
    if (uri && !redirectUris.includes(uri)) {
      setRedirectUris([...redirectUris, uri]);
      setRedirectInput('');
    }
  };

  const removeRedirectUri = (uri: string) => {
    setRedirectUris(redirectUris.filter((u) => u !== uri));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientId || !name) return;

    createClient.mutate(
      { client_id: clientId, name, redirect_uris: redirectUris, scopes: DEFAULT_SCOPES, public: isPublic },
      {
        onSuccess: () => {
          toast({ title: 'Created', description: `OAuth client "${name}" created.` });
          setOpen(false);
          setClientId('');
          setName('');
          setRedirectUris([]);
          setRedirectInput('');
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || 'Failed to create client');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" /> Register Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Register OAuth Client</DialogTitle>
          <DialogDescription>Add a new OAuth 2.0 client application.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Client ID *</Label>
            <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="my-app-ui" required />
            <p className="text-[11px] text-muted-foreground">Unique identifier used in OAuth flows</p>
          </div>
          <div className="space-y-2">
            <Label>Display Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Application" required />
          </div>
          <div className="space-y-2">
            <Label>Redirect URIs</Label>
            <div className="flex gap-2">
              <Input
                value={redirectInput}
                onChange={(e) => setRedirectInput(e.target.value)}
                placeholder="https://example.com/auth/callback"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRedirectUri();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRedirectUri} className="shrink-0 rounded-xl">
                Add
              </Button>
            </div>
            {redirectUris.length > 0 && (
              <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                {redirectUris.map((uri) => (
                  <div key={uri} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono">
                    <span className="truncate flex-1">{uri}</span>
                    <button type="button" onClick={() => removeRedirectUri(uri)} className="text-slate-400 hover:text-rose-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="is-public" className="cursor-pointer">
              Public client (no client secret, PKCE required)
            </Label>
          </div>
          <Button type="submit" disabled={createClient.isPending || !clientId || !name} className="w-full h-12 rounded-xl text-white font-bold">
            {createClient.isPending ? <Loader2 className="animate-spin" /> : 'Register Client'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditClientDialog({
  client,
  open,
  onOpenChange,
}: {
  client: OAuthClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const updateClient = useUpdateOAuthClient();
  const [name, setName] = useState(client.name);
  const [isPublic, setIsPublic] = useState(client.public);
  const [redirectUris, setRedirectUris] = useState<string[]>(client.redirect_uris ?? []);
  const [redirectInput, setRedirectInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addRedirectUri = () => {
    const uri = redirectInput.trim();
    if (uri && !redirectUris.includes(uri)) {
      setRedirectUris([...redirectUris, uri]);
      setRedirectInput('');
    }
  };

  const removeRedirectUri = (uri: string) => {
    setRedirectUris(redirectUris.filter((u) => u !== uri));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    updateClient.mutate(
      { id: client.id, name, redirect_uris: redirectUris, public: isPublic },
      {
        onSuccess: () => {
          toast({ title: 'Updated', description: `Client "${name}" updated.` });
          onOpenChange(false);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || 'Failed to update client');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit OAuth Client</DialogTitle>
          <DialogDescription>
            Update settings for <span className="font-mono font-bold">{client.client_id}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={client.client_id} disabled className="opacity-70 cursor-not-allowed font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Redirect URIs ({redirectUris.length})</Label>
            <div className="flex gap-2">
              <Input
                value={redirectInput}
                onChange={(e) => setRedirectInput(e.target.value)}
                placeholder="https://example.com/auth/callback"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRedirectUri();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRedirectUri} className="shrink-0 rounded-xl">
                Add
              </Button>
            </div>
            {redirectUris.length > 0 && (
              <div className="space-y-1 mt-2 max-h-48 overflow-y-auto">
                {redirectUris.map((uri) => (
                  <div key={uri} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono">
                    {uri.startsWith('https://') ? (
                      <Globe className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate flex-1">{uri}</span>
                    <button type="button" onClick={() => removeRedirectUri(uri)} className="text-slate-400 hover:text-rose-500 shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="edit-is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="edit-is-public" className="cursor-pointer">
              Public client
            </Label>
          </div>
          <Button type="submit" disabled={updateClient.isPending} className="w-full h-12 rounded-xl text-white font-bold">
            {updateClient.isPending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClientCard({ client, index }: { client: OAuthClient; index: number }) {
  const { toast } = useToast();
  const deleteClient = useDeleteOAuthClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const prodUris = (client.redirect_uris ?? []).filter((u) => u.startsWith('https://'));
  const localUris = (client.redirect_uris ?? []).filter((u) => !u.startsWith('https://'));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard.' });
  };

  const handleDelete = () => {
    deleteClient.mutate(client.id, {
      onSuccess: () => {
        toast({ title: 'Deleted', description: `Client "${client.name}" removed.` });
        setDeleting(false);
      },
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-500 shadow-sm">
              <Key className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                {client.name}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(client.client_id)}
                  className="flex items-center gap-1 text-primary font-mono font-bold text-sm hover:underline"
                >
                  {client.client_id} <Copy className="h-3 w-3 opacity-50" />
                </button>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span
                  className={`text-xs font-black uppercase tracking-widest ${
                    client.public ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {client.public ? 'Public' : 'Confidential'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-400 font-bold text-xs">
                  {(client.redirect_uris ?? []).length} redirect{(client.redirect_uris ?? []).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setExpanded(!expanded)}
              className="h-12 px-5 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white"
            >
              URIs {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                <DropdownMenuItem onClick={() => setEditing(true)} className="rounded-xl p-3 cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" /> Edit Client
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleting(true)}
                  className="rounded-xl p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {prodUris.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Production ({prodUris.length})
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {prodUris.map((uri) => (
                      <div
                        key={uri}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono group/uri"
                      >
                        <Globe className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate flex-1">{uri}</span>
                        <button
                          onClick={() => handleCopy(uri)}
                          className="opacity-0 group-hover/uri:opacity-100 text-slate-400 hover:text-primary transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {localUris.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Development ({localUris.length})
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {localUris.map((uri) => (
                      <div
                        key={uri}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono group/uri"
                      >
                        <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate flex-1">{uri}</span>
                        <button
                          onClick={() => handleCopy(uri)}
                          className="opacity-0 group-hover/uri:opacity-100 text-slate-400 hover:text-primary transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {client.allowed_scopes && client.allowed_scopes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Scopes</h4>
                <div className="flex flex-wrap gap-2">
                  {client.allowed_scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {editing && <EditClientDialog client={client} open={editing} onOpenChange={setEditing} />}

      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-rose-600">Delete Client</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold font-mono text-slate-900 dark:text-white">{client.client_id}</span>?
              Applications using this client will no longer be able to authenticate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleting(false)} className="h-12 rounded-xl font-bold flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteClient.isPending}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 flex-1"
            >
              {deleteClient.isPending ? <Loader2 className="animate-spin" /> : 'Confirm Deletion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function OAuthClientsPage() {
  const { data: clients, isLoading } = useOAuthClients();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-slate-400">Loading OAuth clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">OAuth Clients</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Manage OAuth 2.0 client applications, their redirect URIs, and access scopes.
          </p>
        </div>
        <CreateClientDialog />
      </header>

      <div className="grid grid-cols-1 gap-6">
        {clients && clients.length > 0 ? (
          clients.map((client, idx) => <ClientCard key={client.id} client={client} index={idx} />)
        ) : (
          <div className="p-24 rounded-[4rem] bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <Key className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No OAuth Clients</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10">
              Register your first OAuth client to enable SSO authentication for your applications.
            </p>
            <CreateClientDialog />
          </div>
        )}
      </div>
    </div>
  );
}
