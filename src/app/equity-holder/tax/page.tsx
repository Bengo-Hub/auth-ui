'use client';

export const dynamic = 'force-dynamic';

import { StatCard } from '@/components/dashboard/stat-card';
import { useEquityCompletedPayouts } from '../components/use-equity-portal';
import { Inbox, Receipt } from 'lucide-react';
import { usePortal } from '../components/equity-portal-context';
import { formatKES } from '../components/utils';

export default function EquityTax() {
    const { holderID, token } = usePortal();
    const { payouts, isLoading } = useEquityCompletedPayouts(holderID, token);

    const totalTax = payouts.reduce((s, p) => s + Number(p.tax_amount), 0);
    const totalGross = payouts.reduce((s, p) => s + Number(p.payout_amount), 0);
    const effectiveRatePct = totalGross > 0 ? (totalTax / totalGross) * 100 : null;

    return (
        <div className="space-y-6">
            <header className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">KRA Tax Certificates</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
                        Withholding tax deducted per payout at your applicable KRA rate (dividend, royalty, or
                        commission — resident vs. non-resident)
                        {effectiveRatePct !== null ? ` — your YTD effective rate is ${effectiveRatePct.toFixed(1)}%.` : '.'}
                    </p>
                </div>
            </header>

            <div className="max-w-xs">
                <StatCard label="Total Withholding Tax (YTD)" value={isLoading ? '—' : formatKES(totalTax)} icon={Receipt} color="rose" />
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
            ) : payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Inbox className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No completed payouts with tax records.</p>
                </div>
            ) : (
                <>
                    {/* Mobile: stacked cards */}
                    <div className="space-y-2 sm:hidden">
                        {payouts.map((p) => (
                            <div key={p.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-2">
                                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                    {p.period_start} → {p.period_end}
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Gross Payout</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatKES(Number(p.payout_amount))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Tax Withheld</p>
                                        <p className="text-sm font-black text-red-600 dark:text-red-400">{formatKES(Number(p.tax_amount))}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 italic">Certificate available on request</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop/tablet: full table */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr className="text-xs text-slate-500 dark:text-slate-400">
                                    <th className="text-left px-4 py-3 font-bold">Period</th>
                                    <th className="text-right px-4 py-3 font-bold">Gross Payout</th>
                                    <th className="text-right px-4 py-3 font-bold">Tax Withheld</th>
                                    <th className="text-right px-4 py-3 font-bold">Certificate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((p) => (
                                    <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {p.period_start} → {p.period_end}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatKES(Number(p.payout_amount))}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{formatKES(Number(p.tax_amount))}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs text-slate-400 italic">Available on request</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
