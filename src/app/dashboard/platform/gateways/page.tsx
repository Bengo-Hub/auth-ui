'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlatformGateways } from '@/hooks/use-dashboard-api';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface GatewayConfig {
  id: string;
  gateway_type: string;
  name: string;
  is_active: boolean;
  is_primary: boolean;
  status: string;
  callback_url: string;
  webhook_url: string;
  transaction_fee_type: string;
  transaction_fee_percentage: number;
  transaction_fee_fixed: number;
  total_transactions: number;
  total_amount: number;
  last_transaction_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateGatewayPayload {
  gateway_type: string;
  name: string;
  credentials: Record<string, string>;
  callback_url?: string;
  webhook_url?: string;
  transaction_fee_type?: string;
  transaction_fee_percentage?: number;
  transaction_fee_fixed?: number;
}

const GATEWAY_TYPES = [
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill', icon: '📱', color: 'emerald' },
  { value: 'mpesa_till', label: 'M-Pesa Till', icon: '📱', color: 'emerald' },
  { value: 'paystack', label: 'Paystack', icon: '💳', color: 'blue' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', color: 'violet' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active' },
  inactive: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: 'Inactive' },
  pending_verification: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
  error: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', label: 'Error' },
};

const CREDENTIAL_FIELDS: Record<string, { label: string; placeholder: string; sensitive?: boolean }[]> = {
  mpesa_paybill: [
    { label: 'Consumer Key', placeholder: 'Safaricom consumer key', sensitive: true },
    { label: 'Consumer Secret', placeholder: 'Safaricom consumer secret', sensitive: true },
    { label: 'Pass Key', placeholder: 'M-Pesa pass key', sensitive: true },
    { label: 'Short Code', placeholder: 'e.g., 174379' },
    { label: 'Environment', placeholder: 'sandbox or production' },
  ],
  mpesa_till: [
    { label: 'Consumer Key', placeholder: 'Safaricom consumer key', sensitive: true },
    { label: 'Consumer Secret', placeholder: 'Safaricom consumer secret', sensitive: true },
    { label: 'Pass Key', placeholder: 'M-Pesa pass key', sensitive: true },
    { label: 'Short Code', placeholder: 'e.g., 174379' },
    { label: 'Environment', placeholder: 'sandbox or production' },
  ],
  paystack: [
    { label: 'Secret Key', placeholder: 'sk_test_...', sensitive: true },
    { label: 'Public Key', placeholder: 'pk_test_...' },
    { label: 'Webhook Secret', placeholder: 'whsec_...', sensitive: true },
  ],
  bank_transfer: [
    { label: 'Bank Name', placeholder: 'e.g., KCB Bank' },
    { label: 'Account Number', placeholder: 'Account number', sensitive: true },
    { label: 'Bank Code', placeholder: 'e.g., 01' },
  ],
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function PlatformGatewaysPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: gateways = [], isLoading, error: queryError, refetch: fetchGateways } = usePlatformGateways();
  const gatewaysList = gateways as GatewayConfig[];
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load gateways') : null;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Payment Gateways</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            Configure platform-level payment gateways. Tenants select from active gateways.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchGateways}
            className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-700 font-bold dark:text-white"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Gateway
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
        <CreateGatewayForm
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchGateways(); }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : gatewaysList.length === 0 ? (
        <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <CreditCard className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No payment gateways configured yet.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Add M-Pesa, Paystack, or bank transfer gateways to enable tenant payments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {gatewaysList.map((gw) => (
            <GatewayCard key={gw.id} gateway={gw} onRefresh={fetchGateways} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gateway Card ─────────────────────────────────────────────────────────────

function GatewayCard({ gateway, onRefresh }: { gateway: GatewayConfig; onRefresh: () => void }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeInfo = GATEWAY_TYPES.find((t) => t.value === gateway.gateway_type);
  const statusStyle = STATUS_STYLES[gateway.status] || STATUS_STYLES.inactive;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await treasuryApi.post(`/api/v1/platform/gateways/${gateway.id}/test`);
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
      await treasuryApi.delete(`/api/v1/platform/gateways/${gateway.id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to deactivate gateway', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 text-2xl">
            {typeInfo?.icon || '💰'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{gateway.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
              {gateway.is_primary && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  Primary
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {typeInfo?.label || gateway.gateway_type}
              {gateway.transaction_fee_type !== 'none' && (
                <span className="ml-2">
                  &middot; Fee: {gateway.transaction_fee_percentage > 0 ? `${gateway.transaction_fee_percentage}%` : ''}
                  {gateway.transaction_fee_fixed > 0 ? ` + KES ${gateway.transaction_fee_fixed}` : ''}
                </span>
              )}
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
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl text-xs font-bold"
                onClick={handleDeactivate}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setIsDeleting(false)}
              >
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {gateway.total_transactions.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {formatAmount(gateway.total_amount)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Callback URL</p>
          <p className="text-sm font-mono text-slate-600 dark:text-slate-400 truncate">
            {gateway.callback_url || '—'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Transaction</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {gateway.last_transaction_at
              ? new Date(gateway.last_transaction_at).toLocaleDateString('en-KE', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })
              : 'No transactions yet'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Create Gateway Form ──────────────────────────────────────────────────────

function CreateGatewayForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [gatewayType, setGatewayType] = useState('');
  const [name, setName] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [callbackUrl, setCallbackUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [feeType, setFeeType] = useState('percentage');
  const [feePercentage, setFeePercentage] = useState('');
  const [feeFixed, setFeeFixed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const credentialFields = gatewayType ? (CREDENTIAL_FIELDS[gatewayType] || []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload: CreateGatewayPayload = {
      gateway_type: gatewayType,
      name,
      credentials,
      callback_url: callbackUrl || undefined,
      webhook_url: webhookUrl || undefined,
      transaction_fee_type: feeType,
      transaction_fee_percentage: feePercentage ? parseFloat(feePercentage) : undefined,
      transaction_fee_fixed: feeFixed ? parseFloat(feeFixed) : undefined,
    };

    try {
      await treasuryApi.post('/api/v1/platform/gateways', payload);
      onCreated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create gateway');
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Settings className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configure Gateway</h2>
            <p className="text-slate-500 dark:text-slate-400">Add a new payment gateway for the platform.</p>
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
        {/* Gateway Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Gateway Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GATEWAY_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setGatewayType(type.value);
                  setName(type.label);
                  setCredentials({});
                }}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  gatewayType === type.value
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {gatewayType && (
          <>
            {/* Name */}
            <div className="space-y-3">
              <Label htmlFor="gw-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Display Name</Label>
              <Input
                id="gw-name"
                placeholder="e.g., M-Pesa Production"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Credentials */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Credentials</Label>
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
                {credentialFields.map((field) => {
                  const key = field.label.toLowerCase().replace(/\s+/g, '_');
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`cred-${key}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">
                        {field.label}
                      </Label>
                      <Input
                        id={`cred-${key}`}
                        type={field.sensitive && !showSecrets ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={credentials[key] || ''}
                        onChange={(e) => setCredentials({ ...credentials, [key]: e.target.value })}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="callback-url" className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Callback URL</Label>
                <Input
                  id="callback-url"
                  placeholder="https://api.example.com/webhooks/mpesa"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://api.example.com/webhooks/paystack"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Fee Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Fee Type</Label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="hybrid">Hybrid (% + Fixed)</option>
                  <option value="none">None</option>
                </select>
              </div>
              {(feeType === 'percentage' || feeType === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="fee-pct" className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Fee %</Label>
                  <Input
                    id="fee-pct"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1.5"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}
              {(feeType === 'fixed' || feeType === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="fee-fixed" className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Fixed Fee (KES)</Label>
                  <Input
                    id="fee-fixed"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 30"
                    value={feeFixed}
                    onChange={(e) => setFeeFixed(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !gatewayType}
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Create Gateway'
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
