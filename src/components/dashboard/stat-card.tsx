import { LucideIcon } from 'lucide-react';

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-500',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-500',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-500',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'slate',
  helper,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: keyof typeof COLOR_MAP;
  helper?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</p>
      {helper && <p className="text-xs text-slate-400 mt-1">{helper}</p>}
    </div>
  );
}
