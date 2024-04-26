import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUserIdQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetUserIdQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<Types.User, 'id'>;
};

export type SharedAccountUserFragment = {
  __typename?: 'UserScopedToAccountList';
} & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'>;

export type GetAccountListInvitesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  inviteType: Types.InviteTypeEnum;
}>;

export type GetAccountListInvitesQuery = { __typename?: 'Query' } & {
  accountListInvites: { __typename?: 'AccountListInviteConnection' } & {
    nodes: Array<
      { __typename?: 'AccountListInvite' } & Pick<
        Types.AccountListInvite,
        'id' | 'accountListId' | 'inviteUserAs' | 'recipientEmail'
      > & {
          cancelledByUser?: Types.Maybe<
            { __typename?: 'UserScopedToAccountList' } & Pick<
              Types.UserScopedToAccountList,
              'firstName' | 'lastName' | 'id'
            >
          >;
          invitedByUser: { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'firstName' | 'lastName' | 'id'
          >;
        }
    >;
  };
};

export type CancelAccountListInviteMutationVariables = Types.Exact<{
  input: Types.CancelAccountListInviteInput;
}>;

export type CancelAccountListInviteMutation = { __typename?: 'Mutation' } & {
  cancelAccountListInvite?: Types.Maybe<
    { __typename?: 'CancelAccountListInvitePayload' } & {
      accountListInvite: { __typename?: 'AccountListInvite' } & Pick<
        Types.AccountListInvite,
        'accountListId' | 'id' | 'recipientEmail' | 'inviteUserAs'
      > & {
          cancelledByUser?: Types.Maybe<
            { __typename?: 'UserScopedToAccountList' } & Pick<
              Types.UserScopedToAccountList,
              'firstName' | 'id' | 'lastName'
            >
          >;
          invitedByUser: { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'firstName' | 'id' | 'lastName'
          >;
        };
    }
  >;
};

export const SharedAccountUserFragmentDoc = gql`
  fragment SharedAccountUser on UserScopedToAccountList {
    id
    firstName
    lastName
  }
`;
export const GetUserIdDocument = gql`
  query GetUserId {
    user {
      id
    }
  }
`;
export function useGetUserIdQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserIdQuery,
    GetUserIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserIdQuery, GetUserIdQueryVariables>(
    GetUserIdDocument,
    options,
  );
}
export function useGetUserIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserIdQuery,
    GetUserIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserIdQuery, GetUserIdQueryVariables>(
    GetUserIdDocument,
    options,
  );
}
export type GetUserIdQueryHookResult = ReturnType<typeof useGetUserIdQuery>;
export type GetUserIdLazyQueryHookResult = ReturnType<
  typeof useGetUserIdLazyQuery
>;
export type GetUserIdQueryResult = Apollo.QueryResult<
  GetUserIdQuery,
  GetUserIdQueryVariables
>;
export const GetAccountListInvitesDocument = gql`
  query GetAccountListInvites(
    $accountListId: ID!
    $inviteType: InviteTypeEnum!
  ) {
    accountListInvites(
      accountListId: $accountListId
      inviteType: $inviteType
      first: 50
    ) {
      nodes {
        id
        accountListId
        cancelledByUser {
          firstName
          lastName
          id
        }
        inviteUserAs
        invitedByUser {
          firstName
          lastName
          id
        }
        recipientEmail
      }
    }
  }
`;
export function useGetAccountListInvitesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAccountListInvitesQuery,
    GetAccountListInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAccountListInvitesQuery,
    GetAccountListInvitesQueryVariables
  >(GetAccountListInvitesDocument, options);
}
export function useGetAccountListInvitesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountListInvitesQuery,
    GetAccountListInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountListInvitesQuery,
    GetAccountListInvitesQueryVariables
  >(GetAccountListInvitesDocument, options);
}
export type GetAccountListInvitesQueryHookResult = ReturnType<
  typeof useGetAccountListInvitesQuery
>;
export type GetAccountListInvitesLazyQueryHookResult = ReturnType<
  typeof useGetAccountListInvitesLazyQuery
>;
export type GetAccountListInvitesQueryResult = Apollo.QueryResult<
  GetAccountListInvitesQuery,
  GetAccountListInvitesQueryVariables
>;
export const CancelAccountListInviteDocument = gql`
  mutation CancelAccountListInvite($input: CancelAccountListInviteInput!) {
    cancelAccountListInvite(input: $input) {
      accountListInvite {
        accountListId
        id
        recipientEmail
        cancelledByUser {
          firstName
          id
          lastName
        }
        inviteUserAs
        invitedByUser {
          firstName
          id
          lastName
        }
      }
    }
  }
`;
export type CancelAccountListInviteMutationFn = Apollo.MutationFunction<
  CancelAccountListInviteMutation,
  CancelAccountListInviteMutationVariables
>;
export function useCancelAccountListInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CancelAccountListInviteMutation,
    CancelAccountListInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CancelAccountListInviteMutation,
    CancelAccountListInviteMutationVariables
  >(CancelAccountListInviteDocument, options);
}
export type CancelAccountListInviteMutationHookResult = ReturnType<
  typeof useCancelAccountListInviteMutation
>;
export type CancelAccountListInviteMutationResult =
  Apollo.MutationResult<CancelAccountListInviteMutation>;
export type CancelAccountListInviteMutationOptions = Apollo.BaseMutationOptions<
  CancelAccountListInviteMutation,
  CancelAccountListInviteMutationVariables
>;
