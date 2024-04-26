import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SetActiveFinancialAccountMutationVariables = Types.Exact<{
  input: Types.SetActiveFinancialAccountInput;
}>;

export type SetActiveFinancialAccountMutation = { __typename?: 'Mutation' } & {
  setActiveFinancialAccount: {
    __typename?: 'SetActiveFinancialAccountRest';
  } & Pick<Types.SetActiveFinancialAccountRest, 'active' | 'id'>;
};

export const SetActiveFinancialAccountDocument = gql`
  mutation SetActiveFinancialAccount($input: SetActiveFinancialAccountInput!) {
    setActiveFinancialAccount(input: $input) {
      active
      id
    }
  }
`;
export type SetActiveFinancialAccountMutationFn = Apollo.MutationFunction<
  SetActiveFinancialAccountMutation,
  SetActiveFinancialAccountMutationVariables
>;
export function useSetActiveFinancialAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetActiveFinancialAccountMutation,
    SetActiveFinancialAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetActiveFinancialAccountMutation,
    SetActiveFinancialAccountMutationVariables
  >(SetActiveFinancialAccountDocument, options);
}
export type SetActiveFinancialAccountMutationHookResult = ReturnType<
  typeof useSetActiveFinancialAccountMutation
>;
export type SetActiveFinancialAccountMutationResult =
  Apollo.MutationResult<SetActiveFinancialAccountMutation>;
export type SetActiveFinancialAccountMutationOptions =
  Apollo.BaseMutationOptions<
    SetActiveFinancialAccountMutation,
    SetActiveFinancialAccountMutationVariables
  >;
