'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    ExternalLink,
    Plus,
    Settings,
    ShieldCheck,
    Users
} from 'lucide-react';

export default function TenantsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Organizations</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            Manage your organizations, team members, and service subscriptions.
          </p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" /> Create Organization
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {user?.tenants && user.tenants.length > 0 ? (
          user.tenants.map((tenant, idx) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    <Building2 className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{tenant.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-3">slug: {tenant.slug}</p>
                    <div className="flex flex-wrap gap-2">
                      {tenant.roles.map(role => (
                        <span key={role} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
                    <Users className="h-4 w-4 mr-2" /> Members
                  </Button>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                  <Button className="h-12 px-6 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
                    Switch to <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-20 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Organizations Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
              You are not a member of any organization yet. Create one to get started.
            </p>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
              Create Your First Organization
            </Button>
          </div>
        )}
      </div>

      {/* Enterprise Banner */}
      <section className="p-12 rounded-[3rem] bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="h-4 w-4" /> Enterprise Ready
          </div>
          <h2 className="text-3xl font-black mb-4">Need more control?</h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
            Unlock advanced features like SAML/SSO integration, custom domains, audit logs, and dedicated support for your entire organization.
          </p>
          <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black">
            Contact Sales <ExternalLink className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
      </section>
    </div>
  );
}
