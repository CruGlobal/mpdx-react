import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateContactNewsletterMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;


export type UpdateContactNewsletterMutation = (
  { __typename?: 'Mutation' }
  & { updateContact?: Types.Maybe<(
    { __typename?: 'ContactUpdateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'sendNewsletter'>
    ) }
  )> }
);


export const UpdateContactNewsletterDocument = gql`
    mutation UpdateContactNewsletter($accountListId: ID!, $attributes: ContactUpdateInput!) {
  updateContact(input: {accountListId: $accountListId, attributes: $attributes}) {
    contact {
      id
      sendNewsletter
    }
  }
}
    `;
export type UpdateContactNewsletterMutationFn = Apollo.MutationFunction<UpdateContactNewsletterMutation, UpdateContactNewsletterMutationVariables>;
export function useUpdateContactNewsletterMutation(baseOptions?: Apollo.MutationHookOptions<UpdateContactNewsletterMutation, UpdateContactNewsletterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateContactNewsletterMutation, UpdateContactNewsletterMutationVariables>(UpdateContactNewsletterDocument, options);
      }
export type UpdateContactNewsletterMutationHookResult = ReturnType<typeof useUpdateContactNewsletterMutation>;
export type UpdateContactNewsletterMutationResult = Apollo.MutationResult<UpdateContactNewsletterMutation>;
export type UpdateContactNewsletterMutationOptions = Apollo.BaseMutationOptions<UpdateContactNewsletterMutation, UpdateContactNewsletterMutationVariables>;