'use client';

import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Shield,
    User
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      label: 'Active Sessions',
      value: '2',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Organizations',
      value: user?.tenants?.length || 0,
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Security Status',
      value: 'Secure',
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-12">
      <header>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Welcome back, <span className="text-primary">{user?.name || user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
            Manage your BengoBox account, security, and organization settings.
          </p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/dashboard/profile"
            className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-orange-500" />
              </div>
              <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 font-light">Change your display name, email, and profile picture.</p>
          </Link>

          <Link 
            href="/dashboard/security"
            className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-blue-500" />
              </div>
              <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Security Settings</h3>
            <p className="text-slate-600 dark:text-slate-400 font-light">Manage your password, MFA, and active login sessions.</p>
          </Link>
        </div>
      </section>

      {/* Recent Activity Placeholder */}
      <section className="p-8 rounded-[2rem] bg-slate-900 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold">Successful Login</p>
                <p className="text-sm text-slate-400">Today at 10:45 AM • Nairobi, Kenya</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold">Profile Updated</p>
                <p className="text-sm text-slate-400">Yesterday at 4:20 PM</p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
      </section>
    </div>
  );
}
