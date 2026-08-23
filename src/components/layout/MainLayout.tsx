'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The equity holder portal is a standalone, token-authenticated experience (external
  // stakeholders via a magic link, not a logged-in SSO session) with its own header/nav
  // (EquityPortalHeader) — the marketing Navbar's "Log In"/"Start Free" CTAs and full
  // Footer don't apply there and previously doubled up on top of it, same as /dashboard.
  const isStandalonePortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/equity-holder');

  return (
    <>
      {!isStandalonePortal && <Navbar />}
      <main className={!isStandalonePortal ? "flex-grow" : "h-screen"}>
        {children}
      </main>
      {!isStandalonePortal && <Footer />}
    </>
  );
}
