'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, total, limit, hasMore, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  // Build visible page numbers — always show first, last, current ±1
  const pages: (number | '…')[] = [];
  const range = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
  let prev = 0;
  for (const p of Array.from(range).sort((a, b) => a - b)) {
    if (p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }

  return (
    <div className={cn('flex items-center justify-between gap-4 pt-2', className)}>
      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
        {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(1)} disabled={page === 1} title="First page">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </PagBtn>
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} title="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </PagBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs select-none">…</span>
          ) : (
            <PagBtn
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === page}
              title={`Page ${p}`}
            >
              {p}
            </PagBtn>
          )
        )}

        <PagBtn onClick={() => onPageChange(page + 1)} disabled={!hasMore} title="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </PagBtn>
        <PagBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages} title="Last page">
          <ChevronsRight className="h-3.5 w-3.5" />
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center',
        active
          ? 'bg-primary text-white shadow-sm shadow-primary/25'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  );
}
