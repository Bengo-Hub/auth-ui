'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionApi, Plan } from '@/lib/subscription-api';

export default function PricingPage() {
  const { activeTenant } = useAuthStore();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPlans();
        setPlans(data.sort((a, b) => a.tier_order - b.tier_order));
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);
  
  const SUBSCRIPTIONS_BASE_URL = 'https://subscriptions.codevertexitsolutions.com';
  
  const getPlanHref = (plan: Plan) => {
    const returnTo = `${SUBSCRIPTIONS_BASE_URL}/plans?plan=${plan.plan_code.toLowerCase()}`;
    if (isAuthenticated && activeTenant) {
      return `${SUBSCRIPTIONS_BASE_URL}/${activeTenant.slug}/plans?plan=${plan.plan_code.toLowerCase()}`;
    }
    return `/signup?return_to=${encodeURIComponent(returnTo)}&plan=${plan.plan_code.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary/30 font-sans text-slate-900 dark:text-white">
      <div className="pt-24 pb-16 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
            >
              <ShieldCheck className="h-4 w-4" /> Trusted by 1,000+ Teams
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black mb-6"
            >
              Simple, Transparent <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Pricing.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              Scale your application security and identity management without breaking the bank. Choose the plan that fits your journey.
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[600px] rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`relative flex flex-col p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border ${
                    plan.plan_code === 'GROWTH' || plan.plan_code === 'PRO' 
                      ? 'border-primary shadow-2xl shadow-primary/10' 
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {(plan.plan_code === 'GROWTH' || plan.plan_code === 'PRO') && (
                    <div className="absolute top-0 right-0 -translate-y-1/2 -translate-x-8 px-4 py-1 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-5xl font-black">
                        {plan.base_price > 0 ? `${plan.currency === 'USD' ? '$' : 'KSh'}${plan.base_price}` : 'Free'}
                      </span>
                      {plan.base_price > 0 && <span className="text-slate-500 font-bold">/{plan.billing_cycle.toLowerCase().replace('_', '')}</span>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 mb-10">
                    {plan.features?.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/10 shrink-0">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{feature.name}</span>
                      </div>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                      <div className="text-slate-400 text-xs italic">Full platform access included</div>
                    )}
                  </div>

                  <Button
                    variant={(plan.plan_code === 'GROWTH' || plan.plan_code === 'PRO') ? 'default' : 'outline'}
                    className={`w-full h-14 rounded-2xl font-black text-lg transition-all ${
                      (plan.plan_code === 'GROWTH' || plan.plan_code === 'PRO')
                        ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' 
                        : 'border-slate-200 dark:border-slate-700 dark:text-white'
                    }`}
                    asChild
                  >
                    <Link href={getPlanHref(plan)}>
                      {plan.base_price === 0 ? 'Get Started' : 'Subscribe Now'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-12 rounded-[3.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden"
          >
            <div className="relative z-10 max-w-xl">
              <div className="p-3 w-fit rounded-2xl bg-white/10 mb-6">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase">Organizations</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Managing multiple teams or a large workforce? Our organizational plans provide 
                granular control, centralized billing, and advanced governance.
              </p>
            </div>
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg" asChild>
                <Link href="mailto:enterprise@codevertexitsolutions.com">Request a Demo</Link>
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[140px] -mr-48 -mt-48" />
          </motion.div>
        </div>

        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      </div>
    </div>
  );
}
