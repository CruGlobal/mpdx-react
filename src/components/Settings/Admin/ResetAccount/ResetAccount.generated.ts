import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ResetAccountListMutationVariables = Types.Exact<{
  input: Types.AccountListResetMutationInput;
}>;

export type ResetAccountListMutation = { __typename?: 'Mutation' } & {
  resetAccountList?: Types.Maybe<
    { __typename?: 'AccountListResetMutationPayload' } & {
      accountList: { __typename?: 'AccountList' } & Pick<
        Types.AccountList,
        'id' | 'name'
      >;
    }
  >;
};

export const ResetAccountListDocument = gql`
  mutation ResetAccountList($input: AccountListResetMutationInput!) {
    resetAccountList(input: $input) {
      accountList {
        id
        name
      }
    }
  }
`;
export type ResetAccountListMutationFn = Apollo.MutationFunction<
  ResetAccountListMutation,
  ResetAccountListMutationVariables
>;
export function useResetAccountListMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResetAccountListMutation,
    ResetAccountListMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResetAccountListMutation,
    ResetAccountListMutationVariables
  >(ResetAccountListDocument, options);
}
export type ResetAccountListMutationHookResult = ReturnType<
  typeof useResetAccountListMutation
>;
export type ResetAccountListMutationResult =
  Apollo.MutationResult<ResetAccountListMutation>;
export type ResetAccountListMutationOptions = Apollo.BaseMutationOptions<
  ResetAccountListMutation,
  ResetAccountListMutationVariables
>;
