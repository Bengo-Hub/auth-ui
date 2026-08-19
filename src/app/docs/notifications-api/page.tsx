'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Code2,
  ExternalLink,
  FileJson,
  KeyRound,
  Mail,
  MessageSquareText,
  Package,
  Send,
  Smartphone,
  Terminal,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { CodeBlock, EndpointCard, SectionHeader, fadeInUp } from '../docs-components';

// notifications-api docs page — built from a direct read of notifications-service's
// router.go and provider implementations (not the service's own internal docs, which
// are stale on the send-message path — see the Quick Start note below).
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'https://notificationsapi.codevertexafrica.com';

export default function NotificationsApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-sky-500/20 rounded-2xl">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Notifications API</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Email, SMS, push, and WhatsApp delivery for every Codevertex service</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Download the OpenAPI spec for code generation</p>
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
                  Sending a message requires either a Bearer token (SSO JWT) <em>or</em> a service-to-service{' '}
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">X-API-Key</code> header. Every other endpoint below (templates,
                  WhatsApp plans, docs, health) is public — no auth required.
                </p>
                <CodeBlock
                  title="S2S Request"
                  language="bash"
                  code={`curl -X POST "${PRODUCTION_API_URL}/api/v1/notifications/messages" \\
  -H "X-API-Key: YOUR_SERVICE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "sms",
    "tenant": "your-tenant-slug",
    "template": "your/template_key",
    "to": ["+254700000000"],
    "data": { "amount": "1,500" }
  }'`}
                />
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Response</h3>
                <CodeBlock
                  title="202 Accepted"
                  language="json"
                  code={`{
  "id": "msg_01HZY...",
  "status": "queued",
  "channel": "sms",
  "tenant": "your-tenant-slug"
}`}
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">A note on the route shape</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Older internal docs describe this as <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/v1/&#123;tenantId&#125;/notifications/messages</code>.
                  The real route has no tenant path segment — tenant is resolved from the JWT claim, the request body&apos;s <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">tenant</code> field, or an{' '}
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">X-Tenant-ID</code> header. Use the shape above.
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
            <SectionHeader icon={Send} title="Sending messages" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/api/v1/notifications/messages" description="Send a templated message on any channel (email, sms, push, whatsapp)" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={FileJson} title="Templates" badge="Public — no auth" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/templates" description="List available message templates" auth={false} />
              <EndpointCard method="GET" path="/api/v1/templates/{key}" description="Get a template's channel bodies and variables" auth={false} />
              <EndpointCard method="POST" path="/api/v1/templates/{key}/test" description="Send a test render of a template" auth={false} />
              <EndpointCard method="PUT" path="/api/v1/templates/{key}" description="Create or update a template's channel body" auth={false} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={MessageSquareText} title="WhatsApp billing" badge="Public — no auth" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/billing/whatsapp/plans" description="List WhatsApp conversation-pricing plans" auth={false} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionHeader icon={Zap} title="Service health" badge="Public — no auth" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/healthz" description="Liveness probe" auth={false} />
              <EndpointCard method="GET" path="/api/v1/readyz" description="Readiness probe" auth={false} />
              <EndpointCard method="GET" path="/api/v1/metrics" description="Prometheus metrics" auth={false} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Channels</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Mail, name: 'Email', detail: 'SendGrid, Brevo, or SMTP' },
              { icon: Smartphone, name: 'SMS', detail: "Africa's Talking, Twilio, Plivo, Vonage" },
              { icon: Bell, name: 'Push', detail: 'Firebase Cloud Messaging' },
              { icon: MessageSquareText, name: 'WhatsApp', detail: 'apiwap or Meta Cloud API' },
            ].map((c) => (
              <div key={c.name} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <c.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{c.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 max-w-2xl">
            Auth today is a single shared service key (S2S), not a per-tenant developer key. Auth API&apos;s scoped{' '}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">bng_*</code> API-key system (already reused by Treasury API&apos;s external
            routes) is the natural upgrade path if third-party developer access is ever needed here.
          </p>
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
              JavaScript / TypeScript
            </h3>
            <CodeBlock
              title="Server-side send (Next.js API route or Node service)"
              language="typescript"
              code={`const res = await fetch('${PRODUCTION_API_URL}/api/v1/notifications/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.INTERNAL_SERVICE_KEY!,
  },
  body: JSON.stringify({
    channel: 'sms',
    tenant: 'your-tenant-slug',
    template: 'your/template_key',
    to: ['+254700000000'],
    data: { amount: '1,500' },
  }),
});`}
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
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Notifications API</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Go backend for templated email, SMS, push, and WhatsApp delivery across the Power Suite.</p>
            <a href="https://github.com/Bengo-Hub/notifications-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors">
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Ready to send your first message?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Request a service key from the platform team, then try the endpoint above against the sandbox tenant.
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
  );
}
