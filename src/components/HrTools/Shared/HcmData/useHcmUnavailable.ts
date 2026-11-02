import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { isHcmUnavailableError } from './HcmUnavailableAlert';

interface HcmQueryResult {
  error: ApolloError | undefined;
  refetch: () => Promise<unknown>;
}

interface HcmUnavailable {
  hcmUnavailable: boolean;
  refetchHcm: () => Promise<unknown>;
}

/**
 * Report whether the Hcm query, or a query whose resolvers also call HCM, failed with
 * HCM_UNAVAILABLE, and refetch only the ones that did.
 */
export const useHcmUnavailable = (
  hcmQuery: HcmQueryResult,
  hcmBackedQuery: HcmQueryResult,
): HcmUnavailable => {
  const hcmQueryUnavailable = isHcmUnavailableError(hcmQuery.error);
  const hcmBackedQueryUnavailable = isHcmUnavailableError(hcmBackedQuery.error);
  const { refetch: refetchHcmQuery } = hcmQuery;
  const { refetch: refetchHcmBackedQuery } = hcmBackedQuery;

  const refetchHcm = useCallback(
    () =>
      Promise.all([
        hcmQueryUnavailable && refetchHcmQuery(),
        hcmBackedQueryUnavailable && refetchHcmBackedQuery(),
      ]),
    [
      hcmQueryUnavailable,
      hcmBackedQueryUnavailable,
      refetchHcmQuery,
      refetchHcmBackedQuery,
    ],
  );

  return {
    hcmUnavailable: hcmQueryUnavailable || hcmBackedQueryUnavailable,
    refetchHcm,
  };
};
