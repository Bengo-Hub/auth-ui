'use client';

import { useAuth } from '@/hooks/useAuth';
import { useServiceHealth, ServiceWithHealth } from '@/hooks/useServiceHealth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Lock,
  Fingerprint,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SERVICE_CATEGORIES, getServiceUrl } from '@/config/services';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Stats data
const STATS = [
  { label: 'Active Users', value: '10K+', icon: Users },
  { label: 'Services', value: '12+', icon: Sparkles },
  { label: 'Uptime', value: '99.9%', icon: Zap },
  { label: 'Countries', value: '5+', icon: Globe },
];

// Security features
const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data encrypted in transit and at rest using industry-standard protocols.',
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Authentication',
    description: 'Secure your account with TOTP, SMS, or hardware security keys.',
  },
  {
    icon: Shield,
    title: 'Session Management',
    description: 'View and revoke active sessions from any device, anywhere.',
  },
  {
    icon: ShieldCheck,
    title: 'OAuth 2.0 & OIDC',
    description: 'Industry-standard protocols for secure, seamless authentication.',
  },
];

// Service card component
function ServiceCard({ service, isAuthenticated, index }: {
  service: ServiceWithHealth;
  isAuthenticated: boolean;
  index: number;
}) {
  const Icon = service.icon;
  const statusColors = {
    live: 'bg-green-500',
    beta: 'bg-amber-500',
    'coming-soon': 'bg-slate-400',
    offline: 'bg-rose-500',
  };
  const statusLabels = {
    live: 'Live',
    beta: 'Beta',
    'coming-soon': 'Coming Soon',
    offline: 'Offline',
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        href={getServiceUrl(service.id, isAuthenticated)}
        className={`group relative block p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${
          service.status === 'coming-soon' || service.status === 'offline' ? 'opacity-75 pointer-events-none' : ''
        }`}
      >
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusColors[service.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${service.status === 'live' ? 'animate-pulse' : ''}`} />
            {statusLabels[service.status]}
          </span>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {service.description}
        </p>

        {/* Action */}
        {service.status !== 'coming-soon' && service.status !== 'offline' && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {isAuthenticated ? 'Launch' : 'Sign in to access'}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// Category filter component
function CategoryFilter({
  activeCategory,
  onCategoryChange
}: {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeCategory === null
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        All Services
      </button>
      {SERVICE_CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category.id
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { services, isLoading: isLoadingHealth } = useServiceHealth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    if (!activeCategory) return services;
    return services.filter((s) => s.category === activeCategory);
  }, [activeCategory, services]);

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-6">
                <ShieldCheck className="h-4 w-4" />
                <span>Unified Identity Platform</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6"
              >
                One Account.{' '}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Infinite Possibilities.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8"
              >
                Securely access all Codevertex services with a single login. Manage your profile,
                security settings, and connected applications in one place.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {isLoading ? (
                  <div className="h-12 w-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full" />
                ) : isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      Sign In
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start"
              >
                {['SOC 2 Compliant', 'GDPR Ready', '256-bit Encryption'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {badge}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Stats Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <stat.icon className="h-8 w-8 text-primary mb-3" />
                  <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Integrated Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Access the complete Codevertex ecosystem with your single account.
              Click any service to get started.
            </p>
          </motion.div>

          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory || 'all'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredServices.map((service, idx) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isAuthenticated={isAuthenticated}
                  index={idx}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No services in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your security is our priority. Built with industry-leading security
              standards and best practices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary to-blue-600 text-white text-center overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of businesses already using Codevertex to streamline
                their operations. Create your account in seconds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Create Free Account
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer trust badges */}
      <section className="py-12 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              SOC 2 Type II Compliant
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-500" />
              256-bit TLS Encryption
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              GDPR Compliant
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-purple-500" />
              FIDO2 WebAuthn Support
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
