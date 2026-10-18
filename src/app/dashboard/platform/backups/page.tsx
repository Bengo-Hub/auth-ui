'use client';

import { useMemo, useState } from 'react';
import { Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import {
  buildBackupColumns,
  type BackupManifest,
  type DownloadProgress,
} from './backups-columns';

const TWENTY_FIVE_HOURS_SECS = 25 * 3600;

function isRecentBackupMissing(backups: { created_at: number }[]): boolean {
  if (backups.length === 0) return false;
  const newest = Math.max(...backups.map((b) => b.created_at));
  return (Date.now() / 1000 - newest) > TWENTY_FIVE_HOURS_SECS;
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

  const columns = useMemo(
    () => buildBackupColumns({ downloading, progress, onDownload: handleDownload }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [downloading, progress],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Backups
          </h1>
          <p className="text-muted-foreground mt-1">
            The <code className="text-xs bg-muted px-1 py-0.5 rounded">postgresql-backup</code> CronJob dumps every
            database daily at 2:00 AM UTC. The newest dump is listed here; the newest 3 are kept on Cloudflare R2.
            Tenants download their own data from My Organization, Backups.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto"
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
            Only the newest dump stays on the cluster volume
          </p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Each night replaces it (older ones remain on R2 for three days). Dumps include all databases
            (pg_dumpall) and can be restored with <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">psql -f backup.sql</code>.
          </p>
        </div>
      </div>

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
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Available Backups</h2>
        <Badge variant="outline">{backups.length} file{backups.length !== 1 ? 's' : ''}</Badge>
      </div>

      <DataTable
        columns={columns}
        rows={backups}
        rowKey={(b) => b.filename}
        loading={isLoading}
        error={!!error}
        onRetry={() => refetch()}
        emptyText="No backups available yet. The next backup will be created at 2:00 AM UTC."
        storageKey="platform-backups-col-prefs"
      />
    </div>
  );
}
