'use client';

import { createContext, useContext } from 'react';

interface PortalContext {
    holderID: string;
    token: string;
}

export const PortalCtx = createContext<PortalContext | null>(null);

export function usePortal() {
    const ctx = useContext(PortalCtx);
    if (!ctx) throw new Error('usePortal must be used inside equity-holder layout');
    return ctx;
}
