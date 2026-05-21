'use client';

export const dynamic = 'force-dynamic';

import { usePortal } from '../equity-portal-context';
import { useEquityPayouts } from '@/hooks/use-equity-portal';

export default function EquityDashboard() {
    const { holderID, token } = usePortal();
    const { data, isLoading } = useEquityPayouts(holderID, token);
    const payouts = data?.payouts ?? [];

    const totalEarned = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.payout_amount), 0);
    const pending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.payout_amount), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">Your equity earnings summary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard label="Total Earned" value={`KES ${totalEarned.toLocaleString()}`} loading={isLoading} />
                <SummaryCard label="Pending Payout" value={`KES ${pending.toLocaleString()}`} loading={isLoading} />
                <SummaryCard label="Total Payouts" value={payouts.length.toString()} loading={isLoading} />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">Recent Payouts</h2>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                ) : payouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payouts yet.</p>
                ) : (
                    <div className="space-y-2">
                        {payouts.slice(0, 5).map((p) => (
                            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                                <span className="text-muted-foreground font-mono text-xs">{p.period_start} → {p.period_end}</span>
                                <span className="font-bold">KES {Number(p.payout_amount).toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{p.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            {loading ? <div className="h-7 w-28 bg-accent/50 animate-pulse rounded" /> : <p className="text-2xl font-black">{value}</p>}
        </div>
    );
}
