/** Shared formatting for the equity holder portal — every payout amount is KES. */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

export type PayoutStatus = 'completed' | 'pending' | 'failed' | string;
