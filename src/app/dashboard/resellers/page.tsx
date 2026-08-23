'use client';

import { useState } from 'react';
import { Loader2, Handshake, Check, X, ArrowRight } from 'lucide-react';
import {
  useResellerApplications,
  usePendingResellerApplications,
  useAdvanceResellerApplication,
  ResellerApplication,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { buildResellerApplicationColumns } from './resellers-columns';

// The next legal forward transition per stage (mirrors isValidResellerTransition's own
// pending → kyb_pending → kyb_approved → agreement_pending → approved chain exactly — see
// auth-api's reseller_handler.go). A single "advance" action per stage keeps the admin from
// ever attempting an illegal skip (e.g. pending straight to approved), which the backend
// would reject with a 400.
const NEXT_STAGE: Record<string, { to: string; label: string; description: string }> = {
  pending: {
    to: 'kyb_pending',
    label: 'Start KYB Review',
    description: 'Marks this application as under business/legal-entity verification.',
  },
  kyb_pending: {
    to: 'kyb_approved',
    label: 'Mark KYB Approved',
    description: "Confirms the applicant's business verification checks out.",
  },
  kyb_approved: {
    to: 'agreement_pending',
    label: 'Send Reseller Agreement',
    description: 'Moves to awaiting the signed Reseller Agreement.',
  },
  agreement_pending: {
    to: 'approved',
    label: 'Approve',
    description: 'Certifies this partner — creates/links their Tenant and unlocks the reseller portal.',
  },
};

function RejectApplicationDialog({
  application,
  open,
  onOpenChange,
}: {
  application: ResellerApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const advance = useAdvanceResellerApplication();
  const [reason, setReason] = useState('');

  const handleReject = () => {
    advance.mutate(
      { id: application.id, status: 'rejected', notes: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast({ title: 'Application declined', description: `${application.business_name}'s application has been declined.` });
          onOpenChange(false);
          setReason('');
        },
        onError: () => {
          toast({ title: 'Failed to decline application', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Decline this application?</DialogTitle>
          <DialogDescription>
            <span className="font-bold text-slate-900 dark:text-white">{application.business_name}</span> will not become a certified reseller.
            You can optionally note why, for your own records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Label>Reason (optional)</Label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. failed KYB verification, incomplete documentation..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-xl font-bold flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={advance.isPending}
            className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 flex-1"
          >
            {advance.isPending ? <Loader2 className="animate-spin" /> : 'Decline Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PendingApplicationsSection() {
  const { data: pending, isLoading } = usePendingResellerApplications();
  const advance = useAdvanceResellerApplication();
  const { toast } = useToast();
  const [rejecting, setRejecting] = useState<ResellerApplication | null>(null);

  if (isLoading || !pending || pending.length === 0) return null;

  const handleAdvance = (application: ResellerApplication) => {
    const next = NEXT_STAGE[application.status];
    if (!next) return;
    advance.mutate(
      { id: application.id, status: next.to },
      {
        onSuccess: () => {
          toast({
            title: next.to === 'approved' ? 'Reseller certified' : 'Application advanced',
            description:
              next.to === 'approved'
                ? `${application.business_name} is now a certified reseller partner.`
                : `${application.business_name} moved to the next review stage.`,
          });
        },
        onError: () => {
          toast({ title: 'Failed to update application', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <section className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Handshake className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Awaiting Review ({pending.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reseller partner applications at some stage of KYB / agreement review.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {pending.map((a) => {
          const next = NEXT_STAGE[a.status];
          return (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{a.business_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {a.contact_email} · submitted {new Date(a.created_at).toLocaleDateString()}
                </p>
                {next && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{next.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejecting(a)}
                  className="h-9 rounded-lg font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
                >
                  <X className="h-4 w-4 mr-1" /> Decline
                </Button>
                {next && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvance(a)}
                    disabled={advance.isPending}
                    className="h-9 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {next.to === 'approved' ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-1" />
                    )}
                    {next.label}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {rejecting && (
        <RejectApplicationDialog application={rejecting} open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
      )}
    </section>
  );
}

export default function ResellersPage() {
  const { data: applications, isLoading, isError, refetch } = useResellerApplications();
  const columns = buildResellerApplicationColumns();

  return (
    <div className="space-y-12 pb-20">
      <header className="max-w-xl">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Certified Resellers</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          Review and approve applications to the Certified Reseller &amp; Partner Program.
        </p>
      </header>

      <PendingApplicationsSection />

      <DataTable
        columns={columns}
        rows={applications ?? []}
        rowKey={(a) => a.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="No reseller applications yet."
        storageKey="dashboard-resellers-col-prefs"
      />
    </div>
  );
}
