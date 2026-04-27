import {
  Award,
  BarChart2,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Shield,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Codevertex IT Solutions',
  description:
    "Codevertex IT Solutions is a premier technology firm headquartered in Kisumu, Kenya. Learn about our mission to architect Africa's digital renaissance through enterprise software, AI, and talent development.",
};

const STATS = [
  { value: '2020', label: 'Founded', icon: Building2 },
  { value: '200+', label: 'Professionals Trained', icon: GraduationCap },
  { value: '10+', label: 'Integrated Platforms', icon: Cpu },
  { value: '3+', label: 'Strategic Partners', icon: Award },
];

const SERVICE_PILLARS = [
  {
    icon: GraduationCap,
    title: 'Digitika Academy',
    subtitle: 'Talent Development & Workforce Enablement',
    desc: 'Closing the critical skills gap between education and global industry demands. We offer ICDL Workforce certification programs and specialized bootcamps in Machine Learning, Software Architecture, Full-Stack Development, and Cloud Engineering.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Cpu,
    title: 'Enterprise Software Solutions',
    subtitle: 'Bespoke Digital Platforms',
    desc: 'We convert business complexity into elegant, scalable solutions. From high-availability web portals and mobile-first applications to tailored ERP, CRM, HRM, and workflow automation systems designed to drive operational efficiency.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Zap,
    title: 'Network & Hardware Automations',
    subtitle: 'IoT Integrations & Zero-Touch Operations',
    desc: 'At the intersection of physical infrastructure and digital intelligence. Our flagship TruLoad platform delivers tamper-proof axle-load compliance, while our ISP automation suite provides zero-touch network lifecycle management.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: BarChart2,
    title: 'AI & Advanced Analytics',
    subtitle: 'Predictive Intelligence & Business BI',
    desc: 'Transforming raw data into actionable strategic intelligence. We deploy NLP-powered chatbots, predictive modeling, demand forecasting, and executive BI dashboards via Power BI, Apache Superset, and custom visualization frameworks.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Shield,
    title: 'Secure Cloud Infrastructure',
    subtitle: 'Enterprise-Grade Availability & Resilience',
    desc: 'Providing the reliable backbone for Africa\'s emerging digital economy. Fully managed cloud environments with automated backups, disaster recovery, end-to-end AES-256 encryption, and domain management for .co.ke, .com, and .africa.',
    color: 'from-rose-500 to-red-600',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: TrendingUp,
    title: 'MarketFlow CRM',
    subtitle: 'AI-Powered Marketing Automation',
    desc: 'Our flagship SaaS platform for SMBs and direct-selling entrepreneurs. MarketFlow provides AI-driven lead capture, nurture sequences, and a unified cross-platform dashboard integrating Google Ads, Meta, and TikTok analytics.',
    color: 'from-pink-500 to-fuchsia-600',
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
  },
];

const POWER_SUITE = [
  {
    name: 'ERP',
    focus: 'Corporates & SMEs',
    value: 'Unified finance, HR, procurement, and CRM in a single modular platform.',
  },
  {
    name: 'TruLoad',
    focus: 'Transport & Axle Load Compliance',
    value: 'Real-time fleet management, axle-load monitoring, and compliance analytics.',
  },
  {
    name: 'POS',
    focus: 'Retail, Hospitality, QSR',
    value: 'Robust, offline-capable point-of-sale with inventory and sales intelligence.',
  },
  {
    name: 'ISP Billing',
    focus: 'Telecommunications & ISPs',
    value: 'Automated network provisioning, subscriber billing, and captive portal management.',
  },
  {
    name: 'MarketFlow CRM',
    focus: 'Marketing & Direct Sales',
    value: 'AI-powered lead automation, cross-platform ad analytics, and funnel management.',
  },
  {
    name: 'Notifications Engine',
    focus: 'Cross-Industry',
    value: 'Secure, centralized SMS, email, push, and in-app notification delivery.',
  },
  {
    name: 'Books & Projects',
    focus: 'Finance, Construction, SMEs',
    value: 'Integrated financial reconciliation, payment gateways, and project tracking.',
  },
];

