import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAccountsSharingWithQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetAccountsSharingWithQuery = (
  { __typename?: 'Query' }
  & { accountListUsers: (
    { __typename?: 'AccountListUserConnection' }
    & { nodes: Array<(
      { __typename?: 'AccountListUser' }
      & Pick<Types.AccountListUser, 'id'>
      & { user: (
        { __typename?: 'UserScopedToAccountList' }
        & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'>
      ) }
    )> }
  ) }
);

export type DeleteAccountListUserMutationVariables = Types.Exact<{
  input: Types.AccountListUserDeleteMutationInput;
}>;


export type DeleteAccountListUserMutation = (
  { __typename?: 'Mutation' }
  & { deleteAccountListUser?: Types.Maybe<(
    { __typename?: 'AccountListUserDeleteMutationPayload' }
    & Pick<Types.AccountListUserDeleteMutationPayload, 'id'>
  )> }
);


export const GetAccountsSharingWithDocument = gql`
    query GetAccountsSharingWith($accountListId: ID!) {
  accountListUsers(accountListId: $accountListId, first: 50) {
    nodes {
      user {
        id
        firstName
        lastName
      }
      id
    }
  }
}
    `;
export function useGetAccountsSharingWithQuery(baseOptions: Apollo.QueryHookOptions<GetAccountsSharingWithQuery, GetAccountsSharingWithQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAccountsSharingWithQuery, GetAccountsSharingWithQueryVariables>(GetAccountsSharingWithDocument, options);
      }
export function useGetAccountsSharingWithLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAccountsSharingWithQuery, GetAccountsSharingWithQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAccountsSharingWithQuery, GetAccountsSharingWithQueryVariables>(GetAccountsSharingWithDocument, options);
        }
export type GetAccountsSharingWithQueryHookResult = ReturnType<typeof useGetAccountsSharingWithQuery>;
export type GetAccountsSharingWithLazyQueryHookResult = ReturnType<typeof useGetAccountsSharingWithLazyQuery>;
export type GetAccountsSharingWithQueryResult = Apollo.QueryResult<GetAccountsSharingWithQuery, GetAccountsSharingWithQueryVariables>;
export const DeleteAccountListUserDocument = gql`
    mutation DeleteAccountListUser($input: AccountListUserDeleteMutationInput!) {
  deleteAccountListUser(input: $input) {
    id
  }
}
    `;
export type DeleteAccountListUserMutationFn = Apollo.MutationFunction<DeleteAccountListUserMutation, DeleteAccountListUserMutationVariables>;
export function useDeleteAccountListUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAccountListUserMutation, DeleteAccountListUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAccountListUserMutation, DeleteAccountListUserMutationVariables>(DeleteAccountListUserDocument, options);
      }
export type DeleteAccountListUserMutationHookResult = ReturnType<typeof useDeleteAccountListUserMutation>;
export type DeleteAccountListUserMutationResult = Apollo.MutationResult<DeleteAccountListUserMutation>;
export type DeleteAccountListUserMutationOptions = Apollo.BaseMutationOptions<DeleteAccountListUserMutation, DeleteAccountListUserMutationVariables>;