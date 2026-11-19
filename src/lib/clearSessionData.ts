import { ApolloClient } from '@apollo/client';
import { signOut } from 'next-auth/react';
import {
  pauseCachePersistence,
  purgeCachePersistence,
} from './apollo/persistence/cachePersistence';
import { broadcastSessionEnded } from './apollo/persistence/sessionChannel';
import { addDatadogError, clearDatadogUser } from './dataDog';
import { shouldKeepOnSignOut } from './serviceWorker/cacheNames';

// Each step is isolated so one failure never leaves personal data behind.
const attempt = async (
  stepName: string,
  step: () => unknown,
): Promise<void> => {
  try {
    await step();
  } catch (error) {
    addDatadogError(error, {
      mpdxErrorType: 'clear_session_data',
      step: stepName,
    });
  }
};

const clearCaches = async (): Promise<void> => {
  if (typeof window.caches === 'undefined') {
    return;
  }
  const names = await window.caches.keys();
  await Promise.all(
    names
      .filter((name) => !shouldKeepOnSignOut(name))
      .map((name) => window.caches.delete(name)),
  );
};

export const clearSessionData = async (
  client: ApolloClient<unknown>,
): Promise<void> => {
  await attempt('clearDatadogUser', clearDatadogUser);
  await attempt('pauseCachePersistence', pauseCachePersistence);
  await attempt('localStorage', () => window.localStorage.clear());
  await attempt('clearStore', () => client.clearStore());
  await attempt('purgeCachePersistence', purgeCachePersistence);
  await attempt('caches', clearCaches);
  await attempt('broadcast', broadcastSessionEnded);
};

/**
 * Clears all session data, then signs out. Every sign-out path must use this
 * instead of calling next-auth's `signOut` directly.
 */
export const signOutAndClear = async (
  client: ApolloClient<unknown>,
  options?: Parameters<typeof signOut>[0],
): Promise<void> => {
  await clearSessionData(client);
  await signOut(options);
};
