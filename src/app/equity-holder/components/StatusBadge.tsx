import { cn } from '@/lib/utils';
import type { PayoutStatus } from './utils';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function StatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
        STATUS_STYLES[status] ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      )}
    >
      {status}
    </span>
  );
}
