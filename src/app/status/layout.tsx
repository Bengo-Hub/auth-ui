import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'System status | Codevertex Accounts',
  description: 'Live status of Codevertex sign-in and the apps on your account.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
