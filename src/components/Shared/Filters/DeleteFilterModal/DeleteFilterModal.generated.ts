import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteUserOptionMutationVariables = Types.Exact<{
  input: Types.UserOptionDeleteMutationInput;
}>;


export type DeleteUserOptionMutation = (
  { __typename?: 'Mutation' }
  & { deleteUserOption?: Types.Maybe<(
    { __typename?: 'UserOptionDeleteMutationPayload' }
    & Pick<Types.UserOptionDeleteMutationPayload, 'id'>
  )> }
);


export const DeleteUserOptionDocument = gql`
    mutation DeleteUserOption($input: UserOptionDeleteMutationInput!) {
  deleteUserOption(input: $input) {
    id
  }
}
    `;
export type DeleteUserOptionMutationFn = Apollo.MutationFunction<DeleteUserOptionMutation, DeleteUserOptionMutationVariables>;
export function useDeleteUserOptionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserOptionMutation, DeleteUserOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserOptionMutation, DeleteUserOptionMutationVariables>(DeleteUserOptionDocument, options);
      }
export type DeleteUserOptionMutationHookResult = ReturnType<typeof useDeleteUserOptionMutation>;
export type DeleteUserOptionMutationResult = Apollo.MutationResult<DeleteUserOptionMutation>;
export type DeleteUserOptionMutationOptions = Apollo.BaseMutationOptions<DeleteUserOptionMutation, DeleteUserOptionMutationVariables>;