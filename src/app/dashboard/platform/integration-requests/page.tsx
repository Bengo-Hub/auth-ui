'use client';

import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Inbox, Loader2, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

interface IntegrationRequest {
  id: string;
  request_type: string;
  tenant_id?: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  company_name?: string;
  kra_pin?: string;
  integration_mode: 'self_serve' | 'assisted';
  notes?: string;
  source: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed' | 'go_live_requested';
  admin_notes?: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  in_review: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
  completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  go_live_requested: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
};

const STATUS_OPTIONS = ['pending', 'in_review', 'approved', 'rejected', 'completed'];

function RequestCard({ req }: { req: IntegrationRequest }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState(req.admin_notes ?? '');

  const update = useMutation({
    mutationFn: async (status: string) =>
      apiClient.patch(`/api/v1/admin/integration-requests/${req.id}`, { status, admin_notes: adminNotes }),
    onSuccess: () => {
      toast({ title: 'Updated' });
      qc.invalidateQueries({ queryKey: ['integration_requests'] });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 dark:text-white">{req.company_name || req.requester_name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[req.status] ?? ''}`}>
              {req.status.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {req.request_type}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
              {req.integration_mode === 'assisted' ? 'assisted (fee applies)' : 'self-serve (no fee)'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{req.tenant_id ? 'Onboarded tenant' : 'External lead'}</span>
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{req.requester_email}</span>
            {req.requester_phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{req.requester_phone}</span>}
          </div>
        </div>
        <span className="text-xs text-slate-400 shrink-0">{new Date(req.created_at).toLocaleDateString()}</span>
      </div>

      {req.notes && (
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">{req.notes}</p>
      )}
      {req.kra_pin && (
        <p className="text-xs font-mono text-slate-500">KRA PIN: {req.kra_pin}</p>
      )}

      <textarea
        placeholder="Admin notes (visible to platform team only)"
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        rows={2}
        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 placeholder:text-slate-400"
      />

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.filter((s) => s !== req.status).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'outline'}
            disabled={update.isPending}
            onClick={() => update.mutate(s)}
          >
            {update.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Mark {s.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: requests, isLoading } = useQuery<IntegrationRequest[]>({
    queryKey: ['integration_requests', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiClient.get<IntegrationRequest[]>(`/api/v1/admin/integration-requests${params}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Integration Requests</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
          Onboarded tenants and external leads requesting a platform integration — eTIMS today, more to come.
        </p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {['', ...STATUS_OPTIONS, 'go_live_requested'].map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={() => setStatusFilter(s)}
          >
            {s ? s.replace(/_/g, ' ') : 'All'}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (requests ?? []).length === 0 ? (
        <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No requests{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(requests ?? []).map((req) => <RequestCard key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}
