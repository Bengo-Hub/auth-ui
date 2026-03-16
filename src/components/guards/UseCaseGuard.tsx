'use client';

import React from 'react';
import { useUseCaseConfig } from '@/hooks/useUseCaseConfig';
import { Loader2 } from 'lucide-react';

interface UseCaseGuardProps {
  /**
   * The feature name to check for in the configuration.
   * If provided, the children will only be shown if this feature is enabled.
   */
  feature?: string;
  /**
   * Specific use cases to allow.
   */
  allow?: string[];
  /**
   * Specific use cases to deny.
   */
  deny?: string[];
  /**
   * What to show while loading the configuration.
   */
  loadingComponent?: React.ReactNode;
  /**
   * What to show if the check fails.
   */
  fallback?: React.ReactNode;
  /**
   * The content to protect.
   */
  children: React.ReactNode;
}

/**
 * UseCaseGuard protects components based on the active tenant's use case.
 */
export function UseCaseGuard({
  feature,
  allow,
  deny,
  loadingComponent = <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>,
  fallback = null,
  children,
}: UseCaseGuardProps) {
  const { data: config, isLoading } = useUseCaseConfig();

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!config) {
    return <>{fallback}</>;
  }

  // Deny check
  if (deny && deny.includes(config.use_case)) {
    return <>{fallback}</>;
  }

  // Allow check
  if (allow && !allow.includes(config.use_case)) {
    return <>{fallback}</>;
  }

  // Feature check
  if (feature && !config.features.includes(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
