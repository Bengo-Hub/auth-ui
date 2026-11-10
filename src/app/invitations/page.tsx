'use client';

import apiClient from '@/lib/api-client';
import { roleLabel, type Invitation } from '@/lib/invitations';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

/**
 * Organisations that invited the signed-in person. Adding an existing account to a team no
 * longer makes them a member on the spot: they accept or decline here (security audit H4).
 */
function InvitationsInner() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ invitations: Invitation[] }>({
    queryKey: ['my_invitations'],
    queryFn: async () => (await apiClient.get('/api/v1/auth/me/invitations')).data,
    retry: false,
  });
  const act = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      apiClient.post(`/api/v1/auth/me/invitations/${encodeURIComponent(id)}/${action}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my_invitations'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  if (isError) {
    if (typeof window !== 'undefined') window.location.replace('/login?return_to=' + encodeURIComponent('/invitations'));
    return null;
  }
  const invitations = data?.invitations ?? [];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Invitations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You join an organisation only when you accept. Declining removes the invitation and changes nothing else on your account.
          </p>
        </div>
        {invitations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
            No invitations waiting. <a className="font-semibold text-primary hover:underline" href="/dashboard">Go to your account</a>
          </div>
        ) : (
          <ul className="space-y-3">
            {invitations.map((inv) => {
              const busy = act.isPending && act.variables?.id === inv.tenant_id;
              return (
                <li key={inv.tenant_id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Building2 className="h-5 w-5 text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{inv.tenant_name || inv.tenant_slug}</p>
                      <p className="text-xs text-slate-500">As {roleLabel(inv.roles)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => act.mutate({ id: inv.tenant_id, action: 'decline' })}>
                      Decline
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => act.mutate({ id: inv.tenant_id, action: 'accept' })}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {act.isError && <p className="text-sm text-red-600">That did not work. Refresh and try again.</p>}
      </div>
    </div>
  );
}

export default function InvitationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <InvitationsInner />
    </Suspense>
  );
}
