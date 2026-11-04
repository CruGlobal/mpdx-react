import { useState } from 'react';
import {
  AddressChangeHistoryQuery,
  AddressChangeHistoryQueryVariables,
  useAddressChangeHistoryQuery,
} from './AddressChangeHistory.generated';

interface UseLoadMoreAddressChangesProps {
  variables: AddressChangeHistoryQueryVariables;
  history: AddressChangeHistoryQuery['addressChangeHistory'] | undefined;
  loading: boolean;
  fetchMore: ReturnType<typeof useAddressChangeHistoryQuery>['fetchMore'];
}

export const useLoadMoreAddressChanges = ({
  variables,
  history,
  loading,
  fetchMore,
}: UseLoadMoreAddressChangesProps) => {
  const [failedPage, setFailedPage] = useState<string | null>(null);

  // A failed page never sets the query's error, so it is caught and shown here. The API's cursors are
  // offsets that repeat across filters, so the key includes the filters as well as the cursor.
  const pageKey = JSON.stringify([variables, history?.pageInfo.endCursor]);
  const loadMoreFailed = failedPage === pageKey;
  const fetchNextPage = () => {
    const failedKey = pageKey;
    setFailedPage(null);
    fetchMore({ variables: { after: history?.pageInfo.endCursor } }).catch(() =>
      setFailedPage(failedKey),
    );
  };
  const loadMore = () => {
    if (loading || loadMoreFailed) {
      return;
    }
    if (history?.pageInfo.hasNextPage) {
      fetchNextPage();
    }
  };

  return { loadMoreFailed, fetchNextPage, loadMore };
};
