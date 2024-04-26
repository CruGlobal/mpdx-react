import * as Types from '../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAccountListsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetAccountListsQuery = { __typename?: 'Query' } & {
  accountLists: { __typename?: 'AccountListConnection' } & {
    nodes: Array<
      { __typename?: 'AccountList' } & Pick<
        Types.AccountList,
        | 'id'
        | 'name'
        | 'monthlyGoal'
        | 'receivedPledges'
        | 'totalPledges'
        | 'currency'
      >
    >;
  };
};

export const GetAccountListsDocument = gql`
  query GetAccountLists {
    accountLists(first: 50) {
      nodes {
        id
        name
        monthlyGoal
        receivedPledges
        totalPledges
        currency
      }
    }
  }
`;
export function useGetAccountListsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAccountListsQuery,
    GetAccountListsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAccountListsQuery, GetAccountListsQueryVariables>(
    GetAccountListsDocument,
    options,
  );
}
export function useGetAccountListsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountListsQuery,
    GetAccountListsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountListsQuery,
    GetAccountListsQueryVariables
  >(GetAccountListsDocument, options);
}
export type GetAccountListsQueryHookResult = ReturnType<
  typeof useGetAccountListsQuery
>;
export type GetAccountListsLazyQueryHookResult = ReturnType<
  typeof useGetAccountListsLazyQuery
>;
export type GetAccountListsQueryResult = Apollo.QueryResult<
  GetAccountListsQuery,
  GetAccountListsQueryVariables
>;
