'use client';

import { usePortal } from '../layout';
import { useEffect, useState } from 'react';

const TREASURY_API = process.env.NEXT_PUBLIC_TREASURY_API_URL || 'https://finance.codevertexitsolutions.com';

interface Payout {
    id: string;
    period_start: string;
    period_end: string;
    gross_revenue: number;
    tax_amount: number;
    payout_amount: number;
    net_payout: number;
    status: string;
    provider_reference?: string;
    created_at: string;
}

export default function EquityPayouts() {
    const { holderID, token } = usePortal();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${TREASURY_API}/api/v1/platform/equity-holders/${holderID}/payouts`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setPayouts(d.payouts ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [holderID, token]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Payout History</h1>
                <p className="text-muted-foreground text-sm mt-1">Complete record of all equity payouts</p>
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
            ) : payouts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No payouts recorded yet.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-accent/30">
                            <tr className="text-xs text-muted-foreground">
                                <th className="text-left px-4 py-3 font-medium">Period</th>
                                <th className="text-right px-4 py-3 font-medium">Gross</th>
                                <th className="text-right px-4 py-3 font-medium">Tax</th>
                                <th className="text-right px-4 py-3 font-medium">Net</th>
                                <th className="text-right px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p) => (
                                <tr key={p.id} className="border-t border-border hover:bg-accent/5">
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {p.period_start} → {p.period_end}
                                    </td>
                                    <td className="px-4 py-3 text-right">KES {Number(p.payout_amount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">KES {Number(p.tax_amount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold">KES {Number(p.net_payout || p.payout_amount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            p.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                                            p.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                                            'bg-yellow-500/10 text-yellow-600'
                                        }`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
