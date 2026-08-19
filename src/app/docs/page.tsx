'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Book, Clock, Key, Receipt } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp } from './docs-components';

/**
 * API Docs hub (Phase 12) — rebuilt from a single, 100% auth-api-scoped page
 * into a categorized landing hub. Only services with real, hosted API docs
 * get a live category page (confirmed via each service's own router.go);
 * everything else is an honest "coming soon" card rather than fabricated
 * content, per this phase's own explicit scope.
 */
const LIVE_SERVICES = [
  {
    slug: 'auth-api',
    name: 'Auth API',
    icon: Key,
    color: 'from-primary/20 to-sky-500/20',
    iconColor: 'text-primary',
    tagline: 'Identity, SSO, OAuth2/OIDC, and tenant management.',
    readme: 'Read this if you’re integrating login, single sign-on, or managing OAuth clients for a service.',
  },
  {
    slug: 'treasury-api',
    name: 'Treasury API',
    icon: Receipt,
    color: 'from-emerald-500/20 to-primary/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagline: 'Invoicing, payments, and KRA eTIMS tax compliance.',
    readme: 'Read this if you’re building billing, payment collection, or Kenyan e-invoicing/fiscalisation.',
  },
];

const COMING_SOON_SERVICES = [
  { name: 'POS API', tagline: 'Point-of-sale transactions and till management.' },
  { name: 'Inventory API', tagline: 'Stock, warehouses, and adjustments.' },
  { name: 'Library API', tagline: 'Catalog, circulation, and member management.' },
  { name: 'Notifications API', tagline: 'Email, SMS, and push delivery.' },
];

export default function DocsHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-sky-500/20 rounded-2xl">
              <Book className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">API Documentation</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Reference docs for every Codevertex service with a published API.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Available now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {LIVE_SERVICES.map((s, i) => (
                <motion.div key={s.slug} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.05 }}>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">{s.readme}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Coming soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMING_SOON_SERVICES.map((s) => (
                <div
                  key={s.name}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 opacity-70"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coming soon</span>
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{s.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
