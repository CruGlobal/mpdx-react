import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateInvalidStatusMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;


export type UpdateInvalidStatusMutation = (
  { __typename?: 'Mutation' }
  & { updateContact?: Types.Maybe<(
    { __typename?: 'ContactUpdateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
    ) }
  )> }
);


export const UpdateInvalidStatusDocument = gql`
    mutation UpdateInvalidStatus($accountListId: ID!, $attributes: ContactUpdateInput!) {
  updateContact(input: {accountListId: $accountListId, attributes: $attributes}) {
    contact {
      id
    }
  }
}
    `;
export type UpdateInvalidStatusMutationFn = Apollo.MutationFunction<UpdateInvalidStatusMutation, UpdateInvalidStatusMutationVariables>;
export function useUpdateInvalidStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateInvalidStatusMutation, UpdateInvalidStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateInvalidStatusMutation, UpdateInvalidStatusMutationVariables>(UpdateInvalidStatusDocument, options);
      }
export type UpdateInvalidStatusMutationHookResult = ReturnType<typeof useUpdateInvalidStatusMutation>;
export type UpdateInvalidStatusMutationResult = Apollo.MutationResult<UpdateInvalidStatusMutation>;
export type UpdateInvalidStatusMutationOptions = Apollo.BaseMutationOptions<UpdateInvalidStatusMutation, UpdateInvalidStatusMutationVariables>;