'use client';

import React, { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { Clipboard, Sparkles } from 'lucide-react';

interface GreetingProps {
  userName?: string;
  className?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ userName, className = '' }) => {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  
  // Dynamic branding colors from store
  const primaryColor = activeTenant?.brand_colors?.primary || '#020617';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = userName?.split(' ')[0] || 'Member';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div 
          className="p-1 px-3 rounded-full border flex items-center gap-2"
          style={{ 
            backgroundColor: `${primaryColor}10`,
            borderColor: `${primaryColor}20`
          }}
        >
          <Sparkles className="h-3 w-3 animate-pulse" style={{ color: primaryColor }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Platform Active</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9]">
          {greeting}, <br className="sm:hidden" />
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-r"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #fb7185)` }}
          >
            {displayName}
          </span>!
        </h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md transition-all hover:border-primary/30 group">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <Clipboard className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Connected to</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
              {activeTenant?.name || 'Codevertex Network'}
            </span>
          </div>
          <div 
            className="ml-2 w-2 h-2 rounded-full shadow-lg animate-pulse"
            style={{ backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}
          />
        </div>
        
        <div className="hidden md:flex flex-col justify-center h-full px-4 border-l border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Infrastructure Status</p>
          <p className="text-xs font-bold text-slate-500">All services operational</p>
        </div>
      </div>
    </motion.div>
  );
};
