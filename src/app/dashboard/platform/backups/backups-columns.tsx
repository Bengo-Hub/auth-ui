'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import { Button } from '@/components/ui/button';
import { Clock, Download, FileArchive, Loader2 } from 'lucide-react';

export interface BackupEntry {
  filename: string;
  size: string;
  created_at: number;
}

export interface BackupManifest {
  backups: BackupEntry[];
}

export interface DownloadProgress {
  loaded: number;
  total: number;
}

const SIX_DAYS_SECS = 6 * 24 * 3600;

export function formatDate(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString();
}

export function timeAgo(unixTimestamp: number): string {
  const diff = Date.now() - unixTimestamp * 1000;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
}

export function isOveraged(unixTimestamp: number): boolean {
  return (Date.now() / 1000 - unixTimestamp) > SIX_DAYS_SECS;
}

export interface BackupColumnCallbacks {
  /** Filename currently streaming a download, or null when idle. */
  downloading: string | null;
  /** Byte progress for the in-flight download identified by `downloading`. */
  progress: DownloadProgress | null;
  onDownload: (filename: string) => void;
}

export function buildBackupColumns(cb: BackupColumnCallbacks): DataTableColumn<BackupEntry>[] {
  return [
    {
      key: 'filename',
      header: 'Backup file',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (b) => b.filename,
      render: (b) => (
        <div className="flex items-center gap-3 min-w-0">
          <FileArchive className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium font-mono truncate">{b.filename}</p>
            {isOveraged(b.created_at) && (
              <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400 mt-0.5">
                Overdue
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      hideBelow: 'sm',
      accessor: (b) => b.size,
      cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
    },
    {
      key: 'created_at',
      header: 'Created',
      hideBelow: 'md',
      sortable: true,
      accessor: (b) => b.created_at,
      cellClassName: 'text-xs text-muted-foreground whitespace-nowrap',
      render: (b) => (
        <div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(b.created_at)}
          </div>
          <div>{formatDate(b.created_at)}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (b) => {
        const isDownloading = cb.downloading === b.filename;
        const pct = cb.progress && cb.progress.total > 0
          ? Math.round((cb.progress.loaded / cb.progress.total) * 100)
          : null;
        return (
          <div className="flex items-center justify-end gap-2">
            {isDownloading && cb.progress && (
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {cb.progress.total > 0
                  ? `${formatBytes(cb.progress.loaded)}/${formatBytes(cb.progress.total)} (${pct}%)`
                  : formatBytes(cb.progress.loaded)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => cb.onDownload(b.filename)}
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
        );
      },
    },
  ];
}
