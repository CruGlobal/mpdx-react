import { ApolloClient } from '@apollo/client';
import { clearApolloData } from 'src/lib/apollo/clearApolloData';
import { clearDataDogUser } from 'src/lib/dataDog';
import { disablePush } from 'src/lib/nativeShell/pushRegistration';

/**
 * Canonical signout teardown (master plan §3.3). EVERY path that ends a
 * session must call this — it wraps the Phase 2 `clearApolloData()` invariant
 * with push unregistration and CacheStorage clearing. The order is binding:
 *
 *   1. `disablePush` — the `DestroyUserDevice` DELETE needs a valid apiToken,
 *      and `clearStore()` below would drop in-flight operations, so push
 *      teardown must run first. It is a no-op on web (no plugin chunk is ever
 *      fetched in a browser) and swallows its own failures (offline, 401 on
 *      the AUTHENTICATION_ERROR path, device already gone), but a signout
 *      must never be blocked, so it is guarded here anyway.
 *   2. Clear service-worker CacheStorage before signOut() navigates away, so
 *      the next user of a shared device cannot read this user's caches.
 *   3. `clearDataDogUser` — stop attributing RUM events to this user.
 *   4. `clearApolloData` — purge the persisted cache and clear the store.
 */
export const logoutCleanup = async (
  client: ApolloClient<object>,
): Promise<void> => {
  await disablePush(client).catch(() => undefined);
  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // CacheStorage can reject (e.g. SecurityError in some webview or
    // private-browsing contexts). A signout must never be blocked, so a
    // failure here must not abort the rest of the chain or propagate.
  }
  clearDataDogUser();
  await clearApolloData(client);
};
