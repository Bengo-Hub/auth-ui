import {
  AlertCircle,
  CheckCircle2,
  Cookie,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Shield,
  TrendingUp,
  UserCheck,
  Users2
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Codevertex IT Solutions',
  description:
    'Privacy Policy for Codevertex IT Solutions and the Codevertex SSO / accounts identity platform. Learn how we collect, use, and protect your personal data.',
};

const LAST_UPDATED = 'April 27, 2026';
const EFFECTIVE_DATE = 'Jan 01, 2022';

const TOC = [
  { id: 'overview', label: '1. Overview & Scope' },
  { id: 'collection', label: '2. Data We Collect' },
  { id: 'usage', label: '3. How We Use Your Data' },
  { id: 'sharing', label: '4. Third-Party Sharing' },
  { id: 'google-ads', label: '5. Google Ads API Data' },
  { id: 'cookies', label: '6. Cookies & Tracking' },
  { id: 'security', label: '7. Security Measures' },
  { id: 'retention', label: '8. Data Retention' },
  { id: 'rights', label: '9. Your Rights' },
  { id: 'international', label: '10. International Transfers' },
  { id: 'children', label: '11. Children\'s Privacy' },
  { id: 'changes', label: '12. Policy Changes' },
  { id: 'contact', label: '13. Contact & DPO' },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen py-24">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">
            Last updated: <strong>{LAST_UPDATED}</strong> · Effective: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            Codevertex IT Solutions (&quot;Codevertex&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
            your personal information and your right to privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our services, including the Codevertex
            SSO platform at{' '}
            <Link href="/" className="text-primary underline">
              accounts.codevertexitsolutions.com
            </Link>{' '}
            and any other application within our ecosystem.
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> By accessing or using any Codevertex service, you acknowledge that
              you have read, understood, and agree to this Privacy Policy. If you disagree, please do not use
              our services.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-16 items-start">
          {/* Sticky TOC */}
          <aside className="hidden md:block sticky top-28 h-fit">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Contents</p>
            <nav className="flex flex-col gap-1">
              {TOC.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-sm text-slate-500 hover:text-primary hover:translate-x-1 transition-all py-1 px-3 rounded-lg hover:bg-primary/5"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
              <p className="text-xs font-bold text-slate-500 mb-2">Data Protection</p>
              <a
                href="mailto:info@codevertexitsolutions.com"
                className="text-xs text-primary hover:underline break-all"
              >
                info@codevertexitsolutions.com
              </a>
              <p className="text-xs text-slate-400 mt-1">Pioneer House, 2nd Floor,<br />Oginga Street, Kisumu, Kenya</p>
            </div>
          </aside>

          {/* Main Content */}
          <article className="space-y-16 prose prose-slate dark:prose-invert max-w-none">
            {/* 1. Overview */}
            <section id="overview">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Overview &amp; Scope</h2>
              </div>
              <p>
                This Privacy Policy applies to all services operated by <strong>Codevertex IT Solutions</strong>{' '}
                (also trading as Bengo Hub), a technology company registered in Kenya with its principal office at
                Pioneer House, 2nd Floor, Oginga Street, Kisumu, Kenya.
              </p>
              <p>
                The services covered include, but are not limited to:
              </p>
              <ul>
                <li><strong>Codevertex SSO</strong> — accounts.codevertexitsolutions.com (identity and authentication gateway)</li>
                <li><strong>MarketFlow CRM</strong> — marketflow.codevertexitsolutions.com (AI marketing automation)</li>
                <li><strong>Codevertex ERP, POS, ISP Billing, TruLoad, Books, Projects, Ordering App</strong> — all *.codevertexitsolutions.com subdomains</li>
                <li>Any mobile application, API endpoint, or service that links to this Privacy Policy</li>
              </ul>
              <p>
                Where a specific product has its own supplementary privacy notice, that notice should be read
                alongside this policy.
              </p>
            </section>

            {/* 2. Data We Collect */}
            <section id="collection">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Data We Collect</h2>
              </div>
              <p>
                We collect information that you provide directly, information collected automatically when you use
                our services, and information from third-party sources where you have authorised it.
              </p>

              <h3>2.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Registration:</strong> Name, email address, and password (hashed; we never store plaintext passwords).</li>
                <li><strong>Business Information:</strong> Business or organisation name, website URL, and industry, collected during onboarding for multi-tenant services such as MarketFlow.</li>
                <li><strong>Contact &amp; Support:</strong> Any information you send us via email, support tickets, or feedback forms.</li>
                <li><strong>Billing &amp; Payment:</strong> Payment method details (processed by PCI-DSS certified third parties; we do not store raw card numbers), billing address, and transaction history.</li>
                <li><strong>Profile Data:</strong> Profile photo and display name you optionally provide.</li>
              </ul>

              <h3>2.2 Information Collected Automatically</h3>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, timestamps, session duration, and click-through events within our platform.</li>
                <li><strong>Device &amp; Browser Information:</strong> IP address, browser type and version, operating system, screen resolution, and preferred language.</li>
                <li><strong>Authentication Logs:</strong> Login timestamps, IP addresses, device identifiers, and OAuth provider used (Google, Microsoft, or GitHub), retained for security and fraud prevention.</li>
                <li><strong>API Usage Metrics:</strong> API call counts, response times, and error rates for monitoring and quota management purposes.</li>
              </ul>

              <h3>2.3 Information from Third-Party OAuth Providers</h3>
              <p>
                When you sign in via Google, Microsoft, or GitHub, we receive only the basic profile information
                you have permitted: your <strong>name</strong>, <strong>email address</strong>, and{' '}
                <strong>profile photo</strong>. We do not request access to your contacts, calendar, drive,
                or any other resource beyond identity verification.
              </p>

              <h3>2.4 Information from Third-Party Advertising APIs (MarketFlow Tenants)</h3>
              <p>
                MarketFlow tenants who voluntarily connect their advertising accounts grant us access to
                campaign performance metrics (impressions, clicks, cost, conversions) for reporting purposes
                only. See Section 5 for the Google Ads API data policy.
              </p>
            </section>

            {/* 3. How We Use Data */}
            <section id="usage">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. How We Use Your Data</h2>
              </div>
              <p>We use personal data only for the purposes disclosed to you at the time of collection:</p>
              <ul>
                <li><strong>Service Delivery:</strong> Authenticating your identity across the Codevertex ecosystem; providing access to the applications you subscribe to.</li>
                <li><strong>Security &amp; Fraud Prevention:</strong> Detecting and preventing unauthorised access, credential stuffing, brute-force attacks, and abuse.</li>
                <li><strong>Product Improvement:</strong> Understanding feature usage patterns (in aggregate or pseudonymous form) to prioritise development.</li>
                <li><strong>Customer Support:</strong> Resolving technical issues, responding to enquiries, and maintaining audit trails for dispute resolution.</li>
                <li><strong>Billing &amp; Subscription Management:</strong> Processing payments, issuing invoices, and managing subscription lifecycle events.</li>
                <li><strong>Marketing Communications:</strong> Sending product updates, security notices, and (where you have opted in) promotional content. You may opt out at any time.</li>
                <li><strong>Legal Compliance:</strong> Complying with Kenyan law, responding to lawful requests from government authorities, and enforcing our Terms of Service.</li>
              </ul>
              <p>
                We do <strong>not</strong> use your data to build profiles for sale to third parties, for
                political advertising, or for any purpose that has not been disclosed in this policy.
              </p>
            </section>

            {/* 4. Third-Party Sharing */}
            <section id="sharing">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Third-Party Sharing &amp; Disclosure</h2>
              </div>
              <p>
                <strong>We do not sell, rent, or trade your personal data.</strong> We may share data only
                in the following limited circumstances:
              </p>

              <h3>4.1 Service Providers (Data Processors)</h3>
              <p>
                We engage trusted third-party vendors who process data on our behalf under strict data
                processing agreements:
              </p>
              <ul>
                <li><strong>Infrastructure Hosting:</strong> Our services run on a self-managed Kubernetes cluster hosted on a dedicated Contabo VPS server located in their European data centre (Grand Est, France, EU). No customer data is shared with the hosting provider beyond what is inherent in running workloads on their hardware. Data is encrypted in transit (TLS 1.2+) and at rest (AES-256-GCM).</li>
                <li><strong>Payment Processing:</strong> Paystack and other PCI-DSS certified payment gateways process card transactions. We receive only a tokenized reference, not raw card data.</li>
                <li><strong>Email Delivery:</strong> Transactional emails (password resets, security alerts) are sent via our Notifications Engine, which may relay to an SMTP provider.</li>
                <li><strong>Error Monitoring:</strong> Aggregated, anonymised crash reports may be sent to internal monitoring tools (Prometheus, Grafana Loki) with PII stripped at log time.</li>
              </ul>

              <h3>4.2 Advertising APIs (MarketFlow Only)</h3>
              <p>
                For MarketFlow tenants who connect their accounts, data is shared with advertising platforms
                solely to fulfil the features the tenant has requested:
              </p>
              <ul>
                <li><strong>Google Ads API:</strong> Campaign metrics are fetched for the tenant&apos;s own account. Offline conversion events are uploaded with the tenant&apos;s Google Click ID (gclid), monetary value, and conversion timestamp — no PII is attached.</li>
                <li><strong>Meta Graph API:</strong> Lead and ad performance data for the tenant&apos;s own Meta Business account. No cross-tenant data sharing occurs.</li>
              </ul>

              <h3>4.3 Legal Disclosures</h3>
              <p>
                We may disclose your information where required by law, court order, or government authority,
                or where necessary to protect the rights, property, or safety of Codevertex, our users, or
                the public.
              </p>

              <h3>4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of all or part of our assets, user data may
                be transferred. We will notify you by email and/or a prominent notice on our website at least
                30 days before any such transfer and before your data becomes subject to a different privacy
                policy.
              </p>
            </section>

            {/* 5. Google Ads API Data */}
            <section id="google-ads">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Google Ads API Data</h2>
              </div>
              <p>
                This section supplements the Google API Services User Data Policy. MarketFlow uses the
                Google Ads API exclusively on behalf of tenants who explicitly authorise access via Google
                OAuth 2.0. The following principles govern how we handle Google Ads data:
              </p>
              <ul>
                <li><strong>Authorisation is explicit and tenant-initiated.</strong> We never silently link or access a Google Ads account. The tenant must complete a Google OAuth consent screen that clearly lists the requested scope (<code>https://www.googleapis.com/auth/adwords</code>).</li>
                <li><strong>Data is used only for tenant-facing features.</strong> Campaign metrics, conversion data, and ad performance are displayed only in the connecting tenant&apos;s own MarketFlow dashboard. We never combine data across tenants&apos; accounts.</li>
                <li><strong>We do not sell Google Ads data.</strong> Data retrieved via the Google Ads API is never shared with third parties for advertising or any commercial purpose beyond providing the contracted MarketFlow features.</li>
                <li><strong>Refresh tokens are encrypted.</strong> Google OAuth refresh tokens are encrypted with AES-256-GCM and stored in a private PostgreSQL database with no public ingress. They are never logged and never accessible to Codevertex staff.</li>
                <li><strong>Revocation is immediate.</strong> When a tenant disconnects their Google Ads account, the refresh token is deleted and the row is marked inactive within the same request. No further API calls are made.</li>
                <li><strong>Conversion Uploads contain no PII.</strong> Offline conversion uploads include only the Google Click ID (gclid), a conversion timestamp, a monetary value, and a currency code — all provided or approved by the tenant.</li>
              </ul>
              <p>
                MarketFlow&apos;s use of Google Ads API data conforms to the{' '}
                <strong>Google API Services User Data Policy</strong> and the{' '}
                <strong>Google Ads API Terms of Service</strong>. We do not use Google Ads data for
                profiling, remarketing outside the tenant&apos;s account, or any secondary purpose.
              </p>
            </section>

            {/* 6. Cookies */}
            <section id="cookies">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Cookie className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Cookies &amp; Tracking Technologies</h2>
              </div>
              <p>We use the following types of cookies and similar technologies:</p>
              <div className="not-prose overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#1a1a1a]">
                      <th className="text-left px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">Type</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">Purpose</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Essential / Session', 'Authentication session tokens, CSRF protection, theme preference.', 'Session or up to 30 days'],
                      ['Functional', 'Remember your language and UI preferences.', 'Up to 1 year'],
                      ['Analytics (Internal)', 'Aggregate usage metrics (no third-party analytics tools). Anonymised page-view counts only.', 'Up to 90 days'],
                      ['Security', 'IP-based rate-limiting and abuse prevention tokens.', 'Up to 24 hours'],
                    ].map(([type, purpose, duration]) => (
                      <tr key={type as string} className="border-b border-slate-100 dark:border-white/5">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">{type}</td>
                        <td className="px-4 py-3 text-slate-500 border border-slate-200 dark:border-white/10">{purpose}</td>
                        <td className="px-4 py-3 text-slate-500 border border-slate-200 dark:border-white/10">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We do <strong>not</strong> use third-party tracking pixels, social media tracking widgets, or
                behavioural advertising cookies. You can configure cookie preferences in your browser settings;
                disabling essential cookies will prevent authentication from functioning.
              </p>
            </section>

            {/* 7. Security */}
            <section id="security">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. Security Measures</h2>
              </div>
              <p>
                We implement a security-first architecture. Our key technical and organisational measures
                include:
              </p>
              <ul>
                <li><strong>Encryption at Rest:</strong> All sensitive fields (OAuth tokens, API keys, secrets) are encrypted with AES-256-GCM using a 32-byte key managed via Kubernetes SealedSecrets.</li>
                <li><strong>Encryption in Transit:</strong> All communication between your browser and our services uses TLS 1.2+ (enforced; HTTP is redirected to HTTPS). Inter-service communication uses TLS with API key authentication.</li>
                <li><strong>Authentication Standards:</strong> Our SSO gateway implements OAuth 2.0, OpenID Connect, and optional WebAuthn (passkey) multi-factor authentication.</li>
                <li><strong>Access Controls:</strong> Role-based access control (RBAC) with a <code>platform_owner</code> claim required for all administrative operations. Tenant users cannot access other tenants&apos; data by design.</li>
                <li><strong>Audit Logging:</strong> All administrative actions, authentication events, and provider setting changes are recorded in an append-only <code>audit_logs</code> table. Audit entries cannot be modified or deleted by users.</li>
                <li><strong>Vulnerability Management:</strong> Regular dependency scanning and security reviews. We have a documented incident response procedure.</li>
                <li><strong>No-Log Policy for Secrets:</strong> Bearer tokens, refresh tokens, and passwords are never written to application logs. Structured logs (zap) strip PII at emit time.</li>
              </ul>
              <p>
                While we apply industry-leading security practices, no system is 100% secure. If you discover
                a security vulnerability, please disclose it responsibly to{' '}
                <a href="mailto:developers@codevertexitsolutions.com" className="text-primary">
                  developers@codevertexitsolutions.com
                </a>
                .
              </p>
            </section>

            {/* 8. Retention */}
            <section id="retention">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">8. Data Retention</h2>
              </div>
              <p>We retain your data only as long as necessary for the purpose it was collected:</p>
              <div className="not-prose overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#1a1a1a]">
                      <th className="text-left px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">Data Category</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Account profile data', 'Until account deletion request + 30-day grace period'],
                      ['Authentication / security logs', '90 days (rolling)'],
                      ['Audit trail logs', '2 years (legal obligation)'],
                      ['Billing and transaction records', '7 years (Kenya Tax Act compliance)'],
                      ['Google Ads OAuth refresh tokens', 'Until tenant disconnects or account is deleted; immediately purged on revocation'],
                      ['Campaign performance metrics (MarketFlow)', '90 days in PostgreSQL; then aggregated anonymised summaries retained indefinitely'],
                      ['Support ticket content', '2 years after ticket closure'],
                      ['Application crash / error logs', '30 days (automatic rotation)'],
                    ].map(([category, period]) => (
                      <tr key={category as string} className="border-b border-slate-100 dark:border-white/5">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">{category}</td>
                        <td className="px-4 py-3 text-slate-500 border border-slate-200 dark:border-white/10">{period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 9. User Rights */}
            <section id="rights">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">9. Your Rights</h2>
              </div>
              <p>
                Depending on your jurisdiction, you may have the following rights regarding your personal data.
                We honour all reasonable requests within 30 days:
              </p>
              <ul>
                <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data. You can update most information directly in your account settings.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request deletion of your personal data. Note that some data may be retained for legal compliance (see Section 8).</li>
                <li><strong>Right to Restriction:</strong> Request that we restrict processing of your data while a dispute is resolved.</li>
                <li><strong>Right to Data Portability:</strong> Request an export of your account data in a machine-readable format (JSON or CSV).</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests, including any direct marketing.</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw it at any time without affecting prior processing.</li>
                <li><strong>Right to Disconnect Integrations:</strong> You may revoke access to any third-party integration (Google Ads, Meta, GitHub) at any time from your account settings. Revocation takes effect immediately.</li>
              </ul>
              <p>
                To exercise any of these rights, contact our Data Protection at{' '}
                <a href="mailto:info@codevertexitsolutions.com" className="text-primary">
                  info@codevertexitsolutions.com
                </a>{' '}
                with the subject line <strong>&quot;Data Rights Request — [Your Name]&quot;</strong>.
              </p>
            </section>

            {/* 10. International */}
            <section id="international">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">10. International Data Transfers</h2>
              </div>
              <p>
                Codevertex is headquartered in Kisumu, Kenya. Our production infrastructure runs on a
                dedicated Contabo VPS server physically located in the <strong>European Union (Grand Est,
                France)</strong>, which means your data at rest is stored within EU jurisdiction and is
                subject to EU data protection standards, including GDPR-compliant practices enforced by
                Contabo GmbH as the infrastructure provider. Where data is transmitted to or from Kenya
                for operational purposes, we apply appropriate contractual and technical safeguards. We
                do not knowingly transfer personal data to jurisdictions without an adequate level of
                data protection without appropriate safeguards.
              </p>
            </section>

            {/* 11. Children */}
            <section id="children">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">11. Children&apos;s Privacy</h2>
              </div>
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect
                personal data from children. If you believe we have inadvertently collected information from
                a minor, please contact us immediately at{' '}
                <a href="mailto:info@codevertexitsolutions.com" className="text-primary">
                  info@codevertexitsolutions.com
                </a>{' '}
                and we will delete it promptly.
              </p>
            </section>

            {/* 12. Changes */}
            <section id="changes">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">12. Policy Changes</h2>
              </div>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, legal
                requirements, or service features. Material changes will be:
              </p>
              <ul>
                <li>Posted on this page with an updated &quot;Last updated&quot; date.</li>
                <li>Communicated to active account holders by email at least 14 days before the changes take effect.</li>
                <li>Presented as an in-product notice requiring acknowledgement where the change significantly affects how we process your data.</li>
              </ul>
              <p>
                Your continued use of our services after the effective date constitutes acceptance of the
                revised policy.
              </p>
            </section>

            {/* 13. Contact */}
            <section id="contact">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">13. Contact &amp; Data Protection</h2>
              </div>
              <p>
                If you have questions about this Privacy Policy, wish to exercise your rights, or wish to
                report a concern, please contact us:
              </p>
              <div className="not-prose grid sm:grid-cols-2 gap-4 mt-6">
                {[
                  { icon: Mail, label: 'General & Privacy Enquiries', value: 'info@codevertexitsolutions.com', href: 'mailto:info@codevertexitsolutions.com' },
                  { icon: Mail, label: 'Legal & Compliance', value: 'legal@codevertexitsolutions.com', href: 'mailto:legal@codevertexitsolutions.com' },
                  { icon: Mail, label: 'Developer / API', value: 'developers@codevertexitsolutions.com', href: 'mailto:developers@codevertexitsolutions.com' },
                  { icon: MapPin, label: 'Registered Office', value: 'Pioneer House, 2nd Floor, Oginga Street, Kisumu, Kenya', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-primary hover:underline break-all">{value}</a>
                      ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Compliance badges */}
            <section className="not-prose">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Compliance Standards</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Google API Services User Data Policy',
                    'Google Ads API Required Minimum Functionality',
                    'OAuth 2.0 / OpenID Connect Security Standards',
                    'Kenya Data Protection Act, 2019',
                    'AES-256-GCM Encryption at Rest',
                    'TLS 1.2+ Encryption in Transit',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </article>
        </div>        
      </div>
    </main>
  );
}
