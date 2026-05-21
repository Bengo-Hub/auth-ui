'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEquityPayouts, type EquityPayout } from '@/lib/api/equity';

/**
 * Hook to fetch equity payouts for an equity holder.
 * Enabled only when both holderID and token are present.
 */
export function useEquityPayouts(holderID: string, token: string) {
  return useQuery({
    queryKey: ['equity', 'payouts', holderID],
    queryFn: () => fetchEquityPayouts(holderID, token),
    enabled: !!holderID && !!token,
    staleTime: 60_000,
  });
}

/** Returns completed payouts only (for tax summaries). */
export function useEquityCompletedPayouts(holderID: string, token: string) {
  const query = useEquityPayouts(holderID, token);
  const completedPayouts = (query.data?.payouts ?? []).filter(
    (p: EquityPayout) => p.status === 'completed',
  );
  return { ...query, payouts: completedPayouts };
}
