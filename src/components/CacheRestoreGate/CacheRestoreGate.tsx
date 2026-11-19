import React, { useCallback, useEffect, useRef } from 'react';
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

  // A different user means this page's cache belongs to someone else
  const initialUserId = useRef(userID);
  const userChanged = userID !== initialUserId.current;

  useEffect(() => {
    if (impersonating || userChanged) {
      void stopCachePersistence();
    }
  }, [impersonating, userChanged]);

  const clearStore = useCallback(() => {
    client.clearStore().catch((error) =>
      addDatadogError(error, {
        mpdxErrorType: 'cache_persistence',
        step: 'clearStore',
      }),
    );
  }, [client]);

  useEffect(() => {
    if (userChanged) {
      clearStore();
    }
  }, [userChanged, clearStore]);

  useEffect(
    () =>
      onSessionEnded(() => {
        void stopCachePersistence();
        clearStore();
      }),
    [clearStore],
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
