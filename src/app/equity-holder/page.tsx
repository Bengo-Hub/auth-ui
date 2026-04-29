'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EquityHolderRoot() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token') ?? '';

    useEffect(() => {
        router.replace(`/equity-holder/dashboard${token ? `?token=${token}` : ''}`);
    }, [router, token]);

    return null;
}
