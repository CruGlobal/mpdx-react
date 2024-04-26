import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAccountListCoachesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetAccountListCoachesQuery = { __typename?: 'Query' } & {
  accountListCoaches: { __typename?: 'UserScopedToAccountListConnection' } & {
    nodes: Array<
      { __typename?: 'UserScopedToAccountList' } & Pick<
        Types.UserScopedToAccountList,
        'firstName' | 'lastName' | 'id'
      >
    >;
  };
};

export type DeleteAccountListCoachMutationVariables = Types.Exact<{
  input: Types.AccountListCoachDeleteMutationInput;
}>;

export type DeleteAccountListCoachMutation = { __typename?: 'Mutation' } & {
  deleteAccountListCoach?: Types.Maybe<
    { __typename?: 'AccountListCoachDeleteMutationPayload' } & Pick<
      Types.AccountListCoachDeleteMutationPayload,
      'id'
    >
  >;
};

export const GetAccountListCoachesDocument = gql`
  query GetAccountListCoaches($accountListId: ID!) {
    accountListCoaches(accountListId: $accountListId, first: 50) {
      nodes {
        firstName
        lastName
        id
      }
    }
  }
`;
export function useGetAccountListCoachesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAccountListCoachesQuery,
    GetAccountListCoachesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAccountListCoachesQuery,
    GetAccountListCoachesQueryVariables
  >(GetAccountListCoachesDocument, options);
}
export function useGetAccountListCoachesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountListCoachesQuery,
    GetAccountListCoachesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountListCoachesQuery,
    GetAccountListCoachesQueryVariables
  >(GetAccountListCoachesDocument, options);
}
export type GetAccountListCoachesQueryHookResult = ReturnType<
  typeof useGetAccountListCoachesQuery
>;
export type GetAccountListCoachesLazyQueryHookResult = ReturnType<
  typeof useGetAccountListCoachesLazyQuery
>;
export type GetAccountListCoachesQueryResult = Apollo.QueryResult<
  GetAccountListCoachesQuery,
  GetAccountListCoachesQueryVariables
>;
export const DeleteAccountListCoachDocument = gql`
  mutation DeleteAccountListCoach(
    $input: AccountListCoachDeleteMutationInput!
  ) {
    deleteAccountListCoach(input: $input) {
      id
    }
  }
`;
export type DeleteAccountListCoachMutationFn = Apollo.MutationFunction<
  DeleteAccountListCoachMutation,
  DeleteAccountListCoachMutationVariables
>;
export function useDeleteAccountListCoachMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAccountListCoachMutation,
    DeleteAccountListCoachMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteAccountListCoachMutation,
    DeleteAccountListCoachMutationVariables
  >(DeleteAccountListCoachDocument, options);
}
export type DeleteAccountListCoachMutationHookResult = ReturnType<
  typeof useDeleteAccountListCoachMutation
>;
export type DeleteAccountListCoachMutationResult =
  Apollo.MutationResult<DeleteAccountListCoachMutation>;
export type DeleteAccountListCoachMutationOptions = Apollo.BaseMutationOptions<
  DeleteAccountListCoachMutation,
  DeleteAccountListCoachMutationVariables
>;
