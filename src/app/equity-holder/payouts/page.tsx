'use client';

export const dynamic = 'force-dynamic';

import { useEquityPayouts } from '@/hooks/use-equity-portal';
import { motion } from 'framer-motion';
import { Inbox, Wallet } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { usePortal } from '../components/equity-portal-context';
import { formatKES } from '../components/utils';

export default function EquityPayouts() {
    const { holderID, token } = usePortal();
    const { data, isLoading } = useEquityPayouts(holderID, token);
    const payouts = data?.payouts ?? [];

    return (
        <div className="space-y-6">
            <header className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Payout History</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Complete record of all equity payouts.</p>
                </div>
            </header>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
            ) : payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Inbox className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No payouts recorded yet.</p>
                </div>
            ) : (
                <>
                    {/* Mobile: stacked cards (a 5-column money table is unreadable at 375px) */}
                    <div className="space-y-2 sm:hidden">
                        {payouts.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                        {p.period_start} → {p.period_end}
                                    </span>
                                    <StatusBadge status={p.status} />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Gross</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatKES(Number(p.payout_amount))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Tax</p>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{formatKES(Number(p.tax_amount))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Net</p>
                                        <p className="text-sm font-black text-primary">{formatKES(Number(p.net_payout || p.payout_amount))}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop/tablet: full table */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr className="text-xs text-slate-500 dark:text-slate-400">
                                    <th className="text-left px-4 py-3 font-bold">Period</th>
                                    <th className="text-right px-4 py-3 font-bold">Gross</th>
                                    <th className="text-right px-4 py-3 font-bold">Tax</th>
                                    <th className="text-right px-4 py-3 font-bold">Net</th>
                                    <th className="text-right px-4 py-3 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((p) => (
                                    <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {p.period_start} → {p.period_end}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatKES(Number(p.payout_amount))}</td>
                                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{formatKES(Number(p.tax_amount))}</td>
                                        <td className="px-4 py-3 text-right font-black">{formatKES(Number(p.net_payout || p.payout_amount))}</td>
                                        <td className="px-4 py-3 text-right">
                                            <StatusBadge status={p.status} />
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