const TRACK_RECORD = [
  {
    sector: 'Public Sector',
    icon: Building2,
    detail: 'Delivered customized ICDL training to over 200 corporate staff under the Digital Economy ICT Initiative.',
  },
  {
    sector: 'Higher Education',
    icon: GraduationCap,
    detail: 'Equipped more than 120 students at Maseno University (MUCISA) with coding, digital entrepreneurship, and employability skills.',
  },
  {
    sector: 'Private Sector',
    icon: TrendingUp,
    detail: 'Led end-to-end digital transformation for Danka Africa Ltd, a prominent regional energy company.',
  },
  {
    sector: 'Strategic Partnerships',
    icon: Users,
    detail: 'Long-term collaborations with KCA University, Future Hubs Kenya, and industry technology leaders.',
  },
];

const COMPETITIVE_ADVANTAGES = [
  {
    title: 'End-to-End Value Chain',
    desc: 'A true one-stop technology partner for software development, AI, cloud infrastructure, hosting, domain services, and talent development.',
  },
  {
    title: 'Security-First Architecture',
    desc: 'OAuth 2.0, OpenID Connect, AES-256-GCM encryption, and secure-by-design principles embedded at every layer of our stack.',
  },
  {
    title: 'Modular Scalability',
    desc: 'SSO-centric design enables rapid onboarding of new SaaS modules without disrupting existing workflows or integrations.',
  },
  {
    title: 'Africa-Focused Innovation',
    desc: 'Purpose-built for African market realities: mobile-first design, local payment gateways, and multilingual support.',
  },
  {
    title: 'Future-Proof Orientation',
    desc: 'Deep investment in AI and emerging technologies positions our clients for success in the intelligent economy of 2030 and beyond.',
  },
  {
    title: 'Unified SSO Ecosystem',
    desc: 'One account grants seamless, frictionless access across our entire growing suite of SaaS solutions — no per-app logins.',
  },
];

