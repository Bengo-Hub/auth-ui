'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/select-organisation', '/auth'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The equity holder portal is a standalone, token-authenticated experience (external
  // stakeholders via a magic link, not a logged-in SSO session) with its own header/nav
  // (EquityPortalHeader) — the marketing Navbar's "Log In"/"Start Free" CTAs and full
  // Footer don't apply there and previously doubled up on top of it, same as /dashboard.
  const isStandalonePortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/equity-holder');
  // Sign-in pages carry the tenant's own branding (AuthShell). A customer signing in to
  // Urban Loft's ordering app must not see the Codevertex marketing header and footer.
  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'));
  if (isAuthPage) return <>{children}</>;

  return (
    <>
      {!isStandalonePortal && <SiteNav />}
      <main className={!isStandalonePortal ? "flex-grow" : "h-screen"}>
        {children}
      </main>
      {!isStandalonePortal && <SiteFooter />}
    </>
  );
}
