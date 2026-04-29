'use client';

import { usePortal } from '../layout';
import { useEffect, useState } from 'react';

const TREASURY_API = process.env.NEXT_PUBLIC_TREASURY_API_URL || 'https://finance.codevertexitsolutions.com';

interface Payout {
    id: string;
    period_start: string;
    period_end: string;
    tax_amount: number;
    payout_amount: number;
    status: string;
}

export default function EquityTax() {
    const { holderID, token } = usePortal();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${TREASURY_API}/api/v1/platform/equity-holders/${holderID}/payouts`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setPayouts((d.payouts ?? []).filter((p: Payout) => p.status === 'completed')))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [holderID, token]);

    const totalTax = payouts.reduce((s, p) => s + Number(p.tax_amount), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">KRA Tax Certificates</h1>
                <p className="text-muted-foreground text-sm mt-1">Withholding tax deducted per payout (KRA rates: 10% individual / 15% corporate)</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 inline-block">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Withholding Tax (YTD)</p>
                {loading ? (
                    <div className="h-7 w-28 bg-accent/50 animate-pulse rounded mt-1" />
                ) : (
                    <p className="text-2xl font-black mt-1">KES {totalTax.toLocaleString()}</p>
                )}
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
            ) : payouts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No completed payouts with tax records.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-accent/30">
                            <tr className="text-xs text-muted-foreground">
                                <th className="text-left px-4 py-3 font-medium">Period</th>
                                <th className="text-right px-4 py-3 font-medium">Gross Payout</th>
                                <th className="text-right px-4 py-3 font-medium">Tax Withheld</th>
                                <th className="text-right px-4 py-3 font-medium">Certificate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p) => (
                                <tr key={p.id} className="border-t border-border hover:bg-accent/5">
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {p.period_start} → {p.period_end}
                                    </td>
                                    <td className="px-4 py-3 text-right">KES {Number(p.payout_amount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">KES {Number(p.tax_amount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-xs text-muted-foreground italic">Available on request</span>
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
