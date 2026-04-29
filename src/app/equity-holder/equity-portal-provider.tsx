'use client';

import api from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !ctx) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground max-w-sm">{error}</p>
            </div>
        );
    }

    return (
        <PortalCtx.Provider value={ctx}>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border px-6 py-4 flex items-center justify-between">
                    <span className="font-bold text-lg tracking-tight">Codevertex Equity Portal</span>
                </header>
                <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
            </div>
        </PortalCtx.Provider>
    );
}
