import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SetContactStarredMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
  starred: Types.Scalars['Boolean']['input'];
}>;


export type SetContactStarredMutation = (
  { __typename?: 'Mutation' }
  & { updateContact?: Types.Maybe<(
    { __typename?: 'ContactUpdateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'starred'>
    ) }
  )> }
);


export const SetContactStarredDocument = gql`
    mutation SetContactStarred($accountListId: ID!, $contactId: ID!, $starred: Boolean!) {
  updateContact(
    input: {accountListId: $accountListId, attributes: {id: $contactId, starred: $starred}}
  ) {
    contact {
      id
      starred
    }
  }
}
    `;
export type SetContactStarredMutationFn = Apollo.MutationFunction<SetContactStarredMutation, SetContactStarredMutationVariables>;
export function useSetContactStarredMutation(baseOptions?: Apollo.MutationHookOptions<SetContactStarredMutation, SetContactStarredMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetContactStarredMutation, SetContactStarredMutationVariables>(SetContactStarredDocument, options);
      }
export type SetContactStarredMutationHookResult = ReturnType<typeof useSetContactStarredMutation>;
export type SetContactStarredMutationResult = Apollo.MutationResult<SetContactStarredMutation>;
export type SetContactStarredMutationOptions = Apollo.BaseMutationOptions<SetContactStarredMutation, SetContactStarredMutationVariables>;