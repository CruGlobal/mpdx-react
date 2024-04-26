import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactOptionsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactsFilters?: Types.InputMaybe<Types.ContactFilterSetInput>;
  first: Types.Scalars['Int']['input'];
}>;

export type ContactOptionsQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'name'>
    >;
  };
};

export const ContactOptionsDocument = gql`
  query ContactOptions(
    $accountListId: ID!
    $contactsFilters: ContactFilterSetInput
    $first: Int!
  ) {
    contacts(
      accountListId: $accountListId
      contactsFilter: $contactsFilters
      first: $first
    ) {
      nodes {
        id
        name
      }
    }
  }
`;
export function useContactOptionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    ContactOptionsQuery,
    ContactOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ContactOptionsQuery, ContactOptionsQueryVariables>(
    ContactOptionsDocument,
    options,
  );
}
export function useContactOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactOptionsQuery,
    ContactOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ContactOptionsQuery, ContactOptionsQueryVariables>(
    ContactOptionsDocument,
    options,
  );
}
export type ContactOptionsQueryHookResult = ReturnType<
  typeof useContactOptionsQuery
>;
export type ContactOptionsLazyQueryHookResult = ReturnType<
  typeof useContactOptionsLazyQuery
>;
export type ContactOptionsQueryResult = Apollo.QueryResult<
  ContactOptionsQuery,
  ContactOptionsQueryVariables
>;
