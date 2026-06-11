import { ApolloClient } from '@apollo/client';
import { signOut } from 'next-auth/react';
import { logoutCleanup } from 'src/lib/auth/logoutCleanup';

// Extracted from the onError link in client.ts so it can be unit tested
// (client.ts has a top-level await and cannot be imported under jest).
//
// Coalesces the burst of AUTHENTICATION_ERRORs that a batched request can
// produce into a single cleanup + signOut.
let inFlight: Promise<void> | null = null;

/**
 * Session-expiry signout for the AUTHENTICATION_ERROR path. The canonical
 * `logoutCleanup()` chain (master plan §3.3) must run to COMPLETION before
 * `signOut({ redirect: true })`, because the redirect assigns
 * `window.location` and the page unload would abort any still-running
 * cleanup — leaving the previous user's persisted Apollo cache, SW caches,
 * or push registration behind on a shared device.
 *
 * The token is already dead here, so the DestroyUserDevice DELETE inside
 * logoutCleanup will 401 — it swallows that, but still unregisters the push
 * plugin and clears local state. Cleanup is best-effort: a failure must
 * never prevent the signOut redirect.
 */
export const handleAuthenticationError = (
  client: ApolloClient<object>,
): Promise<void> => {
  inFlight ??= (async () => {
    await logoutCleanup(client).catch(() => undefined);
    await signOut({ redirect: true, callbackUrl: 'signOut' }).catch(
      () => undefined,
    );
  })().finally(() => {
    // Allow a retry if the signOut POST failed (e.g. offline) and the user
    // hits another authentication error later. On success the redirect
    // unloads the page, so the reset is moot.
    inFlight = null;
  });
  return inFlight;
};
