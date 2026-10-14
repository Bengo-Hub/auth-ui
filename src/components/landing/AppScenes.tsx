import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small illustrations of what each app does, drawn with the real design tokens rather than
 * screenshots (which carry annotations and real customer data). Amounts are sample values.
 */

const chip = 'rounded-full px-2.5 py-1 text-[0.7rem] font-semibold';

export function PosScene() {
  const lines = [
    ['Flat white', 'x2', '480'],
    ['Cheese toastie', 'x1', '520'],
    ['Mandazi', 'x4', '160'],
  ];
  return (
    <div className="grid h-full place-items-center bg-secondary/70 p-5">
      <div className="w-full max-w-xs space-y-3 rounded-2xl bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Sale 1</span>
          <span className={cn(chip, 'bg-secondary text-primary')}>Table 4</span>
        </div>
        <ul className="space-y-2 text-sm">
          {lines.map(([n, q, p]) => (
            <li key={n} className="flex items-center justify-between gap-3">
              <span>{n} <span className="text-muted-foreground">{q}</span></span>
              <span className="tabular-nums text-muted-foreground">{p}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-xl font-semibold tabular-nums">KES 1,160</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <span className="rounded-full bg-primary py-2 text-primary-foreground">M-Pesa</span>
          <span className="rounded-full bg-secondary py-2 text-primary">Cash</span>
          <span className="rounded-full bg-secondary py-2 text-primary">Card</span>
        </div>
      </div>
    </div>
  );
}

export function OrderScene() {
  const steps = [
    { label: 'Order received', done: true },
    { label: 'Being prepared', done: true },
    { label: 'Rider on the way', done: false, current: true },
    { label: 'Delivered', done: false },
  ];
  return (
    <div className="grid h-full place-items-center bg-secondary/70 p-5">
      <div className="w-full max-w-xs rounded-2xl bg-card p-4 shadow-soft">
        <p className="text-sm font-semibold">Order #1042</p>
        <p className="mb-3 text-xs text-muted-foreground">Arriving in about 12 minutes</p>
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span className={cn('grid h-6 w-6 place-items-center rounded-full', s.done ? 'bg-primary text-primary-foreground' : s.current ? 'border-2 border-primary text-primary' : 'border border-border text-muted-foreground')}>
                {s.done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-2 w-2 fill-current" aria-hidden />}
              </span>
              <span className={cn(s.current && 'font-semibold', !s.done && !s.current && 'text-muted-foreground')}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function BooksScene() {
  const rows = [
    ['INV-0231', 'Greenleaf Hotel', '48,000', 'Paid', true],
    ['INV-0232', 'Kisumu Fresh', '12,500', 'Due in 3 days', false],
    ['INV-0233', 'Lakeview School', '86,200', 'Paid', true],
  ] as const;
  return (
    <div className="grid h-full place-items-center bg-secondary/70 p-5">
      <div className="w-full max-w-sm space-y-2 rounded-2xl bg-card p-4 shadow-soft">
        <p className="mb-1 text-sm font-semibold">Invoices</p>
        {rows.map(([id, who, amt, status, paid]) => (
          <div key={id} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{who}</p>
              <p className="text-xs text-muted-foreground">{id}</p>
            </div>
            <div className="text-right">
              <p className="tabular-nums font-semibold">KES {amt}</p>
              <span className={cn(chip, 'inline-block', paid ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400')}>{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StockScene() {
  const items = [
    ['Arabica beans 1kg', 82, false],
    ['Oat milk 1L', 24, false],
    ['Paper cups 8oz', 9, true],
    ['Syrup, vanilla', 41, false],
  ] as const;
  return (
    <div className="grid h-full place-items-center bg-secondary/70 p-5">
      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Stock levels</p>
          <span className={cn(chip, 'bg-amber-500/10 text-amber-700 dark:text-amber-400')}>1 to reorder</span>
        </div>
        {items.map(([n, q, low]) => (
          <div key={n} className="space-y-1.5">
            <div className="flex justify-between text-sm"><span>{n}</span><span className="tabular-nums text-muted-foreground">{q}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary" role="presentation">
              <div className={cn('h-full rounded-full', low ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${Math.min(100, q)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two sign-in cards, each in a different tenant's colours, to show branding per organisation. */
export function BrandPreview() {
  const cards = [
    { name: 'Urban Loft', app: 'Urban Ordering', hue: '#1f7a4d', tilt: '-rotate-2' },
    { name: 'Kisumu Fresh', app: 'Fresh Orders', hue: '#b4452f', tilt: 'rotate-2' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden>
      {cards.map((c) => (
        <div key={c.name} className={cn('rounded-3xl bg-card p-5 shadow-lift', c.tilt)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl font-serif-soft text-lg text-white" style={{ background: c.hue }}>{c.name[0]}</span>
          <p className="mt-4 font-serif-soft text-xl leading-tight">Sign in</p>
          <p className="text-xs text-muted-foreground">to continue to {c.app}</p>
          <div className="mt-4 space-y-2">
            <div className="h-9 rounded-lg border border-border bg-background" />
            <div className="h-9 rounded-lg border border-border bg-background" />
            <div className="grid h-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: c.hue }}>Sign in</div>
          </div>
        </div>
      ))}
    </div>
  );
}