export default function AboutUsPage() {
  return (
    <main className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-8">
            <Globe className="w-3.5 h-3.5" /> Established Kisumu, Kenya — 2020
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] mb-8 max-w-4xl">
            Architecting Africa's{' '}
            <span className="bg-gradient-to-br from-primary via-primary to-indigo-500 bg-clip-text text-transparent">
              Digital Renaissance.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-12">
            Codevertex IT Solutions is a purpose-driven technology enterprise committed to closing the digital
            divide and shaping the future of African commerce and industry. We go beyond software development —
            we design and deploy integrated digital ecosystems.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="mailto:info@codevertexitsolutions.com"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-white font-bold text-sm hover:-translate-y-0.5 transition-all shadow-[0_8px_30px_rgba(var(--primary),0.3)]"
            >
              <Mail className="w-4 h-4" /> Contact Us
            </Link>
            <Link
              href="https://codevertexitsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-primary/40 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Visit Website
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To serve as the preeminent catalyst for Africa's digital sovereignty, creating a future where
                equitable access to technology fuels broad-based continental prosperity.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To empower African enterprises, governments, and communities through inclusive, innovative, and
                practical technology solutions that modernize workforces, digitize economies, and unlock
                sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Service Pillars */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Core Service Pillars</h2>
            <p className="text-lg text-slate-500 max-w-2xl">
              Five integrated pillars that together form the Codevertex Unified Ecosystem — covering every
              dimension of digital transformation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_PILLARS.map(({ icon: Icon, title, subtitle, desc, bg, text }) => (
              <div
                key={title}
                className="group p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a] hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${text} mb-6`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
                <p className={`text-xs font-bold uppercase tracking-wider ${text} mb-4`}>{subtitle}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Power Suite Table */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
              <BookOpen className="w-3 h-3" /> Power Suite
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Integrated Business Applications
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl">
              A unified suite of SaaS products, all accessible through the Codevertex Single Sign-On identity
              platform — one account, endless capability.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="grid grid-cols-3 bg-slate-50 dark:bg-[#1a1a1a] px-6 py-4 border-b border-slate-200 dark:border-white/5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Solution</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Industry Focus</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Value</p>
            </div>
            {POWER_SUITE.map(({ name, focus, value }, i) => (
              <div
                key={name}
                className={`grid grid-cols-3 px-6 py-5 gap-4 items-start ${i < POWER_SUITE.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
                <p className="text-sm text-primary font-medium">{focus}</p>
                <p className="text-sm text-slate-500">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MarketFlow & Google Ads API Purpose */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                <TrendingUp className="w-3 h-3" /> MarketFlow CRM — API Compliance
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                How We Use the Google Ads API
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">MarketFlow</strong> is our AI-powered
                marketing automation SaaS platform hosted at{' '}
                <a
                  href="https://marketflow.codevertexitsolutions.com"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  marketflow.codevertexitsolutions.com
                </a>
                . It is designed to empower African SMEs and direct-selling entrepreneurs. We utilize the
                Google Ads API exclusively on behalf of our tenants — small-business owners who explicitly
                connect their own Google Ads accounts via OAuth 2.0.
              </p>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400 mb-8">
                {[
                  'Read-only campaign performance reporting inside the tenant\'s MarketFlow dashboard.',
                  'Server-side offline Conversion Upload when a MarketFlow-hosted lead converts.',
                  'AI-drafted campaign suggestions — the tenant reviews and approves before any write action.',
                  'No cross-tenant data access — every API call is scoped to the authenticated tenant\'s own account.',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Privacy Policy <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Terms of Service <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a]">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Security Architecture</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  All Google Ads refresh tokens are encrypted with AES-256-GCM at rest. Credentials are
                  stored in PostgreSQL inside a private Kubernetes cluster with no public ingress. Tokens
                  are never logged, never exposed to staff, and automatically rotated.
                </p>
              </div>
              <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a]">
                <div className="flex items-center gap-3 mb-4">
                  <Wifi className="w-6 h-6 text-primary flex-shrink-0" />
                  <h4 className="font-bold text-slate-900 dark:text-white">OAuth 2.0 + OpenID Connect</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  MarketFlow's entire authentication and authorization chain is built on industry-standard
                  OAuth 2.0 and OpenID Connect, hosted at{' '}
                  <span className="font-mono text-xs text-primary">accounts.codevertexitsolutions.com</span>.
                  No user ever shares passwords with our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Track Record */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Proven Track Record
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl">
              Institutional credibility earned through real outcomes across public, education, and private sectors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TRACK_RECORD.map(({ sector, icon: Icon, detail }) => (
              <div
                key={sector}
                className="flex gap-6 p-8 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{sector}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Our Competitive Advantages
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPETITIVE_ADVANTAGES.map(({ title, desc }) => (
              <div key={title} className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1a]">
                <CheckCircle2 className="w-6 h-6 text-primary mb-4" />
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">{title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Physical Address */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">Get in Touch</h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                Whether you are a prospective client, partner, or developer interested in our APIs — we
                respond to all inquiries within one business day.
              </p>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Registered Office</p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Pioneer House, 2nd Floor<br />
                      Oginga Street, Kisumu<br />
                      Kenya
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Corporate Email</p>
                    <a
                      href="mailto:info@codevertexitsolutions.com"
                      className="text-primary text-sm hover:underline"
                    >
                      info@codevertexitsolutions.com
                    </a>
                    <br />
                    <a
                      href="mailto:support@codevertexitsolutions.com"
                      className="text-slate-500 text-sm hover:underline"
                    >
                      support@codevertexitsolutions.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Phone</p>
                    <a href="tel:+254743793901" className="text-slate-500 text-sm hover:text-primary transition-colors">
                      +254 743 793 901
                    </a>
                    <br />
                    <a href="tel:+254792548766" className="text-slate-500 text-sm hover:text-primary transition-colors">
                      +254 792 548 766
                    </a>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Website</p>
                    <a
                      href="https://codevertexitsolutions.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      codevertexitsolutions.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Developer & API Inquiries
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                For technical questions about our APIs, integration partnerships, or the Google Ads API
                implementation in MarketFlow, please use the dedicated developer contact.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Developer Contact</p>
                    <a
                      href="mailto:developers@codevertexitsolutions.com"
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      developers@codevertexitsolutions.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Legal & Compliance</p>
                    <a
                      href="mailto:legal@codevertexitsolutions.com"
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      legal@codevertexitsolutions.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">SSO / Identity Platform</p>
                    <a
                      href="https://accounts.codevertexitsolutions.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      accounts.codevertexitsolutions.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>     
    </main>
  );
}
