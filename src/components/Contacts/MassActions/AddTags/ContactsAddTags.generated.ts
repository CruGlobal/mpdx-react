import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactsAddTagsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Array<Types.ContactUpdateInput> | Types.ContactUpdateInput;
}>;

export type ContactsAddTagsMutation = { __typename?: 'Mutation' } & {
  updateContacts?: Types.Maybe<
    { __typename?: 'ContactsUpdateMutationPayload' } & {
      contacts: Array<{ __typename?: 'Contact' } & Pick<Types.Contact, 'id'>>;
    }
  >;
};

export type GetContactsForAddingTagsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactIds:
    | Array<Types.Scalars['ID']['input']>
    | Types.Scalars['ID']['input'];
  numContactIds: Types.Scalars['Int']['input'];
}>;

export type GetContactsForAddingTagsQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'tagList'>
    >;
  };
};

export const ContactsAddTagsDocument = gql`
  mutation ContactsAddTags(
    $accountListId: ID!
    $attributes: [ContactUpdateInput!]!
  ) {
    updateContacts(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      contacts {
        id
      }
    }
  }
`;
export type ContactsAddTagsMutationFn = Apollo.MutationFunction<
  ContactsAddTagsMutation,
  ContactsAddTagsMutationVariables
>;
export function useContactsAddTagsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ContactsAddTagsMutation,
    ContactsAddTagsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ContactsAddTagsMutation,
    ContactsAddTagsMutationVariables
  >(ContactsAddTagsDocument, options);
}
export type ContactsAddTagsMutationHookResult = ReturnType<
  typeof useContactsAddTagsMutation
>;
export type ContactsAddTagsMutationResult =
  Apollo.MutationResult<ContactsAddTagsMutation>;
export type ContactsAddTagsMutationOptions = Apollo.BaseMutationOptions<
  ContactsAddTagsMutation,
  ContactsAddTagsMutationVariables
>;
export const GetContactsForAddingTagsDocument = gql`
  query GetContactsForAddingTags(
    $accountListId: ID!
    $contactIds: [ID!]!
    $numContactIds: Int!
  ) {
    contacts(
      accountListId: $accountListId
      contactsFilter: { ids: $contactIds }
      first: $numContactIds
    ) {
      nodes {
        id
        tagList
      }
    }
  }
`;
export function useGetContactsForAddingTagsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContactsForAddingTagsQuery,
    GetContactsForAddingTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetContactsForAddingTagsQuery,
    GetContactsForAddingTagsQueryVariables
  >(GetContactsForAddingTagsDocument, options);
}
export function useGetContactsForAddingTagsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContactsForAddingTagsQuery,
    GetContactsForAddingTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetContactsForAddingTagsQuery,
    GetContactsForAddingTagsQueryVariables
  >(GetContactsForAddingTagsDocument, options);
}
export type GetContactsForAddingTagsQueryHookResult = ReturnType<
  typeof useGetContactsForAddingTagsQuery
>;
export type GetContactsForAddingTagsLazyQueryHookResult = ReturnType<
  typeof useGetContactsForAddingTagsLazyQuery
>;
export type GetContactsForAddingTagsQueryResult = Apollo.QueryResult<
  GetContactsForAddingTagsQuery,
  GetContactsForAddingTagsQueryVariables
>;
