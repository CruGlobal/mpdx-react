import { useEffect } from 'react';
import { QueryResult } from '@apollo/client';
import { PageInfo } from '../../graphql/types.generated';

export interface Variables {
  after?: string;
}

// Asynchronously load all the pages of a paginated query
// Query must accept an optional `after` variable
export const useFetchAllPages = <TData, TVariables extends Variables>({
  fetchMore,
  pageInfo,
}: {
  fetchMore: QueryResult<TData, TVariables>['fetchMore'];
  pageInfo?: Pick<PageInfo, 'endCursor' | 'hasNextPage'>;
}) => {
  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      });
    }
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor]);

  const loaded = pageInfo?.hasNextPage === false;

  return {
    loading: !loaded,
  };
};
