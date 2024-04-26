import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateAccountListInviteMutationVariables = Types.Exact<{
  input: Types.CreateAccountListInviteInput;
}>;

export type CreateAccountListInviteMutation = { __typename?: 'Mutation' } & {
  createAccountListInvite?: Types.Maybe<
    { __typename?: 'CreateAccountListInvitePayload' } & {
      accountListInvite: { __typename?: 'AccountListInvite' } & Pick<
        Types.AccountListInvite,
        'id' | 'accountListId' | 'inviteUserAs' | 'recipientEmail'
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

export const CreateAccountListInviteDocument = gql`
  mutation CreateAccountListInvite($input: CreateAccountListInviteInput!) {
    createAccountListInvite(input: $input) {
      accountListInvite {
        id
        accountListId
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
        recipientEmail
      }
    }
  }
`;
export type CreateAccountListInviteMutationFn = Apollo.MutationFunction<
  CreateAccountListInviteMutation,
  CreateAccountListInviteMutationVariables
>;
export function useCreateAccountListInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateAccountListInviteMutation,
    CreateAccountListInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateAccountListInviteMutation,
    CreateAccountListInviteMutationVariables
  >(CreateAccountListInviteDocument, options);
}
export type CreateAccountListInviteMutationHookResult = ReturnType<
  typeof useCreateAccountListInviteMutation
>;
export type CreateAccountListInviteMutationResult =
  Apollo.MutationResult<CreateAccountListInviteMutation>;
export type CreateAccountListInviteMutationOptions = Apollo.BaseMutationOptions<
  CreateAccountListInviteMutation,
  CreateAccountListInviteMutationVariables
>;
