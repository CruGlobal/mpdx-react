import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetKeyAccountsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetKeyAccountsQuery = (
  { __typename?: 'Query' }
  & { user: (
    { __typename?: 'User' }
    & { keyAccounts: Array<(
      { __typename?: 'KeyAccount' }
      & Pick<Types.KeyAccount, 'email'>
    )> }
  ) }
);


export const GetKeyAccountsDocument = gql`
    query GetKeyAccounts {
  user {
    keyAccounts {
      email
    }
  }
}
    `;
export function useGetKeyAccountsQuery(baseOptions?: Apollo.QueryHookOptions<GetKeyAccountsQuery, GetKeyAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetKeyAccountsQuery, GetKeyAccountsQueryVariables>(GetKeyAccountsDocument, options);
      }
export function useGetKeyAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetKeyAccountsQuery, GetKeyAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetKeyAccountsQuery, GetKeyAccountsQueryVariables>(GetKeyAccountsDocument, options);
        }
export type GetKeyAccountsQueryHookResult = ReturnType<typeof useGetKeyAccountsQuery>;
export type GetKeyAccountsLazyQueryHookResult = ReturnType<typeof useGetKeyAccountsLazyQuery>;
export type GetKeyAccountsQueryResult = Apollo.QueryResult<GetKeyAccountsQuery, GetKeyAccountsQueryVariables>;