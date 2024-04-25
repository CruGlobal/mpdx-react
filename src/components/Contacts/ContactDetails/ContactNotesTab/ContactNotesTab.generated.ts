import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetContactNotesQueryVariables = Types.Exact<{
  contactId: Types.Scalars['ID']['input'];
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetContactNotesQuery = (
  { __typename?: 'Query' }
  & { contact: (
    { __typename?: 'Contact' }
    & Pick<Types.Contact, 'id' | 'notes' | 'notesSavedAt'>
  ) }
);

export type UpdateContactNotesMutationVariables = Types.Exact<{
  contactId: Types.Scalars['ID']['input'];
  accountListId: Types.Scalars['ID']['input'];
  notes: Types.Scalars['String']['input'];
}>;


export type UpdateContactNotesMutation = (
  { __typename?: 'Mutation' }
  & { updateContact?: Types.Maybe<(
    { __typename?: 'ContactUpdateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'notesSavedAt'>
    ) }
  )> }
);


export const GetContactNotesDocument = gql`
    query GetContactNotes($contactId: ID!, $accountListId: ID!) {
  contact(id: $contactId, accountListId: $accountListId) {
    id
    notes
    notesSavedAt
  }
}
    `;
export function useGetContactNotesQuery(baseOptions: Apollo.QueryHookOptions<GetContactNotesQuery, GetContactNotesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContactNotesQuery, GetContactNotesQueryVariables>(GetContactNotesDocument, options);
      }
export function useGetContactNotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContactNotesQuery, GetContactNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContactNotesQuery, GetContactNotesQueryVariables>(GetContactNotesDocument, options);
        }
export type GetContactNotesQueryHookResult = ReturnType<typeof useGetContactNotesQuery>;
export type GetContactNotesLazyQueryHookResult = ReturnType<typeof useGetContactNotesLazyQuery>;
export type GetContactNotesQueryResult = Apollo.QueryResult<GetContactNotesQuery, GetContactNotesQueryVariables>;
export const UpdateContactNotesDocument = gql`
    mutation UpdateContactNotes($contactId: ID!, $accountListId: ID!, $notes: String!) {
  updateContact(
    input: {accountListId: $accountListId, attributes: {id: $contactId, notes: $notes}}
  ) {
    contact {
      id
      notesSavedAt
    }
  }
}
    `;
export type UpdateContactNotesMutationFn = Apollo.MutationFunction<UpdateContactNotesMutation, UpdateContactNotesMutationVariables>;
export function useUpdateContactNotesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateContactNotesMutation, UpdateContactNotesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateContactNotesMutation, UpdateContactNotesMutationVariables>(UpdateContactNotesDocument, options);
      }
export type UpdateContactNotesMutationHookResult = ReturnType<typeof useUpdateContactNotesMutation>;
export type UpdateContactNotesMutationResult = Apollo.MutationResult<UpdateContactNotesMutation>;
export type UpdateContactNotesMutationOptions = Apollo.BaseMutationOptions<UpdateContactNotesMutation, UpdateContactNotesMutationVariables>;