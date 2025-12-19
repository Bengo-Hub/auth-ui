'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={!isDashboard ? "flex-grow" : "h-screen"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}
