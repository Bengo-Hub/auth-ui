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

interface ProviderField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password';
  credKey: string; // key sent in credentials map
}

interface ProviderDef {
  name: string;
  type: string;
  label: string;
  icon: typeof Globe;
  fields: ProviderField[];
}

const DEFAULT_INTEGRATIONS: ProviderDef[] = [
  {
    name: 'google_oauth', type: 'oauth2', label: 'Google OAuth', icon: Globe,
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: '123456789-abc.apps.googleusercontent.com', type: 'text', credKey: 'client_id' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'GOCSPX-...', type: 'password', credKey: 'client_secret' },
      { key: 'redirect_url', label: 'Redirect URL', placeholder: 'https://sso.codevertexitsolutions.com/api/v1/auth/oauth/google/callback', type: 'text', credKey: 'redirect_url' },
    ],
  },
  {
    name: 'github_oauth', type: 'oauth2', label: 'GitHub OAuth', icon: Server,
    fields: [
      { key: 'client_id', label: 'App ID', placeholder: 'Ov23li...', type: 'text', credKey: 'client_id' },
      { key: 'client_secret', label: 'App Secret', placeholder: 'c516195ef...', type: 'password', credKey: 'client_secret' },
      { key: 'redirect_url', label: 'Redirect URL', placeholder: 'https://sso.codevertexitsolutions.com/api/v1/auth/oauth/github/callback', type: 'text', credKey: 'redirect_url' },
    ],
  },
  {
    name: 'microsoft_oauth', type: 'oauth2', label: 'Microsoft OAuth', icon: Database,
    fields: [
      { key: 'client_id', label: 'Application (Client) ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', type: 'text', credKey: 'client_id' },
      { key: 'client_secret', label: 'Client Secret Value', placeholder: 'Secret value from Certificates & secrets', type: 'password', credKey: 'client_secret' },
      { key: 'tenant_id', label: 'Directory (Tenant) ID', placeholder: 'common (or specific tenant UUID)', type: 'text', credKey: 'tenant_id' },
      { key: 'redirect_url', label: 'Redirect URL', placeholder: 'https://sso.codevertexitsolutions.com/api/v1/auth/oauth/microsoft/callback', type: 'text', credKey: 'redirect_url' },
    ],
  },
  {
    name: 'paystack', type: 'payment', label: 'Paystack', icon: Key,
    fields: [
      { key: 'public_key', label: 'Public Key', placeholder: 'pk_live_...', type: 'text', credKey: 'public_key' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password', credKey: 'secret_key' },
    ],
  },
];

export default function IntegrationsClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

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

  const handleEdit = (providerDef: ProviderDef) => {
    const existing = configs?.find((i) => i.name === providerDef.name);
    // Initialize form with empty fields for each provider-specific field
    const initial: Record<string, string> = { display_name: existing?.display_name || providerDef.label };
    for (const f of providerDef.fields) {
      initial[f.key] = '';
    }
    setFormData(initial);
    setEditingName(providerDef.name);
  };

  const handleSave = (providerDef: ProviderDef) => {
    // Build credentials map from provider-specific fields
    const credentials: Record<string, string> = {};
    for (const f of providerDef.fields) {
      if (formData[f.key]) {
        credentials[f.credKey] = formData[f.key];
      }
    }
    upsertMutation.mutate({
      name: providerDef.name,
      display_name: formData.display_name || providerDef.label,
      credentials,
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
                    <Button variant="outline" className="w-full" onClick={() => handleEdit(providerDef)}>
                      <Settings2 className="mr-2 h-4 w-4" /> Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Configure {providerDef.label}</DialogTitle>
                      <DialogDescription>
                        Credentials are encrypted with AES-256-GCM before storage. Leave fields blank to keep existing values.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          placeholder={`e.g. ${providerDef.label}`}
                          value={formData.display_name || ''}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        />
                      </div>
                      {providerDef.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Input
                            id={field.key}
                            type={field.type || 'text'}
                            placeholder={hasConfig && field.type === 'password' ? '•••••••••••••••• (Leave blank to keep existing)' : field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingName(null)}>Cancel</Button>
                      <Button
                        onClick={() => handleSave(providerDef)}
                        disabled={upsertMutation.isPending}
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
