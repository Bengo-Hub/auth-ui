'use client';

import { motion } from 'framer-motion';
import { Bell, Book, Clock, CreditCard, Key, Receipt } from 'lucide-react';
import { fadeInUp } from './docs-components';
import { DocsServiceCard } from '@/components/docs/DocsServiceCard';

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
  {
    slug: 'notifications-api',
    name: 'Notifications API',
    icon: Bell,
    color: 'from-sky-500/20 to-primary/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    tagline: 'Email, SMS, push, and WhatsApp delivery.',
    readme: 'Read this if you’re sending templated messages — reminders, receipts, or alerts — across any channel.',
  },
  {
    slug: 'subscriptions-api',
    name: 'Subscriptions API',
    icon: CreditCard,
    color: 'from-amber-500/20 to-primary/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagline: 'Plan catalog, pricing, and entitlements.',
    readme: 'Read this if you’re building a pricing page, quote tool, or need real plan/tier data.',
  },
];

const COMING_SOON_SERVICES = [
  { name: 'POS API', tagline: 'Point-of-sale transactions and till management.' },
];

export default function DocsHubPage() {
  return (
    <div className="-mx-6 -mt-6 lg:-mx-12 lg:-mt-12">
      <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
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
                <DocsServiceCard key={s.slug} s={s} index={i} />
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
