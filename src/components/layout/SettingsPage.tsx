import type { ComponentType, ReactNode } from 'react';

/**
 * Layout for a settings or policy page: a title row, the form on the left and a short guidance
 * panel on the right on wide screens (stacked on small ones). Keeps forms readable without
 * leaving most of a wide screen empty.
 */
export function SettingsPage({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6">
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          {Icon && (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          )}
          {title}
        </h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </header>
      <div className={aside ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]' : ''}>
        <div className="min-w-0 space-y-6">{children}</div>
        {aside && <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">{aside}</aside>}
      </div>
    </div>
  );
}

/** A plain guidance card for the SettingsPage aside. */
export function SettingsNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
