import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { UserOptionFragmentDoc } from '../FilterPanel.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SaveFilterMutationVariables = Types.Exact<{
  input: Types.CreateOrUpdateOptionMutationInput;
}>;


export type SaveFilterMutation = (
  { __typename?: 'Mutation' }
  & { createOrUpdateUserOption?: Types.Maybe<(
    { __typename?: 'CreateOrUpdateOptionMutationPayload' }
    & { option: (
      { __typename?: 'Option' }
      & Pick<Types.Option, 'id' | 'key' | 'value'>
    ) }
  )> }
);


export const SaveFilterDocument = gql`
    mutation SaveFilter($input: CreateOrUpdateOptionMutationInput!) {
  createOrUpdateUserOption(input: $input) {
    option {
      ...UserOption
    }
  }
}
    ${UserOptionFragmentDoc}`;
export type SaveFilterMutationFn = Apollo.MutationFunction<SaveFilterMutation, SaveFilterMutationVariables>;
export function useSaveFilterMutation(baseOptions?: Apollo.MutationHookOptions<SaveFilterMutation, SaveFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveFilterMutation, SaveFilterMutationVariables>(SaveFilterDocument, options);
      }
export type SaveFilterMutationHookResult = ReturnType<typeof useSaveFilterMutation>;
export type SaveFilterMutationResult = Apollo.MutationResult<SaveFilterMutation>;
export type SaveFilterMutationOptions = Apollo.BaseMutationOptions<SaveFilterMutation, SaveFilterMutationVariables>;