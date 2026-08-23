'use client';

export const dynamic = 'force-dynamic';

import { useEquityPayouts } from '../components/use-equity-portal';
import { ArrowRight, Clock, Inbox, LayoutDashboard, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';
import { usePortal } from '../components/equity-portal-context';
import { formatKES } from '../components/utils';

export default function EquityDashboard() {
    const { holderID, token } = usePortal();
    const { data, isLoading } = useEquityPayouts(holderID, token);
    const payouts = data?.payouts ?? [];

    const totalEarned = payouts.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.payout_amount), 0);
    const pending = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.payout_amount), 0);

    return (
        <div className="space-y-8">
            <header className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your equity earnings summary.</p>
                </div>
            </header>

            {/* Hero balance card — the primary number a holder opens this portal to see */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-rose-500 p-6 sm:p-10 text-white shadow-xl shadow-primary/25">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-black/10 blur-3xl" />
                <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Total Earned</p>
                    <p className="text-4xl sm:text-5xl font-black mt-2 tabular-nums">
                        {isLoading ? '—' : formatKES(totalEarned)}
                    </p>
                    <div className="flex flex-wrap gap-x-10 gap-y-4 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Pending Payout</p>
                                <p className="text-lg font-black tabular-nums">{isLoading ? '—' : formatKES(pending)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Total Payouts</p>
                                <p className="text-lg font-black tabular-nums">{isLoading ? '—' : payouts.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Recent Payouts</h2>
                    {payouts.length > 0 && (
                        <Link
                            href={`/equity-holder/payouts?token=${encodeURIComponent(token)}`}
                            className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all"
                        >
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Inbox className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No payouts yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {payouts.slice(0, 6).map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-sm hover:shadow-md hover:border-primary/20 transition-all"
                            >
                                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs shrink-0">
                                    {p.period_start} → {p.period_end}
                                </span>
                                <span className="font-black text-slate-900 dark:text-white ml-auto">{formatKES(Number(p.payout_amount))}</span>
                                <StatusBadge status={p.status} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
