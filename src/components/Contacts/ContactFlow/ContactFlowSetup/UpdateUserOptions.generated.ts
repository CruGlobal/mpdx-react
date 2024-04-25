import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateUserOptionsMutationVariables = Types.Exact<{
  key: Types.Scalars['String']['input'];
  value: Types.Scalars['String']['input'];
}>;


export type UpdateUserOptionsMutation = (
  { __typename?: 'Mutation' }
  & { createOrUpdateUserOption?: Types.Maybe<(
    { __typename?: 'CreateOrUpdateOptionMutationPayload' }
    & { option: (
      { __typename?: 'Option' }
      & Pick<Types.Option, 'id'>
    ) }
  )> }
);


export const UpdateUserOptionsDocument = gql`
    mutation UpdateUserOptions($key: String!, $value: String!) {
  createOrUpdateUserOption(input: {key: $key, value: $value}) {
    option {
      id
    }
  }
}
    `;
export type UpdateUserOptionsMutationFn = Apollo.MutationFunction<UpdateUserOptionsMutation, UpdateUserOptionsMutationVariables>;
export function useUpdateUserOptionsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserOptionsMutation, UpdateUserOptionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserOptionsMutation, UpdateUserOptionsMutationVariables>(UpdateUserOptionsDocument, options);
      }
export type UpdateUserOptionsMutationHookResult = ReturnType<typeof useUpdateUserOptionsMutation>;
export type UpdateUserOptionsMutationResult = Apollo.MutationResult<UpdateUserOptionsMutation>;
export type UpdateUserOptionsMutationOptions = Apollo.BaseMutationOptions<UpdateUserOptionsMutation, UpdateUserOptionsMutationVariables>;