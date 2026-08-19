'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Code2,
  CreditCard,
  ExternalLink,
  FileJson,
  KeyRound,
  Layers,
  Package,
  Tag,
  Terminal,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { CodeBlock, EndpointCard, SectionHeader, fadeInUp } from '../docs-components';
import { DocsAccessGate } from '@/components/docs/DocsAccessGate';

// subscriptions-api docs page — content sourced directly from the service's own real,
// populated swagger.json (unlike auth-api's own stub spec). This is the first public
// docs surface for this service; there is no prior internal-docs page to diff against.
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL || 'https://pricingapi.codevertexafrica.com';

export default function SubscriptionsApiDocsPage() {
  return (
    <DocsAccessGate resourceKey="subscriptions-api" serviceName="Subscriptions API">
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-sky-500/20 rounded-2xl">
                <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Subscriptions API</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Plan catalog, pricing, and entitlements for the Power Suite</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
          >
            <a
              href={`${PRODUCTION_API_URL}/v1/docs/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <FileJson className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Swagger UI
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Interactive API documentation with try-it-out functionality</p>
            </a>

            <a
              href={`${PRODUCTION_API_URL}/api/v1/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <Code2 className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                OpenAPI Spec
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Download the full, populated OpenAPI 3.0 spec</p>
            </a>

            <Link
              href="/dashboard/developer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 sm:col-span-2 lg:col-span-1"
            >
              <KeyRound className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Developer Portal
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Manage OAuth clients and API credentials</p>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Quick Start</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Base URL</h3>
                <CodeBlock code={PRODUCTION_API_URL} title="Production API" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  The plan catalog below is fully public — no auth required. A Bearer token (SSO JWT) is only needed for tenant-specific or platform-admin endpoints (e.g. current subscription status, platform stats).
                </p>
                <CodeBlock
                  title="List public plans"
                  language="bash"
                  code={`curl "${PRODUCTION_API_URL}/api/v1/plans?active=true"`}
                />
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Response</h3>
                <CodeBlock
                  title="200 OK"
                  language="json"
                  code={`{
  "data": [
    {
      "id": "bb5f7b97-...",
      "planCode": "POWERSUITE_DUKA_BASIC",
      "name": "PowerSuite Retail (Duka) — Basic",
      "description": "...",
      "planType": "TIERED",
      "serviceTag": "pos",
      "basePrice": 2500,
      "setupFee": 0,
      "currency": "KES",
      "billingCycle": "MONTHLY",
      "freeTrialDays": 14,
      "tierOrder": 1,
      "tierLimits": { "outlets": 1, "staff_accounts": 5 },
      "isActive": true,
      "isPublic": true
    }
  ]
}`}
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Billing cycle rule</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Billing cycles are <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">MONTHLY</code> (1 month), <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">SEMI_ANNUAL</code> (6 months), or{' '}
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ANNUAL</code> (12 months) on the same monthly plan row — committing to 6+ months waives any one-time setup fee.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">API Endpoints</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Tag} title="Plans" badge="Public — no auth" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/plans" description="List plans — filter by ?active and ?service (pos, erp, inventory, ordering, truload, logistics, marketflow)" auth={false} />
              <EndpointCard method="GET" path="/api/v1/plans/code/{code}" description="Get a plan by code, e.g. ERP_STARTER, POWERSUITE_DUKA_BASIC" auth={false} />
              <EndpointCard method="GET" path="/api/v1/plans/{id}" description="Get a plan by UUID" auth={false} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Layers} title="Service charges" badge="Admin scope required" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/service-charges/plans" description="List usage-based service-charge plans" />
              <EndpointCard method="GET" path="/api/v1/service-charges/plans/{code}" description="Get a service-charge plan by code" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionHeader icon={CreditCard} title="Platform administration" badge="Platform owner only" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/admin/plans" description="List all plans, including inactive/non-public ones" />
              <EndpointCard method="GET" path="/api/v1/admin/plans/{id}" description="Get full admin detail for a plan" />
              <EndpointCard method="GET" path="/api/v1/platform/stats" description="Aggregated platform stats — total plans, subscriptions, MRR" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">SDK Integration</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              JavaScript / TypeScript &mdash; a public pricing page
            </h3>
            <CodeBlock
              title="Fetch live plans for a pricing page"
              language="typescript"
              code={`const res = await fetch('${PRODUCTION_API_URL}/api/v1/plans?active=true');
const { data: plans } = await res.json();

// plans[].basePrice, .currency, .billingCycle, .tierLimits, .freeTrialDays
// are all safe to render directly — this endpoint is public, no key needed.
// Fetch this server-side (not from the browser) unless your domain is on
// subscriptions-api's CORS allowlist.`}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">SDK &amp; Libraries</h2>
          </motion.div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 max-w-lg">
            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl w-fit mb-4">
              <Code2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Subscriptions API</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Go backend for the Power Suite&apos;s plan catalog, billing cycles, tier limits, and usage-based service charges.</p>
            <a href="https://github.com/Bengo-Hub/subscription-service" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors">
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-sky-500/5 to-violet-500/10 dark:from-primary/20 dark:via-sky-500/10 dark:to-violet-500/20 border border-primary/20 text-center overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Build a live pricing page</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                The plan catalog is public — pull real prices and tier limits straight into any storefront or quote tool.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/developer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <KeyRound className="w-5 h-5" />
                  Open Developer Portal
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={`${PRODUCTION_API_URL}/v1/docs/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Swagger UI
                </a>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
    </DocsAccessGate>
  );
}
