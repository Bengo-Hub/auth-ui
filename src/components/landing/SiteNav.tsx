'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { href: '/#apps', label: 'Apps' },
  { href: '/#people', label: 'Who signs in' },
  { href: '/#security', label: 'Security' },
  { href: '/dashboard/developer', label: 'Developers' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/status', label: 'Status' },
];

/** Public site header: sticky on warm paper, the Codevertex mark, a few anchors, one clear action. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  useEffect(() => setMounted(true), []);

  const actions = !mounted ? (
    <div className="h-10 w-36 animate-pulse rounded-full bg-muted" aria-hidden />
  ) : user ? (
    <Button asChild className="h-10 rounded-full px-5 font-semibold"><Link href="/dashboard">My account</Link></Button>
  ) : (
    <>
      <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">Sign in</Link>
      <Button asChild className="h-10 rounded-full px-5 font-semibold"><Link href="/signup">Get started</Link></Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Codevertex accounts, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/codevertex.png" alt="" className="h-9 w-auto dark:brightness-0 dark:invert" />
          <span className="font-display text-lg font-semibold tracking-tight">Accounts</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {actions}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-secondary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border/60 bg-paper px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-4">
            <ThemeToggle />
            <div className="flex flex-1 items-center justify-end gap-2">{actions}</div>
          </div>
        </div>
      )}
    </header>
  );
}
