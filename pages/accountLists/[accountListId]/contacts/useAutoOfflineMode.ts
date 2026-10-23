import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { useCachedContactsAvailable } from 'src/hooks/useCachedContactsAvailable';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { useOfflineMode } from 'src/hooks/useOfflineMode';

// Switch to offline mode when the page is opened without a connection. This is
// evaluated once per mount, so going offline later never moves the user.
export const useAutoOfflineMode = (accountListId: string): void => {
  const router = useRouter();
  const isOnline = useIsOnline();
  const offlineMode = useOfflineMode();
  const cachedAvailable = useCachedContactsAvailable(accountListId);
  const wasOnlineAtMount = useRef(isOnline);
  const evaluated = useRef(false);

  useEffect(() => {
    // undefined means the cache is still being read
    if (evaluated.current || cachedAvailable === undefined) {
      return;
    }
    evaluated.current = true;

    const { query } = router;
    const viewMode = Array.isArray(query.contactId)
      ? query.contactId[0]
      : undefined;
    if (
      wasOnlineAtMount.current ||
      offlineMode ||
      !cachedAvailable ||
      query.filters ||
      query.searchTerm ||
      viewMode === TableViewModeEnum.Flows ||
      viewMode === TableViewModeEnum.Map
    ) {
      return;
    }

    router.replace(
      { pathname: router.pathname, query: { ...query, offline: 'true' } },
      undefined,
      { shallow: true },
    );
  }, [cachedAvailable]);
};
