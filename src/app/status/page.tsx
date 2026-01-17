'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Construction,
  RefreshCw,
  Server,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ServiceHealthResult {
  id: string;
  status: 'live' | 'beta' | 'coming-soon' | 'offline';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

interface HealthResponse {
  services: ServiceHealthResult[];
  checkedAt: string;
}

const SERVICE_NAMES: Record<string, string> = {
  cafe: 'Cafe Website',
  ordering: 'Order Management',
  pos: 'Point of Sale',
  logistics: 'Logistics & Delivery',
  inventory: 'Inventory Management',
  books: 'Accounting & Books',
  erp: 'Enterprise Resource Planning',
  projects: 'Project Management',
  ticketing: 'Ticketing System',
  isp: 'ISP Billing',
  truload: 'Truload Logistics',
};

const statusConfig = {
  live: {
    label: 'Operational',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-500/10',
    border: 'border-green-200 dark:border-green-500/20',
    icon: CheckCircle2,
  },
  beta: {
    label: 'Beta',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    icon: Activity,
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    icon: Construction,
  },
  offline: {
    label: 'Offline',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/20',
    icon: XCircle,
  },
};

export default function StatusPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Failed to fetch health status');
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError('Unable to fetch service status');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getOverallStatus = () => {
    if (!healthData) return null;
    const statuses = healthData.services.map((s) => s.status);
    if (statuses.every((s) => s === 'live')) return 'all-operational';
    if (statuses.some((s) => s === 'offline')) return 'partial-outage';
    return 'degraded';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  System Status
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Codevertex Platform Services
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchHealth(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overall Status Banner */}
        {!isLoading && overallStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl border ${
              overallStatus === 'all-operational'
                ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                : overallStatus === 'partial-outage'
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {overallStatus === 'all-operational' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : overallStatus === 'partial-outage' ? (
                <AlertCircle className="h-6 w-6 text-rose-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
              <div>
                <p
                  className={`font-bold ${
                    overallStatus === 'all-operational'
                      ? 'text-green-700 dark:text-green-400'
                      : overallStatus === 'partial-outage'
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {overallStatus === 'all-operational'
                    ? 'All Systems Operational'
                    : overallStatus === 'partial-outage'
                    ? 'Partial System Outage'
                    : 'Some Services Degraded'}
                </p>
                {healthData && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last checked:{' '}
                    {new Date(healthData.checkedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              <p className="font-bold text-rose-700 dark:text-rose-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              Checking service status...
            </p>
          </div>
        )}

        {/* Services List */}
        {!isLoading && healthData && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Services
            </h2>
            {healthData.services.map((service, idx) => {
              const config = statusConfig[service.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${config.border} shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
                      >
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {SERVICE_NAMES[service.id] || service.id}
                        </h3>
                        {service.error && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {service.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.responseTime && (
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {service.responseTime}ms
                        </div>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${config.bg} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">
            Status Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const StatusIcon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
