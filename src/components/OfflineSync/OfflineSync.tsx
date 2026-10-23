import { useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { useIsStandalone } from 'src/hooks/useIsStandalone';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { isCachePersistenceEnabled } from 'src/lib/apollo/persistence/cachePersistence';
import { offlineSyncDefinitions } from 'src/lib/offlineSync/definitions';
import { runOfflineSync } from 'src/lib/offlineSync/offlineSync';

const IDLE_TIMEOUT_MS = 10000;
const FALLBACK_DELAY_MS = 2000;

const scheduleIdle = (callback: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, {
      timeout: IDLE_TIMEOUT_MS,
    });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(handle);
};

export const OfflineSync: React.FC = () => {
  const client = useApolloClient();
  const accountListId = useOptionalAccountListId();
  const isStandalone = useIsStandalone();
  const isOnline = useIsOnline();
  const { impersonating } = useRequiredSession();
  const eligible =
    isStandalone && isOnline && !impersonating && isCachePersistenceEnabled();

  // One controller per account list. A sync for a previous account list keeps
  // running after the user switches, so only eligibility changes abort it.
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    if (!eligible) {
      return;
    }
    const current = controllers.current;
    return () => {
      current.forEach((controller) => controller.abort());
      current.clear();
    };
  }, [eligible]);

  useEffect(() => {
    if (!eligible || !accountListId || controllers.current.has(accountListId)) {
      return;
    }

    const current = controllers.current;
    const controller = new AbortController();
    current.set(accountListId, controller);
    let started = false;

    const cancelIdle = scheduleIdle(async () => {
      started = true;
      try {
        for (const definition of offlineSyncDefinitions) {
          if (controller.signal.aborted) {
            break;
          }
          await runOfflineSync({
            definition,
            client,
            accountListId,
            signal: controller.signal,
          });
        }
      } finally {
        if (current.get(accountListId) === controller) {
          current.delete(accountListId);
        }
      }
    });

    return () => {
      if (!started) {
        cancelIdle();
        if (current.get(accountListId) === controller) {
          current.delete(accountListId);
        }
      }
    };
  }, [eligible, accountListId, client]);

  return null;
};
