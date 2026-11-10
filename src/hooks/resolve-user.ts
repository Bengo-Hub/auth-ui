/**
 * Which user the UI shows: the cached /me (fresher) when it is the same person as the signed-in
 * user in the store, but the store's user when the cache still holds someone else (the previous
 * person on this browser tab). `stale` tells the caller to refetch /me.
 */
export function resolveUser<U extends { id: string }>(queryData: U | undefined | null, storeUser: U | null): { user: U | null; stale: boolean } {
  if (queryData && storeUser && queryData.id !== storeUser.id) {
    return { user: storeUser, stale: true };
  }
  return { user: queryData ?? storeUser ?? null, stale: false };
}
