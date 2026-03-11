'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Box,
  Cpu,
  FolderKanban,
  Landmark,
  Network,
  ShieldCheck,
  ShoppingBag,
  Store,
  Ticket,
  Truck,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function SSOConnectionsSVG() {
  const services = [
    { name: 'Ordering', caption: 'Online Orders & Delivery', icon: ShoppingBag, angle: 0, color: '#f59e0b' },
    { name: 'Inventory', caption: 'Stock Control', icon: Box, angle: 30, color: '#10b981' },
    { name: 'POS', caption: 'Point of Sale', icon: Store, angle: 60, color: '#3b82f6' },
    { name: 'Projects', caption: 'Tenders & Projects', icon: FolderKanban, angle: 90, color: '#8b5cf6' },
    { name: 'Treasury', caption: 'Finance & Payments', icon: Landmark, angle: 120, color: '#6366f1' },
    { name: 'SSO', caption: 'Identity', icon: ShieldCheck, angle: 150, color: '#0ea5e9' },
    { name: 'Notifications', caption: 'Emails, WhatsApp & SMS', icon: Bell, angle: 180, color: '#ec4899' },
    { name: 'Ticketing', caption: 'Support', icon: Ticket, angle: 210, color: '#f43f5e' },
    { name: 'Logistics', caption: 'Shipping & Delivery', icon: Truck, angle: 240, color: '#8b5cf6' },
    { name: 'ISP Billing', caption: 'Hotspot, PPPoE & Billing', icon: Network, angle: 270, color: '#06b6d4' },
    { name: 'IoT Service', caption: 'Smart Hub', icon: Cpu, angle: 300, color: '#14b8a6' },
    { name: 'TruLoad', caption: 'Weighbridge & Axle Load', icon: Zap, angle: 330, color: '#f59e0b' },
  ];

  const [radius, setRadius] = useState(210);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setRadius(130);
        setIsMobile(true);
      } else if (width < 1024) {
        setRadius(170);
        setIsMobile(false);
      } else {
        setRadius(210);
        setIsMobile(false);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-8 opacity-0">
        <ShieldCheck className="w-12 h-12 text-primary/20" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />

      {/* Connecting Lines (Animated) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {services.map((s, i) => {
          const x2 = 250 + radius * Math.cos((s.angle * Math.PI) / 180);
          const y2 = 250 + radius * Math.sin((s.angle * Math.PI) / 180);

          return (
            <g key={i}>
              <motion.line
                x1="250" y1="250"
                x2={x2} y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary/20 dark:text-primary/10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, repeatType: 'loop', repeatDelay: 2 }}
              />
              <motion.circle
                cx={x2} cy={y2} r="4"
                className="fill-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              />
            </g>
          );
        })}

        {/* Orbital Rings */}
        <circle cx="250" cy="250" r={radius} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200/50 dark:text-slate-800/50" />
        <circle cx="250" cy="250" r={radius - 40} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200/30 dark:text-slate-800/30" />
      </svg>

      {/* Central SSO Gateway */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border-2 border-primary/20 flex flex-col items-center justify-center gap-2 group hover:border-primary/50 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-ping" />
        <ShieldCheck className="w-12 h-12 text-primary" />
        <span className="text-sm font-black tracking-tighter">SSO GATEWAY</span>

        {/* Floating Particles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 border border-dashed border-primary/40 rounded-full pointer-events-none"
        />
      </motion.div>

      {/* Surrounding Services */}
      {services.map((s, i) => {
        const x = radius * Math.cos((s.angle * Math.PI) / 180);
        const y = radius * Math.sin((s.angle * Math.PI) / 180);

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x, y, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15, delay: i * 0.1 }}
            className="absolute z-20 flex flex-col items-center"
          >
            <div className={`flex flex-col items-center gap-1 group transition-all duration-300 ${isMobile ? 'scale-75' : 'scale-100'}`}>
              <div
                className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ borderColor: `${s.color}44` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm whitespace-nowrap">
                  {s.name}
                </span>
                <span className="text-[7px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {s.caption}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Accents */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-primary/20 blur-sm"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-1/4 left-1/4 w-6 h-6 rounded-full bg-indigo-500/20 blur-sm"
      />
    </div>
  );
}
