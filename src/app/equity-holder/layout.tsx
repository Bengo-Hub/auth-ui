import { Suspense } from 'react';
import { AppSplash } from '@/components/layout/AppSplash';
import { EquityPortalProvider } from './components/equity-portal-provider';

export default function EquityHolderLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AppSplash />}>
            <EquityPortalProvider>{children}</EquityPortalProvider>
        </Suspense>
    );
}
