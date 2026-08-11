'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  XCircle,
} from 'lucide-react';

interface NodeStat {
  name: string;
  ready: boolean;
  cpu_capacity: string;
  cpu_usage: string;
  cpu_percent: number;
  mem_capacity: string;
  mem_usage: string;
  mem_percent: number;
  disk_capacity: string;
  disk_usage: string;
  disk_percent: number;
}

interface PodStat {
  namespace: string;
  name: string;
  cpu: string;
  memory: string;
}

interface NamespaceSummary {
  name: string;
  status: string;
  pod_count: number;
  age_days: number;
}

interface PVCSummary {
  namespace: string;
  name: string;
  status: string;
  capacity: string;
  storage_class: string;
}

interface IngressSummary {
  namespace: string;
  name: string;
  hosts: string[];
}

interface CronJobStatus {
  namespace: string;
  name: string;
  schedule: string;
  suspended: boolean;
  last_scheduled?: string;
  last_successful?: string;
  healthy: boolean;
}

interface MailStats {
  available: boolean;
  queue_depth: number;
}

interface Overview {
  generated_at: string;
  nodes: NodeStat[];
  top_pods: PodStat[];
  namespaces: NamespaceSummary[];
  pvcs: PVCSummary[];
  ingresses: IngressSummary[];
  cronjobs: CronJobStatus[];
  mail: MailStats;
}

function usageBarColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function UsageBar({ label, pct, detail }: { label: string; pct: number; detail: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${usageBarColor(pct)}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{detail}</p>
    </div>
  );
}

function timeAgo(iso?: string): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'less than an hour ago';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PlatformMonitoringPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<Overview>({
    queryKey: ['platform-monitor-overview'],
    queryFn: async () => {
      const response = await apiClient.get<Overview>('/api/v1/admin/platform-monitor/overview');
      return (response as any)?.data ?? response;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const unhealthyCronJobs = (data?.cronjobs ?? []).filter((c) => !c.suspended && !c.healthy);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Infrastructure Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Live cluster and VPS state — replaces the removed Prometheus/Grafana stack.
            {data && (
              <span className="ml-1 text-xs">
                Last updated {new Date(data.generated_at).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Failed to load cluster state</p>
            <p className="text-muted-foreground mt-1">
              This dashboard requires auth-api to be running in-cluster with the
              auth-api-monitor ServiceAccount. Not available in local dev.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* CronJob health — the highest-value signal: catches silently-failing */}
          {/* maintenance jobs before disk/resources become a crisis. */}
          <div className="rounded-lg border">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="font-semibold text-sm">CronJob Health</h2>
              {unhealthyCronJobs.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                  {unhealthyCronJobs.length} unhealthy
                </span>
              ) : (
                <Badge variant="outline">all healthy</Badge>
              )}
            </div>
            <div className="divide-y">
              {(data?.cronjobs ?? [])
                .slice()
                .sort((a, b) => Number(a.healthy) - Number(b.healthy))
                .map((cj) => (
                  <div
                    key={`${cj.namespace}/${cj.name}`}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {cj.suspended ? (
                        <Badge variant="outline" className="shrink-0">
                          suspended
                        </Badge>
                      ) : cj.healthy ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {cj.namespace}/{cj.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{cj.schedule}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      <p>scheduled {timeAgo(cj.last_scheduled)}</p>
                      <p>succeeded {timeAgo(cj.last_successful)}</p>
                    </div>
                  </div>
                ))}
              {(data?.cronjobs ?? []).length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No CronJobs found.
                </p>
              )}
            </div>
          </div>

          {/* Mail queue — Stalwart's only signal not visible from k8s resource
              metrics alone; email-provisioner exposes it via a small internal
              endpoint (see plan Part 13.3). */}
          <div className="rounded-lg border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mail Queue (Stalwart)</span>
            </div>
            {!data?.mail?.available ? (
              <Badge variant="outline">unavailable</Badge>
            ) : (
              <span className="text-sm font-mono tabular-nums">
                {data.mail.queue_depth} queued
              </span>
            )}
          </div>

          {/* Nodes */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.nodes ?? []).map((n) => (
              <div key={n.name} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{n.name}</span>
                  </div>
                  {n.ready ? (
                    <Badge variant="outline">Ready</Badge>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                      Not Ready
                    </span>
                  )}
                </div>
                <UsageBar
                  label="CPU"
                  pct={n.cpu_percent}
                  detail={`${n.cpu_usage || '—'} / ${n.cpu_capacity}`}
                />
                <UsageBar
                  label="Memory"
                  pct={n.mem_percent}
                  detail={`${n.mem_usage || '—'} / ${n.mem_capacity}`}
                />
                <UsageBar
                  label="Disk"
                  pct={n.disk_percent}
                  detail={`${n.disk_usage || '—'} / ${n.disk_capacity || '—'}`}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top pods by memory */}
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h2 className="font-semibold text-sm">Top Pods (by memory)</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {(data?.top_pods ?? []).map((p) => (
                  <div
                    key={`${p.namespace}/${p.name}`}
                    className="px-4 py-2 flex items-center justify-between text-sm"
                  >
                    <span className="truncate min-w-0 mr-2">
                      <span className="text-muted-foreground">{p.namespace}/</span>
                      {p.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {p.cpu} · {p.memory}
                    </span>
                  </div>
                ))}
                {(data?.top_pods ?? []).length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    metrics-server unavailable.
                  </p>
                )}
              </div>
            </div>

            {/* Namespaces */}
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Namespaces</h2>
                <Badge variant="outline">{(data?.namespaces ?? []).length}</Badge>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {(data?.namespaces ?? [])
                  .slice()
                  .sort((a, b) => b.pod_count - a.pod_count)
                  .map((ns) => (
                    <div
                      key={ns.name}
                      className="px-4 py-2 flex items-center justify-between text-sm"
                    >
                      <span className="truncate min-w-0 mr-2">{ns.name}</span>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {ns.pod_count} pods · {ns.age_days}d
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* PVCs */}
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Persistent Volume Claims</h2>
                <Badge variant="outline">{(data?.pvcs ?? []).length}</Badge>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {(data?.pvcs ?? []).map((pvc) => (
                  <div
                    key={`${pvc.namespace}/${pvc.name}`}
                    className="px-4 py-2 flex items-center justify-between text-sm"
                  >
                    <span className="truncate min-w-0 mr-2">
                      <span className="text-muted-foreground">{pvc.namespace}/</span>
                      {pvc.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {pvc.capacity} · {pvc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingresses */}
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Ingress Hosts</h2>
                <Badge variant="outline">{(data?.ingresses ?? []).length}</Badge>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {(data?.ingresses ?? []).map((ing) => (
                  <div
                    key={`${ing.namespace}/${ing.name}`}
                    className="px-4 py-2 flex items-center justify-between text-sm"
                  >
                    <span className="truncate min-w-0 mr-2">
                      <span className="text-muted-foreground">{ing.namespace}/</span>
                      {ing.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0 truncate max-w-[50%]">
                      {ing.hosts.join(', ') || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
