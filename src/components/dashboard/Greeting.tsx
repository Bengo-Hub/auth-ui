'use client';

import React, { useMemo } from 'react';
import { useTenant } from '@/components/providers/tenant-provider';

interface GreetingProps {
  userName?: string;
  className?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ userName, className = '' }) => {
  const { tenant } = useTenant();
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = userName?.split(' ')[0] || 'Member';

  return (
    <div className={`space-y-1 ${className}`}>
      <h2 className="text-2xl font-black tracking-tight text-primary-brand md:text-3xl">
        {greeting}, <span className="text-brand-orange">{displayName}</span>!
      </h2>
      <p className="text-sm font-medium text-secondary-brand opacity-70 flex items-center gap-2">
        <span>Connected to</span>
        <span className="px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest border border-brand-orange/20">
          {tenant?.orgName || tenant?.name || 'Codevertex Network'}
        </span>
      </p>
    </div>
  );
};
