import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Draft previews are for the platform admin only: never indexed, never cached.
export const metadata: Metadata = {
  title: 'Draft preview | MarketFlow Autopilot Terms',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function LegalDraftPreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
