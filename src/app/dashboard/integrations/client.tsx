'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings2, Key, Globe, Check, X, Server, Database } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Integration {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  status: string;
  tenant_id?: string;
}

const DEFAULT_INTEGRATIONS = [
  { name: 'google_oauth', type: 'oauth2', label: 'Google OAuth', icon: Globe },
  { name: 'github_oauth', type: 'oauth2', label: 'GitHub OAuth', icon: Server },
  { name: 'microsoft_oauth', type: 'oauth2', label: 'Microsoft OAuth', icon: Database },
  { name: 'paystack', type: 'payment', label: 'Paystack', icon: Key },
];

export default function IntegrationsClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState({ client_id: '', secret: '', display_name: '' });

  const { data: configs, isLoading } = useQuery<Integration[]>({
    queryKey: ['admin_integrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/admin/integrations');
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return apiClient.put(`/api/v1/admin/integrations/${id}/status`, { is_active });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Integration status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin_integrations'] });
      queryClient.invalidateQueries({ queryKey: ['active_integrations'] });
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: { name: string; display_name: string; credentials: any }) => {
      return apiClient.post('/api/v1/admin/integrations', payload);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Credentials saved securely' });
      setEditingName(null);
      queryClient.invalidateQueries({ queryKey: ['admin_integrations'] });
      queryClient.invalidateQueries({ queryKey: ['active_integrations'] });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save integration credentials', variant: 'destructive' }),
  });

  const handleEdit = (name: string) => {
    const existing = configs?.find((i) => i.name === name);
    setFormData({ 
      client_id: '', // We don't fetch back the ID for security/simplicity in this view
      secret: '', 
      display_name: existing?.display_name || '' 
    });
    setEditingName(name);
  };

  const handleSave = (providerDef: typeof DEFAULT_INTEGRATIONS[0]) => {
    upsertMutation.mutate({
      name: providerDef.name,
      display_name: formData.display_name || providerDef.label,
      credentials: {
        client_id: formData.client_id,
        client_secret: formData.secret, // Backend expects client_secret
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations Engine</h1>
        <p className="text-muted-foreground mt-2">
          Manage third-party connections. Secrets are stored securely using AES-256-GCM encryption and distributed centrally across all microservices. No more `.env` files for APIs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEFAULT_INTEGRATIONS.map((providerDef) => {
          const config = configs?.find((i) => i.name === providerDef.name);
          const isActive = config?.is_active || false;
          const hasConfig = !!config;
          const Icon = providerDef.icon;

          return (
            <div
              key={providerDef.name}
              className={`rounded-xl border bg-card p-6 shadow-sm transition-all ${
                isActive ? 'border-primary/50 ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none">{config?.display_name || providerDef.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{providerDef.type}</p>
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  disabled={isLoading || !hasConfig}
                  onCheckedChange={(checked) => config && toggleMutation.mutate({ id: config.id, is_active: checked })}
                />
              </div>

              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {isActive ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Inactive</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Configuration</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    {hasConfig ? <><Check className="h-3.5 w-3.5" /> Encrypted Vault</> : <><X className="h-3.5 w-3.5 text-rose-500" /> <span className="text-rose-500">Missing</span></>}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <Dialog open={editingName === providerDef.name} onOpenChange={(open) => !open && setEditingName(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => handleEdit(providerDef.name)}>
                      <Settings2 className="mr-2 h-4 w-4" /> Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure {providerDef.label}</DialogTitle>
                      <DialogDescription>
                        API keys and secrets are encrypted with AES-256-GCM before saving to the database. They can only be accessed internally.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          placeholder="e.g. Google Social Login"
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client_id">Client ID / Public Key</Label>
                        <Input
                          id="client_id"
                          placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                          value={formData.client_id}
                          onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secret">Client Secret / Private Key</Label>
                        <Input
                          id="secret"
                          type="password"
                          placeholder={hasConfig ? '•••••••••••••••• (Leave blank to keep existing)' : 'Paste secret key here'}
                          value={formData.secret}
                          onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingName(null)}>Cancel</Button>
                      <Button 
                        onClick={() => handleSave(providerDef)}
                        disabled={upsertMutation.isPending || (!hasConfig && !formData.secret)}
                      >
                        {upsertMutation.isPending ? 'Encrypting...' : 'Save Configuration'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
