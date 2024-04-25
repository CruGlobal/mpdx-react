import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SetActiveDesignationAccountMutationVariables = Types.Exact<{
  input: Types.SetActiveDesignationAccountInput;
}>;


export type SetActiveDesignationAccountMutation = (
  { __typename?: 'Mutation' }
  & { setActiveDesignationAccount: (
    { __typename?: 'DesignationAccountRest' }
    & Pick<Types.DesignationAccountRest, 'active' | 'id'>
  ) }
);


export const SetActiveDesignationAccountDocument = gql`
    mutation SetActiveDesignationAccount($input: SetActiveDesignationAccountInput!) {
  setActiveDesignationAccount(input: $input) {
    active
    id
  }
}
    `;
export type SetActiveDesignationAccountMutationFn = Apollo.MutationFunction<SetActiveDesignationAccountMutation, SetActiveDesignationAccountMutationVariables>;
export function useSetActiveDesignationAccountMutation(baseOptions?: Apollo.MutationHookOptions<SetActiveDesignationAccountMutation, SetActiveDesignationAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetActiveDesignationAccountMutation, SetActiveDesignationAccountMutationVariables>(SetActiveDesignationAccountDocument, options);
      }
export type SetActiveDesignationAccountMutationHookResult = ReturnType<typeof useSetActiveDesignationAccountMutation>;
export type SetActiveDesignationAccountMutationResult = Apollo.MutationResult<SetActiveDesignationAccountMutation>;
export type SetActiveDesignationAccountMutationOptions = Apollo.BaseMutationOptions<SetActiveDesignationAccountMutation, SetActiveDesignationAccountMutationVariables>;