import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign in | Codevertex Accounts',
  description: 'Sign in to your Codevertex account to open every Codevertex app.',
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
