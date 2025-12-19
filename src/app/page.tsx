'use client';

import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Box,
    Briefcase,
    Coffee,
    CreditCard,
    Globe,
    LayoutDashboard,
    Monitor,
    Package,
    ShieldCheck,
    Ticket,
    Truck,
    Wifi,
    Zap
} from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  {
    id: 'cafe',
    name: 'Urban Loft Cafe',
    description: 'Premium dining, business hub, and event bookings. The central hub for the Urban Loft ecosystem.',
    icon: Coffee,
    logo: '/svgs/services/cafe.svg',
    url: 'https://cafe.codevertexitsolutions.com',
    color: 'bg-orange-500',
  },
  {
    id: 'ordering',
    name: 'Ordering Service',
    description: 'Multi-tenant online ordering and delivery platform with real-time tracking and PWA support.',
    icon: Package,
    logo: '/svgs/services/ordering.svg',
    url: 'https://ordersapp.codevertexitsolutions.com',
    color: 'bg-blue-500',
  },
  {
    id: 'logistics',
    name: 'Logistics Service',
    description: 'Fleet management and real-time rider orchestration. Specialized for delivery and logistics operations.',
    icon: Truck,
    logo: '/svgs/services/logistics.svg',
    url: 'https://logistics.codevertexitsolutions.com',
    color: 'bg-green-500',
  },
  {
    id: 'inventory',
    name: 'Inventory Service',
    description: 'Real-time stock management, procurement, and recipe/BOM management across all outlets.',
    icon: Box,
    logo: '/svgs/services/inventory.svg',
    url: 'https://inventory.codevertexitsolutions.com',
    color: 'bg-amber-600',
  },
  {
    id: 'pos',
    name: 'POS Service',
    description: 'High-performance, offline-capable point of sale for retail and dining environments.',
    icon: Monitor,
    logo: '/svgs/services/pos.svg',
    url: 'https://pos.codevertexitsolutions.com',
    color: 'bg-indigo-600',
  },
  {
    id: 'finance',
    name: 'Finance Service',
    description: 'Treasury, payments, and financial reconciliation. Manage payment intents and payouts.',
    icon: CreditCard,
    logo: '/svgs/services/finance.svg',
    url: 'https://books.codevertexitsolutions.com',
    color: 'bg-purple-500',
  },
  {
    id: 'erp',
    name: 'BengoBox ERP',
    description: 'Enterprise resource planning and back-office operations including HRM, Finance, and CRM.',
    icon: LayoutDashboard,
    logo: '/svgs/services/erp.svg',
    url: 'https://erp.masterspace.co.ke',
    color: 'bg-slate-700',
  },
  {
    id: 'projects',
    name: 'Projects Service',
    description: 'Collaborative project management and task tracking for internal and client initiatives.',
    icon: Briefcase,
    logo: '/svgs/services/projects.svg',
    url: 'https://projects.codevertexitsolutions.com',
    color: 'bg-cyan-600',
  },
  {
    id: 'ticketing',
    name: 'Ticketing Service',
    description: 'Multi-tenant customer support and helpdesk with real-time updates and knowledge base.',
    icon: Ticket,
    logo: '/svgs/services/ticketing.svg',
    url: 'https://ticketing.codevertexitsolutions.com',
    color: 'bg-rose-500',
  },
  {
    id: 'isp',
    name: 'ISP Billing',
    description: 'Comprehensive billing and management for ISPs, including captive portals and SaaS marketing.',
    icon: Wifi,
    logo: '/svgs/services/isp.svg',
    url: 'https://ispbilling.codevertexitsolutions.com',
    color: 'bg-sky-500',
  },
  {
    id: 'truload',
    name: 'TruLoad',
    description: 'Axle load weighing, prosecution management, and analytics for transport authorities.',
    icon: Zap,
    logo: '/svgs/services/truload.svg',
    url: 'https://truloadtest.masterspace.co.ke',
    color: 'bg-indigo-500',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8">
              <ShieldCheck className="h-4 w-4" />
              <span>Unified Identity for BengoBox</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8">
              One Account. <br />
              <span className="text-primary">Infinite Possibilities.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 font-light leading-relaxed mb-12">
              Securely access all BengoBox services with a single login. Manage your profile, security settings, and developer tools in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {isLoading ? (
                <div className="h-12 w-48 animate-pulse bg-slate-200 rounded-full" />
              ) : isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary text-lg px-12">Go to Dashboard</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn-primary text-lg px-12">Get Started</Link>
                  <Link href="/login" className="btn-secondary text-lg px-12">Sign In</Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Integrated Services</h2>
              <p className="text-lg text-slate-600 font-light">
                Explore the BengoBox ecosystem. Click on any service to launch it or sign in to access your data.
              </p>
            </div>
            <Link href="/services" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All Services <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link 
                  href={isAuthenticated ? service.url : `/login?return_to=${encodeURIComponent(service.url)}`}
                  className="group block p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                    {service.logo ? (
                      <img 
                        src={service.logo} 
                        alt={service.name} 
                        className="h-10 w-10 object-contain brightness-0 invert" 
                      />
                    ) : (
                      <service.icon className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors">{service.name}</h3>
                  <p className="text-slate-600 font-light leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAuthenticated ? 'Launch Service' : 'Sign In to Access'} <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lightning Fast SSO</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Switch between services instantly without re-entering your credentials. Our OIDC-compliant engine handles everything.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enterprise Security</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Multi-factor authentication, session management, and real-time threat detection keep your account safe.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Global Reach</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Access your data from anywhere in the world. Our distributed architecture ensures low latency and high availability.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
