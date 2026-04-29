import { Suspense } from 'react';
import { EquityPortalProvider } from './equity-portal-provider';

export default function EquityHolderLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <EquityPortalProvider>{children}</EquityPortalProvider>
        </Suspense>
    );
}
