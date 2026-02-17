'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notificationsApi } from '@/lib/service-clients';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Smartphone,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProviderConfig {
  id: string;
  channel: string;
  provider_name: string;
  is_active: boolean;
  is_primary: boolean;
  status: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const CHANNEL_INFO: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  sms: { label: 'SMS', icon: Smartphone, color: 'emerald' },
  email: { label: 'Email', icon: Mail, color: 'blue' },
  push: { label: 'Push', icon: Bell, color: 'violet' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'green' },
};

const PROVIDER_OPTIONS: Record<string, { value: string; label: string; fields: { key: string; label: string; placeholder: string; sensitive?: boolean }[] }[]> = {
  sms: [
    {
      value: 'africastalking',
      label: "Africa's Talking",
      fields: [
        { key: 'api_key', label: 'API Key', placeholder: 'AT API key', sensitive: true },
        { key: 'username', label: 'Username', placeholder: 'sandbox or production username' },
        { key: 'sender_id', label: 'Sender ID', placeholder: 'e.g., BengoBox' },
      ],
    },
    {
      value: 'twilio',
      label: 'Twilio',
      fields: [
        { key: 'account_sid', label: 'Account SID', placeholder: 'AC...', sensitive: true },
        { key: 'auth_token', label: 'Auth Token', placeholder: 'Auth token', sensitive: true },
        { key: 'from_number', label: 'From Number', placeholder: '+254...' },
      ],
    },
  ],
  email: [
    {
      value: 'sendgrid',
      label: 'SendGrid',
      fields: [
        { key: 'api_key', label: 'API Key', placeholder: 'SG.xxx', sensitive: true },
        { key: 'from_email', label: 'From Email', placeholder: 'noreply@example.com' },
        { key: 'from_name', label: 'From Name', placeholder: 'BengoBox' },
      ],
    },
    {
      value: 'smtp',
      label: 'SMTP',
      fields: [
        { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
        { key: 'port', label: 'Port', placeholder: '587' },
        { key: 'username', label: 'Username', placeholder: 'user@example.com' },
        { key: 'password', label: 'Password', placeholder: 'App password', sensitive: true },
        { key: 'from_email', label: 'From Email', placeholder: 'noreply@example.com' },
      ],
    },
  ],
  push: [
    {
      value: 'fcm',
      label: 'Firebase Cloud Messaging',
      fields: [
        { key: 'server_key', label: 'Server Key', placeholder: 'FCM server key', sensitive: true },
        { key: 'project_id', label: 'Project ID', placeholder: 'my-firebase-project' },
      ],
    },
  ],
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active' },
  inactive: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: 'Inactive' },
  error: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', label: 'Error' },
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function PlatformNotificationsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setError(null);
      const response = await notificationsApi.get('/api/v1/platform/providers');
      setProviders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Group providers by channel
  const grouped = providers.reduce<Record<string, ProviderConfig[]>>((acc, p) => {
    const ch = p.channel || 'other';
    if (!acc[ch]) acc[ch] = [];
    acc[ch].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Notification Providers</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            Configure SMS, email, and push notification providers for the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchProviders}
            className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Provider
          </Button>
        </div>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </motion.div>
      )}

      {showCreate && (
        <CreateProviderForm
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchProviders(); }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : providers.length === 0 ? (
        <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No notification providers configured yet.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Add SMS, email, or push providers to enable tenant notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([channel, channelProviders]) => {
            const info = CHANNEL_INFO[channel] || { label: channel, icon: Bell, color: 'slate' };
            const ChannelIcon = info.icon;
            return (
              <section key={channel} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <ChannelIcon className="h-5 w-5 text-slate-400" />
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{info.label} Providers</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {channelProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} onRefresh={fetchProviders} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Provider Card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, onRefresh }: { provider: ProviderConfig; onRefresh: () => void }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusStyle = STATUS_STYLES[provider.status] || STATUS_STYLES.inactive;
  const channelInfo = CHANNEL_INFO[provider.channel] || { label: provider.channel, icon: Bell };
  const ChannelIcon = channelInfo.icon;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await notificationsApi.post(`/api/v1/platform/providers/${provider.id}/test`);
      setTestResult('success');
    } catch {
      setTestResult('error');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleDeactivate = async () => {
    try {
      await notificationsApi.delete(`/api/v1/platform/providers/${provider.id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to deactivate provider', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <ChannelIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{provider.provider_name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
              {provider.is_primary && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  Primary
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {channelInfo.label} &middot; Added {new Date(provider.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="rounded-xl border-slate-200 dark:border-slate-700 font-bold dark:text-white"
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : testResult === 'success' ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : testResult === 'error' ? (
              <X className="h-4 w-4 text-rose-500" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            <span className="ml-2">Test</span>
          </Button>

          {isDeleting ? (
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" className="rounded-xl text-xs font-bold" onClick={handleDeactivate}>
                Confirm
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Create Provider Form ─────────────────────────────────────────────────────

function CreateProviderForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [channel, setChannel] = useState('');
  const [providerName, setProviderName] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const providerOptions = channel ? (PROVIDER_OPTIONS[channel] || []) : [];
  const selectedProvider = providerOptions.find((p) => p.value === providerName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await notificationsApi.post('/api/v1/platform/providers', {
        channel,
        provider_name: providerName,
        config,
        is_active: true,
      });
      onCreated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Settings className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Provider</h2>
            <p className="text-slate-500 dark:text-slate-400">Configure a new notification provider for the platform.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <p className="text-sm text-rose-700 dark:text-rose-400">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Channel Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Channel</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(CHANNEL_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setChannel(key); setProviderName(''); setConfig({}); }}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    channel === key
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className="h-6 w-6 text-slate-500 mb-2" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {channel && (
          <>
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Provider</Label>
              <div className="flex gap-3">
                {providerOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setProviderName(opt.value); setConfig({}); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      providerName === opt.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Config Fields */}
            {selectedProvider && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Configuration</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showSecrets ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProvider.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`cfg-${field.key}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">
                        {field.label}
                      </Label>
                      <Input
                        id={`cfg-${field.key}`}
                        type={field.sensitive && !showSecrets ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !providerName}
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Create Provider'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </form>
    </motion.div>
  );
}
