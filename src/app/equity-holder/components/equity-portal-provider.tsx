'use client';

import { AppSplash } from '@/components/layout/AppSplash';
import api from '@/lib/api-client';
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EquityPortalHeader } from './EquityPortalHeader';
import { PortalCtx } from './equity-portal-context';

interface PortalContext {
    holderID: string;
    token: string;
}

interface EquityPortalProviderProps {
    children: React.ReactNode;
}

export function EquityPortalProvider({ children }: EquityPortalProviderProps) {
    const searchParams = useSearchParams();
    const [ctx, setCtx] = useState<PortalContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams?.get('token') ?? '';
        if (!token) {
            setError('No portal token provided.');
            setLoading(false);
            return;
        }

        api.get('/api/v1/equity-portal/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                setCtx({ holderID: res.data.holder_id, token });
            })
            .catch(() => {
                setError('Invalid or expired portal link. Please request a new one.');
            })
            .finally(() => setLoading(false));
    }, [searchParams]);

    if (loading) {
        return <AppSplash />;
    }

    if (error || !ctx) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Access Denied</h1>
                <p className="text-muted-foreground max-w-sm">{error}</p>
            </div>
        );
    }

    return (
        <PortalCtx.Provider value={ctx}>
            <div className="min-h-screen bg-background">
                <EquityPortalHeader />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">{children}</main>
            </div>
        </PortalCtx.Provider>
    );
}
