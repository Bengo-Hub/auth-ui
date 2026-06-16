'use client';

import { useEffect, useState } from 'react';
import {
  Database,
  Download,
  FileArchive,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Save,
  CalendarClock,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface BackupSettings {
  auto_enabled: boolean;
  schedule_hour: number;
  retention_days: number;
}

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  auto_enabled: false,
  schedule_hour: 2,
  retention_days: 4,
};

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${period}`;
}

interface BackupEntry {
  filename: string;
  size: string;
  created_at: number;
}

interface BackupManifest {
  backups: BackupEntry[];
}

interface DownloadProgress {
  loaded: number;
  total: number;
}

function formatDate(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString();
}

function timeAgo(unixTimestamp: number): string {
  const diff = Date.now() - unixTimestamp * 1000;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
}

const SIX_DAYS_SECS = 6 * 24 * 3600;
const TWENTY_FIVE_HOURS_SECS = 25 * 3600;

function isOveraged(unixTimestamp: number): boolean {
  return (Date.now() / 1000 - unixTimestamp) > SIX_DAYS_SECS;
}

function isRecentBackupMissing(backups: BackupEntry[]): boolean {
  if (backups.length === 0) return false;
  const newest = Math.max(...backups.map((b) => b.created_at));
  return (Date.now() / 1000 - newest) > TWENTY_FIVE_HOURS_SECS;
}

function AutoBackupCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Default OFF before data loads.
  const [form, setForm] = useState<BackupSettings>(DEFAULT_BACKUP_SETTINGS);
  const [dirty, setDirty] = useState(false);

  const { data: settings, isLoading } = useQuery<BackupSettings>({
    queryKey: ['platform-backup-settings'],
    queryFn: async () => {
      const response = await apiClient.get<BackupSettings>('/api/v1/admin/backups/settings');
      return (response as any)?.data ?? response;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Seed the form from server data once loaded (and whenever it refetches while clean).
  useEffect(() => {
    if (settings && !dirty) {
      setForm({
        auto_enabled: !!settings.auto_enabled,
        schedule_hour: Number.isFinite(settings.schedule_hour) ? settings.schedule_hour : 2,
        retention_days: Number.isFinite(settings.retention_days) ? settings.retention_days : 4,
      });
    }
  }, [settings, dirty]);

  const mutation = useMutation({
    mutationFn: async (payload: BackupSettings) => {
      const response = await apiClient.put<BackupSettings>('/api/v1/admin/backups/settings', payload);
      return (response as any)?.data ?? response;
    },
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['platform-backup-settings'] });
      toast({ title: 'Saved', description: 'Automatic backup settings updated.' });
    },
    onError: () => {
      toast({
        title: 'Save failed',
        description: 'Could not update automatic backup settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const update = (patch: Partial<BackupSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const enabled = form.auto_enabled;

  return (
    <div className="rounded-lg border">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
        <CalendarClock className="h-4 w-4" />
        <h2 className="font-semibold text-sm">Automatic platform backups</h2>
      </div>

      <div className="p-4 space-y-5">
        <p className="text-sm text-muted-foreground">
          When enabled, auth-api runs a daily platform-wide <code className="text-xs bg-muted px-1 py-0.5 rounded">pg_dumpall</code>{' '}
          disaster-recovery backup of the entire cluster. This is OFF by default and must be activated here.
        </p>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Enable automatic backups</p>
            <p className="text-xs text-muted-foreground">Runs once daily at the scheduled hour.</p>
          </div>
          <Switch
            checked={enabled}
            disabled={isLoading || mutation.isPending}
            onCheckedChange={(checked) => update({ auto_enabled: checked })}
            aria-label="Enable automatic platform backups"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="backup-hour">
              Backup hour (service-local)
            </label>
            <select
              id="backup-hour"
              value={form.schedule_hour}
              disabled={!enabled || isLoading || mutation.isPending}
              onChange={(e) => update({ schedule_hour: parseInt(e.target.value, 10) })}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground shadow-sm transition-all duration-150 focus-visible:border-brand-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emphasis focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHourLabel(h)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="retention-days">
              Retention (days)
            </label>
            <Input
              id="retention-days"
              type="number"
              min={1}
              value={form.retention_days}
              disabled={!enabled || isLoading || mutation.isPending}
              onChange={(e) => update({ retention_days: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!dirty || isLoading || mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BackupsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const {
    data: manifest,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<BackupManifest>({
    queryKey: ['platform-backups'],
    queryFn: async () => {
      const response = await apiClient.get<BackupManifest>('/api/v1/admin/backups');
      return (response as any)?.data ?? response;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const handleDownload = async (filename: string) => {
    try {
      setDownloading(filename);
      setProgress({ loaded: 0, total: 0 });

      // Use fetch API with streaming for real-time progress tracking
      const baseURL = apiClient.defaults.baseURL || '';
      const response = await fetch(`${baseURL}/api/v1/admin/backups/${filename}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      setProgress({ loaded: 0, total });

      // Stream the response body with progress tracking
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming not supported');

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        setProgress({ loaded, total });
      }

      // Combine chunks and trigger download
      const blob = new Blob(chunks as BlobPart[], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download backup. Please try again.');
    } finally {
      setDownloading(null);
      setProgress(null);
    }
  };

  const backups = manifest?.backups ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Backups
          </h1>
          <p className="text-muted-foreground mt-1">
            PostgreSQL backups are created daily at 2:00 AM UTC and retained for 6 days.
            Download before they are automatically removed.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Backups are retained for 6 days only
          </p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Download any backup you need to keep before it is automatically deleted.
            Backups include all databases (pg_dumpall) and can be restored with <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">psql -f backup.sql</code>.
          </p>
        </div>
      </div>

      {/* Automatic platform backup activation (opt-in, default OFF) */}
      <AutoBackupCard />

      {/* No-recent-backup alert — fires when the newest backup is >25h old */}
      {!isLoading && !error && backups.length > 0 && isRecentBackupMissing(backups) && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800 dark:text-red-200">
              Backup CronJob may have stopped running
            </p>
            <p className="text-red-700 dark:text-red-300 mt-1">
              No backup has been created in the last 25 hours. Check the{' '}
              <code className="text-xs bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded">
                postgresql-backup
              </code>{' '}
              CronJob in the <strong>infra</strong> namespace:
              {' '}<code className="text-xs bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded">
                kubectl get cronjob postgresql-backup -n infra
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Backups list */}
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Available Backups</h2>
          <Badge variant="outline">{backups.length} file{backups.length !== 1 ? 's' : ''}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load backups. The backup service may not be running.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileArchive className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No backups available yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              The next backup will be created at 2:00 AM UTC.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {backups.map((backup) => {
              const isDownloading = downloading === backup.filename;
              const pct = progress && progress.total > 0
                ? Math.round((progress.loaded / progress.total) * 100)
                : null;
              const aged = isOveraged(backup.created_at);

              return (
                <div
                  key={backup.filename}
                  className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileArchive className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium font-mono truncate">
                          {backup.filename}
                        </p>
                        {aged && (
                          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400 shrink-0">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{backup.size}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(backup.created_at)}
                        </span>
                        <span>{formatDate(backup.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isDownloading && progress && (
                      <span className="text-xs font-mono text-muted-foreground tabular-nums">
                        {progress.total > 0
                          ? `${formatBytes(progress.loaded)}/${formatBytes(progress.total)} (${pct}%)`
                          : formatBytes(progress.loaded)}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(backup.filename)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">
                        {isDownloading && pct !== null ? `${pct}%` : 'Download'}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
