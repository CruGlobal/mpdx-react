import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTopBarQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetTopBarQuery = (
  { __typename?: 'Query' }
  & { accountLists: (
    { __typename?: 'AccountListConnection' }
    & { nodes: Array<(
      { __typename?: 'AccountList' }
      & Pick<Types.AccountList, 'id' | 'name' | 'salaryOrganizationId'>
    )> }
  ), user: (
    { __typename?: 'User' }
    & Pick<Types.User, 'id' | 'firstName' | 'lastName' | 'admin' | 'developer' | 'defaultAccountList'>
    & { keyAccounts: Array<(
      { __typename?: 'KeyAccount' }
      & Pick<Types.KeyAccount, 'id' | 'email'>
    )>, administrativeOrganizations: (
      { __typename?: 'OrganizationConnection' }
      & { nodes: Array<(
        { __typename?: 'Organization' }
        & Pick<Types.Organization, 'id'>
      )> }
    ) }
  ) }
);


export const GetTopBarDocument = gql`
    query GetTopBar {
  accountLists(first: 50) {
    nodes {
      id
      name
      salaryOrganizationId
    }
  }
  user {
    id
    firstName
    lastName
    admin
    developer
    defaultAccountList
    keyAccounts {
      id
      email
    }
    administrativeOrganizations(first: 25) {
      nodes {
        id
      }
    }
  }
}
    `;
export function useGetTopBarQuery(baseOptions?: Apollo.QueryHookOptions<GetTopBarQuery, GetTopBarQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTopBarQuery, GetTopBarQueryVariables>(GetTopBarDocument, options);
      }
export function useGetTopBarLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopBarQuery, GetTopBarQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTopBarQuery, GetTopBarQueryVariables>(GetTopBarDocument, options);
        }
export type GetTopBarQueryHookResult = ReturnType<typeof useGetTopBarQuery>;
export type GetTopBarLazyQueryHookResult = ReturnType<typeof useGetTopBarLazyQuery>;
export type GetTopBarQueryResult = Apollo.QueryResult<GetTopBarQuery, GetTopBarQueryVariables>;