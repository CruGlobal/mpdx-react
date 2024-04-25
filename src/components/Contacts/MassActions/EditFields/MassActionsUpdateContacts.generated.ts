import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MassActionsUpdateContactFieldsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Array<Types.ContactUpdateInput> | Types.ContactUpdateInput;
}>;


export type MassActionsUpdateContactFieldsMutation = (
  { __typename?: 'Mutation' }
  & { updateContacts?: Types.Maybe<(
    { __typename?: 'ContactsUpdateMutationPayload' }
    & { contacts: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
    )> }
  )> }
);


export const MassActionsUpdateContactFieldsDocument = gql`
    mutation MassActionsUpdateContactFields($accountListId: ID!, $attributes: [ContactUpdateInput!]!) {
  updateContacts(input: {accountListId: $accountListId, attributes: $attributes}) {
    contacts {
      id
    }
  }
}
    `;
export type MassActionsUpdateContactFieldsMutationFn = Apollo.MutationFunction<MassActionsUpdateContactFieldsMutation, MassActionsUpdateContactFieldsMutationVariables>;
export function useMassActionsUpdateContactFieldsMutation(baseOptions?: Apollo.MutationHookOptions<MassActionsUpdateContactFieldsMutation, MassActionsUpdateContactFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MassActionsUpdateContactFieldsMutation, MassActionsUpdateContactFieldsMutationVariables>(MassActionsUpdateContactFieldsDocument, options);
      }
export type MassActionsUpdateContactFieldsMutationHookResult = ReturnType<typeof useMassActionsUpdateContactFieldsMutation>;
export type MassActionsUpdateContactFieldsMutationResult = Apollo.MutationResult<MassActionsUpdateContactFieldsMutation>;
export type MassActionsUpdateContactFieldsMutationOptions = Apollo.BaseMutationOptions<MassActionsUpdateContactFieldsMutation, MassActionsUpdateContactFieldsMutationVariables>;