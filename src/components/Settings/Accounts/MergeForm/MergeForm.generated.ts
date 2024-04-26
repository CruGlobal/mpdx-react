import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAccountListsForMergingQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetAccountListsForMergingQuery = { __typename?: 'Query' } & {
  accountLists: { __typename?: 'AccountListConnection' } & {
    nodes: Array<
      { __typename?: 'AccountList' } & Pick<
        Types.AccountList,
        'id' | 'name' | 'currency'
      >
    >;
  };
};

export type AccountListQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type AccountListQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'name'
  >;
};

export type MergeAccountListMutationVariables = Types.Exact<{
  input: Types.AccountListMergeMutationInput;
}>;

export type MergeAccountListMutation = { __typename?: 'Mutation' } & {
  mergeAccountList?: Types.Maybe<
    { __typename?: 'AccountListMergeMutationPayload' } & {
      accountList: { __typename?: 'AccountList' } & Pick<
        Types.AccountList,
        'id' | 'name'
      >;
    }
  >;
};

export const GetAccountListsForMergingDocument = gql`
  query GetAccountListsForMerging {
    accountLists(first: 50) {
      nodes {
        id
        name
        currency
      }
    }
  }
`;
export function useGetAccountListsForMergingQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAccountListsForMergingQuery,
    GetAccountListsForMergingQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAccountListsForMergingQuery,
    GetAccountListsForMergingQueryVariables
  >(GetAccountListsForMergingDocument, options);
}
export function useGetAccountListsForMergingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountListsForMergingQuery,
    GetAccountListsForMergingQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountListsForMergingQuery,
    GetAccountListsForMergingQueryVariables
  >(GetAccountListsForMergingDocument, options);
}
export type GetAccountListsForMergingQueryHookResult = ReturnType<
  typeof useGetAccountListsForMergingQuery
>;
export type GetAccountListsForMergingLazyQueryHookResult = ReturnType<
  typeof useGetAccountListsForMergingLazyQuery
>;
export type GetAccountListsForMergingQueryResult = Apollo.QueryResult<
  GetAccountListsForMergingQuery,
  GetAccountListsForMergingQueryVariables
>;
export const AccountListDocument = gql`
  query AccountList($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      name
    }
  }
`;
export function useAccountListQuery(
  baseOptions: Apollo.QueryHookOptions<
    AccountListQuery,
    AccountListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AccountListQuery, AccountListQueryVariables>(
    AccountListDocument,
    options,
  );
}
export function useAccountListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AccountListQuery,
    AccountListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AccountListQuery, AccountListQueryVariables>(
    AccountListDocument,
    options,
  );
}
export type AccountListQueryHookResult = ReturnType<typeof useAccountListQuery>;
export type AccountListLazyQueryHookResult = ReturnType<
  typeof useAccountListLazyQuery
>;
export type AccountListQueryResult = Apollo.QueryResult<
  AccountListQuery,
  AccountListQueryVariables
>;
export const MergeAccountListDocument = gql`
  mutation MergeAccountList($input: AccountListMergeMutationInput!) {
    mergeAccountList(input: $input) {
      accountList {
        id
        name
      }
    }
  }
`;
export type MergeAccountListMutationFn = Apollo.MutationFunction<
  MergeAccountListMutation,
  MergeAccountListMutationVariables
>;
export function useMergeAccountListMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MergeAccountListMutation,
    MergeAccountListMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MergeAccountListMutation,
    MergeAccountListMutationVariables
  >(MergeAccountListDocument, options);
}
export type MergeAccountListMutationHookResult = ReturnType<
  typeof useMergeAccountListMutation
>;
export type MergeAccountListMutationResult =
  Apollo.MutationResult<MergeAccountListMutation>;
export type MergeAccountListMutationOptions = Apollo.BaseMutationOptions<
  MergeAccountListMutation,
  MergeAccountListMutationVariables
>;
