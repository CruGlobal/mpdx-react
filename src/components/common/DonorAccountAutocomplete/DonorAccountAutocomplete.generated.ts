import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDonorAccountsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  searchTerm: Types.Scalars['String']['input'];
}>;

export type GetDonorAccountsQuery = { __typename?: 'Query' } & {
  accountListDonorAccounts?: Types.Maybe<
    Array<
      { __typename?: 'AccountListDonorAccount' } & Pick<
        Types.AccountListDonorAccount,
        'id'
      > & { name: Types.AccountListDonorAccount['displayName'] }
    >
  >;
};

export const GetDonorAccountsDocument = gql`
  query GetDonorAccounts($accountListId: ID!, $searchTerm: String!) {
    accountListDonorAccounts(
      accountListId: $accountListId
      searchTerm: $searchTerm
    ) {
      id
      name: displayName
    }
  }
`;
export function useGetDonorAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDonorAccountsQuery,
    GetDonorAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetDonorAccountsQuery, GetDonorAccountsQueryVariables>(
    GetDonorAccountsDocument,
    options,
  );
}
export function useGetDonorAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDonorAccountsQuery,
    GetDonorAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDonorAccountsQuery,
    GetDonorAccountsQueryVariables
  >(GetDonorAccountsDocument, options);
}
export type GetDonorAccountsQueryHookResult = ReturnType<
  typeof useGetDonorAccountsQuery
>;
export type GetDonorAccountsLazyQueryHookResult = ReturnType<
  typeof useGetDonorAccountsLazyQuery
>;
export type GetDonorAccountsQueryResult = Apollo.QueryResult<
  GetDonorAccountsQuery,
  GetDonorAccountsQueryVariables
>;
