import React, { useEffect } from 'react';
import {
  ApolloCache,
  NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import {
  isCachePersistenceEnabled,
  startCachePersistence,
  stopCachePersistence,
} from 'src/lib/apollo/persistence/cachePersistence';
import { onSessionEnded } from 'src/lib/apollo/persistence/sessionChannel';
import { addDatadogError } from 'src/lib/dataDog';

const settled = new WeakSet<Promise<void>>();

const useCacheRestore = (
  cache: ApolloCache<NormalizedCacheObject>,
  userId: string,
  impersonating: boolean,
): void => {
  if (!isCachePersistenceEnabled()) {
    return;
  }
  const promise = startCachePersistence({ cache, userId, impersonating });
  if (!settled.has(promise)) {
    // Suspend until the restore settles (React 18; switch to use() on React 19)
    throw promise.then(() => {
      settled.add(promise);
    });
  }
};

export const CacheRestoreGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userID, impersonating = false } = useRequiredSession();
  const client = useApolloClient();

  useCacheRestore(
    client.cache as ApolloCache<NormalizedCacheObject>,
    userID,
    impersonating,
  );

  useEffect(() => {
    if (impersonating) {
      void stopCachePersistence();
    }
  }, [impersonating]);

  useEffect(
    () =>
      onSessionEnded(() => {
        void stopCachePersistence();
        client.clearStore().catch((error) =>
          addDatadogError(error, {
            mpdxErrorType: 'cache_persistence',
            step: 'clearStore',
          }),
        );
      }),
    [client],
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
