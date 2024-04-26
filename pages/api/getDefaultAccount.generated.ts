import * as Types from '../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDefaultAccountQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetDefaultAccountQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<Types.User, 'defaultAccountList'>;
  accountLists: { __typename?: 'AccountListConnection' } & {
    nodes: Array<
      { __typename?: 'AccountList' } & Pick<Types.AccountList, 'id'>
    >;
  };
};

export const GetDefaultAccountDocument = gql`
  query GetDefaultAccount {
    user {
      defaultAccountList
    }
    accountLists(first: 1) {
      nodes {
        id
      }
    }
  }
`;
export function useGetDefaultAccountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetDefaultAccountQuery,
    GetDefaultAccountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDefaultAccountQuery,
    GetDefaultAccountQueryVariables
  >(GetDefaultAccountDocument, options);
}
export function useGetDefaultAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDefaultAccountQuery,
    GetDefaultAccountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDefaultAccountQuery,
    GetDefaultAccountQueryVariables
  >(GetDefaultAccountDocument, options);
}
export type GetDefaultAccountQueryHookResult = ReturnType<
  typeof useGetDefaultAccountQuery
>;
export type GetDefaultAccountLazyQueryHookResult = ReturnType<
  typeof useGetDefaultAccountLazyQuery
>;
export type GetDefaultAccountQueryResult = Apollo.QueryResult<
  GetDefaultAccountQuery,
  GetDefaultAccountQueryVariables
>;
