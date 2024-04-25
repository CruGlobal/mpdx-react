import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteDonorAccountMutationVariables = Types.Exact<{
  contactId: Types.Scalars['ID']['input'];
  donorAccountId: Types.Scalars['ID']['input'];
}>;


export type DeleteDonorAccountMutation = (
  { __typename?: 'Mutation' }
  & { destroyDonorAccount?: Types.Maybe<(
    { __typename?: 'ContactDestroyDonorAccountPayload' }
    & Pick<Types.ContactDestroyDonorAccountPayload, 'id'>
  )> }
);


export const DeleteDonorAccountDocument = gql`
    mutation DeleteDonorAccount($contactId: ID!, $donorAccountId: ID!) {
  destroyDonorAccount(
    input: {contactId: $contactId, donorAccountId: $donorAccountId}
  ) {
    id
  }
}
    `;
export type DeleteDonorAccountMutationFn = Apollo.MutationFunction<DeleteDonorAccountMutation, DeleteDonorAccountMutationVariables>;
export function useDeleteDonorAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDonorAccountMutation, DeleteDonorAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDonorAccountMutation, DeleteDonorAccountMutationVariables>(DeleteDonorAccountDocument, options);
      }
export type DeleteDonorAccountMutationHookResult = ReturnType<typeof useDeleteDonorAccountMutation>;
export type DeleteDonorAccountMutationResult = Apollo.MutationResult<DeleteDonorAccountMutation>;
export type DeleteDonorAccountMutationOptions = Apollo.BaseMutationOptions<DeleteDonorAccountMutation, DeleteDonorAccountMutationVariables>;