'use client';

import { motion } from 'framer-motion';
import { CreditCard, ExternalLink, FileJson, FileText, Receipt, ScrollText, Webhook } from 'lucide-react';
import { CodeBlock, EndpointCard, SectionHeader, fadeInUp } from '../docs-components';
import { DocsAccessGate } from '@/components/docs/DocsAccessGate';

// New category page (Phase 12), sourced from treasury-api's own swagger.json
// (internal/http/docs/swagger.json) rather than guessing at module names —
// its real tags are Invoicing/Invoices/Payments/Public Payments/Webhooks/
// eTIMS/External eTIMS API/Health, not the generic "ledger/invoicing/
// expenses" this plan originally speculated before checking. Swagger UI and
// OpenAPI JSON routes confirmed from internal/http/router/router.go
// (r.Get("/v1/docs/*", ...) and api.Get("/openapi.json", ...) — same shape
// as auth-api, since both are built from the same Go service template).
const TREASURY_API_URL = process.env.NEXT_PUBLIC_TREASURY_API_URL || 'https://booksapi.codevertexafrica.com';

export default function TreasuryApiDocsPage() {
  return (
    <DocsAccessGate resourceKey="treasury-api" serviceName="Treasury API">
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500/20 to-primary/20 rounded-2xl">
                <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Treasury API</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Invoicing, payments, and KRA eTIMS tax compliance for the Codevertex platform</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12"
          >
            <a
              href={`${TREASURY_API_URL}/v1/docs/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
            >
              <FileJson className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Swagger UI
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Interactive API documentation with try-it-out functionality</p>
            </a>

            <a
              href={`${TREASURY_API_URL}/api/v1/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
            >
              <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                OpenAPI Spec
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Download the OpenAPI 2.0 specification for code generation</p>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-2 mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white">Base URL</h3>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <CodeBlock code={TREASURY_API_URL} title="Production API" />
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ScrollText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">API Endpoints</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={FileText} title="Invoicing & Quotations" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/{tenantID}/invoices/bulk-archive" description="Bulk archive invoice documents" />
              <EndpointCard method="POST" path="/{tenantID}/invoices/bulk-delete" description="Bulk delete invoice documents" />
              <EndpointCard method="POST" path="/{tenantID}/quotations/bulk-archive" description="Bulk archive quotations" />
              <EndpointCard method="POST" path="/{tenantID}/quotations/bulk-delete" description="Bulk delete quotations" />
              <EndpointCard method="POST" path="/{tenant}/invoices/{invoiceID}/generate-receipt" description="Generate a payment receipt from an invoice" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={CreditCard} title="Payments" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/{tenantID}/payments/intents" description="List payment intents" />
              <EndpointCard method="POST" path="/{tenantID}/payments/intents" description="Create a payment intent" />
              <EndpointCard method="GET" path="/{tenantID}/payments/intents/{intentID}" description="Get a payment intent" />
              <EndpointCard method="POST" path="/{tenantID}/payments/intents/{intentID}/cancel" description="Cancel a payment intent" />
              <EndpointCard method="POST" path="/{tenantID}/payments/intents/{intentID}/confirm-cod" description="Confirm a cash-on-delivery payment" />
              <EndpointCard method="POST" path="/{tenantID}/payments/intents/{intentID}/confirm-manual" description="Confirm a manual (till) payment" />
              <EndpointCard method="GET" path="/api/v1/pay/{tenant}/gateways" description="List active payment gateways for a tenant" auth={false} />
              <EndpointCard method="POST" path="/api/v1/pay/{tenant}/intents" description="Create a pending payment intent (public checkout)" auth={false} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Webhook} title="Webhooks" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/webhooks/mpesa/callback" description="M-Pesa payment callback" auth={false} />
              <EndpointCard method="POST" path="/webhooks/mpesa/confirmation" description="M-Pesa C2B confirmation" auth={false} />
              <EndpointCard method="POST" path="/webhooks/mpesa/validation" description="M-Pesa C2B validation" auth={false} />
              <EndpointCard method="POST" path="/webhooks/paystack" description="Paystack payment webhook" auth={false} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionHeader icon={ScrollText} title="KRA eTIMS Tax Compliance" badge="27 endpoints" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 -mt-2">
              Kenya Revenue Authority electronic Tax Invoice Management System integration — fiscalisation, code lists, and both internal and S2S/external transmission paths.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/api/v1/tax/etims/code-lists" description="List cached KRA eTIMS code lists" />
              <EndpointCard method="POST" path="/api/v1/tax/etims/code-lists/refresh" description="Refresh KRA eTIMS code lists" />
              <EndpointCard method="POST" path="/api/v1/tax/etims/credit-note" description="Transmit a sales credit note to eTIMS" />
              <EndpointCard method="GET" path="/api/v1/s2s/{tenant}/etims-fiscal/{source}/{sourceID}" description="Get fiscalisation evidence by origin record (S2S)" />
              <EndpointCard method="POST" path="/api/v1/s2s/{tenant}/etims/sign-pos-sale" description="Sign a POS sale synchronously (S2S)" />
              <EndpointCard method="GET" path="/api/v1/external/etims/certification-status" description="Get external eTIMS API certification status" />
              <EndpointCard method="POST" path="/api/v1/external/etims/request-go-live" description="Request go-live for the external eTIMS API" />
              <EndpointCard method="POST" path="/api/v1/external/etims/sales" description="Transmit an external sale to eTIMS" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <a
            href={`${TREASURY_API_URL}/v1/docs/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5"
          >
            <ExternalLink className="w-5 h-5" />
            Open Full Swagger UI
          </a>
        </div>
      </section>
    </div>
    </DocsAccessGate>
  );
}
