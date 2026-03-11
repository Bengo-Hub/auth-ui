'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { SERVICE_CATEGORIES, getServiceUrl } from '@/config/services';
import { useAuth } from '@/hooks/useAuth';
import { ServiceWithHealth, useServiceHealth } from '@/hooks/useServiceHealth';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Fingerprint, Lock, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SSOConnectionsSVG } from '@/components/ui/SSOConnectionsSVG';

// --- Components ---


function ServiceCard({ service, isAuthenticated, index }: { service: ServiceWithHealth; isAuthenticated: boolean; index: number }) {
  const Icon = service.icon;
  const statusColors = {
    live: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    beta: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'coming-soon': 'bg-slate-200/50 text-slate-500 border-slate-200',
    offline: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={getServiceUrl(service.id, isAuthenticated)}
        className={`group relative flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-primary/40 transition-all duration-300 h-full shadow-sm hover:shadow-xl hover:shadow-primary/5 ${service.status === 'coming-soon' || service.status === 'offline' ? 'opacity-70 pointer-events-none grayscale-[0.5]' : ''
          }`}
      >
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all duration-500">
            {service.svgIcon ? (
              <img src={service.svgIcon} alt={service.name} className="w-8 h-8 object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            ) : (
              <Icon className="h-7 w-7 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-all duration-500" />
            )}
          </div>
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[service.status]}`}>
            {service.status.replace('-', ' ')}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors relative z-10">
          {service.name}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1 relative z-10">
          {service.description}
        </p>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-all pt-4 border-t border-slate-100 dark:border-slate-800/80 relative z-10 mt-auto">
          {isAuthenticated ? 'Launch application' : 'Sign in to access'}
          <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { services } = useServiceHealth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredServices = useMemo(() => {
    if (!activeCategory) return services;
    return services.filter((s) => s.category === activeCategory);
  }, [activeCategory, services]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen selection:bg-primary/30 selection:text-primary-foreground font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-12 lg:pb-20 px-6 overflow-hidden">
        {/* Abstract Background Meshes */}
        <div className="absolute top-0 inset-0 w-full h-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20 flex justify-center">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 text-left">
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold shadow-sm mb-10"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Start building the future of SaaS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-8"
            >
              One Account. <br className="hidden sm:block" />
              <span className="bg-gradient-to-br from-primary via-primary to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                Endless Growth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl lg:mx-0 mx-auto mb-12 leading-relaxed"
            >
              Empower your enterprise with a premium unified identity layer. Secure access, cross-service billing, and infinite scaling for your digital ecosystem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto"
            >
              <AnimatePresence mode="wait">
                {!mounted ? (
                  <div className="w-48 h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" key="hydration-shim" />
                ) : isAuthenticated ? (
                  <Button size="lg" className="h-14 px-10 rounded-full bg-primary text-white font-bold text-lg shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_8px_40px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 transition-all group" asChild key="btn-dashboard">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : !isLoading ? (
                  <motion.div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" key="btn-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button size="lg" className="h-14 w-full sm:w-auto px-10 rounded-full bg-primary text-white font-bold text-lg shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_8px_40px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 transition-all group" asChild>
                      <Link href="/signup">
                        Start for free
                        <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto px-10 rounded-full border-slate-200 dark:border-slate-800 dark:text-white font-bold text-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <div className="w-48 h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" key="loader" />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="flex-1 w-full lg:w-auto min-h-[400px] flex items-center justify-center">
            <SSOConnectionsSVG />
          </div>
        </div>
      </section>

      {/* Services Interoperability Section */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
            <div className="max-w-2xl text-left">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Integrated <span className="text-primary font-serif italic font-normal tracking-tight">Intelligence</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Unlock a suite of composable microservices designed to manage every aspect of your enterprise—scaling independently but communicating seamlessly.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`h-10 px-5 rounded-full text-xs font-bold transition-all duration-300 ${!activeCategory ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                All
              </button>
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`h-10 px-5 rounded-full text-xs font-bold transition-all duration-300 ${activeCategory === cat.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory || 'all'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} isAuthenticated={isAuthenticated} index={idx} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Security Proof */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto scroll-m-20 bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Grid Bg */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide mb-6">
                <ShieldCheck className="w-4 h-4" /> Enterprise-Grade
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                Built for <span className="bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent">Absolute</span> Trust.
              </h2>
              <div className="space-y-10 mt-12">
                {[
                  { icon: Lock, title: 'Edge Encryption', desc: 'Secure data transit via AES-256 and TLS 1.3 protocol at every single hop across regions.' },
                  { icon: Fingerprint, title: 'Biometric MFA', desc: 'Modern WebAuthn and passkey support built directly into the authentication flow natively.' },
                  { icon: Shield, title: 'Active Threat Guard', desc: 'Real-time global threat detection, IP anomaly flagging, and automated session revoking.' }
                ].map((f, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-800/50 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                      <f.icon className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square rounded-[3rem] bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center p-12 group">
                <ShieldCheck className="w-full h-full text-slate-200 dark:text-slate-800 group-hover:scale-110 group-hover:text-primary/10 transition-all duration-1000" />

                {/* Orbital elements */}
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-10 border-[1.5px] border-dashed border-slate-300/50 dark:border-slate-600/50 rounded-full" />
                <motion.div initial={{ rotate: 360 }} animate={{ rotate: 0 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-20 border-[1px] border-solid border-primary/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-16 sm:p-24 rounded-[3rem] bg-slate-900 border border-slate-800 text-center overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tight">
                Ready to unify your digital <span className="text-primary italic font-serif font-normal">infrastructure?</span>
              </h2>
              <p className="text-slate-300 text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                Join thousands of businesses running their operations on Codevertex OS. Fast deployment, secure foundation, endless possibilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button size="lg" className="h-14 px-10 rounded-full bg-primary text-white font-bold text-lg hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(var(--primary),0.3)]" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-full bg-white/5 backdrop-blur-md border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 to-transparent opacity-50 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
