'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Loader2,
  Settings2,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Connection {
  id: string;
  provider: string; // google, github, apple, etc.
  client_id: string;
  client_secret?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export function IntegrationsTab() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Partial<Connection> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/integrations');
      setConnections(res.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load OAuth connections.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnection?.provider || !editingConnection?.client_id) return;

    try {
      setSaving(true);
      if (editingConnection.id) {
        await api.put(`/api/v1/admin/integrations/${editingConnection.id}`, editingConnection);
      } else {
        await api.post('/api/v1/admin/integrations', editingConnection);
      }
      toast({
        title: 'Success',
        description: `Connection ${editingConnection.id ? 'updated' : 'created'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchConnections();
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save connection.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    try {
      await api.delete(`/api/v1/admin/integrations/${id}`);
      toast({
        title: 'Deleted',
        description: 'Connection removed successfully.',
      });
      fetchConnections();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              OAuth Connections
            </h3>
            <p className="text-sm text-slate-500 mt-1">Configure social login providers for your users.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingConnection(null);
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingConnection({ status: 'active' })}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">{editingConnection?.id ? 'Edit' : 'Add'} OAuth Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveConnection} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</Label>
                  <select 
                    value={editingConnection?.provider || ''}
                    onChange={(e) => setEditingConnection(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Provider...</option>
                    <option value="google">Google</option>
                    <option value="github">GitHub</option>
                    <option value="apple">Apple</option>
                    <option value="microsoft">Microsoft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client ID</Label>
                  <Input 
                    value={editingConnection?.client_id || ''}
                    onChange={(e) => setEditingConnection(prev => ({ ...prev, client_id: e.target.value }))}
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client Secret</Label>
                  <Input 
                    type="password"
                    placeholder={editingConnection?.id ? '••••••••••••' : 'Paste secret here'}
                    value={editingConnection?.client_secret || ''}
                    onChange={(e) => setEditingConnection(prev => ({ ...prev, client_secret: e.target.value }))}
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold" 
                    required={!editingConnection?.id}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-primary text-white font-bold">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingConnection?.id ? 'Update Connection' : 'Create Connection')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {connections.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No social connections configured yet.</p>
            </div>
          ) : (
            connections.map(conn => (
              <div key={conn.id} className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <img 
                      src={`/images/providers/${conn.provider}.svg`} 
                      alt={conn.provider} 
                      onError={(e) => { (e.target as any).src = 'https://api.dicebear.com/7.x/shapes/svg?seed=' + conn.provider }}
                      className="w-6 h-6 object-contain" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 dark:text-white capitalize">{conn.provider}</p>
                      <Badge variant={conn.status === 'active' ? 'default' : 'soft'} className="rounded-full text-[8px] uppercase font-black px-2">
                        {conn.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">{conn.client_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setEditingConnection(conn);
                        setIsDialogOpen(true);
                    }}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConnection(conn.id)}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 flex gap-4">
        <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-tight">Callback URLs</p>
          <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed">
            Ensure you add the following redirect URI to your social provider developer consoles:
            <br />
            <code className="bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded font-mono text-[10px] mt-2 block w-fit">
              https://sso.codevertexitsolutions.com/api/v1/oauth/callback/[provider]
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
