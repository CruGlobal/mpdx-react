import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateUserDefaultAccountMutationVariables = Types.Exact<{
  input: Types.UserUpdateMutationInput;
}>;

export type UpdateUserDefaultAccountMutation = { __typename?: 'Mutation' } & {
  updateUser?: Types.Maybe<
    { __typename?: 'UserUpdateMutationPayload' } & {
      user: { __typename?: 'User' } & Pick<
        Types.User,
        'id' | 'defaultAccountList'
      >;
    }
  >;
};

export const UpdateUserDefaultAccountDocument = gql`
  mutation UpdateUserDefaultAccount($input: UserUpdateMutationInput!) {
    updateUser(input: $input) {
      user {
        id
        defaultAccountList
      }
    }
  }
`;
export type UpdateUserDefaultAccountMutationFn = Apollo.MutationFunction<
  UpdateUserDefaultAccountMutation,
  UpdateUserDefaultAccountMutationVariables
>;
export function useUpdateUserDefaultAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserDefaultAccountMutation,
    UpdateUserDefaultAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserDefaultAccountMutation,
    UpdateUserDefaultAccountMutationVariables
  >(UpdateUserDefaultAccountDocument, options);
}
export type UpdateUserDefaultAccountMutationHookResult = ReturnType<
  typeof useUpdateUserDefaultAccountMutation
>;
export type UpdateUserDefaultAccountMutationResult =
  Apollo.MutationResult<UpdateUserDefaultAccountMutation>;
export type UpdateUserDefaultAccountMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserDefaultAccountMutation,
    UpdateUserDefaultAccountMutationVariables
  >;
