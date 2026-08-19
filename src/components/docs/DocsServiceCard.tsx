'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDocsAccess } from '@/hooks/useDocsAccess';
import { fadeInUp } from '@/app/docs/docs-components';

export interface DocsServiceCardData {
  slug: string;
  name: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  tagline: string;
  readme: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string; icon: typeof CheckCircle2 } | null> = {
  none: null,
  approved: { label: 'Access approved', className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  pending: { label: 'Request pending', className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400', icon: Clock },
  in_review: { label: 'Under review', className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400', icon: Clock },
  rejected: { label: 'Request not approved', className: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400', icon: XCircle },
};

export function DocsServiceCard({ s, index }: { s: DocsServiceCardData; index: number }) {
  const { isLoggedIn, isLoading, status } = useDocsAccess(s.slug);
  const badge = isLoggedIn && !isLoading ? STATUS_BADGE[status] : null;

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: index * 0.05 }}>
      <Link
        href={`/docs/${s.slug}`}
        className={`group block p-6 sm:p-7 rounded-2xl bg-gradient-to-br ${s.color} border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/70 dark:bg-slate-900/50 rounded-xl">
            <s.icon className={`w-6 h-6 ${s.iconColor}`} />
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{s.name}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{s.tagline}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">{s.readme}</p>
        {badge && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
            <badge.icon className="w-3 h-3" />
            {badge.label}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
