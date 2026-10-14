import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pricing | Codevertex Accounts',
  description: 'Plans and pricing for Codevertex apps, all opened with one Codevertex account.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
