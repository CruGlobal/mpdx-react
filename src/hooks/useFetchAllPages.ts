import { useEffect } from 'react';
import { ApolloError, QueryResult } from '@apollo/client';
import { PageInfo } from 'src/graphql/types.generated';

export interface Variables {
  after?: string;
}

// Asynchronously load all the pages of a paginated query
// Query must accept an optional `after` variable
export const useFetchAllPages = <TData, TVariables extends Variables>({
  fetchMore,
  error,
  pageInfo,
  pageSize,
}: {
  fetchMore: QueryResult<TData, TVariables>['fetchMore'];
  error: ApolloError | undefined;
  pageInfo: Pick<PageInfo, 'endCursor' | 'hasNextPage'> | undefined;
  pageSize?: number;
}) => {
  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      fetchMore({
        variables: {
          ...(pageSize && { first: pageSize }),
          after: pageInfo.endCursor,
        },
      });
    }
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, pageSize]);

  const loaded = pageInfo?.hasNextPage === false;

  return {
    loading: !error && !loaded,
  };
};
