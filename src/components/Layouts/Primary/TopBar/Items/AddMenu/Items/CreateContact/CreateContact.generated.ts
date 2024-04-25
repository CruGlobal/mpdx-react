import * as Types from '../../../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateContactMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactCreateInput;
}>;


export type CreateContactMutation = (
  { __typename?: 'Mutation' }
  & { createContact?: Types.Maybe<(
    { __typename?: 'ContactCreateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
    ) }
  )> }
);


export const CreateContactDocument = gql`
    mutation CreateContact($accountListId: ID!, $attributes: ContactCreateInput!) {
  createContact(input: {accountListId: $accountListId, attributes: $attributes}) {
    contact {
      id
    }
  }
}
    `;
export type CreateContactMutationFn = Apollo.MutationFunction<CreateContactMutation, CreateContactMutationVariables>;
export function useCreateContactMutation(baseOptions?: Apollo.MutationHookOptions<CreateContactMutation, CreateContactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateContactMutation, CreateContactMutationVariables>(CreateContactDocument, options);
      }
export type CreateContactMutationHookResult = ReturnType<typeof useCreateContactMutation>;
export type CreateContactMutationResult = Apollo.MutationResult<CreateContactMutation>;
export type CreateContactMutationOptions = Apollo.BaseMutationOptions<CreateContactMutation, CreateContactMutationVariables>;