'use client';

import { LAUNCHER_APPS, type LauncherApp } from '@/config/launcher-apps';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * The app grid a person lands on after signing in, drawn from the real app list. `tone="solid"`
 * sits on the primary colour (the sign-in panel); `tone="paper"` sits on the page (the landing hero).
 */
export function AppLauncher({
  apps = LAUNCHER_APPS.slice(0, 8),
  tone = 'solid',
  className,
}: {
  apps?: LauncherApp[];
  tone?: 'solid' | 'paper';
  className?: string;
}) {
  // Signed in: straight to the app. Otherwise through sign-in and back (same rule as getServiceUrl).
  const { isAuthenticated } = useAuth();
  const href = (app: LauncherApp) => (isAuthenticated ? app.url : `/login?return_to=${encodeURIComponent(app.url)}`);
  return (
    <ul className={cn('grid grid-cols-4 gap-2.5', className)} aria-label="Apps on your account">
      {apps.map((app, i) => (
        <li
          key={app.id}
          className="animate-tile-in"
          style={{ '--tile-delay': `${160 + i * 55}ms` } as React.CSSProperties}
        >
          <a
            href={href(app)}
            className={cn(
              'flex aspect-[5/4] flex-col items-start justify-between rounded-2xl p-2.5 transition-transform hover:-translate-y-0.5',
              tone === 'solid' ? 'bg-card text-card-foreground shadow-soft' : 'border border-border/60 bg-card shadow-soft',
            )}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
              <app.icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="text-[0.7rem] font-semibold leading-tight xl:text-xs">{app.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
